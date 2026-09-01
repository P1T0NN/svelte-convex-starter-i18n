// LIBRARIES
import { ConvexError } from 'convex/values';

// COMPONENTS
import { m } from '../lib/paraglide/messages.js';

// TYPES
import { backendErrorDataSchema } from '../shared/types/types.js';

export function getBackendErrorMessage(error: Error): string | undefined {
	if (!(error instanceof ConvexError)) return;
	const parsed = backendErrorDataSchema.safeParse(error.data);
	if (!parsed.success) return;

	switch (parsed.data.code) {
		case 'UNAUTHENTICATED':
			return m['BackendMessages.unauthenticated']();
		case 'FORBIDDEN':
			return m['BackendMessages.forbidden']();
		case 'CAPTCHA_FAILED':
			return m['BackendMessages.captchaFailed']();
		case 'INVALID_TODO_DATA':
			return m['BackendMessages.invalidTodoData']();
		case 'TODO_NOT_FOUND':
			return m['BackendMessages.todoNotFound']();
		case 'INVALID_RETAINED_IMAGE':
			return m['BackendMessages.invalidRetainedImage']();
		case 'DUPLICATE_RETAINED_IMAGE':
			return m['BackendMessages.duplicateRetainedImage']();
		case 'DUPLICATE_UPLOAD_KEY':
			return m['BackendMessages.duplicateUploadKey']();
		case 'UPLOAD_NOT_FOUND':
			return m['BackendMessages.uploadNotFound']();
		case 'INVALID_UPLOAD_NAMESPACE':
			return m['BackendMessages.invalidUploadNamespace']();
		case 'INVALID_UPLOAD':
			return m['BackendMessages.invalidUpload']();
		case 'TOO_MANY_FILES':
			return m['BackendMessages.tooManyFiles']({ maxFiles: parsed.data.maxFiles });
		case 'TOO_MANY_TODOS':
			return m['BackendMessages.tooManyTodos']({ maxTodos: parsed.data.maxTodos });
	}
}
