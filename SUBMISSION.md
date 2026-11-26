# Kiroween 2026 submission copy (ready to paste)

**Category:** Resurrection — bring a dead technology back to life.

**Project name:** Cryptkeeper — which of your dead projects deserves the week?

**Elevator pitch (200 chars max):**
Cryptkeeper scans a folder of abandoned projects, scores how dead each one is with every point attributed to a signal, writes a revival brief an agent can act on, and renders a graveyard report.

**GitHub:** https://github.com/jdz-green/cryptkeeper
**Video:** (YouTube link once published)
**Demo command:** `node src/cli.mjs scan demo/repos --now 2026-11-26T00:00:00Z`

## Inspiration

Every developer has a folder of abandoned projects, and the expensive part is not reviving one — it is deciding *which* one deserves the week. Existing tools tell you a repo is stale; none of them turn "stale" into a decision with the reasoning attached, in a form an agent can pick up and act on.

Resurrection is the theme, so the dead things here are real: the demo folder holds a 900-day-old todo CLI, a fading weather API and a live tool, and the report is the graveyard.

## What it does

- `cryptkeeper scan <dir>` — walks the immediate subdirectories that look like projects, reads six signals, and prints a table sorted by death score (0–100), or the full records as JSON.
- `cryptkeeper brief <dir> --project <name>` — prints a deterministic resurrection brief: the verdict, the top three causes with their point values, the smallest credible revival step, what to check first, and what not to do.
- `cryptkeeper report <dir> --out <file.html>` — writes a self-contained graveyard: one tombstone per project, sorted by death score, with every point attributed.

The score is not a vibe: last commit age (40), commits in the last 180 days (20), no tests (15), no CI (10), README says archived (10), TODO/FIXME count (5). The weights live in one table, the report prints every contribution, and the brief tells an agent what to do next instead of dumping a dashboard.

## How I built it with Kiro

Built with **Kiro CLI 3.6.2** (free Builder ID). The `.kiro/` directory is part of the submission and is not scaffolding added afterwards:

- `.kiro/steering/product.md` and `tech.md` came first and fixed the rules: read-only scanning, no network in the scanner, deterministic output, no runtime dependencies, tests without a DOM.
- `.kiro/specs/cryptkeeper/{requirements,design,tasks}.md` — four testable requirements, the death-score table and module boundaries in design, and a task checklist the work followed.
- `.kiro/agents/cryptkeeper.json` — a custom agent whose `postToolUse` hook runs `node --test` after every write. That hook is why `scan.mjs` failed immediately on its first write (a helper was called before it existed) instead of three modules later.
- Kiro also corrected an assumption: I expected hook files under `.kiro/hooks/`; Kiro explained they live in agent configs under `.kiro/agents/`, which is what the repository now uses.

**The review that changed the code.** After the first green test run I asked Kiro to review `src/` against the spec and steering and list defects with `file:line` and a one-line fix. It returned five findings; four were applied:

1. `cli.mjs` scored each project twice — now computed once.
2. `scan.mjs` counted a *file* named `test` as a test directory — now `readdir(..., { withFileTypes: true })` and `isDirectory()`.
3. `report.mjs` called `verdict()` twice per row — now once, so the CSS class and the label cannot desync.
4. `cli.mjs` silently wrote `cryptkeeper-report.html` into the CWD when `--out` was missing — now `--out` is required, as the spec says.

One was rejected with a reason: Kiro proposed changing the "named project not found" exit code from `2` to `1`; the spec defines `2` as "nothing found", which is exactly this case, so the code keeps `2`. The rejection is recorded in `KIRO.md` rather than ignored.

## Challenges

- **Making the score honest.** A single "last commit age" signal is easy to game and often wrong (a stable library is not dead). Every signal had to be explainable in one sentence, and the brief had to say what to check before trusting the number — that is why the top three causes and their points are printed, not just the total.
- **Determinism.** The report and the brief are pure functions of the records so two runs can be diffed and a fixture can reproduce exactly. Git is read when available, and the unit tests run without it.
- **Bounded scanning.** 256 KiB per file and 200 files per project, so pointing it at a monorepo cannot hang the terminal.

## What's next

- A `cryptkeeper revive` step that hands the brief to a Kiro agent and produces a spec for the revival itself.
- Compare two scans of the same folder over time, so "I revived one and it is still alive" is measurable.
- More signals (dependency freshness, open issue age) behind the same weights table.

## Built with

Node.js, Kiro CLI, JSON, HTML/CSS, `node --test`.
