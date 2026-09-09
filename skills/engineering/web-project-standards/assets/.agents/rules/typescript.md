# TypeScript Rules

## 基本规则

- 前端、后端、共享代码、测试和脚本默认使用 TypeScript。
- 必须开启 `strict: true`。
- 禁止为了通过编译随意使用 `any`、`unknown as T`、`// @ts-ignore`、`eslint-disable`。
- 公共函数、API 边界、导出类型必须有清晰类型。
- 优先使用 `type` 导入：`import type { User } from "./user"`。

## 类型边界

- 外部输入先用 schema 校验，再进入业务逻辑。
- API 边界使用 DTO/contract 类型，不直接暴露数据库模型。
- 日期在 API 边界使用 ISO 字符串，不直接传 `Date` 对象。
- 金额、精度敏感数值优先使用字符串或最小单位整数。

## 异步规则

- Promise 必须被 `await`、`return` 或显式处理。
- 不要吞掉异常；错误必须转换成稳定的业务错误或向上抛出。
- 并发任务优先使用 `Promise.all`，但要明确失败语义。

```ts
const [user, permissions] = await Promise.all([
  userRepository.findById(userId),
  permissionRepository.listByUserId(userId)
]);
```
