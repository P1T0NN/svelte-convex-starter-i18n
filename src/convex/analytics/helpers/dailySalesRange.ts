// TYPES
import type { Doc } from '../../_generated/dataModel.js';
import type { QueryCtx } from '../../_generated/server.js';

export const DAY_IN_MS = 86_400_000;

export function toUtcDay(timestamp: number): number {
	return Math.floor(timestamp / DAY_IN_MS) * DAY_IN_MS;
}

export async function readDailySalesRows(
	ctx: QueryCtx,
	bounds: { from: number; to: number }
): Promise<Doc<'dailySales'>[]> {
	return ctx.db
		.query('dailySales')
		.withIndex('by_day_shard', (q) =>
			q.gte('day', toUtcDay(bounds.from)).lte('day', toUtcDay(bounds.to))
		)
		.collect();
}
