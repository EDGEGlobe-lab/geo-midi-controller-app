# Repository Observability and Cycle Detection

## Purpose

This implementation adds two verified cycle-detection utilities and a **read-only GitHub REST integration** for `EDGEGlobe-lab/geo-midi-controller-app`. It surfaces observable repository signals—stars, forks, subscribers, open issues, metadata, and listed contributor commits—without creating any artificial engagement or presenting a local calculation as a GitHub-controlled ranking.

> **No public GitHub “priority score” is implemented here.** GitHub documents repository-search sorting by relevance, stars, forks, and recency; its REST search documentation states that best-match ranking combines multiple factors. A single universal discovery formula is not published in those documents. [1] [2]

| Area                  | Module                                           | Outcome                                                    | Complexity / scope                                       |
| --------------------- | ------------------------------------------------ | ---------------------------------------------------------- | -------------------------------------------------------- |
| Linked-list cycles    | `shared/algorithms/cycleDetection.ts`            | Floyd’s tortoise-and-hare detection and cycle-entry lookup | `O(n)` time; `O(1)` auxiliary space                      |
| Directed-graph cycles | `shared/algorithms/cycleDetection.ts`            | DFS back-edge detection returning one closed cycle path    | `O(V + E)` time; `O(V)` auxiliary space                  |
| Repository signals    | `server/integrations/githubRepositorySignals.ts` | Typed, read-only repository and contributor snapshot       | Repository metadata plus up to 100 contributor records   |
| Application API       | `server/routers.ts`                              | `github.repositorySnapshot` typed query                    | Fixed to this public repository; no user-supplied target |

## Algorithm usage

The linked-list utility compares **node identity** rather than node values. It detects a cycle with two pointers moving at different speeds, then uses the meeting point to locate the cycle entry.

```ts
import {
  findLinkedListCycleEntry,
  hasLinkedListCycle,
  type LinkedListNode,
} from "@shared/algorithms/cycleDetection";

const first: LinkedListNode<string> = { value: "first", next: null };
const second: LinkedListNode<string> = { value: "second", next: null };
first.next = second;
second.next = first;

hasLinkedListCycle(first); // true
findLinkedListCycleEntry(first); // first
```

For directed dependency graphs, `findDirectedGraphCycle` returns a closed path that repeats the first vertex at the end. This supports meaningful diagnostics rather than a boolean-only failure.

```ts
import { findDirectedGraphCycle } from "@shared/algorithms/cycleDetection";

const dependencyGraph = new Map<string, readonly string[]>([
  ["load", ["mix"]],
  ["mix", ["render"]],
  ["render", ["mix"]],
]);

findDirectedGraphCycle(dependencyGraph); // ["mix", "render", "mix"]
```

## GitHub REST snapshot

The `github.repositorySnapshot` query uses the documented repository endpoint and contributor endpoint. GitHub’s repository response includes fields such as `stargazers_count`, `forks_count`, `topics`, `language`, and timestamps; the contributors endpoint is sorted by commits per contributor in descending order. [3]

| Snapshot field                                        | Source                | Meaning                                                      | Limitation                                            |
| ----------------------------------------------------- | --------------------- | ------------------------------------------------------------ | ----------------------------------------------------- |
| `stars`, `forks`, `subscribers`, `openIssues`         | Repository endpoint   | Current public repository-level signals                      | These are observations, not ranking weights           |
| `topics`, `description`, `primaryLanguage`, `license` | Repository endpoint   | Search context and project metadata                          | Metadata quality cannot guarantee discovery placement |
| `contributors`                                        | Contributors endpoint | Up to 100 listed contributors and each returned commit count | It is not a global account-contribution total         |
| `listedContributorContributions`                      | Local sum             | Sum of only the listed contributor records                   | It is intentionally not an engagement score           |

The integration keeps the optional `GITHUB_TOKEN` strictly on the server. Public resources can be queried without authentication, while a token can provide more reliable rate-limit headroom. The token is never returned through the typed application query. [3]

```env
# Optional. Keep this server-side and grant only the minimum permissions needed.
GITHUB_TOKEN=github_pat_...
```

A client can retrieve the snapshot through the existing typed API layer:

```ts
const snapshot = await trpc.github.repositorySnapshot.query();
```

## Legitimate visibility practices

GitHub’s documented repository sorting exposes explicit choices such as stars, forks, and recently updated. Default best-match search combines multiple factors. The appropriate way to improve relevance is to accurately describe and maintain the project, not to manufacture stars, forks, commits, or accounts. [1] [2]

| Allowed improvement      | Applied / recommended action                                                                      | Reason                                                          |
| ------------------------ | ------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Precise metadata         | Add accurate topics and retain a specific description                                             | Helps people and search filters understand the project category |
| Public documentation     | Keep installation, API, and algorithm usage examples current                                      | Reduces adoption friction for real users and contributors       |
| Discoverable maintenance | Publish meaningful releases and update the project when functionality changes                     | Keeps the repository’s actual recency and activity truthful     |
| Community onboarding     | Use issue templates and clearly scoped `good first issue` labels when work is genuinely available | Invites legitimate contributions without fabricating engagement |

No scheduled agent, bot, or API workflow has been configured to create stars, forks, follows, commits, issues, comments, or contributor activity. Such activity must remain voluntary and attributable to real users. This repository change is persistent once committed and pushed; any ongoing reporting should be explicitly configured with a user-selected cadence and destination.

## Verification

The implementation is covered by unit tests for empty, acyclic, self-cyclic, and multi-node linked lists; acyclic, cyclic, and disconnected directed graphs; GitHub REST response mapping; contributor-total scope; and REST error handling.

## References

[1]: https://docs.github.com/en/search-github/getting-started-with-searching-on-github/sorting-search-results "GitHub Docs: Sorting search results"
[2]: https://docs.github.com/en/rest/search/search#ranking-search-results "GitHub Docs: Ranking search results"
[3]: https://docs.github.com/en/rest/repos/repos "GitHub Docs: REST API endpoints for repositories"
