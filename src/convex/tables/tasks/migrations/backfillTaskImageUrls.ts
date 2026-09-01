// MIGRATIONS
import { migrations } from '../../../migrations/migrations.js';

// STORAGE
import { resolveStoredFileUrls } from '../../../storage/r2.js';

/** Persist full image URLs while retaining stable R2 keys for future refresh and deletion. */
export const backfillTaskImageUrls = migrations.define({
	table: 'tasks',
	migrateOne: async (_ctx, task) => {
		const imageKeys = task.imageKeys ?? task.images;
		return {
			imageKeys,
			images: await resolveStoredFileUrls(imageKeys)
		};
	}
});
