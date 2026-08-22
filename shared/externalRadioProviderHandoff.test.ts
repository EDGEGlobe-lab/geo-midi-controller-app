import { describe, expect, it } from "vitest";
import {
  externalRadioProviderHandoff,
  isSafeExternalRadioProviderHandoff,
} from "./externalRadioProviderHandoff";

describe("external radio provider handoff", () => {
  it("is an HTTPS user-initiated destination and never an embedded relay", () => {
    expect(isSafeExternalRadioProviderHandoff()).toBe(true);
    expect(externalRadioProviderHandoff).toMatchObject({
      autoplay: false,
      embedsThirdPartyStream: false,
      relaysThirdPartyAudio: false,
    });
  });
});
