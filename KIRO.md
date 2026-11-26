# How Kiro was used

Cryptkeeper was built in Kiroween 2026 with **Kiro CLI 3.6.2** (free Builder ID, Google sign-in).

## What came from the spec, not from improvisation

1. `.kiro/steering/product.md` and `tech.md` were written first: read-only scanning, no network in
   the scanner, deterministic output, no runtime dependencies, tests without a DOM. Every later
   decision references those two files.
2. `.kiro/specs/cryptkeeper/requirements.md` names the four requirements (scan, brief, report,
   tests) with testable clauses; `design.md` fixes the death-score table and the module boundaries;
   `tasks.md` is the checklist the work followed.
3. `.kiro/agents/cryptkeeper.json` defines a custom agent whose `postToolUse` hook runs `node --test`
   after every write. That hook is why the test suite existed from the first module rather than at
   the end: a broken import failed immediately.

## The review that changed the code

After the first draft passed its tests, I asked Kiro to review `src/` against the spec and steering
and to list defects with `file:line` and a one-line fix. It returned five findings. Four were applied:

| finding | what changed |
|---|---|
| `cli.mjs` scored each project twice in `scan` | compute `scoreProject(p)` once and reuse it |
| `scan.mjs` treated a *file* named `test` as a test directory | `readdir(..., { withFileTypes: true })` and require `isDirectory()` |
| `report.mjs` called `verdict()` twice per row | compute the verdict once, so the CSS class and the label cannot desync |
| `cli.mjs` wrote `cryptkeeper-report.html` into the CWD when `--out` was missing | `--out` is required, as R3.1 says; missing it is a usage error |

One was rejected with a reason: Kiro proposed changing the "named project not found" exit code from
`2` to `1`. The spec defines `2` as "nothing found", and a named project that is absent is exactly
that, so the code keeps `2`. The rejection is recorded here rather than silently ignored.

## What the hook caught

The `postToolUse` test hook failed on the first write of `scan.mjs` because `hasTestScript()` was
called before it existed. Without the hook that would have surfaced much later, after the report and
the CLI were written on top of a broken scanner.

## Limits, stated honestly

Kiro wrote no production code unattended in this repository: the modules were written against the
spec, and Kiro was used for the review pass, the hook/agent configuration question (it corrected my
assumption that hooks live in `.kiro/hooks/`; they live under `.kiro/agents/`), and for the small
refactors above. The value was the spec-plus-review loop, not autocomplete.
