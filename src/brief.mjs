// A deterministic resurrection brief an agent can act on. No LLM call inside the tool.
import { scoreProject, verdict } from "./score.mjs";

const REVIVAL = {
  tombstone: "Pick one user-visible outcome and rebuild only the path to it. Do not restore the build system first.",
  "on the slab": "Run the existing tests, delete what no longer compiles, and ship one fix that a user would notice.",
  fading: "Close the open TODOs that are user-facing, or mark the project archived and stop pretending.",
  alive: "Leave it alone; the cost of reviving a live project is negative.",
};

/** Render the brief for one scanned project. */
export function briefFor(project) {
  const { score, parts } = scoreProject(project);
  const top = [...parts].filter((p) => p.points > 0).sort((a, b) => b.points - a.points).slice(0, 3);
  const lines = [
    `# ${project.name}`,
    `verdict: ${verdict(score)} (death score ${score}/100)`,
    `path: ${project.path}`,
    "",
    "## Why it reads as dead",
    ...(top.length ? top.map((p) => `- ${p.label}: ${p.why} (+${p.points})`) : ["- no dead signals; this project looks alive"]),
    "",
    "## Smallest credible revival",
    REVIVAL[verdict(score)],
    "",
    "## Check first",
    `- ${project.hasTests ? "Tests are present: run them before changing anything." : "There are no tests: write one failing test before touching the code."}`,
    `- ${project.hasCI ? "CI exists: read the last failing run." : "No CI: the first revival commit should add a one-command check."}`,
    `- ${project.todos > 0 ? `${project.todos} TODO/FIXME markers are the cheapest map of what the author knew was missing.` : "No TODO markers: the gap is in what users asked for, not in the code."}`,
    "",
    "## Do not",
    "- Do not rewrite the stack to make the revival look modern.",
    "- Do not restore features nobody asked for; one visible outcome is the bar.",
  ];
  return lines.join("\n") + "\n";
}
