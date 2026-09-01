// WRAPPERS
import { fetchOptimizedQuery } from '../../../wrappers/fetchOptimizedQuery';

// UTILS
import { todoPredicateFor } from '../../../../shared/features/todo/utils/filterPredicates.js';

// COUNTERS
import { taskTotalCounter } from '../counters/taskTotalCounter.js';

// HELPERS
import { getFilteredTodoTotalAggregate } from '../helpers/getFilteredTodoTotalAggregate.js';
import { taskFilterAggregate } from '../aggregates/taskFilterAggregate.js';
import { getTodoPage } from '../helpers/getTodoPage.js';
import { getOwnerId } from '../../../betterAuth/helpers/requireIdentity.js';

// VALIDATORS
import { todoPage } from '../validators/todoValidators';

export const fetchTodos = fetchOptimizedQuery({
	auth: 'user',
	returns: todoPage,
	count: taskFilterAggregate,
	countTotal: ({ ctx, identity }) => taskTotalCounter.count(ctx, getOwnerId(identity)),
	predicateFor: (key, value, args) => todoPredicateFor(key, value, args.now),
	filteredTotal: 'exact',
	countFiltered: async ({ ctx, identity, search, filters }) =>
		search ? undefined : getFilteredTodoTotalAggregate(ctx, getOwnerId(identity), filters),
	fetchPage: ({ ctx, identity, paginationOpts, search, filters }) =>
		getTodoPage(ctx, getOwnerId(identity), paginationOpts, search, filters)
});
