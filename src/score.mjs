// Death score: pure, deterministic, every point explained.
// Weights live here and nowhere else, so the report and the brief cannot disagree.

export const WEIGHTS = [
  { id: "age", label: "Last commit age", max: 40 },
  { id: "activity", label: "Commits in the last 180 days", max: 20 },
  { id: "tests", label: "Tests present", max: 15 },
  { id: "ci", label: "CI configuration", max: 10 },
  { id: "markers", label: "README says archived or unmaintained", max: 10 },
  { id: "todos", label: "TODO/FIXME count", max: 5 },
];

/**
 * Score one project record from 0 (alive) to 100 (a tombstone).
 * :param {object} p a record from scan.mjs
 * :return {{score: number, parts: {id: string, label: string, points: number, why: string}[]}}
 */
export function scoreProject(p) {
  const parts = [];
  const add = (id, points, why) => {
    const w = WEIGHTS.find((x) => x.id === id);
    parts.push({ id, label: w.label, points: Math.min(points, w.max), why });
  };

  const days = p.daysSinceCommit;
  if (days === null) add("age", 25, "no commit date available");
  else if (days > 365) add("age", 40, `${days} days since the last commit`);
  else if (days > 180) add("age", 25, `${days} days since the last commit`);
  else if (days > 90) add("age", 10, `${days} days since the last commit`);
  else add("age", 0, `last commit ${days} days ago`);

  if (p.commits180 === null) add("activity", 10, "activity unknown");
  else if (p.commits180 === 0) add("activity", 20, "no commits in 180 days");
  else if (p.commits180 < 5) add("activity", 10, `${p.commits180} commits in 180 days`);
  else add("activity", 0, `${p.commits180} commits in 180 days`);

  add("tests", p.hasTests ? 0 : 15, p.hasTests ? "a test directory exists" : "no test directory found");
  add("ci", p.hasCI ? 0 : 10, p.hasCI ? "CI configuration found" : "no CI configuration found");
  add("markers", p.archivedMarker ? 10 : 0, p.archivedMarker ? `README says ${p.archivedMarker}` : "README makes no archived claim");
  add("todos", p.todos > 10 ? 5 : p.todos > 3 ? 2 : 0, `${p.todos} TODO/FIXME markers`);

  const score = parts.reduce((n, x) => n + x.points, 0);
  return { score: Math.max(0, Math.min(100, score)), parts };
}

/** Human label for a score, used by the CLI and the report. */
export function verdict(score) {
  if (score >= 70) return "tombstone";
  if (score >= 45) return "on the slab";
  if (score >= 20) return "fading";
  return "alive";
}
