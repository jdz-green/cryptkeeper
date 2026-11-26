import assert from "node:assert/strict";
import test from "node:test";
import { scoreProject, verdict, WEIGHTS } from "../src/score.mjs";

const base = { daysSinceCommit: 10, commits180: 20, hasTests: true, hasCI: true, archivedMarker: null, todos: 0 };

test("a live project scores zero", () => {
  const { score, parts } = scoreProject(base);
  assert.equal(score, 0);
  assert.ok(parts.every((p) => p.points === 0));
  assert.equal(verdict(0), "alive");
});

test("a fully dead project scores 100", () => {
  const { score } = scoreProject({ daysSinceCommit: 900, commits180: 0, hasTests: false, hasCI: false, archivedMarker: "unmaintained", todos: 30 });
  assert.equal(score, 100);
  assert.equal(verdict(score), "tombstone");
});

test("every point is attributed to a weighted signal", () => {
  const { score, parts } = scoreProject({ ...base, daysSinceCommit: 200, todos: 5 });
  assert.equal(score, parts.reduce((n, p) => n + p.points, 0));
  assert.equal(parts.length, WEIGHTS.length);
  assert.equal(parts.find((p) => p.id === "age").points, 25);
  assert.equal(parts.find((p) => p.id === "todos").points, 2);
});

test("missing git data is treated as uncertain, not alive", () => {
  const { parts } = scoreProject({ ...base, daysSinceCommit: null, commits180: null });
  assert.equal(parts.find((p) => p.id === "age").points, 25);
  assert.equal(parts.find((p) => p.id === "activity").points, 10);
});

test("the score is clamped to 0..100", () => {
  const { score } = scoreProject({ daysSinceCommit: 9999, commits180: 0, hasTests: false, hasCI: false, archivedMarker: "archived", todos: 999 });
  assert.equal(score, 100);
});
