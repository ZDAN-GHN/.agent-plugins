# Engineering Rules

## 默认工具链

- 包管理器：`pnpm`
- 类型检查：`tsc --noEmit`
- Lint：ESLint flat config + `typescript-eslint`
- Format：Prettier
- Test：Vitest

推荐脚本：

```json
{
  "scripts": {
    "typecheck": "tsc --noEmit",
    "lint": "eslint .",
    "format": "prettier . --write",
    "format:check": "prettier . --check",
    "test": "vitest run",
    "test:watch": "vitest",
    "verify": "pnpm typecheck && pnpm lint && pnpm test"
  }
}
```

## TypeScript 配置

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "skipLibCheck": true
  }
}
```

## ESLint flat config

```ts
// eslint.config.ts
import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig(
  js.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname
      }
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/consistent-type-imports": "error"
    }
  }
);
```

## 目录结构

Monorepo 项目优先使用：

```txt
apps/
  web/
  api/
packages/
  shared/
    src/
      contracts/
      errors/
      utils/
```

非 monorepo 项目使用：

```txt
src/
  frontend/
  backend/
  shared/
    contracts/
    errors/
    utils/
```
