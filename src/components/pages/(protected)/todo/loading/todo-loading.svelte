<script lang="ts">
	// COMPONENTS
	import { Skeleton } from '@/components/ui/skeleton/index.js';
</script>

<div role="status" aria-label="Loading todos">
	{#each Array(5) as _, index (index)}
		<div class="flex items-center gap-3 border-b px-5 py-3.5 last:border-0">
			<Skeleton class="size-5 rounded-full" />
			<Skeleton class="h-4 flex-1" />
			<Skeleton class="size-8 rounded-full" />
			<Skeleton class="size-8 rounded-full" />
		</div>
	{/each}
</div>
