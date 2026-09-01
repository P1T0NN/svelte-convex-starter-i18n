// LIBRARIES
import { ConvexError, v } from 'convex/values';
import { AuditActions } from 'convex-audit-log';

// BUILDERS
import { authenticatedUploadMutation } from '../../../builders/convexFunctionBuilders.js';

// SCHEMAS
import { updateTodoSchema } from '../../../../shared/features/todo/schemas/todoSchemas.js';

// CONFIG
import { STORAGE_CONFIG } from '../../../../shared/features/storage/config.js';

// AUDIT LOGS
import { logAuditChange } from '../../../auditLogs/helpers/logAuditChange.js';

// VALIDATORS
import { todoMutationResult } from '../validators/todoValidators';
import { deleteStoredFiles, resolveStoredFileUrls } from '../../../storage/r2.js';
import { getOwnerId } from '../../../betterAuth/helpers/requireIdentity.js';

// TYPES
import type { Doc } from '../../../_generated/dataModel.js';
import type { BackendErrorData } from '../../../../shared/types/types.js';
import type { WithoutSystemFields } from 'convex/server';

export const updateTodo = authenticatedUploadMutation({
	rateLimit: { name: 'tasks:update' },
	args: {
		id: v.id('tasks'),
		title: v.string(),
		done: v.boolean(),
		images: v.optional(v.array(v.string()))
	},
	returns: todoMutationResult,
	handler: async (ctx, args) => {
		const parsed = updateTodoSchema.safeParse(args);
		if (!parsed.success) {
			throw new ConvexError<BackendErrorData>({ code: 'INVALID_TODO_DATA' });
		}

		const task = await ctx.db.get(args.id);
		if (!task || task.ownerId !== getOwnerId(ctx.identity)) {
			throw new ConvexError<BackendErrorData>({ code: 'TODO_NOT_FOUND' });
		}

		const existingKeys = task.imageKeys ?? task.images;
		const retainedKeys = args.retainedFiles ?? existingKeys;
		if (retainedKeys.some((key) => !existingKeys.includes(key))) {
			throw new ConvexError<BackendErrorData>({ code: 'INVALID_RETAINED_IMAGE' });
		}
		if (new Set(retainedKeys).size !== retainedKeys.length) {
			throw new ConvexError<BackendErrorData>({ code: 'DUPLICATE_RETAINED_IMAGE' });
		}
		const imageKeys = [...retainedKeys, ...(args.uploadedFiles ?? [])];
		if (imageKeys.length > STORAGE_CONFIG.maxFilesPerUpload) {
			throw new ConvexError<BackendErrorData>({
				code: 'TOO_MANY_FILES',
				maxFiles: STORAGE_CONFIG.maxFilesPerUpload
			});
		}
		await deleteStoredFiles(
			ctx,
			existingKeys.filter((key) => !retainedKeys.includes(key))
		);
		const images = await resolveStoredFileUrls(imageKeys);
		const taskPatch: Partial<WithoutSystemFields<Doc<'tasks'>>> = {
			title: parsed.data.title,
			done: parsed.data.done,
			images,
			imageKeys
		};
		await ctx.db.patch(task._id, taskPatch);
		await logAuditChange(ctx, ctx.identity, {
			action: AuditActions.RECORD_UPDATED,
			resourceType: 'tasks',
			resourceId: task._id,
			before: {
				title: task.title,
				done: task.done,
				imageCount: existingKeys.length
			},
			after: {
				title: parsed.data.title,
				done: parsed.data.done,
				imageCount: imageKeys.length
			},
			generateDiff: true,
			severity: 'info'
		});

		return {
			_id: task._id,
			title: parsed.data.title,
			done: parsed.data.done,
			images,
			imageKeys,
			createdAt: task.createdAt,
			price: task.price
		};
	}
});
