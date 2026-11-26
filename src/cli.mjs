#!/usr/bin/env node
// Cryptkeeper CLI: scan a folder of projects, score how dead they are, and write the brief or the report.
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { scanDir } from "./scan.mjs";
import { scoreProject, verdict } from "./score.mjs";
import { briefFor } from "./brief.mjs";
import { renderReport } from "./report.mjs";

const USAGE = `cryptkeeper — find the projects worth reviving

  cryptkeeper scan <dir> [--json]
  cryptkeeper brief <dir> --project <name>
  cryptkeeper report <dir> --out <file.html> [--now <iso-date>]

Exit codes: 0 ok, 1 usage error, 2 nothing found.`;

function parse(argv) {
  const [command, ...rest] = argv;
  const flags = {};
  const positional = [];
  for (let i = 0; i < rest.length; i += 1) {
    const arg = rest[i];
    if (arg.startsWith("--")) {
      const [key, inline] = arg.slice(2).split("=");
      if (inline !== undefined) flags[key] = inline;
      else if (["json"].includes(key)) flags[key] = true;
      else flags[key] = rest[++i];
    } else {
      positional.push(arg);
    }
  }
  return { command, positional, flags };
}

async function main() {
  const { command, positional, flags } = parse(process.argv.slice(2));
  if (!command || command === "--help" || command === "-h") {
    console.log(USAGE);
    return 0;
  }
  const root = positional[0] ? resolve(positional[0]) : null;
  if (!root) {
    console.error("Missing <dir>.");
    return 1;
  }
  const now = flags.now ? new Date(flags.now) : new Date();
  const projects = await scanDir(root, now);
  if (!projects.length) {
    console.error(`No projects found under ${root}.`);
    return 2;
  }

  if (command === "scan") {
    const scored = projects.map((p) => {
      const scoredProject = scoreProject(p);
      return { ...p, ...scoredProject, verdict: verdict(scoredProject.score) };
    });
    if (flags.json) {
      console.log(JSON.stringify(scored, null, 2));
    } else {
      for (const p of scored.sort((a, b) => b.score - a.score)) {
        console.log(`${String(p.score).padStart(3)}  ${p.verdict.padEnd(11)}  ${p.name}`);
      }
    }
    return 0;
  }

  if (command === "brief") {
    const wanted = flags.project;
    if (!wanted) {
      console.error("brief needs --project <name>.");
      return 1;
    }
    const project = projects.find((p) => p.name === wanted);
    if (!project) {
      console.error(`No project named ${wanted}.`);
      return 2;
    }
    process.stdout.write(briefFor(project));
    return 0;
  }

  if (command === "report") {
    if (!flags.out) {
      console.error("report needs --out <file.html>.");
      return 1;
    }
    const out = resolve(flags.out);
    await writeFile(out, renderReport(projects, { generatedAt: now.toISOString() }), "utf8");
    console.log(`Wrote ${out} (${projects.length} projects).`);
    return 0;
  }

  console.error(`Unknown command: ${command}\n\n${USAGE}`);
  return 1;
}

main().then((code) => process.exit(code)).catch((error) => {
  console.error(error.message);
  process.exit(1);
});
