import { int, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const studioAssets = mysqlTable("studio_assets", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  projectKey: varchar("projectKey", { length: 120 }).notNull(),
  filename: varchar("filename", { length: 255 }).notNull(),
  storageKey: varchar("storageKey", { length: 512 }).notNull(),
  mimeType: varchar("mimeType", { length: 160 }).notNull(),
  assetType: mysqlEnum("assetType", ["audio", "vocal", "sfx", "sample", "motion", "image", "other"]).notNull(),
  sizeBytes: int("sizeBytes").notNull(),
  durationMs: int("durationMs"),
  waveformPreview: text("waveformPreview"),
  tags: text("tags"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  deletedAt: timestamp("deletedAt"),
});

export type StudioAsset = typeof studioAssets.$inferSelect;
export type InsertStudioAsset = typeof studioAssets.$inferInsert;

export const activeAudioSources = mysqlTable("active_audio_sources", {
  id: int("id").autoincrement().primaryKey(),
  ownerUserId: int("ownerUserId").notNull().references(() => users.id),
  projectKey: varchar("projectKey", { length: 120 }).notNull(),
  assetId: int("assetId").notNull().references(() => studioAssets.id),
  restoredAt: timestamp("restoredAt").defaultNow().notNull(),
}, (table) => ({ ownerProjectUnique: uniqueIndex("active_audio_source_owner_project_uq").on(table.ownerUserId, table.projectKey) }));

export type ActiveAudioSource = typeof activeAudioSources.$inferSelect;
export type InsertActiveAudioSource = typeof activeAudioSources.$inferInsert;

export const audioSourceEvents = mysqlTable("audio_source_events", {
  id: int("id").autoincrement().primaryKey(),
  ownerUserId: int("ownerUserId").notNull().references(() => users.id),
  projectKey: varchar("projectKey", { length: 120 }).notNull(),
  assetId: int("assetId").notNull().references(() => studioAssets.id),
  event: mysqlEnum("event", ["restored", "deleted"]).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AudioSourceEvent = typeof audioSourceEvents.$inferSelect;
export type InsertAudioSourceEvent = typeof audioSourceEvents.$inferInsert;

export const savedRadioStations = mysqlTable("saved_radio_stations", {
  id: int("id").autoincrement().primaryKey(),
  ownerUserId: int("ownerUserId").notNull().references(() => users.id),
  stationId: varchar("stationId", { length: 80 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({ ownerStationUnique: uniqueIndex("saved_radio_owner_station_uq").on(table.ownerUserId, table.stationId) }));

export type SavedRadioStation = typeof savedRadioStations.$inferSelect;
export type InsertSavedRadioStation = typeof savedRadioStations.$inferInsert;

export const generationJobs = mysqlTable("generation_jobs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  projectKey: varchar("projectKey", { length: 120 }).notNull(),
  jobType: mysqlEnum("jobType", ["music", "vocal", "sfx", "motion"]).notNull(),
  status: mysqlEnum("status", ["queued", "running", "completed", "failed", "cancelled"]).default("queued").notNull(),
  prompt: text("prompt").notNull(),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type GenerationJob = typeof generationJobs.$inferSelect;
export type InsertGenerationJob = typeof generationJobs.$inferInsert;

export const samplerOutputs = mysqlTable("sampler_outputs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  projectKey: varchar("projectKey", { length: 120 }).notNull(),
  generationJobId: int("generationJobId").references(() => generationJobs.id),
  assetId: int("assetId").references(() => studioAssets.id),
  outputType: mysqlEnum("outputType", ["music", "vocal", "sfx", "motion"]).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  durationMs: int("durationMs"),
  waveformPreview: text("waveformPreview"),
  tags: text("tags"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SamplerOutput = typeof samplerOutputs.$inferSelect;
export type InsertSamplerOutput = typeof samplerOutputs.$inferInsert;

export const contactEnquiries = mysqlTable("contact_enquiries", {
  id: int("id").autoincrement().primaryKey(),
  ownerUserId: int("ownerUserId").notNull().references(() => users.id),
  name: varchar("name", { length: 160 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  serviceInterest: varchar("serviceInterest", { length: 120 }).notNull(),
  message: text("message").notNull(),
  paymentDetailsRequested: int("paymentDetailsRequested").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ContactEnquiry = typeof contactEnquiries.$inferSelect;
export type InsertContactEnquiry = typeof contactEnquiries.$inferInsert;

export const compatibilityFeedback = mysqlTable("compatibility_feedback", {
  id: int("id").autoincrement().primaryKey(),
  deviceCategory: mysqlEnum("deviceCategory", ["phone", "tablet", "desktop", "laptop", "other"]).notNull(),
  browserFamily: mysqlEnum("browserFamily", ["safari", "chrome", "edge", "firefox", "other"]).notNull(),
  issueType: mysqlEnum("issueType", ["audio-output", "playback", "layout", "accessibility", "other"]).notNull(),
  osVersion: varchar("osVersion", { length: 80 }),
  message: text("message").notNull(),
  status: mysqlEnum("status", ["submitted", "assigned", "approved", "changes-requested", "rejected", "closed"]).default("submitted").notNull(),
  assignedReviewerUserId: int("assignedReviewerUserId").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CompatibilityFeedback = typeof compatibilityFeedback.$inferSelect;
export type InsertCompatibilityFeedback = typeof compatibilityFeedback.$inferInsert;

export const compatibilityReviewEvents = mysqlTable("compatibility_review_events", {
  id: int("id").autoincrement().primaryKey(),
  feedbackId: int("feedbackId").notNull().references(() => compatibilityFeedback.id),
  actorUserId: int("actorUserId").notNull().references(() => users.id),
  reviewerUserId: int("reviewerUserId").references(() => users.id),
  event: mysqlEnum("event", ["assigned", "approved", "changes-requested", "rejected", "closed"]).notNull(),
  note: varchar("note", { length: 600 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CompatibilityReviewEvent = typeof compatibilityReviewEvents.$inferSelect;
export type InsertCompatibilityReviewEvent = typeof compatibilityReviewEvents.$inferInsert;

export const hardwareRegistrations = mysqlTable("hardware_registrations", {
  id: int("id").autoincrement().primaryKey(),
  ownerUserId: int("ownerUserId").notNull().references(() => users.id),
  label: varchar("label", { length: 120 }).notNull(),
  category: mysqlEnum("category", ["computer", "standalone", "audio-interface", "midi-controller", "other"]).notNull(),
  productReference: varchar("productReference", { length: 160 }),
  activationState: mysqlEnum("activationState", ["disabled", "active", "revoked"]).default("disabled").notNull(),
  consentNoticeVersion: varchar("consentNoticeVersion", { length: 80 }),
  consentedAt: timestamp("consentedAt"),
  revokedAt: timestamp("revokedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type HardwareRegistration = typeof hardwareRegistrations.$inferSelect;
export type InsertHardwareRegistration = typeof hardwareRegistrations.$inferInsert;

export const hardwareConsentEvents = mysqlTable("hardware_consent_events", {
  id: int("id").autoincrement().primaryKey(),
  registrationId: int("registrationId").notNull().references(() => hardwareRegistrations.id),
  ownerUserId: int("ownerUserId").notNull().references(() => users.id),
  event: mysqlEnum("event", ["granted", "revoked"]).notNull(),
  noticeVersion: varchar("noticeVersion", { length: 80 }).notNull(),
  purpose: varchar("purpose", { length: 240 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type HardwareConsentEvent = typeof hardwareConsentEvents.$inferSelect;
export type InsertHardwareConsentEvent = typeof hardwareConsentEvents.$inferInsert;
