import { dateBuckets, eqMap } from '../../filters/utils/commonPredicatesConvex.js';

const statusPredicate = eqMap('done', { done: true, pending: false });

const pricePredicate = eqMap('priceBand', {
	lt50: 'lt50',
	'50to100': '50to100',
	gt100: 'gt100'
});

const startOfToday = (now: number) => {
	const today = new Date(now);
	today.setUTCHours(0, 0, 0, 0);
	return today.getTime();
};

/** Todo filter registry. Only these symbolic options become query predicates. */
export function todoPredicateFor(key: string, value: string, now: number) {
	switch (key) {
		case 'status':
			return statusPredicate(value);
		case 'price':
			return pricePredicate(value);
		case 'date': {
			const datePredicate = dateBuckets('createdAt', [
				{ value: 'today', from: () => startOfToday(now) },
				{ value: '7d', from: () => now - 7 * 24 * 60 * 60 * 1000 },
				{ value: '30d', from: () => now - 30 * 24 * 60 * 60 * 1000 }
			]);
			return datePredicate(value);
		}
		default:
			return undefined;
	}
}
