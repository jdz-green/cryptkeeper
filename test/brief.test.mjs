import assert from "node:assert/strict";
import test from "node:test";
import { briefFor } from "../src/brief.mjs";

const project = { name: "old", path: "/tmp/old", daysSinceCommit: 800, commits180: 0, hasTests: false, hasCI: false, archivedMarker: "archived", todos: 12 };

test("the brief states a verdict, the top causes and the smallest step", () => {
  const text = briefFor(project);
  assert.match(text, /^# old/);
  assert.match(text, /tombstone/);
  assert.match(text, /Smallest credible revival/);
  assert.match(text, /no test directory found/);
});

test("the brief is deterministic", () => {
  assert.equal(briefFor(project), briefFor(project));
});
