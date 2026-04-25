# Form Rules

Patterns for `react-hook-form` + Zod forms. Pairs with [modals.md](modals.md) — most forms in this app live inside dialogs.

## Schema-first workflow

Before writing any form, **derive the schema from the mutation input type** the form will eventually call. Don't invent fields — start from the source of truth (the API contract) and add validation on top.

1. **Locate the input type**:
   - GraphQL: the codegen-generated `Create<Entity>Input` / `Update<Entity>Input` in `@/core/gql/graphql`.
   - REST: the OpenAPI-generated request body type from `openapi-fetch`.
2. **Map each input field to a Zod schema** following the type-specific rules below (IDs → `z.uuidv7()`, enums → `z.enum(...)`, optional/nullable input fields → `.nullable()` or `.optional()`, etc.).
3. **Propose the schema to the user with variants**. Don't generate the form yet. For each field that has meaningful validation choices (string length, trim, regex, range, custom refinement), show:
   - **One recommended variant** at the top, marked "(recommended)".
   - **Up to 4 alternatives** ranging from minimal to strict.
4. **Wait for confirmation**. The user picks the variants they want; only then generate the form.

### Why this matters

- Surfaces hidden constraints early (max-length limits the backend enforces, regex requirements, etc.) before the form is half-written.
- Makes validation a deliberate product decision, not a default the user has to push back on later.
- Catches input-type drift: if the codegen-generated type changed, the schema proposal will change and the user notices.

### Example: variants for a `title: String!` input

```ts
// 1. Required only (recommended for short freeform text)
title: z.string().min(1, 'Title is required'),

// 2. Required + max length
title: z.string().min(1, 'Title is required').max(120, 'Max 120 characters'),

// 3. Trimmed + required + max (strips trailing whitespace before validating)
title: z.string().trim().min(1, 'Title is required').max(120),

// 4. Required + min/max range + simple alphanumeric guard
title: z.string().trim().min(3, 'At least 3 characters').max(120).regex(/^[\w\s-]+$/, 'Letters, numbers, spaces, dashes only'),

// 5. Required + custom refinement (e.g. forbid reserved words)
title: z.string().trim().min(1).refine((v) => !RESERVED_TITLES.includes(v), 'This title is reserved'),
```

Surface the variants like that — labelled, with the recommendation called out — and let the user pick. The same pattern applies to numeric ranges, enum subsets, optional vs. nullable, etc.

## Schema (Zod) field rules

- One `formSchema = z.object({...})`. Derive `type FormData = z.infer<typeof formSchema>`.
- **IDs**: `z.uuidv7()` (required) or `z.uuidv7().nullable()` (optional). Never `z.string()` for ids.
- **Enums**: `z.enum(SomeEnum)` directly on a TS enum (typically GraphQL-generated). Don't use `z.nativeEnum` (deprecated). Don't redeclare a string-literal array next to the enum.
- **Nullable input fields**: mirror with `.nullable()` so the form's submit type matches the mutation input.
- **Optional input fields**: `.optional()` only if the field can be entirely absent from the payload; for fields that must be sent but may be `null`, use `.nullable()`.
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

- No generating a form before the schema is approved. The schema proposal + variants step (above) is mandatory.
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
