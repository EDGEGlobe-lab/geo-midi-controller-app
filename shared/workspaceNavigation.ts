export const workspaceViews = [
  "Arrangement",
  "Mixer",
  "Piano Roll",
  "Performance",
  "Studio",
  "Generator",
  "Signals",
  "Radio",
  "Product",
  "Devices",
  "Develop",
  "Assets",
  "History",
  "Feedback",
  "Review",
  "Contact",
] as const;

export type WorkspaceView = (typeof workspaceViews)[number];

export function isWorkspaceView(value: string | null): value is WorkspaceView {
  return workspaceViews.includes(value as WorkspaceView);
}

export function readWorkspaceView(search: string): WorkspaceView {
  const requested = new URLSearchParams(search).get("view");
  return isWorkspaceView(requested) ? requested : "Arrangement";
}

export function withWorkspaceView(url: string, view: WorkspaceView) {
  const nextUrl = new URL(url);
  nextUrl.searchParams.set("view", view);
  return nextUrl.toString();
}
