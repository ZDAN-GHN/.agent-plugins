#!/usr/bin/env python3
"""Validate a skill's trigger readiness across agents (boost-skill-trigger).

Read-only diagnosis. Output is split into two classes with different
handling rules:

- 🚩 definition diagnosis: problems inside the target skill's own
  frontmatter (missing/weak description, disabled auto-invocation,
  silently-ignored key spellings, listing truncation). boost-skill-trigger
  NEVER fixes these — changing the target skill's metadata is out of
  scope. Report and hand to a definition repair flow
  (e.g. skill-quality-auditor).
- ❌ / ⚠️ in-scope landing checks: AGENTS.md/CLAUDE.md pointer presence.
  ❌ must be landed before validation passes.

Read-only: never modifies files.

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
DEF = "🚩"  # definition diagnosis: report only, never fixed by this skill
TRIGGER_PHRASES = [
    "use when", "use this skill when", "should be used when",
    "whenever", "触发", "用于", "适用于", "when the user",
]
# Known spellings of the extra trigger-surface key. Claude Code reads
# snake_case, DSH reads camelCase, pi ignores both. Any *other* spelling
# is a silent-failure definition signal.
WHEN_KEY_SPELLINGS = {"when_to_use", "whenToUse"}
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

    # ------------------------------------------------------------------
    # Definition diagnosis (🚩): everything inside the target skill's
    # frontmatter. Report-only — this skill never edits target metadata.
    # ------------------------------------------------------------------

    # --- name ---
    name = meta.get("name", "")
    dirname = skill_dir.name
    if not name:
        check(DEF, "frontmatter 缺少 name", "定义问题：靠目录名兜底，但显式 name 更稳；本技能不修改")
    elif not KEBAB.match(name):
        check(DEF, f"name 不是 kebab-case: {name!r}", "定义问题；本技能不修改")
    elif name != dirname:
        check(DEF, f"name ({name}) 与目录名 ({dirname}) 不一致", "定义问题；本技能不修改")

    # --- description ---
    desc = meta.get("description", "")
    if not desc:
        check(DEF, "frontmatter 缺少 description —— 模型触发的唯一主要依据，缺失几乎等于不可自动触发（pi 直接拒绝加载）",
              "定义问题，超出本技能范围：先走定义修复流程（如 skill-quality-auditor），本技能不代修")
        desc = ""
    else:
        if len(desc) < 40:
            check(DEF, f"description 过短（{len(desc)} 字符），触发信号可能不足")
        if not any(p in desc.lower() for p in TRIGGER_PHRASES):
            check(DEF, "description 未包含触发短语（Use when / 用于 / 适用于 …）——漏触发的常见根因",
                  "定义问题，本技能不修改元数据；指针/hook 是对症的外部补偿手段")
        if "this skill" not in desc.lower() and not any("\u4e00" <= c <= "\u9fff" for c in desc):
            check(DEF, "description 疑似非第三人称（无 'This skill' 且非中文）")
        cjk = sum(1 for c in desc if "\u4e00" <= c <= "\u9fff")
        latin = len(re.findall(r"[A-Za-z]{3,}", desc))
        if cjk == 0 and latin == 0:
            check(DEF, "description 无可匹配的实词")

    # --- extra trigger-surface key: silent-failure diagnosis ---
    wt_snake = meta.get("when_to_use", "")
    wt_camel = meta.get("whenToUse", "")
    bogus = sorted(
        k for k in meta
        if "when" in k.lower() and k not in WHEN_KEY_SPELLINGS
    )
    if bogus:
        check(DEF, f"疑似 when_to_use 拼写错误的键（会被静默忽略）: {', '.join(bogus)}",
              "定义问题：Claude Code 读 when_to_use，DSH 读 whenToUse，其他拼写一律失效；本技能不修改")
    elif not wt_snake and not wt_camel:
        check("ℹ️", "无任何 when_to_use/whenToUse 键——额外触发面未被利用"
                    "（是否补写属于定义决策，本技能不动元数据）")

    # --- disable-model-invocation: hard blocker for every lever this skill has ---
    dmi = meta.get("disable-model-invocation", "").strip().lower()
    if dmi in ("true", "yes", "1"):
        check(DEF, "disable-model-invocation: true —— 自动触发面被明确关闭",
              "本技能的全部手段（指针/hook/预算）都以自动触发面为前提，此状态下大概率失效；"
              "移除该键属于修改元数据，超出本技能范围，需用户自行决定")

    # --- listing char budget (claude code) — truncation is a definition issue ---
    if "claude" in agents:
        combined = len(desc) + len(wt_snake)
        if combined > LISTING_CHAR_CAP:
            check(DEF, f"description+when_to_use 共 {combined} 字符 > {LISTING_CHAR_CAP}，"
                       f"listing 中尾部被截断，尾部触发词失效")
        elif combined > LISTING_CHAR_CAP * 0.8:
            check(DEF, f"description+when_to_use 占预算 {combined}/{LISTING_CHAR_CAP}，已接近截断线")

    # ------------------------------------------------------------------
    # In-scope landing checks (❌/⚠️): what boost-skill-trigger itself
    # must deliver — pointer lines in AGENTS.md/CLAUDE.md.
    # ------------------------------------------------------------------
    if dmi in ("true", "yes", "1"):
        check("ℹ️", "disable-model-invocation: true 的技能不进入自动触发面，指针不适用"
                    "（手动 /调用 是唯一入口；若要自动触发需先修定义，超出本技能范围）")
    else:
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
                check("❌", f"[{agent}] 指针文件中未找到 {name}（第二条上下文路径未落地——本技能范围内的待办）")

    # --- report ---
    order = {"❌": 0, DEF: 1, "⚠️": 2, "✅": 3, "ℹ️": 4}
    results.sort(key=lambda r: order[r[0]])
    for level, msg, detail in results:
        line = f"{level} {msg}"
        if detail:
            line += f"\n    ↳ {detail}"
        print(line)
    fails = sum(1 for r in results if r[0] == "❌")
    defs = sum(1 for r in results if r[0] == DEF)
    warns = sum(1 for r in results if r[0] == "⚠️")
    print(f"\n{fails} in-scope blocker(s) ❌, {defs} definition-diagnosis 🚩 (report-only, never fixed here), "
          f"{warns} warning(s).")
    if fails:
        print("❌ 先落地 ❌ 项（指针）再验证。")
    if defs:
        print("🚩 定义问题只报告：修改目标技能元数据不在 boost-skill-trigger 范围内，"
              "建议用户走定义修复流程（如 skill-quality-auditor）。")
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main())
