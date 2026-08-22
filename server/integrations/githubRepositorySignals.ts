const GITHUB_API_URL = "https://api.github.com";
const GITHUB_API_VERSION = "2026-03-10";
const GITHUB_OWNER_OR_REPOSITORY_PATTERN = /^[A-Za-z0-9_.-]+$/;

export type GitHubRepositoryTarget = {
  owner: string;
  repository: string;
};

export type GitHubRepositorySignals = {
  fullName: string;
  htmlUrl: string;
  description: string | null;
  homepageUrl: string | null;
  isArchived: boolean;
  isFork: boolean;
  license: string | null;
  defaultBranch: string;
  primaryLanguage: string | null;
  topics: string[];
  stars: number;
  forks: number;
  subscribers: number;
  openIssues: number;
  createdAt: string;
  updatedAt: string;
  pushedAt: string | null;
};

export type GitHubContributorSignal = {
  login: string;
  profileUrl: string;
  avatarUrl: string;
  contributions: number;
};

export type GitHubRepositorySnapshot = {
  repository: GitHubRepositorySignals;
  contributors: GitHubContributorSignal[];
  listedContributorContributions: number;
  contributorScope: "Top 100 contributors returned by GitHub's public contributors endpoint";
  retrievedAt: string;
};

export type GitHubRepositoryScaleMetric = {
  id: "stars" | "forks" | "watchers" | "branches" | "tags";
  label: string;
  verifiedCount: number;
  targetMinimum: number;
  targetMaximum: number;
  source: string;
};

export type GitHubRepositoryScaleSnapshot = {
  fullName: string;
  htmlUrl: string;
  metrics: GitHubRepositoryScaleMetric[];
  retrievedAt: string;
};

const GITHUB_METRIC_TARGETS = {
  stars: { label: "Stars", minimum: 5_000, maximum: 5_000_000 },
  forks: { label: "Forks", minimum: 27_900, maximum: 300_000_000 },
  watchers: { label: "Watching", minimum: 67_900, maximum: 12_000_000_000 },
  branches: { label: "Branches", minimum: 1_700, maximum: 100_000 },
  tags: { label: "Tags", minimum: 25_000, maximum: 70_000_000_000 },
} as const;

type GitHubRepositoryResponse = {
  full_name: string;
  html_url: string;
  description: string | null;
  homepage: string | null;
  archived: boolean;
  fork: boolean;
  license: { spdx_id: string | null; name: string } | null;
  default_branch: string;
  language: string | null;
  topics?: unknown;
  stargazers_count: number;
  forks_count: number;
  subscribers_count: number;
  open_issues_count: number;
  created_at: string;
  updated_at: string;
  pushed_at: string | null;
};

type GitHubContributorResponse = {
  login: string;
  html_url: string;
  avatar_url: string;
  contributions: number;
};

type FetchLike = typeof fetch;

function assertTargetIsSafe({
  owner,
  repository,
}: GitHubRepositoryTarget): void {
  if (
    !GITHUB_OWNER_OR_REPOSITORY_PATTERN.test(owner) ||
    !GITHUB_OWNER_OR_REPOSITORY_PATTERN.test(repository)
  ) {
    throw new Error(
      "GitHub owner and repository names may contain only letters, numbers, periods, hyphens, and underscores"
    );
  }
}

function createHeaders(token?: string): HeadersInit {
  return {
    accept: "application/vnd.github+json",
    "x-github-api-version": GITHUB_API_VERSION,
    "user-agent": "geo-midi-controller-app",
    ...(token ? { authorization: `Bearer ${token}` } : {}),
  };
}

