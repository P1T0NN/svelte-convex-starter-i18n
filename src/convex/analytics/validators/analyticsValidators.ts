// LIBRARIES
import { v } from 'convex/values';

export const dashboardStats = v.object({
	revenue: v.number(),
	orders: v.number(),
	customers: v.number(),
	averageOrderValue: v.number()
});

export const dashboardComparison = v.object({
	current: dashboardStats,
	previous: dashboardStats
});
