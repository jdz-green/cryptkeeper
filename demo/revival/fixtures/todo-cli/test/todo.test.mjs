import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { add, list } from "../index.js";

function tempDb() {
  const dir = mkdtempSync(join(tmpdir(), "todo-test-"));
  return { path: join(dir, "todos.json"), dir };
}

test("add then list returns the added item", () => {
  const { path, dir } = tempDb();
  try {
    add("buy milk", path);
    const todos = list(path);
    assert.equal(todos.length, 1);
    assert.equal(todos[0].text, "buy milk");
    assert.equal(todos[0].done, false);
  } finally {
    rmSync(dir, { recursive: true });
  }
});

test("list on empty store returns empty array", () => {
  const { path, dir } = tempDb();
  try {
    const todos = list(path);
    assert.deepEqual(todos, []);
  } finally {
    rmSync(dir, { recursive: true });
  }
});

test("todos persist as valid JSON", () => {
  const { path, dir } = tempDb();
  try {
    add("first", path);
    add("second", path);
    const raw = readFileSync(path, "utf8");
    const data = JSON.parse(raw);          // throws if invalid
    assert.equal(data.length, 2);
    assert.equal(data[0].text, "first");
    assert.equal(data[1].text, "second");
  } finally {
    rmSync(dir, { recursive: true });
  }
});
