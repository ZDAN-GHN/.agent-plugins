# Project Rules

本文件是项目唯一入口规则。`CLAUDE.md` 必须只包含：

```md
@AGENTS.md
```

详细规则放在 `docs/ai-rules/`，按任务需要阅读，不要把所有规则复制进本文件。

## 必须遵守

- 默认使用中文与项目维护者沟通，除非用户或项目文档明确要求其他语言。
- 前端、后端、共享代码、测试和脚本默认使用 TypeScript。
- 前后端接口类型必须共享 contract，禁止前端手写后端响应类型。
- 修改代码前必须先阅读相关代码、配置、测试和对应规则文档。
- 不要重写、删除或回滚用户已有改动，除非用户明确要求。
- 不要为了通过检查随意使用 `any`、`unknown as T`、`// @ts-ignore`、`eslint-disable`。
- 行为变更必须补充或更新测试；无法测试时必须说明原因和风险。
- 完成后必须运行相关检查；无法运行时必须说明原因。

## 按需阅读

- 工程化配置、脚本、依赖、CI：`docs/ai-rules/engineering.md`
- 项目已有方案、权限安全边界、不能擅自决定的事项：`docs/ai-rules/project-boundaries.md`
- TypeScript 类型、模块、错误处理：`docs/ai-rules/typescript.md`
- 接口开发、联调、请求封装、字段变更：`docs/ai-rules/api-contracts.md`
- 前端页面、组件、状态、数据请求：`docs/ai-rules/frontend.md`
- 管理后台 UI、数据列表、表单、筛选、移动端适配：`docs/ai-rules/admin-ui.md`
- 后端路由、服务、数据访问、鉴权：`docs/ai-rules/backend.md`
- 数据库 schema、迁移、seed、数据访问：`docs/ai-rules/database.md`
- 错误码、异常处理、错误响应：`docs/ai-rules/errors.md`
- 日志、审计、链路追踪、敏感信息脱敏：`docs/ai-rules/logging.md`
- 测试新增、修复、重构：`docs/ai-rules/testing.md`

## 默认工程栈

- 包管理器：`pnpm`
- 语言：TypeScript
- 类型检查：`tsc --noEmit`
- Lint：ESLint flat config + `typescript-eslint`
- Format：Prettier
- Test：Vitest
- API schema：Zod
- API contract：前后端共享 contract 层

## 完成标准

一次改动完成前必须确认：

- 相关类型检查通过，或说明不能运行的原因。
- 相关 lint 通过，或说明不能运行的原因。
- 相关测试通过，或说明不能运行的原因。
- 涉及接口时，前后端字段来自 shared contract。
- `CLAUDE.md` 仍然只包含 `@AGENTS.md`。
