import { z } from 'zod';
import { TODO_MAX_TITLE_LENGTH } from '../config';

const todoId = z.string().min(1);
const todoTitle = z.string().min(1).max(TODO_MAX_TITLE_LENGTH);
const todoPrice = z.number().int().refine(Number.isSafeInteger, 'INVALID_TODO_PRICE');

export const createTodoSchema = z.object({
	title: todoTitle,
	done: z.boolean().optional().default(false),
	images: z.array(z.unknown()).optional().default([]),
	price: todoPrice.optional().default(0)
});

export type CreateTodoInputSchema = z.infer<typeof createTodoSchema>;

export const updateTodoSchema = z.object({
	id: todoId,
	title: todoTitle,
	done: z.boolean().optional().default(false),
	images: z.array(z.string()).optional()
});

export type UpdateTodoInputSchema = z.infer<typeof updateTodoSchema>;
