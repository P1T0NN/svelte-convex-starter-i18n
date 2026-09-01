<script lang="ts">
	// CONSTANTS
	import { PROTECTED_PAGE_ENDPOINTS } from '@/shared/constants/pageEndpoints.js';

	// COMPONENTS
	import { Button } from '@/components/ui/button';
	import DeleteTodoButton from './delete-todo-button.svelte';

	// UTILS
	import { cn } from '@/utils/utils.js';

	// TYPES
	import type { Id } from '@convex/_generated/dataModel';

	let { todo }: { todo: { _id: Id<'tasks'>; title: string; done: boolean | 0 | 1 } } = $props();
</script>

<div class="flex items-center gap-3 px-5 py-3.5">
	<span
		class={todo.done
			? 'flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground'
			: 'size-5 shrink-0 rounded-full border border-border'}
	>
		{#if todo.done}
			<span class="icon-[lucide--check] size-3" aria-hidden="true"></span>
		{/if}
	</span>

	<span class={cn('text-sm', todo.done && 'text-muted-foreground line-through')}>
		{todo.title}
	</span>

	<Button
		href={PROTECTED_PAGE_ENDPOINTS.EDIT_TODO(todo._id)}
		variant="ghost"
		size="icon-sm"
		class="ml-auto"
		title="Edit todo"
		aria-label="Edit todo"
	>
		<span class="icon-[lucide--pencil] size-3.5" aria-hidden="true"></span>
	</Button>

	<DeleteTodoButton id={todo._id} title={todo.title} />
</div>
