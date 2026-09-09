# Frontend Rules

## 基本规则

- 组件只负责渲染和交互，不直接拼接后端数据结构。
- API 调用集中在 `api/` 或 feature 内的 data-access 文件中。
- 表单输入必须使用 shared schema 或从 shared schema 派生。
- UI 状态使用明确的 loading、error、empty、success 分支。
- 前端不手写响应类型，只从 shared contract 导入类型。

## 组件示例

```tsx
// apps/web/src/features/users/user-card.tsx
import type { User } from "@repo/shared/contracts/user";

type UserCardProps = {
  user: User;
};

export function UserCard({ user }: UserCardProps) {
  return (
    <article>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </article>
  );
}
```

## React Query 示例

React 项目中可以在 typed request 基础上使用 TanStack Query：

```ts
// apps/web/src/features/users/use-user.ts
import { useQuery } from "@tanstack/react-query";
import { getUser } from "../../api/users";

export function useUser(userId: string) {
  return useQuery({
    queryKey: ["users", userId],
    queryFn: async () => {
      const result = await getUser(userId);
      if (!result.ok) {
        throw new Error(result.error.message);
      }
      return result.data;
    }
  });
}
```
