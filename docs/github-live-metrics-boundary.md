# Verified GitHub Metrics Boundary

The repository metrics surface must read public GitHub repository data from the GitHub REST API for `EDGEGlobe-lab/geo-midi-controller-app`. It may show only values returned by the API at query time and must identify the retrieval time.

During the initial implementation check on 2026-08-21, the public repository endpoint reported **1 star**, **0 forks**, and **1 subscriber**. These values are observations, not product targets, and will change only when GitHub reports a change.

The implementation must never generate, inflate, seed, animate as if live, or label target values as repository stars, forks, watchers/subscribers, branches, or tags. Branch and tag totals must come from pagination-aware GitHub list responses; where an exact count is not returned, the UI must state the scope or use a verified exact enumeration.

The public metrics route is read-only. It must not call any GitHub endpoint that creates stars, forks, follows, commits, subscriptions, releases, branches, tags, or other engagement actions.
