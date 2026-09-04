#!/usr/bin/env bash
# scan-agents.sh — 扫描本机已安装的编码 Agent 及其用户级技能目录
#
# 用法:
#   bash scan-agents.sh            # 人类可读表格
#   bash scan-agents.sh --json     # 机器可读 JSON（便于其他脚本消费）
#
# 探测信号（按 Agent）:
#   - 可执行命令  (command -v)
#   - 运行时环境变量 (如 CLAUDE_SESSION_ID / DSH_SESSION_ID)
#   - 配置文件目录存在 (如 ~/.claude, ~/.codex, ~/.dsh, ~/.pi/agent)
#   - 用户级技能目录存在 (如 ~/.dsh/skills)
#
# 新增 Agent: 在下方 agents 数组追加一行即可
#   格式: 名称|命令|环境变量|配置文件目录|全局技能目录|项目技能目录
set -u

HOME_DIR="$HOME"
agents=(
  "claude|claude|CLAUDE_SESSION_ID|.claude|.claude/skills|.claude/skills"
  "codex|codex||.codex|.codex/skills|.codex/skills"
  "dsh|dsh|DSH_SESSION_ID|.dsh|.dsh/skills|.dsh/skills"
  "pi|pi|PI_CODING_AGENT_DIR|.pi/agent|.pi/agent/skills|.pi/skills"
  "gemini|gemini||.gemini|.gemini/skills|.gemini/skills"
  "cursor|cursor-agent||.cursor|.cursor/skills|.cursor/skills"
  "opencode|opencode||.config/opencode|.config/opencode/skills|.opencode/skills"
)
# 共享技能目录（Agent Skills 规范，多个 agent 都会读取）
SHARED_DIR="$HOME_DIR/.agents/skills"

detect() {
  # $1=name $2=cmd $3=envvar $4=cfgdir
  local name="$1" cmd="$2" envvar="$3" cfgdir="$4"
  local has_cmd="" has_env="" has_cfg=""
  if command -v "$cmd" >/dev/null 2>&1; then has_cmd=1; fi
  if [ -n "$envvar" ] && [ -n "${!envvar:-}" ]; then has_env=1; fi
  if [ -d "$HOME_DIR/$cfgdir" ]; then has_cfg=1; fi
  if [ -n "$has_cmd" ] || [ -n "$has_env" ] || [ -n "$has_cfg" ]; then
    echo "1|$has_cmd|$has_env|$has_cfg"
  else
    echo ""
  fi
}

scan() {
  local name cmd envvar cfgdir gskill pskill det res
  for entry in "${agents[@]}"; do
    IFS='|' read -r name cmd envvar cfgdir gskill pskill <<<"$entry"
    det="$(detect "$name" "$cmd" "$envvar" "$cfgdir")"
    if [ -z "$det" ]; then continue; fi
    IFS='|' read -r installed has_cmd has_env has_cfg <<<"$det"
    local gexists="no"; [ -e "$HOME_DIR/$gskill" ] && gexists="yes"
    local cmdpath=""; command -v "$cmd" >/dev/null 2>&1 && cmdpath="$(command -v "$cmd")"
    echo "$name|$cmdpath|$has_cmd|$has_env|$has_cfg|$HOME_DIR/$gskill|$gexists"
  done
  echo "shared||0|0|0|$SHARED_DIR|$([ -e "$SHARED_DIR" ] && echo yes || echo no)"
}

if [ "${1:-}" = "--json" ]; then
  # 简单 JSON 字符串转义（先转义再包引号）
  jstr() { printf '"%s"' "$(printf '%s' "$1" | sed 's/"/\\"/g')"; }
  echo "["
  first=1
  while IFS='|' read -r name cmdpath has_cmd has_env has_cfg gskill gexists; do
    [ -z "$name" ] && continue
    [ "$first" = 1 ] || echo ","
    printf '  {"name":%s,"binary":%s,"cmd":%s,"env":%s,"config":%s,"globalSkillDir":%s,"skillDirExists":%s}' \
      "$(jstr "$name")" "$(jstr "$cmdpath")" "${has_cmd:-0}" "${has_env:-0}" "${has_cfg:-0}" "$(jstr "$gskill")" "$(jstr "$gexists")"
    first=0
  done <<<"$(scan)"
  echo
  echo "]"
  exit 0
fi

# 人类可读表格
printf '%-12s %-16s %-4s %-4s %-4s  %s\n' "AGENT" "BINARY" "CMD" "ENV" "CFG" "全局技能目录 (存在?)"
printf '%s\n' "-----------------------------------------------------------------------------"
while IFS='|' read -r name cmdpath has_cmd has_env has_cfg gskill gexists; do
  [ -z "$name" ] && continue
  mark() { [ "$1" = "1" ] && printf '✓' || printf '·'; }
  printf '%-12s %-16s %-4s %-4s %-4s  %s (%s)\n' \
    "$name" "$(basename "${cmdpath:-—}")" \
    "$(mark "$has_cmd")" "$(mark "$has_env")" "$(mark "$has_cfg")" \
    "$gskill" "$([ "$gexists" = yes ] && echo 存在 || echo 未创建)"
done <<<"$(scan)"
echo
echo "说明: CMD=命令在PATH上  ENV=运行时环境变量  CFG=配置目录存在"
echo "     共享技能目录 ~/.agents/skills 会被 dsh/pi/gemini 等多个 agent 读取"
