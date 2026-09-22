#!/usr/bin/env bash
# Link all skills from the repo (~/.agent-plugins/skills) into Factory's
# local marketplace (~/.factory/plugins/marketplaces/local-agent-plugins/skills)
set -u

SKILLS_ROOT="$HOME/.agent-plugins/skills"
MARKETPLACE_DIR="$HOME/.factory/plugins/marketplaces/local-agent-plugins"
TARGET_DIR="$MARKETPLACE_DIR/skills"

if [ ! -d "$SKILLS_ROOT" ]; then
  echo "❌ $SKILLS_ROOT 目录不存在"
  exit 1
fi

mkdir -p "$MARKETPLACE_DIR/plugins"
mkdir -p "$TARGET_DIR"

# Link the entire skills directory structure as a plugin
if [ ! -L "$MARKETPLACE_DIR/plugins/agent-plugins" ]; then
  ln -sf "$SKILLS_ROOT" "$MARKETPLACE_DIR/plugins/agent-plugins"
  echo "✓ 已链接插件源: agent-plugins -> $SKILLS_ROOT"
fi

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
      cur="$(readlink "$dst")"
      if [ "$cur" = "$src" ]; then
        skip=$((skip+1))
      elif [ ! -e "$dst" ]; then
        rm -f "$dst"
        if ln -s "$src" "$dst"; then
          echo "✓ 修复: $skill -> $src"
          fixed=$((fixed+1))
        else
          echo "✗ 失败: $skill (无法修复断链)"
          fail=$((fail+1))
        fi
      else
        skip=$((skip+1))
      fi
    elif [ -e "$dst" ]; then
      skip=$((skip+1))
    else
      if ln -s "$src" "$dst"; then
        echo "✓ 已链接: $skill"
        ok=$((ok+1))
      else
        echo "✗ 失败: $skill (创建链接失败)"
        fail=$((fail+1))
      fi
    fi
  done
done

echo
echo "总结: $ok 新增, $fixed 修复, $skip 跳过, $fail 失败"
