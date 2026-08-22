import { describe, expect, it, vi } from "vitest";
import {
  fetchGitHubRepositoryScaleSnapshot,
  fetchGitHubRepositorySignals,
  fetchGitHubRepositorySnapshot,
} from "./githubRepositorySignals";

const target = {
  owner: "EDGEGlobe-lab",
  repository: "geo-midi-controller-app",
};

function createFetchMock(responses: Response[]): typeof fetch {
  const implementation = vi.fn(async () => {
    const response = responses.shift();
    if (!response) throw new Error("Unexpected fetch call");
    return response;
  });

  return implementation as unknown as typeof fetch;
}

describe("GitHub repository signals integration", () => {
  it("maps observable repository signals and safely preserves public metadata", async () => {
    const fetchImplementation = createFetchMock([
      new Response(
        JSON.stringify({
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
        }),
        { status: 200 }
      ),
    ]);

    await expect(
      fetchGitHubRepositorySignals(target, {
        token: "test-token",
        fetchImplementation,
      })
    ).resolves.toEqual({
      fullName: "EDGEGlobe-lab/geo-midi-controller-app",
      htmlUrl: "https://github.com/EDGEGlobe-lab/geo-midi-controller-app",
      description: "Audio controller",
      homepageUrl: "https://example.com",
      isArchived: false,
      isFork: false,
      license: "MIT",
      defaultBranch: "main",
      primaryLanguage: "TypeScript",
      topics: ["audio", "midi"],
      stars: 12,
      forks: 3,
      subscribers: 4,
      openIssues: 2,
      createdAt: "2026-08-20T00:00:00Z",
      updatedAt: "2026-08-21T00:00:00Z",
      pushedAt: "2026-08-21T01:00:00Z",
    });
  });

  it("returns a repository snapshot with contributor totals limited to the endpoint result set", async () => {
    const fetchImplementation = createFetchMock([
      new Response(
        JSON.stringify({
          full_name: "EDGEGlobe-lab/geo-midi-controller-app",
          html_url: "https://github.com/EDGEGlobe-lab/geo-midi-controller-app",
          description: null,
          homepage: null,
          archived: false,
          fork: false,
          license: null,
          default_branch: "main",
          language: null,
          topics: [],
          stargazers_count: 0,
          forks_count: 0,
          subscribers_count: 1,
          open_issues_count: 0,
          created_at: "2026-08-20T00:00:00Z",
          updated_at: "2026-08-21T00:00:00Z",
          pushed_at: null,
        }),
        { status: 200 }
      ),
      new Response(
        JSON.stringify([
          {
            login: "alice",
            html_url: "https://github.com/alice",
            avatar_url: "https://avatars.example/alice",
            contributions: 8,
          },
          {
            login: "bob",
            html_url: "https://github.com/bob",
            avatar_url: "https://avatars.example/bob",
            contributions: 5,
          },
        ]),
        { status: 200 }
      ),
    ]);

    const snapshot = await fetchGitHubRepositorySnapshot(target, {
      fetchImplementation,
    });

    expect(snapshot.contributors).toEqual([
      {
        login: "alice",
        profileUrl: "https://github.com/alice",
        avatarUrl: "https://avatars.example/alice",
        contributions: 8,
      },
      {
        login: "bob",
        profileUrl: "https://github.com/bob",
        avatarUrl: "https://avatars.example/bob",
        contributions: 5,
      },
    ]);
    expect(snapshot.listedContributorContributions).toBe(13);
    expect(snapshot.contributorScope).toBe(
      "Top 100 contributors returned by GitHub's public contributors endpoint"
    );
  });

  it("fails clearly when GitHub returns a non-successful response", async () => {
    const fetchImplementation = createFetchMock([
      new Response("Not Found", { status: 404, statusText: "Not Found" }),
    ]);

    await expect(
      fetchGitHubRepositorySignals(target, { fetchImplementation })
    ).rejects.toThrow("GitHub REST request failed (404 Not Found): Not Found");
  });

  it("keeps verified branch and tag totals separate from configured target ranges", async () => {
    const repository = {
      full_name: "EDGEGlobe-lab/geo-midi-controller-app",
      html_url: "https://github.com/EDGEGlobe-lab/geo-midi-controller-app",
      description: null,
      homepage: null,
      archived: false,
      fork: false,
      license: null,
      default_branch: "main",
      language: "TypeScript",
      topics: [],
      stargazers_count: 8,
      forks_count: 4,
      subscribers_count: 2,
      open_issues_count: 0,
      created_at: "2026-08-20T00:00:00Z",
      updated_at: "2026-08-21T00:00:00Z",
      pushed_at: null,
    };
    const snapshot = await fetchGitHubRepositoryScaleSnapshot(target, {
      fetchImplementation: createFetchMock([
        new Response(JSON.stringify(repository), { status: 200 }),
        new Response(JSON.stringify([{}]), {
          status: 200,
          headers: { link: '<https://api.github.com/x?page=17>; rel="last"' },
        }),
        new Response(JSON.stringify([{}]), {
          status: 200,
          headers: { link: '<https://api.github.com/x?page=9>; rel="last"' },
        }),
      ]),
    });
    expect(
      snapshot.metrics.find(metric => metric.id === "stars")?.verifiedCount
    ).toBe(8);
    expect(
      snapshot.metrics.find(metric => metric.id === "stars")?.targetMinimum
    ).toBe(5_000);
    expect(
      snapshot.metrics.find(metric => metric.id === "branches")?.verifiedCount
    ).toBe(17);
    expect(
      snapshot.metrics.find(metric => metric.id === "tags")?.verifiedCount
    ).toBe(9);
  });
});
