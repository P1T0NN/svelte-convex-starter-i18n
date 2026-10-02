// SVELTEKIT IMPORTS
import { onMount } from 'svelte';

// LIBRARIES
import { z } from 'zod';

// HOOKS
import { useLocalStorage } from '@/hooks/useLocalStorage.svelte.js';

// CONFIG
import { ANALYTICS_GUEST_ID_KEY } from '@/shared/features/analytics/config.js';

const guestIdSchema = z.string().min(1);

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
 * Reads the visitor's analytics guest id and creates it on first visit.
 * Call it once in the root layout; other components can call it too — every
 * instance stays in sync through `useLocalStorage`'s storage/change events.
 */
export function useAnalyticsLocal() {
	const guestId = useLocalStorage<string | null>(ANALYTICS_GUEST_ID_KEY, null, parseGuestId);

	onMount(() => {
		if (!guestId.value) guestId.set(crypto.randomUUID());
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
