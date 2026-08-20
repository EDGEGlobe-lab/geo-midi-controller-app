export function isExpectedOperationAbort(error: unknown) {
  if (!(error instanceof Error)) return false;
  const message = error.message.toLowerCase();
  return error.name === "AbortError" || message.includes("operation was aborted") || message.includes("interrupted by a new load request");
}
