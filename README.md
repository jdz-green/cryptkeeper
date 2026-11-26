# Cryptkeeper

[![test](https://github.com/jdz-green/cryptkeeper/actions/workflows/test.yml/badge.svg)](https://github.com/jdz-green/cryptkeeper/actions/workflows/test.yml)

Find the projects in your graveyard that are worth reviving, score how dead they are, and hand an
agent a brief it can act on.

```console
$ cryptkeeper scan ~/code
100  tombstone    todo-cli
 55  on the slab  fading-api
 10  alive        alive-tool

$ cryptkeeper brief ~/code --project todo-cli
# todo-cli
verdict: tombstone (death score 100/100)
...
## Smallest credible revival
Pick one user-visible outcome and rebuild only the path to it.
```

## Why

Every developer has a folder of abandoned projects. The expensive part is not reviving one, it is
deciding *which* one deserves the week. Cryptkeeper turns that decision into a number with every
point attributed to a signal you can check, and then writes the smallest credible revival step so an
agent (or you) can start without re-reading three years of commits.

## What it measures

| signal | points | why it matters |
|---|---|---|
| last commit age | 40 | the single strongest sign nobody is home |
| commits in the last 180 days | 20 | a burst of activity across a year reads different from silence |
| no tests | 15 | revival without a safety net is a rewrite |
| no CI | 10 | no one-command check means nobody else can verify a fix |
| README says archived / unmaintained | 10 | the author already answered the question |
| TODO/FIXME count | 5 | the cheapest map of what the author knew was missing |

0–19 alive · 20–44 fading · 45–69 on the slab · 70+ tombstone.

The scanner is language-agnostic: the demo includes a 2023 Python exporter (72/100) next to the
JavaScript CLI (100/100), a fading API (55/100) and a live tool (10/100).

## Commands

- `cryptkeeper scan <dir> [--json]` — a table sorted by death score, or the full records as JSON.
- `cryptkeeper brief <dir> --project <name>` — the revival brief for one project.
- `cryptkeeper report <dir> --out <file.html>` — a self-contained graveyard you can open offline.

Exit codes: `0` ok, `1` usage error, `2` nothing found.

## Design rules

- **Read-only.** The scanner never writes to the projects it reads.
- **No network, no LLM at runtime.** The brief is deterministic text, so an agent can consume it and
  two runs can be diffed. The intelligence is in the scoring and the brief, not in a hidden API call.
- **Every point explained.** The weights live in one table; the report prints each contribution.
- **Bounded work.** 256 KiB per file, 200 files per project, so scanning a monorepo cannot hang.

## Resurrection, demonstrated

The Kiroween category is Resurrection, so the repository contains one: a project scored **100/100**
was revived with Kiro CLI and now scores **10/100**. The before/after, the exact prompt and the
resulting code are in [demo/revival/README.md](demo/revival/README.md).

## Built with Kiro

This project is a Kiroween 2026 entry, built with Kiro CLI. The `.kiro/` directory is part of the
submission:

- `.kiro/specs/cryptkeeper/{requirements,design,tasks}.md` — the spec the code was built against.
- `.kiro/steering/{product,tech}.md` — the rules every change had to respect.
- `.kiro/agents/cryptkeeper.json` — a custom agent with a `postToolUse` hook that runs `node --test`
  after every file write, so a broken module is caught in the same step that wrote it.

Kiro's review of the first draft produced five concrete findings that were applied or rejected with a
reason; see [KIRO.md](KIRO.md).

## Build log

A longer write-up of how this was built with Kiro — the steering files, the hook that caught the first
bug, and the review that changed four things: https://bounty-desk-peer.neocities.org/blog/kiroween

## Development

```console
node --test          # 12 tests, no network, no git required for the unit tests
node src/cli.mjs scan demo --now 2026-11-26T00:00:00Z
```

`demo/setup.sh` recreates four synthetic projects (a 900-day-old tombstone, a fading API, a live tool) so the
report can be reproduced exactly.

License: MIT.
