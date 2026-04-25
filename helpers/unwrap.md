# Helper: `unwrap`

## Why this exists

A fail-fast assertion for values that **must** be present at boot. Throws a clear error instead of letting `undefined` propagate into a request URL or a config consumer.

## Where to put it

`src/utils/unwrap.ts`

## When to use it

- Reading `import.meta.env.VITE_*` env vars in `config.service.ts`. If a deploy is missing a required env var, you want a loud crash on import, not a mysterious `undefined` in a fetch URL three layers deep.
- Any other system-boundary value that's required for the app to function at all.

Don't use it for runtime nullable values that legitimately may be absent (use proper conditional rendering or `tiny-invariant` for those).

## Dependencies

None.

## Code

```ts
export const unwrap = <T>(value: T | undefined | null, message?: string): T => {
  if (value === undefined || value === null) {
    throw new Error(message || 'Value is undefined');
  }
  return value;
};
```

## Typical usage

```ts
// src/core/config/config.service.ts
import { unwrap } from '@/utils/unwrap';

export const config = {
  apiUrl: unwrap(import.meta.env.VITE_API_URL, 'VITE_API_URL is required'),
  gqlUrl: unwrap(import.meta.env.VITE_GQL_URL, 'VITE_GQL_URL is required'),
};
```
