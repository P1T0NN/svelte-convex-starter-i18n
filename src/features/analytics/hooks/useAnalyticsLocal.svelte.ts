// SVELTEKIT IMPORTS
import { onMount } from 'svelte';

// LIBRARIES
import { z } from 'zod';

// HOOKS
import { useLocalStorage } from '@/hooks/useLocalStorage.svelte.js';

// CONFIG
import { ANALYTICS_GUEST_ID_KEY } from '@/shared/features/analytics/config.js';

const guestIdSchema = z.uuid();

function parseGuestId(raw: string | null): string | null {
	if (!raw) return null;

	try {
		const result = guestIdSchema.safeParse(JSON.parse(raw));
		return result.success ? result.data : null;
	} catch {
		return null;
	}
}

/**
 * Reads the visitor's analytics guest id and creates (or recreates) it when
 * missing or invalid. Call it once in the root layout; other components can
 * call it too — instances stay in sync through `useLocalStorage`'s events.
 */
export function useAnalyticsLocal() {
	const guestId = useLocalStorage<string | null>(ANALYTICS_GUEST_ID_KEY, null, parseGuestId);

	onMount(() => {
		function ensureGuestId(): void {
			guestId.read();
			if (!guestId.value) guestId.set(crypto.randomUUID());
		}

		function handleStorageEvent(event: StorageEvent): void {
			const isGuestIdChange =
				event.storageArea === localStorage &&
				(event.key === ANALYTICS_GUEST_ID_KEY || event.key === null);

			if (isGuestIdChange) ensureGuestId();
		}

		ensureGuestId();
		
		window.addEventListener('storage', handleStorageEvent);
		return () => window.removeEventListener('storage', handleStorageEvent);
	});

	return {
		get guestId() {
			return guestId.value;
		},
		get loaded() {
			return guestId.loaded;
		}
	};
}
