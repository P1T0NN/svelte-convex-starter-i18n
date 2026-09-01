// LIBRARIES
import { migrations } from '../../../migrations/migrations.js';

// COUNTERS
import { taskTotalCounter } from '../counters/taskTotalCounter.js';

/** Populate the task counter for rows that existed before the counter was installed. */
export const backfillTaskTotalCounter = migrations.define({
	table: 'tasks',
	migrateOne: async (ctx, task) => {
		if (task.ownerId !== undefined) await taskTotalCounter.inc(ctx, task.ownerId);
	}
});
