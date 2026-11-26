# Resurrection, demonstrated

The Kiroween category is Resurrection, so the repository contains one: a project Cryptkeeper scored
**100/100 (tombstone)** was revived with Kiro CLI, and the same tool now scores it **10/100 (alive)**.

## Before

`demo/repos/tombstone-todo` — `demo/setup.sh` recreates it with a 2024 commit date:

```console
$ node src/cli.mjs scan demo/repos --now 2026-11-26T18:00:00Z
100  tombstone    tombstone-todo
 55  on the slab  fading-api
 10  alive        alive-tool
```

```console
$ node src/cli.mjs brief demo/repos --project tombstone-todo
# tombstone-todo
verdict: tombstone (death score 100/100)
- Last commit age: 907 days since the last commit (+40)
- Commits in the last 180 days: no commits in 180 days (+20)
- Tests present: no test directory found (+15)
...
## Smallest credible revival
Pick one user-visible outcome and rebuild only the path to it. Do not restore the build system first.
```

## The revival

The brief's rule was followed literally: one user-visible outcome, no stack rewrite. The prompt given
to Kiro CLI, in `demo/revival/todo-cli`:

> You are reviving an abandoned todo CLI. Smallest credible change, one user-visible outcome.
> Implement, with no dependencies: `add <text>` and `list`, persisting to `todos.json`; tests in
> `node:test`; a README with the two commands; `package.json` with `type: module`. Do not rewrite it
> in another language or add frameworks. When done, run the tests and report the result.

Kiro wrote `index.js`, `test/todo.test.mjs`, `package.json` and `README.md`, ran the tests, and
reported 3 passing. A CI workflow was then added, because the brief said the first revival commit
should add a one-command check.

## After

```console
$ node src/cli.mjs scan demo/revival --now 2026-11-26T18:00:00Z
 10  alive        todo-cli
```

Only one signal is left: a single commit in the last 180 days (+10), which is what a fresh revival
looks like. The tests, the CI workflow and the code all live in `demo/revival/todo-cli/`.

## What this is not

It is not a claim that the original todo CLI is worth reviving — that is the human's call, and the
brief says so. It is a demonstration that the loop closes: score → brief → smallest step → rescore.
