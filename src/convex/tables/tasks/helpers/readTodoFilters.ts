// CONFIG
import { TODO_PRICE_BANDS } from '../../../../shared/features/todo/config.js';

// TYPES
import type { TodoFilterValues } from '../../../../shared/features/todo/types/todoTypes.js';
import type { TodoPriceBand } from '../../../../shared/features/todo/config.js';

const DAY_MS = 24 * 60 * 60 * 1000;

function isTodoPriceBand(value: string | undefined): value is TodoPriceBand {
	return value !== undefined && Object.hasOwn(TODO_PRICE_BANDS, value);
}

function readDone(status: string | undefined): boolean | undefined {
	if (status === 'done') return true;
	if (status === 'pending') return false;
	return undefined;
}

function startOfToday(now: number): number {
	const today = new Date(now);
	today.setUTCHours(0, 0, 0, 0);
	return today.getTime();
}

function readCreatedAtFrom(date: string | undefined, now: number): number | undefined {
	switch (date) {
		case 'today':
			return startOfToday(now);
		case '7d':
			return now - 7 * DAY_MS;
		case '30d':
			return now - 30 * DAY_MS;
		default:
			return undefined;
	}
}

/** Read the supported symbolic task filters into typed index values. */
export function readTodoFilters(
	filters: Record<string, string> | undefined,
	now: number | undefined
): TodoFilterValues {
	if (now === undefined) return {};

	return {
		done: readDone(filters?.status),
		priceBand: isTodoPriceBand(filters?.price) ? filters.price : undefined,
		createdAtFrom: readCreatedAtFrom(filters?.date, now)
	};
}
