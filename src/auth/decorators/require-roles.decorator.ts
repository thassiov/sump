import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * Role requirement specification
 */
export interface RoleRequirement {
  /** The role required (e.g., 'owner', 'admin', 'user') */
  role: 'owner' | 'admin' | 'user';
  /** The target type (optional, if not specified any target matches) */
  target?: 'tenant' | 'environment';
  /** The target ID (optional, can be a route param like ':tenantId') */
  targetId?: string;
}

/**
 * Decorator to specify required roles for a route
 * Use with RolesGuard to enforce role-based access control
 *
 * @example
 * // Require owner role on any tenant
 * @RequireRoles({ role: 'owner', target: 'tenant' })
 *
 * @example
 * // Require owner role on specific tenant from route param
 * @RequireRoles({ role: 'owner', target: 'tenant', targetId: ':tenantId' })
 *
 * @example
 * // Require any of multiple roles
 * @RequireRoles(
 *   { role: 'owner', target: 'tenant', targetId: ':tenantId' },
 *   { role: 'admin', target: 'tenant', targetId: ':tenantId' }
 * )
 */
export const RequireRoles = (...roles: RoleRequirement[]) =>
  SetMetadata(ROLES_KEY, roles);
