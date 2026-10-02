# Project coding rules and reuse map

Domain map for this translated tasks starter: routes, feature pieces, Convex
tables and functions, and the business rules that go with them. Global
engineering rules live in [`CodingRules.md`](./CodingRules.md); read that one
first. Longer domain notes are
[`DataTableSearchSystemDesign.md`](./DataTableSearchSystemDesign.md),
[`FiltersDataTableAndList.md`](./FiltersDataTableAndList.md),
[`InfiniteScrollingSystemDesign.md`](./InfiniteScrollingSystemDesign.md), and
[`FutureAnalyticsMetrics.md`](./FutureAnalyticsMetrics.md).

## Routes

- `/` is the public home page.
- `(app)/(unprotected)` contains the sign-in, sign-up, verify-email, and
  forgot-password screens.
- `(app)/(protected)` contains the todo list, add-todo, and edit-todo pages and
  the data-list, infinite-list, and data-table component demos; its server
  layout owns the authentication redirect and its `+layout@.svelte` owns the
  workspace shell.
- `(app)/tests` contains the public search, tooltip, sheet, and sidebar
  component demos.
- `/admin` contains the dashboard, users, user detail tabs, and audit logs; its
  server layout owns both authentication and admin-role redirects, and
  non-admins are sent to the todo list.

## Domain feature pieces

| Area                | Existing pieces and intended use                                                                                                                                                                                                                                                                                                                                                    |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Todo example        | `todoEditFields` is the reusable `Form` field config in `src/features/todos`; `EditTodoButton` binds an edit form and preserves existing image keys. Page pieces (`TodoItem`, `TodoHeader`, the loading skeleton, `DeleteTodoButton`) live in `src/components/pages/(protected)`. `TODO_FILTER_DEFS` feeds `useFilters` and the server `readTodoFilters` reader.                    |
| Admin users         | `ADMIN_USERS_FILTER_DEFS` filters the list. The user list/header/table item and the profile, settings, sessions, and logs tabs (ban/unban/role actions, loading skeletons) are page-specific under `src/components/pages/admin`; new admin screens reuse the generic query hooks and UI primitives instead of copying them.                                                         |
| Analytics dashboard | `createAnalyticsDashboard()` in `src/features/analytics` creates `AnalyticsDashboardState`, which owns the selected preset or custom range, the `timerange`/`from`/`to` URL params, and the derived current/previous bounds. The admin dashboard subscribes to `fetchDashboard` (current vs previous period) and the revenue chart to `fetchRevenueSeries`; both read `dailySales`. |

## Convex data model

`src/convex/schema.ts` owns these app tables:

- `tasks`: optional `ownerId`, `title`, `done`, resolved `images` plus
  `imageKeys`/`storagePrefix`, `createdAt`, integer `price`, and the
  materialized `priceBand` (`lt50`/`50to100`/`gt100`, derived from
  `TODO_PRICE_BANDS`). The owner/done/price-band/date indexes back the list
  helpers and the `search_title` search index (filter fields `ownerId`, `done`,
  `priceBand`). Mutations derive the owner from identity and check ownership on
  every read/update/delete.
- `storageUploads`: owner, object key, optional private bucket/original key,
  expected size/content type, and `pending`/`processing`/`uploaded`/`deleting`
  status. Originals upload directly to private R2 (20 MiB each, 50 MiB combined).
  A Node action validates and optimizes the entire batch before writing final
  WebPs. Successful form mutations claim only completed final uploads. Originals,
  failed saves, partial writes and abandoned submissions are cleaned up through
  durable records and a five-minute cron. Deletion records survive failed deletes
  and remain for a one-hour grace period to catch late writes. The private bucket
  needs an `originals/` lifecycle rule deleting objects after one day.
  All temporary credentials use the four `STORAGE_TEMP_*` variables.
  See [ImageUploads.md](./ImageUploads.md) and
  [StorageProductionTODO.md](./production/StorageProductionTODO.md).

