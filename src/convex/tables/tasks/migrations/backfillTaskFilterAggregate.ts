// MIGRATIONS
import { migrations } from '../../../migrations/migrations.js';

// AGGREGATES
import { taskFilterAggregate } from '../aggregates/taskFilterAggregate.js';

/** Backfill the task aggregate without blocking live task writes. */
export const backfillTaskFilterAggregate = migrations.define({
	table: 'tasks',
	migrateOne: async (ctx, task) => {
		await taskFilterAggregate.insertIfDoesNotExist(ctx, task);
	}
});
