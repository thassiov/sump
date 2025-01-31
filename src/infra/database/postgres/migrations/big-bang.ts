import { Knex } from 'knex';
import { configs } from '../../../../lib/config';

async function up(knex: Knex) {
  await knex.schema.createTable(
    configs.repository.account.tableName,
    function (table) {
      table.uuid('id').defaultTo(knex.fn.uuid()).primary().unique();
      table.string('email').notNullable().unique();
      table.string('username').notNullable().unique();
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

  await knex.schema.createTable(
    configs.repository.profile.tableName,
    function (table) {
      table.uuid('id').defaultTo(knex.fn.uuid()).primary().unique();
      table
        .foreign('accountId')
        .references('id')
        .inTable(configs.repository.account.tableName)
        .onDelete('CASCADE');
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
      table.index(['accountId'], 'idxAccountId');
    }
  );
}

async function down(knex: Knex) {
  await knex.schema.dropTable(configs.repository.account.tableName);
  await knex.schema.dropTable(configs.repository.profile.tableName);
}

const config = { transaction: false };

export { config, down, up };
