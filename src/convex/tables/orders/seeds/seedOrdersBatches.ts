// LIBRARIES
import { v } from 'convex/values';

// BUILDERS
import { internalMutation } from '../../../builders/convexFunctionBuilders.js';

// TYPES
import type { Id } from '../../../_generated/dataModel.js';
import type { OrderStatus } from '../validators/orderValidators.js';

export const DAY_IN_MS = 86_400_000;
export const SPREAD_DAYS = 400;
export const ORDER_SEED = 20260919;

const CUSTOMER_COUNT = 180;
const ITEM_DELETE_BATCH = 100;
const ORDER_DELETE_BATCH = 150;
const PRODUCT_DELETE_BATCH = 200;
const STATUS_WEIGHTS: { status: OrderStatus; weight: number }[] = [
	{ status: 'paid', weight: 86 },
	{ status: 'pending', weight: 5 },
	{ status: 'refunded', weight: 5 },
	{ status: 'cancelled', weight: 4 }
];
const PRODUCTS = [
	{ name: 'Aurora Desk Lamp', sku: 'LMP-001', priceCents: 4900 },
	{ name: 'Nimbus Wireless Charger', sku: 'CHG-002', priceCents: 2900 },
	{ name: 'Halo Monitor Stand', sku: 'STD-003', priceCents: 7900 },
	{ name: 'Drift Mechanical Keyboard', sku: 'KBD-004', priceCents: 12900 },
	{ name: 'Pulse Ergonomic Mouse', sku: 'MSE-005', priceCents: 5900 },
	{ name: 'Vertex Laptop Sleeve', sku: 'SLV-006', priceCents: 3900 },
	{ name: 'Ember Insulated Mug', sku: 'MUG-007', priceCents: 2400 },
	{ name: 'Cascade Water Bottle', sku: 'BTL-008', priceCents: 1900 },
	{ name: 'Lumen Ring Light', sku: 'LGT-009', priceCents: 6900 },
	{ name: 'Atlas Notebook Set', sku: 'NTB-010', priceCents: 1600 },
	{ name: 'Zephyr USB-C Hub', sku: 'HUB-011', priceCents: 8900 },
	{ name: 'Onyx Noise-Cancelling Headphones', sku: 'AUD-012', priceCents: 24900 },
	{ name: 'Fjord Wool Blanket', sku: 'BLK-013', priceCents: 5900 },
	{ name: 'Solstice Desk Organizer', sku: 'ORG-014', priceCents: 3400 },
	{ name: 'Quartz Travel Adapter', sku: 'ADP-015', priceCents: 2200 },
	{ name: 'Beacon Bluetooth Speaker', sku: 'SPK-016', priceCents: 9900 },
	{ name: 'Meadow Ceramic Planter', sku: 'PLT-017', priceCents: 2700 },
	{ name: 'Cobalt Webcam Cover', sku: 'CAM-018', priceCents: 900 },
	{ name: 'Harbor Cable Kit', sku: 'CBL-019', priceCents: 3100 },
	{ name: 'Summit Laptop Riser', sku: 'RSR-020', priceCents: 4400 }
];

export type RandomStep = {
	state: number;
	value: number;
};

export function nextRandom(state: number): RandomStep {
	const nextState = (state + 0x6d2b79f5) | 0;
	let value = Math.imul(nextState ^ (nextState >>> 15), 1 | nextState);
	value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;

	return { state: nextState, value: ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296 };
}

function pickStatus(roll: number): OrderStatus {
	let threshold = 0;

	for (const { status, weight } of STATUS_WEIGHTS) {
		threshold += weight;
		if (roll < threshold) return status;
	}

	return 'paid';
}

export const deleteOrderItemsBatch = internalMutation({
	args: {},
	returns: v.object({ deleted: v.number(), isDone: v.boolean() }),
	handler: async (ctx) => {
		const items = await ctx.db.query('orderItems').take(ITEM_DELETE_BATCH);
		for (const item of items) await ctx.db.delete(item._id);

		return { deleted: items.length, isDone: items.length < ITEM_DELETE_BATCH };
	}
});

