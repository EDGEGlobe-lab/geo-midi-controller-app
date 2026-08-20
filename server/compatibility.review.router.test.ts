import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

vi.mock("./db", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./db")>();
  return { ...actual, createCompatibilityFeedback: vi.fn(), listCompatibilityFeedback: vi.fn(), listCompatibilityReviewEvents: vi.fn(), listAdminReviewers: vi.fn(), assignCompatibilityReviewer: vi.fn(), decideCompatibilityFeedback: vi.fn() };
});

import * as db from "./db";
import { appRouter } from "./routers";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;
const admin: AuthenticatedUser = { id: 41, openId: "review-admin", email: "admin@example.com", name: "Review Admin", loginMethod: "manus", role: "admin", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() };
const member: AuthenticatedUser = { ...admin, id: 42, openId: "review-member", role: "user" };
const contextFor = (user: AuthenticatedUser | null): TrpcContext => ({ user, req: { protocol: "https", headers: {} } as TrpcContext["req"], res: {} as TrpcContext["res"] });
const feedback = { deviceCategory: "phone" as const, browserFamily: "safari" as const, issueType: "audio-output" as const, osVersion: "17.6", message: "Radio preview remains muted after pressing Enable Stereo." };

describe("compatibility feedback and review router", () => {
  beforeEach(() => vi.clearAllMocks());

  it("accepts privacy-minimised feedback and rejects honeypot or secret-like content", async () => {
    vi.mocked(db.createCompatibilityFeedback).mockResolvedValue({ id: 9, ...feedback, status: "submitted", assignedReviewerUserId: null } as any);
    await expect(appRouter.createCaller(contextFor(null)).compatibility.submit(feedback)).resolves.toMatchObject({ id: 9, status: "submitted" });
    await expect(appRouter.createCaller(contextFor(null)).compatibility.submit({ ...feedback, message: "My password is s3cret" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await expect(appRouter.createCaller(contextFor(null)).compatibility.submit({ ...feedback, website: "bot" })).rejects.toBeTruthy();
  });

  it("denies review authority to non-administrators", async () => {
    const caller = appRouter.createCaller(contextFor(member));
    await expect(caller.compatibility.review.list()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.compatibility.review.assign({ feedbackId: 9, reviewerUserId: 41 })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.compatibility.review.decide({ feedbackId: 9, event: "approved" })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("allows authorized staff to list, assign, decide, and read an approval history", async () => {
    vi.mocked(db.listCompatibilityFeedback).mockResolvedValue([{ id: 9, status: "submitted" }] as any);
    vi.mocked(db.listAdminReviewers).mockResolvedValue([{ id: 41, name: "Review Admin", role: "admin" }] as any);
    vi.mocked(db.assignCompatibilityReviewer).mockResolvedValue({ feedbackId: 9, reviewerUserId: 41, status: "assigned", updatedAt: new Date() });
    vi.mocked(db.decideCompatibilityFeedback).mockResolvedValue({ feedbackId: 9, status: "approved", updatedAt: new Date() });
    vi.mocked(db.listCompatibilityReviewEvents).mockResolvedValue([{ feedbackId: 9, event: "assigned" }, { feedbackId: 9, event: "approved" }] as any);
    const caller = appRouter.createCaller(contextFor(admin));
    await expect(caller.compatibility.review.list()).resolves.toHaveLength(1);
    await expect(caller.compatibility.review.reviewers()).resolves.toHaveLength(1);
    await expect(caller.compatibility.review.assign({ feedbackId: 9, reviewerUserId: 41 })).resolves.toMatchObject({ status: "assigned" });
    await expect(caller.compatibility.review.decide({ feedbackId: 9, event: "approved", note: "Validated with a stable browser gesture." })).resolves.toMatchObject({ status: "approved" });
    await expect(caller.compatibility.review.history({ feedbackId: 9 })).resolves.toHaveLength(2);
    expect(db.assignCompatibilityReviewer).toHaveBeenCalledWith(41, 9, 41);
    expect(db.decideCompatibilityFeedback).toHaveBeenCalledWith(41, 9, "approved", "Validated with a stable browser gesture.");
  });
});
