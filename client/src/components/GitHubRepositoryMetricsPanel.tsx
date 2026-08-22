import { trpc } from "@/lib/trpc";
import { CheckCircle2, Clock3, Eye, GitBranch, GitFork, RefreshCw, Star, Tag, TriangleAlert } from "lucide-react";

const countFormat = new Intl.NumberFormat("en-US");

function formatRetrievedAt(timestamp?: string) {
  if (!timestamp) return "No successful retrieval yet";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "medium",
  }).format(new Date(timestamp));
}

export function GitHubRepositoryMetricsPanel() {
  const snapshot = trpc.github.repositorySnapshot.useQuery(undefined, {
    refetchOnWindowFocus: false,
    staleTime: 60_000,
  });

  const repository = snapshot.data?.repository;
  const metrics = repository ? [
    { label: "Stars", value: repository.stars, icon: Star },
    { label: "Forks", value: repository.forks, icon: GitFork },
    { label: "Watching", value: repository.subscribers, icon: Eye },
    { label: "Branches", value: repository.branchCount, icon: GitBranch },
    { label: "Tags", value: repository.tagCount, icon: Tag },
  ] : [];
  const retrievedAt = snapshot.data?.retrievedAt;
  const status = snapshot.isFetching
    ? { label: "Refreshing public GitHub data", detail: `Last successful retrieval: ${formatRetrievedAt(retrievedAt)}`, icon: RefreshCw, tone: "text-cyan-300", spin: true }
    : snapshot.error
      ? { label: "Retrieval needs attention", detail: `Last successful retrieval: ${formatRetrievedAt(retrievedAt)}`, icon: TriangleAlert, tone: "text-amber-300", spin: false }
      : retrievedAt
        ? { label: "Public GitHub data retrieved", detail: `Last refreshed: ${formatRetrievedAt(retrievedAt)}`, icon: CheckCircle2, tone: "text-emerald-300", spin: false }
        : { label: "Waiting for first retrieval", detail: "No successful retrieval yet", icon: Clock3, tone: "text-slate-300", spin: false };
  const StatusIcon = status.icon;

  return <section className="panel" aria-labelledby="github-metrics-title">
    <div className="panel-header">
      <div>
        <div className="section-kicker"><GitBranch size={13} /> Repository observability / public API</div>
        <h2 id="github-metrics-title">Verified repository signals <span className="muted-slash">/</span> <span>read only</span></h2>
      </div>
      <button className="outline-button outline-small" disabled={snapshot.isFetching} onClick={() => void snapshot.refetch()}>
        <RefreshCw size={13} className={snapshot.isFetching ? "animate-spin" : ""} /> {snapshot.isFetching ? "Refreshing" : "Refresh"}
      </button>
    </div>
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2.5 text-xs" role="status" aria-live="polite">
      <span className={`inline-flex items-center gap-2 font-medium ${status.tone}`}><StatusIcon size={15} className={status.spin ? "animate-spin" : ""} /> {status.label}</span>
      <time dateTime={retrievedAt} className="text-slate-300">{status.detail}</time>
    </div>
    {snapshot.isLoading ? <p className="muted-copy">Retrieving public repository data from GitHub…</p> : snapshot.error ? <div className="rounded-xl border border-red-400/50 bg-red-500/10 p-3 text-sm text-red-200">Verified metrics are currently unavailable: {snapshot.error.message}</div> : repository ? <>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {metrics.map(({ label, value, icon: Icon }) => <article key={label} className="rounded-xl border border-white/10 bg-white/[0.035] p-3"><Icon size={15} className="text-cyan-300" /><span className="mt-4 block text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">{label}</span><strong className="mt-1 block text-2xl tracking-tight text-white">{countFormat.format(value)}</strong></article>)}
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs leading-5 text-slate-400"><span>Counts are read from GitHub’s public repository API. The retrieval indicator above shows the server-recorded refresh time.</span><a className="text-cyan-300 underline-offset-4 hover:underline" href={repository.htmlUrl} target="_blank" rel="noreferrer">Open repository</a></div>
      <p className="mt-3 text-xs leading-5 text-slate-500">“Watching” is GitHub’s public subscriber count. Branch and tag totals are read from GitHub’s paginated lists. This panel never creates stars, forks, watches, branches, tags, accounts, or other engagement.</p>
    </> : null}
  </section>;
}
