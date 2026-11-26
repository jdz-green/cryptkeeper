// Self-contained HTML graveyard: one tombstone per project, sorted by death score.
import { scoreProject, verdict } from "./score.mjs";

const ESC = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ESC[c]);

/** Render the whole report. Pure: same records in, same string out. */
export function renderReport(projects, { generatedAt = null } = {}) {
  const rows = projects
    .map((p) => ({ p, ...scoreProject(p) }))
    .sort((a, b) => b.score - a.score || a.p.name.localeCompare(b.p.name));

  const stones = rows.map(({ p, score, parts }) => {
    const causes = parts.filter((x) => x.points > 0).map((x) => `<li>${esc(x.label)} <b>+${x.points}</b> — ${esc(x.why)}</li>`).join("");
    const v = verdict(score);
    return `
      <article class="stone ${v.replace(/\s+/g, "-")}">
        <div class="score">${score}</div>
        <h2>${esc(p.name)}</h2>
        <p class="verdict">${esc(v)}</p>
        <ul class="causes">${causes || "<li>no dead signals</li>"}</ul>
        <p class="path">${esc(p.path)}</p>
      </article>`;
  }).join("\n");

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Cryptkeeper — the graveyard</title>
<style>
  :root { --ink:#e9e4d8; --bg:#12100f; --moss:#7f9c6a; --bone:#d8cfbe; --blood:#a33a2b; }
  * { box-sizing: border-box; }
  body { margin:0; background:var(--bg); color:var(--ink); font:16px/1.55 ui-serif, Georgia, serif; }
  header, main { max-width:1000px; margin:0 auto; padding:32px 24px; }
  h1 { font-size:clamp(28px,4vw,44px); margin:0 0 8px; letter-spacing:.02em; }
  .sub { color:var(--moss); font-family:ui-monospace, monospace; font-size:13px; }
  .grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:18px; margin-top:28px; }
  .stone { border:1px solid #2b2622; border-radius:14px 14px 4px 4px; padding:18px; background:#171412; position:relative; }
  .stone.tombstone { border-color:var(--blood); }
  .stone.on-the-slab { border-color:#8a6a3a; }
  .stone.fading { border-color:#4a5a44; }
  .stone.alive { border-color:#2f4a3a; }
  .score { position:absolute; top:14px; right:16px; font-family:ui-monospace, monospace; font-size:26px; color:var(--bone); opacity:.85; }
  h2 { margin:0 40px 4px 0; font-size:19px; }
  .verdict { margin:0 0 10px; text-transform:uppercase; letter-spacing:.12em; font-size:11px; color:var(--moss); }
  .causes { margin:0; padding-left:16px; font-size:13px; color:#bdb4a4; }
  .causes li { margin:3px 0; }
  .path { margin:12px 0 0; font-family:ui-monospace, monospace; font-size:11px; color:#6d655b; word-break:break-all; }
  footer { color:#6d655b; font-size:12px; padding:0 24px 40px; max-width:1000px; margin:0 auto; }
</style></head>
<body>
<header>
  <h1>Cryptkeeper</h1>
  <p class="sub">${rows.length} projects scanned${generatedAt ? ` · ${esc(generatedAt)}` : ""} · sorted by how dead they are</p>
</header>
<main class="grid">${stones}</main>
<footer>Read-only scan. A high score is a question, not a verdict: the brief says what to check before reviving anything.</footer>
</body></html>
`;
}
