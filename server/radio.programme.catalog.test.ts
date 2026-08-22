import { describe, expect, it } from "vitest";
import { getAdjacentStationProgramme, getStationProgrammes, parkwayRadioProgrammes, parkwayRadioStations } from "../shared/radioStationCatalog";

describe("PARKWAY interactive radio catalogue", () => {
  it("uses declared PARKWAY-original audio programmes for every station", () => {
    expect(parkwayRadioProgrammes.length).toBeGreaterThanOrEqual(parkwayRadioStations.length);
    parkwayRadioProgrammes.forEach((programme) => {
      expect(programme.creator).toBe("PARKWAY");
      expect(programme.rightsLabel).toBe("PARKWAY ORIGINAL");
      expect(programme.sourceUrl).toMatch(/^\/manus-storage\/geo-signal-project-\d+_[a-z0-9]+\.mp3$/);
      expect(parkwayRadioStations.some((station) => station.id === programme.stationId)).toBe(true);
    });
  });

  it("cycles each interactive station queue forward and backward without external stream sources", () => {
    const queue = getStationProgrammes("night-drive-fm");
    expect(queue).toHaveLength(2);
    expect(getAdjacentStationProgramme("night-drive-fm", queue[0]?.id ?? null, 1)?.id).toBe(queue[1]?.id);
    expect(getAdjacentStationProgramme("night-drive-fm", queue[0]?.id ?? null, -1)?.id).toBe(queue[1]?.id);
    expect(getAdjacentStationProgramme("night-drive-fm", queue[1]?.id ?? null, 1)?.id).toBe(queue[0]?.id);
  });
});
