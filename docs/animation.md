# Animation

## Policy

1. **Default to CSS / Tailwind.** Most animations in this app are entry/exit fades, slides, hover transitions, loaders — none of that needs a JS animation library.
2. **Use `tw-animate-css`** (already installed, used by shadcn under the hood) for keyframe utilities: `animate-in`, `animate-out`, `fade-in`, `slide-in-from-top`, `zoom-in`, `spin`, `pulse`, etc.
3. **Don't install `motion` (Framer Motion)**. Only reach for it when an animation genuinely cannot be expressed in CSS — e.g. shared layout transitions across unrelated trees, gesture-driven physics, complex orchestration with derived values.
4. **Ask the user before installing any new package.** Always. Including `motion`. Don't run `yarn add` on your own initiative.

## Common patterns (CSS / Tailwind)

### Transitions on state

```tsx
<button className='transition-colors duration-150 hover:bg-primary/90 disabled:opacity-50'>
  Save
</button>
```

```tsx
<div className='transition-transform duration-200 group-hover:scale-105'>...</div>
```

### Entry / exit (e.g. dropdown, popover, sheet content)

`tw-animate-css` provides `animate-in` / `animate-out` paired with direction utilities. shadcn's primitives wire these to `data-state` attributes:

```tsx
<div className='animate-in fade-in-0 zoom-in-95 duration-150'>...</div>

<div className='data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95'>
  ...
</div>
```

### Slide-in (sheets, drawers)

```tsx
<div className='animate-in slide-in-from-right duration-200'>...</div>
```

### Loaders / spinners

```tsx
<Loader2 className='size-4 animate-spin text-muted-foreground' />
```

### Skeleton / pulse

```tsx
<div className='h-4 w-32 animate-pulse rounded bg-muted' />
```

### Conditional animation via `cn`

```tsx
<div className={cn('transition-opacity duration-200', isVisible ? 'opacity-100' : 'opacity-0')} />
```

## When CSS isn't enough

If you genuinely need:

- A shared element transition between two unrelated React trees.
- Gesture-driven physics (swipe-to-dismiss with springs).
- Sequenced orchestration where one element's animation triggers another's based on derived state.

…stop and ask the user before adding `motion`. Describe the animation, what you tried with CSS, and why it's insufficient. Don't install on your own.
