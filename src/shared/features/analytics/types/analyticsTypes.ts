export type PresetTimeRange = 'today' | '7d' | '30d' | '90d';
export type TimeRange = PresetTimeRange | 'custom';
export type RangeBounds = { from: Date; to: Date };
export type AnalyticsStat = { title: string; value: string; change?: number };

export type DashboardStats = {
	revenue: number;
	orders: number;
	customers: number;
	averageOrderValue: number;
};

export type DashboardComparison = {
	current: DashboardStats;
	previous: DashboardStats;
};
