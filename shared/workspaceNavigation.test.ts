import { describe, expect, it } from "vitest";
import {
  isWorkspaceView,
  readWorkspaceView,
  withWorkspaceView,
} from "./workspaceNavigation";

describe("workspace navigation", () => {
  it("accepts declared workspace views and rejects unknown values", () => {
    expect(isWorkspaceView("Signals")).toBe(true);
    expect(isWorkspaceView("Unknown")).toBe(false);
  });

  it("reads safe deep-link values with a deterministic home fallback", () => {
    expect(readWorkspaceView("?view=Radio")).toBe("Radio");
    expect(readWorkspaceView("?view=unknown")).toBe("Arrangement");
    expect(readWorkspaceView("")).toBe("Arrangement");
  });

  it("preserves the current URL while replacing the workspace view", () => {
    expect(
      withWorkspaceView("https://example.test/?source=menu", "Signals")
    ).toBe("https://example.test/?source=menu&view=Signals");
  });
});
