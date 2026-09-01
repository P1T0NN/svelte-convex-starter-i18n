// TYPES
import type { Doc } from '@convex/_generated/dataModel';
import type { TodoPriceBand } from '../config';

export type TodoRecord = Doc<'tasks'>;
export type TodoFields = Pick<
	TodoRecord,
	'_id' | 'title' | 'done' | 'images' | 'createdAt' | 'price'
> & { imageKeys: string[] };

export type Todo = TodoFields;
export type TodoResult = Omit<Todo, 'done'> & { done: 0 | 1 };
export type TodoListItem = TodoResult;

export type TodoPage = {
	items: TodoListItem[];
	nextCursor: string | null;
	hasNextPage: boolean;
	pageSize: number;
	total?: number;
};

export type TodoPageResult = TodoPage;

export type TodoFilterValues = {
	done?: boolean;
	priceBand?: TodoPriceBand;
	createdAtFrom?: number;
};
