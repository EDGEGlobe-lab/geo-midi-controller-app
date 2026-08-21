import { describe, expect, it } from "vitest";
import { getLocalFlashingScaffold, localFlashingScaffoldArchives } from "../shared/localFlashingScaffolds";

describe("PARKWAY local flashing scaffold catalogue", () => {
  it("publishes reviewed ESP32 and Microchip ZIP packages through durable storage paths", () => {
    expect(localFlashingScaffoldArchives.map((archive) => archive.id)).toEqual(["esp32", "microchip"]);
    localFlashingScaffoldArchives.forEach((archive) => {
      expect(archive.archiveUrl).toMatch(/^\/manus-storage\/.+\.zip$/);
      expect(archive.filename).toMatch(/\.zip$/);
      expect(archive.localStep).toMatch(/local/i);
    });
  });

  it("does not expose an arbitrary hardware target when an unknown scaffold is requested", () => {
    expect(getLocalFlashingScaffold("unknown-device").id).toBe("esp32");
  });
});
