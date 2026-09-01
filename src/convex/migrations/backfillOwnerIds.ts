import { migrations } from './migrations.js';

import { normalizeOwnerId } from '../betterAuth/helpers/requireIdentity.js';

export const backfillTaskOwnerIds = migrations.define({
	table: 'tasks',
	migrateOne: async (_ctx, task) => {
		if (task.ownerId === undefined) return;
		const ownerId = normalizeOwnerId(task.ownerId);
		return ownerId === task.ownerId ? undefined : { ownerId };
	}
});

export const backfillStorageUploadOwnerIds = migrations.define({
	table: 'storageUploads',
	migrateOne: async (_ctx, upload) => {
		const ownerId = normalizeOwnerId(upload.ownerId);
		return ownerId === upload.ownerId ? undefined : { ownerId };
	}
});
