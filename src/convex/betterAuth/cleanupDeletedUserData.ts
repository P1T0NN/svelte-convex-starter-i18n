// LIBRARIES
import { v } from 'convex/values';

// CONVEX
import { internal } from '../_generated/api.js';
import { internalMutation } from '../builders/convexFunctionBuilders.js';

// STORAGE
import { deleteStoredFiles, queueUploadDeletion } from '../storage/r2.js';

const CLEANUP_BATCH_SIZE = 50;

export const cleanupDeletedUserData = internalMutation({
	args: {
		ownerId: v.string(),
		phase: v.union(v.literal('tasks'), v.literal('uploads'))
	},
	returns: v.null(),
	handler: async (ctx, args) => {
		if (args.phase === 'tasks') {
			const tasks = await ctx.db
				.query('tasks')
				.withIndex('by_owner_id_created_at', (query) => query.eq('ownerId', args.ownerId))
				.take(CLEANUP_BATCH_SIZE);
			for (const task of tasks) {
				await deleteStoredFiles(ctx, task.imageKeys ?? task.images);
				await ctx.db.delete(task._id);
			}
			await ctx.scheduler.runAfter(
				0,
				internal.betterAuth.cleanupDeletedUserData.cleanupDeletedUserData,
				{ ownerId: args.ownerId, phase: tasks.length === CLEANUP_BATCH_SIZE ? 'tasks' : 'uploads' }
			);
			return null;
		}

		const uploadBatches = await Promise.all(
			(['pending', 'processing', 'uploaded'] as const).map((status) =>
				ctx.db
					.query('storageUploads')
					.withIndex('by_owner_id_and_status_and_created_at', (query) =>
						query.eq('ownerId', args.ownerId).eq('status', status)
					)
					.take(CLEANUP_BATCH_SIZE)
			)
		);
		const uploads = uploadBatches.flat();
		if (uploads.length) await queueUploadDeletion(ctx, uploads);

		if (uploadBatches.some((batch) => batch.length === CLEANUP_BATCH_SIZE)) {
			await ctx.scheduler.runAfter(
				0,
				internal.betterAuth.cleanupDeletedUserData.cleanupDeletedUserData,
				{ ownerId: args.ownerId, phase: 'uploads' }
			);
		}
		return null;
	}
});
