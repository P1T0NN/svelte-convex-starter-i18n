<script lang="ts">
	// LIBRARIES
	import { useAction } from 'convex-svelte';
	import { api } from '@convex/_generated/api';
	import { m } from '@/lib/paraglide/messages';

	// COMPONENTS
	import * as Card from '@/components/ui/card/index.js';
	import ErrorComponent from '@/components/ui/custom-components/error-component/error-component.svelte';
	import { Skeleton } from '@/components/ui/skeleton/index.js';
	import AdminDashboardTopProductsTable from './admin-dashboard-top-products-table.svelte';

	// HOOKS
	import { useCachedConvexQuery } from '@/hooks/useCachedConvexQuery.svelte.js';
	import { useAnalyticsDashboard } from '@/features/analytics/hooks/useAnalyticsDashboard.svelte.js';

	// TYPES
	import type { TopProduct } from '@/shared/features/analytics/types/analyticsTypes.js';

	const analytics = useAnalyticsDashboard();

	const topProducts = useCachedConvexQuery(
		api.analytics.queries.fetchTopProducts.fetchTopProducts,
		() => ({
			from: analytics.bounds.from.getTime(),
			to: analytics.bounds.to.getTime()
		})
	);

	const fetchTopProductsExact = useAction(
		api.analytics.actions.fetchTopProductsExact.fetchTopProductsExact
	);

	const exactProducts = $derived(
		topProducts.data && !topProducts.data.exact
			? fetchTopProductsExact({
					from: analytics.bounds.from.getTime(),
					to: analytics.bounds.to.getTime()
				})
			: null
	);
</script>

{#snippet productsOrEmpty(products: TopProduct[])}
	{#if products.length === 0}
		<p class="py-8 text-center text-sm text-muted-foreground">
			{m['AdminDashboardPage.TopProducts.empty']()}
		</p>
	{:else}
		<AdminDashboardTopProductsTable {products} />
	{/if}
{/snippet}

<Card.Root>
	<Card.Header>
		<Card.Title>{m['AdminDashboardPage.TopProducts.title']()}</Card.Title>
		<Card.Description>{m['AdminDashboardPage.TopProducts.description']()}</Card.Description>
	</Card.Header>

	<Card.Content>
		{#if topProducts.error}
			<ErrorComponent message={m['AdminDashboardPage.TopProducts.loadError']()} />
		{:else if topProducts.isLoading}
			<Skeleton class="h-72 w-full rounded-2xl" />
		{:else if topProducts.data?.exact}
			{@render productsOrEmpty(topProducts.data.products)}
		{:else if exactProducts}
			{#await exactProducts}
				<Skeleton class="h-72 w-full rounded-2xl" />
			{:then products}
				{@render productsOrEmpty(products)}
			{:catch}
				<ErrorComponent message={m['AdminDashboardPage.TopProducts.loadError']()} />
			{/await}
		{:else}
			<Skeleton class="h-72 w-full rounded-2xl" />
		{/if}
	</Card.Content>
</Card.Root>
