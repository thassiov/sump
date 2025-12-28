import { Inject, Injectable } from '@nestjs/common';
import { Response, Request } from 'express';
import { BaseService } from '../../lib/base-classes';
import { PermissionError } from '../../lib/errors';
import { AUTH_CONFIG, SumpAuthConfig } from '../config';
import { ISession, AccountType, ContextType } from '../types';
import { PasswordService } from './password.service';
import { SessionService } from './session.service';

interface CreateSessionParams {
  accountType: AccountType;
  accountId: string;
  contextType: ContextType;
  contextId: string;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuthService extends BaseService {
  constructor(
    @Inject(AUTH_CONFIG) config: SumpAuthConfig,
    private readonly passwordService: PasswordService,
    private readonly sessionService: SessionService
  ) {
    super('auth-service');
    // Config injected for dependency graph but accessed through child services
    void config;
  }

  /**
   * Hash a password for storage
   */
  async hashPassword(password: string): Promise<string> {
    const validation = this.passwordService.validateStrength(password);
    if (!validation.valid) {
      throw new PermissionError({
        context: 'AUTH_HASH_PASSWORD',
        details: { errors: validation.errors },
      });
    }
    return this.passwordService.hash(password);
  }

  /**
   * Verify a password against a stored hash
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return this.passwordService.verify(password, hash);
  }

  /**
   * Create a session and set the cookie on the response
   */
  async createSession(
    res: Response,
    params: CreateSessionParams
  ): Promise<ISession> {
    const session = await this.sessionService.create({
      accountType: params.accountType,
      accountId: params.accountId,
      contextType: params.contextType,
      contextId: params.contextId,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    });

    // Set cookie
    res.cookie(
      this.sessionService.getCookieName(),
      session.token,
      this.sessionService.getCookieOptions()
    );

    this.logger.info(
      { accountId: params.accountId, sessionId: session.id },
      'Session created'
    );

    return session;
  }

  /**
   * Validate the current session from request
   */
  async validateSession(req: Request): Promise<ISession | null> {
    const cookieName = this.sessionService.getCookieName();
    const token = req.signedCookies?.[cookieName];

    if (!token) {
      return null;
    }

    return this.sessionService.validate(token);
  }

  /**
   * Sign out - revoke current session and clear cookie
   */
  async signout(req: Request, res: Response): Promise<void> {
    const cookieName = this.sessionService.getCookieName();
    const token = req.signedCookies?.[cookieName];

    if (token) {
      await this.sessionService.revoke(token);
      this.logger.info('Session revoked');
    }

    res.clearCookie(cookieName);
  }

  /**
   * Sign out everywhere - revoke all sessions for an account
   */
  async signoutAll(
    _req: Request,
    res: Response,
    accountType: AccountType,
    accountId: string
  ): Promise<number> {
    const cookieName = this.sessionService.getCookieName();
    const revoked = await this.sessionService.revokeAll(accountType, accountId);

    res.clearCookie(cookieName);

    this.logger.info({ accountId, revoked }, 'All sessions revoked');

    return revoked;
  }

  /**
   * Get current session info
   */
  async getSession(req: Request): Promise<ISession | null> {
    const cookieName = this.sessionService.getCookieName();
    const token = req.signedCookies?.[cookieName];

    if (!token) {
      return null;
    }

    return this.sessionService.getByToken(token);
  }

  /**
   * List all active sessions for an account
   */
  async listSessions(
    accountType: AccountType,
    accountId: string
  ): Promise<ISession[]> {
    return this.sessionService.listByAccount(accountType, accountId);
  }

  /**
   * Extract IP address from request
   */
  getIpAddress(req: Request): string | undefined {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
      const firstIp = forwarded.split(',')[0];
      return firstIp?.trim();
    }
    return req.ip;
  }

  /**
   * Extract user agent from request
   */
  getUserAgent(req: Request): string | undefined {
    return req.headers['user-agent'];
  }
}
