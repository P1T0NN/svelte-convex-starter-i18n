<script lang="ts">
	// LIBRARIES
	import { useQuery } from 'convex-svelte';
	import { api } from '@convex/_generated/api';
	import { getLocale } from '@/lib/paraglide/runtime';
	import { m } from '@/lib/paraglide/messages';

	// COMPONENTS
	import AdminDashboardHeader from '@/components/pages/admin/dashboard/admin-dashboard-header/admin-dashboard-header.svelte';
	import AdminDashboardRevenueChart from '@/components/pages/admin/dashboard/admin-dashboard-revenue-chart/admin-dashboard-revenue-chart.svelte';
	import AdminDashboardTopProducts from '@/components/pages/admin/dashboard/admin-dashboard-top-products/admin-dashboard-top-products.svelte';
	import AnalyticsStatsCard from '@/features/analytics/components/analytics-stats-card/analytics-stats-card.svelte';
	import ErrorComponent from '@/components/ui/custom-components/error-component/error-component.svelte';
	import SvelteHead from '@/components/ui/custom-components/svelte-head/svelte-head.svelte';
	import { Skeleton } from '@/components/ui/skeleton/index.js';

	// HOOKS
	import { createAnalyticsDashboard } from '@/features/analytics/hooks/useAnalyticsDashboard.svelte.js';

	// UTILS
	import { getComparisonPercentage } from '@/shared/features/analytics/utils/getComparisonPercentage.js';
	import { formatCurrency } from '@/shared/utils/currency.js';

	// TYPES
	import type { AnalyticsStat } from '@/shared/features/analytics/types/analyticsTypes.js';

	const STAT_SKELETONS = [0, 1, 2, 3];

	const analytics = createAnalyticsDashboard();

	const dashboard = useQuery(
		api.analytics.queries.fetchDashboard.fetchDashboard,
		() => ({
			current: {
				from: analytics.bounds.from.getTime(),
				to: analytics.bounds.to.getTime()
			},
			previous: {
				from: analytics.previousBounds.from.getTime(),
				to: analytics.previousBounds.to.getTime()
			}
		}),
		{ keepPreviousData: true }
	);

	const stats = $derived.by<AnalyticsStat[]>(() => {
		const data = dashboard.data;
		if (!data) return [];

		const locale = getLocale();
		const { current, previous } = data;

		return [
			{
				title: m['AnalyticsFeature.AnalyticsData.revenue'](),
				value: current.revenue,
				format: (value) => formatCurrency(value, locale),
				change: getComparisonPercentage(current.revenue, previous.revenue)
			},
			{
				title: m['AnalyticsFeature.AnalyticsData.orders'](),
				value: current.orders,
				change: getComparisonPercentage(current.orders, previous.orders)
			},
			{
				title: m['AnalyticsFeature.AnalyticsData.customers'](),
				value: current.customers,
				change: getComparisonPercentage(current.customers, previous.customers)
			},
			{
				title: m['AnalyticsFeature.AnalyticsData.averageOrderValue'](),
				value: current.averageOrderValue,
				format: (value) => formatCurrency(value, locale),
				change: getComparisonPercentage(current.averageOrderValue, previous.averageOrderValue)
			}
		];
	});
</script>

<SvelteHead title={m['AdminDashboardPage.pageTitle']()} noindex />

<div class="flex min-h-full min-w-0 flex-1 flex-col gap-6">
	<AdminDashboardHeader />

	{#if dashboard.error}
		<ErrorComponent message={m['AdminDashboardPage.statsLoadError']()} />
	{:else if stats.length > 0}
		<div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
			{#each stats as stat (stat.title)}
				<AnalyticsStatsCard {...stat} />
			{/each}
		</div>
	{:else}
		<div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
			{#each STAT_SKELETONS as skeleton (skeleton)}
				<Skeleton class="h-40 rounded-4xl" />
			{/each}
		</div>
	{/if}

	<AdminDashboardRevenueChart />

	<AdminDashboardTopProducts />
</div>
