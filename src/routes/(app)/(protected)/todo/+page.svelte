<script lang="ts">
	// LIBRARIES
	import { api } from '@convex/_generated/api';

	// CONFIG
	import { PAGINATION_CONFIG } from '@/shared/features/pagination/config';
	import { PROTECTED_PAGE_ENDPOINTS } from '@/shared/constants/pageEndpoints';

	// COMPONENTS
	import DataList from '@/components/ui/custom-components/data-list/data-list.svelte';
	import ErrorComponent from '@/components/ui/custom-components/error-component/error-component.svelte';
	import SvelteHead from '@/components/ui/custom-components/svelte-head/svelte-head.svelte';
	import TodoHeader from '@/components/pages/(protected)/todo/todo-header.svelte';
	import TodoItem from '@/components/pages/(protected)/todo/todo-item.svelte';
	import TodoLoading from '@/components/pages/(protected)/todo/loading/todo-loading.svelte';

	// HOOKS
	import { useConvexPagination } from '@/features/pagination/hooks/useConvexPagination.svelte.js';

	const now = Date.now();
	const todo = useConvexPagination(
		api.tables.tasks.queries.fetchTodos.fetchTodos,
		() => ({ now }),
		{
			pageSize: PAGINATION_CONFIG.DEFAULT_PAGE_SIZE
		}
	);

	const todos = $derived(todo.data);
	const doneCount = $derived(todos.filter((t) => t.done).length);
</script>

<SvelteHead title="Todos" noindex />

<div class="mx-auto flex w-full max-w-md flex-col gap-6">
	<TodoHeader {doneCount} total={todos.length} />

	<DataList
		pagination={todo}
		key={(item) => item._id}
		class="divide-y divide-border"
		emptyTitle="No todos yet"
		emptyDescription="Add your first todo to see it here."
		emptyAction={{ label: 'Add todo', href: PROTECTED_PAGE_ENDPOINTS.ADD_TODO }}
	>
		{#snippet children(item)}
			<TodoItem todo={item} />
		{/snippet}

		{#snippet loadingSnippet()}
			<TodoLoading />
		{/snippet}

		{#snippet errorSnippet()}
			<ErrorComponent message="Couldn't load todos." />
		{/snippet}
	</DataList>
</div>
