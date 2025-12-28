import { SetMetadata } from '@nestjs/common';

export const ALLOW_OWNER_KEY = 'allow_owner';

export interface AllowOwnerOptions {
  /**
   * The route parameter name that contains the resource owner's ID.
   * Defaults to 'accountId'.
   */
  ownerIdParam?: string;
}

/**
 * Decorator that allows access if the authenticated account owns the resource.
 * This is useful for self-service operations (updating own profile) or ownership
 * patterns (managing own posts, addresses, etc.).
 *
 * Must be used with AuthGuard. Works alongside @RequireRoles - access is granted if either:
 * 1. The account has one of the required roles, OR
 * 2. The resource owner ID in the route matches the session's accountId
 *
 * @example
 * // Allow the account owner to update their own account
 * @UseGuards(AuthGuard, RolesGuard)
 * @AllowOwner()
 * @Patch(':accountId')
 * updateAccount() {}
 *
 * @example
 * // Allow admins OR the account owner
 * @UseGuards(AuthGuard, RolesGuard)
 * @RequireRoles({ role: 'admin', target: 'tenant', targetId: ':tenantId' })
 * @AllowOwner()
 * @Patch(':accountId')
 * updateAccount() {}
 *
 * @example
 * // With custom param name (e.g., for posts owned by a user)
 * @AllowOwner({ ownerIdParam: 'authorId' })
 * @Patch('posts/:postId')
 * updatePost() {}
 */
export const AllowOwner = (options: AllowOwnerOptions = {}) =>
  SetMetadata(ALLOW_OWNER_KEY, {
    ownerIdParam: options.ownerIdParam ?? 'accountId',
  });
