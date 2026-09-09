# Database Rules

## 基本规则

- 数据库 schema 变更必须配套 migration。
- 不允许只改 ORM model 或类型定义而不生成迁移。
- 后端不直接把数据库模型返回给前端，必须转换为 shared contract DTO。
- 删除字段、改字段类型、改唯一约束属于高风险变更，必须检查读写路径、历史数据和回滚策略。
- seed 数据必须可重复执行，不依赖本地隐式状态。

## 推荐目录

```txt
apps/api/
  src/
    repositories/
    services/
  db/
    migrations/
    seed.ts
```

Monorepo 中也可以把数据库相关内容放在后端 package 内，除非项目已有独立 `packages/db`。

## Migration 规则

- migration 文件必须只表达一次明确的 schema 变更。
- migration 名称应描述意图，例如 `add-users-email-unique-index`。
- 生产数据迁移要考虑兼容期：先新增字段，再双写/回填，最后删除旧字段。
- 禁止在没有备份或回滚方案的情况下做破坏性变更。

## Repository 规则

repository 负责数据访问，不负责 HTTP，不返回未过滤的敏感字段。

```ts
// apps/api/src/repositories/users.ts
type UserRecord = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
};

export async function findUserByEmail(email: string): Promise<UserRecord | null> {
  return db.user.findUnique({
    where: { email }
  });
}
```

service 负责把数据库模型转换成 contract DTO。

```ts
// apps/api/src/services/users.ts
import type { User } from "@repo/shared/contracts/user";

function toUserDto(record: UserRecord): User {
  return {
    id: record.id,
    name: record.name,
    email: record.email,
    createdAt: record.createdAt.toISOString()
  };
}
```

## Seed 规则

```ts
// apps/api/db/seed.ts
async function seed() {
  await db.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      name: "Admin",
      passwordHash: await hashPassword("change-me")
    }
  });
}
```

seed 必须避免写入真实密钥、真实用户信息或不可重复的随机主数据。
