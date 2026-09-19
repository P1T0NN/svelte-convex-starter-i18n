/// <reference types="vite/client" />

import { expect, test } from 'vitest';
import { convexTest } from 'convex-test';

import { api } from '../../src/convex/_generated/api';
import schema from '../../src/convex/schema';
import { getDashboardStats } from '../../src/convex/analytics/helpers/getDashboardStats';

// TYPES
import type { UserIdentity } from 'convex/server';

const modules = import.meta.glob('../../src/convex/**/*.ts');
const DAY_IN_MS = 86_400_000;
const RANGE_START = Date.UTC(2026, 0, 1);

const adminIdentity: Partial<UserIdentity> & { role: string } = {
	tokenIdentifier: 'analytics-admin',
	subject: 'analytics-admin',
	role: 'admin'
};

async function seedOrders(t: ReturnType<typeof convexTest>) {
	await t.run(async (ctx) => {
		await ctx.db.insert('orders', {
			orderNumber: 'ORD-00001',
			customerId: 'cust_4',
			status: 'paid',
			total: 500,
			currency: 'USD',
			placedAt: RANGE_START - 2 * DAY_IN_MS
		});
		await ctx.db.insert('orders', {
			orderNumber: 'ORD-00002',
			customerId: 'cust_1',
			status: 'paid',
			total: 1000,
			currency: 'USD',
			placedAt: RANGE_START
		});
		await ctx.db.insert('orders', {
			orderNumber: 'ORD-00003',
			customerId: 'cust_1',
			status: 'paid',
			total: 2000,
			currency: 'USD',
			placedAt: RANGE_START + 2 * DAY_IN_MS
		});
		await ctx.db.insert('orders', {
			orderNumber: 'ORD-00004',
			customerId: 'cust_2',
			status: 'refunded',
			total: 5000,
			currency: 'USD',
			placedAt: RANGE_START + 3 * DAY_IN_MS
		});
		await ctx.db.insert('orders', {
			orderNumber: 'ORD-00005',
			customerId: 'cust_3',
			status: 'paid',
			total: 500,
			currency: 'USD',
			placedAt: RANGE_START + 10 * DAY_IN_MS
		});
	});
}

test('aggregates revenue, orders, customers, and average order value for the range', async () => {
	const t = convexTest(schema, modules);
	await seedOrders(t);

	const stats = await t.run((ctx) =>
		getDashboardStats(ctx, {
			from: RANGE_START,
			to: RANGE_START + 3 * DAY_IN_MS
		})
	);

	expect(stats).toEqual({
		revenue: 3000,
		orders: 3,
		customers: 2,
		averageOrderValue: 1500
	});
});

test('rejects unauthenticated and non-admin dashboard reads', async () => {
	const t = convexTest(schema, modules);
	const args = {
		current: { from: RANGE_START, to: RANGE_START + DAY_IN_MS },
		previous: { from: RANGE_START - DAY_IN_MS, to: RANGE_START - 1 }
	};

	await expect(
		t.query(api.analytics.queries.fetchDashboard.fetchDashboard, args)
	).rejects.toMatchObject({ data: { code: 'UNAUTHENTICATED' } });

	const user = t.withIdentity({ tokenIdentifier: 'analytics-user', subject: 'analytics-user' });
	await expect(
		user.query(api.analytics.queries.fetchDashboard.fetchDashboard, args)
	).rejects.toMatchObject({ data: { code: 'FORBIDDEN' } });
});

test('returns current and previous period stats for admins', async () => {
	const t = convexTest(schema, modules);
	await seedOrders(t);

	const admin = t.withIdentity(adminIdentity);
	const comparison = await admin.query(api.analytics.queries.fetchDashboard.fetchDashboard, {
		current: { from: RANGE_START, to: RANGE_START + 3 * DAY_IN_MS },
		previous: { from: RANGE_START - 3 * DAY_IN_MS, to: RANGE_START - 1 }
	});

	expect(comparison.current).toEqual({
		revenue: 3000,
		orders: 3,
		customers: 2,
		averageOrderValue: 1500
	});
	expect(comparison.previous).toEqual({
		revenue: 500,
		orders: 1,
		customers: 1,
		averageOrderValue: 500
	});

	await expect(
		admin.query(api.analytics.queries.fetchDashboard.fetchDashboard, {
			current: { from: RANGE_START + DAY_IN_MS, to: RANGE_START },
			previous: { from: RANGE_START - DAY_IN_MS, to: RANGE_START - 1 }
		})
	).rejects.toThrow('Invalid dashboard date range');
});

test('compares partial ranges against full previous days', async () => {
	const t = convexTest(schema, modules);
	await seedOrders(t);
	await t.run(async (ctx) => {
		await ctx.db.insert('orders', {
			orderNumber: 'ORD-00006',
			customerId: 'cust_5',
			status: 'paid',
			total: 700,
			currency: 'USD',
			placedAt: RANGE_START - 16 * 60 * 60 * 1000
		});
	});

	const admin = t.withIdentity(adminIdentity);
	const comparison = await admin.query(api.analytics.queries.fetchDashboard.fetchDashboard, {
		current: { from: RANGE_START, to: RANGE_START + 12 * 60 * 60 * 1000 },
		previous: { from: RANGE_START - DAY_IN_MS, to: RANGE_START - 1 }
	});

	expect(comparison.current).toEqual({
		revenue: 1000,
		orders: 1,
		customers: 1,
		averageOrderValue: 1000
	});
	expect(comparison.previous).toEqual({
		revenue: 700,
		orders: 1,
		customers: 1,
		averageOrderValue: 700
	});
});

test('returns an empty previous window when the range has no prior data', async () => {
	const t = convexTest(schema, modules);
	await seedOrders(t);

	const admin = t.withIdentity(adminIdentity);
	const comparison = await admin.query(api.analytics.queries.fetchDashboard.fetchDashboard, {
		current: { from: RANGE_START, to: RANGE_START + DAY_IN_MS },
		previous: { from: RANGE_START - DAY_IN_MS, to: RANGE_START - 1 }
	});

	expect(comparison.current).toEqual({
		revenue: 1000,
		orders: 1,
		customers: 1,
		averageOrderValue: 1000
	});
	expect(comparison.previous).toEqual({
		revenue: 0,
		orders: 0,
		customers: 0,
		averageOrderValue: 0
	});
});
