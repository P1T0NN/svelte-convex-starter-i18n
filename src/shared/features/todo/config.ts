export const TODO_MAX_TITLE_LENGTH = 255;

export const TODO_PRICE_BANDS = {
	lt50: { max: 5000 },
	'50to100': { max: 10000 },
	gt100: {}
} as const;

export type TodoPriceBand = keyof typeof TODO_PRICE_BANDS;
