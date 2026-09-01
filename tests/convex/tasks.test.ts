/// <reference types="vite/client" />

import aggregateTest from '@convex-dev/aggregate/test';
import actionRetrierTest from '@convex-dev/action-retrier/test';
import r2Test from '@convex-dev/r2/test';
import rateLimiterTest from '@convex-dev/rate-limiter/test';
import shardedCounterTest from '@convex-dev/sharded-counter/test';
import auditLogTest from 'convex-audit-log/test';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { convexTest } from 'convex-test';

import { api, internal } from '../../src/convex/_generated/api';
import schema from '../../src/convex/schema';
import { detectImageContentType } from '../../src/convex/storage/r2';
import { STORAGE_CONFIG } from '../../src/shared/features/storage/config';

const modules = import.meta.glob('../../src/convex/**/*.ts');
const turnstileToken = 'test-turnstile-token';

beforeEach(() => {
	vi.stubEnv('TURNSTILE_SECRET_KEY', 'test-turnstile-secret');
	vi.stubGlobal(
		'fetch',
		vi.fn(async () => Response.json({ success: true, action: 'create_todo' }))
	);
});

afterEach(() => {
	vi.unstubAllEnvs();
	vi.unstubAllGlobals();
});

function createTestContext() {
	const t = convexTest(schema, modules);
	aggregateTest.register(t, 'tasksFilterAggregate');
	r2Test.register(t);
	actionRetrierTest.register(t, 'r2/actionRetrier');
	rateLimiterTest.register(t);
	shardedCounterTest.register(t, 'tasksTotalCounter');
	auditLogTest.register(t);
	return t;
}

const firstPage = (numItems = 10) => ({
	paginationOpts: { numItems, cursor: null },
	now: Date.now()
});

test('rejects unauthenticated task reads and writes', async () => {
	const t = createTestContext();

	await expect(
		t.query(api.tables.tasks.queries.fetchTodos.fetchTodos, firstPage())
	).rejects.toMatchObject({ data: { code: 'UNAUTHENTICATED' } });

	await expect(
		t.action(api.tables.tasks.mutations.createTodo.createTodo, {
			title: 'Unauthenticated task',
			done: false,
			turnstileToken
		})
	).rejects.toMatchObject({ data: { code: 'UNAUTHENTICATED' } });
});

test('returns stable codes for expected task mutation failures', async () => {
	const t = createTestContext();
	const owner = t.withIdentity({ tokenIdentifier: 'task-errors', subject: 'task-errors' });

	await expect(
		owner.action(api.tables.tasks.mutations.createTodo.createTodo, {
			title: 'Invalid price',
			done: false,
			price: 1.5,
			turnstileToken
		})
	).rejects.toMatchObject({ data: { code: 'INVALID_TODO_DATA' } });

	const task = await owner.action(api.tables.tasks.mutations.createTodo.createTodo, {
		title: 'Bulk delete limit',
		done: false,
		turnstileToken
	});
	await expect(
		owner.mutation(api.tables.tasks.mutations.deleteTodo.deleteTodo, {
			ids: Array.from({ length: 101 }, () => task._id)
		})
	).rejects.toMatchObject({ data: { code: 'TOO_MANY_TODOS', maxTodos: 100 } });
});

test('keeps task reads and writes scoped to the authenticated owner', async () => {
	const t = createTestContext();
	const ownerA = t.withIdentity({
		tokenIdentifier: 'https://insightful-mouse-270.eu-west-1.convex.site|user-a',
		subject: 'user-a'
	});
	const ownerB = t.withIdentity({
		tokenIdentifier: 'https://insightful-mouse-270.eu-west-1.convex.site|user-b',
		subject: 'user-b'
	});

	const taskA = await ownerA.action(api.tables.tasks.mutations.createTodo.createTodo, {
		title: 'Owner A task',
		done: false,
		turnstileToken
	});
	await ownerB.action(api.tables.tasks.mutations.createTodo.createTodo, {
		title: 'Owner B task',
		done: false,
		turnstileToken
	});

	const pageA = await ownerA.query(api.tables.tasks.queries.fetchTodos.fetchTodos, firstPage());
	const pageB = await ownerB.query(api.tables.tasks.queries.fetchTodos.fetchTodos, firstPage());

	expect(pageA.total).toBe(1);
	expect(pageA.items).toHaveLength(1);
	expect(pageA.items[0]?._id).toBe(taskA._id);
	expect(pageB.total).toBe(1);

	await expect(
		ownerB.query(api.tables.tasks.queries.fetchTodo.fetchTodo, { id: taskA._id })
	).rejects.toMatchObject({ data: { code: 'TODO_NOT_FOUND' } });

	await expect(
		ownerB.mutation(api.tables.tasks.mutations.updateTodo.updateTodo, {
			id: taskA._id,
			title: 'Impersonated update',
			done: true
		})
	).rejects.toMatchObject({ data: { code: 'TODO_NOT_FOUND' } });

	expect(
		await ownerB.mutation(api.tables.tasks.mutations.deleteTodo.deleteTodo, { ids: [taskA._id] })
	).toBe(0);

	const unchanged = await t.run((ctx) => ctx.db.get(taskA._id));
	expect(unchanged).toMatchObject({ ownerId: 'user-a', title: 'Owner A task', done: false });
});

