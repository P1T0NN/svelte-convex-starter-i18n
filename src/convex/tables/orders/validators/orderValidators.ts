import { literals } from 'convex-helpers/validators';

// TYPES
import type { Infer } from 'convex/values';

export const orderStatus = literals('pending', 'paid', 'refunded', 'cancelled');
export type OrderStatus = Infer<typeof orderStatus>;
