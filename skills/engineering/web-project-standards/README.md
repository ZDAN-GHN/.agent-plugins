# Web Project Standards

面向 Web 全栈项目的 Codex Skill，用于生成和维护 AI 友好的项目规则。

默认目标是 TypeScript 全栈项目：前端、后端、共享 API contract、数据库、测试、工程化配置和管理后台 UI 都有明确规范。生成后的规则以 `AGENTS.md` 作为入口，详细规范放在 `docs/ai-rules/` 中按需阅读。

## 适用场景

- 初始化新 Web 项目的 AI 协作规则
- 给已有项目补齐 `AGENTS.md`、`CLAUDE.md` 和详细工程规范
- 统一 TypeScript、ESLint、Prettier、Vitest、Zod、API contract 等默认约定
- 规范前后端接口共享方式，避免前端手写后端响应类型
- 为管理后台建立稳定的 UI 标准：shadcn/ui、Tailwind CSS、Lucide、移动端适配和操作可靠性

## 核心原则

- `AGENTS.md` 保持短小，只作为入口和路由图。
- 长规则、示例和验收标准放进 `docs/ai-rules/`。
- 前端和后端必须共享 API contract。
- Request/response schema 和推导类型必须位于共享 contract 层。
- 前端代码禁止手写后端响应类型。
- 修改已有项目时保守合并，保留项目已有约定。
- 规则必须可执行，优先给出目录结构、代码片段、命令和检查标准。

## 默认技术栈

- 包管理器：`pnpm`
- 语言：TypeScript
- 类型检查：`strict: true`
- Lint：ESLint flat config + `typescript-eslint`
- Format：Prettier
- Test：Vitest
- API schema：Zod
- API contract：前后端共享 contract 层
- 前端请求：typed fetch wrapper；React 项目可叠加 TanStack Query
- 管理后台 UI：shadcn/ui + Tailwind CSS + lucide-react

## 生成结构

```txt
AGENTS.md
CLAUDE.md
docs/
  ai-rules/
    README.md
    engineering.md
    project-boundaries.md
    typescript.md
    api-contracts.md
    frontend.md
    admin-ui.md
    backend.md
    database.md
    errors.md
    logging.md
    testing.md
```

## 规则文件

- `engineering.md`：包管理、脚本、TypeScript、ESLint、Prettier、CI。
- `project-boundaries.md`：项目已有方案、不可擅自决定事项和安全底线。
- `typescript.md`：类型、模块、异步和错误处理。
- `api-contracts.md`：前后端共享 contract、Zod schema、请求封装、接口返回。
- `frontend.md`：前端组件、状态、表单、数据请求。
- `admin-ui.md`：管理后台 UI、shadcn MCP、Tailwind、Lucide、移动端和操作可靠性。
- `backend.md`：后端分层、路由、服务、仓储、错误。
- `database.md`：数据库 schema、迁移、seed、数据访问。
- `errors.md`：错误码、异常处理、错误响应。
- `logging.md`：结构化日志、审计、链路追踪、敏感信息脱敏。
- `testing.md`：Vitest、contract 测试、接口封装测试。

## 管理后台 UI 标准

管理后台默认是任务型、数据型、操作型界面。视觉目标是克制、稳定、可扫描；交互目标是明确、可恢复、低误操作。

默认组合：

- UI 组件：`shadcn/ui`
- 样式系统：`Tailwind CSS`
- 图标：`lucide-react`
- 复杂表格：TanStack Table 或项目已有方案
- 表单：Zod + React Hook Form 或项目已有 schema 驱动方案

管理端 UI 任务开始前，优先通过 shadcn MCP 查询组件、blocks 和安装方式。能复用 shadcn 组件时，不要手写新的基础组件。移动端按任务分级处理：关键查看和轻量操作必须可用，复杂批量操作和重型配置建议桌面完成。

## 使用方式

在 Codex 中使用：

```txt
Use $web-project-standards to create AGENTS.md and CLAUDE.md rules for this TypeScript Web project.
```

或者描述目标：

```txt
使用 web-project-standards 为这个 Web 项目生成 AI 协作规范。
```

生成时会优先检查目标仓库结构、包管理器、现有规则文件和已有架构，再决定如何写入或合并规则。

## 模板位置

- `assets/AGENTS.template.md`：项目入口规则模板
- `assets/CLAUDE.template.md`：Claude Code 入口模板
- `assets/docs/ai-rules/`：详细规则模板
- `agents/openai.yaml`：Codex 展示信息和默认提示词

## 安全边界

规则模板不包含真实密钥、账号、token 或私有配置。生成目标项目规则时，也不应该写入项目密钥、环境变量值、内部账号或生产地址凭证。
