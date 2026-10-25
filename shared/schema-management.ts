// Complex audit constraints/triggers are owned by explicit SQL migrations.
// Filter them out of BOTH declared schema (application-schema.ts) and database
// introspection so schema push cannot replace or truncate the protected tables.
export const MIGRATION_MANAGED_TABLE_PREFIX = 'feature_control_';
export const APPLICATION_TABLE_FILTER = [`!${MIGRATION_MANAGED_TABLE_PREFIX}*`, '!biology_*'];
export const isMigrationManagedTable = (name:string) => name.startsWith(MIGRATION_MANAGED_TABLE_PREFIX) || name.startsWith('biology_');
