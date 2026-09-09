# Testing Rules

## 基本规则

- contract、纯函数、错误处理、接口封装必须有单元测试。
- 修 bug 必须先补能失败的测试，再修复。
- 测试不依赖真实外部服务；需要时使用 mock 或测试容器。
- 行为变更必须补充或更新测试；无法测试时必须说明原因和风险。

## Contract 测试示例

```ts
// packages/shared/src/contracts/user.test.ts
import { describe, expect, it } from "vitest";
import { UserSchema } from "./user";

describe("UserSchema", () => {
  it("accepts valid user payload", () => {
    expect(() =>
      UserSchema.parse({
        id: "user_1",
        name: "Ada",
        email: "ada@example.com",
        createdAt: "2026-01-01T00:00:00.000Z"
      })
    ).not.toThrow();
  });

  it("rejects invalid email", () => {
    expect(() =>
      UserSchema.parse({
        id: "user_1",
        name: "Ada",
        email: "invalid",
        createdAt: "2026-01-01T00:00:00.000Z"
      })
    ).toThrow();
  });
});
```
