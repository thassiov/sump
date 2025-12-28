import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { DATABASE_CLIENT } from '../../common/database/database.module';
import { BaseRepository } from '../../lib/base-classes';
import { internalConfigs } from '../../lib/config';
import { UnexpectedError } from '../../lib/errors';
import { BaseCustomError } from '../../lib/errors/base-custom-error.error';
import { ICreateSession, ISession } from '../types';

@Injectable()
export class SessionRepository extends BaseRepository {
  private readonly tableName: string;

  constructor(@Inject(DATABASE_CLIENT) private readonly dbClient: Knex) {
    super('session-repository');
    this.tableName = internalConfigs.repository.session.tableName;
  }

  /**
   * Create a new session
   */
  async create(
    data: ICreateSession & { token: string; expiresAt: Date }
  ): Promise<ISession> {
    try {
      const [session] = await this.dbClient(this.tableName)
        .insert({
          token: data.token,
          accountType: data.accountType,
          accountId: data.accountId,
          contextType: data.contextType,
          contextId: data.contextId,
          expiresAt: data.expiresAt,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
        })
        .returning('*');

      return session;
    } catch (error) {
      this.logger.error(error);
      if (error instanceof BaseCustomError) {
        throw error;
      }
      throw new UnexpectedError({
        cause: error as Error,
        context: 'SESSION_CREATE',
        details: { accountId: data.accountId },
      });
    }
  }

  /**
   * Find session by token
   */
  async findByToken(token: string): Promise<ISession | null> {
    try {
      const session = await this.dbClient(this.tableName)
        .where({ token })
        .first();

      return session ?? null;
    } catch (error) {
      this.logger.error(error);
      if (error instanceof BaseCustomError) {
        throw error;
      }
      throw new UnexpectedError({
        cause: error as Error,
        context: 'SESSION_FIND_BY_TOKEN',
      });
    }
  }

  /**
   * Find valid (non-expired) session by token
   */
  async findValidByToken(token: string): Promise<ISession | null> {
    try {
      const session = await this.dbClient(this.tableName)
        .where({ token })
        .where('expiresAt', '>', new Date())
        .first();

      return session ?? null;
    } catch (error) {
      this.logger.error(error);
      if (error instanceof BaseCustomError) {
        throw error;
      }
      throw new UnexpectedError({
        cause: error as Error,
        context: 'SESSION_FIND_VALID_BY_TOKEN',
      });
    }
  }

  /**
   * Update last active timestamp
   */
  async updateLastActiveAt(id: string): Promise<void> {
    try {
      await this.dbClient(this.tableName)
        .where({ id })
        .update({ lastActiveAt: new Date() });
    } catch (error) {
      this.logger.error(error);
      if (error instanceof BaseCustomError) {
        throw error;
      }
      throw new UnexpectedError({
        cause: error as Error,
        context: 'SESSION_UPDATE_LAST_ACTIVE',
        details: { sessionId: id },
      });
    }
  }

  /**
   * Delete session by token
   */
  async deleteByToken(token: string): Promise<boolean> {
    try {
      const deleted = await this.dbClient(this.tableName)
        .where({ token })
        .delete();

      return deleted > 0;
    } catch (error) {
      this.logger.error(error);
      if (error instanceof BaseCustomError) {
        throw error;
      }
      throw new UnexpectedError({
        cause: error as Error,
        context: 'SESSION_DELETE_BY_TOKEN',
      });
    }
  }

  /**
   * Delete all sessions for an account
   */
  async deleteAllByAccount(
    accountType: 'tenant_account' | 'environment_account',
    accountId: string
  ): Promise<number> {
    try {
      const deleted = await this.dbClient(this.tableName)
        .where({ accountType, accountId })
        .delete();

      return deleted;
    } catch (error) {
      this.logger.error(error);
      if (error instanceof BaseCustomError) {
        throw error;
      }
      throw new UnexpectedError({
        cause: error as Error,
        context: 'SESSION_DELETE_ALL_BY_ACCOUNT',
        details: { accountType, accountId },
      });
    }
  }

  /**
   * Find all active sessions for an account
   * @param idleDeadline - Optional cutoff date for idle sessions
   */
  async findAllByAccount(
    accountType: 'tenant_account' | 'environment_account',
    accountId: string,
    idleDeadline?: Date
  ): Promise<ISession[]> {
    try {
      let query = this.dbClient(this.tableName)
        .where({ accountType, accountId })
        .where('expiresAt', '>', new Date());

      if (idleDeadline) {
        query = query.where('lastActiveAt', '>', idleDeadline);
      }

      const sessions = await query.orderBy('lastActiveAt', 'desc');

      return sessions;
    } catch (error) {
      this.logger.error(error);
      if (error instanceof BaseCustomError) {
        throw error;
      }
      throw new UnexpectedError({
        cause: error as Error,
        context: 'SESSION_FIND_ALL_BY_ACCOUNT',
        details: { accountType, accountId },
      });
    }
  }

  /**
   * Delete expired sessions (cleanup)
   * Deletes sessions that are either past absolute expiration OR idle too long
   * @param idleDeadline - Optional cutoff date for idle sessions
   */
  async deleteExpired(idleDeadline?: Date): Promise<number> {
    try {
      let query = this.dbClient(this.tableName).where('expiresAt', '<', new Date());

      if (idleDeadline) {
        // Delete if absolute expired OR idle expired
        query = this.dbClient(this.tableName).where(function () {
          this.where('expiresAt', '<', new Date()).orWhere(
            'lastActiveAt',
            '<',
            idleDeadline
          );
        });
      }

      const deleted = await query.delete();

      this.logger.info({ deleted }, 'Cleaned up expired sessions');
      return deleted;
    } catch (error) {
      this.logger.error(error);
      if (error instanceof BaseCustomError) {
        throw error;
      }
      throw new UnexpectedError({
        cause: error as Error,
        context: 'SESSION_DELETE_EXPIRED',
      });
    }
  }
}
