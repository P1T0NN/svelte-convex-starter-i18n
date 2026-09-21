# Future analytics metrics

The dashboard never scans `orders`. Every dashboard number is summed from
`dailySales` (`src/convex/schema.ts`), one row per UTC day, kept current by the
`orders` trigger in `src/convex/aggregates/triggersAggregate.ts`. Adding a new
metric is additive — no table redesign, no UI rework.

## Recipe

1. **Add the column** to `dailySales` in `src/convex/schema.ts`.
2. **Fill it on writes** in `src/convex/analytics/helpers/applyOrderToDailySales.ts`
   (add on insert, subtract on delete/update) and in the repair path
   `src/convex/migrations/rebuildDailySales.ts`.
3. **Backfill history** by running the migrations (see below).
4. **Read it** in `getDashboardStats`, `fetchRevenueSeries`, or a new query —
   still at most one row per day.

## Migration commands

```bash
npx convex run migrations/migrations:run '{"fn":"migrations/rebuildDailySales:ensureDailySalesRows"}'
npx convex run migrations/migrations:run '{"fn":"migrations/rebuildDailySales:rebuildDailySales"}'
```

Both are idempotent: `ensureDailySalesRows` creates missing day/shard rows from
orders, `rebuildDailySales` recomputes each row from its orders. After changing
the shard count, run `resetDailySales` first, then the two above.

## Examples

- **Refunded revenue**: add `refundedRevenue` to `dailySales`; in the trigger,
  move the amount between `revenue` and `refundedRevenue` when status changes.
- **New buyers per day**: add a per-customer table (`buyerStats`:
  `customerId`, `firstOrderDay`, `lastOrderDay`, `orderCount`,
  `lifetimeRevenue`), fill it from the same `orders` trigger, and count rows by
  `firstOrderDay` — exact and cheap with an `@convex-dev/aggregate` namespace.
- **Average order value**: derived at read time (`revenue / paidOrders`), never
  stored.
- **Multi-currency**: either add a `revenueByCurrency` record column to
  `dailySales`, or key rows by `(day, currency)` and sum per currency.

## Rules of thumb

- Store additive facts per day; derive ratios and averages at read time.
- Exact sums/counts: plain number columns.
- Distinct/unique counts: add a per-entity table counted through an
  `@convex-dev/aggregate` (exact for one-bucket definitions like "new" or
  "returning"); arbitrary distinct-over-a-range counts otherwise need sketches
  or a raw-row scan.
- Never make dashboard queries scan `orders`; keep `orders` for paginated
  drill-down lists only.
- Prefer the tools that already exist before adding columns:
  - `@convex-dev/aggregate` — exact O(log n) counts/sums over a range when you
    don't want a rollup column.
  - `@vllnt/convex-analytics` — installed and configured but currently unused;
    event-shaped product analytics (timeseries, funnels, retention,
    DAU/WAU/MAU uniques). Reach for it for product events, not for the money
    stats.

## Scaling notes

- Reads are O(days × shards): the dashboard reads at most one row per day and
  shard, no matter how many orders exist.
- Writes never serialize on one document: each order updates one of
  `DAILY_SALES_SHARD_COUNT` shards (`day` + `shard`, chosen by hashing the order
  id), so concurrent orders land on different rows and the trigger scales with
  order volume.
