// LIBRARIES
import { v } from 'convex/values';

// BUILDERS
import { adminQuery } from '../../builders/convexFunctionBuilders.js';

// HELPERS
import { assertDateRange } from '../helpers/assertDateRange.js';
import { getDashboardStats } from '../helpers/getDashboardStats.js';

// VALIDATORS
import { dashboardComparison } from '../validators/analyticsValidators.js';

// TYPES
import type { DashboardComparison } from '../../../shared/features/analytics/types/analyticsTypes.js';

export const fetchDashboard = adminQuery({
	args: {
		current: v.object({ from: v.number(), to: v.number() }),
		previous: v.object({ from: v.number(), to: v.number() })
	},
	returns: dashboardComparison,
	handler: async (ctx, args): Promise<DashboardComparison> => {
		assertDateRange(args.current);
		assertDateRange(args.previous);

		const [current, previous] = await Promise.all([
			getDashboardStats(ctx, args.current),
			getDashboardStats(ctx, args.previous)
		]);

		return { current, previous };
	}
});
