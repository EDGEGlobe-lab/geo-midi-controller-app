import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

describe("studio.jobs", () => {
  it("protects job creation and transitions", async () => {
    const ctx: TrpcContext = {
      user: null,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };
    const caller = appRouter.createCaller(ctx);
    await expect(caller.studio.jobs.create({ projectKey: "night-drive-07", jobType: "music", prompt: "test" })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(caller.studio.jobs.transition({ jobId: 1, status: "running" })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
});
