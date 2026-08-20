import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { createGenerationJob, createSamplerOutput, createStudioAsset, listGenerationJobs, listSamplerOutputs, listStudioAssets, updateGenerationJob, updateSamplerOutput, updateStudioAssetTags } from "./db";
import { storagePut } from "./storage";
import Stripe from "stripe";
import { studioProducts, type StudioProductId } from "./products";

const assetTypeSchema = z.enum(["audio", "vocal", "sfx", "sample", "motion", "image", "other"]);
const MAX_ASSET_BYTES = 30 * 1024 * 1024;
const supportedMime = /^(audio\/|video\/|image\/|application\/json$|application\/octet-stream$)/i;

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  billing: router({
    catalog: publicProcedure.query(() => Object.values(studioProducts)),
    checkout: protectedProcedure.input(z.object({ productId: z.enum(["asset-starter", "cloud-membership"]) })).mutation(async ({ ctx, input }) => {
      const product = studioProducts[input.productId as StudioProductId];
      const secretKey = process.env.STRIPE_SECRET_KEY;
      if (!secretKey) throw new Error("Stripe is not configured. Open Settings → Payment to finish setup.");
      const stripe = new Stripe(secretKey);
      const origin = ctx.req.headers.origin ?? `${ctx.req.protocol}://${ctx.req.headers.host}`;
      const session = await stripe.checkout.sessions.create({
        mode: product.mode,
        line_items: [{
          price_data: {
            currency: product.currency,
            product_data: { name: product.name, description: product.description },
            unit_amount: product.unitAmount,
            ...(product.mode === "subscription" ? { recurring: { interval: product.interval } } : {}),
          },
          quantity: 1,
        }],
        customer_email: ctx.user.email ?? undefined,
        client_reference_id: ctx.user.id.toString(),
        metadata: { user_id: ctx.user.id.toString(), customer_email: ctx.user.email ?? "", customer_name: ctx.user.name ?? "", product_id: product.id },
        allow_promotion_codes: true,
        success_url: `${origin}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/?checkout=cancelled`,
      });
      if (!session.url) throw new Error("Stripe did not return a Checkout URL");
      return { url: session.url };
    }),
  }),
  studio: router({
    trackedVisit: protectedProcedure
      .input(z.object({ projectKey: z.string().min(1).max(120), generationArmed: z.boolean() }))
      .mutation(({ ctx, input }) => ({ userId: ctx.user.id, projectKey: input.projectKey, generationArmed: input.generationArmed, status: input.generationArmed ? "approval-required" : "tracking-only" as const })),
    assets: router({
      list: protectedProcedure
        .input(z.object({ projectKey: z.string().min(1).max(120) }))
        .query(({ ctx, input }) => listStudioAssets(ctx.user.id, input.projectKey)),
      updateTags: protectedProcedure.input(z.object({ assetId: z.number().int().positive(), tags: z.array(z.string().min(1).max(40)).max(24) })).mutation(({ ctx, input }) => updateStudioAssetTags(ctx.user.id, input.assetId, input.tags)),
      upload: protectedProcedure
        .input(z.object({
          projectKey: z.string().min(1).max(120).regex(/^[a-zA-Z0-9_-]+$/),
          filename: z.string().min(1).max(255),
          mimeType: z.string().min(1).max(160),
          assetType: assetTypeSchema,
          dataBase64: z.string().min(1),
          durationMs: z.number().int().nonnegative().max(86_400_000).nullable().optional(),
          waveformPreview: z.string().max(20_000).nullable().optional(),
          tags: z.array(z.string().min(1).max(40)).max(24).default([]),
        }))
        .mutation(async ({ ctx, input }) => {
          const data = Buffer.from(input.dataBase64, "base64");
          if (data.byteLength > MAX_ASSET_BYTES) throw new Error("Asset exceeds the 30 MB upload limit");
          if (!supportedMime.test(input.mimeType) && input.assetType !== "other") throw new Error("Unsupported asset MIME type");
          const safeFilename = input.filename.replace(/[^a-zA-Z0-9._-]/g, "_");
          const uploaded = await storagePut(`studio/${ctx.user.id}/${input.projectKey}/${safeFilename}`, data, input.mimeType);
          return createStudioAsset({
            userId: ctx.user.id,
            projectKey: input.projectKey,
            filename: safeFilename,
            storageKey: uploaded.key,
            mimeType: input.mimeType,
            assetType: input.assetType,
            sizeBytes: data.byteLength,
            durationMs: input.durationMs ?? null,
            waveformPreview: input.waveformPreview ?? null,
            tags: JSON.stringify(input.tags),
          });
        }),
    }),
    jobs: router({
      list: protectedProcedure.input(z.object({ projectKey: z.string().min(1).max(120) })).query(({ ctx, input }) => listGenerationJobs(ctx.user.id, input.projectKey)),
      create: protectedProcedure.input(z.object({ projectKey: z.string().min(1).max(120), jobType: z.enum(["music", "vocal", "sfx", "motion"]), prompt: z.string().min(1).max(2000) })).mutation(({ ctx, input }) => createGenerationJob({ userId: ctx.user.id, projectKey: input.projectKey, jobType: input.jobType, prompt: input.prompt, status: "queued" })),
      transition: protectedProcedure.input(z.object({ jobId: z.number().int().positive(), status: z.enum(["queued", "running", "completed", "failed", "cancelled"]), errorMessage: z.string().max(1000).optional() })).mutation(({ ctx, input }) => updateGenerationJob(ctx.user.id, input.jobId, input.status, input.errorMessage)),
    }),
    sampler: router({
      list: protectedProcedure.input(z.object({ projectKey: z.string().min(1).max(120) })).query(({ ctx, input }) => listSamplerOutputs(ctx.user.id, input.projectKey)),
      create: protectedProcedure.input(z.object({ projectKey: z.string().min(1).max(120), generationJobId: z.number().int().positive().nullable().optional(), assetId: z.number().int().positive().nullable().optional(), outputType: z.enum(["music", "vocal", "sfx", "motion"]), name: z.string().min(1).max(255), durationMs: z.number().int().nonnegative().nullable().optional(), waveformPreview: z.string().max(20_000).nullable().optional(), tags: z.array(z.string().min(1).max(40)).max(24).default([]) })).mutation(({ ctx, input }) => createSamplerOutput({ userId: ctx.user.id, projectKey: input.projectKey, generationJobId: input.generationJobId ?? null, assetId: input.assetId ?? null, outputType: input.outputType, name: input.name, durationMs: input.durationMs ?? null, waveformPreview: input.waveformPreview ?? null, tags: JSON.stringify(input.tags) })),
      update: protectedProcedure.input(z.object({ outputId: z.number().int().positive(), tags: z.array(z.string().min(1).max(40)).max(24).optional(), waveformPreview: z.string().max(20_000).nullable().optional() })).mutation(({ ctx, input }) => updateSamplerOutput(ctx.user.id, input.outputId, input.tags, input.waveformPreview)),
    }),
  }),
});

export type AppRouter = typeof appRouter;
