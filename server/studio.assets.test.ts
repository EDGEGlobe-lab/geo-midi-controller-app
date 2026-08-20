import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

describe("studio.assets", () => {
  it("rejects cloud asset listing without an authenticated user", async () => {
    const ctx: TrpcContext = {
      user: null,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };
    const caller = appRouter.createCaller(ctx);
    await expect(caller.studio.assets.list({ projectKey: "night-drive-07" })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
});
