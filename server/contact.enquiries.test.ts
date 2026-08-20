import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function anonymousContext(): TrpcContext {
  return { user: null, req: { protocol: "https", headers: {} } as TrpcContext["req"], res: {} as TrpcContext["res"] };
}

function memberContext(): TrpcContext {
  return {
    user: { id: 98765, openId: "non-owner", name: "Member", email: "member@example.com", loginMethod: "manus", role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("contact enquiries", () => {
  it("rejects honeypot submissions before storing an enquiry", async () => {
    const caller = appRouter.createCaller(anonymousContext());
    await expect(caller.contact.submit({
      name: "Test Client",
      email: "client@example.com",
      serviceInterest: "production",
      message: "I need help producing a new electronic music release.",
      paymentDetailsRequested: true,
      website: "https://spam.example",
    })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("requires authentication before an enquiry inbox can be listed", async () => {
    const caller = appRouter.createCaller(anonymousContext());
    await expect(caller.contact.inbox()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("rejects card-like fields instead of accepting or storing them", async () => {
    const caller = appRouter.createCaller(anonymousContext());
    await expect(caller.contact.submit({
      name: "Test Client",
      email: "client@example.com",
      serviceInterest: "production",
      message: "I need help producing a new electronic music release.",
      paymentDetailsRequested: true,
      cardNumber: "4242424242424242",
    } as any)).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("denies the enquiry inbox to an authenticated non-owner", async () => {
    const caller = appRouter.createCaller(memberContext());
    await expect(caller.contact.inbox()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