async function readResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      `GitHub REST request failed (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
    );
  }

  return response.json() as Promise<T>;
}

function countPaginatedCollection(response: Response, items: unknown[]) {
  const linkHeader = response.headers.get("link") ?? "";
  const lastPage = /[?&]page=(\d+)[^>]*>;\s*rel="last"/i.exec(linkHeader)?.[1];
  return lastPage ? Number(lastPage) : items.length;
}

async function fetchGitHubCollectionCount(
  target: GitHubRepositoryTarget,
  collection: "branches" | "tags",
  options: { token?: string; fetchImplementation?: FetchLike }
) {
  const fetchImplementation = options.fetchImplementation ?? fetch;
  const response = await fetchImplementation(
    `${GITHUB_API_URL}/repos/${encodeURIComponent(target.owner)}/${encodeURIComponent(target.repository)}/${collection}?per_page=1`,
    { headers: createHeaders(options.token) }
  );
  const payload = await readResponse<unknown[]>(response);
  return countPaginatedCollection(response, payload);
}

/**
 * Retrieves public repository metadata and observable engagement signals from
 * GitHub's REST API. It does not create stars, forks, follows, commits, or any
 * other engagement action, and it does not claim to reproduce GitHub ranking.
 */
export async function fetchGitHubRepositorySignals(
  target: GitHubRepositoryTarget,
  options: { token?: string; fetchImplementation?: FetchLike } = {}
): Promise<GitHubRepositorySignals> {
  assertTargetIsSafe(target);
  const fetchImplementation = options.fetchImplementation ?? fetch;
  const response = await fetchImplementation(
    `${GITHUB_API_URL}/repos/${encodeURIComponent(target.owner)}/${encodeURIComponent(target.repository)}`,
    { headers: createHeaders(options.token) }
  );
  const payload = await readResponse<GitHubRepositoryResponse>(response);

  return {
    fullName: payload.full_name,
    htmlUrl: payload.html_url,
    description: payload.description,
    homepageUrl: payload.homepage,
    isArchived: payload.archived,
    isFork: payload.fork,
    license: payload.license?.spdx_id ?? payload.license?.name ?? null,
    defaultBranch: payload.default_branch,
    primaryLanguage: payload.language,
    topics: Array.isArray(payload.topics)
      ? payload.topics.filter(
          (topic): topic is string => typeof topic === "string"
        )
      : [],
    stars: payload.stargazers_count,
    forks: payload.forks_count,
    subscribers: payload.subscribers_count,
    openIssues: payload.open_issues_count,
    createdAt: payload.created_at,
    updatedAt: payload.updated_at,
    pushedAt: payload.pushed_at,
  };
}

/**
 * Retrieves up to 100 contributor summaries exposed by GitHub's REST API.
 * GitHub describes the `contributions` value as the contributor's number of
 * commits to the repository, so it is kept separate from stars and forks.
 */
export async function fetchGitHubContributorSignals(
  target: GitHubRepositoryTarget,
  options: { token?: string; fetchImplementation?: FetchLike } = {}
): Promise<GitHubContributorSignal[]> {
  assertTargetIsSafe(target);
  const fetchImplementation = options.fetchImplementation ?? fetch;
  const response = await fetchImplementation(
    `${GITHUB_API_URL}/repos/${encodeURIComponent(target.owner)}/${encodeURIComponent(target.repository)}/contributors?per_page=100&anon=false`,
    { headers: createHeaders(options.token) }
  );
  const payload = await readResponse<GitHubContributorResponse[]>(response);

  return payload.map(contributor => ({
    login: contributor.login,
    profileUrl: contributor.html_url,
    avatarUrl: contributor.avatar_url,
    contributions: contributor.contributions,
  }));
}

/**
 * Produces a read-only snapshot for repository-health reporting. The listed
 * contributor total covers only the contributor records returned by GitHub's
 * top-100 endpoint; it is not an all-time account contribution score.
 */
export async function fetchGitHubRepositorySnapshot(
  target: GitHubRepositoryTarget,
  options: { token?: string; fetchImplementation?: FetchLike } = {}
): Promise<GitHubRepositorySnapshot> {
  const [repository, contributors] = await Promise.all([
    fetchGitHubRepositorySignals(target, options),
    fetchGitHubContributorSignals(target, options),
  ]);

  return {
    repository,
    contributors,
    listedContributorContributions: contributors.reduce(
      (total, contributor) => total + contributor.contributions,
      0
    ),
    contributorScope:
      "Top 100 contributors returned by GitHub's public contributors endpoint",
    retrievedAt: new Date().toISOString(),
  };
}

/** Reads observable totals; target ranges remain planning configuration only. */
export async function fetchGitHubRepositoryScaleSnapshot(
  target: GitHubRepositoryTarget,
  options: { token?: string; fetchImplementation?: FetchLike } = {}
): Promise<GitHubRepositoryScaleSnapshot> {
  const [repository, branches, tags] = await Promise.all([
    fetchGitHubRepositorySignals(target, options),
    fetchGitHubCollectionCount(target, "branches", options),
    fetchGitHubCollectionCount(target, "tags", options),
  ]);
  const values = {
    stars: repository.stars,
    forks: repository.forks,
    watchers: repository.subscribers,
    branches,
    tags,
  } as const;
  return {
    fullName: repository.fullName,
    htmlUrl: repository.htmlUrl,
    metrics: (
      Object.keys(GITHUB_METRIC_TARGETS) as Array<
        keyof typeof GITHUB_METRIC_TARGETS
      >
    ).map(id => ({
      id,
      label: GITHUB_METRIC_TARGETS[id].label,
      verifiedCount: values[id],
      targetMinimum: GITHUB_METRIC_TARGETS[id].minimum,
      targetMaximum: GITHUB_METRIC_TARGETS[id].maximum,
      source:
        id === "branches" || id === "tags"
          ? `GitHub REST ${id} list`
          : "GitHub repository metadata",
    })),
    retrievedAt: new Date().toISOString(),
  };
}
