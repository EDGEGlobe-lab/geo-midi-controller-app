import { describe, expect, it } from "vitest";
import { getHardwareDevelopmentProfile, hardwareDevelopmentProfiles } from "../shared/hardwareDevelopmentProfiles";

describe("PARKWAY hardware development profiles", () => {
  it("provides local-first code templates for the requested equipment categories", () => {
    expect(hardwareDevelopmentProfiles.map((profile) => profile.id)).toEqual(expect.arrayContaining(["esp32", "microchip", "motherboard", "memory-reader"]));
    hardwareDevelopmentProfiles.forEach((profile) => {
      expect(profile.templateFilename).toMatch(/\.(ino|c|md)$/);
      expect(profile.template.length).toBeGreaterThan(40);
      expect(profile.localRequirement).toMatch(/local|PARKWAY does not/i);
    });
  });

  it("falls back to the safe ESP32 template for an unknown profile rather than exposing an arbitrary device target", () => {
    expect(getHardwareDevelopmentProfile("unknown-device").id).toBe("esp32");
  });
});
