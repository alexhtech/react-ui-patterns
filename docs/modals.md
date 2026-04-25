# Modal / Dialog Rules

Covers the dialog shell. For the form inside the dialog (RHF + Zod, `FormField`, selectors, submit flow), see [forms.md](forms.md).

## Primitives: Base UI, not Radix

This project's `@/components/ui/*` is built on **`@base-ui/react`**, not Radix. The visible API differences when cross-referencing shadcn docs:

- Slot composition uses `render={<Button .../>}`, not `asChild`.
- Our `Combobox` (`@/components/ui/combobox`) is its own Base UI primitive — `items` / `value` / `onValueChange` / `itemToStringValue`. It is **not** the shadcn `Popover` + `Command` recipe.
- Dialog / Field / Form-field surface APIs match shadcn naming, just compiled against Base UI.

When the shadcn registry shows `asChild` or a Popover+Command combobox, translate to our equivalents above before copying.

## shadcn MCP

We use shadcn for primitives. Before hand-rolling UI, check the registry via the shadcn MCP:

- `mcp__shadcn__search_items_in_registries` — find by name / intent.
- `mcp__shadcn__view_items_in_registries` — props + usage.
- `mcp__shadcn__get_item_examples_from_registries` — canonical examples.
- `mcp__shadcn__get_add_command_for_items` — `npx shadcn@latest add <item>` when not yet installed.
- `mcp__shadcn__get_audit_checklist` — sanity-check existing usage.

Don't reinvent a popover, command palette, etc. that shadcn already ships.

## State: `useDrawer`

Default to [`useDrawer`](src/core/drawers/drawers.store.ts) for any dialog opened from outside its parent or that needs params (ids) for fetching. Mount the dialog once at a stable layer; triggers import the hook only and call `.open(params)`.

```tsx
// my-thing-dialog.tsx
type MyThingDialogParams = { userId: string };
const KEY = 'my-thing-dialog';

export const useMyThingDialog = () => useDrawer<MyThingDialogParams>(KEY);

export const MyThingDialog = () => {
  const { isOpen, params, close } = useMyThingDialog();
  if (!params) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
      <DialogContent>
        <MyThingBody params={params} />
      </DialogContent>
    </Dialog>
  );
};
```

`Dialog` handles its own visibility via `open={isOpen}` — no `{isOpen && ...}` guards, no extra returns. The only guard is `if (!params) return null` for type narrowing; pass `params` typed straight through to the body.

Use plain `open` / `onOpenChange` props only for trivial dialogs tied to one parent (e.g. a confirm in the same component).

## Folder structure: split create / update

Each dialog gets its own **subfolder** under the entity folder. Once we enforce one component per file (see [components.md](components.md)), each dialog spans multiple files (hook, dialog component, body component for update). Group them so they're easy to find together.

```
my-thing-dialog/
  create-my-thing-dialog/
    use-create-my-thing-dialog.hook.ts   // drawer key + useDrawer wrapper
    create-my-thing-dialog.tsx           // dialog shell, create mutation, mounts <MyThingBody />
    index.ts                             // barrel
  update-my-thing-dialog/
    use-update-my-thing-dialog.hook.ts   // drawer key + params type + useDrawer wrapper
    update-my-thing-dialog.tsx           // dialog shell only, mounts <UpdateMyThingBody id={...} />
    update-my-thing-body.tsx             // fetches by id, update mutation, mounts <MyThingBody initialValues={...} />
    index.ts                             // barrel
  my-thing-body.tsx                      // shared form (RHF + Zod), no fetching
  priority-select.tsx                    // shared selectors specific to this entity
  queries.ts                             // shared queries / mutations
  types.ts                               // shared types
  index.ts                               // barrel — re-exports each subfolder's index
```

- Each create/update subfolder owns everything specific to that flow: its drawer hook, its dialog component, and (for update) its body wrapper that handles fetch + mutation.
- Anything shared between create and update — the form body, the selectors, the queries, the types — lives at the entity-folder root.
- Hook files exist as their own files so triggers import the hook without pulling in the dialog component, form, mutations, or queries.
- Body owns the form and accepts `initialValues`, `onSubmit`, `submitLabel`, `isPending`. It doesn't know whether it's create or update.
- Create opens with empty defaults. Update takes `{ id }`, fetches in `update-my-thing-body.tsx`, then renders `<MyThingBody initialValues={data} />`.

