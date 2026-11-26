import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";

const DB = join(dirname(fileURLToPath(import.meta.url)), "todos.json");

function load(path = DB) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return [];
  }
}

function save(todos, path = DB) {
  writeFileSync(path, JSON.stringify(todos, null, 2) + "\n");
}

export function add(text, path = DB) {
  const todos = load(path);
  todos.push({ id: Date.now(), text, done: false });
  save(todos, path);
  return todos;
}

export function list(path = DB) {
  return load(path);
}

// CLI entry point
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [, , cmd, ...rest] = process.argv;

  if (cmd === "add") {
    const text = rest.join(" ").trim();
    if (!text) { console.error("Usage: todo add <text>"); process.exit(1); }
    add(text);
    console.log(`Added: ${text}`);
  } else if (cmd === "list") {
    const todos = list();
    if (todos.length === 0) {
      console.log("No todos.");
    } else {
      todos.forEach((t, i) => console.log(`${i + 1}. [${t.done ? "x" : " "}] ${t.text}`));
    }
  } else {
    console.error("Usage: todo <add <text> | list>");
    process.exit(1);
  }
}
