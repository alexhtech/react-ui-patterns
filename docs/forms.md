# Form Rules

Patterns for `react-hook-form` + Zod forms. Pairs with [modals.md](modals.md) — most forms in this app live inside dialogs.

## Schema (Zod)

- One `formSchema = z.object({...})`. Derive `type FormData = z.infer<typeof formSchema>`.
- **IDs**: `z.uuidv7()` (required) or `z.uuidv7().nullable()` (optional). Never `z.string()` for ids.
- **Enums**: `z.enum(SomeEnum)` directly on a TS enum (typically GraphQL-generated). Don't use `z.nativeEnum` (deprecated). Don't redeclare a string-literal array next to the enum.
- Validation lives in Zod, not in `onSubmit`.

## Form setup

- `useForm<FormData>({ resolver: zodResolver(formSchema), defaultValues })`.
- Reset when initial values change: `useEffect(() => form.reset({ ...EMPTY_VALUES, ...initialValues }), [initialValues, form])`. Same effect handles "open the form fresh" (drawer just remounted) and "data finished loading" (update flow).
- Cross-field reactions: `useWatch({ control, name })`. Never `form.watch()` — the linter warns and it isn't memoizable.
- Sync derived fields via `useEffect` + `form.setValue('x', v, { shouldValidate: true })`. Don't surface a derived field as a separate UI control — keep it in the schema, hidden.

## Fields: `FormField`

Use **`FormField`** from `@/components/ui/form-field` for every field. It wraps `Controller` + `Field` + `FieldLabel` + `FieldError` and exposes the controlled `field` via a render prop. Don't reach for raw `Controller` unless `FormField` genuinely can't express what you need.

```tsx
<FormField control={form.control} name='title' label='Title'>
  {(field) => <Input {...field} />}
</FormField>
```

Hint text under the label: pass `description` to `FormField` (renders `FieldDescription`).

```tsx
<FormField
  control={form.control}
  name='username'
  label='Username'
  description='Must be unique. Lowercase, no spaces.'
>
  {(field) => <Input {...field} />}
</FormField>
```

For grouping related fields under a single legend, wrap them in `FieldSet` from `@/components/ui/field`.

## Selectors

- `Combobox` only — never `Select` from `@/components/ui/select`.
- **Always extract a `Combobox` into its own component**. Per-form: next to the form / dialog. Reusable: `src/common/selectors/`.
- The extracted selector exposes `value` / `onChange` and slots into a `FormField` render prop:
  ```tsx
  <FormField control={form.control} name='priority' label='Priority'>
    {(field) => <PrioritySelect value={field.value} onChange={field.onChange} />}
  </FormField>
  ```
- Required Combobox props: `items`, `value`, `onValueChange`, `itemToStringValue`, `itemToStringLabel`, `isItemEqualToValue`.
- Inside: `ComboboxInput` (with `placeholder`, optional `isLoading` / `showClear`, `className='w-full'`), then `ComboboxContent` containing `ComboboxEmpty` and `ComboboxList`.
- For grouped lists, use `ComboboxGroup` + `ComboboxLabel`. One field, one `onValueChange` — don't show parallel selectors that the user has to relate mentally.
- Pass option lists via prop when the data is already at the call site. Only fetch inside the selector when the data is global.

## Submit

- `mutation.onSuccess`: toast (`sonner`) → close the surrounding dialog (or call `onSuccess` callback) → invalidate / refetch. In that order.
- The submit button uses `loading={mutation.isPending}` from `@/components/ui/button`.

## Don'ts

- No `Select` for typeable lists.
- No raw `Controller` when `FormField` covers it.
- No `form.watch()` — use `useWatch`.
- No `z.nativeEnum`. No `z.string()` for ids.
- No fallback values (`params?.x ?? ''`) for things that are guaranteed to exist by the surrounding contract.

## Minimal example

A standalone form (no dialog wrapping) showing the canonical layout. For the dialog-wrapped version, see [modals.md](modals.md).

```tsx
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { FieldGroup } from '@/components/ui/field';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required').max(120),
  description: z.string().max(2000),
});

type FormData = z.infer<typeof formSchema>;

const DEFAULTS: FormData = { title: '', description: '' };

type NoteFormProps = {
  onSubmit: (data: FormData) => void;
  isPending: boolean;
};

export const NoteForm = ({ onSubmit, isPending }: NoteFormProps) => {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: DEFAULTS,
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup className='gap-4'>
        <FormField control={form.control} name='title' label='Title'>
          {(field) => <Input {...field} />}
        </FormField>

        <FormField control={form.control} name='description' label='Description'>
          {(field) => <Textarea rows={4} {...field} />}
        </FormField>
      </FieldGroup>

      <div className='flex justify-end pt-4'>
        <Button type='submit' loading={isPending}>
          Save
        </Button>
      </div>
    </form>
  );
};
```
