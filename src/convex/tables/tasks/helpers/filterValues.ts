import type { ConvexFilter } from '../../../../shared/features/filters/types/filterTypesConvex.js';
import type { TodoFilterValues } from '../../../../shared/features/todo/types/todoTypes.js';

export function filterValues(filters: ConvexFilter[]): TodoFilterValues {
	const doneValue = filters.find((filter) => filter.field === 'done')?.eq;
	const priceValue = filters.find((filter) => filter.field === 'priceBand')?.eq;
	const dateValue = filters.find((filter) => filter.field === 'createdAt')?.gte;
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
