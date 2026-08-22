import { describe, expect, it } from "vitest";
import { countGitHubCollection, normalizeRepositoryMetrics, PARKWAY_GITHUB_REPOSITORY } from "./githubRepositoryMetrics";

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
});
