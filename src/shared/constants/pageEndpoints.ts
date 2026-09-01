// SVELTEKIT IMPORTS
import { resolve } from '$app/paths';

export const UNPROTECTED_PAGE_ENDPOINTS = {
	ROOT: resolve('/'),
	SIGN_IN: resolve('/sign-in'),
	SIGN_UP: resolve('/sign-up'),
	VERIFY_EMAIL: resolve('/verify-email'),
	FORGOT_PASSWORD: resolve('/forgot-password'),
	AUTH_ERROR: resolve('/auth/error')
};

export const PROTECTED_PAGE_ENDPOINTS = {
	TODO: resolve('/todo'),
	ADD_TODO: resolve('/todo/add-todo'),
	EDIT_TODO: (id: string) => resolve('/(app)/(protected)/todo/[id]/edit', { id })
};
