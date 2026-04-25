# Error Handling

- Use `tiny-invariant` for runtime assertions.
- Implement Error Boundaries for graceful error UI.
- Handle loading / error states in queries.
- Use toast notifications for user feedback (Sonner).

```ts
import { toast } from 'sonner';
import invariant from 'tiny-invariant';

invariant(user, 'User must be defined');

toast.success('Changes saved successfully');
toast.error('Failed to save changes');
```
