export const studioProducts = {
  "asset-starter": {
    id: "asset-starter",
    name: "PARKWAY Asset Starter",
    description: "One-time cloud asset-pack entitlement for the PARKWAY music studio.",
    mode: "payment" as const,
    currency: "usd",
    unitAmount: 2900,
  },
  "cloud-membership": {
    id: "cloud-membership",
    name: "PARKWAY Cloud Membership",
    description: "Monthly access to cloud studio workflows and media-library features.",
    mode: "subscription" as const,
    currency: "usd",
    unitAmount: 1200,
    interval: "month" as const,
  },
} as const;

export type StudioProductId = keyof typeof studioProducts;
