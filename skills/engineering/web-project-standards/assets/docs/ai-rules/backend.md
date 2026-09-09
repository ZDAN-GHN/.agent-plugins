# Backend Rules

## 分层

后端代码按边界分层：

```txt
routes/       # HTTP 入出口，负责解析请求和返回响应
services/     # 业务流程
repositories/ # 数据访问
contracts/    # 只在 shared 中定义；后端只导入
```

## 基本规则

- route/controller 只负责协议适配、输入校验、响应转换。
- service 负责业务流程，不直接处理 HTTP 细节。
- repository 负责数据访问，不返回未经过滤的敏感字段给 API。
- 后端不直接暴露数据库模型，必须转换为 contract 指定的 DTO。
- 鉴权、权限、审计逻辑必须放在明确边界，不能散落在 UI 或临时代码中。

## 示例

```ts
// apps/api/src/services/users.ts
import type { CreateUserInput, User } from "@repo/shared/contracts/user";

export async function createUser(input: CreateUserInput): Promise<User> {
  const existing = await userRepository.findByEmail(input.email);
  if (existing) {
    throw new AppError("USER_EMAIL_EXISTS", "Email is already used");
  }

  const created = await userRepository.create(input);

  return {
    id: created.id,
    name: created.name,
    email: created.email,
    createdAt: created.createdAt.toISOString()
  };
}
```
