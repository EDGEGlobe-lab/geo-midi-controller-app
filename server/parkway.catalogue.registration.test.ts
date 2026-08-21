import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

vi.mock("./db", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./db")>();
  return { ...actual, createStudioAsset: vi.fn(), listStudioAssets: vi.fn() };
});

import * as db from "./db";
import { appRouter } from "./routers";
import { PARKWAY_CATALOGUE_PROJECT_KEY, parkwayCatalogue } from "../shared/parkwayCatalogue";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;
const user: AuthenticatedUser = { id: 63, openId: "catalogue-owner", email: "catalogue@example.com", name: "Catalogue Owner", loginMethod: "manus", role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() };
const contextFor = (userValue: AuthenticatedUser | null): TrpcContext => ({ user: userValue, req: { protocol: "https", headers: {} } as TrpcContext["req"], res: {} as TrpcContext["res"] });

describe("PARKWAY catalogue registration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(db.listStudioAssets).mockResolvedValue([] as any);
    vi.mocked(db.createStudioAsset).mockImplementation(async (asset) => ({ id: asset.filename.length, ...asset }) as any);
  });

  it("requires authentication before registering the stored original masters", async () => {
    await expect(appRouter.createCaller(contextFor(null)).studio.assets.registerParkwayCatalogue({ projectKey: PARKWAY_CATALOGUE_PROJECT_KEY })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("registers all twenty instrumental masters with synthetic-vocal-only policy and no human-voice provenance", async () => {
    const result = await appRouter.createCaller(contextFor(user)).studio.assets.registerParkwayCatalogue({ projectKey: PARKWAY_CATALOGUE_PROJECT_KEY });
    expect(result).toMatchObject({ total: 20, skipped: [] });
    expect(result.created).toHaveLength(20);
    expect(db.createStudioAsset).toHaveBeenCalledTimes(20);
    expect(db.createStudioAsset).toHaveBeenCalledWith(expect.objectContaining({ userId: 63, assetType: "audio", durationMs: 300_000, tags: expect.stringContaining("no-human-voice-source") }));
    expect(db.createStudioAsset).toHaveBeenCalledWith(expect.objectContaining({ tags: expect.stringContaining("synthetic-vocal-only-policy") }));
  });

  it("does not duplicate a master already registered in the owner-scoped project library", async () => {
    vi.mocked(db.listStudioAssets).mockResolvedValue([{ storageKey: parkwayCatalogue[0].storageKey }] as any);
    const result = await appRouter.createCaller(contextFor(user)).studio.assets.registerParkwayCatalogue({ projectKey: PARKWAY_CATALOGUE_PROJECT_KEY });
    expect(result.skipped).toEqual(["parkway-01"]);
    expect(result.created).toHaveLength(19);
    expect(db.createStudioAsset).toHaveBeenCalledTimes(19);
  });
});
