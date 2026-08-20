import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

vi.mock("./db", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./db")>();
  return { ...actual, createStudioAsset: vi.fn() };
});
vi.mock("./storage", () => ({ storagePut: vi.fn() }));

import * as db from "./db";
import { storagePut } from "./storage";
import { appRouter } from "./routers";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;
const user: AuthenticatedUser = { id: 52, openId: "music-upload-owner", email: "music@example.com", name: "Music Owner", loginMethod: "manus", role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() };
const contextFor = (userValue: AuthenticatedUser | null): TrpcContext => ({ user: userValue, req: { protocol: "https", headers: {} } as TrpcContext["req"], res: {} as TrpcContext["res"] });
const input = { projectKey: "night-drive-07", filename: "approved-music.wav", mimeType: "audio/wav", dataBase64: "UklGRg==", durationMs: 1200, waveformPreview: "[18,42]", tags: ["night-drive"] };

describe("Manus AI music generator upload", () => {
  beforeEach(() => vi.clearAllMocks());

  it("denies anonymous music upload and rejects a non-audio MIME type", async () => {
    await expect(appRouter.createCaller(contextFor(null)).studio.assets.uploadManusMusic(input)).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(appRouter.createCaller(contextFor(user)).studio.assets.uploadManusMusic({ ...input, mimeType: "image/png" })).rejects.toBeTruthy();
  });

  it("stores a user-approved source with server-controlled provenance tags", async () => {
    vi.mocked(storagePut).mockResolvedValue({ key: "studio/52/night-drive-07/manus-music/1-approved-music.wav", url: "/manus-storage/example" });
    vi.mocked(db.createStudioAsset).mockResolvedValue({ id: 77 } as any);
    await expect(appRouter.createCaller(contextFor(user)).studio.assets.uploadManusMusic(input)).resolves.toMatchObject({ id: 77 });
    expect(db.createStudioAsset).toHaveBeenCalledWith(expect.objectContaining({ userId: 52, assetType: "audio", tags: JSON.stringify(["manus-ai-upload", "user-approved", "source-file-supplied", "night-drive"]) }));
    expect(storagePut).toHaveBeenCalledWith(expect.stringContaining("studio/52/night-drive-07/manus-music/"), expect.any(Buffer), "audio/wav");
  });
});
