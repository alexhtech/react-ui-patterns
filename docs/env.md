# Environment Variables

Use `import.meta.env` for env vars. Prefix with `VITE_` for client-side.

```ts
// src/core/config/config.service.ts
import { unwrap } from '@/utils/unwrap';

export const config = {
  apiUrl: unwrap(import.meta.env.VITE_API_URL),
  graphqlUrl: unwrap(import.meta.env.VITE_GQL_URL),
};
```

`unwrap` throws if the value is undefined / null — fail-fast on missing config rather than letting `undefined` propagate into requests.
