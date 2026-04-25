# Performance

- Use React Suspense with `useSuspenseQuery` for optimal loading UX where it fits.
- Code-split with `React.lazy()`.
- Set `staleTime` in React Query to reduce refetches.
- Virtualize long lists with `@tanstack/react-virtual`.
- Memoize expensive computations with `useMemo`. Use `useCallback` for callbacks passed to memoized children.
- Optimize images and other static assets.
