import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

describe("billing.checkout", () => {
  it("requires an authenticated user before creating a Stripe Checkout Session", async () => {
    const ctx: TrpcContext = {
      user: null,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };
    const caller = appRouter.createCaller(ctx);
    await expect(caller.billing.checkout({ productId: "asset-starter" })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
});
