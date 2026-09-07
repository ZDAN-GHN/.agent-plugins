#!/usr/bin/env python3
"""Validate a skill's trigger readiness across agents (boost-skill-trigger).

Checks frontmatter parseability, trigger-phrase quality, per-agent
when_to_use key spelling, the 1536-char listing truncation budget, and
AGENTS.md/CLAUDE.md pointer presence. Read-only: never modifies files.

Usage:
  python3 validate_trigger.py <skill-dir> [--agents claude,dsh,pi,codex]
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

LISTING_CHAR_CAP = 1536  # claude code: description+when_to_use combined truncation
KEBAB = re.compile(r"^[a-z0-9]+(-[a-z0-9]+)*$")
TRIGGER_PHRASES = [
    "use when", "use this skill when", "should be used when",
    "whenever", "触发", "用于", "适用于", "when the user",
]
# dsh reads camelCase; claude code reads snake_case; pi ignores both.
AGENT_KEYS = {
    "claude": {"when_to_use": True, "whenToUse": False},
    "dsh": {"whenToUse": True, "when_to_use": False},
    "pi": {},
    "codex": {},  # unverified: cannot validate
}
POINTER_FILES = {
    "claude": ["~/.claude/CLAUDE.md", "CLAUDE.md", "AGENTS.md"],
    "dsh": ["~/.dsh/AGENTS.md", "~/.dsh/AGENTS.local.md", "AGENTS.md", "AGENTS.local.md"],
    "pi": ["~/.pi/agent/AGENTS.md", "AGENTS.md", "CLAUDE.md"],
    "codex": ["~/.codex/AGENTS.md", "AGENTS.md"],
}
results: list[tuple[str, str, str]] = []  # (level, message, detail)


def check(level: str, msg: str, detail: str = "") -> None:
    results.append((level, msg, detail))


def parse_frontmatter(text: str) -> tuple[dict[str, str], str]:
    """Minimal YAML-frontmatter parser (key: value lines only)."""
    if not text.startswith("---"):
        return {}, text
    parts = text.split("\n---", 2)
    if len(parts) < 2:
        return {}, text
    block = parts[0][3:].strip("\n")
    body = parts[1].split("\n", 1)[1] if "\n" in parts[1] else ""
    meta: dict[str, str] = {}
    for line in block.splitlines():
        if ":" in line and not line.startswith((" ", "\t", "#")):
            k, _, v = line.partition(":")
            meta[k.strip()] = v.strip().strip("\"'")
    return meta, body


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("skill_dir", type=Path)
    ap.add_argument("--agents", default="claude,dsh,pi,codex")
    args = ap.parse_args()
    agents = [a.strip() for a in args.agents.split(",") if a.strip()]

    skill_dir = args.skill_dir.resolve()
    skill_md = skill_dir / "SKILL.md"
    if not skill_md.is_file():
        print(f"❌ SKILL.md not found: {skill_md}")
        return 1
    meta, _body = parse_frontmatter(skill_md.read_text(encoding="utf-8", errors="replace"))

    # --- name ---
    name = meta.get("name", "")
    dirname = skill_dir.name
    if not name:
        check("❌", "frontmatter 缺少 name", "模型目录名兜底，但显式 name 更稳")
    elif not KEBAB.match(name):
        check("❌", f"name 不是 kebab-case: {name!r}")
    elif name != dirname:
        check("⚠️", f"name ({name}) 与目录名 ({dirname}) 不一致")

    # --- description ---
    desc = meta.get("description", "")
    if not desc:
        check("❌", "frontmatter 缺少 description —— 触发的唯一主要依据，缺失等于不可触发（pi 直接拒绝加载）")
        desc = ""
    else:
        if len(desc) < 40:
            check("⚠️", f"description 过短（{len(desc)} 字符），几乎必然缺乏触发信号")
        if not any(p in desc.lower() for p in TRIGGER_PHRASES):
            check("⚠️", "description 未包含触发短语（Use when / 用于 / 适用于 …）",
                  "官方处方：'Improve your description and add trigger phrases'")
        if "this skill" not in desc.lower() and not any("\u4e00" <= c <= "\u9fff" for c in desc):
            check("⚠️", "description 疑似非第三人称（无 'This skill' 且非中文）")
        cjk = sum(1 for c in desc if "\u4e00" <= c <= "\u9fff")
        latin = len(re.findall(r"[A-Za-z]{3,}", desc))
        if cjk == 0 and latin == 0:
            check("⚠️", "description 无可匹配的实词")

    # --- when_to_use keys per agent ---
    wt_snake = meta.get("when_to_use", "")
    wt_camel = meta.get("whenToUse", "")
    for agent in agents:
        keys = AGENT_KEYS.get(agent, {})
        if not keys:
            check("ℹ️", f"[{agent}] when_to_use 支持未核实/不适用，无法校验")
            continue
        for key, supported in keys.items():
            if not supported:
                continue
            val = meta.get(key, "")
            if not val:
                check("⚠️", f"[{agent}] 缺少 {key} —— 该 agent 的额外触发面未被利用")
        if "dsh" in agents and "claude" in agents:
            if bool(wt_snake) != bool(wt_camel):
                check("⚠️", "同时分发 claude+dsh 时建议 when_to_use 与 whenToUse 都写（内容一致）")

    # --- listing char budget (claude code) ---
    if "claude" in agents:
        combined = len(desc) + len(wt_snake)
        if combined > LISTING_CHAR_CAP:
            check("❌", f"description+when_to_use 共 {combined} 字符 > {LISTING_CHAR_CAP}，"
                        f"尾部在 listing 中被截断，尾部触发词失效")
        elif combined > LISTING_CHAR_CAP * 0.8:
            check("⚠️", f"description+when_to_use 占预算 {combined}/{LISTING_CHAR_CAP}，"
                        f"新增触发词前先精简")

    # --- pointer files ---
    for agent in agents:
        if not name:
            break
        found = []
        for raw in POINTER_FILES.get(agent, []):
            p = Path(raw).expanduser()
            if p.is_file() and name in p.read_text(encoding="utf-8", errors="replace"):
                found.append(raw)
        if found:
            check("✅", f"[{agent}] 指针已存在: {', '.join(found)}")
        else:
            check("⚠️", f"[{agent}] 指针文件中未找到 {name}（第二条上下文路径未利用）")

    # --- report ---
    order = {"❌": 0, "⚠️": 1, "✅": 2, "ℹ️": 3}
    results.sort(key=lambda r: order[r[0]])
    for level, msg, detail in results:
        line = f"{level} {msg}"
        if detail:
            line += f"\n    ↳ {detail}"
        print(line)
    fails = sum(1 for r in results if r[0] == "❌")
    warns = sum(1 for r in results if r[0] == "⚠️")
    print(f"\n{fails} error(s), {warns} warning(s). "
          f"{'❌ 需修复后再验证' if fails else '✔ 无阻断问题'}")
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main())
