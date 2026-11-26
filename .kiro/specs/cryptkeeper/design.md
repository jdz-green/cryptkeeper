# Design

## Modules
- `src/scan.mjs` — discover projects, read signals (fs only; git via `git log` when available, else fixture dates).
- `src/score.mjs` — the weights table and `scoreProject(record)`; pure.
- `src/brief.mjs` — `briefFor(record)`; pure text.
- `src/report.mjs` — `renderReport(records)`; pure string.
- `src/cli.mjs` — argument parsing, exit codes, wiring.

## Death score
| signal | weight | condition |
|---|---|---|
| last commit age | 40 | > 365d: 40, > 180d: 25, > 90d: 10 |
| activity | 20 | 0 commits in 180d: 20, < 5: 10 |
| tests | 15 | no test dir/files: 15 |
| CI | 10 | no CI config: 10 |
| README markers | 10 | archived/unmaintained/deprecated: 10 |
| TODOs | 5 | > 10: 5, > 3: 2 |

## Determinism
Dates come from git when available, else from a `--now` flag in tests. The report sorts by score desc, then name.

## Safety
The scanner opens files read-only and caps file reads (256 KiB per file, 200 files per project).
