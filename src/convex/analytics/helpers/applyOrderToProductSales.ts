// HELPERS
import { toUtcDay } from './dailySalesRange.js';
import { shardForOrder } from './dailySalesShards.js';

// TYPES
import type { Doc, Id } from '../../_generated/dataModel.js';
import type { MutationCtx } from '../../_generated/server.js';

type Order = Doc<'orders'>;
type OrderItem = Doc<'orderItems'>;

function isSameOrderSalesInput(previous: Order, next: Order): boolean {
	return previous.placedAt === next.placedAt && previous.status === next.status;
}

function isSameItemSalesInput(previous: OrderItem, next: OrderItem): boolean {
	return (
		previous.orderId === next.orderId &&
		previous.productId === next.productId &&
		previous.quantity === next.quantity &&
		previous.lineTotalCents === next.lineTotalCents
	);
}

async function findProductDayRow(
	ctx: MutationCtx,
	day: number,
	productId: Id<'products'>,
	shard: number
) {
	return ctx.db
		.query('dailyProductSales')
		.withIndex('by_day_product_shard', (q) =>
			q.eq('day', day).eq('productId', productId).eq('shard', shard)
		)
		.unique();
}

async function loadOrderItems(ctx: MutationCtx, orderId: Id<'orders'>): Promise<OrderItem[]> {
	return ctx.db
		.query('orderItems')
		.withIndex('by_order_id', (q) => q.eq('orderId', orderId))
		.collect();
}

async function addItemToDay(
	ctx: MutationCtx,
	day: number,
	shard: number,
	item: OrderItem
): Promise<void> {
	const row = await findProductDayRow(ctx, day, item.productId, shard);

	if (row) {
		await ctx.db.patch(row._id, {
			quantity: row.quantity + item.quantity,
			revenue: row.revenue + item.lineTotalCents
		});
		return;
	}

	await ctx.db.insert('dailyProductSales', {
		day,
		productId: item.productId,
		shard,
		quantity: item.quantity,
		revenue: item.lineTotalCents
	});
}

async function removeItemFromDay(
	ctx: MutationCtx,
	day: number,
	shard: number,
	item: OrderItem
): Promise<void> {
	const row = await findProductDayRow(ctx, day, item.productId, shard);
	if (!row) return;

	await ctx.db.patch(row._id, {
		quantity: Math.max(0, row.quantity - item.quantity),
		revenue: Math.max(0, row.revenue - item.lineTotalCents)
	});
}

export async function applyOrderChangeToProductSales(
	ctx: MutationCtx,
	previous: Order | null,
	next: Order | null
): Promise<void> {
	if (previous && next && isSameOrderSalesInput(previous, next)) return;

	if (previous && previous.status === 'paid') {
		const day = toUtcDay(previous.placedAt);
		const shard = shardForOrder(previous._id);
		for (const item of await loadOrderItems(ctx, previous._id)) {
			await removeItemFromDay(ctx, day, shard, item);
		}
	}

	if (next && next.status === 'paid') {
		const day = toUtcDay(next.placedAt);
		const shard = shardForOrder(next._id);
		for (const item of await loadOrderItems(ctx, next._id)) {
			await addItemToDay(ctx, day, shard, item);
		}
	}
}

export async function applyOrderItemChangeToProductSales(
	ctx: MutationCtx,
	previous: OrderItem | null,
	next: OrderItem | null
): Promise<void> {
	if (previous && next && isSameItemSalesInput(previous, next)) return;

	if (previous) {
		const order = await ctx.db.get(previous.orderId);
		if (order?.status === 'paid') {
			await removeItemFromDay(ctx, toUtcDay(order.placedAt), shardForOrder(order._id), previous);
		}
	}

	if (next) {
		const order = await ctx.db.get(next.orderId);
		if (order?.status === 'paid') {
			await addItemToDay(ctx, toUtcDay(order.placedAt), shardForOrder(order._id), next);
		}
	}
}
