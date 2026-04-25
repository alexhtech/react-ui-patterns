# Helper: `FormField`

## Why this exists

The form rules in [`docs/forms.md`](../docs/forms.md) mandate `FormField` for **every** form field. It bundles four things that always go together:

- `Controller` (react-hook-form) — wires the field to the form state.
- `Field` (shadcn) — the row container.
- `FieldLabel` — label.
- `FieldError` — error display, driven by `fieldState.invalid`.
- Optional `FieldDescription` for hint text.

Without it, every field repeats the same scaffolding. With it, a field is a one-liner around the actual control.

## Where to put it

`src/components/ui/form-field.tsx`

## When to use it

- Every RHF + Zod field. The form rules forbid raw `Controller` when `FormField` covers it.
- For native inputs (`Input`, `Textarea`): `<FormField ...>{(field) => <Input {...field} />}</FormField>`.
- For custom selectors (extracted Combobox): `<FormField ...>{(field) => <PrioritySelect value={field.value} onChange={field.onChange} />}</FormField>`.
- Use `description='...'` for hint text under the label.
- Use `orientation='horizontal'` when fields need to be laid out as label-on-left, control-on-right (e.g. settings rows).

## Dependencies

```sh
yarn add react-hook-form
npx shadcn@latest add field
```

The `field` shadcn primitive provides `Field`, `FieldContent`, `FieldDescription`, `FieldError`, `FieldLabel`. `FormField` imports from `@/components/ui/field`.

## Code

```tsx
import { type Control, Controller, type FieldPath, type FieldValues } from 'react-hook-form';

import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';

type FormFieldProps<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>> = {
  control: Control<TFieldValues>;
  name: TName;
  label?: string;
  description?: string;
  orientation?: 'vertical' | 'horizontal';
  disabled?: boolean;
  children: (field: {
    value: TFieldValues[TName];
    onChange: (...event: unknown[]) => void;
    onBlur: () => void;
    name: TName;
    ref: React.RefCallback<HTMLElement>;
    disabled?: boolean;
  }) => React.ReactNode;
};

export const FormField = <TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>>(
  props: FormFieldProps<TFieldValues, TName>,
) => {
  const { control, name, label, description, orientation = 'vertical', disabled, children } = props;

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field orientation={orientation} data-invalid={fieldState.invalid || undefined}>
          {label && orientation === 'horizontal' && (
            <FieldContent>
              <FieldLabel>{label}</FieldLabel>
              {description && <FieldDescription>{description}</FieldDescription>}
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </FieldContent>
          )}
          {label && orientation !== 'horizontal' && (
            <>
              <FieldLabel>{label}</FieldLabel>
              {description && <FieldDescription>{description}</FieldDescription>}
            </>
          )}
          {children({ ...field, disabled })}
          {orientation !== 'horizontal' && fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
};
```
