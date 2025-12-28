import { SetMetadata } from '@nestjs/common';

/**
 * Metadata key for tenant resource context
 */
export const TENANT_RESOURCE_KEY = 'tenantResource';

/**
 * Metadata key for environment resource context
 */
export const ENVIRONMENT_RESOURCE_KEY = 'environmentResource';

/**
 * Metadata key for self-only access restriction
 */
export const SELF_ONLY_KEY = 'selfOnly';

/**
 * Resource context configuration
 */
export interface ResourceContext {
  /** Route parameter name that contains the resource ID (e.g., 'tenantId') */
  paramName: string;
}

/**
 * Marks a route as operating on a tenant resource.
 * The RolesGuard will validate that the authenticated user's role
 * applies to the specific tenant identified by the route parameter.
 *
 * @param paramName - The route parameter containing the tenant ID (default: 'tenantId')
 *
 * @example
 * // Route: GET /tenants/:tenantId
 * @TenantResource('tenantId')
 * @UseGuards(AuthGuard, RolesGuard)
 * @RequireRoles({ role: 'user', target: 'tenant', targetId: ':tenantId' })
 * getTenant(@Param('tenantId') tenantId: string) {}
 */
export const TenantResource = (paramName: string = 'tenantId') =>
  SetMetadata(TENANT_RESOURCE_KEY, { paramName } as ResourceContext);

/**
 * Marks a route as operating on an environment resource.
 * The RolesGuard will validate that the authenticated user's role
 * applies to the specific environment identified by the route parameter.
 *
 * @param paramName - The route parameter containing the environment ID (default: 'environmentId')
 *
 * @example
 * // Route: GET /environments/:environmentId
 * @EnvironmentResource('environmentId')
 * @UseGuards(AuthGuard, RolesGuard)
 * @RequireRoles({ role: 'user', target: 'environment', targetId: ':environmentId' })
 * getEnvironment(@Param('environmentId') environmentId: string) {}
 */
export const EnvironmentResource = (paramName: string = 'environmentId') =>
  SetMetadata(ENVIRONMENT_RESOURCE_KEY, { paramName } as ResourceContext);

/**
 * Marks a route as allowing only self-access.
 * The RolesGuard will validate that the authenticated user is accessing
 * their own resource (e.g., their own account).
 *
 * @param paramName - The route parameter containing the account ID (default: 'accountId')
 *
 * @example
 * // Route: GET /accounts/:accountId
 * @SelfOnly('accountId')
 * @UseGuards(AuthGuard, RolesGuard)
 * getMyAccount(@Param('accountId') accountId: string) {}
 *
 * @example
 * // Combined with role-based access (either self OR admin/owner can access)
 * @SelfOnly('accountId')
 * @UseGuards(AuthGuard, RolesGuard)
 * @RequireRoles(
 *   { role: 'admin', target: 'tenant', targetId: ':tenantId' },
 *   { role: 'owner', target: 'tenant', targetId: ':tenantId' }
 * )
 * getAccount(@Param('accountId') accountId: string) {}
 */
export const SelfOnly = (paramName: string = 'accountId') =>
  SetMetadata(SELF_ONLY_KEY, { paramName } as ResourceContext);
