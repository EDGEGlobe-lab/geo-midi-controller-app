import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

vi.mock("./db", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./db")>();
  return { ...actual, createStudioAsset: vi.fn(), listStudioAssets: vi.fn() };
});
vi.mock("./storage", () => ({ storagePut: vi.fn() }));

import * as db from "./db";
import { appRouter } from "./routers";
import { PARKWAY_CATALOGUE_PROJECT_KEY } from "../shared/parkwayCatalogue";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;
const user: AuthenticatedUser = { id: 64, openId: "synthetic-voice-owner", email: "voice@example.com", name: "Voice Owner", loginMethod: "manus", role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() };
const contextFor = (userValue: AuthenticatedUser | null): TrpcContext => ({ user: userValue, req: { protocol: "https", headers: {} } as TrpcContext["req"], res: {} as TrpcContext["res"] });

describe("synthetic vocal policy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(db.listStudioAssets).mockResolvedValue([] as any);
    vi.mocked(db.createStudioAsset).mockImplementation(async (asset) => ({ id: asset.filename.length, ...asset }) as any);
  });

  it("rejects a user-supplied vocal asset and reserved synthetic-vocal claims", async () => {
    const caller = appRouter.createCaller(contextFor(user));
    await expect(caller.studio.assets.upload({ projectKey: PARKWAY_CATALOGUE_PROJECT_KEY, filename: "person.wav", mimeType: "audio/wav", assetType: "vocal", dataBase64: "UklGRg==", tags: [] })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.studio.assets.uploadManusMusic({ projectKey: PARKWAY_CATALOGUE_PROJECT_KEY, filename: "unknown.wav", mimeType: "audio/wav", dataBase64: "UklGRg==", tags: ["synthetic-vocal-variant"] })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("registers the verified non-identifiable synthetic vocal master separately from its instrumental", async () => {
    const result = await appRouter.createCaller(contextFor(user)).studio.assets.registerParkwaySyntheticVocals({ projectKey: PARKWAY_CATALOGUE_PROJECT_KEY });
    expect(result).toMatchObject({ total: 1, skipped: [] });
    expect(db.createStudioAsset).toHaveBeenCalledWith(expect.objectContaining({ userId: 64, assetType: "vocal", durationMs: 300_000, tags: expect.stringContaining("alien-creature-edm-voice") }));
    expect(db.createStudioAsset).toHaveBeenCalledWith(expect.objectContaining({ tags: expect.stringContaining("no-franchise-imitation") }));
  });
});