- `orders` + `dailySales`: seeded demo orders plus the per-UTC-day/shard rollup
  (order counts by status and paid revenue). The `orders` trigger in
  `aggregates/triggersAggregate.ts` keeps `dailySales` current, so dashboard
  reads never scan `orders`. `products` + `orderItems` hold the demo catalog and
  line items.
- Counts: `taskTotalCounter` (`@convex-dev/sharded-counter`, one namespace per
  owner) is the exact unfiltered task total; `taskFilterAggregate`
  (`@convex-dev/aggregate` keyed by `[done, priceBand, createdAt]`) supplies the
  exact filter-only total; `userTotalAggregate` (an analytics-event counter
  updated by the Better Auth user triggers) totals admin users.
- Better Auth owns its component tables (`user`, `session`, `account`,
  `verification`, rate-limit/JWKS tables) under `betterAuth/component`. All
  admin user queries use `adminQuery`.

## App-facing functions

Current app-facing functions are:

- `api.auth.getCurrentUser`;
- `api.tables.tasks.queries.fetchTodo` (single task) and `fetchTodos`
  (authenticated cursor page with search, symbolic filters, and a `total` only
  when no search is active), plus `createTodo`, `updateTodo`, and
  deduplicating/best-effort `deleteTodo`;
- `api.storage.r2.generateUploadUrls` reserves private uploads;
  `api.storage.actions.processUploads` validates and optimizes the batch;
  `api.storage.r2.deleteObject` queues cancellation cleanup;
- `api.search.queries.fetchSearchSuggestions` (public, normalized, minimum two
  characters, max seven results);
- `api.analytics.queries.fetchDashboard` (current vs previous period stats) and
  `api.analytics.queries.fetchRevenueSeries` (zero-filled daily revenue) for the
  admin dashboard;
- admin `api.betterAuth.tables.users.queries.fetchUsersAdmin`,
  `fetchUserProfileAdmin`, `fetchUserBreadcrumbAdmin`, `fetchUserSettingsAdmin`,
  `fetchUserSessionsAdmin`, and `fetchUserLogsAdmin`, plus
  `api.auditLogs.queries.fetchAuditLogsAdmin`.

## Domain rules

- Operation input schemas use the exact function name plus `Schema`, such as
  `createTodoSchema` and `updateTodoSchema`; reusable data schemas keep
  descriptive names such as `backendErrorDataSchema`. `TODO_FILTER_DEFS` and
  `ADMIN_USERS_FILTER_DEFS` feed `useFilters`.
- `$effect` remains deliberately only in `useCachedConvexQuery.svelte.ts` and
  `useConvexPagination.svelte.ts`, and only to write fresh, non-stale results to
  the external bounded LRU cache: that is external synchronization without a
  `useQuery` success callback, not derived state.
- The edit-todo form is keyed by task id (`{#key todo.data._id}`), so a
  different task recreates fresh form state.
- Relative todo date filters are resolved server-side: the client sends its
  `now` timestamp and `readTodoFilters` converts the symbolic `date` option into
  an indexed `createdAtFrom` bound. Unknown filter keys and values are dropped.
- The add-todo form uses `createTodoSchema.omit({ images: true })` because
  `createTodo` accepts upload keys, not the shared schema's image defaults.
  `deleteTodo` deduplicates ids, skips missing or foreign rows, deletes their
  stored files, and rejects more than 100 ids (`TOO_MANY_TODOS`) or more than
  `STORAGE_CONFIG.maxFilesPerUpload` images (`TOO_MANY_FILES`).
- Todo mutation failures throw typed `ConvexError` payloads such as
  `INVALID_TODO_DATA`, `TODO_NOT_FOUND`, `INVALID_RETAINED_IMAGE`, and
  `DUPLICATE_RETAINED_IMAGE`; user-facing text stays in the components.
- The admin users table hides its total while a search or filter is active, and
  the admin dashboard range is URL-backed (`DEFAULT_TIME_RANGE = '30d'`,
  `MAX_RANGE_DAYS = 366`). Dashboard stats and the revenue series read only
  `dailySales`; `orders` is seed/demo data behind that rollup.
