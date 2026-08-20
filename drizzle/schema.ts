import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

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
});

export type StudioAsset = typeof studioAssets.$inferSelect;
export type InsertStudioAsset = typeof studioAssets.$inferInsert;

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