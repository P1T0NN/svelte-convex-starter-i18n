import { expect, test } from 'vitest';
import { convexTest } from 'convex-test';

import { api } from '../../src/convex/_generated/api';
import schema from '../../src/convex/schema';
import { aggregateTriggers } from '../../src/convex/aggregates/triggersAggregate';

// TYPES
import type { UserIdentity } from 'convex/server';

const modules = import.meta.glob('../../src/convex/**/*.ts');
const DAY_IN_MS = 86_400_000;
const RANGE_START = Date.UTC(2026, 0, 1);

const adminIdentity: Partial<UserIdentity> & { role: string } = {
	tokenIdentifier: 'top-products-admin',
	subject: 'top-products-admin',
	role: 'admin'
};

async function seedCatalog(t: ReturnType<typeof convexTest>) {
	await t.run(async (ctx) => {
		const { db } = aggregateTriggers.wrapDB(ctx);
		const lamp = await db.insert('products', { name: 'Lamp', sku: 'LMP-001', priceCents: 5000 });
		const mug = await db.insert('products', { name: 'Mug', sku: 'MUG-002', priceCents: 2000 });
		const chair = await db.insert('products', {
			name: 'Chair',
			sku: 'CHR-003',
			priceCents: 9000
		});

		const paidOrder = await db.insert('orders', {
			orderNumber: 'ORD-00001',
			customerId: 'cust_1',
			status: 'paid',
			total: 14000,
			currency: 'USD',
			placedAt: RANGE_START
		});
		await db.insert('orderItems', {
			orderId: paidOrder,
			productId: lamp,
			quantity: 2,
			lineTotalCents: 10000
		});
		await db.insert('orderItems', {
			orderId: paidOrder,
			productId: mug,
			quantity: 2,
			lineTotalCents: 4000
		});

		const refundedOrder = await db.insert('orders', {
			orderNumber: 'ORD-00002',
			customerId: 'cust_2',
			status: 'refunded',
			total: 9000,
			currency: 'USD',
			placedAt: RANGE_START + DAY_IN_MS
		});
		await db.insert('orderItems', {
			orderId: refundedOrder,
			productId: chair,
			quantity: 1,
			lineTotalCents: 9000
		});
	});
}

test('ranks paid products by revenue in the selected range', async () => {
	const t = convexTest(schema, modules);
	await seedCatalog(t);

	const admin = t.withIdentity(adminIdentity);
	const result = await admin.query(api.analytics.queries.fetchTopProducts.fetchTopProducts, {
		from: RANGE_START,
		to: RANGE_START + DAY_IN_MS
	});

	expect(result.exact).toBe(true);
	expect(result.products).toEqual([
		{ productId: expect.any(String), name: 'Lamp', revenue: 10000, quantity: 2 },
		{ productId: expect.any(String), name: 'Mug', revenue: 4000, quantity: 2 }
	]);
});

test('excludes products when the range has no paid sales', async () => {
	const t = convexTest(schema, modules);
	await seedCatalog(t);

	const admin = t.withIdentity(adminIdentity);
	const result = await admin.query(api.analytics.queries.fetchTopProducts.fetchTopProducts, {
		from: RANGE_START + 2 * DAY_IN_MS,
		to: RANGE_START + 3 * DAY_IN_MS
	});

	expect(result.exact).toBe(true);
	expect(result.products).toEqual([]);
});

test('sums a product across orders on different shards', async () => {
	const t = convexTest(schema, modules);
	await t.run(async (ctx) => {
		const { db } = aggregateTriggers.wrapDB(ctx);
		const lamp = await db.insert('products', { name: 'Lamp', sku: 'LMP-001', priceCents: 5000 });

		const firstOrder = await db.insert('orders', {
			orderNumber: 'ORD-00001',
			customerId: 'cust_1',
			status: 'paid',
			total: 10000,
			currency: 'USD',
			placedAt: RANGE_START
		});
		await db.insert('orderItems', {
			orderId: firstOrder,
			productId: lamp,
			quantity: 2,
			lineTotalCents: 10000
		});

		const secondOrder = await db.insert('orders', {
			orderNumber: 'ORD-00002',
			customerId: 'cust_2',
			status: 'paid',
			total: 5000,
			currency: 'USD',
			placedAt: RANGE_START + 60_000
		});
		await db.insert('orderItems', {
			orderId: secondOrder,
			productId: lamp,
			quantity: 1,
			lineTotalCents: 5000
		});
	});

	const admin = t.withIdentity(adminIdentity);
	const result = await admin.query(api.analytics.queries.fetchTopProducts.fetchTopProducts, {
		from: RANGE_START,
		to: RANGE_START + DAY_IN_MS
	});

	expect(result.exact).toBe(true);
	expect(result.products).toEqual([
		{ productId: expect.any(String), name: 'Lamp', revenue: 15000, quantity: 3 }
	]);
});

test('keeps the product rollup in sync when an order is refunded', async () => {
	const t = convexTest(schema, modules);
	await seedCatalog(t);

	await t.run(async (ctx) => {
		const { db } = aggregateTriggers.wrapDB(ctx);
		const order = await db
			.query('orders')
			.withIndex('by_placed_at', (q) => q.eq('placedAt', RANGE_START))
			.unique();
		if (order) await db.patch(order._id, { status: 'refunded' });
	});

	const admin = t.withIdentity(adminIdentity);
	const result = await admin.query(api.analytics.queries.fetchTopProducts.fetchTopProducts, {
		from: RANGE_START,
		to: RANGE_START + DAY_IN_MS
	});

	expect(result.exact).toBe(true);
	expect(result.products).toEqual([]);
});

test('keeps the product rollup in sync when an order item is deleted', async () => {
	const t = convexTest(schema, modules);
	await seedCatalog(t);

	await t.run(async (ctx) => {
		const { db } = aggregateTriggers.wrapDB(ctx);
		const lamp = await db
			.query('products')
			.withIndex('by_sku', (q) => q.eq('sku', 'LMP-001'))
			.unique();
		if (!lamp) return;

		const item = await db
			.query('orderItems')
			.withIndex('by_product_id', (q) => q.eq('productId', lamp._id))
			.unique();
		if (item) await db.delete(item._id);
	});

	const admin = t.withIdentity(adminIdentity);
	const result = await admin.query(api.analytics.queries.fetchTopProducts.fetchTopProducts, {
		from: RANGE_START,
		to: RANGE_START + DAY_IN_MS
	});

	expect(result.exact).toBe(true);
	expect(result.products).toEqual([
		{ productId: expect.any(String), name: 'Mug', revenue: 4000, quantity: 2 }
	]);
});
