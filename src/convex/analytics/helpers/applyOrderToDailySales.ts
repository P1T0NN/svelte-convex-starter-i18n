// HELPERS
import {
	addBuyerToSketch,
	createBuyerSketch,
	fromStoredBuyerSketch,
	toStoredBuyerSketch
} from './buyerSketch.js';
import { toUtcDay } from './dailySalesRange.js';
import { shardForOrder } from './dailySalesShards.js';

// TYPES
import type { Doc } from '../../_generated/dataModel.js';
import type { MutationCtx } from '../../_generated/server.js';

type Order = Doc<'orders'>;

function isSameDailySalesInput(previous: Order, next: Order): boolean {
	return (
		previous.placedAt === next.placedAt &&
		previous.status === next.status &&
		previous.total === next.total &&
		previous.customerId === next.customerId
	);
}

async function findDayRow(ctx: MutationCtx, day: number, shard: number) {
	return ctx.db
		.query('dailySales')
		.withIndex('by_day_shard', (q) => q.eq('day', day).eq('shard', shard))
		.unique();
}

async function addOrderToDay(ctx: MutationCtx, order: Order): Promise<void> {
	const day = toUtcDay(order.placedAt);
	const shard = shardForOrder(order._id);
	const row = await findDayRow(ctx, day, shard);
	const sketch = row ? fromStoredBuyerSketch(row.buyersSketch) : createBuyerSketch();
	addBuyerToSketch(sketch, order.customerId);

	const paid = order.status === 'paid';
	const changes = {
		orders: (row?.orders ?? 0) + 1,
		paidOrders: (row?.paidOrders ?? 0) + (paid ? 1 : 0),
		pendingOrders: (row?.pendingOrders ?? 0) + (order.status === 'pending' ? 1 : 0),
		refundedOrders: (row?.refundedOrders ?? 0) + (order.status === 'refunded' ? 1 : 0),
		cancelledOrders: (row?.cancelledOrders ?? 0) + (order.status === 'cancelled' ? 1 : 0),
		revenue: (row?.revenue ?? 0) + (paid ? order.total : 0),
		buyersSketch: toStoredBuyerSketch(sketch)
	};

	if (row) {
		await ctx.db.patch(row._id, changes);
		return;
	}

	await ctx.db.insert('dailySales', { day, shard, ...changes });
}

async function removeOrderFromDay(ctx: MutationCtx, order: Order): Promise<void> {
	const day = toUtcDay(order.placedAt);
	const shard = shardForOrder(order._id);
	const row = await findDayRow(ctx, day, shard);
	if (!row) return;

	const paid = order.status === 'paid';
	await ctx.db.patch(row._id, {
		orders: Math.max(0, row.orders - 1),
		paidOrders: Math.max(0, row.paidOrders - (paid ? 1 : 0)),
		pendingOrders: Math.max(0, row.pendingOrders - (order.status === 'pending' ? 1 : 0)),
		refundedOrders: Math.max(0, row.refundedOrders - (order.status === 'refunded' ? 1 : 0)),
		cancelledOrders: Math.max(0, row.cancelledOrders - (order.status === 'cancelled' ? 1 : 0)),
		revenue: Math.max(0, row.revenue - (paid ? order.total : 0))
	});
}

export async function applyOrderChangeToDailySales(
	ctx: MutationCtx,
	previous: Order | null,
	next: Order | null
): Promise<void> {
	if (previous && next && isSameDailySalesInput(previous, next)) return;
	if (previous) await removeOrderFromDay(ctx, previous);
	if (next) await addOrderToDay(ctx, next);
}
