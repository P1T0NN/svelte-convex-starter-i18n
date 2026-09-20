// LIBRARIES
import { v } from 'convex/values';

// BUILDERS
import { authenticatedAction } from '../../builders/convexFunctionBuilders.js';

// GENERATED
import { internal } from '../../_generated/api.js';

// AUTH
import { requireAdminIdentity } from '../../betterAuth/helpers/requireIdentity.js';

// CONFIG
import { MAX_RANGE_DAYS } from '../../../shared/features/analytics/config.js';

// HELPERS
import { assertDateRange } from '../helpers/assertDateRange.js';
import { DAY_IN_MS, toUtcDay } from '../helpers/dailySalesRange.js';
import {
	mergeProductSalesTotals,
	productSalesTotalsFromEntries,
	rankProductSalesTotals,
	TOP_PRODUCTS_LIMIT,
	type ProductSalesTotals
} from '../helpers/productSalesRanking.js';

// VALIDATORS
import { topProducts } from '../validators/analyticsValidators.js';

// TYPES
import type { ActionCtx } from '../../_generated/server.js';
import type { Id } from '../../_generated/dataModel.js';

const CHUNK_DAYS = 30;

type ProductSalesChunk = {
	from: number;
	to: number;
	productFrom?: Id<'products'>;
	productBefore?: Id<'products'>;
};

function splitIntoDayChunks(firstDay: number, lastDay: number): ProductSalesChunk[] {
	const chunks: ProductSalesChunk[] = [];

	for (let day = firstDay; day <= lastDay; day += CHUNK_DAYS * DAY_IN_MS) {
		chunks.push({
			from: day,
			to: Math.min(day + (CHUNK_DAYS - 1) * DAY_IN_MS, lastDay)
		});
	}

	return chunks;
}

async function collectChunkTotals(
	ctx: ActionCtx,
	chunk: ProductSalesChunk,
	totals: ProductSalesTotals
): Promise<void> {
	const result = await ctx.runQuery(
		internal.analytics.queries.fetchTopProductsChunk.fetchTopProductsChunk,
		chunk
	);

	if (result.exact) {
		mergeProductSalesTotals(totals, productSalesTotalsFromEntries(result.products));
		return;
	}

	if (chunk.from < chunk.to) {
		const middleDay = chunk.from + Math.floor((chunk.to - chunk.from) / DAY_IN_MS / 2) * DAY_IN_MS;
		await collectChunkTotals(ctx, { ...chunk, to: middleDay }, totals);
		await collectChunkTotals(ctx, { ...chunk, from: middleDay + DAY_IN_MS }, totals);
		return;
	}

	const pivot = result.pivotProductId;
	if (pivot === undefined) {
		throw new Error('Product sales chunk exceeds the query read budget');
	}

	await collectChunkTotals(ctx, { ...chunk, productBefore: pivot }, totals);
	await collectChunkTotals(ctx, { ...chunk, productFrom: pivot }, totals);
}

export const fetchTopProductsExact = authenticatedAction({
	args: {
		from: v.number(),
		to: v.number()
	},
	returns: topProducts,
	handler: async (
		ctx,
		args
	): Promise<
		Array<{ productId: Id<'products'>; name: string; revenue: number; quantity: number }>
	> => {
		await requireAdminIdentity(ctx);
		assertDateRange(args);

		if ((args.to - args.from) / DAY_IN_MS > MAX_RANGE_DAYS) {
			throw new Error('Invalid dashboard date range');
		}

		const totals: ProductSalesTotals = new Map();

		for (const chunk of splitIntoDayChunks(toUtcDay(args.from), toUtcDay(args.to))) {
			await collectChunkTotals(ctx, chunk, totals);
		}

		const ranked = rankProductSalesTotals(totals, TOP_PRODUCTS_LIMIT);
		const names: Array<{ productId: Id<'products'>; name: string }> = await ctx.runQuery(
			internal.analytics.queries.fetchTopProductsChunk.fetchProductNames,
			{ productIds: ranked.map((entry) => entry.productId) }
		);
		const nameById = new Map<Id<'products'>, string>(
			names.map((entry) => [entry.productId, entry.name])
		);

		return ranked.map((entry) => ({
			productId: entry.productId,
			name: nameById.get(entry.productId) ?? '',
			revenue: entry.revenue,
			quantity: entry.quantity
		}));
	}
});
