import { describe, expect, it } from "vitest";
import { countGitHubCollection, getRepositoryMetricsWithFallback, normalizeRepositoryMetrics, PARKWAY_GITHUB_REPOSITORY, resetRepositoryMetricsCacheForTests } from "./githubRepositoryMetrics";

const response = (body: unknown) => new Response(JSON.stringify(body), { status: 200, headers: { "content-type": "application/json" } });

describe("GitHub repository metrics", () => {
  it("normalizes actual GitHub response fields without target-count fabrication", () => {
    const metrics = normalizeRepositoryMetrics({ html_url: "https://github.com/EDGEGlobe-lab/geo-midi-controller-app", stargazers_count: 1, forks_count: 0, subscribers_count: 1 }, { branches: 5, tags: 0, branchesExact: true, tagsExact: true }, "2026-08-22T00:00:00.000Z");
    expect(metrics).toMatchObject({ repository: PARKWAY_GITHUB_REPOSITORY, stars: 1, forks: 0, watchers: 1, branches: 5, tags: 0, branchesExact: true, tagsExact: true, source: "github-public-rest-api" });
    expect(metrics.stars).not.toBe(5_000);
  });

  it("counts paginated branch/tag rows exactly when the final page is short", async () => {
    const fetcher = async (url: string) => response(url.endsWith("&page=1") ? Array.from({ length: 100 }, () => ({ name: "x" })) : [{ name: "last" }]);
    await expect(countGitHubCollection(fetcher, "branches")).resolves.toEqual({ count: 101, exact: true });
  });

  it("returns a degraded cached snapshot rather than throwing on a GitHub 403", async () => {
    resetRepositoryMetricsCacheForTests();
    const liveFetcher = async (url: string) => response(url.endsWith("/repos/EDGEGlobe-lab/geo-midi-controller-app") ? { html_url: "https://github.com/EDGEGlobe-lab/geo-midi-controller-app", stargazers_count: 1, forks_count: 0, subscribers_count: 1 } : []);
    const first = await getRepositoryMetricsWithFallback(liveFetcher, 1_000);
    const limitedFetcher = async () => new Response("rate limited", { status: 403, headers: { "retry-after": "120" } });
    const second = await getRepositoryMetricsWithFallback(limitedFetcher, 1_001);
    expect(first.status).toBe("live");
    expect(second).toMatchObject({ status: "degraded", metrics: { stars: 1 }, retryAfterSeconds: 120 });
  });

  it("returns a calm degraded state without metrics when the first request is rate-limited", async () => {
    resetRepositoryMetricsCacheForTests();
    const limitedFetcher = async () => new Response("rate limited", { status: 403, headers: { "retry-after": "60" } });
    await expect(getRepositoryMetricsWithFallback(limitedFetcher, 1_000)).resolves.toMatchObject({ status: "degraded", metrics: null, retryAfterSeconds: 60 });
  });
});
