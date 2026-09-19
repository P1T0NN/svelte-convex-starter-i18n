// LIBRARIES
import { v } from 'convex/values';

// BUILDERS
import { adminQuery } from '../../builders/convexFunctionBuilders.js';

// HELPERS
import { getDashboardStats } from '../helpers/getDashboardStats.js';

// VALIDATORS
import { dashboardComparison } from '../validators/analyticsValidators.js';

// TYPES
import type { DashboardComparison } from '../../../shared/features/analytics/types/analyticsTypes.js';

function assertRange(range: { from: number; to: number }): void {
	if (!Number.isFinite(range.from) || !Number.isFinite(range.to) || range.from > range.to) {
		throw new Error('Invalid dashboard date range');
	}
}

export const fetchDashboard = adminQuery({
	args: {
		current: v.object({ from: v.number(), to: v.number() }),
		previous: v.object({ from: v.number(), to: v.number() })
	},
	returns: dashboardComparison,
	handler: async (ctx, args): Promise<DashboardComparison> => {
		assertRange(args.current);
		assertRange(args.previous);

		const [current, previous] = await Promise.all([
			getDashboardStats(ctx, args.current),
			getDashboardStats(ctx, args.previous)
		]);

		return { current, previous };
	}
});
