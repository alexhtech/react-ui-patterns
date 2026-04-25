# State Management (Zustand)

- Use local `useState` first.
- Use Zustand only for state shared across unrelated components.
- Always use the `combine` middleware.
- One store per domain concern, kept small and focused.
- Don't use Zustand for server state — use React Query.

```ts
import { create } from 'zustand';
import { combine } from 'zustand/middleware';

type StoreState = { count: number; user: User | null };

export const useStore = create(
  combine({ count: 0, user: null } as StoreState, (set, get) => ({
    increment: () => set({ count: get().count + 1 }),
    setUser: (user: User) => set({ user }),
    reset: () => set({ count: 0, user: null }),
  })),
);
```

For dialog / drawer state, see [modals.md](modals.md) — `useDrawer` is the canonical pattern.
