import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestWithSession } from '../guards/auth.guard';

/**
 * Data returned by @CurrentAccount decorator
 */
export interface CurrentAccountData {
  id: string;
  type: 'tenant_account' | 'environment_account';
  contextType: 'tenant' | 'environment';
  contextId: string;
}

/**
 * Parameter decorator to inject the current account info into a route handler
 * Requires AuthGuard to be applied to the route
 *
 * @example
 * @UseGuards(AuthGuard)
 * @Get('profile')
 * getProfile(@CurrentAccount() account: CurrentAccountData) {
 *   return { accountId: account.id, type: account.type };
 * }
 *
 * @example
 * // Get specific property
 * @Get('profile')
 * getProfile(@CurrentAccount('id') accountId: string) {
 *   return { accountId };
 * }
 */
export const CurrentAccount = createParamDecorator(
  (data: keyof CurrentAccountData | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithSession>();
    const session = request.session;

    if (!session) {
      return undefined;
    }

    const account: CurrentAccountData = {
      id: session.accountId,
      type: session.accountType,
      contextType: session.contextType,
      contextId: session.contextId,
    };

    return data ? account[data] : account;
  }
);
