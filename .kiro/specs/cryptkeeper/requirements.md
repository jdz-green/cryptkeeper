# Requirements

## R1 Scan
- R1.1 `cryptkeeper scan <dir>` walks immediate subdirectories that look like projects (have `.git`, `package.json`, `pyproject.toml`, `Cargo.toml`, or `go.mod`).
- R1.2 For each project, compute: last commit date, days since last commit, commit count in the last 180 days, TODO/FIXME count, presence of tests, presence of CI config, README "archived/unmaintained/deprecated" markers.
- R1.3 A project's death score is 0–100, explained by weighted signals; the weights live in one table and the report prints every contribution.

## R2 Brief
- R2.1 `cryptkeeper brief <dir> --project <name>` prints a resurrection brief: what the project is, why it died (signals), the smallest credible revival step, and what to check first.
- R2.2 The brief is deterministic text that an agent can consume; no LLM call inside the tool.

## R3 Report
- R3.1 `cryptkeeper report <dir> --out report.html` writes a self-contained HTML file: a graveyard, one tombstone per project, sorted by death score.
- R3.2 The report escapes all project-provided text and opens without a network.

## R4 Tests
- R4.1 Scoring, date math and escaping are covered by unit tests with fixed fixtures.
- R4.2 `node --test` passes with no network and no git binary present (fixtures are synthetic).
