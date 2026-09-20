<script lang="ts">
	// LIBRARIES
	import { getLocale } from '@/lib/paraglide/runtime';
	import { m } from '@/lib/paraglide/messages';

	// COMPONENTS
	import { TableCell, TableRow } from '@/components/ui/table/index.js';

	// UTILS
	import { formatCurrency } from '@/shared/utils/currency.js';

	// TYPES
	import type { TopProduct } from '@/shared/features/analytics/types/analyticsTypes.js';

	let { product, rank }: { product: TopProduct; rank: number } = $props();

	const locale = $derived(getLocale());
</script>

<TableRow>
	<TableCell class="text-muted-foreground tabular-nums">{rank}</TableCell>
	<TableCell class="font-medium">
		{product.name || m['AdminDashboardPage.TopProducts.unknownProduct']()}
	</TableCell>
	<TableCell class="text-right tabular-nums">
		{product.quantity.toLocaleString(locale)}
	</TableCell>
	<TableCell class="text-right font-medium tabular-nums">
		{formatCurrency(product.revenue, locale)}
	</TableCell>
</TableRow>
