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

type GitHubRepoResponse = {
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  subscribers_count: number;
};

type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

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
  if (!response.ok) throw new Error(`GitHub repository data is temporarily unavailable (${response.status})`);
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
