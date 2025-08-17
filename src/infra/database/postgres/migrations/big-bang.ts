import { Knex } from 'knex';
import { configs } from '../../../../lib/config';

async function up(knex: Knex) {
  await knex.schema.createTable(
    configs.repository.account.tableName,
    function (table) {
      table.uuid('id').defaultTo(knex.fn.uuid()).primary().unique();
      table.string('email').notNullable().unique();
      table.string('fullName').notNullable();
      table
        .dateTime('createdAt')
        .notNullable()
        .defaultTo(knex.raw('CURRENT_TIMESTAMP'));
      table
        .dateTime('updatedAt')
        .notNullable()
        .defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
      table.index(['id'], 'idxId');
    }
  );
}

async function down(knex: Knex) {
  await knex.schema.dropTable(configs.repository.account.tableName);
}

const config = { transaction: false };

export { config, down, up };
