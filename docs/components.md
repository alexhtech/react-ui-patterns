# Components

## One component per file

Each `.tsx` file exports **exactly one** component. If a component grows large enough that it needs internal sub-components, extract each into its own file in the same folder.

- Tightly coupled? Colocate them next to the parent: `user-profile/user-profile.tsx`, `user-profile/user-profile-header.tsx`, `user-profile/user-profile-stats.tsx`.
- Same-file render-prop helpers, even tiny ones, still get their own file.
- Sole exception: trivial inline render-prop callbacks that aren't named React components (e.g. `{(item) => <li key={item.id}>{item.label}</li>}`) — those are fine inline.

Why: easier to grep, easier to import, easier to refactor, easier to spot when a file is doing too much. Don't bury components inside other components.

## Pattern

```tsx
type ButtonProps = {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  loading?: boolean;
  onClick?: () => void;
} & ComponentProps<'button'>;

export const Button = (props: ButtonProps) => {
  const { children, variant = 'primary', loading, onClick, className, ...rest } = props;

  return (
    <button
      className={cn(buttonVariants({ variant }), className)}
      disabled={loading}
      onClick={onClick}
      {...rest}
    >
      {loading ? <Loader2 className='animate-spin size-4' /> : children}
    </button>
  );
};
```

## CVA for variants

Use `class-variance-authority` instead of conditional class strings.

```ts
import { type VariantProps, cva } from 'class-variance-authority';

const buttonVariants = cva('cursor-pointer transition flex items-center justify-center disabled:opacity-50', {
  variants: {
    variant: {
      primary: 'bg-primary text-primary-foreground',
      secondary: 'bg-secondary text-foreground',
      ghost: 'bg-transparent text-muted-foreground',
    },
    size: {
      sm: 'h-8 px-3 text-sm rounded-md',
      md: 'h-10 px-4 text-sm rounded-lg',
      lg: 'h-12 px-6 text-base rounded-xl',
    },
  },
  defaultVariants: { variant: 'primary', size: 'md' },
});

export type ButtonProps = ComponentProps<'button'> & VariantProps<typeof buttonVariants>;
```
