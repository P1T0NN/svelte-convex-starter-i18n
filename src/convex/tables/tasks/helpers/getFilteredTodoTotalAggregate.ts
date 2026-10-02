// HELPERS
import { getFilteredTotalAggregate } from '../../../aggregates/helpers/getFilteredTotalAggregate';
import { taskFilterAggregate } from '../aggregates/taskFilterAggregate';

// UTILS
import { getPrefixRangeBoundsAggregate } from '../../../aggregates/utils/getPrefixRangeBoundsAggregate';

// TYPES
import type { TodoFilterValues } from '../../../../shared/features/todo/types/todoTypes.js';
import type { TodoPriceBand } from '../../../../shared/features/todo/config.js';
import type { Id } from '../../../_generated/dataModel';
import type { QueryCtx } from '../../../_generated/server';

const ALL_DONE_VALUES = [false, true] as const;
const ALL_PRICE_BANDS = ['lt50', '50to100', 'gt100'] as const satisfies readonly TodoPriceBand[];

/** Translate task filters into bounded aggregate queries. */
export async function getFilteredTodoTotalAggregate(
	ctx: QueryCtx,
	ownerId: string,
	filters: TodoFilterValues
): Promise<number> {
	const { done, priceBand, createdAtFrom } = filters;
	const doneValues = done === undefined ? ALL_DONE_VALUES : [done];
	const priceBandValues = priceBand === undefined ? ALL_PRICE_BANDS : [priceBand];

	const queries = doneValues.flatMap((doneValue) =>
		priceBandValues.map((priceBandValue) => ({
			namespace: ownerId,
			bounds: getPrefixRangeBoundsAggregate<[boolean, TodoPriceBand], Id<'tasks'>>(
				[doneValue, priceBandValue],
				createdAtFrom === undefined ? undefined : { from: createdAtFrom }
			)
		}))
	);

	return getFilteredTotalAggregate(ctx, taskFilterAggregate, queries);
}
