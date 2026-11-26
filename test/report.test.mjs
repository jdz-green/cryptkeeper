import assert from "node:assert/strict";
import test from "node:test";
import { renderReport } from "../src/report.mjs";

const record = (name, days) => ({ name, path: `/tmp/${name}`, daysSinceCommit: days, commits180: 0, hasTests: false, hasCI: false, archivedMarker: null, todos: 0 });

test("the report is self-contained and sorts by death score", () => {
  const html = renderReport([record("alive", 5), record("dead", 900)]);
  assert.match(html, /^<!doctype html>/);
  assert.ok(!/https?:\/\//.test(html), "no external assets");
  const dead = html.indexOf(">dead<");
  const alive = html.indexOf(">alive<");
  assert.ok(dead >= 0 && alive >= 0 && dead < alive, "dead projects come first");
});

test("project-provided text is escaped", () => {
  const html = renderReport([{ ...record("x", 900), name: '<script>alert(1)</script>', path: '/tmp/a"b' }]);
  assert.ok(!html.includes("<script>alert(1)</script>"));
  assert.ok(html.includes("&lt;script&gt;alert(1)&lt;/script&gt;"));
});

test("the same records render the same report", () => {
  const records = [record("a", 400), record("b", 2)];
  assert.equal(renderReport(records), renderReport(records));
});
