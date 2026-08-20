import { describe, expect, it } from "vitest";
import { canActivateSoundAccess, canRevokeSoundAccess, createDisabledSoundAccessState, SOUND_ACCESS_NOTICE_VERSION } from "./hardwareAccess";

describe("hardware sound-access policy", () => {
  it("creates every registration in disabled state", () => {
    expect(createDisabledSoundAccessState()).toBe("disabled");
  });

  it("requires the owner, explicit consent, and the current notice before activation", () => {
    expect(canActivateSoundAccess({ ownerUserId: 7, actorUserId: 7, state: "disabled", consentGranted: true, noticeVersion: SOUND_ACCESS_NOTICE_VERSION })).toBe(true);
    expect(canActivateSoundAccess({ ownerUserId: 7, actorUserId: 8, state: "disabled", consentGranted: true, noticeVersion: SOUND_ACCESS_NOTICE_VERSION })).toBe(false);
    expect(canActivateSoundAccess({ ownerUserId: 7, actorUserId: 7, state: "disabled", consentGranted: false, noticeVersion: SOUND_ACCESS_NOTICE_VERSION })).toBe(false);
  });

  it("allows only the owner to revoke an active profile and never reactivates a revoked one", () => {
    expect(canRevokeSoundAccess(7, 7, "active")).toBe(true);
    expect(canRevokeSoundAccess(7, 8, "active")).toBe(false);
    expect(canActivateSoundAccess({ ownerUserId: 7, actorUserId: 7, state: "revoked", consentGranted: true, noticeVersion: SOUND_ACCESS_NOTICE_VERSION })).toBe(false);
  });
});
