// HyperLogLog: estimates how many distinct buyers were added to a sketch
// without storing their ids. A sketch is a fixed 2048-byte array of "registers".
//
// Each buyer id is hashed into 32 random-looking bits:
//   - the low 11 bits pick one of the 2048 registers (buckets),
//   - the remaining 21 bits are scanned from the left; the position of the first
//     1 bit is the "rank" (1 = first bit is set, 22 = all 21 bits are zero).
// A register keeps the highest rank it has ever seen. Rare patterns (high ranks)
// are unlikely for any single buyer, so the more distinct buyers you hash, the
// higher the registers climb — like estimating coin flips from the longest run
// of heads seen. Merging (per-register max) is what makes this useful per day:
// a range is the union of its days, without double counting, in any order.
// Standard error is about 1.04 / sqrt(2048) ≈ 2.3%; small counts come out
// exact-ish thanks to the linear-counting correction in estimateBuyerCount.
// Sketches cannot subtract, so order deletions are only fixed by a rebuild.

// HELPERS
import { hashString } from './stableHash.js';

const SKETCH_SIZE = 2048; // registers (2^11)
const INDEX_BITS = 11; // hash bits used to pick a register
const MAX_RANK = 32 - INDEX_BITS + 1; // rank when all remaining bits are zero
const ALPHA = 0.7213 / (1 + 1.079 / SKETCH_SIZE); // bias correction from the HLL paper

/** A fresh sketch: 2048 empty registers. */
export function createBuyerSketch(): Uint8Array {
	return new Uint8Array(SKETCH_SIZE);
}

/** Adds one buyer id; adding the same id twice changes nothing. */
export function addBuyerToSketch(sketch: Uint8Array, buyerId: string): void {
	const hash = hashString(buyerId);
	const bucket = hash & (SKETCH_SIZE - 1); // low 11 bits
	const rest = hash >>> INDEX_BITS; // remaining 21 bits
	const rank = rest === 0 ? MAX_RANK : Math.clz32(rest) - INDEX_BITS + 1;

	if (rank > sketch[bucket]) sketch[bucket] = rank;
}

/** Combines sketches (e.g. days into a range) by taking each register's max. */
export function mergeBuyerSketches(sketches: Uint8Array[]): Uint8Array {
	const merged = createBuyerSketch();

	for (const sketch of sketches) {
		for (let bucket = 0; bucket < SKETCH_SIZE; bucket += 1) {
			if (sketch[bucket] > merged[bucket]) merged[bucket] = sketch[bucket];
		}
	}

	return merged;
}

/** Approximate number of distinct buyers, rounded. */
export function estimateBuyerCount(sketch: Uint8Array): number {
	let harmonicSum = 0;
	let emptyBuckets = 0;

	for (let bucket = 0; bucket < SKETCH_SIZE; bucket += 1) {
		const rank = sketch[bucket];
		harmonicSum += 1 / 2 ** rank;
		if (rank === 0) emptyBuckets += 1;
	}

	let estimate = (ALPHA * SKETCH_SIZE * SKETCH_SIZE) / harmonicSum;

	if (estimate <= 2.5 * SKETCH_SIZE && emptyBuckets > 0) {
		// Small-range correction: while registers are still empty, linear
		// counting is more accurate than the harmonic-mean formula.
		estimate = SKETCH_SIZE * Math.log(SKETCH_SIZE / emptyBuckets);
	}

	return Math.round(estimate);
}

/** Converts a sketch into the bytes format Convex stores. */
export function toStoredBuyerSketch(sketch: Uint8Array): ArrayBuffer {
	// SAFETY: copying into a fresh Uint8Array always yields a plain ArrayBuffer.
	return new Uint8Array(sketch).buffer as ArrayBuffer;
}

/** Reads a sketch back out of the bytes format Convex stores. */
export function fromStoredBuyerSketch(bytes: ArrayBuffer): Uint8Array {
	return new Uint8Array(bytes);
}
