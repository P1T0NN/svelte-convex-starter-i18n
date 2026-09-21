// UTILS
import { indexBy } from '../../../../shared/lib/algorithms/index.js';

// TYPES
import type { ConvexFilter } from '../../../../shared/features/filters/types/filterTypesConvex.js';
import type { TodoFilterValues } from '../../../../shared/features/todo/types/todoTypes.js';

export function filterValues(filters: ConvexFilter[]): TodoFilterValues {
	const filtersByField = indexBy(filters, (filter) => filter.field);
	const doneValue = filtersByField.get('done')?.eq;
	const priceValue = filtersByField.get('priceBand')?.eq;
	const dateValue = filtersByField.get('createdAt')?.gte;
	const done = doneValue === true || doneValue === false ? doneValue : undefined;
	const priceBand =
		priceValue === 'lt50' || priceValue === '50to100' || priceValue === 'gt100'
			? priceValue
			: undefined;

	return {
		done,
		priceBand,
		createdAtFrom: dateValue
	};
}
