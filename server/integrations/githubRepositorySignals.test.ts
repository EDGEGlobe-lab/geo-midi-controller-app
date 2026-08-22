import { describe, expect, it, vi } from "vitest";
import {
  fetchGitHubRepositoryScaleSnapshot,
  fetchGitHubRepositorySignals,
  fetchGitHubRepositorySnapshot,
} from "./githubRepositorySignals";

const target = { owner: "EDGEGlobe-lab", repository: "geo-midi-controller-app" };

function createFetchMock(responses: Response[]): typeof fetch {
  const implementation = vi.fn(async () => {
    const response = responses.shift();
    if (!response) throw new Error("Unexpected fetch call");
    return response;
  });
  return implementation as unknown as typeof fetch;
}

function repositoryResponse(overrides: Partial<Record<string, unknown>> = {}): Response {
  return new Response(JSON.stringify({
    full_name: "EDGEGlobe-lab/geo-midi-controller-app",
    html_url: "https://github.com/EDGEGlobe-lab/geo-midi-controller-app",
    description: "Audio controller",
    homepage: "https://example.com",
    archived: false,
    fork: false,
    license: { spdx_id: "MIT", name: "MIT License" },
    default_branch: "main",
    language: "TypeScript",
    topics: ["audio", "midi"],
    stargazers_count: 12,
    forks_count: 3,
    subscribers_count: 4,
    open_issues_count: 2,
    created_at: "2026-08-20T00:00:00Z",
    updated_at: "2026-08-21T00:00:00Z",
    pushed_at: "2026-08-21T01:00:00Z",
    ...overrides,
  }), { status: 200 });
}

describe("GitHub repository signals integration", () => {
  it("maps observable repository signals and never manufactures list counts", async () => {
    const signals = await fetchGitHubRepositorySignals(target, {
      fetchImplementation: createFetchMock([repositoryResponse()]),
    });
    expect(signals).toMatchObject({
      fullName: "EDGEGlobe-lab/geo-midi-controller-app",
      stars: 12,
      forks: 3,
      subscribers: 4,
      branchCount: 0,
      tagCount: 0,
    });
  });

  it("returns public contributor, branch, and tag counts from endpoint responses", async () => {
    const snapshot = await fetchGitHubRepositorySnapshot(target, {
      fetchImplementation: createFetchMock([
        repositoryResponse(),
        new Response(JSON.stringify([
          { login: "alice", html_url: "https://github.com/alice", avatar_url: "https://avatars.example/alice", contributions: 8 },
          { login: "bob", html_url: "https://github.com/bob", avatar_url: "https://avatars.example/bob", contributions: 5 },
        ]), { status: 200 }),
        new Response(JSON.stringify([{}]), { status: 200, headers: { link: '<https://api.github.com/x?per_page=1&page=7>; rel="last"' } }),
        new Response(JSON.stringify([]), { status: 200 }),
      ]),
    });
    expect(snapshot.listedContributorContributions).toBe(13);
    expect(snapshot.repository.branchCount).toBe(7);
    expect(snapshot.repository.tagCount).toBe(0);
  });

  it("keeps verified branch and tag totals separate from configured planning ranges", async () => {
    const snapshot = await fetchGitHubRepositoryScaleSnapshot(target, {
      fetchImplementation: createFetchMock([
        repositoryResponse({ stargazers_count: 8 }),
        new Response(JSON.stringify([{}]), { status: 200, headers: { link: '<https://api.github.com/x?page=17>; rel="last"' } }),
        new Response(JSON.stringify([{}]), { status: 200, headers: { link: '<https://api.github.com/x?page=9>; rel="last"' } }),
      ]),
    });
    expect(snapshot.metrics.find(metric => metric.id === "stars")?.verifiedCount).toBe(8);
    expect(snapshot.metrics.find(metric => metric.id === "stars")?.targetMinimum).toBe(5_000);
    expect(snapshot.metrics.find(metric => metric.id === "branches")?.verifiedCount).toBe(17);
    expect(snapshot.metrics.find(metric => metric.id === "tags")?.verifiedCount).toBe(9);
  });

  it("fails clearly when GitHub returns a non-successful response", async () => {
    await expect(fetchGitHubRepositorySignals(target, {
      fetchImplementation: createFetchMock([new Response("Not Found", { status: 404, statusText: "Not Found" })]),
    })).rejects.toThrow("GitHub REST request failed (404 Not Found): Not Found");
  });
});
