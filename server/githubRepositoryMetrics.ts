export const PARKWAY_GITHUB_REPOSITORY = "EDGEGlobe-lab/geo-midi-controller-app";
const GITHUB_API_ROOT = "https://api.github.com";
const PAGE_SIZE = 100;
const MAX_COUNT_PAGES = 100;

export type RepositoryMetrics = {
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

export type RepositoryMetricsResult = {
  status: "live" | "degraded";
  metrics: RepositoryMetrics | null;
  message?: string;
  retryAfterSeconds?: number;
};

type GitHubRepoResponse = {
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  subscribers_count: number;
};

type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

export class GitHubRepositoryMetricsError extends Error {
  constructor(public status: number, public retryAfterSeconds?: number) {
    super(`GitHub repository data is temporarily unavailable (${status})`);
  }
}

let latestVerifiedMetrics: RepositoryMetrics | null = null;
let nextLiveAttemptAt = 0;

const asNonNegativeInteger = (value: unknown) => typeof value === "number" && Number.isFinite(value) && value >= 0 ? Math.floor(value) : 0;

export function normalizeRepositoryMetrics(repo: GitHubRepoResponse, counts: { branches: number; tags: number; branchesExact: boolean; tagsExact: boolean }, refreshedAt = new Date().toISOString()): RepositoryMetrics {
  return {
    repository: PARKWAY_GITHUB_REPOSITORY,
    repositoryUrl: repo.html_url,
    stars: asNonNegativeInteger(repo.stargazers_count),
    forks: asNonNegativeInteger(repo.forks_count),
    watchers: asNonNegativeInteger(repo.subscribers_count),
    branches: asNonNegativeInteger(counts.branches),
    tags: asNonNegativeInteger(counts.tags),
    branchesExact: counts.branchesExact,
    tagsExact: counts.tagsExact,
    refreshedAt,
    source: "github-public-rest-api",
  };
}

async function getJson<T>(fetcher: FetchLike, path: string) {
  const response = await fetcher(`${GITHUB_API_ROOT}${path}`, {
    headers: { Accept: "application/vnd.github+json", "User-Agent": "PARKWAY-Music-Studio" },
  });
  if (!response.ok) {
    const retryAfterHeader = Number(response.headers.get("retry-after"));
    const rateLimitReset = Number(response.headers.get("x-ratelimit-reset"));
    const retryAfterSeconds = Number.isFinite(retryAfterHeader) && retryAfterHeader > 0
      ? Math.ceil(retryAfterHeader)
      : Number.isFinite(rateLimitReset) && rateLimitReset > 0
        ? Math.max(1, Math.ceil(rateLimitReset - Date.now() / 1000))
        : undefined;
    throw new GitHubRepositoryMetricsError(response.status, retryAfterSeconds);
  }
  return response.json() as Promise<T>;
}

export async function countGitHubCollection(fetcher: FetchLike, collection: "branches" | "tags") {
  let count = 0;
  for (let page = 1; page <= MAX_COUNT_PAGES; page += 1) {
    const rows = await getJson<unknown[]>(fetcher, `/repos/${PARKWAY_GITHUB_REPOSITORY}/${collection}?per_page=${PAGE_SIZE}&page=${page}`);
    count += rows.length;
    if (rows.length < PAGE_SIZE) return { count, exact: true };
  }
  return { count, exact: false };
}

export async function getLiveRepositoryMetrics(fetcher: FetchLike = fetch): Promise<RepositoryMetrics> {
  const [repo, branches, tags] = await Promise.all([
    getJson<GitHubRepoResponse>(fetcher, `/repos/${PARKWAY_GITHUB_REPOSITORY}`),
    countGitHubCollection(fetcher, "branches"),
    countGitHubCollection(fetcher, "tags"),
  ]);
  return normalizeRepositoryMetrics(repo, { branches: branches.count, tags: tags.count, branchesExact: branches.exact, tagsExact: tags.exact });
}

export async function getRepositoryMetricsWithFallback(fetcher: FetchLike = fetch, now = Date.now()): Promise<RepositoryMetricsResult> {
  if (nextLiveAttemptAt > now) {
    return { status: "degraded", metrics: latestVerifiedMetrics, message: "GitHub is temporarily rate-limited. Showing the latest verified snapshot when available.", retryAfterSeconds: Math.ceil((nextLiveAttemptAt - now) / 1000) };
  }
  try {
    const metrics = await getLiveRepositoryMetrics(fetcher);
    latestVerifiedMetrics = metrics;
    nextLiveAttemptAt = 0;
    return { status: "live", metrics };
  } catch (error) {
    const retryAfterSeconds = error instanceof GitHubRepositoryMetricsError && error.retryAfterSeconds ? error.retryAfterSeconds : 60;
    nextLiveAttemptAt = now + retryAfterSeconds * 1000;
    return { status: "degraded", metrics: latestVerifiedMetrics, message: "GitHub is temporarily unavailable or rate-limited. The DAW remains available; retry after the indicated wait.", retryAfterSeconds };
  }
}

export function resetRepositoryMetricsCacheForTests() {
  latestVerifiedMetrics = null;
  nextLiveAttemptAt = 0;
}
