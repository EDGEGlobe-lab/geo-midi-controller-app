import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { createStudioAsset, listStudioAssets } from "./db";
import { storagePut } from "./storage";

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
  studio: router({
    trackedVisit: protectedProcedure
      .input(z.object({ projectKey: z.string().min(1).max(120), generationArmed: z.boolean() }))
      .mutation(({ ctx, input }) => ({ userId: ctx.user.id, projectKey: input.projectKey, generationArmed: input.generationArmed, status: input.generationArmed ? "approval-required" : "tracking-only" as const })),
    assets: router({
      list: protectedProcedure
        .input(z.object({ projectKey: z.string().min(1).max(120) }))
        .query(({ ctx, input }) => listStudioAssets(ctx.user.id, input.projectKey)),
      upload: protectedProcedure
        .input(z.object({
          projectKey: z.string().min(1).max(120).regex(/^[a-zA-Z0-9_-]+$/),
          filename: z.string().min(1).max(255),
          mimeType: z.string().min(1).max(160),
          assetType: assetTypeSchema,
          dataBase64: z.string().min(1),
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
          });
        }),
    }),
  }),
});

export type AppRouter = typeof appRouter;
