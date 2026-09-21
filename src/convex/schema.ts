import { literals } from 'convex-helpers/validators';
import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

// VALIDATORS
import { orderStatus } from './tables/orders/validators/orderValidators.js';

export const tables = {
	tasks: defineTable({
		ownerId: v.optional(v.string()),
		title: v.string(),
		done: v.boolean(),
		images: v.array(v.string()),
		imageKeys: v.optional(v.array(v.string())),
		storagePrefix: v.optional(v.string()),
		createdAt: v.number(),
		price: v.number(),
		priceBand: literals('lt50', '50to100', 'gt100')
	})
		.index('by_owner_id_created_at', ['ownerId', 'createdAt'])
		.index('by_owner_id_done_created_at', ['ownerId', 'done', 'createdAt'])
		.index('by_owner_id_price_band_created_at', ['ownerId', 'priceBand', 'createdAt'])
		.index('by_owner_id_done_price_band_created_at', ['ownerId', 'done', 'priceBand', 'createdAt'])
		.index('by_created_at', ['createdAt'])
		.index('by_done_created_at', ['done', 'createdAt'])
		.index('by_price_band_created_at', ['priceBand', 'createdAt'])
		.index('by_done_price_band_created_at', ['done', 'priceBand', 'createdAt'])
		.searchIndex('search_title', {
			searchField: 'title',
			filterFields: ['ownerId', 'done', 'priceBand']
		}),
	storageUploads: defineTable({
		ownerId: v.string(),
		key: v.string(),
		expectedSize: v.optional(v.number()),
		expectedContentType: v.optional(v.string()),
		status: literals('pending', 'uploaded'),
		createdAt: v.number()
	})
		.index('by_key', ['key'])
		.index('by_owner_id_created_at', ['ownerId', 'createdAt'])
		.index('by_created_at', ['createdAt']),
	orders: defineTable({
		orderNumber: v.string(),
		customerId: v.string(),
		status: orderStatus,
		total: v.number(),
		currency: v.string(),
		placedAt: v.number()
	})
		.index('by_placed_at', ['placedAt'])
		.index('by_status_placed_at', ['status', 'placedAt']),
	dailySales: defineTable({
		day: v.number(),
		shard: v.number(),
		orders: v.number(),
		paidOrders: v.number(),
		pendingOrders: v.number(),
		refundedOrders: v.number(),
		cancelledOrders: v.number(),
		revenue: v.number()
	}).index('by_day_shard', ['day', 'shard']),
	products: defineTable({
		name: v.string(),
		sku: v.string(),
		priceCents: v.number()
	}).index('by_sku', ['sku']),
	orderItems: defineTable({
		orderId: v.id('orders'),
		productId: v.id('products'),
		quantity: v.number(),
		lineTotalCents: v.number()
	})
		.index('by_order_id', ['orderId'])
		.index('by_product_id', ['productId'])
};

export default defineSchema(tables);
