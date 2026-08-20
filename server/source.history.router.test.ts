import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

vi.mock("./db", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./db")>();
  return { ...actual, listAudioSourceHistory: vi.fn(), restoreAudioSource: vi.fn(), deleteAudioSource: vi.fn() };
});

import * as db from "./db";
import { appRouter } from "./routers";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;
const user: AuthenticatedUser = { id: 13, openId: "source-owner", email: "owner@example.com", name: "Source Owner", loginMethod: "manus", role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() };
const contextFor = (userValue: AuthenticatedUser | null): TrpcContext => ({ user: userValue, req: { protocol: "https", headers: {} } as TrpcContext["req"], res: {} as TrpcContext["res"] });

describe("studio source history router", () => {
  beforeEach(() => vi.clearAllMocks());

  it("denies source history operations to anonymous callers", async () => {
    const caller = appRouter.createCaller(contextFor(null));
    await expect(caller.studio.sourceHistory.list({ projectKey: "night-drive-07" })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(caller.studio.sourceHistory.restore({ projectKey: "night-drive-07", assetId: 8 })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(caller.studio.sourceHistory.delete({ projectKey: "night-drive-07", assetId: 8 })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("lists and restores only the authenticated owner’s project source", async () => {
    vi.mocked(db.listAudioSourceHistory).mockResolvedValue([{ id: 8, filename: "fallback.wav", isActive: false }] as any);
    vi.mocked(db.restoreAudioSource).mockResolvedValue({ id: 8, storageKey: "studio/13/night-drive-07/fallback.wav", isActive: true } as any);
    const caller = appRouter.createCaller(contextFor(user));
    await expect(caller.studio.sourceHistory.list({ projectKey: "night-drive-07" })).resolves.toHaveLength(1);
    await expect(caller.studio.sourceHistory.restore({ projectKey: "night-drive-07", assetId: 8 })).resolves.toMatchObject({ sourceUrl: "/manus-storage/studio/13/night-drive-07/fallback.wav", isActive: true });
    expect(db.listAudioSourceHistory).toHaveBeenCalledWith(13, "night-drive-07");
    expect(db.restoreAudioSource).toHaveBeenCalledWith(13, "night-drive-07", 8);
  });

  it("requires another source to be restored before deleting the active version", async () => {
    vi.mocked(db.deleteAudioSource).mockResolvedValue({ status: "active" });
    await expect(appRouter.createCaller(contextFor(user)).studio.sourceHistory.delete({ projectKey: "night-drive-07", assetId: 8 })).rejects.toMatchObject({ code: "PRECONDITION_FAILED" });
  });

  it("allows owner-scoped metadata deletion for a non-active history version", async () => {
    vi.mocked(db.deleteAudioSource).mockResolvedValue({ status: "deleted", assetId: 8, deletedAt: new Date() });
    await expect(appRouter.createCaller(contextFor(user)).studio.sourceHistory.delete({ projectKey: "night-drive-07", assetId: 8 })).resolves.toMatchObject({ status: "deleted", assetId: 8 });
    expect(db.deleteAudioSource).toHaveBeenCalledWith(13, "night-drive-07", 8);
  });
});
