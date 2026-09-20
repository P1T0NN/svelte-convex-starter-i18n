import { expect, test } from 'vitest';

import {
	addBuyerToSketch,
	createBuyerSketch,
	estimateBuyerCount,
	mergeBuyerSketches
} from '../../src/convex/analytics/helpers/buyerSketch';

test('estimates distinct buyers within a few percent', () => {
	const sketch = createBuyerSketch();
	for (let index = 0; index < 10_000; index += 1) addBuyerToSketch(sketch, `cust_${index}`);

	const estimate = estimateBuyerCount(sketch);
	expect(estimate).toBeGreaterThan(9500);
	expect(estimate).toBeLessThan(10_500);
});

test('merging daily sketches matches counting the union', () => {
	const first = createBuyerSketch();
	const second = createBuyerSketch();

	for (let index = 0; index < 500; index += 1) addBuyerToSketch(first, `first_${index}`);
	for (let index = 0; index < 700; index += 1) addBuyerToSketch(second, `second_${index}`);
	for (let index = 0; index < 100; index += 1) addBuyerToSketch(first, `second_${index}`);

	const estimate = estimateBuyerCount(mergeBuyerSketches([first, second]));
	expect(estimate).toBeGreaterThan(1150);
	expect(estimate).toBeLessThan(1250);
});

test('keeps small counts exact', () => {
	const sketch = createBuyerSketch();
	addBuyerToSketch(sketch, 'cust_1');
	addBuyerToSketch(sketch, 'cust_1');

	expect(estimateBuyerCount(sketch)).toBe(1);
});

test('stays within a few percent for low cardinalities', () => {
	for (const count of [1, 2, 5, 10, 25, 50, 100, 250]) {
		const sketch = createBuyerSketch();
		for (let index = 0; index < count; index += 1) addBuyerToSketch(sketch, `cust_${index}`);

		const estimate = estimateBuyerCount(sketch);
		expect(Math.abs(estimate - count)).toBeLessThanOrEqual(Math.max(1, count * 0.05));
	}
});
