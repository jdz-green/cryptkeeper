import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { scanDir, isProject } from "../src/scan.mjs";

async function fixture() {
  const root = await mkdtemp(join(tmpdir(), "cryptkeeper-"));
  await mkdir(join(root, "proj", "test"), { recursive: true });
  await writeFile(join(root, "proj", "package.json"), JSON.stringify({ name: "p", scripts: { test: "node --test" } }));
  await writeFile(join(root, "proj", "test", "a.js"), "// TODO: one\n// FIXME: two\n");
  await mkdir(join(root, "not-a-project"));
  await writeFile(join(root, "not-a-project", "notes.txt"), "hi");
  return root;
}

test("only project-looking folders are scanned", async () => {
  const root = await fixture();
  assert.equal(await isProject(join(root, "proj")), true);
  assert.equal(await isProject(join(root, "not-a-project")), false);
  const projects = await scanDir(root, new Date("2026-11-26T00:00:00Z"));
  assert.equal(projects.length, 1);
  assert.equal(projects[0].name, "proj");
});

test("todos are counted and tests are detected without git", async () => {
  const root = await fixture();
  const [p] = await scanDir(root, new Date("2026-11-26T00:00:00Z"));
  assert.equal(p.todos, 2);
  assert.equal(p.hasTests, true);
  assert.equal(p.daysSinceCommit, null);
});
