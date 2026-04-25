# Tech Stack

- **Framework**: React 19+ with Vite
- **Language**: TypeScript (strict mode)
- **Package Manager**: Yarn — always use `yarn`
- **Styling**: Tailwind CSS v4 + shadcn/ui + cva (class-variance-authority)
- **State Management**: Zustand with `combine` middleware
- **Data Fetching (GraphQL)**: TanStack Query v5 + GraphQL (with graphql-codegen)
- **Data Fetching (REST)**: TanStack Query v5 + openapi-fetch + openapi-react-query
- **Routing**: React Router v7
- **Forms**: React Hook Form + Zod validation
- **Animation**: `tw-animate-css` (Tailwind keyframe utilities, used by shadcn under the hood). `motion` (Framer Motion) is **not** installed by default — see [animation.md](animation.md).
- **UI Primitives**: Base UI (`@base-ui/react`), Vaul (drawers), Sonner (toasts) — shadcn registry components are compiled against Base UI in this project, not Radix.
- **Icons**: Lucide React
- **Utilities**: clsx, tailwind-merge, date-fns, cva, tiny-invariant
- **Linting/Formatting**: ESLint (flat config) + Prettier
