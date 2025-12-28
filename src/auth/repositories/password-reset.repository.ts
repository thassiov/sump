import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { DATABASE_CLIENT } from '../../common/database/database.module';
import { internalConfigs } from '../../lib/config';
import { BaseRepository } from '../../lib/base-classes';
import { IPasswordResetToken, ICreatePasswordResetToken } from '../types';

@Injectable()
export class PasswordResetRepository extends BaseRepository {
  private readonly tableName = internalConfigs.repository.passwordResetToken.tableName;

  constructor(@Inject(DATABASE_CLIENT) private readonly dbClient: Knex) {
    super('password-reset-repository');
  }

  /**
   * Create a new password reset token
   */
  async create(data: ICreatePasswordResetToken): Promise<IPasswordResetToken> {
    const [token] = await this.dbClient(this.tableName)
      .insert({
        token: data.token,
        account_type: data.accountType,
        account_id: data.accountId,
        expires_at: data.expiresAt,
      })
      .returning('*');

    return this.mapToPasswordResetToken(token);
  }

  /**
   * Find a valid (non-expired, unused) token by its value
   */
  async findValidByToken(token: string): Promise<IPasswordResetToken | null> {
    const result = await this.dbClient(this.tableName)
      .where('token', token)
      .whereNull('used_at')
      .where('expires_at', '>', new Date())
      .first();

    return result ? this.mapToPasswordResetToken(result) : null;
  }

  /**
   * Mark a token as used
   */
  async markAsUsed(token: string): Promise<boolean> {
    const result = await this.dbClient(this.tableName)
      .where('token', token)
      .update({ used_at: new Date() });

    return result > 0;
  }

  /**
   * Delete all tokens for an account (cleanup after password change)
   */
  async deleteAllByAccount(
    accountType: 'tenant_account' | 'environment_account',
    accountId: string
  ): Promise<number> {
    return this.dbClient(this.tableName)
      .where('account_type', accountType)
      .where('account_id', accountId)
      .del();
  }

  /**
   * Delete expired tokens (cleanup job)
   */
  async deleteExpired(): Promise<number> {
    return this.dbClient(this.tableName)
      .where('expires_at', '<', new Date())
      .del();
  }

  /**
   * Map database row to IPasswordResetToken
   */
  private mapToPasswordResetToken(row: any): IPasswordResetToken {
    return {
      id: row.id,
      token: row.token,
      accountType: row.account_type,
      accountId: row.account_id,
      expiresAt: new Date(row.expires_at),
      usedAt: row.used_at ? new Date(row.used_at) : null,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}
