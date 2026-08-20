import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

vi.mock("./db", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./db")>();
  return {
    ...actual,
    createHardwareRegistration: vi.fn(),
    getHardwareRegistration: vi.fn(),
    activateHardwareRegistration: vi.fn(),
    revokeHardwareRegistration: vi.fn(),
  };
});

import * as db from "./db";
import { SOUND_ACCESS_NOTICE_VERSION } from "./hardwareAccess";
import { appRouter } from "./routers";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;
const user = (id: number): AuthenticatedUser => ({ id, openId: `user-${id}`, email: `user-${id}@example.com`, name: `User ${id}`, loginMethod: "manus", role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() });
const contextFor = (userValue: AuthenticatedUser | null): TrpcContext => ({ user: userValue, req: { protocol: "https", headers: {} } as TrpcContext["req"], res: {} as TrpcContext["res"] });
const disabledRegistration = { id: 41, ownerUserId: 1, label: "Desk Mac", category: "computer" as const, productReference: "Mac mini", activationState: "disabled" as const, consentNoticeVersion: null, consentedAt: null, revokedAt: null, createdAt: new Date(), updatedAt: new Date() };
const activeRegistration = { ...disabledRegistration, activationState: "active" as const, consentNoticeVersion: SOUND_ACCESS_NOTICE_VERSION, consentedAt: new Date() };

describe("hardware router", () => {
  beforeEach(() => vi.clearAllMocks());

  it("denies hardware records and mutations to unauthenticated callers", async () => {
    const caller = appRouter.createCaller(contextFor(null));
    await expect(caller.hardware.list()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(caller.hardware.register({ label: "Desk Mac", category: "computer" })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(caller.hardware.activate({ registrationId: 41, consentGranted: true, noticeVersion: SOUND_ACCESS_NOTICE_VERSION })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(caller.hardware.revoke({ registrationId: 41 })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("creates every device registration disabled and owner-scoped", async () => {
    vi.mocked(db.createHardwareRegistration).mockImplementation(async (record) => ({ id: 41, ...record }) as any);
    await appRouter.createCaller(contextFor(user(1))).hardware.register({ label: "Desk Mac", category: "computer", productReference: "Mac mini" });
    expect(db.createHardwareRegistration).toHaveBeenCalledWith(expect.objectContaining({ ownerUserId: 1, activationState: "disabled", consentNoticeVersion: null, consentedAt: null, revokedAt: null }));
  });

  it("rejects activation without explicit consent before reading a registration", async () => {
    const caller = appRouter.createCaller(contextFor(user(1)));
    await expect(caller.hardware.activate({ registrationId: 41, consentGranted: false, noticeVersion: SOUND_ACCESS_NOTICE_VERSION } as any)).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(db.getHardwareRegistration).not.toHaveBeenCalled();
  });

  it("activates only a caller-owned disabled registration after current-notice consent", async () => {
    vi.mocked(db.getHardwareRegistration).mockImplementation(async (ownerUserId) => ownerUserId === 1 ? disabledRegistration : undefined);
    vi.mocked(db.activateHardwareRegistration).mockResolvedValue({ registrationId: 41, activationState: "active", consentedAt: new Date() });
    const caller = appRouter.createCaller(contextFor(user(1)));
    await expect(caller.hardware.activate({ registrationId: 41, consentGranted: true, noticeVersion: SOUND_ACCESS_NOTICE_VERSION })).resolves.toMatchObject({ activationState: "active" });
    expect(db.getHardwareRegistration).toHaveBeenCalledWith(1, 41);
    expect(db.activateHardwareRegistration).toHaveBeenCalledWith(1, 41, expect.objectContaining({ ownerUserId: 1, event: "granted", noticeVersion: SOUND_ACCESS_NOTICE_VERSION }));
    await expect(appRouter.createCaller(contextFor(user(2))).hardware.activate({ registrationId: 41, consentGranted: true, noticeVersion: SOUND_ACCESS_NOTICE_VERSION })).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("revokes only a caller-owned active registration", async () => {
    vi.mocked(db.getHardwareRegistration).mockImplementation(async (ownerUserId) => ownerUserId === 1 ? activeRegistration : undefined);
    vi.mocked(db.revokeHardwareRegistration).mockResolvedValue({ registrationId: 41, activationState: "revoked", revokedAt: new Date() });
    await expect(appRouter.createCaller(contextFor(user(1))).hardware.revoke({ registrationId: 41 })).resolves.toMatchObject({ activationState: "revoked" });
    expect(db.revokeHardwareRegistration).toHaveBeenCalledWith(1, 41, expect.objectContaining({ event: "revoked", ownerUserId: 1 }));
    await expect(appRouter.createCaller(contextFor(user(2))).hardware.revoke({ registrationId: 41 })).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});
