<script lang="ts">
	// LIBRARIES
	import { m } from '@/lib/paraglide/messages';

	// COMPONENTS
	import { Badge } from '@/components/ui/badge/index.js';
	import * as Card from '@/components/ui/card/index.js';

	// UTILS
	import { cn } from '@/utils/utils.js';

	let {
		title,
		value,
		change,
		caption = m['AnalyticsFeature.AnalyticsStatsCard.vsPreviousPeriod']()
	}: {
		title: string;
		value: string;
		change?: number;
		caption?: string;
	} = $props();

	const isUp = $derived((change ?? 0) >= 0);
	const changeLabel = $derived(`${isUp ? '+' : ''}${(change ?? 0).toFixed(1)}%`);
</script>

<Card.Root>
	<Card.Header>
		<Card.Description>{title}</Card.Description>
		<Card.Title class="text-2xl font-semibold tabular-nums">{value}</Card.Title>

		{#if change !== undefined}
			<Card.Action>
				<Badge
					variant={isUp ? 'outline' : 'destructive'}
					class={cn(isUp && 'border-transparent bg-success/10 text-success')}
				>
					<span
						class={cn(
							'size-3',
							isUp ? 'icon-[lucide--trending-up]' : 'icon-[lucide--trending-down]'
						)}
						data-icon="inline-start"
						aria-hidden="true"
					></span>
					{changeLabel}
				</Badge>
			</Card.Action>
		{/if}
	</Card.Header>

	<Card.Footer class="text-xs text-muted-foreground">{caption}</Card.Footer>
</Card.Root>
