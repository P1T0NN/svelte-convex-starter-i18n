// LIBRARIES
import { ShardedCounter } from '@convex-dev/sharded-counter';
import { components } from '../../../_generated/api.js';

/** Exact per-owner task totals for unfiltered list views. */
export const taskTotalCounter = new ShardedCounter<string>(components.tasksTotalCounter, {
	defaultShards: 8
});
