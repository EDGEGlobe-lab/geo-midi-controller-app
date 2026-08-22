import { trpc } from "@/lib/trpc";
import { Eye, GitBranch, GitFork, RefreshCw, Star, Tag } from "lucide-react";

const countFormat = new Intl.NumberFormat("en-US");

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
    {snapshot.isLoading ? <p className="muted-copy">Retrieving public repository data from GitHub…</p> : snapshot.error ? <div className="rounded-xl border border-red-400/50 bg-red-500/10 p-3 text-sm text-red-200">Verified metrics are currently unavailable: {snapshot.error.message}</div> : repository ? <>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {metrics.map(({ label, value, icon: Icon }) => <article key={label} className="rounded-xl border border-white/10 bg-white/[0.035] p-3"><Icon size={15} className="text-cyan-300" /><span className="mt-4 block text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">{label}</span><strong className="mt-1 block text-2xl tracking-tight text-white">{countFormat.format(value)}</strong></article>)}
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs leading-5 text-slate-400"><span>Read from GitHub’s public repository API at {snapshot.data?.retrievedAt ? new Date(snapshot.data.retrievedAt).toLocaleString() : "the current refresh"}.</span><a className="text-cyan-300 underline-offset-4 hover:underline" href={repository.htmlUrl} target="_blank" rel="noreferrer">Open repository</a></div>
      <p className="mt-3 text-xs leading-5 text-slate-500">“Watching” is GitHub’s public subscriber count. Branch and tag totals are read from GitHub’s paginated lists. This panel never creates stars, forks, watches, branches, tags, accounts, or other engagement.</p>
    </> : null}
  </section>;
}
