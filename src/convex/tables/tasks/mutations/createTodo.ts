// LIBRARIES
import { ConvexError, v } from 'convex/values';
import { AuditActions } from 'convex-audit-log';

// BUILDERS
import { authenticatedUploadMutation } from '../../../builders/convexFunctionBuilders.js';

// CONFIG
import { TODO_PRICE_BANDS } from '../../../../shared/features/todo/config.js';

// AUDIT LOGS
import { logAuditEvent } from '../../../auditLogs/helpers/logAuditEvent.js';

// SCHEMAS
import { createTodoSchema } from '../../../../shared/features/todo/schemas/todoSchemas.js';

// VALIDATORS
import { todoMutationResult } from '../validators/todoValidators';
import { resolveStoredFileUrls } from '../../../storage/r2.js';
import { getOwnerId } from '../../../betterAuth/helpers/requireIdentity.js';

// TYPES
import type { Doc } from '../../../_generated/dataModel.js';
import type { TodoPriceBand } from '../../../../shared/features/todo/config.js';
import type { BackendErrorData } from '../../../../shared/types/types.js';
import type { WithoutSystemFields } from 'convex/server';

export const createTodo = authenticatedUploadMutation({
	rateLimit: { name: 'tasks:create' },
	args: {
		title: v.string(),
		done: v.boolean(),
		price: v.optional(v.number())
	},
	returns: todoMutationResult,
	handler: async (ctx, args) => {
		const parsed = createTodoSchema.safeParse(args);

		if (!parsed.success) {
			throw new ConvexError<BackendErrorData>({ code: 'INVALID_TODO_DATA' });
		}

		const price = parsed.data.price;

		const priceBand: TodoPriceBand =
			price < TODO_PRICE_BANDS.lt50.max
				? 'lt50'
				: price < TODO_PRICE_BANDS['50to100'].max
					? '50to100'
					: 'gt100';

		const imageKeys = args.uploadedFiles ?? [];
		const images = await resolveStoredFileUrls(imageKeys);

		const task: WithoutSystemFields<Doc<'tasks'>> = {
			ownerId: getOwnerId(ctx.identity),
			title: parsed.data.title,
			done: parsed.data.done,
			images,
			imageKeys,
			createdAt: Date.now(),
			price,
			priceBand
		};

		const taskId = await ctx.db.insert('tasks', task);

		await logAuditEvent(ctx, ctx.identity, {
			action: AuditActions.RECORD_CREATED,
			resourceType: 'tasks',
			resourceId: taskId,
			severity: 'info'
		});

		return {
			_id: taskId,
			title: task.title,
			done: task.done,
			images: task.images,
			imageKeys,
			createdAt: task.createdAt,
			price: task.price
		};
	}
});
