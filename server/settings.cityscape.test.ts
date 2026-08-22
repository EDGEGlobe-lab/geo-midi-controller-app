import { describe, expect, it } from "vitest";
import { CITYSCAPE_LIMIT, constrainCityPosition, moveCityPosition } from "../client/src/lib/settingsCityscape";
import { updateSettingsMixerTrack } from "../client/src/lib/settingsMixer";

describe("PARKWAY local cityscape navigation", () => {
  it("constrains local display movement to the declared exploration boundary", () => {
    expect(constrainCityPosition({ x: 99, y: -99 })).toEqual({ x: CITYSCAPE_LIMIT, y: -CITYSCAPE_LIMIT });
  });

  it("moves within the local display boundary without external coordinate data", () => {
    expect(moveCityPosition({ x: CITYSCAPE_LIMIT, y: 0 }, { x: 1, y: 2 })).toEqual({ x: CITYSCAPE_LIMIT, y: 2 });
  });

  it("updates only the selected browser mixer channel within safe UI bounds", () => {
    expect(updateSettingsMixerTrack([{ id: "bass", level: 72, pan: 0 }, { id: "pad", level: 43, pan: -14 }], "bass", { level: 130, pan: -99 })).toEqual([{ id: "bass", level: 100, pan: -50 }, { id: "pad", level: 43, pan: -14 }]);
  });
});
