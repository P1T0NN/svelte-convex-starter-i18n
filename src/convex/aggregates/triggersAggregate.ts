// LIBRARIES
import { Triggers } from 'convex-helpers/server/triggers';
import { taskTotalCounter } from '../tables/tasks/counters/taskTotalCounter.js';

// AGGREGATES
import { taskFilterAggregate } from '../tables/tasks/aggregates/taskFilterAggregate.js';

// TYPES
import type { DataModel } from '../_generated/dataModel.js';

const aggregateTriggers = new Triggers<DataModel>();

// Idempotent triggers keep live writes safe while an aggregate backfill runs.
aggregateTriggers.register('tasks', taskFilterAggregate.idempotentTrigger());
aggregateTriggers.register('tasks', async (ctx, change) => {
	const oldOwnerId = change.oldDoc?.ownerId;
	const newOwnerId = change.newDoc?.ownerId;

	if (oldOwnerId === newOwnerId) return;
	if (oldOwnerId !== undefined) await taskTotalCounter.dec(ctx, oldOwnerId);
	if (newOwnerId !== undefined) await taskTotalCounter.inc(ctx, newOwnerId);
});

export { aggregateTriggers };
