#!/usr/bin/env node

import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { accessSync, constants, existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { delimiter, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const VERSION = "0.1.0";
const CONFIG_DIR = join(homedir(), ".config", "agentctl");
const GLOBAL_MANIFEST = join(CONFIG_DIR, "manifest.toml");
const PROJECT_MANIFEST = join(process.cwd(), ".agentctl", "manifest.toml");

function printHelp() {
  console.log(`agentctl ${VERSION}

Manage command-line tools used by agents.

Usage:
  agentctl <group> <command> [options]

Groups:
  cli discover                 Find executable candidates on PATH
  cli list                    List registered CLI tools
  cli doctor [name]           Check registered tools and their sources
  cli add <name>              Register an executable in the project manifest
  repo inspect [path]         Inspect a repository and emit JSON

Options:
  --json                      Emit machine-readable JSON
  --version                   Show the version
  --help                      Show this help
`);
}

function output(value, json) {
  if (json) {
    console.log(JSON.stringify(value, null, 2));
    return;
  }
  if (typeof value === "string") {
    console.log(value);
    return;
  }
  console.log(JSON.stringify(value, null, 2));
}

function parseArgs(argv) {
  const positional = [];
  let json = false;
  for (const arg of argv) {
    if (arg === "--json") json = true;
    else positional.push(arg);
  }
  return { json, positional };
}

function parseManifest(text, source) {
  const tools = {};
  let current = null;
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.replace(/#.*/, "").trim();
    if (!line) continue;
    const section = line.match(/^\[tools\.([A-Za-z0-9_-]+)\]$/);
    if (section) {
      current = section[1];
      tools[current] = { name: current, source };
      continue;
    }
    const entry = line.match(/^([A-Za-z0-9_-]+)\s*=\s*(.*)$/);
    if (!entry || !current) continue;
    const [, key, rawValue] = entry;
    const value = rawValue.trim().replace(/^"|"$/g, "");
    tools[current][key] = value;
  }
  return tools;
}

async function loadTools() {
  const merged = {};
  for (const [path, source] of [[GLOBAL_MANIFEST, "global"], [PROJECT_MANIFEST, "project"]]) {
    try {
      const text = await readFile(path, "utf8");
      Object.assign(merged, parseManifest(text, source));
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
  }
  return merged;
}

function pathCandidates(name) {
  const pathEntries = (process.env.PATH ?? "").split(delimiter).filter(Boolean);
  const names = process.platform === "win32" ? [name, `${name}.cmd`, `${name}.exe`] : [name];
  const candidates = [];
  for (const entry of pathEntries) {
    for (const candidateName of names) {
      const candidate = join(entry, candidateName);
      try {
        if (statSync(candidate).isFile() && (process.platform === "win32" || accessSync(candidate, constants.X_OK))) {
          candidates.push(resolve(candidate));
        }
      } catch {
        // PATH entries frequently point to files that no longer exist.
      }
    }
  }
  return [...new Set(candidates)];
}

function discover() {
  const names = new Set();
  for (const entry of (process.env.PATH ?? "").split(delimiter).filter(Boolean)) {
    try {
      for (const item of readdirSync(entry)) {
        if (/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(item)) names.add(item);
      }
    } catch {
      // Ignore unreadable PATH entries and continue discovery.
    }
  }
  return [...names].sort().map((name) => ({ name, candidates: pathCandidates(name) }));
}

async function writeProjectTool(name, command) {
  const path = join(process.cwd(), ".agentctl", "manifest.toml");
  await mkdir(dirname(path), { recursive: true });
  let text = "";
  try {
    text = await readFile(path, "utf8");
    if (text.includes(`[tools.${name}]`)) throw new Error(`Tool already exists in ${path}`);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  const block = `[tools.${name}]\ncommand = "${command.replaceAll('"', '\\"')}"\nsource = "project"\nrisk = "read"\n`;
  await writeFile(path, `${text}${text && !text.endsWith("\n") ? "\n" : ""}${block}`, "utf8");
  return path;
}

function inspectRepo(inputPath) {
  const root = resolve(inputPath || ".");
  const git = spawnSync("git", ["-C", root, "rev-parse", "--show-toplevel"], { encoding: "utf8" });
  const isGit = git.status === 0;
  const packagePath = join(root, "package.json");
  const hasPackage = existsSync(packagePath);
  let packageData = null;
  if (hasPackage) {
    try { packageData = JSON.parse(readFileSync(packagePath, "utf8")); } catch { packageData = { parseError: true }; }
  }
  return {
    path: root,
    git: isGit ? { root: git.stdout.trim() } : null,
    package: packageData,
    files: ["README.md", "AGENTS.md", "CLAUDE.md", ".gitignore"].map((name) => ({ name, exists: existsSync(join(root, name)) })),
  };
}

async function main() {
  const { json, positional } = parseArgs(process.argv.slice(2));
  const [group, command, value] = positional;
  if (!group || group === "--help" || group === "help") return printHelp();
  if (group === "--version" || group === "version") return console.log(VERSION);

  if (group === "cli" && command === "discover") return output(discover(), json);
  if (group === "cli" && command === "list") return output(await loadTools(), json);
  if (group === "cli" && command === "doctor") {
    const tools = await loadTools();
    const selected = value ? { [value]: tools[value] } : tools;
    return output(Object.fromEntries(Object.entries(selected).map(([name, tool]) => [name, {
      ...tool,
      available: Boolean(tool?.command && pathCandidates(tool.command).length),
      candidates: tool?.command ? pathCandidates(tool.command) : [],
    }])), json);
  }
  if (group === "cli" && command === "add") {
    if (!value) throw new Error("Usage: agentctl cli add <name>");
    const candidates = pathCandidates(value);
    if (!candidates.length) throw new Error(`Executable not found on PATH: ${value}`);
    return output({ name: value, command: candidates[0], manifest: await writeProjectTool(value, candidates[0]) }, json);
  }
  if (group === "repo" && command === "inspect") return output(inspectRepo(value), json);
  throw new Error(`Unknown command. Run agentctl --help.`);
}

main().catch((error) => {
  const json = process.argv.includes("--json");
  const result = { error: error.message };
  if (json) console.error(JSON.stringify(result));
  else console.error(`Error: ${error.message}`);
  process.exitCode = 1;
});
