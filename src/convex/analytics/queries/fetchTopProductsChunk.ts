// LIBRARIES
import { v } from 'convex/values';

// SERVER
import { internalQuery } from '../../_generated/server.js';

// HELPERS
import {
	collectProductSalesTotals,
	MAX_PRODUCT_SALES_ROWS,
	productSalesTotalsToEntries
} from '../helpers/productSalesRanking.js';

export const fetchTopProductsChunk = internalQuery({
	args: {
		from: v.number(),
		to: v.number(),
		productFrom: v.optional(v.id('products')),
		productBefore: v.optional(v.id('products'))
	},
	returns: v.object({
		exact: v.boolean(),
		products: v.array(
			v.object({
				productId: v.id('products'),
				revenue: v.number(),
				quantity: v.number()
			})
		),
		pivotProductId: v.optional(v.id('products'))
	}),
	handler: async (ctx, args) => {
		const rows = await ctx.db
			.query('dailyProductSales')
			.withIndex('by_day_product_shard', (q) => {
				if (args.from === args.to) {
					const byDay = q.eq('day', args.from);

					if (args.productFrom !== undefined && args.productBefore !== undefined) {
						return byDay.gte('productId', args.productFrom).lt('productId', args.productBefore);
					}
					if (args.productFrom !== undefined) return byDay.gte('productId', args.productFrom);
					if (args.productBefore !== undefined) return byDay.lt('productId', args.productBefore);
					return byDay;
				}

				return q.gte('day', args.from).lte('day', args.to);
			})
			.take(MAX_PRODUCT_SALES_ROWS + 1);

		if (rows.length > MAX_PRODUCT_SALES_ROWS) {
			const pivotProductId = rows[Math.floor(rows.length / 2)].productId;
			return { exact: false, products: [], pivotProductId };
		}

		return {
			exact: true,
			products: productSalesTotalsToEntries(collectProductSalesTotals(rows))
		};
	}
});

export const fetchProductNames = internalQuery({
	args: {
		productIds: v.array(v.id('products'))
	},
	returns: v.array(
		v.object({
			productId: v.id('products'),
			name: v.string()
		})
	),
	handler: async (ctx, args) => {
		return Promise.all(
			args.productIds.map(async (productId) => {
				const product = await ctx.db.get(productId);
				return { productId, name: product?.name ?? '' };
			})
		);
	}
});
