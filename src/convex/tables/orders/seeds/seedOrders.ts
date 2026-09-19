// LIBRARIES
import { v } from 'convex/values';

// BUILDERS
import { internalMutation } from '../../../builders/convexFunctionBuilders.js';

// TYPES
import type { OrderStatus } from '../validators/orderValidators.js';

const DAY_IN_MS = 86_400_000;
const SPREAD_DAYS = 400;
const CUSTOMER_COUNT = 180;
const ORDER_SEED = 20260919;
const STATUS_WEIGHTS: { status: OrderStatus; weight: number }[] = [
	{ status: 'paid', weight: 86 },
	{ status: 'pending', weight: 5 },
	{ status: 'refunded', weight: 5 },
	{ status: 'cancelled', weight: 4 }
];

function createRandom(seed: number): () => number {
	let state = seed;

	return () => {
		state = (state + 0x6d2b79f5) | 0;
		let value = Math.imul(state ^ (state >>> 15), 1 | state);
		value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
		return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
	};
}

function pickStatus(random: () => number): OrderStatus {
	const roll = random() * 100;
	let threshold = 0;

	for (const { status, weight } of STATUS_WEIGHTS) {
		threshold += weight;
		if (roll < threshold) return status;
	}

	return 'paid';
}

function pickTotal(random: () => number): number {
	const cents = 1_900 + Math.floor(random() ** 2 * 45_000);
	return Math.round(cents / 5) * 5;
}

export const seedOrders = internalMutation({
	args: {},
	returns: v.object({ inserted: v.number(), deleted: v.number() }),
	handler: async (ctx) => {
		const existing = await ctx.db.query('orders').collect();
		for (const order of existing) await ctx.db.delete(order._id);

		const random = createRandom(ORDER_SEED);
		const now = Date.now();
		const todayStart = new Date(now).setHours(0, 0, 0, 0);
		let inserted = 0;

		for (let dayOffset = SPREAD_DAYS - 1; dayOffset >= 0; dayOffset -= 1) {
			const dayStart = todayStart - dayOffset * DAY_IN_MS;
			const weekday = new Date(dayStart).getDay();
			const isWeekend = weekday === 0 || weekday === 6;
			const dailyOrders = 1 + Math.floor(random() * (isWeekend ? 4 : 7));

			for (let index = 0; index < dailyOrders; index += 1) {
				const placedAt = dayStart + Math.floor(random() * DAY_IN_MS);
				if (placedAt > now) continue;

				await ctx.db.insert('orders', {
					orderNumber: `ORD-${String(inserted + 1).padStart(5, '0')}`,
					customerId: `cust_${1 + Math.floor(random() * CUSTOMER_COUNT)}`,
					status: pickStatus(random),
					total: pickTotal(random),
					currency: 'USD',
					placedAt
				});
				inserted += 1;
			}
		}

		return { inserted, deleted: existing.length };
	}
});
