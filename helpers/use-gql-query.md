# Helper: `useGqlQuery` / `useGqlSuspenseQuery` / `useGqlMutation`

## Why this exists

The thin React Query hook layer that sits on top of [`gqlClient`](gql-client.md). Each hook takes the codegen-generated `TypedDocumentString` and:

- For queries: builds a stable `queryKey` ([operation name, variables]) so invalidation is straightforward.
- For mutations: uses the operation name as `mutationKey` and wires `mutationFn` automatically.

The hook return types are deliberately the raw `useQuery` / `useSuspenseQuery` / `useMutation` results — no cherry-picking. The custom-hooks rule ([`docs/hooks.md`](../docs/hooks.md)) requires preserving those return types so consumers keep access to `select`, `enabled`, suspense, error boundaries, etc.

## Where to put it

`src/core/gql-client/use-gql-query.ts`

## When to use it

- **Every** GraphQL data fetch / mutation in the app. Per [`docs/data-fetching.md`](../docs/data-fetching.md), never `useEffect` for fetching, never raw `fetch` against the GraphQL endpoint.
- `useGqlQuery` for normal queries, `useGqlSuspenseQuery` when the surrounding component is wrapped in `<Suspense>`, `useGqlMutation` for mutations.
- Wrap each in a domain hook (`useUser`, `useCreateTodo`, etc.) per the hooks-rule pattern. The wrapper passes options through; it doesn't repackage the return.

## Dependencies

```sh
yarn add @tanstack/react-query graphql
```

Plus the bundled [`gql-client`](gql-client.md) and the codegen-generated `@/core/gql/graphql`.

## Code

```ts
import {
  type UseMutationOptions,
  type UseQueryOptions,
  type UseSuspenseQueryOptions,
  useMutation,
  useQuery,
  useSuspenseQuery,
} from '@tanstack/react-query';
import { getOperationAST, parse } from 'graphql';

import type { TypedDocumentString } from '@/core/gql/graphql';

import { type ExecuteOptions, gqlClient } from '@/core/gql-client/gql-client';

export function useGqlQuery<TQueryFnData = unknown, TVariables = unknown>(
  options: ExecuteOptions<TQueryFnData, TVariables> & Partial<UseQueryOptions<TQueryFnData, Error, TQueryFnData>>,
) {
  const queryOptions = gqlClient.queryOptions(options);
  return useQuery(queryOptions);
}

export function useGqlSuspenseQuery<TQueryFnData = unknown, TVariables = unknown>(
  options: ExecuteOptions<TQueryFnData, TVariables> &
    Partial<UseSuspenseQueryOptions<TQueryFnData, Error, TQueryFnData>>,
) {
  const queryOptions = gqlClient.queryOptions(options);
  return useSuspenseQuery(queryOptions);
}

type UseGqlMutationOptions<TResult, TVariables> = {
  mutation: TypedDocumentString<TResult, TVariables>;
  skipAuth?: boolean;
} & Partial<UseMutationOptions<TResult, Error, TVariables>>;

export function useGqlMutation<TResult, TVariables>(options: UseGqlMutationOptions<TResult, TVariables>) {
  const { mutation, skipAuth, ...rest } = options;
  const name = getOperationAST(parse(mutation.toString()))?.name?.value;

  if (!name) {
    throw new Error('Mutation must have a name');
  }

  return useMutation<TResult, Error, TVariables extends Record<string, never> ? never : TVariables>({
    mutationKey: [name],
    mutationFn: (variables) => gqlClient.execute({ query: mutation, skipAuth, variables }),
    ...rest,
  });
}
```
