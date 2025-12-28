import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
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
  constructor(
    private readonly authService: AuthService,
    private readonly tenantAccountService: TenantAccountService,
    private readonly environmentAccountService: EnvironmentAccountService
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
   * Check if the account associated with the session is disabled
   */
  private async isAccountDisabled(session: ISession): Promise<boolean> {
    if (session.accountType === 'tenant_account') {
      const account = await this.tenantAccountService.getById(session.accountId);
      return account?.disabled ?? false;
    }

    if (session.accountType === 'environment_account') {
      const account = await this.environmentAccountService.getById(session.accountId);
      return account?.disabled ?? false;
    }

    return false;
  }
}
