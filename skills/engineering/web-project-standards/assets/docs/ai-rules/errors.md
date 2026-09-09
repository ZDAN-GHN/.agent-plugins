# Error Rules

## 错误响应

所有接口错误必须返回稳定结构：

```ts
export type ApiFailure = {
  ok: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};
```

前端展示优先使用 `message`，逻辑分支使用 `code`。不要依赖后端异常文本做业务判断。

## 错误码规范

- 使用大写 snake case：`USER_EMAIL_EXISTS`、`AUTH_SESSION_EXPIRED`。
- 错误码必须稳定，不要随文案变化而变化。
- 错误码按领域前缀分组：`AUTH_`、`USER_`、`ORDER_`、`PAYMENT_`。
- 新增错误码时必须检查前端处理、测试和日志。

```ts
// packages/shared/src/contracts/errors.ts
export const ErrorCodes = {
  UserEmailExists: "USER_EMAIL_EXISTS",
  AuthSessionExpired: "AUTH_SESSION_EXPIRED",
  ValidationFailed: "VALIDATION_FAILED",
  InternalError: "INTERNAL_ERROR"
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];
```

## 业务异常

```ts
// apps/api/src/errors/app-error.ts
import type { ErrorCode } from "@repo/shared/contracts/errors";

export class AppError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
    public readonly status = 400,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "AppError";
  }
}
```

## 错误转换

HTTP 边界负责把异常转换成稳定响应。不要把内部异常栈、SQL、token、密钥、第三方原始错误直接返回给前端。

```ts
// apps/api/src/errors/to-api-error.ts
import { ErrorCodes } from "@repo/shared/contracts/errors";
import { AppError } from "./app-error";

export function toApiError(error: unknown) {
  if (error instanceof AppError) {
    return {
      status: error.status,
      body: {
        ok: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details
        }
      }
    };
  }

  return {
    status: 500,
    body: {
      ok: false,
      error: {
        code: ErrorCodes.InternalError,
        message: "Internal server error"
      }
    }
  };
}
```

## 禁止项

- 禁止 `catch` 后静默失败。
- 禁止向前端返回 `error.stack`。
- 禁止用 `throw new Error("xxx")` 表达可预期业务错误。
- 禁止前端通过匹配错误文案判断业务分支。
