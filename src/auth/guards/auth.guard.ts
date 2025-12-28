import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Request } from 'express';
import { AuthService } from '../services';
import { ISession } from '../types';
import { TenantAccountService } from '../../core/services/tenant-account.service';
import { EnvironmentAccountService } from '../../core/services/environment-account.service';

/**
 * Request with session attached by AuthGuard
 * This is a simpler version - see AuthenticatedRequest in types for full version
 */
export interface RequestWithSession extends Request {
  session: ISession;
}

/**
 * Guard that validates the session and attaches it to the request
 * Use this guard to protect routes that require authentication
 *
 * @example
 * @UseGuards(AuthGuard)
 * @Get('profile')
 * getProfile(@Req() req: AuthenticatedRequest) {
 *   return req.session;
 * }
 */
@Injectable()
export class AuthGuard implements CanActivate {
  private tenantAccountService: TenantAccountService | null = null;
  private environmentAccountService: EnvironmentAccountService | null = null;

  constructor(
    private readonly authService: AuthService,
    private readonly moduleRef: ModuleRef
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const session = await this.authService.validateSession(request);

    if (!session) {
      throw new UnauthorizedException('Invalid or expired session');
    }

    // Check if the account is disabled
    const isDisabled = await this.isAccountDisabled(session);
    if (isDisabled) {
      throw new ForbiddenException('Account is disabled');
    }

    // Attach session to request for use in controllers
    (request as RequestWithSession).session = session;

    return true;
  }

  /**
   * Get TenantAccountService lazily to avoid circular dependency
   */
  private getTenantAccountService(): TenantAccountService {
    if (!this.tenantAccountService) {
      this.tenantAccountService = this.moduleRef.get(TenantAccountService, { strict: false });
    }
    return this.tenantAccountService!;
  }

  /**
   * Get EnvironmentAccountService lazily to avoid circular dependency
   */
  private getEnvironmentAccountService(): EnvironmentAccountService {
    if (!this.environmentAccountService) {
      this.environmentAccountService = this.moduleRef.get(EnvironmentAccountService, { strict: false });
    }
    return this.environmentAccountService!;
  }

  /**
   * Check if the account associated with the session is disabled
   */
  private async isAccountDisabled(session: ISession): Promise<boolean> {
    if (session.accountType === 'tenant_account') {
      const account = await this.getTenantAccountService().getById(session.accountId);
      return account?.disabled ?? false;
    }

    if (session.accountType === 'environment_account') {
      const account = await this.getEnvironmentAccountService().getById(session.accountId);
      return account?.disabled ?? false;
    }

    return false;
  }
}
