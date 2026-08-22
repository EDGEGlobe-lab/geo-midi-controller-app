import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { activateHardwareRegistration, assignCompatibilityReviewer, createCompatibilityFeedback, createContactEnquiry, createGenerationJob, createHardwareRegistration, createSamplerOutput, createStudioAsset, decideCompatibilityFeedback, deleteAudioSource, getHardwareRegistration, getUserByOpenId, listAdminReviewers, listAudioSourceHistory, listCompatibilityFeedback, listCompatibilityReviewEvents, listContactEnquiries, listGenerationJobs, listHardwareRegistrations, listSamplerOutputs, listSavedRadioStations, listStudioAssets, removeSavedRadioStation, restoreAudioSource, revokeHardwareRegistration, saveRadioStation, updateGenerationJob, updateSamplerOutput, updateStudioAssetTags } from "./db";
import { storagePut } from "./storage";
import { ENV } from "./_core/env";
import { canActivateSoundAccess, canRevokeSoundAccess, SOUND_ACCESS_NOTICE_VERSION } from "./hardwareAccess";
import { fallbackAssetTags, NIGHT_DRIVE_FALLBACK_DURATION_MS, NIGHT_DRIVE_FALLBACK_MIME_TYPE, NIGHT_DRIVE_FALLBACK_STORAGE_KEY, selectNightDriveGenre } from "../shared/aiProjectFallback";
import { getParkwayRadioStation } from "../shared/radioStationCatalog";
import { catalogueAssetTags, catalogueWaveformPreview, PARKWAY_CATALOGUE_PROJECT_KEY, parkwayCatalogue, parkwaySyntheticVocalVariants, syntheticVocalVariantAssetTags } from "../shared/parkwayCatalogue";
import { getLiveRepositoryMetrics } from "./githubRepositoryMetrics";

const assetTypeSchema = z.enum(["audio", "vocal", "sfx", "sample", "motion", "image", "other"]);
const MAX_ASSET_BYTES = 30 * 1024 * 1024;
const supportedMime = /^(audio\/|video\/|image\/|application\/json$|application\/octet-stream$)/i;
const systemSyntheticVocalTags = new Set(["synthetic-vocal-variant", "synthetic-vocal-only", "non-identifiable-voice", "no-human-voice-source", "alien-creature-edm-voice", "robotic-formant-structure", "bass-responsive-effects", "no-voice-reference-or-cloning", "original-lyrics", "no-franchise-imitation"]);
const assertUserAssetRespectsSyntheticVoicePolicy = (assetType: "audio" | "vocal" | "sfx" | "sample" | "motion" | "image" | "other", tags: string[]) => {
  if (assetType === "vocal") throw new TRPCError({ code: "FORBIDDEN", message: "PARKWAY vocal variants are restricted to verified original synthetic voices; personal, uploaded, or reference voices are not accepted" });
  if (tags.some((tag) => systemSyntheticVocalTags.has(tag))) throw new TRPCError({ code: "FORBIDDEN", message: "Synthetic-vocal provenance tags are server-controlled and reserved for verified original generated variants" });
};
const contactEnquirySchema = z.object({
  name: z.string().trim().min(2).max(160),
  email: z.string().trim().email().max(320),
  serviceInterest: z.enum(["production", "mix-master", "studio-system", "other"]),
  message: z.string().trim().min(12).max(4000),
  paymentDetailsRequested: z.boolean().default(false),
  website: z.string().max(0).optional().default(""),
}).strict();
const hardwareCategorySchema = z.enum(["computer", "standalone", "audio-interface", "midi-controller", "other"]);
const hardwareRegistrationSchema = z.object({
  label: z.string().trim().min(2).max(120),
  category: hardwareCategorySchema,
  productReference: z.string().trim().min(2).max(160).optional(),
}).strict();
const hardwarePurpose = "Store this owner-selected device label and enable PARKWAY browser sound and MIDI controls; no serials, telemetry, third-party licence, or device control.";
const compatibilityFeedbackSchema = z.object({
  deviceCategory: z.enum(["phone", "tablet", "desktop", "laptop", "other"]),
  browserFamily: z.enum(["safari", "chrome", "edge", "firefox", "other"]),
  issueType: z.enum(["audio-output", "playback", "layout", "accessibility", "other"]),
  osVersion: z.string().trim().max(80).optional().default(""),
  message: z.string().trim().min(12).max(2000),
  website: z.string().max(0).optional().default(""),
}).strict();
const secretLikeFeedback = /\b(password|passcode|api[ _-]?key|token|secret|private key|credit card|debit card|bank|iban|cvv|serial number)\b|\b\d{13,19}\b/i;
const assertNoSensitiveFeedback = (value: string) => { if (secretLikeFeedback.test(value)) throw new TRPCError({ code: "BAD_REQUEST", message: "Do not include passwords, keys, payment details, serial numbers, or other sensitive information in compatibility feedback" }); };
const requireAdmin = (role: string) => { if (role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "Reviewer assignment and approval history are limited to authorized staff" }); };

