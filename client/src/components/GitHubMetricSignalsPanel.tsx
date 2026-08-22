import { trpc } from "@/lib/trpc";
import { Activity, ExternalLink, RefreshCw, Target } from "lucide-react";

const formatCount = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export function GitHubMetricSignalsPanel() {
  const snapshot = trpc.github.repositoryScaleSnapshot.useQuery(undefined, {
    staleTime: 5 * 60_000,
    retry: false,
  });

  return (
    <section
      className="panel github-metric-panel"
      aria-labelledby="github-metric-heading"
    >
      <div className="panel-header">
        <div>
          <div className="section-kicker">
            <Activity size={13} /> GitHub repository signals / verified data
          </div>
          <h2 id="github-metric-heading">
            Live repository counts <span className="muted-slash">/</span>{" "}
            <span>separate targets</span>
          </h2>
        </div>
        <button
          className="outline-button outline-small"
          onClick={() => void snapshot.refetch()}
          disabled={snapshot.isFetching}
        >
          <RefreshCw
            size={13}
            className={snapshot.isFetching ? "animate-spin" : ""}
          />{" "}
          {snapshot.isFetching ? "Refreshing…" : "Refresh"}
        </button>
      </div>
      <p className="text-sm leading-6 text-muted-foreground">
        Verified values come from GitHub’s public API at refresh time. The
        requested large ranges below are clearly labelled planning targets, not
        generated engagement, live counts, or predictions.
      </p>
      {snapshot.isLoading ? (
        <p className="mt-5 text-sm">Reading public repository metrics…</p>
      ) : null}
      {snapshot.error ? (
        <p className="mt-5 text-sm text-red-300">
          GitHub data is temporarily unavailable: {snapshot.error.message}
        </p>
      ) : null}
      {snapshot.data ? (
        <>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {snapshot.data.metrics.map(metric => (
              <article
                key={metric.id}
                className="rounded-none border border-white/10 bg-black/20 p-3"
              >
                <span className="text-[10px] tracking-[0.14em] text-cyan-200">
                  VERIFIED · {metric.label.toUpperCase()}
                </span>
                <strong className="mt-2 block text-2xl tracking-tight">
                  {formatCount.format(metric.verifiedCount)}
                </strong>
                <small className="mt-1 block text-xs text-muted-foreground">
                  {metric.verifiedCount.toLocaleString()} from {metric.source}
                </small>
                <div className="mt-3 flex items-center gap-1 border-t border-white/10 pt-2 text-[10px] tracking-[0.09em] text-amber-200">
                  <Target size={12} /> TARGET RANGE
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {formatCount.format(metric.targetMinimum)} –{" "}
                  {formatCount.format(metric.targetMaximum)}
                </div>
              </article>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
            <span>
              Retrieved {new Date(snapshot.data.retrievedAt).toLocaleString()} ·
              Read-only public metrics; no stars, forks, watches, branches, or
              tags are created by this app.
            </span>
            <a
              className="inline-flex items-center gap-1 text-cyan-200 hover:text-cyan-100"
              href={snapshot.data.htmlUrl}
              target="_blank"
              rel="noreferrer"
            >
              Open repository <ExternalLink size={12} />
            </a>
          </div>
        </>
      ) : null}
    </section>
  );
}
