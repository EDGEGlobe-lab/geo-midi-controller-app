import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

vi.mock("./db", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./db")>();
  return { ...actual, listSavedRadioStations: vi.fn(), saveRadioStation: vi.fn(), removeSavedRadioStation: vi.fn() };
});

import * as db from "./db";
import { appRouter } from "./routers";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;
const user: AuthenticatedUser = { id: 31, openId: "radio-owner", email: "radio@example.com", name: "Radio Owner", loginMethod: "manus", role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() };
const contextFor = (userValue: AuthenticatedUser | null): TrpcContext => ({ user: userValue, req: { protocol: "https", headers: {} } as TrpcContext["req"], res: {} as TrpcContext["res"] });

describe("radio saved stations router", () => {
  beforeEach(() => vi.clearAllMocks());

  it("denies saved-station access to anonymous callers", async () => {
    const caller = appRouter.createCaller(contextFor(null));
    await expect(caller.radio.saved()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(caller.radio.save({ stationId: "night-drive-fm" })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(caller.radio.remove({ stationId: "night-drive-fm" })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("persists and removes only an authenticated owner’s approved project-preview station", async () => {
    vi.mocked(db.listSavedRadioStations).mockResolvedValue([{ stationId: "night-drive-fm" }] as any);
    vi.mocked(db.saveRadioStation).mockResolvedValue({ ownerUserId: 31, stationId: "night-drive-fm", savedAt: new Date() });
    vi.mocked(db.removeSavedRadioStation).mockResolvedValue({ ownerUserId: 31, stationId: "night-drive-fm", removed: true });
    const caller = appRouter.createCaller(contextFor(user));
    await expect(caller.radio.saved()).resolves.toHaveLength(1);
    await expect(caller.radio.save({ stationId: "night-drive-fm" })).resolves.toMatchObject({ stationId: "night-drive-fm" });
    await expect(caller.radio.remove({ stationId: "night-drive-fm" })).resolves.toMatchObject({ removed: true });
    expect(db.saveRadioStation).toHaveBeenCalledWith(31, "night-drive-fm");
    expect(db.removeSavedRadioStation).toHaveBeenCalledWith(31, "night-drive-fm");
  });

  it("rejects a station outside the closed PARKWAY project-preview catalogue", async () => {
    await expect(appRouter.createCaller(contextFor(user)).radio.save({ stationId: "external-station" })).rejects.toMatchObject({ code: "NOT_FOUND" });
    expect(db.saveRadioStation).not.toHaveBeenCalled();
  });
});
