// HELPERS
import { paginateSearch } from '../../../helpers/paginateSearch.js';
import { paginateTasks } from './paginateTasks.js';

// TYPES
import type { ConvexPaginatedPage } from '../../../../shared/features/pagination/types/paginationTypesConvex.js';
import type {
	TodoFilterValues,
	TodoRecord
} from '../../../../shared/features/todo/types/todoTypes.js';
import type { QueryCtx } from '../../../_generated/server.js';
import type { PaginationOptions } from 'convex/server';

export function getTodoPage(
	ctx: QueryCtx,
	ownerId: string,
	paginationOpts: PaginationOptions,
	search: string | undefined,
	filters: TodoFilterValues
): Promise<ConvexPaginatedPage<TodoRecord>> {
	if (!search) {
		return paginateTasks(ctx, ownerId, filters, paginationOpts);
	}

	return paginateSearch<TodoRecord>({
		ctx,
		search,
		paginationOpts,
		buildQuery: ({ ctx, search }) => {
			const { done, priceBand: band, createdAtFrom } = filters;
			const searchQuery = ctx.db.query('tasks').withSearchIndex('search_title', (q) => {
				const searchFilter = q.search('title', search).eq('ownerId', ownerId);
				if (done !== undefined && band !== undefined) {
					return searchFilter.eq('done', done).eq('priceBand', band);
				}
				if (done !== undefined) return searchFilter.eq('done', done);
				if (band !== undefined) return searchFilter.eq('priceBand', band);
				return searchFilter;
			});
			return createdAtFrom === undefined
				? searchQuery
				: searchQuery.filter((q) => q.gte(q.field('createdAt'), createdAtFrom));
		}
	});
}
