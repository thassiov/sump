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
    internalConfigs.repository.account.tableName,
    function (table) {
      console.log('lets go');
      table.uuid('id').defaultTo(knex.fn.uuid()).primary().unique();
      table.string('email').notNullable().unique();
      table.string('fullName').notNullable();
      table.index(['id'], 'idxId');
      table.timestamps(true, true);
    }
  );
  // must be set with the create table so we can use the updated at timestamp
  await knex.raw(onUpdateTrigger(internalConfigs.repository.account.tableName));
}

async function down(knex: Knex) {
  await knex.raw(DROP_ON_UPDATE_TIMESTAMP_FUNCTION);
  await knex.schema.dropTable(internalConfigs.repository.account.tableName);
}

const config = { transaction: false };

export { config, down, up };
