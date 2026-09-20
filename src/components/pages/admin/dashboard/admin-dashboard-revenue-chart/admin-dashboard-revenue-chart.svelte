<script lang="ts">
	// LIBRARIES
	import { useQuery } from 'convex-svelte';
	import { api } from '@convex/_generated/api';
	import { getLocale } from '@/lib/paraglide/runtime';
	import { m } from '@/lib/paraglide/messages';

	// COMPONENTS
	import * as Chart from '@/components/ui/chart/index.js';
	import AreaChartInteractive from '@/components/ui/custom-components/custom-charts/area-chart-interactive.svelte';
	import ErrorComponent from '@/components/ui/custom-components/error-component/error-component.svelte';
	import { Skeleton } from '@/components/ui/skeleton/index.js';

	// HOOKS
	import { useAnalyticsDashboard } from '@/features/analytics/hooks/useAnalyticsDashboard.svelte.js';

	// UTILS
	import { formatCompactCurrency, formatCurrency } from '@/shared/utils/currency.js';

	// TYPES
	import type {
		TimeRangeOption,
		TimeRangeValue
	} from '@/components/ui/custom-components/custom-charts/timerange-data.svelte';

	const analytics = useAnalyticsDashboard();

	const locale = $derived(getLocale());

	const revenue = useQuery(
		api.analytics.queries.fetchRevenueSeries.fetchRevenueSeries,
		() => ({
			from: analytics.bounds.from.getTime(),
			to: analytics.bounds.to.getTime()
		}),
		{ keepPreviousData: true }
	);

	const timeRange = $derived.by<TimeRangeValue>(() =>
		analytics.activeRange === 'today' ? '1d' : analytics.activeRange
	);

	const timeRangeOptions = [
		{ value: '1d', label: m['AdminDashboardPage.AdminDashboardHeaderTimeranges.today']() },
		{ value: '7d', label: m['AdminDashboardPage.AdminDashboardHeaderTimeranges.last7Days']() },
		{ value: '30d', label: m['AdminDashboardPage.AdminDashboardHeaderTimeranges.last30Days']() },
		{ value: '90d', label: m['AdminDashboardPage.AdminDashboardHeaderTimeranges.last90Days']() }
	] satisfies TimeRangeOption[];

	const chartData = $derived(
		(revenue.data ?? []).map((point) => ({
			date: new Date(point.date),
			revenue: point.revenue
		}))
	);

	const config = $derived({
		revenue: {
			label: m['AnalyticsFeature.AnalyticsData.revenue'](),
			color: 'var(--foreground)'
		}
	});

	const yAxisFormat = (value?: number) => formatCompactCurrency(value ?? 0, locale);
	const tooltipLabelFormatter = (value: Date | string) =>
		value instanceof Date
			? value.toLocaleDateString(locale, { month: 'long', day: 'numeric', year: 'numeric' })
			: value;
</script>

{#snippet tooltip()}
	<Chart.Tooltip nameKey="revenue" labelFormatter={tooltipLabelFormatter} class="min-w-44">
		{#snippet formatter({ value, name }: { value: unknown; name: string })}
			<div class="flex w-full items-center justify-between gap-4 leading-none">
				<span class="text-muted-foreground">{name}</span>
				<span class="font-mono font-medium text-foreground tabular-nums">
					{formatCurrency(Number(value), locale)}
				</span>
			</div>
		{/snippet}
	</Chart.Tooltip>
{/snippet}

{#if revenue.error}
	<ErrorComponent message={m['AdminDashboardPage.RevenueChart.loadError']()} />
{:else if revenue.data}
	<AreaChartInteractive
		data={chartData}
		x="date"
		{config}
		{timeRange}
		customRange={analytics.customRange}
		{timeRangeOptions}
		{locale}
		showTimeRange={false}
		showLegend={false}
		containerClass="aspect-auto h-72 w-full"
		areaChartProps={{ yAxis: { tickSpacing: 72 } }}
		title={m['AdminDashboardPage.RevenueChart.title']()}
		descriptionPrefix={m['AdminDashboardPage.RevenueChart.descriptionPrefix']()}
		{yAxisFormat}
		{tooltip}
	/>
{:else}
	<Skeleton class="h-80 rounded-4xl" />
{/if}
