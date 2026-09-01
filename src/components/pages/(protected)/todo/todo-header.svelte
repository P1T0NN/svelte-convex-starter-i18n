<script lang="ts">
	// COMPONENTS
	import PlusIcon from '@lucide/svelte/icons/plus';
	import { Badge } from '@/components/ui/badge/index.js';
	import { Button } from '@/components/ui/button';

	// CONSTANTS
	import { PROTECTED_PAGE_ENDPOINTS } from '@/shared/constants/pageEndpoints.js';

	let { doneCount, total }: { doneCount: number; total: number } = $props();
</script>

<header class="flex items-center justify-between">
	<div class="flex items-center gap-2">
		<h1 class="text-xl font-semibold tracking-tight">Todos</h1>
		{#if total > 0}
			<Badge variant="secondary">{doneCount}/{total}</Badge>
		{/if}
	</div>

	<Button href={PROTECTED_PAGE_ENDPOINTS.ADD_TODO} size="sm">
		<PlusIcon data-icon="inline-start" />
		Add todo
	</Button>
</header>
