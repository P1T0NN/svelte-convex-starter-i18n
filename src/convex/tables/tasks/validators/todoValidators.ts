import { literals } from 'convex-helpers/validators';
import { v } from 'convex/values';

export const todoMutationResult = v.object({
	_id: v.id('tasks'),
	title: v.string(),
	done: v.boolean(),
	images: v.array(v.string()),
	imageKeys: v.array(v.string()),
	createdAt: v.number(),
	price: v.number()
});

const todoListItem = v.object({
	_id: v.id('tasks'),
	title: v.string(),
	done: literals(0, 1),
	images: v.array(v.string()),
	imageKeys: v.array(v.string()),
	createdAt: v.number(),
	price: v.number()
});

export const todoPage = v.object({
	items: v.array(todoListItem),
	nextCursor: v.union(v.string(), v.null()),
	hasNextPage: v.boolean(),
	pageSize: v.number(),
	total: v.optional(v.number())
});