test('claims only uploaded R2 keys owned by the mutation caller', async () => {
	const t = createTestContext();
	const owner = t.withIdentity({
		tokenIdentifier: 'https://insightful-mouse-270.eu-west-1.convex.site|upload-owner',
		subject: 'upload-owner'
	});
	const otherOwner = t.withIdentity({
		tokenIdentifier: 'https://insightful-mouse-270.eu-west-1.convex.site|other-upload-owner',
		subject: 'other-upload-owner'
	});
	const generated = await owner.mutation(api.storage.r2.generateUploadUrl, {
		size: 12,
		contentType: 'image/webp'
	});
	expect(generated.key).toMatch(/^[0-9a-f-]{36}$/);
	const trackedUpload = await t.run((ctx) =>
		ctx.db
			.query('storageUploads')
			.withIndex('by_key', (query) => query.eq('key', generated.key))
			.unique()
	);
	expect(generated.url).toContain('test-account.r2.cloudflarestorage.com');
	expect(trackedUpload).toMatchObject({ ownerId: 'upload-owner', status: 'pending' });

	await expect(
		otherOwner.action(api.storage.r2.syncMetadata, { key: generated.key })
	).resolves.toBe(false);
	await t.run((ctx) => ctx.db.patch(trackedUpload!._id, { status: 'uploaded' }));
	await expect(
		owner.action(api.tables.tasks.mutations.createTodo.createTodo, {
			title: 'Duplicate upload',
			done: false,
			uploadedFiles: [generated.key, generated.key],
			turnstileToken
		})
	).rejects.toMatchObject({ data: { code: 'DUPLICATE_UPLOAD_KEY' } });

	await expect(
		otherOwner.action(api.tables.tasks.mutations.createTodo.createTodo, {
			title: 'Wrong owner',
			done: false,
			uploadedFiles: [generated.key],
			turnstileToken
		})
	).rejects.toMatchObject({ data: { code: 'UPLOAD_NOT_FOUND' } });
	expect(await t.run((ctx) => ctx.db.get(trackedUpload!._id))).not.toBeNull();

	const task = await owner.action(api.tables.tasks.mutations.createTodo.createTodo, {
		title: 'Todo with upload',
		done: false,
		uploadedFiles: [generated.key],
		turnstileToken
	});
	const stored = await t.run((ctx) => ctx.db.get('tasks', task._id));
	const fetched = await owner.query(api.tables.tasks.queries.fetchTodo.fetchTodo, { id: task._id });

	expect(task.images).toEqual([`https://cdn.example.com/${generated.key}`]);
	expect(task.imageKeys).toEqual([generated.key]);
	expect(fetched.images).toEqual(task.images);
	expect(fetched.imageKeys).toEqual([generated.key]);
	expect(stored?.images).toEqual(task.images);
	expect(stored?.imageKeys).toEqual([generated.key]);
	expect(await t.run((ctx) => ctx.db.get(trackedUpload!._id))).toBeNull();

	const updated = await owner.mutation(api.tables.tasks.mutations.updateTodo.updateTodo, {
		id: task._id,
		title: task.title,
		done: task.done,
		retainedFiles: []
	});
	expect(updated.images).toEqual([]);
	expect(updated.imageKeys).toEqual([]);
	expect(await t.run((ctx) => ctx.db.get(task._id))).toMatchObject({ images: [], imageKeys: [] });
});

test('generates namespaced R2 keys and deletes them by their full key', async () => {
	const t = createTestContext();
	const owner = t.withIdentity({
		tokenIdentifier: 'namespaced-upload-owner',
		subject: 'namespaced-upload-owner'
	});
	const generated = await owner.mutation(api.storage.r2.generateUploadUrl, {
		namespace: 'products/images',
		size: 12,
		contentType: 'image/webp'
	});

	expect(generated.key).toMatch(/^products\/images\/[0-9a-f-]{36}$/);
	await owner.mutation(api.storage.r2.deleteObject, { key: generated.key });
	expect(
		await t.run((ctx) =>
			ctx.db
				.query('storageUploads')
				.withIndex('by_key', (query) => query.eq('key', generated.key))
				.unique()
		)
	).toBeNull();

	await expect(
		owner.mutation(api.storage.r2.generateUploadUrl, {
			namespace: '../products',
			size: 12,
			contentType: 'image/webp'
		})
	).rejects.toMatchObject({ data: { code: 'INVALID_UPLOAD_NAMESPACE' } });
});

