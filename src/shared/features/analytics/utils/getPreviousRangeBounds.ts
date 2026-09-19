// UTILS
import { DAY_IN_MS, startOfDay } from '../../../utils/date.js';

// TYPES
import type { RangeBounds } from '../types/analyticsTypes.js';

export function getPreviousRangeBounds(bounds: RangeBounds): RangeBounds {
	const dayCount = Math.max(
		1,
		Math.round((startOfDay(bounds.to).getTime() - bounds.from.getTime()) / DAY_IN_MS) + 1
	);
	const from = bounds.from;

	return {
		from: startOfDay(new Date(from.getFullYear(), from.getMonth(), from.getDate() - dayCount)),
		to: new Date(from.getTime() - 1)
	};
}
