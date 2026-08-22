type RepositoryMetrics = {
  repository: string;
  repositoryUrl: string;
  stars: number;
  forks: number;
  watchers: number;
  branches: number;
  tags: number;
  branchesExact: boolean;
  tagsExact: boolean;
  refreshedAt: string;
  source: "github-public-rest-api";
};
type RepositoryMetricsResult = { status: "live" | "degraded"; metrics: RepositoryMetrics | null; message?: string; retryAfterSeconds?: number };

const formatter = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });
const exactLabel = (value: number, exact: boolean) => `${formatter.format(value)}${exact ? "" : "+"}`;

export function RepositoryMetricsPanel({ result, isLoading, isRefreshing, error, onRefresh }: { result?: RepositoryMetricsResult; isLoading: boolean; isRefreshing: boolean; error?: string; onRefresh: () => void }) {
  const metrics = result?.metrics;
  const refreshed = metrics ? new Date(metrics.refreshedAt).toLocaleString() : null;
  const retryLabel = result?.retryAfterSeconds ? ` Try again in about ${result.retryAfterSeconds}s.` : "";
  return <section className="repository-metrics-panel panel" aria-busy={isLoading || isRefreshing}>
    <div className="panel-header"><div><div className="section-kicker">REPOSITORY / LIVE DATA</div><h2>GitHub activity <span className="muted-slash">/</span> <span>actual public counts</span></h2></div><button className="outline-button outline-small" onClick={onRefresh} disabled={isLoading || isRefreshing}>{isRefreshing ? "Refreshing…" : "Refresh live data"}</button></div>
    <p className="repository-metrics-copy">Counts come directly from the GitHub public REST API when this workspace is opened or refreshed. Requested growth targets are not displayed as live values. Branch and tag totals are exact for a completed API pagination scan; a trailing <strong>+</strong> would mean the safe scan cap was reached.</p>
    {isLoading && <div className="repository-metrics-state">Loading current repository metrics…</div>}
    {(result?.status === "degraded" || error) && <div className="repository-metrics-state is-error"><strong>Live data temporarily unavailable.</strong><span>{result?.message ?? error}{retryLabel}</span><button className="text-button" onClick={onRefresh} disabled={Boolean(result?.retryAfterSeconds && result.retryAfterSeconds > 0)}>Try again</button></div>}
    {metrics && <><div className="repository-metrics-grid">
      <article><span>STARS</span><strong>{formatter.format(metrics.stars)}</strong><small>Public stargazers</small></article>
      <article><span>FORKS</span><strong>{formatter.format(metrics.forks)}</strong><small>Repository forks</small></article>
      <article><span>WATCHERS</span><strong>{formatter.format(metrics.watchers)}</strong><small>GitHub subscribers</small></article>
      <article><span>BRANCHES</span><strong>{exactLabel(metrics.branches, metrics.branchesExact)}</strong><small>{metrics.branchesExact ? "Complete scan" : "Safe-cap lower bound"}</small></article>
      <article><span>TAGS</span><strong>{exactLabel(metrics.tags, metrics.tagsExact)}</strong><small>{metrics.tagsExact ? "Complete scan" : "Safe-cap lower bound"}</small></article>
    </div><div className="repository-metrics-footer"><span>Source: GitHub public REST API · {result?.status === "degraded" ? "latest verified snapshot" : "refreshed"} {refreshed}</span><a href={metrics.repositoryUrl} target="_blank" rel="noreferrer">Open {metrics.repository} ↗</a></div></>}
  </section>;
}
