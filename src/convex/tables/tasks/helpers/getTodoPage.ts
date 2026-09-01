// HELPERS
import { paginateSearch } from '../../../helpers/paginateSearch';
import { filterValues } from './filterValues';
import { paginateTasks } from './paginateTasks';
import { resolveStoredFileUrls } from '../../../storage/r2.js';

// TYPES
import type { ConvexFilter } from '../../../../shared/features/filters/types/filterTypesConvex.js';
import type { ConvexPaginatedPage } from '../../../../shared/features/pagination/types/paginationTypesConvex.js';
import type { TodoRecord, TodoResult } from '../../../../shared/features/todo/types/todoTypes.js';
import type { QueryCtx } from '../../../_generated/server';
import type { PaginationOptions } from 'convex/server';

const toTodoListItem = async (task: TodoRecord): Promise<TodoResult> => ({
	_id: task._id,
	title: task.title,
	done: task.done ? 1 : 0,
	images: await resolveStoredFileUrls(task.imageKeys ?? task.images),
	imageKeys: task.imageKeys ?? task.images,
	createdAt: task.createdAt,
	price: task.price
});

export async function getTodoPage(
	ctx: QueryCtx,
	ownerId: string,
	paginationOpts: PaginationOptions,
	search: string | undefined,
	filters: ConvexFilter[]
): Promise<ConvexPaginatedPage<TodoResult>> {
	let page: ConvexPaginatedPage<TodoRecord>;

	if (!search) {
		page = await paginateTasks(ctx, ownerId, filters, paginationOpts);
	} else {
		page = await paginateSearch<TodoRecord>({
			ctx,
			search,
			filters,
			paginationOpts,
			buildQuery: ({ ctx, search, filters }) => {
				const { done, priceBand: band, createdAtFrom } = filterValues(filters);
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

	return { ...page, items: await Promise.all(page.items.map(toTodoListItem)) };
}
