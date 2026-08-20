export const SOUND_ACCESS_NOTICE_VERSION = "PARKWAY-SOUND-ACCESS-v1";

export type SoundAccessState = "disabled" | "active" | "revoked";

export function createDisabledSoundAccessState(): SoundAccessState {
  return "disabled";
}

export function canActivateSoundAccess(input: {
  ownerUserId: number;
  actorUserId: number;
  state: SoundAccessState;
  consentGranted: boolean;
  noticeVersion: string;
}) {
  return input.ownerUserId === input.actorUserId
    && input.state === "disabled"
    && input.consentGranted
    && input.noticeVersion === SOUND_ACCESS_NOTICE_VERSION;
}

export function canRevokeSoundAccess(ownerUserId: number, actorUserId: number, state: SoundAccessState) {
  return ownerUserId === actorUserId && state === "active";
}