## Update dialog: fetch-by-id vs. reuse row data

Default: **fetch by id**. Drawer params carry an `id`, the dialog refetches on open, you always edit fresh server state.

If no fetch-by-id endpoint exists (only a paginated list + create + delete), do **not** silently pass the row object through. Stop and ask the user to pick:

1. **Preferred** — backend adds a `getById` endpoint, use the standard pattern.
2. **Fallback** — reuse data already loaded by the parent (e.g. the data-table row), pass it via drawer params. Trade-off: the form may render against stale list data, no refresh on open.

Never pick the fallback unilaterally — it's a product call.

### Fallback pattern: data-table row → dialog params

Drawer params carry the full object; the dialog has no fetch and no loading state.

```ts
// use-update-todo-dialog.hook.ts
import { useDrawer } from '@/core/drawers/drawers.store';

import type { Todo } from './types';

const KEY = 'update-todo-dialog';

type UpdateTodoDialogParams = { todo: Todo };

export const useUpdateTodoDialog = () => useDrawer<UpdateTodoDialogParams>(KEY);
```

```tsx
// update-todo-dialog.tsx
export const UpdateTodoDialog = () => {
  const { isOpen, params, close } = useUpdateTodoDialog();
  if (!params) return null;

  const updateTodo = useUpdateTodo();

  const onSubmit = (formData: TodoFormData) =>
    updateTodo.mutate(
      { id: params.todo.id, input: formData },
      {
        onSuccess: () => {
          toast.success('Todo updated');
          close();
        },
      },
    );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
      <DialogContent className='sm:max-w-xl'>
        <DialogHeader>
          <DialogTitle>Edit todo</DialogTitle>
        </DialogHeader>
        <TodoBody
          initialValues={params.todo}
          onSubmit={onSubmit}
          submitLabel='Save'
          isPending={updateTodo.isPending}
        />
      </DialogContent>
    </Dialog>
  );
};
```

```tsx
// trigger in a data-table row
<Button onClick={() => updateTodoDialog.open({ todo: row.original })}>Edit</Button>
```

## Layout

- `<DialogContent className='sm:max-w-xl'>` for any form with more than two fields.
- Wrap multi-field forms in `<div className='grid grid-cols-2 gap-4'>`. Textareas / comments stay full-width below the grid.
- `FieldGroup className='gap-4'` for vertical spacing.
- Footer: `<DialogFooter className='pt-4'>`. Cancel = `DialogClose` rendering an outline `Button`. Submit on the right with `loading={mutation.isPending}`.

## Data fetching

- `useGqlQuery` / `useGqlMutation`. Never `useEffect`.
- With the drawer pattern the body subtree only mounts when the dialog is open — no `enabled` flags.
- For controlled-prop dialogs, gate with `enabled: open && !!requiredId`.
- Memoize derived arrays with `useMemo` when used in `useEffect` deps.

## Don'ts

- No `useState` for open/close inside the dialog.
- No prop drilling ids through unrelated layers — drawer params are the channel.
- No mounting the same dialog next to each trigger — once at a stable layer.
- No fallback values (`params?.x ?? ''`) for things that are guaranteed to exist by the surrounding contract.

## Full example: TODO dialogs

Create / update pair for a `Todo` entity. Folder split, shared body, RHF + Zod (`z.enum` on a TS enum, `z.uuidv7().nullable()` for an id), `FormField`, extracted Combobox, react-query.

### `todo-dialog/types.ts`

```ts
export enum TodoPriority {
  Low = 'LOW',
  Medium = 'MEDIUM',
  High = 'HIGH',
}

export type Todo = {
  id: string;
  title: string;
  description: string;
  priority: TodoPriority;
  parentTodoId: string | null;
  dueDate: string | null;
};
```

### `todo-dialog/queries.ts`

```ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { Todo } from './types';

export const useTodo = (id: string) =>
  useQuery({
    queryKey: ['todo', id],
    queryFn: async (): Promise<Todo> => ({
      id,
      title: '',
      description: '',
      priority: TodoPriority.Medium,
      parentTodoId: null,
      dueDate: null,
    }),
  });

type TodoInput = Omit<Todo, 'id'>;

export const useCreateTodo = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: TodoInput): Promise<Todo> => ({ id: crypto.randomUUID(), ...input }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['todos'] }),
  });
};

export const useUpdateTodo = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { id: string; input: TodoInput }): Promise<Todo> => ({ id: vars.id, ...vars.input }),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['todos'] });
      qc.invalidateQueries({ queryKey: ['todo', vars.id] });
    },
  });
};
```

### `todo-dialog/priority-select.tsx`

```tsx
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox';

import { TodoPriority } from './types';

const OPTIONS: { value: TodoPriority; label: string }[] = [
  { value: TodoPriority.Low, label: 'Low' },
  { value: TodoPriority.Medium, label: 'Medium' },
  { value: TodoPriority.High, label: 'High' },
];

type PrioritySelectProps = {
  value: TodoPriority;
  onChange: (value: TodoPriority) => void;
};

export const PrioritySelect = ({ value, onChange }: PrioritySelectProps) => {
  const selected = OPTIONS.find((o) => o.value === value) ?? null;
  return (
    <Combobox
      items={OPTIONS}
      value={selected}
      onValueChange={(item) => item && onChange(item.value)}
      itemToStringValue={(o) => o.label}
      itemToStringLabel={(o) => o.label}
      isItemEqualToValue={(a, b) => a.value === b.value}
    >
      <ComboboxInput placeholder='Choose priority' className='w-full' />
      <ComboboxContent>
        <ComboboxEmpty>No results.</ComboboxEmpty>
        <ComboboxList>
          {(item) => (
            <ComboboxItem key={item.value} value={item}>
              {item.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
};
```

### `todo-dialog/todo-body.tsx`

```tsx
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { DialogClose, DialogFooter } from '@/components/ui/dialog';
import { FieldGroup } from '@/components/ui/field';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import { PrioritySelect } from './priority-select';
import { TodoPriority } from './types';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required').max(120),
  description: z.string().max(2000),
  priority: z.enum(TodoPriority),
  parentTodoId: z.uuidv7().nullable(),
  dueDate: z.string().nullable(),
});

export type TodoFormData = z.infer<typeof formSchema>;

const EMPTY_VALUES: TodoFormData = {
  title: '',
  description: '',
  priority: TodoPriority.Medium,
  parentTodoId: null,
  dueDate: null,
};

type TodoBodyProps = {
  initialValues?: Partial<TodoFormData>;
  onSubmit: (data: TodoFormData) => void;
  submitLabel: string;
  isPending: boolean;
};

export const TodoBody = ({ initialValues, onSubmit, submitLabel, isPending }: TodoBodyProps) => {
  const form = useForm<TodoFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { ...EMPTY_VALUES, ...initialValues },
  });

  useEffect(() => {
    form.reset({ ...EMPTY_VALUES, ...initialValues });
  }, [initialValues, form]);

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup className='gap-4'>
        <div className='grid grid-cols-2 gap-4'>
          <FormField control={form.control} name='title' label='Title'>
            {(field) => <Input {...field} />}
          </FormField>

          <FormField control={form.control} name='priority' label='Priority'>
            {(field) => <PrioritySelect value={field.value} onChange={field.onChange} />}
          </FormField>

          <FormField control={form.control} name='dueDate' label='Due date'>
            {(field) => (
              <Input
                type='date'
                value={field.value ?? ''}
                onChange={(e) => field.onChange(e.target.value || null)}
                onBlur={field.onBlur}
                name={field.name}
              />
            )}
          </FormField>
        </div>

        <FormField control={form.control} name='description' label='Description'>
          {(field) => <Textarea rows={4} {...field} />}
        </FormField>
      </FieldGroup>

      <DialogFooter className='pt-4'>
        <DialogClose render={<Button variant='outline' type='button' />}>Cancel</DialogClose>
        <Button type='submit' loading={isPending}>
          {submitLabel}
        </Button>
      </DialogFooter>
    </form>
  );
};
```

### `todo-dialog/create-todo-dialog/use-create-todo-dialog.hook.ts`

```ts
import { useDrawer } from '@/core/drawers/drawers.store';

const KEY = 'create-todo-dialog';

export const useCreateTodoDialog = () => useDrawer(KEY);
```

