import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// TODO: add feature queries here as your schema grows.


import type { InsertStudioAsset, InsertGenerationJob, InsertSamplerOutput } from "../drizzle/schema";
import { generationJobs, samplerOutputs, studioAssets } from "../drizzle/schema";

export async function createStudioAsset(asset: InsertStudioAsset) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const result = await db.insert(studioAssets).values(asset);
  return { id: Number(result[0].insertId), ...asset };
}

export async function listStudioAssets(userId: number, projectKey: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(studioAssets).where(and(eq(studioAssets.userId, userId), eq(studioAssets.projectKey, projectKey)));
}

export async function updateStudioAssetTags(userId: number, assetId: number, tags: string[]) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.update(studioAssets).set({ tags: JSON.stringify(tags) }).where(and(eq(studioAssets.id, assetId), eq(studioAssets.userId, userId)));
  return { assetId, tags };
}

export async function createGenerationJob(job: InsertGenerationJob) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const result = await db.insert(generationJobs).values(job);
  return { id: Number(result[0].insertId), ...job };
}

export async function listGenerationJobs(userId: number, projectKey: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(generationJobs).where(and(eq(generationJobs.userId, userId), eq(generationJobs.projectKey, projectKey)));
}

export async function updateGenerationJob(userId: number, jobId: number, status: "queued" | "running" | "completed" | "failed" | "cancelled", errorMessage?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.update(generationJobs).set({ status, errorMessage: errorMessage ?? null, completedAt: status === "completed" || status === "failed" ? new Date() : null }).where(and(eq(generationJobs.id, jobId), eq(generationJobs.userId, userId)));
  return { jobId, status };
}

export async function createSamplerOutput(output: InsertSamplerOutput) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const result = await db.insert(samplerOutputs).values(output);
  return { id: Number(result[0].insertId), ...output };
}

export async function updateSamplerOutput(userId: number, outputId: number, tags?: string[], waveformPreview?: string | null) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.update(samplerOutputs).set({ ...(tags ? { tags: JSON.stringify(tags) } : {}), ...(waveformPreview !== undefined ? { waveformPreview } : {}) }).where(and(eq(samplerOutputs.id, outputId), eq(samplerOutputs.userId, userId)));
  return { outputId, tags, waveformPreview };
}

export async function listSamplerOutputs(userId: number, projectKey: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(samplerOutputs).where(and(eq(samplerOutputs.userId, userId), eq(samplerOutputs.projectKey, projectKey)));
}
