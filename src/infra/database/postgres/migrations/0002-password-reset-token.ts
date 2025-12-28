import { Knex } from 'knex';
import { internalConfigs } from '../../../../lib/config';

async function up(knex: Knex) {
  await knex.schema.createTable(
    internalConfigs.repository.passwordResetToken.tableName,
    function (table) {
      table
        .uuid('id')
        .defaultTo(knex.fn.uuid())
        .primary()
        .unique()
        .index('passwordResetTokenIdx');
      table
        .string('token', 64)
        .notNullable()
        .unique()
        .index('passwordResetTokenTokenIdx');
      table
        .enum('accountType', ['tenant_account', 'environment_account'])
        .notNullable();
      table.uuid('accountId').notNullable();
      table.timestamp('expiresAt').notNullable();
      table.timestamp('usedAt').nullable();
      table.timestamps(true, true);
    }
  );

  // Additional indexes for password reset queries
  await knex.raw(`
    CREATE INDEX idx_password_reset_account
    ON ${internalConfigs.repository.passwordResetToken.tableName}(account_type, account_id)
  `);
}

async function down(knex: Knex) {
  await knex.schema.dropTableIfExists(
    internalConfigs.repository.passwordResetToken.tableName
  );
}

const config = { transaction: false };

export { config, down, up };
