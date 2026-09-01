// HELPERS
import { getFilteredTotalAggregate } from '../../../aggregates/helpers/getFilteredTotalAggregate';
import { filterValues } from './filterValues';
import { taskFilterAggregate } from '../aggregates/taskFilterAggregate';

// UTILS
import { getPrefixRangeBoundsAggregate } from '../../../aggregates/utils/getPrefixRangeBoundsAggregate';

// TYPES
import type { ConvexFilter } from '../../../../shared/features/filters/types/filterTypesConvex.js';
import type { TodoPriceBand } from '../../../../shared/features/todo/config.js';
import type { Id } from '../../../_generated/dataModel';
import type { QueryCtx } from '../../../_generated/server';

const ALL_DONE_VALUES = [false, true] as const;
const ALL_PRICE_BANDS = ['lt50', '50to100', 'gt100'] as const satisfies readonly TodoPriceBand[];

/** Translate task filters into bounded aggregate queries. */
export async function getFilteredTodoTotalAggregate(
	ctx: QueryCtx,
	ownerId: string,
	filters: ConvexFilter[]
): Promise<number> {
	const { done, priceBand, createdAtFrom } = filterValues(filters);
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
