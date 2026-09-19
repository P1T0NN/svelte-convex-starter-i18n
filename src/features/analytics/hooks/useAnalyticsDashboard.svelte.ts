// SVELTEKIT IMPORTS
import { untrack } from 'svelte';

// LIBRARIES
import { getLocalTimeZone, type DateValue } from '@internationalized/date';

// HOOKS
import { useSearchParams } from '@/hooks/useSearchParams.svelte.js';

// CONFIG
import { DEFAULT_TIME_RANGE, MAX_RANGE_DAYS } from '@/shared/features/analytics/config.js';
import {
	createAnalyticsDashboardContext,
	useAnalyticsDashboardContext
} from '@/shared/features/analytics/contexts/useAnalyticsDashboardContext.js';

// UTILS
import { getPreviousRangeBounds } from '@/shared/features/analytics/utils/getPreviousRangeBounds.js';
import { daysInRange, endOfDay, parseIsoDate, startOfDay, toIsoDate } from '@/shared/utils/date.js';

// TYPES
import type {
	PresetTimeRange,
	RangeBounds,
	TimeRange
} from '@/shared/features/analytics/types/analyticsTypes.js';
import type { DateRange } from 'bits-ui';

export const PRESET_TIME_RANGES: PresetTimeRange[] = ['today', '7d', '30d', '90d'];

function isPreset(value: string | null): value is PresetTimeRange {
	return PRESET_TIME_RANGES.some((preset) => preset === value);
}

function readCustomRange(get: (key: string) => string | null): DateRange | undefined {
	const start = parseIsoDate(get('from'));
	const end = parseIsoDate(get('to'));
	if (!start || !end || start.compare(end) > 0) return undefined;
	return daysInRange(start, end) <= MAX_RANGE_DAYS ? { start, end } : undefined;
}

function readActiveRange(
	get: (key: string) => string | null,
	customRange: DateRange | undefined
): TimeRange {
	const raw = get('timerange');
	if (raw === 'custom') return customRange ? 'custom' : DEFAULT_TIME_RANGE;
	return isPreset(raw) ? raw : DEFAULT_TIME_RANGE;
}

function customRangeBounds(range: DateRange): RangeBounds | undefined {
	if (!range.start || !range.end) return undefined;
	return {
		from: startOfDay(range.start.toDate(getLocalTimeZone())),
		to: endOfDay(range.end.toDate(getLocalTimeZone()))
	};
}

function presetRangeBounds(activeRange: PresetTimeRange): RangeBounds {
	const now = new Date();
	const offset = activeRange === 'today' ? 0 : Number.parseInt(activeRange) - 1;
	return {
		from: startOfDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() - offset)),
		to: now
	};
}

export class AnalyticsDashboardState {
	#searchParams = useSearchParams(['timerange', 'from', 'to']);

	customRange = $state<DateRange | undefined>(
		untrack(() => readCustomRange(this.#searchParams.get))
	);
	activeRange = $state<TimeRange>(
		untrack(() => readActiveRange(this.#searchParams.get, this.customRange))
	);
	selectedPreset = $state<string>(
		untrack(() => (isPreset(this.activeRange) ? this.activeRange : ''))
	);

	bounds = $derived.by<RangeBounds>(() => {
		const custom = this.activeRange === 'custom' ? this.customRange : undefined;
		if (custom) {
			const bounds = customRangeBounds(custom);
			if (bounds) return bounds;
		}

		return presetRangeBounds(isPreset(this.activeRange) ? this.activeRange : DEFAULT_TIME_RANGE);
	});

	previousBounds = $derived.by<RangeBounds>(() => getPreviousRangeBounds(this.bounds));

	selectPreset = (value: PresetTimeRange): void => {
		this.customRange = undefined;
		this.activeRange = value;
		this.selectedPreset = value;
		this.#searchParams.write({ timerange: value, from: '', to: '' });
	};

	handlePresetChange = (next: string): void => {
		if (isPreset(next)) {
			this.selectPreset(next);
			return;
		}

		this.selectedPreset = isPreset(this.activeRange) ? this.activeRange : '';
	};

	applyCustomRange = (range: { start: DateValue; end: DateValue }): boolean => {
		if (daysInRange(range.start, range.end) > MAX_RANGE_DAYS) {
			this.selectPreset('today');
			return false;
		}

		this.customRange = { start: range.start, end: range.end };
		this.activeRange = 'custom';
		this.selectedPreset = '';
		this.#searchParams.write({
			timerange: 'custom',
			from: toIsoDate(range.start),
			to: toIsoDate(range.end)
		});
		return true;
	};
}

/**
 * Creates the analytics dashboard state and shares it through context. Call it
 * once in the page that owns the dashboard; descendants read it with
 * `useAnalyticsDashboard()`.
 */
export function createAnalyticsDashboard(): AnalyticsDashboardState {
	return createAnalyticsDashboardContext(new AnalyticsDashboardState());
}

/** Reads the analytics dashboard state shared by `createAnalyticsDashboard()`. */
export function useAnalyticsDashboard(): AnalyticsDashboardState {
	return useAnalyticsDashboardContext<AnalyticsDashboardState>();
}
