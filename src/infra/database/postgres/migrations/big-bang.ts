import { Knex } from 'knex';
import { internalConfigs } from '../../../../lib/config';

// [ https://stackoverflow.com/a/48028011/931704 ]
const ON_UPDATE_TIMESTAMP_FUNCTION = `
  CREATE OR REPLACE FUNCTION on_update_timestamp()
  RETURNS trigger AS $$
  BEGIN
    NEW.updated_at = now();
    RETURN NEW;
  END;
$$ language 'plpgsql';
`;

// must be set with/after the `createTable` calls so we can use the `updatedAt` timestamp
function onUpdateTrigger(table: string) {
  return `
    CREATE TRIGGER ${table}_updated_at
    BEFORE UPDATE ON ${table}
    FOR EACH ROW
    EXECUTE PROCEDURE on_update_timestamp();
  `;
}

const DROP_ON_UPDATE_TIMESTAMP_FUNCTION = `DROP FUNCTION on_update_timestamp`;

async function up(knex: Knex) {
  // fixes the updated_at timestamp problem that postgres does not update by adding a new function
  await knex.raw(ON_UPDATE_TIMESTAMP_FUNCTION);

  await knex.schema.createTable(
    internalConfigs.repository.tenant.tableName,
    function (table) {
      table
        .uuid('id')
        .defaultTo(knex.fn.uuid())
        .primary()
        .unique()
        .index('tenantIdx');
      table.string('name').notNullable();
      table.json('customProperties').notNullable();
      table.timestamps(true, true);
    }
  );
  await knex.raw(onUpdateTrigger(internalConfigs.repository.tenant.tableName));

  await knex.schema.createTable(
    internalConfigs.repository.account.tableName,
    function (table) {
      table
        .uuid('id')
        .defaultTo(knex.fn.uuid())
        .primary()
        .unique()
        .index('accountIdx');
      table.string('email').notNullable().unique();
      table.boolean('emailVerified').notNullable().defaultTo(false);
      table.string('phone').notNullable().unique();
      table.boolean('phoneVerified').notNullable().defaultTo(false);
      table.string('username').notNullable().unique();
      table.string('name').notNullable();
      table.string('avatarUrl').notNullable();
      table.json('roles').notNullable();
      table.uuid('tenantId');
      table
        .foreign('tenantId')
        .references(`${internalConfigs.repository.tenant.tableName}.id`);
      table.timestamps(true, true);
    }
  );
  await knex.raw(onUpdateTrigger(internalConfigs.repository.account.tableName));

  await knex.schema.createTable(
    internalConfigs.repository.tenantEnvironment.tableName,
    function (table) {
      table
        .uuid('id')
        .defaultTo(knex.fn.uuid())
        .primary()
        .unique()
        .index('tenantEnvironmentIdx');
      table.string('name').notNullable();
      table.json('customProperties').notNullable();
      table.uuid('tenantId');
      table
        .foreign('tenantId')
        .references(`${internalConfigs.repository.tenant.tableName}.id`);
      table.timestamps(true, true);
    }
  );
  await knex.raw(
    onUpdateTrigger(internalConfigs.repository.tenantEnvironment.tableName)
  );

  await knex.schema.createTable(
    internalConfigs.repository.tenantEnvironmentAccount.tableName,
    function (table) {
      table
        .uuid('id')
        .defaultTo(knex.fn.uuid())
        .primary()
        .unique()
        .index('tenantEnvironmentAccountIdx');
      table.string('email').notNullable().unique();
      table.boolean('emailVerified').notNullable().defaultTo(false);
      table.string('phone').notNullable().unique();
      table.boolean('phoneVerified').notNullable().defaultTo(false);
      table.string('username').notNullable().unique();
      table.string('name').notNullable();
      table.string('avatarUrl').notNullable();
      table.json('customProperties').notNullable();
      table.uuid('tenantEnvironmentId');
      table
        .foreign('tenantEnvironmentId')
        .references(
          `${internalConfigs.repository.tenantEnvironment.tableName}.id`
        );
      table.timestamps(true, true);
    }
  );
  await knex.raw(
    onUpdateTrigger(
      internalConfigs.repository.tenantEnvironmentAccount.tableName
    )
  );
}

async function down(knex: Knex) {
  await knex.raw(DROP_ON_UPDATE_TIMESTAMP_FUNCTION);
  await knex.schema.dropTable(internalConfigs.repository.account.tableName);
}

const config = { transaction: false };

export { config, down, up };
