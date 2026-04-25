# Helper: `drawersStore` + `useDrawer`

## Why this exists

The dialog rules in [`docs/modals.md`](../docs/modals.md) mandate `useDrawer` as the default state pattern for any dialog that's opened from outside its parent component or that needs params for fetching. This helper provides:

- A single Zustand store keyed by drawer name, so any dialog can be `open()`-ed from anywhere without prop drilling.
- A typed `useDrawer<Params>(key)` hook that returns a discriminated union: when `isOpen` is true, `params` is required; when false, optional.
- Lazy unmounting handled by the `Dialog` component itself (Radix / Base UI) — the store just tracks open/close + params.

Without this helper, the modal rules don't apply.

## Where to put it

`src/core/drawers/drawers.store.ts`

## When to use it

- Every dialog in the app that has a trigger somewhere other than its parent component.
- Every dialog whose body needs parameters (id, entity, etc.) for a query.
- Skip only for trivial dialogs tied to a single parent (e.g. a confirm in the same component) — for those, plain `open` / `onOpenChange` props are fine.

See the full lifecycle in [`docs/modals.md`](../docs/modals.md): drawer key → `useDrawer<Params>` hook → dialog component branches on `if (!params) return null` → body component reads `params` typed.

## Dependencies

```sh
yarn add zustand
```

## Code

```ts
import { create } from 'zustand';
import { combine } from 'zustand/middleware';

type DrawersState<T> = {
  [drawerKey: string]: { isOpen: boolean | undefined; params: T };
};

export const drawersStore = create(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  combine({} as DrawersState<any>, (set, get) => ({
    open: <T>(drawerKey: string, params?: T) => {
      set({ [drawerKey]: { params, isOpen: true } });
    },
    close: (drawerKey: string) => {
      set({ [drawerKey]: { ...get()[drawerKey], isOpen: false } });
    },
  })),
);

type OpenDrawer<T> = { isOpen: true; params: T };
type ClosedDrawer<T> = { isOpen: false; params?: T };

type UseDrawerReturn<T = never> = (OpenDrawer<T> | ClosedDrawer<T>) & {
  open: [T] extends [never] ? () => void : (params: T) => void;
  close: () => void;
};

export const useDrawer = <Params = never>(key: string): UseDrawerReturn<Params> => {
  const state = drawersStore<DrawersState<Params>[0] | undefined>((state) => state[key]);

  return {
    isOpen: state?.isOpen ?? false,
    params: state?.params,
    open: <T>(params?: T) => drawersStore.getState().open<T>(key, params),
    close: () => drawersStore.getState().close(key),
  } as UseDrawerReturn<Params>;
};
```
