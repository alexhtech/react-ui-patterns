# API & Data Fetching

## General

- Never use raw `useEffect` for data fetching.
- Use React Suspense with `useSuspenseQuery` for optimal loading UX where it fits.
- Set appropriate `staleTime` in React Query.

## REST (openapi-fetch + openapi-react-query)

- Typed clients are generated from OpenAPI schemas. Don't hand-write request/response types.
- Use `openapi-react-query` for React Query integration.
- API client setup lives in `src/core/api/`.

## GraphQL (graphql-codegen + TanStack Query)

- `@graphql-codegen/cli` with the client preset generates types into `src/core/gql/`.
- GraphQL operations (queries, mutations, fragments) live in `src/gql/[domain]/`.
- Use the project hook wrappers: `useGqlQuery`, `useGqlSuspenseQuery`, `useGqlMutation`.

```ts
// gql/users/get-user.ts
import { graphql } from '@/core/gql';

export const GetUser = graphql(`
  query GetUser($id: UUID!) {
    user(id: $id) {
      ...User
    }
  }
`);
```

```ts
// usage
import { useGqlQuery, useGqlSuspenseQuery, useGqlMutation } from '@/core/gql-client/use-gql-query';

const { data, isLoading } = useGqlQuery({ query: GetUser, variables: { id: userId } });

const { data } = useGqlSuspenseQuery({ query: GetUser, variables: { id: userId } });

const mutation = useGqlMutation({
  mutation: UpdateUser,
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['GetUser'] }),
});
```
