// CONFIG
import { COMPANY_DATA } from '../config.js';

export function formatCurrency(
	cents: number,
	locale: string,
	currency: string = COMPANY_DATA.CURRENCY
): string {
	return new Intl.NumberFormat(locale, {
		style: 'currency',
		currency
	}).format(cents / 100);
}
