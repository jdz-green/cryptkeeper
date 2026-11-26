// Discover project folders and read the signals the score needs. Read-only, no network.
import { readdir, readFile, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, basename } from "node:path";
import { execFileSync } from "node:child_process";

const PROJECT_MARKERS = [".git", "package.json", "pyproject.toml", "Cargo.toml", "go.mod"];
const TEST_HINTS = ["test", "tests", "__tests__", "spec", "specs"];
const CI_HINTS = [".github/workflows", ".gitlab-ci.yml", ".circleci", "azure-pipelines.yml", "Jenkinsfile"];
const MAX_FILE_BYTES = 256 * 1024;
const MAX_FILES = 200;

/** True when a folder looks like a project root. */
export async function isProject(dir) {
  for (const marker of PROJECT_MARKERS) {
    if (existsSync(join(dir, marker))) return true;
  }
  return false;
}

/** Last commit date and 180-day commit count, or nulls when git cannot answer. */
export function gitSignals(dir, now = new Date()) {
  try {
    const out = execFileSync("git", ["-C", dir, "log", "-1", "--format=%cI"], { encoding: "utf8", timeout: 5000 }).trim();
    if (!out) return { lastCommit: null, daysSinceCommit: null, commits180: null };
    const last = new Date(out);
    const days = Math.floor((now - last) / 86_400_000);
    let commits180 = null;
    try {
      const since = new Date(now.getTime() - 180 * 86_400_000).toISOString();
      const log = execFileSync("git", ["-C", dir, "log", `--since=${since}`, "--oneline"], { encoding: "utf8", timeout: 5000 }).trim();
      commits180 = log ? log.split("\n").length : 0;
    } catch {
      commits180 = null;
    }
    return { lastCommit: last.toISOString(), daysSinceCommit: days, commits180 };
  } catch {
    return { lastCommit: null, daysSinceCommit: null, commits180: null };
  }
}

/** Count TODO/FIXME in text files, capped so a huge repo cannot stall the scan. */
export async function countTodos(dir) {
  let files = 0;
  let todos = 0;
  async function walk(current) {
    if (files >= MAX_FILES) return;
    let entries;
    try {
      entries = await readdir(current, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (files >= MAX_FILES) return;
      if (entry.name === "node_modules" || entry.name === ".git" || entry.name === "dist" || entry.name === "vendor") continue;
      const full = join(current, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
      } else if (/\.(m?js|ts|tsx|jsx|py|rs|go|rb|java|c|h|cc|cpp|md|txt)$/.test(entry.name)) {
        files += 1;
        try {
          const info = await stat(full);
          if (info.size > MAX_FILE_BYTES) continue;
          const text = await readFile(full, "utf8");
          const m = text.match(/\b(TODO|FIXME|XXX)\b/g);
          if (m) todos += m.length;
        } catch {
          /* unreadable file: skip */
        }
      }
    }
  }
  await walk(dir);
  return todos;
}

/** Read the README and detect an explicit archived-ish claim. */
export async function readmeMarker(dir) {
  for (const name of ["README.md", "README", "readme.md", "README.rst"]) {
    const full = join(dir, name);
    if (!existsSync(full)) continue;
    try {
      const text = (await readFile(full, "utf8")).slice(0, 20_000);
      const m = text.match(/\b(archived|unmaintained|deprecated|no longer maintained|abandoned)\b/i);
      return m ? m[1].toLowerCase() : null;
    } catch {
      return null;
    }
  }
  return null;
}

/** Every signal for one project folder. */
export async function scanProject(dir, now = new Date()) {
  const git = gitSignals(dir, now);
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
  const hasTests = entries.some((e) => e.isDirectory() && TEST_HINTS.includes(e.name))
    || (existsSync(join(dir, "package.json")) && (await hasTestScript(dir)));
  const hasCI = CI_HINTS.some((hint) => existsSync(join(dir, hint)));
  return {
    name: basename(dir),
    path: dir,
    lastCommit: git.lastCommit,
    daysSinceCommit: git.daysSinceCommit,
    commits180: git.commits180,
    todos: await countTodos(dir),
    hasTests: Boolean(hasTests),
    hasCI,
    archivedMarker: await readmeMarker(dir),
  };
}

async function hasTestScript(dir) {
  try {
    const pkg = JSON.parse(await readFile(join(dir, "package.json"), "utf8"));
    return Boolean(pkg.scripts?.test);
  } catch {
    return false;
  }
}

/** Scan every immediate subdirectory that looks like a project. */
export async function scanDir(root, now = new Date()) {
  const entries = await readdir(root, { withFileTypes: true }).catch(() => []);
  const projects = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const dir = join(root, entry.name);
    if (await isProject(dir)) projects.push(await scanProject(dir, now));
  }
  return projects;
}
