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

export const revenueSeriesPoint = v.object({
	date: v.number(),
	revenue: v.number()
});

export const revenueSeries = v.array(revenueSeriesPoint);

export const topProduct = v.object({
	productId: v.id('products'),
	name: v.string(),
	revenue: v.number(),
	quantity: v.number()
});

export const topProducts = v.array(topProduct);

export const topProductsResult = v.object({
	exact: v.boolean(),
	products: topProducts
});
