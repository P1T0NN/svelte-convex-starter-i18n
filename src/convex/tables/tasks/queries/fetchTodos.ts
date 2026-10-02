// LIBRARIES
import { v } from 'convex/values';

// CONVEX
import { authenticatedQuery } from '../../../builders/convexFunctionBuilders.js';

// COUNTERS
import { taskTotalCounter } from '../counters/taskTotalCounter.js';

// HELPERS
import { getFilteredTodoTotalAggregate } from '../helpers/getFilteredTodoTotalAggregate.js';
import { getTodoPage } from '../helpers/getTodoPage.js';
import { readTodoFilters } from '../helpers/readTodoFilters.js';
import { withTodoListItems } from '../helpers/enrichTodoPage.js';
import { getOwnerId } from '../../../betterAuth/helpers/requireIdentity.js';

// VALIDATORS
import { listPageArgs } from '../../../validators/listPageArgs.js';
import { todoPage } from '../validators/todoValidators.js';

export const fetchTodos = authenticatedQuery({
	args: { ...listPageArgs, now: v.optional(v.number()) },
	returns: todoPage,
	handler: async (ctx, args) => {
		const search = args.search?.trim() || undefined;
		const filters = readTodoFilters(args.filters, args.now);
		const hasFilters =
			filters.done !== undefined ||
			filters.priceBand !== undefined ||
			filters.createdAtFrom !== undefined;
		const ownerId = getOwnerId(ctx.identity);
		const canCountTotal = !search;
		const page = await getTodoPage(ctx, ownerId, args.paginationOpts, search, filters);
		const items = await withTodoListItems({ items: page.items });
		let total: number | undefined;
		if (canCountTotal) {
			total = hasFilters
				? await getFilteredTodoTotalAggregate(ctx, ownerId, filters)
				: await taskTotalCounter.count(ctx, ownerId);
		}

		return { ...page, items, total };
	}
});
