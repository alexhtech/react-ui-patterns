# Project Structure & Naming

## Folders

```
src/
├── app/                    # Application pages and routes
│   ├── [feature]/          # Feature-specific pages
│   │   ├── components/     # Page-specific components (optional)
│   │   ├── [feature].tsx   # Main page component
│   │   └── index.ts        # Barrel export
│   ├── layout/             # Layout components
│   ├── providers.tsx       # App providers (QueryClient, Router, etc.)
│   ├── routes.tsx          # Route definitions
│   └── app.tsx             # Root app component
├── common/                 # Shared/common components
│   └── [component]/
│       ├── [component].tsx
│       ├── [component].stories.tsx  # Storybook (optional)
│       └── index.ts
├── components/             # UI components
│   ├── ui/                 # shadcn/ui components
│   └── [component]/
│       ├── [component].tsx
│       └── index.ts
├── core/                   # Core services and utilities
│   ├── api/                # API client configuration, query client
│   ├── auth/               # Authentication logic
│   ├── config/             # App configuration
│   ├── drawers/            # Drawer/modal state management
│   ├── gql/                # Generated GraphQL types
│   ├── gql-client/         # GraphQL client wrapper
│   └── [domain]/           # Domain-specific core logic
├── gql/                    # GraphQL operations (queries, mutations, fragments)
│   └── [domain]/
│       ├── [operation].ts
│       └── [fragment].fragment.ts
├── hooks/                  # Global custom hooks
├── types/                  # Global TypeScript types
├── utils/                  # Utility functions
├── styles/                 # Global styles
│   └── main.css
└── assets/                 # Static assets
```

The structure is extensible — add new top-level folders under `src/` when a clear need arises.

## File naming

- Components: `kebab-case.tsx` (e.g., `user-profile.tsx`)
- Hooks: `use-[name].ts` (e.g., `use-auth.ts`)
- Types: `[name].types.ts` or inline in component
- Utils: `kebab-case.ts` (e.g., `format-date.ts`)
- GraphQL: `[operation-name].ts` (e.g., `get-user.ts`)
- Fragments: `[name].fragment.ts`
- Stories: `[component].stories.tsx`
- Tests: `[component].test.tsx`
