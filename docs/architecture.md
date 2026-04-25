# Architecture & Code Principles

## SOLID

- **Single Responsibility**: Each component, hook, and utility does one thing. If a component handles both data fetching and presentation, split into container + presentational.
- **Open/Closed**: Extend via props (variants, slots, children) instead of editing existing components for each new use case.
- **Liskov Substitution**: Shared component props should be compatible. If you extend `ComponentProps<"button">`, it should behave like a button.
- **Interface Segregation**: Don't force components to accept props they don't use. Split large prop types into smaller, composable ones.
- **Dependency Inversion**: Components depend on abstractions (hooks, context) — not concrete implementations. Data-fetching logic lives in hooks, not components.

## DRY

- Extract repeated logic into custom hooks.
- Extract repeated UI patterns into shared components (`src/common/`).
- Extract repeated class combinations into cva variants.
- Use `cn()` instead of duplicating conditional class logic.
- If you copy-paste code more than twice, extract it.

## Component size & decoupling

- **Ideal size: ~200 lines** — not a hard limit, but a signal to consider splitting.
- Larger is fine when the logic is cohesive and splitting would add unnecessary indirection.
- When a component grows, decouple by extracting:
  - **Sub-components** with meaningful names (`UserProfileHeader`, not `Section1`).
  - **Custom hooks** for stateful logic (`useUserForm`, `useFilterState`).
  - **Utility functions** for pure transformations.
- Name extracted pieces by what they represent, not where they came from.
- Colocate sub-components in the same folder when only the parent uses them.
