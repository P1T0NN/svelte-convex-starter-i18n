// HELPERS
import { hashString } from './stableHash.js';

export const DAILY_SALES_SHARD_COUNT = 8;

export function shardForOrder(orderId: string): number {
	return hashString(orderId) % DAILY_SALES_SHARD_COUNT;
}
