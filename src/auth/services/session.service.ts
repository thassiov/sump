import { Inject, Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { BaseService } from '../../lib/base-classes';
import { AUTH_CONFIG, SumpAuthConfig } from '../config';
import { SessionRepository } from '../repositories';
import { ICreateSession, ISession } from '../types';

@Injectable()
export class SessionService extends BaseService {
  // Absolute timeout - max session lifetime (default: 30 days)
  private readonly absoluteTimeout: number;
  // Idle timeout - max inactivity before expiration (default: 7 days)
  private readonly idleTimeout: number;

  constructor(
    @Inject(AUTH_CONFIG) private readonly config: SumpAuthConfig,
    private readonly sessionRepository: SessionRepository
  ) {
    super('session-service');
    this.absoluteTimeout = config.session?.absoluteTimeout ?? 2592000; // 30 days
    this.idleTimeout = config.session?.idleTimeout ?? 604800; // 7 days
  }

  /**
   * Create a new session for an account
   */
  async create(params: ICreateSession): Promise<ISession> {
    const token = this.generateToken();
    // Absolute expiration - hard limit on session lifetime
    const expiresAt = new Date(Date.now() + this.absoluteTimeout * 1000);

    this.logger.info(
      { accountType: params.accountType, accountId: params.accountId },
      'Creating new session'
    );

    const session = await this.sessionRepository.create({
      ...params,
      token,
      expiresAt,
    });

    return session;
  }

  /**
   * Validate a session token and return the session if valid
   * Checks both absolute expiration and idle timeout
   * Also updates last_active_at on successful validation
   */
  async validate(token: string): Promise<ISession | null> {
    // Repository checks absolute expiration (expiresAt > now)
    const session = await this.sessionRepository.findValidByToken(token);

    if (!session) {
      return null;
    }

    // Check idle timeout - session is invalid if inactive too long
    const idleDeadline = new Date(Date.now() - this.idleTimeout * 1000);
    if (session.lastActiveAt < idleDeadline) {
      this.logger.info(
        { sessionId: session.id, lastActiveAt: session.lastActiveAt },
        'Session expired due to inactivity'
      );
      // Optionally delete the idle session
      await this.sessionRepository.deleteByToken(token);
      return null;
    }

    // Update last active timestamp
    await this.sessionRepository.updateLastActiveAt(session.id);

    return session;
  }

  /**
   * Get session by token without validation or side effects
   */
  async getByToken(token: string): Promise<ISession | null> {
    return this.sessionRepository.findByToken(token);
  }

  /**
   * Revoke a single session by token
   */
  async revoke(token: string): Promise<boolean> {
    this.logger.info('Revoking session');
    return this.sessionRepository.deleteByToken(token);
  }

  /**
   * Revoke all sessions for an account (logout everywhere)
   */
  async revokeAll(
    accountType: 'tenant_account' | 'environment_account',
    accountId: string
  ): Promise<number> {
    this.logger.info(
      { accountType, accountId },
      'Revoking all sessions for account'
    );
    return this.sessionRepository.deleteAllByAccount(accountType, accountId);
  }

  /**
   * List all active sessions for an account
   * Filters out both absolutely expired and idle expired sessions
   */
  async listByAccount(
    accountType: 'tenant_account' | 'environment_account',
    accountId: string
  ): Promise<ISession[]> {
    const idleDeadline = new Date(Date.now() - this.idleTimeout * 1000);
    return this.sessionRepository.findAllByAccount(
      accountType,
      accountId,
      idleDeadline
    );
  }

  /**
   * Cleanup expired sessions
   * Deletes both absolutely expired and idle expired sessions
   * Should be called periodically (e.g., via cron job)
   */
  async cleanup(): Promise<number> {
    const idleDeadline = new Date(Date.now() - this.idleTimeout * 1000);
    return this.sessionRepository.deleteExpired(idleDeadline);
  }

  /**
   * Generate a cryptographically secure session token
   */
  private generateToken(): string {
    return randomBytes(32).toString('hex'); // 64 character hex string
  }

  /**
   * Get cookie name from config
   */
  getCookieName(): string {
    return this.config.session?.cookieName ?? 'sump_session';
  }

  /**
   * Get cookie options
   */
  getCookieOptions(): {
    httpOnly: boolean;
    secure: boolean;
    sameSite: 'strict' | 'lax' | 'none';
    maxAge: number;
    path: string;
    signed: boolean;
  } {
    return {
      httpOnly: true,
      secure: this.config.session?.secure ?? process.env['NODE_ENV'] === 'production',
      sameSite: this.config.session?.sameSite ?? 'lax',
      maxAge: this.absoluteTimeout * 1000, // Convert to milliseconds
      path: '/',
      signed: true,
    };
  }
}
