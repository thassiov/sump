import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestWithSession } from '../guards/auth.guard';

/**
 * Parameter decorator to inject the current session into a route handler
 * Requires AuthGuard to be applied to the route
 *
 * @example
 * @UseGuards(AuthGuard)
 * @Get('profile')
 * getProfile(@CurrentSession() session: ISession) {
 *   return { accountId: session.accountId };
 * }
 */
export const CurrentSession = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithSession>();
    return request.session;
  }
);
