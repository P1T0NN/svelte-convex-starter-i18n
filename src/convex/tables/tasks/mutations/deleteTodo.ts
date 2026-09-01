// LIBRARIES
import { ConvexError, v } from 'convex/values';
import { AuditActions } from 'convex-audit-log';
import { deleteStoredFiles } from '../../../storage/r2.js';

// BUILDERS
import { authenticatedMutation } from '../../../builders/convexFunctionBuilders.js';

// HELPERS
import { logAuditBulk } from '../../../auditLogs/helpers/logAuditBulk.js';
import { getOwnerId } from '../../../betterAuth/helpers/requireIdentity.js';

// TYPES
import type { AuditEvent } from '../../../auditLogs/types/auditLogsTypes.js';
import type { BackendErrorData } from '../../../../shared/types/types.js';

export const deleteTodo = authenticatedMutation({
	rateLimit: { name: 'tasks:delete' },
	args: { ids: v.array(v.id('tasks')) },
	returns: v.number(),
	handler: async (ctx, args) => {
		if (args.ids.length > 100) {
			throw new ConvexError<BackendErrorData>({ code: 'TOO_MANY_TODOS', maxTodos: 100 });
		}

		let deleted = 0;
		const auditEvents: AuditEvent[] = [];
		for (const id of new Set(args.ids)) {
			const task = await ctx.db.get(id);
			if (!task || task.ownerId !== getOwnerId(ctx.identity)) continue;

			await deleteStoredFiles(ctx, task.imageKeys ?? task.images);
			await ctx.db.delete(task._id);
			auditEvents.push({
				action: AuditActions.RECORD_DELETED,
				resourceType: 'tasks',
				resourceId: task._id,
				severity: 'warning'
			});
			deleted += 1;
		}
		await logAuditBulk(ctx, ctx.identity, auditEvents);
		return deleted;
	}
});
