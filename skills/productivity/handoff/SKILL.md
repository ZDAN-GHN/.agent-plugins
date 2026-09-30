---
name: handoff
description: 仅限用户手动调用（/handoff）；未显式点名时不要自动选择。Compact the current conversation into a handoff document for another agent to pick up. Use when 用户说"写个交接文档""整理成交接""handoff""换个 agent 接着做"；本技能只产出交接文档，不执行文档中描述的任务。
argument-hint: "What will the next session be used for?"
disable-model-invocation: true
---

Write a handoff document summarising the current conversation so a fresh agent can continue the work. Save to the temporary directory of the user's OS - not the current workspace.

Include a "suggested skills" section in the document, naming which skills the next agent should call the Skill tool for.

Do not duplicate content already captured in other artifacts (specs, plans, ADRs, issues, commits, diffs). Reference them by path or URL instead.

Redact any sensitive information, such as API keys, passwords, or personally identifiable information.

If the user passed arguments, treat them as a description of what the next session will focus on and tailor the doc accordingly.
