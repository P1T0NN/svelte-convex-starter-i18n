/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as aggregates_helpers_createCounterAggregate from "../aggregates/helpers/createCounterAggregate.js";
import type * as aggregates_helpers_getFilteredTotalAggregate from "../aggregates/helpers/getFilteredTotalAggregate.js";
import type * as aggregates_helpers_getTotalSizeAggregate from "../aggregates/helpers/getTotalSizeAggregate.js";
import type * as aggregates_triggersAggregate from "../aggregates/triggersAggregate.js";
import type * as aggregates_types_aggregateTypes from "../aggregates/types/aggregateTypes.js";
import type * as aggregates_utils_getPrefixRangeBoundsAggregate from "../aggregates/utils/getPrefixRangeBoundsAggregate.js";
import type * as auditLogs_helpers_logAuditBulk from "../auditLogs/helpers/logAuditBulk.js";
import type * as auditLogs_helpers_logAuditChange from "../auditLogs/helpers/logAuditChange.js";
import type * as auditLogs_helpers_logAuditEvent from "../auditLogs/helpers/logAuditEvent.js";
import type * as auditLogs_mutations_cleanupAuditLogs from "../auditLogs/mutations/cleanupAuditLogs.js";
import type * as auditLogs_mutations_writeAuditBulk from "../auditLogs/mutations/writeAuditBulk.js";
import type * as auditLogs_mutations_writeAuditChange from "../auditLogs/mutations/writeAuditChange.js";
import type * as auditLogs_mutations_writeAuditEvent from "../auditLogs/mutations/writeAuditEvent.js";
import type * as auditLogs_queries_fetchAuditLogsAdmin from "../auditLogs/queries/fetchAuditLogsAdmin.js";
import type * as auditLogs_types_auditLogsTypes from "../auditLogs/types/auditLogsTypes.js";
import type * as auth from "../auth.js";
import type * as betterAuth_auth from "../betterAuth/auth.js";
import type * as betterAuth_cleanupDeletedUserData from "../betterAuth/cleanupDeletedUserData.js";
import type * as betterAuth_config from "../betterAuth/config.js";
import type * as betterAuth_emails_sendVerificationOTPEmail from "../betterAuth/emails/sendVerificationOTPEmail.js";
import type * as betterAuth_helpers_requireIdentity from "../betterAuth/helpers/requireIdentity.js";
import type * as betterAuth_helpers_sendOtpEmail from "../betterAuth/helpers/sendOtpEmail.js";
import type * as betterAuth_tables_users_aggregates_userTotalAggregate from "../betterAuth/tables/users/aggregates/userTotalAggregate.js";
import type * as betterAuth_tables_users_helpers_filterPredicates from "../betterAuth/tables/users/helpers/filterPredicates.js";
import type * as betterAuth_tables_users_migrations_backfillUserTotal from "../betterAuth/tables/users/migrations/backfillUserTotal.js";
import type * as betterAuth_tables_users_queries_fetchUserBreadcrumbAdmin from "../betterAuth/tables/users/queries/fetchUserBreadcrumbAdmin.js";
import type * as betterAuth_tables_users_queries_fetchUserLogsAdmin from "../betterAuth/tables/users/queries/fetchUserLogsAdmin.js";
import type * as betterAuth_tables_users_queries_fetchUserProfileAdmin from "../betterAuth/tables/users/queries/fetchUserProfileAdmin.js";
import type * as betterAuth_tables_users_queries_fetchUserSessionsAdmin from "../betterAuth/tables/users/queries/fetchUserSessionsAdmin.js";
import type * as betterAuth_tables_users_queries_fetchUserSettingsAdmin from "../betterAuth/tables/users/queries/fetchUserSettingsAdmin.js";
import type * as betterAuth_tables_users_queries_fetchUsersAdmin from "../betterAuth/tables/users/queries/fetchUsersAdmin.js";
import type * as builders_convexFunctionBuilders from "../builders/convexFunctionBuilders.js";
import type * as crons from "../crons.js";
import type * as emails_data_emailData from "../emails/data/emailData.js";
import type * as emails_sendEmail from "../emails/sendEmail.js";
import type * as emails_templates_footerTemplate from "../emails/templates/footerTemplate.js";
import type * as emails_templates_headerTemplate from "../emails/templates/headerTemplate.js";
import type * as emails_types_emailTypes from "../emails/types/emailTypes.js";
import type * as helpers_getPagination from "../helpers/getPagination.js";
import type * as helpers_paginateSearch from "../helpers/paginateSearch.js";
import type * as http from "../http.js";
import type * as migrations_backfillOwnerIds from "../migrations/backfillOwnerIds.js";
import type * as migrations_migrations from "../migrations/migrations.js";
import type * as migrations_types_migrationTypes from "../migrations/types/migrationTypes.js";
import type * as rateLimits_helpers_enforceRateLimit from "../rateLimits/helpers/enforceRateLimit.js";
import type * as rateLimits_types_rateLimitTypes from "../rateLimits/types/rateLimitTypes.js";
import type * as search_queries_fetchSearchSuggestions from "../search/queries/fetchSearchSuggestions.js";
import type * as storage_r2 from "../storage/r2.js";
import type * as tables_tasks_aggregates_taskFilterAggregate from "../tables/tasks/aggregates/taskFilterAggregate.js";
import type * as tables_tasks_counters_taskTotalCounter from "../tables/tasks/counters/taskTotalCounter.js";
import type * as tables_tasks_helpers_filterValues from "../tables/tasks/helpers/filterValues.js";
import type * as tables_tasks_helpers_getFilteredTodoTotalAggregate from "../tables/tasks/helpers/getFilteredTodoTotalAggregate.js";
import type * as tables_tasks_helpers_getTodoPage from "../tables/tasks/helpers/getTodoPage.js";
import type * as tables_tasks_helpers_paginateTasks from "../tables/tasks/helpers/paginateTasks.js";
import type * as tables_tasks_migrations_backfillTaskFilterAggregate from "../tables/tasks/migrations/backfillTaskFilterAggregate.js";
import type * as tables_tasks_migrations_backfillTaskImageUrls from "../tables/tasks/migrations/backfillTaskImageUrls.js";
import type * as tables_tasks_migrations_backfillTaskTotalCounter from "../tables/tasks/migrations/backfillTaskTotalCounter.js";
import type * as tables_tasks_mutations_createTodo from "../tables/tasks/mutations/createTodo.js";
import type * as tables_tasks_mutations_deleteTodo from "../tables/tasks/mutations/deleteTodo.js";
import type * as tables_tasks_mutations_updateTodo from "../tables/tasks/mutations/updateTodo.js";
import type * as tables_tasks_queries_fetchTodo from "../tables/tasks/queries/fetchTodo.js";
import type * as tables_tasks_queries_fetchTodos from "../tables/tasks/queries/fetchTodos.js";
import type * as tables_tasks_validators_todoValidators from "../tables/tasks/validators/todoValidators.js";
import type * as turnstile_verifyTurnstile from "../turnstile/verifyTurnstile.js";
import type * as utils_buildFilterWhere from "../utils/buildFilterWhere.js";
import type * as utils_cursorPagination from "../utils/cursorPagination.js";
import type * as wrappers_fetchOptimizedQuery from "../wrappers/fetchOptimizedQuery.js";
import type * as wrappers_fetchOptimizedSearchQuery from "../wrappers/fetchOptimizedSearchQuery.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "aggregates/helpers/createCounterAggregate": typeof aggregates_helpers_createCounterAggregate;
  "aggregates/helpers/getFilteredTotalAggregate": typeof aggregates_helpers_getFilteredTotalAggregate;
  "aggregates/helpers/getTotalSizeAggregate": typeof aggregates_helpers_getTotalSizeAggregate;
  "aggregates/triggersAggregate": typeof aggregates_triggersAggregate;
  "aggregates/types/aggregateTypes": typeof aggregates_types_aggregateTypes;
  "aggregates/utils/getPrefixRangeBoundsAggregate": typeof aggregates_utils_getPrefixRangeBoundsAggregate;
  "auditLogs/helpers/logAuditBulk": typeof auditLogs_helpers_logAuditBulk;
  "auditLogs/helpers/logAuditChange": typeof auditLogs_helpers_logAuditChange;
  "auditLogs/helpers/logAuditEvent": typeof auditLogs_helpers_logAuditEvent;
  "auditLogs/mutations/cleanupAuditLogs": typeof auditLogs_mutations_cleanupAuditLogs;
  "auditLogs/mutations/writeAuditBulk": typeof auditLogs_mutations_writeAuditBulk;
  "auditLogs/mutations/writeAuditChange": typeof auditLogs_mutations_writeAuditChange;
  "auditLogs/mutations/writeAuditEvent": typeof auditLogs_mutations_writeAuditEvent;
  "auditLogs/queries/fetchAuditLogsAdmin": typeof auditLogs_queries_fetchAuditLogsAdmin;
  "auditLogs/types/auditLogsTypes": typeof auditLogs_types_auditLogsTypes;
  auth: typeof auth;
  "betterAuth/auth": typeof betterAuth_auth;
  "betterAuth/cleanupDeletedUserData": typeof betterAuth_cleanupDeletedUserData;
  "betterAuth/config": typeof betterAuth_config;
  "betterAuth/emails/sendVerificationOTPEmail": typeof betterAuth_emails_sendVerificationOTPEmail;
  "betterAuth/helpers/requireIdentity": typeof betterAuth_helpers_requireIdentity;
  "betterAuth/helpers/sendOtpEmail": typeof betterAuth_helpers_sendOtpEmail;
  "betterAuth/tables/users/aggregates/userTotalAggregate": typeof betterAuth_tables_users_aggregates_userTotalAggregate;
  "betterAuth/tables/users/helpers/filterPredicates": typeof betterAuth_tables_users_helpers_filterPredicates;
  "betterAuth/tables/users/migrations/backfillUserTotal": typeof betterAuth_tables_users_migrations_backfillUserTotal;
  "betterAuth/tables/users/queries/fetchUserBreadcrumbAdmin": typeof betterAuth_tables_users_queries_fetchUserBreadcrumbAdmin;
  "betterAuth/tables/users/queries/fetchUserLogsAdmin": typeof betterAuth_tables_users_queries_fetchUserLogsAdmin;
  "betterAuth/tables/users/queries/fetchUserProfileAdmin": typeof betterAuth_tables_users_queries_fetchUserProfileAdmin;
  "betterAuth/tables/users/queries/fetchUserSessionsAdmin": typeof betterAuth_tables_users_queries_fetchUserSessionsAdmin;
  "betterAuth/tables/users/queries/fetchUserSettingsAdmin": typeof betterAuth_tables_users_queries_fetchUserSettingsAdmin;
  "betterAuth/tables/users/queries/fetchUsersAdmin": typeof betterAuth_tables_users_queries_fetchUsersAdmin;
  "builders/convexFunctionBuilders": typeof builders_convexFunctionBuilders;
  crons: typeof crons;
  "emails/data/emailData": typeof emails_data_emailData;
  "emails/sendEmail": typeof emails_sendEmail;
  "emails/templates/footerTemplate": typeof emails_templates_footerTemplate;
  "emails/templates/headerTemplate": typeof emails_templates_headerTemplate;
  "emails/types/emailTypes": typeof emails_types_emailTypes;
  "helpers/getPagination": typeof helpers_getPagination;
  "helpers/paginateSearch": typeof helpers_paginateSearch;
  http: typeof http;
  "migrations/backfillOwnerIds": typeof migrations_backfillOwnerIds;
  "migrations/migrations": typeof migrations_migrations;
  "migrations/types/migrationTypes": typeof migrations_types_migrationTypes;
  "rateLimits/helpers/enforceRateLimit": typeof rateLimits_helpers_enforceRateLimit;
  "rateLimits/types/rateLimitTypes": typeof rateLimits_types_rateLimitTypes;
  "search/queries/fetchSearchSuggestions": typeof search_queries_fetchSearchSuggestions;
  "storage/r2": typeof storage_r2;
  "tables/tasks/aggregates/taskFilterAggregate": typeof tables_tasks_aggregates_taskFilterAggregate;
  "tables/tasks/counters/taskTotalCounter": typeof tables_tasks_counters_taskTotalCounter;
  "tables/tasks/helpers/filterValues": typeof tables_tasks_helpers_filterValues;
  "tables/tasks/helpers/getFilteredTodoTotalAggregate": typeof tables_tasks_helpers_getFilteredTodoTotalAggregate;
  "tables/tasks/helpers/getTodoPage": typeof tables_tasks_helpers_getTodoPage;
  "tables/tasks/helpers/paginateTasks": typeof tables_tasks_helpers_paginateTasks;
  "tables/tasks/migrations/backfillTaskFilterAggregate": typeof tables_tasks_migrations_backfillTaskFilterAggregate;
  "tables/tasks/migrations/backfillTaskImageUrls": typeof tables_tasks_migrations_backfillTaskImageUrls;
  "tables/tasks/migrations/backfillTaskTotalCounter": typeof tables_tasks_migrations_backfillTaskTotalCounter;
  "tables/tasks/mutations/createTodo": typeof tables_tasks_mutations_createTodo;
  "tables/tasks/mutations/deleteTodo": typeof tables_tasks_mutations_deleteTodo;
  "tables/tasks/mutations/updateTodo": typeof tables_tasks_mutations_updateTodo;
  "tables/tasks/queries/fetchTodo": typeof tables_tasks_queries_fetchTodo;
  "tables/tasks/queries/fetchTodos": typeof tables_tasks_queries_fetchTodos;
  "tables/tasks/validators/todoValidators": typeof tables_tasks_validators_todoValidators;
  "turnstile/verifyTurnstile": typeof turnstile_verifyTurnstile;
  "utils/buildFilterWhere": typeof utils_buildFilterWhere;
  "utils/cursorPagination": typeof utils_cursorPagination;
  "wrappers/fetchOptimizedQuery": typeof wrappers_fetchOptimizedQuery;
  "wrappers/fetchOptimizedSearchQuery": typeof wrappers_fetchOptimizedSearchQuery;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  betterAuth: import("../betterAuth/component/_generated/component.js").ComponentApi<"betterAuth">;
  migrations: import("@convex-dev/migrations/_generated/component.js").ComponentApi<"migrations">;
  rateLimiter: import("@convex-dev/rate-limiter/_generated/component.js").ComponentApi<"rateLimiter">;
  tasksTotalCounter: import("@convex-dev/sharded-counter/_generated/component.js").ComponentApi<"tasksTotalCounter">;
  analytics: import("@vllnt/convex-analytics/_generated/component.js").ComponentApi<"analytics">;
  tasksFilterAggregate: import("@convex-dev/aggregate/_generated/component.js").ComponentApi<"tasksFilterAggregate">;
  r2: import("@convex-dev/r2/_generated/component.js").ComponentApi<"r2">;
  auditLog: import("convex-audit-log/_generated/component.js").ComponentApi<"auditLog">;
};
