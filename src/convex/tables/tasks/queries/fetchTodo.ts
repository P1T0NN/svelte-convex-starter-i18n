// LIBRARIES
import { ConvexError, v } from 'convex/values';

// BUILDERS
import { authenticatedQuery } from '../../../builders/convexFunctionBuilders.js';

// TYPES
import type { Todo } from '../../../../shared/features/todo/types/todoTypes.js';
import type { BackendErrorData } from '../../../../shared/types/types.js';

// VALIDATORS
import { todoMutationResult } from '../validators/todoValidators';
import { resolveStoredFileUrls } from '../../../storage/r2.js';
import { getOwnerId } from '../../../betterAuth/helpers/requireIdentity.js';

export const fetchTodo = authenticatedQuery({
	args: { id: v.id('tasks') },
	returns: todoMutationResult,
	handler: async (ctx, args) => {
		const task = await ctx.db.get(args.id);
		if (!task || task.ownerId !== getOwnerId(ctx.identity)) {
			throw new ConvexError<BackendErrorData>({ code: 'TODO_NOT_FOUND' });
		}
		const todo: Todo = {
			_id: task._id,
			title: task.title,
			done: task.done,
			images: await resolveStoredFileUrls(task.imageKeys ?? task.images),
			imageKeys: task.imageKeys ?? task.images,
			createdAt: task.createdAt,
			price: task.price
		};
		return todo;
	}
});
