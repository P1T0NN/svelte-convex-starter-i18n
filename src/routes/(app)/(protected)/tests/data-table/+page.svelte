<script lang="ts">
	// CONVEX
	import { api } from '@convex/_generated/api';
	import { useConvexPagination } from '@/features/pagination/hooks/useConvexPagination.svelte.js';

	// COMPONENTS
	import { Badge } from '@/components/ui/badge/index.js';
	import { Button } from '@/components/ui/button';
	import { TableCell, TableHead } from '@/components/ui/table';
	import DataTable from '@/components/ui/custom-components/data-table/data-table.svelte';
	import EmptyData from '@/components/ui/custom-components/empty-data/empty-data.svelte';
	import ErrorComponent from '@/components/ui/custom-components/error-component/error-component.svelte';
	import Section from '@/components/ui/custom-components/section/section.svelte';
	import SvelteHead from '@/components/ui/custom-components/svelte-head/svelte-head.svelte';
	import NativeSelect from '@/components/ui/native-components/native-select/native-select.svelte';
	import SearchInput from '@/features/search/components/search-input.svelte';

	// HOOKS
	import { useSearch } from '@/features/search/hooks/useSearch.svelte';
	import { useFilters } from '@/features/filters/hooks/useFilters.svelte';

	// DATA
	import { TODO_FILTER_DEFS } from '@/features/filters/data/todoFilterDefs.js';

	// DYNAMICALLY LOADED
	const { default: DeleteButton } =
		await import('@/components/pages/tests/data-table/delete-button.svelte');

	const search = useSearch({ mode: 'state' });
	const filters = useFilters({ mode: 'state', defs: TODO_FILTER_DEFS });
	const now = Date.now();

	const todos = useConvexPagination(
		api.tables.tasks.queries.fetchTodos.fetchTodos,
		() => ({
			search: search.term || undefined,
			filters: filters.active,
			now
		}),
		{
			pageSize: 10,
			resetKey: () => [search.term, filters.identity]
		}
	);
	const total = $derived(todos.total ?? null);
</script>

<SvelteHead title="Data table test" noindex />

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

	<DataTable
		pagination={todos}
		{total}
		placement="above"
		class="mt-4"
		selectable
		key={(task) => task._id}
	>
		{#snippet header()}
			<h1 class="text-2xl font-semibold">
				{#if search.isActive || filters.isActive}
					Results
				{:else}
					DataTable - {total ?? 0} tasks
				{/if}
			</h1>
		{/snippet}

		{#snippet head()}
			<TableHead class="w-12">#</TableHead>
			<TableHead>Title</TableHead>
			<TableHead>ID</TableHead>
			<TableHead class="text-right">Price</TableHead>
			<TableHead class="text-right">Status</TableHead>
			<TableHead class="text-right">Actions</TableHead>
		{/snippet}

		{#snippet row(task, i)}
			<TableCell class="text-muted-foreground">{i + 1}</TableCell>
			<TableCell class="font-medium">{task.title}</TableCell>
			<TableCell class="text-muted-foreground">{task._id}</TableCell>
			<TableCell class="text-right tabular-nums">${(task.price / 100).toFixed(2)}</TableCell>
			<TableCell class="text-right">
				{#if task.done}
					<Badge class="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">Done</Badge>
				{:else}
					<Badge variant="secondary">Pending</Badge>
				{/if}
			</TableCell>
			<TableCell class="text-right">
				<Button href={`/todo/${task._id}/edit`} variant="ghost" size="icon-sm" title="Edit todo">
					<span class="icon-[lucide--pencil] size-3.5"></span>
				</Button>
			</TableCell>
		{/snippet}

		{#snippet errorSnippet()}
			<ErrorComponent message="Couldn't load tasks." />
		{/snippet}

		{#snippet actions({ selectedKeys, count, onClear })}
			<DeleteButton {selectedKeys} {count} {onClear} />
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
				<EmptyData title="No tasks yet" description="Add your first task and it'll show up here.">
					{#snippet icon()}
						<span class="icon-[lucide--clipboard-list] size-5"></span>
					{/snippet}
				</EmptyData>
			{/if}
		{/snippet}
	</DataTable>
</Section>