export const appRouter = router({
  system: systemRouter,
  repositoryMetrics: router({
    live: publicProcedure.query(async () => {
      try {
        return await getLiveRepositoryMetrics();
      } catch (error) {
        const message = error instanceof Error ? error.message : "GitHub repository data is temporarily unavailable";
        throw new TRPCError({ code: "SERVICE_UNAVAILABLE", message });
      }
    }),
  }),
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  contact: router({
    submit: publicProcedure.input(contactEnquirySchema).mutation(async ({ input }) => {
      const owner = await getUserByOpenId(ENV.ownerOpenId);
      if (!owner) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Contact service is temporarily unavailable" });
      return createContactEnquiry({
        ownerUserId: owner.id,
        name: input.name,
        email: input.email,
        serviceInterest: input.serviceInterest,
        message: input.message,
        paymentDetailsRequested: input.paymentDetailsRequested ? 1 : 0,
      });
    }),
    inbox: protectedProcedure.query(async ({ ctx }) => {
      const owner = await getUserByOpenId(ENV.ownerOpenId);
      if (!owner || ctx.user.role !== "admin" || ctx.user.id !== owner.id) throw new TRPCError({ code: "FORBIDDEN", message: "Contact enquiries are limited to the project owner" });
      return listContactEnquiries(owner.id);
    }),
  }),
  compatibility: router({
    submit: publicProcedure.input(compatibilityFeedbackSchema).mutation(({ input }) => {
      assertNoSensitiveFeedback(`${input.osVersion}\n${input.message}`);
      return createCompatibilityFeedback({ deviceCategory: input.deviceCategory, browserFamily: input.browserFamily, issueType: input.issueType, osVersion: input.osVersion || null, message: input.message, status: "submitted", assignedReviewerUserId: null });
    }),
    review: router({
      list: protectedProcedure.query(({ ctx }) => { requireAdmin(ctx.user.role); return listCompatibilityFeedback(); }),
      reviewers: protectedProcedure.query(({ ctx }) => { requireAdmin(ctx.user.role); return listAdminReviewers(); }),
      history: protectedProcedure.input(z.object({ feedbackId: z.number().int().positive() }).strict()).query(({ ctx, input }) => { requireAdmin(ctx.user.role); return listCompatibilityReviewEvents(input.feedbackId); }),
      assign: protectedProcedure.input(z.object({ feedbackId: z.number().int().positive(), reviewerUserId: z.number().int().positive() }).strict()).mutation(async ({ ctx, input }) => {
        requireAdmin(ctx.user.role);
        const assigned = await assignCompatibilityReviewer(ctx.user.id, input.feedbackId, input.reviewerUserId);
        if (!assigned) throw new TRPCError({ code: "NOT_FOUND", message: "Submission or authorized reviewer not found" });
        return assigned;
      }),
      decide: protectedProcedure.input(z.object({ feedbackId: z.number().int().positive(), event: z.enum(["approved", "changes-requested", "rejected", "closed"]), note: z.string().trim().max(600).optional() }).strict()).mutation(async ({ ctx, input }) => {
        requireAdmin(ctx.user.role);
        assertNoSensitiveFeedback(input.note ?? "");
        const result = await decideCompatibilityFeedback(ctx.user.id, input.feedbackId, input.event, input.note);
        if (!result) throw new TRPCError({ code: "NOT_FOUND", message: "Submission not found" });
        return result;
      }),
    }),
  }),
  hardware: router({
    list: protectedProcedure.query(({ ctx }) => listHardwareRegistrations(ctx.user.id)),
    register: protectedProcedure.input(hardwareRegistrationSchema).mutation(({ ctx, input }) => createHardwareRegistration({
      ownerUserId: ctx.user.id,
      label: input.label,
      category: input.category,
      productReference: input.productReference || null,
      activationState: "disabled",
      consentNoticeVersion: null,
      consentedAt: null,
      revokedAt: null,
    })),
    activate: protectedProcedure.input(z.object({ registrationId: z.number().int().positive(), consentGranted: z.literal(true), noticeVersion: z.literal(SOUND_ACCESS_NOTICE_VERSION) }).strict()).mutation(async ({ ctx, input }) => {
      const registration = await getHardwareRegistration(ctx.user.id, input.registrationId);
      if (!registration) throw new TRPCError({ code: "NOT_FOUND", message: "Registered device not found" });
      if (!canActivateSoundAccess({ ownerUserId: registration.ownerUserId, actorUserId: ctx.user.id, state: registration.activationState, consentGranted: input.consentGranted, noticeVersion: input.noticeVersion })) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Sound access requires an owner-approved disabled registration and the current consent notice" });
      return activateHardwareRegistration(ctx.user.id, registration.id, { registrationId: registration.id, ownerUserId: ctx.user.id, event: "granted", noticeVersion: input.noticeVersion, purpose: hardwarePurpose });
    }),
    revoke: protectedProcedure.input(z.object({ registrationId: z.number().int().positive() }).strict()).mutation(async ({ ctx, input }) => {
      const registration = await getHardwareRegistration(ctx.user.id, input.registrationId);
      if (!registration) throw new TRPCError({ code: "NOT_FOUND", message: "Registered device not found" });
      if (!canRevokeSoundAccess(registration.ownerUserId, ctx.user.id, registration.activationState)) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Only an active owner-scoped sound-access profile can be revoked" });
      return revokeHardwareRegistration(ctx.user.id, registration.id, { registrationId: registration.id, ownerUserId: ctx.user.id, event: "revoked", noticeVersion: registration.consentNoticeVersion ?? SOUND_ACCESS_NOTICE_VERSION, purpose: hardwarePurpose });
    }),
  }),
  radio: router({
    saved: protectedProcedure.query(({ ctx }) => listSavedRadioStations(ctx.user.id)),
    save: protectedProcedure.input(z.object({ stationId: z.string().min(1).max(80) }).strict()).mutation(async ({ ctx, input }) => {
      if (!getParkwayRadioStation(input.stationId)) throw new TRPCError({ code: "NOT_FOUND", message: "PARKWAY project-preview station not found" });
      return saveRadioStation(ctx.user.id, input.stationId);
    }),
    remove: protectedProcedure.input(z.object({ stationId: z.string().min(1).max(80) }).strict()).mutation(async ({ ctx, input }) => {
      if (!getParkwayRadioStation(input.stationId)) throw new TRPCError({ code: "NOT_FOUND", message: "PARKWAY project-preview station not found" });
      return removeSavedRadioStation(ctx.user.id, input.stationId);
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
      registerParkwayCatalogue: protectedProcedure
        .input(z.object({ projectKey: z.literal(PARKWAY_CATALOGUE_PROJECT_KEY) }).strict())
        .mutation(async ({ ctx, input }) => {
          const existing = await listStudioAssets(ctx.user.id, input.projectKey);
          const existingKeys = new Set(existing.map((asset) => asset.storageKey));
          const created = [];
          const skipped = [];
          for (const track of parkwayCatalogue) {
            if (existingKeys.has(track.storageKey)) {
              skipped.push(track.id);
              continue;
            }
            const asset = await createStudioAsset({
              userId: ctx.user.id,
              projectKey: input.projectKey,
              filename: `${track.number.toString().padStart(2, "0")} · ${track.title}.wav`,
              storageKey: track.storageKey,
              mimeType: "audio/wav",
              assetType: "audio",
              sizeBytes: 0,
              durationMs: track.durationMs,
              waveformPreview: catalogueWaveformPreview(track),
              tags: JSON.stringify(catalogueAssetTags(track)),
            });
            created.push(asset);
          }
          return { created, skipped, total: parkwayCatalogue.length };
        }),
      registerParkwaySyntheticVocals: protectedProcedure
        .input(z.object({ projectKey: z.literal(PARKWAY_CATALOGUE_PROJECT_KEY) }).strict())
        .mutation(async ({ ctx, input }) => {
          const existing = await listStudioAssets(ctx.user.id, input.projectKey);
          const existingKeys = new Set(existing.map((asset) => asset.storageKey));
          const created = [];
          const skipped = [];
          for (const variant of parkwaySyntheticVocalVariants) {
            const track = parkwayCatalogue.find((item) => item.id === variant.trackId);
            if (!track) continue;
            if (existingKeys.has(variant.storageKey)) {
              skipped.push(variant.trackId);
              continue;
            }
            created.push(await createStudioAsset({
              userId: ctx.user.id,
              projectKey: input.projectKey,
              filename: `${track.number.toString().padStart(2, "0")} · ${track.title} · Synthetic Vocal Variant.wav`,
              storageKey: variant.storageKey,
              mimeType: "audio/wav",
              assetType: "vocal",
              sizeBytes: 0,
              durationMs: variant.durationMs,
              waveformPreview: catalogueWaveformPreview(track),
              tags: JSON.stringify(syntheticVocalVariantAssetTags(track)),
            }));
          }
          return { created, skipped, total: parkwaySyntheticVocalVariants.length };
        }),
      updateTags: protectedProcedure.input(z.object({ assetId: z.number().int().positive(), tags: z.array(z.string().min(1).max(40)).max(24) })).mutation(({ ctx, input }) => {
        assertUserAssetRespectsSyntheticVoicePolicy("audio", input.tags);
        return updateStudioAssetTags(ctx.user.id, input.assetId, input.tags);
      }),
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
          assertUserAssetRespectsSyntheticVoicePolicy(input.assetType, input.tags);
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
      uploadManusMusic: protectedProcedure
        .input(z.object({
          projectKey: z.string().min(1).max(120).regex(/^[a-zA-Z0-9_-]+$/),
          filename: z.string().min(1).max(255),
          mimeType: z.string().min(1).max(160).regex(/^audio\/(mpeg|wav|x-wav|ogg|mp4|aac|flac)$/i, "A supported audio MIME type is required"),
          dataBase64: z.string().min(1),
          durationMs: z.number().int().nonnegative().max(86_400_000).nullable().optional(),
          waveformPreview: z.string().max(20_000).nullable().optional(),
          tags: z.array(z.string().min(1).max(40)).max(12).default([]),
        }))
        .mutation(async ({ ctx, input }) => {
          assertUserAssetRespectsSyntheticVoicePolicy("audio", input.tags);
          const data = Buffer.from(input.dataBase64, "base64");
          if (data.byteLength > MAX_ASSET_BYTES) throw new TRPCError({ code: "PAYLOAD_TOO_LARGE", message: "Music uploads must be 30 MB or smaller" });
          const safeFilename = input.filename.replace(/[^a-zA-Z0-9._-]/g, "_");
          const uploaded = await storagePut(`studio/${ctx.user.id}/${input.projectKey}/manus-music/${Date.now()}-${safeFilename}`, data, input.mimeType);
          const provenanceTags = Array.from(new Set(["manus-ai-upload", "user-approved", "source-file-supplied", ...input.tags]));
          return createStudioAsset({
            userId: ctx.user.id,
            projectKey: input.projectKey,
            filename: safeFilename,
            storageKey: uploaded.key,
            mimeType: input.mimeType,
            assetType: "audio",
            sizeBytes: data.byteLength,
            durationMs: input.durationMs ?? null,
            waveformPreview: input.waveformPreview ?? null,
            tags: JSON.stringify(provenanceTags),
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
    fallback: router({
      activate: protectedProcedure.input(z.object({ projectKey: z.string().min(1).max(120).regex(/^[a-zA-Z0-9_-]+$/), trigger: z.enum(["media-error", "play-rejection"]), attempt: z.number().int().min(1).max(2) })).mutation(async ({ ctx, input }) => {
        const genre = selectNightDriveGenre();
        const tags = fallbackAssetTags(genre, input.trigger);
        const waveformPreview = JSON.stringify(Array.from({ length: 56 }, (_, index) => 18 + ((genre.id.charCodeAt(index % genre.id.length) * (index + 3)) % 72)));
        const job = await createGenerationJob({ userId: ctx.user.id, projectKey: input.projectKey, jobType: "music", prompt: `${genre.prompt} [Pre-generated fallback source selected after ${input.trigger}; no new render was requested.]`, status: "completed", completedAt: new Date() });
        const asset = await createStudioAsset({ userId: ctx.user.id, projectKey: input.projectKey, filename: `Night Drive fallback · ${genre.label}.wav`, storageKey: NIGHT_DRIVE_FALLBACK_STORAGE_KEY, mimeType: NIGHT_DRIVE_FALLBACK_MIME_TYPE, assetType: "audio", sizeBytes: 0, durationMs: NIGHT_DRIVE_FALLBACK_DURATION_MS, waveformPreview, tags: JSON.stringify(tags) });
        const output = await createSamplerOutput({ userId: ctx.user.id, projectKey: input.projectKey, generationJobId: job.id, assetId: asset.id, outputType: "music", name: `Night Drive fallback · ${genre.label}`, durationMs: NIGHT_DRIVE_FALLBACK_DURATION_MS, waveformPreview, tags: JSON.stringify(tags) });
        return { preGenerated: true, genre, asset, output, sourceUrl: `/manus-storage/${NIGHT_DRIVE_FALLBACK_STORAGE_KEY}`, attempt: input.attempt };
      }),
    }),
    sourceHistory: router({
      list: protectedProcedure.input(z.object({ projectKey: z.string().min(1).max(120).regex(/^[a-zA-Z0-9_-]+$/) })).query(({ ctx, input }) => listAudioSourceHistory(ctx.user.id, input.projectKey)),
      restore: protectedProcedure.input(z.object({ projectKey: z.string().min(1).max(120).regex(/^[a-zA-Z0-9_-]+$/), assetId: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
        const restored = await restoreAudioSource(ctx.user.id, input.projectKey, input.assetId);
        if (!restored) throw new TRPCError({ code: "NOT_FOUND", message: "Audio source version not found" });
        return { ...restored, sourceUrl: `/manus-storage/${restored.storageKey}` };
      }),
      delete: protectedProcedure.input(z.object({ projectKey: z.string().min(1).max(120).regex(/^[a-zA-Z0-9_-]+$/), assetId: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
        const result = await deleteAudioSource(ctx.user.id, input.projectKey, input.assetId);
        if (result.status === "active") throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Restore another audio source before deleting the active version" });
        if (result.status === "missing") throw new TRPCError({ code: "NOT_FOUND", message: "Audio source version not found" });
        return result;
      }),
    }),
  }),
});

export type AppRouter = typeof appRouter;
