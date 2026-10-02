// STORAGE
import { resolveStoredFileUrls } from '../../../storage/r2.js';

// TYPES
import type { TodoRecord, TodoResult } from '../../../../shared/features/todo/types/todoTypes.js';

const toTodoListItem = async (task: TodoRecord): Promise<TodoResult> => ({
	_id: task._id,
	title: task.title,
	done: task.done ? 1 : 0,
	images: await resolveStoredFileUrls(task.imageKeys ?? task.images),
	imageKeys: task.imageKeys ?? task.images,
	createdAt: task.createdAt,
	price: task.price
});

/** Append resolved image URLs and the list `done` flag to each task row. */
export function withTodoListItems({ items }: { items: TodoRecord[] }): Promise<TodoResult[]> {
	return Promise.all(items.map(toTodoListItem));
}
