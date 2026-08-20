import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

vi.mock("./db", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./db")>();
  return { ...actual, createGenerationJob: vi.fn(), createStudioAsset: vi.fn(), createSamplerOutput: vi.fn() };
});

import * as db from "./db";
import { appRouter } from "./routers";
import { NIGHT_DRIVE_FALLBACK_STORAGE_KEY } from "../shared/aiProjectFallback";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;
const user: AuthenticatedUser = { id: 7, openId: "fallback-user", email: "fallback@example.com", name: "Fallback User", loginMethod: "manus", role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() };
const contextFor = (userValue: AuthenticatedUser | null): TrpcContext => ({ user: userValue, req: { protocol: "https", headers: {} } as TrpcContext["req"], res: {} as TrpcContext["res"] });

describe("studio fallback router", () => {
  beforeEach(() => { vi.clearAllMocks(); vi.spyOn(Math, "random").mockReturnValue(0); });

  it("denies an error-triggered fallback mutation to an unauthenticated caller", async () => {
    await expect(appRouter.createCaller(contextFor(null)).studio.fallback.activate({ projectKey: "night-drive-07", trigger: "media-error", attempt: 1 })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("stores a declared pre-generated fallback as an owner-scoped playable project asset", async () => {
    vi.mocked(db.createGenerationJob).mockResolvedValue({ id: 31 } as any);
    vi.mocked(db.createStudioAsset).mockResolvedValue({ id: 41 } as any);
    vi.mocked(db.createSamplerOutput).mockResolvedValue({ id: 51 } as any);
    const result = await appRouter.createCaller(contextFor(user)).studio.fallback.activate({ projectKey: "night-drive-07", trigger: "play-rejection", attempt: 1 });
    expect(result).toMatchObject({ preGenerated: true, genre: { id: "underground-techno" }, sourceUrl: `/manus-storage/${NIGHT_DRIVE_FALLBACK_STORAGE_KEY}`, attempt: 1 });
    expect(db.createGenerationJob).toHaveBeenCalledWith(expect.objectContaining({ userId: 7, projectKey: "night-drive-07", status: "completed", prompt: expect.stringContaining("Pre-generated fallback source") }));
    expect(db.createStudioAsset).toHaveBeenCalledWith(expect.objectContaining({ userId: 7, projectKey: "night-drive-07", storageKey: NIGHT_DRIVE_FALLBACK_STORAGE_KEY, assetType: "audio", tags: expect.stringContaining("pre-generated-fallback") }));
    expect(db.createSamplerOutput).toHaveBeenCalledWith(expect.objectContaining({ userId: 7, projectKey: "night-drive-07", generationJobId: 31, assetId: 41, outputType: "music" }));
  });
});
