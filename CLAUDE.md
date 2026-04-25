# Development Rules

UI patterns first — most work in this app touches a dialog or a form.

- @docs/modals.md — dialog shell (state, layout, fetch-by-id vs. fallback).
- @docs/forms.md — RHF + Zod, `FormField`, selectors, submit flow.

Foundations:

- @docs/tech-stack.md — frameworks, libraries, package manager.
- @docs/project-structure.md — folder layout and file naming.
- @docs/code-style.md — TypeScript, imports, named exports.
- @docs/components.md — component pattern + CVA variants.
- @docs/styling.md — Tailwind, `cn`, no inline styles.

State & data:

- @docs/state.md — Zustand rules.
- @docs/data-fetching.md — REST (openapi-fetch) + GraphQL (codegen + custom hooks).
- @docs/hooks.md — custom hook patterns.

App layers:

- @docs/routing.md — React Router v7.
- @docs/animation.md — Motion patterns.
- @docs/error-handling.md — invariant, error boundaries, toasts.
- @docs/env.md — `import.meta.env` + `unwrap`.

Quality:

- @docs/architecture.md — SOLID, DRY, component size.
- @docs/performance.md — Suspense, code splitting, virtualization.
- @docs/accessibility.md — a11y basics.
- @docs/linting.md — ESLint + Prettier.
