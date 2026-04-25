# Custom Hooks

- Prefix with `use`. Keep focused on a single concern.
- When wrapping React Query (queries, mutations, anything else), **preserve the original return type** — don't cherry-pick fields into a custom object. This keeps the hook compatible with React Query patterns (suspense, error boundaries, `select`, etc.).
- Hook arguments should mirror the underlying query/mutation options — accept overrides for `enabled`, `staleTime`, `select`, `onSuccess`, etc. when useful.
- Applies to queries, suspense queries, and mutations alike.

```ts
// ✅ Good: full query result + option overrides
export const useUser = (userId: string, options?: Partial<UseSuspenseQueryOptions>) => {
  return useGqlSuspenseQuery({
    query: GetUser,
    variables: { id: userId },
    ...options,
  });
};
```

```ts
// ✅ Good: mutation hook preserving return type
export const useUpdateUser = (options?: Partial<UseMutationOptions<UpdateUserResult, Error, UpdateUserVariables>>) => {
  return useGqlMutation({
    mutation: UpdateUser,
    ...options,
  });
};
```

```ts
// ❌ Bad: hides React Query's return type
export const useUser = (userId: string) => {
  const query = useGqlSuspenseQuery({ query: GetUser, variables: { id: userId } });
  return { user: query.data.user, isLoading: query.isLoading, refetch: query.refetch };
};
```
