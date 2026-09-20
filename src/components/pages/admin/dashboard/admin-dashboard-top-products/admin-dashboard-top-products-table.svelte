<script lang="ts">
	// LIBRARIES
	import { m } from '@/lib/paraglide/messages';

	// COMPONENTS
	import {
		Table,
		TableBody,
		TableHead,
		TableHeader,
		TableRow
	} from '@/components/ui/table/index.js';
	import AdminDashboardTopProductsTableItem from './admin-dashboard-top-products-table-item.svelte';

	// TYPES
	import type { TopProduct } from '@/shared/features/analytics/types/analyticsTypes.js';

	let { products }: { products: TopProduct[] } = $props();
</script>

<Table>
	<TableHeader>
		<TableRow>
			<TableHead class="w-10">#</TableHead>
			<TableHead>{m['AdminDashboardPage.TopProducts.product']()}</TableHead>
			<TableHead class="text-right">{m['AdminDashboardPage.TopProducts.units']()}</TableHead>
			<TableHead class="text-right">
				{m['AnalyticsFeature.AnalyticsData.revenue']()}
			</TableHead>
		</TableRow>
	</TableHeader>
	<TableBody>
		{#each products as product, index (product.productId)}
			<AdminDashboardTopProductsTableItem {product} rank={index + 1} />
		{/each}
	</TableBody>
</Table>
