export const MAX_FALLBACK_ATTEMPTS = 2;

export type FallbackDecision = "activate" | "paused" | "retry-limit" | "fallback-source-failed";

export function decideFallbackRecovery({ enabled, attempts, hasFallbackSource }: { enabled: boolean; attempts: number; hasFallbackSource: boolean }): FallbackDecision {
  if (!enabled) return "paused";
  if (hasFallbackSource) return "fallback-source-failed";
  if (attempts >= MAX_FALLBACK_ATTEMPTS) return "retry-limit";
  return "activate";
}

export function clearFallbackForManualSource() {
  return { fallbackSourceUrl: null, fallbackSelection: null } as const;
}
