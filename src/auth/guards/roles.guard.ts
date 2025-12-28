import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TenantAccountService } from '../../core/services/tenant-account.service';
import { EnvironmentAccountService } from '../../core/services/environment-account.service';
import { ROLES_KEY, RoleRequirement } from '../decorators/require-roles.decorator';
import { ALLOW_OWNER_KEY, AllowOwnerOptions } from '../decorators/allow-owner.decorator';
import {
  TENANT_RESOURCE_KEY,
  ENVIRONMENT_RESOURCE_KEY,
  SELF_ONLY_KEY,
  ResourceContext,
} from '../decorators/resource-context.decorator';
import { RequestWithSession } from './auth.guard';

/**
 * Guard that checks if the authenticated account has the required roles
 * or is the owner of the resource (when @AllowOwner is used).
 * Must be used after AuthGuard to ensure session is available.
 *
 * Access is granted if ANY of these conditions are met:
 * 1. No @RequireRoles decorator is present (and no @AllowOwner)
 * 2. Account has one of the required roles
 * 3. @AllowOwner is present and the account owns the resource
 *
 * @example
 * @UseGuards(AuthGuard, RolesGuard)
 * @RequireRoles({ role: 'owner', target: 'tenant' })
 * @Delete(':id')
 * deleteTenant() {}
 *
 * @example
 * // Allow admins OR the account owner
 * @UseGuards(AuthGuard, RolesGuard)
 * @RequireRoles({ role: 'admin', target: 'tenant', targetId: ':tenantId' })
 * @AllowOwner()
 * @Patch(':accountId')
 * updateAccount() {}
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly tenantAccountService: TenantAccountService,
    private readonly environmentAccountService: EnvironmentAccountService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Get required roles from decorator metadata
    const requiredRoles = this.reflector.getAllAndOverride<RoleRequirement[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()]
    );

    // Get @AllowOwner options if present
    const allowOwnerOptions = this.reflector.getAllAndOverride<AllowOwnerOptions | undefined>(
      ALLOW_OWNER_KEY,
      [context.getHandler(), context.getClass()]
    );

    // Get resource context decorators
    const tenantResource = this.reflector.getAllAndOverride<ResourceContext | undefined>(
      TENANT_RESOURCE_KEY,
      [context.getHandler(), context.getClass()]
    );

    const environmentResource = this.reflector.getAllAndOverride<ResourceContext | undefined>(
      ENVIRONMENT_RESOURCE_KEY,
      [context.getHandler(), context.getClass()]
    );

    const selfOnly = this.reflector.getAllAndOverride<ResourceContext | undefined>(
      SELF_ONLY_KEY,
      [context.getHandler(), context.getClass()]
    );

    // No roles required and no owner/self decorators - allow access
    if (
      (!requiredRoles || requiredRoles.length === 0) &&
      !allowOwnerOptions &&
      !selfOnly
    ) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithSession>();
    const session = request.session;

    if (!session) {
      throw new ForbiddenException('No session found - AuthGuard must be applied first');
    }

    // Check @SelfOnly first - allows access if user is accessing their own resource
    if (selfOnly) {
      const isSelf = this.checkSelfAccess(session.accountId, selfOnly, request.params);
      if (isSelf) {
        return true;
      }
    }

    // Check if @AllowOwner applies (account is owner of the resource)
    if (allowOwnerOptions) {
      const isOwner = this.checkOwnership(session.accountId, allowOwnerOptions, request.params);
      if (isOwner) {
        return true;
      }
    }

    // If no roles required but @AllowOwner/@SelfOnly didn't match, deny access
    if (!requiredRoles || requiredRoles.length === 0) {
      throw new ForbiddenException('You can only access your own resources');
    }

    // Get account with roles
    const account = await this.getAccountWithRoles(
      session.accountType,
      session.accountId
    );

    if (!account || !account.roles) {
      throw new ForbiddenException('Account not found or has no roles');
    }

    // Check if account has any of the required roles
    const hasRole = this.checkRoles(account.roles, requiredRoles, request.params);

    if (!hasRole) {
      throw new ForbiddenException('Insufficient permissions');
    }

    // Validate resource context - ensure the role applies to the correct resource
    if (tenantResource || environmentResource) {
      const contextValid = this.validateResourceContext(
        account.roles,
        requiredRoles,
        request.params,
        tenantResource,
        environmentResource
      );
      if (!contextValid) {
        throw new ForbiddenException('Access denied for this resource');
      }
    }

    return true;
  }

  /**
   * Check if the current account is accessing their own resource
   */
  private checkSelfAccess(
    accountId: string,
    selfOnlyContext: ResourceContext,
    params: Record<string, string>
  ): boolean {
    const resourceAccountId = params[selfOnlyContext.paramName];
    return resourceAccountId === accountId;
  }

  /**
   * Check if the current account is the owner of the resource
   */
  private checkOwnership(
    accountId: string,
    options: AllowOwnerOptions,
    params: Record<string, string>
  ): boolean {
    const ownerIdParam = options.ownerIdParam ?? 'accountId';
    const resourceOwnerId = params[ownerIdParam];
    return resourceOwnerId === accountId;
  }

  /**
   * Get account with roles based on account type
   * Note: Environment accounts currently don't have roles - they get empty array
   */
  private async getAccountWithRoles(
    accountType: 'tenant_account' | 'environment_account',
    accountId: string
  ): Promise<{ roles: Array<{ role: string; target: string; targetId: string }> } | undefined> {
    if (accountType === 'tenant_account') {
      return this.tenantAccountService.getById(accountId);
    } else {
      // Environment accounts don't have roles currently
      // Return empty roles array - they can't pass role checks
      const account = await this.environmentAccountService.getById(accountId);
      if (!account) return undefined;
      return { roles: [] };
    }
  }

  /**
   * Check if account roles satisfy the required roles
   */
  private checkRoles(
    accountRoles: Array<{ role: string; target: string; targetId: string }>,
    requiredRoles: RoleRequirement[],
    params: Record<string, string>
  ): boolean {
    return requiredRoles.some((required) => {
      return accountRoles.some((accountRole) => {
        // Check role matches
        if (accountRole.role !== required.role) {
          return false;
        }

        // Check target matches (if specified)
        if (required.target && accountRole.target !== required.target) {
          return false;
        }

        // Check targetId matches (if specified)
        if (required.targetId) {
          // Support dynamic targetId from route params (e.g., ':tenantId')
          const targetId = required.targetId.startsWith(':')
            ? params[required.targetId.slice(1)]
            : required.targetId;

          if (accountRole.targetId !== targetId) {
            return false;
          }
        }

        return true;
      });
    });
  }

  /**
   * Validate that the user's roles apply to the resource being accessed.
   * This prevents cross-tenant/cross-environment access even if a user has
   * the right role type but for a different resource.
   */
  private validateResourceContext(
    accountRoles: Array<{ role: string; target: string; targetId: string }>,
    requiredRoles: RoleRequirement[],
    params: Record<string, string>,
    tenantResource: ResourceContext | undefined,
    environmentResource: ResourceContext | undefined
  ): boolean {
    // Get the resource ID from route params
    let resourceId: string | undefined;
    let resourceType: 'tenant' | 'environment' | undefined;

    if (tenantResource) {
      resourceId = params[tenantResource.paramName];
      resourceType = 'tenant';
    } else if (environmentResource) {
      resourceId = params[environmentResource.paramName];
      resourceType = 'environment';
    }

    // If no resource context decorator, skip validation
    if (!resourceId || !resourceType) {
      return true;
    }

    // Check if any of the matched roles apply to this specific resource
    return requiredRoles.some((required) => {
      return accountRoles.some((accountRole) => {
        // Role type must match
        if (accountRole.role !== required.role) {
          return false;
        }

        // Target type must match the resource type
        if (accountRole.target !== resourceType) {
          return false;
        }

        // Target ID must match the resource ID
        if (accountRole.targetId !== resourceId) {
          return false;
        }

        return true;
      });
    });
  }
}