### `todo-dialog/create-todo-dialog/create-todo-dialog.tsx`

```tsx
import { toast } from 'sonner';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import { useCreateTodo } from '../queries';
import { TodoBody, type TodoFormData } from '../todo-body';
import { useCreateTodoDialog } from './use-create-todo-dialog.hook';

export const CreateTodoDialog = () => {
  const { isOpen, close } = useCreateTodoDialog();
  const createTodo = useCreateTodo();

  const onSubmit = (data: TodoFormData) =>
    createTodo.mutate(data, {
      onSuccess: () => {
        toast.success('Todo created');
        close();
      },
    });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
      <DialogContent className='sm:max-w-xl'>
        <DialogHeader>
          <DialogTitle>New todo</DialogTitle>
        </DialogHeader>
        <TodoBody onSubmit={onSubmit} submitLabel='Create' isPending={createTodo.isPending} />
      </DialogContent>
    </Dialog>
  );
};
```

### `todo-dialog/update-todo-dialog/use-update-todo-dialog.hook.ts`

```ts
import { useDrawer } from '@/core/drawers/drawers.store';

const KEY = 'update-todo-dialog';

type UpdateTodoDialogParams = { id: string };

export const useUpdateTodoDialog = () => useDrawer<UpdateTodoDialogParams>(KEY);
```

### `todo-dialog/update-todo-dialog/update-todo-dialog.tsx`

```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import { UpdateTodoBody } from './update-todo-body';
import { useUpdateTodoDialog } from './use-update-todo-dialog.hook';

export const UpdateTodoDialog = () => {
  const { isOpen, params, close } = useUpdateTodoDialog();
  if (!params) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
      <DialogContent className='sm:max-w-xl'>
        <DialogHeader>
          <DialogTitle>Edit todo</DialogTitle>
        </DialogHeader>
        <UpdateTodoBody id={params.id} onClose={close} />
      </DialogContent>
    </Dialog>
  );
};
```

### `todo-dialog/update-todo-dialog/update-todo-body.tsx`

The fetch lives in its own component — one component per file (see [components.md](components.md)).

```tsx
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { useTodo, useUpdateTodo } from '../queries';
import { TodoBody, type TodoFormData } from '../todo-body';

type UpdateTodoBodyProps = { id: string; onClose: () => void };

export const UpdateTodoBody = ({ id, onClose }: UpdateTodoBodyProps) => {
  const { data, isLoading } = useTodo(id);
  const updateTodo = useUpdateTodo();

  if (isLoading || !data) {
    return (
      <div className='flex items-center justify-center py-8'>
        <Loader2 className='size-5 animate-spin text-muted-foreground' />
      </div>
    );
  }

  const onSubmit = (formData: TodoFormData) =>
    updateTodo.mutate(
      { id, input: formData },
      {
        onSuccess: () => {
          toast.success('Todo updated');
          onClose();
        },
      },
    );

  return <TodoBody initialValues={data} onSubmit={onSubmit} submitLabel='Save' isPending={updateTodo.isPending} />;
};
```

### `todo-dialog/create-todo-dialog/index.ts`

```ts
export { CreateTodoDialog } from './create-todo-dialog';
export { useCreateTodoDialog } from './use-create-todo-dialog.hook';
```

### `todo-dialog/update-todo-dialog/index.ts`

```ts
export { UpdateTodoDialog } from './update-todo-dialog';
export { useUpdateTodoDialog } from './use-update-todo-dialog.hook';
```

### `todo-dialog/index.ts`

```ts
export * from './create-todo-dialog';
export * from './update-todo-dialog';
```

### Wiring

Mount once at a stable layer:

```tsx
<>
  <CreateTodoDialog />
  <UpdateTodoDialog />
</>
```

Triggers import only the hook:

```tsx
import { useCreateTodoDialog, useUpdateTodoDialog } from '@/common/todo-dialog';

const createTodoDialog = useCreateTodoDialog();
const updateTodoDialog = useUpdateTodoDialog();

<Button onClick={() => createTodoDialog.open()}>New todo</Button>
<Button onClick={() => updateTodoDialog.open({ id: todo.id })}>Edit</Button>
```
