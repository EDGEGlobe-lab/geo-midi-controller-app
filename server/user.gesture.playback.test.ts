import { describe, expect, it, vi } from "vitest";
import { startWithinUserGesture } from "../client/src/lib/userGesturePlayback";

describe("gesture-preserving media playback", () => {
  it("calls media play before asynchronous graph activation", async () => {
    const calls: string[] = [];
    const media = { play: vi.fn(async () => { calls.push("play"); }), pause: vi.fn(() => calls.push("pause")) };
    const enabled = vi.fn(async () => { calls.push("enable"); return true; });
    await expect(startWithinUserGesture(media, enabled)).resolves.toBe(true);
    expect(calls).toEqual(["play", "enable"]);
    expect(media.pause).not.toHaveBeenCalled();
  });

  it("pauses a pending start when the graph cannot be enabled", async () => {
    const media = { play: vi.fn(async () => undefined), pause: vi.fn() };
    await expect(startWithinUserGesture(media, async () => false)).resolves.toBe(false);
    expect(media.pause).toHaveBeenCalledTimes(1);
  });
});
