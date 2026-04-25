# Code Style

## General

- Functional components, arrow function syntax.
- TypeScript strict mode — no `any` unless absolutely necessary; prefer `unknown` if the type is truly unknown.
- Prefer named exports over default exports.
- Barrel exports (`index.ts`) for clean imports.
- Keep components small and focused.
- Colocate related code (component, styles, tests, stories).

## TypeScript

- Prefer `type` over `interface` for object shapes and props.
- No `React.FC` — use explicit props types.
- Use `ComponentProps<"element">` to extend HTML element props.
- Use `as const` for literal types.
- Don't use `@ts-ignore`. Don't disable lint rules without a comment explaining why.

```ts
// ✅ Good
export type UserProps = { id: string; name: string; email?: string };
export const User = (props: UserProps) => { ... };

// ❌ Bad
const User: React.FC<{ id: string; name: string }> = (props) => { ... };
export default User;
```

## Import order (Prettier handles this)

1. External packages (react, libraries)
2. Internal aliases (`@/*`)
3. Relative imports (`./`, `../`)

```ts
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/core/auth/use-auth';

import { UserAvatar } from './user-avatar';
```

## Don'ts

- No `any`.
- No `React.FC`.
- No deeply nested component hierarchies — extract.
- No business logic in components — extract to hooks/utils.
- No `index` as React key for dynamic lists.
- No direct mutation — always use immutable updates.
