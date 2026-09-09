# API Contract Rules

前后端必须共享 API contract。请求参数、响应数据、错误码、分页结构、枚举值必须从共享 contract 层导出。

禁止：

```ts
// frontend/types/user.ts
// 禁止前端手写后端响应类型
export interface User {
  id: string;
  name: string;
}
```

必须：

```ts
// packages/shared/src/contracts/user.ts
import { z } from "zod";

export const UserSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  email: z.string().email(),
  createdAt: z.string().datetime()
});

export type User = z.infer<typeof UserSchema>;

export const CreateUserInputSchema = z.object({
  name: z.string().min(1),
  email: z.string().email()
});

export type CreateUserInput = z.infer<typeof CreateUserInputSchema>;
```

## 通用响应结构

```ts
// packages/shared/src/contracts/api.ts
import { z } from "zod";

export const ApiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.unknown().optional()
});

export type ApiError = z.infer<typeof ApiErrorSchema>;

export const createApiSuccessSchema = <T extends z.ZodType>(data: T) =>
  z.object({
    ok: z.literal(true),
    data
  });

export const ApiFailureSchema = z.object({
  ok: z.literal(false),
  error: ApiErrorSchema
});

export type ApiSuccess<T> = {
  ok: true;
  data: T;
};

export type ApiFailure = z.infer<typeof ApiFailureSchema>;
export type ApiResult<T> = ApiSuccess<T> | ApiFailure;
```

## 前端请求封装

前端请求必须接收 schema，并对服务端响应做运行时校验。

```ts
// apps/web/src/api/request.ts
import { z } from "zod";
import { ApiFailureSchema, type ApiResult } from "@repo/shared/contracts/api";

export async function request<T>(
  input: RequestInfo | URL,
  schema: z.ZodType<T>,
  init?: RequestInit
): Promise<ApiResult<T>> {
  const response = await fetch(input, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...init?.headers
    }
  });

  const json: unknown = await response.json();

  if (!response.ok) {
    const parsed = ApiFailureSchema.safeParse(json);
    return parsed.success
      ? parsed.data
      : {
          ok: false,
          error: {
            code: "HTTP_ERROR",
            message: `Request failed with status ${response.status}`
          }
        };
  }

  return {
    ok: true,
    data: schema.parse((json as { data?: unknown }).data)
  };
}
```

业务 API 文件只组合 contract 和请求函数：

```ts
// apps/web/src/api/users.ts
import {
  CreateUserInputSchema,
  UserSchema,
  type CreateUserInput
} from "@repo/shared/contracts/user";
import { request } from "./request";

export function getUser(userId: string) {
  return request(`/api/users/${userId}`, UserSchema);
}

export function createUser(input: CreateUserInput) {
  const body = CreateUserInputSchema.parse(input);

  return request("/api/users", UserSchema, {
    method: "POST",
    body: JSON.stringify(body)
  });
}
```

## 后端入口

后端入口必须用同一份 schema 校验请求和响应：

```ts
// apps/api/src/routes/users.ts
import {
  CreateUserInputSchema,
  UserSchema
} from "@repo/shared/contracts/user";

export async function createUserHandler(req: Request): Promise<Response> {
  const json: unknown = await req.json();
  const input = CreateUserInputSchema.parse(json);

  const user = await createUser(input);
  const data = UserSchema.parse(user);

  return Response.json({
    ok: true,
    data
  });
}
```

## 接口规则

- 前端不手写响应类型，只导入共享 contract。
- 后端不直接暴露数据库模型，必须转换为 contract 指定的 DTO。
- 所有外部输入必须经过 schema 校验。
- 所有接口错误必须返回稳定的 `{ ok: false, error: { code, message } }`。
- 日期在 API 边界使用 ISO 字符串，不直接传 `Date` 对象。
- 金额、精度敏感数值优先使用字符串或最小单位整数。
