# Claude Rules Pack

Portable Claude Code rules + scaffolding pack. Drop this into a fresh React + TypeScript project as `.claude-rules/` and Claude follows the same conventions used in the source project: `useDrawer`-driven dialogs, RHF + Zod forms via `FormField`, Combobox-only selectors, the project's folder split, etc.

## Install

From the root of your new project:

```sh
npx degit alexhtech/react-ui-patterns .claude-rules
```

`degit` downloads a tarball — no `.git` folder, no history. Re-run the same command later to refresh the kit in place.

If you'd rather track upstream and pull updates with `git pull`, use:

```sh
git clone https://github.com/alexhtech/react-ui-patterns.git .claude-rules
```

Either way, Claude reads `.claude-rules/CLAUDE.md` and the referenced `docs/*` directly from the cloned folder. No further copying needed.

> **Tip:** add `.claude-rules/` to your project's `.gitignore` so the kit isn't checked in alongside your code (each developer can `degit` it themselves). Or commit it intentionally if you want a pinned version per project.

## How Claude uses this

When Claude Code starts a session in your project, it:

1. Loads your project's root `CLAUDE.md` (if you have one) — symlink or copy `.claude-rules/CLAUDE.md` to your repo root, **or** add `@./.claude-rules/CLAUDE.md` to your existing root `CLAUDE.md`.
2. From there, the rules pull in `@./.claude-rules/docs/*.md` automatically.
3. When Claude needs to scaffold a helper this kit documents (drawer store, form-field, gql-client, etc.), it reads the matching file under `.claude-rules/helpers/` and writes the actual `.ts` / `.tsx` into your `src/` at the path the helper specifies.
4. When Claude needs an opinionated config (`tsconfig`, `eslint`, `prettier`, `components.json`), it reads from `.claude-rules/config/` and writes the file into your repo root.

## Layout

```
.claude-rules/
  README.md                # this file
  CLAUDE.md                # rules index — point your project's root CLAUDE.md at this
  docs/                   # rule docs (modals, forms, components, data-fetching, ...)
  helpers/                 # markdown wrappers around custom helpers — code + why + when
    drawers-store.md
    form-field.md
    gql-client.md          # GraphQL projects only
    use-gql-query.md       # GraphQL projects only
    unwrap.md
  config/                  # opinionated configs the agent can recreate at your repo root
    tsconfig.json
    tsconfig.app.json
    tsconfig.node.json
    eslint.config.js
    prettier.config.mjs
    components.json
    codegen.ts             # GraphQL projects only
```

## Helpers

Each `helpers/*.md` is a self-contained spec: what the helper solves, where it goes, when to use it, what to install, and the full code. Claude reads these on demand and writes the actual source file into your project's `src/`.

Bundled (custom, **not** in the shadcn registry — Claude must create these for you):

| Helper                                         | Target path                            |
| ---------------------------------------------- | -------------------------------------- |
| [`drawers-store.md`](helpers/drawers-store.md) | `src/core/drawers/drawers.store.ts`    |
| [`form-field.md`](helpers/form-field.md)       | `src/components/ui/form-field.tsx`     |
| [`unwrap.md`](helpers/unwrap.md)               | `src/utils/unwrap.ts`                  |
| [`gql-client.md`](helpers/gql-client.md)       | `src/core/gql-client/gql-client.ts`    |
| [`use-gql-query.md`](helpers/use-gql-query.md) | `src/core/gql-client/use-gql-query.ts` |

## shadcn primitives (install via CLI, don't bundle)

The rules also reference shadcn-registry primitives. Install them via the shadcn CLI rather than vendoring source:

```sh
npx shadcn@latest add button combobox dialog field input input-group sonner spinner textarea
```

The `components.json` config is set for the Base UI variant, so the CLI gives you `@base-ui/react`-backed primitives that match what `form-field.tsx` and the rules expect.

The `cn` utility lives in `src/lib/utils.ts` (or wherever your `components.json` points) — shadcn creates it automatically when you add the first component.

## Runtime peer deps

The bundled helpers and shadcn primitives expect these. Install whatever's missing:

```sh
yarn add @base-ui/react @tanstack/react-query react-hook-form @hookform/resolvers zod zustand sonner lucide-react clsx tailwind-merge class-variance-authority tw-animate-css tiny-invariant
```

GraphQL projects also need:

```sh
yarn add graphql
yarn add -D @graphql-codegen/cli @graphql-codegen/client-preset
```

## Adapting paths

The rules and helper docs reference `@/core/...`, `@/components/ui/...`, `@/utils/...` — assuming `paths: { "@/*": ["./src/*"] }`. The bundled `config/tsconfig.json` already sets this. If your project uses a different alias, change the alias once in `tsconfig.json` and find/replace `@/` in `docs/*.md` and `helpers/*.md` to match.

## What's _not_ included

- App code, routes, layout. Rules + scaffolding only.
- A GraphQL schema. `gql-client.md` documents the dependency on a generated `@/core/gql/graphql` and on consumer-provided `auth.store` / `config.service` — adapt or stub.
- A `cn` utility. shadcn creates that itself when you add the first component.
