# Styling (Tailwind)

## Rules

- Use the `cn()` utility for conditional classes.
- Prefer Tailwind utilities over custom CSS.
- Use CSS variables for theming via `--color-*` tokens.
- Use semantic color names (`primary`, `secondary`, `muted`, `destructive`, `popover`, `border`, `ring`).
- No inline `style` objects.
- shadcn components are installed via CLI only: `npx shadcn@latest add <component>`. Don't hand-edit generated primitives unless restyling.
- Don't ship arbitrary px values when a token exists. Prefer `gap-2` over `gap-[8px]`, `text-sm` over `text-[14px]`.

## `cn` for conditionals

```tsx
import { cn } from '@/utils/cn';

// ✅
<div className={cn('flex items-center gap-2', isActive && 'bg-primary', className)} />

// ❌
<div className={`flex items-center gap-2 ${isActive ? 'bg-primary' : ''}`} />
```

`cn` merges duplicate utilities correctly via `tailwind-merge`, so consumer overrides win:

```tsx
// padding from caller overrides p-4 from the component
<Card className='p-8'>...</Card>
```

## State variants

Use Tailwind's pseudo-class prefixes — don't track state in JS just to swap classes.

```tsx
<button className='bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:cursor-not-allowed'>
  Save
</button>
```

```tsx
<input className='border-input focus:border-ring focus:ring-2 focus:ring-ring/20 invalid:border-destructive' />
```

## `data-*` state (shadcn / Base UI primitives)

Primitives expose their state on `data-state`, `data-disabled`, etc. Style by attribute, not by branching JSX.

```tsx
<DialogContent className='data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0' />
```

```tsx
<TabsTrigger className='data-[state=active]:bg-background data-[state=active]:text-foreground' />
```

## `group` and `peer`

Style children based on a parent's state without JS.

```tsx
<a className='group flex items-center gap-2 rounded-md p-2 hover:bg-accent'>
  <Icon className='text-muted-foreground group-hover:text-foreground' />
  <span>Settings</span>
</a>
```

```tsx
<Input className='peer' />
<Label className='peer-disabled:opacity-50' />
```

## Truncation / line clamping

```tsx
<span className='truncate'>{longSingleLine}</span>
<p className='line-clamp-2'>{longMultiLine}</p>
```

## Responsive

Default to mobile, layer up with `sm: md: lg:`:

```tsx
<div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3' />
```

## Dark mode

Variants are driven by the `dark` class on `<html>`. Token-driven colors flip automatically — only reach for `dark:` overrides for one-offs:

```tsx
<div className='bg-card text-card-foreground'>
  {/* automatically themed */}
</div>

<div className='border border-zinc-200 dark:border-zinc-800'>
  {/* explicit override when tokens don't fit */}
</div>
```

## Composing variants with CVA

For components with multiple visual states, use `class-variance-authority` instead of conditional `cn` chains. See [components.md](components.md).
