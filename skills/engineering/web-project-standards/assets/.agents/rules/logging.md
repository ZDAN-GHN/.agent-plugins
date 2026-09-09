# Logging Rules

## 基本规则

- 后端必须使用结构化日志，不使用零散的 `console.log` 作为长期日志方案。
- 日志必须帮助定位问题：包含事件名、请求 ID、用户 ID 或租户 ID、关键资源 ID、耗时和结果。
- 日志不得记录密码、token、cookie、密钥、验证码、完整银行卡号、完整身份证号等敏感信息。
- 错误日志记录内部细节，API 响应返回安全文案。

## 日志级别

- `debug`：本地调试和临时诊断，生产默认可关闭。
- `info`：关键业务事件和状态变化。
- `warn`：可恢复异常、降级、重试、异常输入。
- `error`：请求失败、任务失败、不可恢复异常。

## 结构化日志示例

```ts
// apps/api/src/lib/logger.ts
import pino from "pino";

export const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  redact: [
    "req.headers.authorization",
    "req.headers.cookie",
    "password",
    "passwordHash",
    "token",
    "accessToken",
    "refreshToken",
    "secret"
  ]
});
```

## 请求日志

每个请求应有稳定的 `requestId`。如果上游传入 `x-request-id`，优先沿用；否则生成新的。

```ts
// apps/api/src/middleware/request-context.ts
import { randomUUID } from "node:crypto";

export function getRequestId(req: Request) {
  return req.headers.get("x-request-id") ?? randomUUID();
}
```

```ts
// apps/api/src/routes/users.ts
import { logger } from "../lib/logger";

export async function createUserHandler(req: Request): Promise<Response> {
  const requestId = getRequestId(req);
  const startedAt = Date.now();

  try {
    const result = await createUser(await req.json());

    logger.info({
      event: "user.create.success",
      requestId,
      userId: result.id,
      durationMs: Date.now() - startedAt
    });

    return Response.json({ ok: true, data: result });
  } catch (error) {
    logger.error({
      event: "user.create.failure",
      requestId,
      durationMs: Date.now() - startedAt,
      error
    });

    throw error;
  }
}
```

## 审计日志

涉及权限、资金、账号安全、数据删除、管理员操作时，必须记录审计事件。

```ts
logger.info({
  event: "audit.user.role_changed",
  actorUserId,
  targetUserId,
  fromRole,
  toRole,
  requestId
});
```

## AI 写代码时的日志判断

- 修改后端代码前，先查项目是否已有 logger、requestId、审计日志或监控方案。
- 有现有方案时必须复用，不要新增另一套日志库或另一种日志格式。
- 没有统一 logger 时，不要随手添加 `console.log` 作为长期方案。
- 普通查询接口和纯计算逻辑不强制新增业务日志。
- 涉及登录、登出、权限拒绝、管理员操作、数据删除、支付、导入导出、异步任务、第三方调用失败时，应补充结构化日志或审计事件。
- 如果当前项目缺少 logger，但任务需要可靠日志，必须说明缺口，并优先补统一 logger 后再接入业务日志。
- 新增日志时只记录定位问题所需字段，不记录完整请求体、认证信息、密钥、隐私数据或大段业务内容。
- 日志不能代替错误处理、用户反馈、审计持久化或测试。

## 禁止项

- 禁止记录完整请求 body，除非已经明确脱敏。
- 禁止记录认证头、cookie、session、token。
- 禁止只输出字符串日志，例如 `logger.info("created user")`。
- 禁止用日志代替错误处理或测试。
