import type { PaginationOptions } from 'convex/server';
import type { QueryCtx } from '../../../_generated/server';
import { getPagination } from '../../../helpers/getPagination.js';
import type { ConvexPaginatedPage } from '../../../../shared/features/pagination/types/paginationTypesConvex.js';
import type { ConvexFilter } from '../../../../shared/features/filters/types/filterTypesConvex.js';
import type { TodoRecord } from '../../../../shared/features/todo/types/todoTypes.js';
import { filterValues } from './filterValues';

export async function paginateTasks(
	ctx: QueryCtx,
	ownerId: string,
	filters: ConvexFilter[],
	paginationOpts: PaginationOptions
): Promise<ConvexPaginatedPage<TodoRecord>> {
	const { done, priceBand: band, createdAtFrom } = filterValues(filters);

	if (createdAtFrom !== undefined) {
		if (done !== undefined && band !== undefined) {
			return getPagination(
				ctx.db
					.query('tasks')
					.withIndex('by_owner_id_done_price_band_created_at', (q) =>
						q
							.eq('ownerId', ownerId)
							.eq('done', done)
							.eq('priceBand', band)
							.gte('createdAt', createdAtFrom)
					)
					.order('desc'),
				{ paginationOpts }
			);
		}
		if (done !== undefined) {
			return getPagination(
				ctx.db
					.query('tasks')
					.withIndex('by_owner_id_done_created_at', (q) =>
						q.eq('ownerId', ownerId).eq('done', done).gte('createdAt', createdAtFrom)
					)
					.order('desc'),
				{ paginationOpts }
			);
		}
		if (band !== undefined) {
			return getPagination(
				ctx.db
					.query('tasks')
					.withIndex('by_owner_id_price_band_created_at', (q) =>
						q.eq('ownerId', ownerId).eq('priceBand', band).gte('createdAt', createdAtFrom)
					)
					.order('desc'),
				{ paginationOpts }
			);
		}
		return getPagination(
			ctx.db
				.query('tasks')
				.withIndex('by_owner_id_created_at', (q) =>
					q.eq('ownerId', ownerId).gte('createdAt', createdAtFrom)
				)
				.order('desc'),
			{ paginationOpts }
		);
	}

	if (done !== undefined && band !== undefined) {
		return getPagination(
			ctx.db
				.query('tasks')
				.withIndex('by_owner_id_done_price_band_created_at', (q) =>
					q.eq('ownerId', ownerId).eq('done', done).eq('priceBand', band)
				)
				.order('desc'),
			{ paginationOpts }
		);
	}
	if (done !== undefined) {
		return getPagination(
			ctx.db
				.query('tasks')
				.withIndex('by_owner_id_done_created_at', (q) => q.eq('ownerId', ownerId).eq('done', done))
				.order('desc'),
			{ paginationOpts }
		);
	}
	if (band !== undefined) {
		return getPagination(
			ctx.db
				.query('tasks')
				.withIndex('by_owner_id_price_band_created_at', (q) =>
					q.eq('ownerId', ownerId).eq('priceBand', band)
				)
				.order('desc'),
			{ paginationOpts }
		);
	}
	return getPagination(
		ctx.db
			.query('tasks')
			.withIndex('by_owner_id_created_at', (q) => q.eq('ownerId', ownerId))
			.order('desc'),
		{ paginationOpts }
	);
}
