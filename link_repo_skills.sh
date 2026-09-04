#!/usr/bin/env bash
# Link all skills from the repo (~/.agent-plugins/skills) into Claude Code's
# user-level skill library (~/.claude/skills), following SKILL.md principles:
#  - per-skill symlinks (never whole categories)
#  - never overwrite real directories (user customizations)
#  - fix broken symlinks that point at the same skill's old location
#  - report success / skipped / fixed / failed
set -u

SKILLS_ROOT="$HOME/.agent-plugins/skills"
TARGET_DIR="$HOME/.claude/skills"

if [ ! -d "$SKILLS_ROOT" ]; then
  echo "❌ $SKILLS_ROOT 目录不存在"
  exit 1
fi

mkdir -p "$TARGET_DIR"

ok=0; skip=0; fixed=0; fail=0

for cat_dir in "$SKILLS_ROOT"/*/; do
  [ -d "$cat_dir" ] || continue
  cat="$(basename "$cat_dir")"
  for skill_dir in "$cat_dir"*/; do
    [ -d "$skill_dir" ] || continue
    skill="$(basename "$skill_dir")"
    src="$SKILLS_ROOT/$cat/$skill"
    dst="$TARGET_DIR/$skill"

    if [ -L "$dst" ]; then
      # existing symlink
      cur="$(readlink "$dst")"
      if [ "$cur" = "$src" ]; then
        echo "⊘ 跳过: $skill (已链接到正确位置)"
        skip=$((skip+1))
      elif [ ! -e "$dst" ]; then
        # broken symlink -> re-point to repo location
        rm -f "$dst"
        if ln -s "$src" "$dst"; then
          echo "✓ 修复: $skill -> $src (原为断链指向 $cur)"
          fixed=$((fixed+1))
        else
          echo "✗ 失败: $skill (无法修复断链 $cur)"
          fail=$((fail+1))
        fi
      else
        echo "⊘ 跳过: $skill (已存在指向别处的有效链接: $cur)"
        skip=$((skip+1))
      fi
    elif [ -e "$dst" ]; then
      echo "⊘ 跳过: $skill (已存在真实目录, 用户自定义, 不覆盖)"
      skip=$((skip+1))
    else
      if ln -s "$src" "$dst"; then
        echo "✓ 已链接: $skill -> $src"
        ok=$((ok+1))
      else
        echo "✗ 失败: $skill (创建链接失败)"
        fail=$((fail+1))
      fi
    fi
  done
done

echo
echo "总结: $ok 成功, $fixed 修复, $skip 跳过, $fail 失败"
