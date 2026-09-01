<script lang="ts">
	// LIBRARIES
	import { useQuery } from 'convex-svelte';
	import { api } from '@convex/_generated/api';

	// COMPONENTS
	import Card from '@/components/ui/card/card.svelte';
	import ErrorComponent from '@/components/ui/custom-components/error-component/error-component.svelte';
	import SvelteHead from '@/components/ui/custom-components/svelte-head/svelte-head.svelte';
	import EditTodoButton from '@/components/pages/(protected)/edit-todo/edit-todo-button.svelte';

	// TYPES
	import type { Id } from '@convex/_generated/dataModel';

	let { params } = $props();

	// SAFETY: Convex validates this route parameter with v.id('tasks').
	const taskId = $derived(params.id as Id<'tasks'>);
	const todo = useQuery(api.tables.tasks.queries.fetchTodo.fetchTodo, () => ({ id: taskId }));
</script>

<SvelteHead title="Edit todo" noindex />

<div class="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center gap-8">
	{#if todo.error}
		<Card>
			<ErrorComponent message="Couldn't load this todo." />
		</Card>
	{:else if todo.isLoading || !todo.data}
		<Card>
			<p class="py-10 text-center text-sm text-muted-foreground">Loading...</p>
		</Card>
	{:else}
		{#key todo.data._id}
			<EditTodoButton task={todo.data} />
		{/key}
	{/if}
</div>