export const deleteOrdersBatch = internalMutation({
	args: {},
	returns: v.object({ deleted: v.number(), isDone: v.boolean() }),
	handler: async (ctx) => {
		const orders = await ctx.db.query('orders').take(ORDER_DELETE_BATCH);
		for (const order of orders) await ctx.db.delete(order._id);

		return { deleted: orders.length, isDone: orders.length < ORDER_DELETE_BATCH };
	}
});

export const deleteProductsBatch = internalMutation({
	args: {},
	returns: v.object({ deleted: v.number(), isDone: v.boolean() }),
	handler: async (ctx) => {
		const products = await ctx.db.query('products').take(PRODUCT_DELETE_BATCH);
		for (const product of products) await ctx.db.delete(product._id);

		return { deleted: products.length, isDone: products.length < PRODUCT_DELETE_BATCH };
	}
});

export const insertProductsBatch = internalMutation({
	args: {},
	returns: v.array(v.id('products')),
	handler: async (ctx) => {
		const productIds: Id<'products'>[] = [];
		for (const product of PRODUCTS) {
			productIds.push(await ctx.db.insert('products', product));
		}

		return productIds;
	}
});

export const insertOrderDaysBatch = internalMutation({
	args: {
		fromDay: v.number(),
		dayCount: v.number(),
		randomState: v.number(),
		inserted: v.number(),
		items: v.number(),
		productIds: v.array(v.id('products'))
	},
	returns: v.object({
		randomState: v.number(),
		inserted: v.number(),
		items: v.number()
	}),
	handler: async (ctx, args) => {
		let state = args.randomState;
		let inserted = args.inserted;
		let items = args.items;
		const now = Date.now();

		for (let offset = 0; offset < args.dayCount; offset += 1) {
			const dayStart = args.fromDay + offset * DAY_IN_MS;
			if (dayStart > now) break;

			const weekday = new Date(dayStart).getDay();
			const isWeekend = weekday === 0 || weekday === 6;

			const ordersRoll = nextRandom(state);
			state = ordersRoll.state;
			const dailyOrders = 1 + Math.floor(ordersRoll.value * (isWeekend ? 4 : 7));

			for (let index = 0; index < dailyOrders; index += 1) {
				const placedRoll = nextRandom(state);
				state = placedRoll.state;
				const placedAt = dayStart + Math.floor(placedRoll.value * DAY_IN_MS);
				if (placedAt > now) continue;

				const itemCountRoll = nextRandom(state);
				state = itemCountRoll.state;
				const itemCount = 1 + Math.floor(itemCountRoll.value * 3);

				const lines: Array<{
					productId: Id<'products'>;
					quantity: number;
					lineTotalCents: number;
				}> = [];
				let total = 0;

				for (let itemIndex = 0; itemIndex < itemCount; itemIndex += 1) {
					const productRoll = nextRandom(state);
					state = productRoll.state;
					const quantityRoll = nextRandom(state);
					state = quantityRoll.state;

					const productIndex = Math.floor(productRoll.value * PRODUCTS.length);
					const quantity = 1 + Math.floor(quantityRoll.value * 3);
					const lineTotalCents = PRODUCTS[productIndex].priceCents * quantity;

					lines.push({ productId: args.productIds[productIndex], quantity, lineTotalCents });
					total += lineTotalCents;
				}

				const statusRoll = nextRandom(state);
				state = statusRoll.state;
				const customerRoll = nextRandom(state);
				state = customerRoll.state;

				const orderId = await ctx.db.insert('orders', {
					orderNumber: `ORD-${String(inserted + 1).padStart(5, '0')}`,
					customerId: `cust_${1 + Math.floor(customerRoll.value * CUSTOMER_COUNT)}`,
					status: pickStatus(statusRoll.value * 100),
					total,
					currency: 'USD',
					placedAt
				});

				for (const line of lines) {
					await ctx.db.insert('orderItems', { orderId, ...line });
					items += 1;
				}

				inserted += 1;
			}
		}

		return { randomState: state, inserted, items };
	}
});
