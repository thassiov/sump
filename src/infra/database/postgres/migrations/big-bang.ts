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
      table.jsonb('customProperties').notNullable();
      table.timestamps(true, true);
    }
  );
  await knex.raw(onUpdateTrigger(internalConfigs.repository.tenant.tableName));

  await knex.schema.createTable(
    internalConfigs.repository.tenantAccount.tableName,
    function (table) {
      table
        .uuid('id')
        .defaultTo(knex.fn.uuid())
        .primary()
        .unique()
        .index('tenantAccountIdx');
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
        .references('id')
        .inTable(internalConfigs.repository.tenant.tableName)
        .onDelete('CASCADE');

      table.timestamps(true, true);
    }
  );
  await knex.raw(onUpdateTrigger(internalConfigs.repository.tenantAccount.tableName));

  await knex.schema.createTable(
    internalConfigs.repository.environment.tableName,
    function (table) {
      table
        .uuid('id')
        .defaultTo(knex.fn.uuid())
        .primary()
        .unique()
        .index('environmentIdx');
      table.string('name').notNullable();
      table.json('customProperties').notNullable();
      table.uuid('tenantId');
      table
        .foreign('tenantId')
        .references('id')
        .inTable(internalConfigs.repository.tenant.tableName)
        .onDelete('CASCADE');
      table.timestamps(true, true);
    }
  );
  await knex.raw(
    onUpdateTrigger(internalConfigs.repository.environment.tableName)
  );

  await knex.schema.createTable(
    internalConfigs.repository.environmentAccount.tableName,
    function (table) {
      table
        .uuid('id')
        .defaultTo(knex.fn.uuid())
        .primary()
        .unique()
        .index('environmentAccountIdx');
      table.string('email').notNullable().unique();
      table.boolean('emailVerified').notNullable().defaultTo(false);
      table.string('phone').notNullable().unique();
      table.boolean('phoneVerified').notNullable().defaultTo(false);
      table.string('username').notNullable().unique();
      table.string('name').notNullable();
      table.string('avatarUrl').notNullable();
      table.json('customProperties').notNullable();
      table.uuid('environmentId');
      table
        .foreign('environmentId')
        .references('id')
        .inTable(internalConfigs.repository.environment.tableName)
        .onDelete('CASCADE');
      table.timestamps(true, true);
    }
  );
  await knex.raw(
    onUpdateTrigger(
      internalConfigs.repository.environmentAccount.tableName
    )
  );
}

async function down(knex: Knex) {
  await knex.schema.dropTable(internalConfigs.repository.environmentAccount.tableName);
  await knex.schema.dropTable(internalConfigs.repository.environment.tableName);
  await knex.schema.dropTable(internalConfigs.repository.tenantAccount.tableName);
  await knex.schema.dropTable(internalConfigs.repository.tenant.tableName);
  await knex.raw(DROP_ON_UPDATE_TIMESTAMP_FUNCTION);
}

const config = { transaction: false };

export { config, down, up };
