<script lang="ts">
	// LIBRARIES
	import { api } from '@convex/_generated/api';

	// CONFIG
	import { PAGINATION_CONFIG } from '@/shared/features/pagination/config';

	// COMPONENTS
	import { Badge } from '@/components/ui/badge/index.js';
	import { Button } from '@/components/ui/button';
	import DataList from '@/components/ui/custom-components/data-list/data-list.svelte';
	import EmptyData from '@/components/ui/custom-components/empty-data/empty-data.svelte';
	import ErrorComponent from '@/components/ui/custom-components/error-component/error-component.svelte';
	import Section from '@/components/ui/custom-components/section/section.svelte';
	import SvelteHead from '@/components/ui/custom-components/svelte-head/svelte-head.svelte';
	import NativeSelect from '@/components/ui/native-components/native-select/native-select.svelte';
	import SearchInput from '@/features/search/components/search-input.svelte';

	// HOOKS
	import { useSearch } from '@/features/search/hooks/useSearch.svelte';
	import { useFilters } from '@/features/filters/hooks/useFilters.svelte';
	import { useConvexInfinitePagination } from '@/features/pagination/hooks/useConvexInfinitePagination.svelte.js';

	// DATA
	import { TODO_FILTER_DEFS } from '@/features/filters/data/todoFilterDefs.js';

	const search = useSearch({ mode: 'url', param: 'q' });
	const filters = useFilters({ mode: 'url', defs: TODO_FILTER_DEFS });
	const now = Date.now();

	const todos = useConvexInfinitePagination(
		api.tables.tasks.queries.fetchTodos.fetchTodos,
		() => ({
			search: search.term || undefined,
			filters: filters.active,
			now
		}),
		{
			pageSize: PAGINATION_CONFIG.DEFAULT_PAGE_SIZE,
			resetKey: () => [search.term, filters.identity],
			getItemKey: (task) => task._id
		}
	);

	const total = $derived(todos.total ?? null);
</script>

<SvelteHead title="Infinite data list test" noindex />

<Section>
	<div class="flex flex-wrap items-center gap-2">
		<SearchInput bind:value={search.value} placeholder="Search tasks..." class="max-w-sm" />
		{#each filters.defs as def (def.key)}
			<NativeSelect
				options={def.options}
				value={filters.value(def.key)}
				placeholder={def.label}
				label={def.label}
				onchange={(v) => filters.set(def.key, v)}
			/>
		{/each}
		{#if filters.isActive}
			<Button variant="outline" size="sm" onclick={filters.clearAll}>
				Clear filters ({filters.count})
			</Button>
		{/if}
	</div>

	<DataList
		pagination={todos}
		infiniteScrolling={true}
		{total}
		key={(task) => task._id}
		class="mt-4 grid gap-3"
	>
		{#snippet header()}
			<h1 class="text-2xl font-semibold">
				{#if total !== null}
					Found {total.toLocaleString()} tasks
				{:else if search.isActive || filters.isActive}
					Results
				{:else}
					Tasks
				{/if}
			</h1>
		{/snippet}

		{#snippet children(task, i)}
			<article class="flex items-center gap-4 rounded-xl border p-4">
				<div>
					<h2 class="font-medium">{task.title}</h2>
					<p class="mt-0.5 text-sm text-muted-foreground">
						{i + 1}. {task._id}
					</p>
				</div>

				<span class="ml-auto text-sm text-muted-foreground tabular-nums">
					${(task.price / 100).toFixed(2)}
				</span>

				{#if task.done}
					<Badge class="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">Done</Badge>
				{:else}
					<Badge variant="secondary">Pending</Badge>
				{/if}
			</article>
		{/snippet}

		{#snippet errorSnippet()}
			<ErrorComponent message="Couldn't load tasks." retry={todos.retry} />
		{/snippet}

		{#snippet empty()}
			{#if search.isActive || filters.isActive}
				<EmptyData
					title="No results"
					description={search.isActive
						? `Nothing matches "${search.term}".`
						: 'Nothing matches these filters.'}
				>
					{#snippet icon()}
						<span class="icon-[lucide--search] size-5"></span>
					{/snippet}
				</EmptyData>
			{:else}
				<EmptyData title="No tasks yet" description="Add your first task to see it here.">
					{#snippet icon()}
						<span class="icon-[lucide--clipboard-list] size-5"></span>
					{/snippet}
				</EmptyData>
			{/if}
		{/snippet}
	</DataList>
</Section>
