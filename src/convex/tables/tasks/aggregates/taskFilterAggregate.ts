// LIBRARIES
import { TableAggregate } from '@convex-dev/aggregate';
import { components } from '../../../_generated/api';

// TYPES
import type { TodoPriceBand } from '../../../../shared/features/todo/config.js';
import type { DataModel } from '../../../_generated/dataModel';

export type TaskFilterAggregateKey = [boolean, TodoPriceBand, number];
export type TaskFilterAggregateNamespace = string | undefined;

export const taskFilterAggregate = new TableAggregate<{
	Namespace: TaskFilterAggregateNamespace;
	Key: TaskFilterAggregateKey;
	DataModel: DataModel;
	TableName: 'tasks';
}>(components.tasksFilterAggregate, {
	namespace: (task) => task.ownerId,
	sortKey: (task) => [task.done, task.priceBand, task.createdAt]
});