test('rejects oversized or disguised uploads', async () => {
	const t = createTestContext();
	const owner = t.withIdentity({
		tokenIdentifier: 'upload-validator',
		subject: 'upload-validator'
	});

	await expect(
		owner.mutation(api.storage.r2.generateUploadUrl, {
			size: STORAGE_CONFIG.maxFileSizeBytes + 1,
			contentType: 'image/png'
		})
	).rejects.toMatchObject({ data: { code: 'INVALID_UPLOAD' } });
	expect(detectImageContentType(new Uint8Array([0xff, 0xd8, 0xff]))).toBe('image/jpeg');
	expect(detectImageContentType(new TextEncoder().encode('<svg onload=alert(1)>'))).toBeUndefined();
});

test('returns owner-scoped totals while loading paginated task pages', async () => {
	const t = createTestContext();
	const ownerA = t.withIdentity({
		tokenIdentifier: 'pagination-owner',
		subject: 'pagination-owner'
	});
	const ownerB = t.withIdentity({ tokenIdentifier: 'other-owner', subject: 'other-owner' });

	for (let index = 0; index < 12; index += 1) {
		await ownerA.action(api.tables.tasks.mutations.createTodo.createTodo, {
			title: `Owner A task ${index}`,
			done: index % 2 === 0,
			price: index % 3 === 0 ? 11000 : 0,
			turnstileToken
		});
	}
	await ownerB.action(api.tables.tasks.mutations.createTodo.createTodo, {
		title: 'Owner B task',
		done: true,
		turnstileToken
	});

	const pages: string[] = [];
	let cursor: string | null = null;
	let lastPage;

	do {
		lastPage = await ownerA.query(api.tables.tasks.queries.fetchTodos.fetchTodos, {
			paginationOpts: { numItems: 5, cursor },
			now: Date.now()
		});
		pages.push(...lastPage.items.map((item) => item._id));
		cursor = lastPage.nextCursor;
	} while (cursor !== null);

	expect(pages).toHaveLength(12);
	expect(new Set(pages).size).toBe(12);
	expect(lastPage.total).toBe(12);
	expect(lastPage.hasNextPage).toBe(false);

	const first = await ownerA.query(api.tables.tasks.queries.fetchTodos.fetchTodos, {
		paginationOpts: { numItems: 5, cursor: null },
		now: Date.now()
	});
	expect(first.items).toHaveLength(5);
	expect(first.total).toBe(12);
	expect(first.hasNextPage).toBe(true);

	const donePage = await ownerA.query(api.tables.tasks.queries.fetchTodos.fetchTodos, {
		...firstPage(),
		filters: { status: 'done' }
	});
	expect(donePage.total).toBe(6);
	expect(donePage.items.every((item) => item.done === 1)).toBe(true);

	const pageB = await ownerB.query(api.tables.tasks.queries.fetchTodos.fetchTodos, firstPage());
	expect(pageB.total).toBe(1);
	expect(pageB.items).toHaveLength(1);
});

test('removes tasks and pending uploads after their owner is deleted', async () => {
	const t = createTestContext();
	const ownerId = 'deleted-owner';
	const taskId = await t.run((ctx) =>
		ctx.db.insert('tasks', {
			ownerId,
			title: 'Ghost task',
			done: false,
			images: [],
			createdAt: Date.now(),
			price: 0,
			priceBand: 'lt50'
		})
	);
	const uploadId = await t.run((ctx) =>
		ctx.db.insert('storageUploads', {
			ownerId,
			key: 'deleted-owner-upload',
			status: 'pending',
			createdAt: Date.now()
		})
	);

	await t.mutation(internal.betterAuth.cleanupDeletedUserData.cleanupDeletedUserData, {
		ownerId,
		phase: 'tasks'
	});
	await t.mutation(internal.betterAuth.cleanupDeletedUserData.cleanupDeletedUserData, {
		ownerId,
		phase: 'uploads'
	});

	expect(await t.run((ctx) => ctx.db.get(taskId))).toBeNull();
	expect(await t.run((ctx) => ctx.db.get(uploadId))).toBeNull();
});

test('returns a retry delay when an actor exceeds the mutation rate limit', async () => {
	const t = createTestContext();
	const owner = t.withIdentity({
		tokenIdentifier: 'rate-limited-owner',
		subject: 'rate-limited-owner'
	});
	let succeeded = 0;
	let rateLimitError: unknown;

	for (let index = 0; index < 21; index += 1) {
		try {
			await owner.action(api.tables.tasks.mutations.createTodo.createTodo, {
				title: `Rate limit task ${index}`,
				done: false,
				turnstileToken
			});
			succeeded += 1;
		} catch (error) {
			rateLimitError = error;
			break;
		}
	}

	expect(succeeded).toBe(20);
	expect(rateLimitError).toMatchObject({
		data: {
			kind: 'RateLimited',
			name: 'tasks:create:minute',
			retryAfter: expect.any(Number)
		}
	});

	// SAFETY: The matcher above verifies the Convex rate-limit error shape.
	const retryAfter = (rateLimitError as { data: { retryAfter: number } }).data.retryAfter;
	expect(retryAfter).toBeGreaterThan(0);
});
