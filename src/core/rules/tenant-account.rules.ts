/**
 * Tenant Account Business Rules
 *
 * This file contains the business logic rules for tenant account operations.
 * These rules define authorization hierarchies and constraints for account management.
 */

import { ITenantAccountRoleType } from '../types/tenant-account/tenant-account.type';

/**
 * Role Hierarchy
 *
 * Defines the power level of each role. Higher number = more authority.
 * - owner: Can manage all accounts (admins and users)
 * - admin: Can manage users only
 * - user: Cannot manage other accounts
 */
const ROLE_HIERARCHY: Record<ITenantAccountRoleType, number> = {
  owner: 3,
  admin: 2,
  user: 1,
} as const;

/**
 * Disable/Enable Rules
 *
 * An actor can disable/enable a target account if:
 * 1. The actor's role has higher authority than the target's role
 * 2. The actor cannot disable themselves
 *
 * Examples:
 * - owner CAN disable admin (3 > 2)
 * - owner CAN disable user (3 > 1)
 * - admin CAN disable user (2 > 1)
 * - admin CANNOT disable owner (2 < 3)
 * - admin CANNOT disable admin (2 = 2, same level)
 * - user CANNOT disable anyone (lowest level)
 */

type CanDisableAccountParams = {
  actorRole: ITenantAccountRoleType;
  actorAccountId: string;
  targetRole: ITenantAccountRoleType;
  targetAccountId: string;
};

type CanDisableAccountResult = {
  allowed: boolean;
  reason?: string;
};

/**
 * Checks if an actor can disable a target account based on role hierarchy.
 */
function canDisableAccount(params: CanDisableAccountParams): CanDisableAccountResult {
  const { actorRole, actorAccountId, targetRole, targetAccountId } = params;

  // Cannot disable yourself
  if (actorAccountId === targetAccountId) {
    return {
      allowed: false,
      reason: 'Cannot disable your own account',
    };
  }

  const actorPower = ROLE_HIERARCHY[actorRole];
  const targetPower = ROLE_HIERARCHY[targetRole];

  // Actor must have higher authority than target
  if (actorPower <= targetPower) {
    return {
      allowed: false,
      reason: `Role '${actorRole}' cannot disable role '${targetRole}'`,
    };
  }

  return { allowed: true };
}

/**
 * Checks if an actor can enable a target account.
 * Uses the same rules as disable - if you can disable, you can enable.
 */
function canEnableAccount(params: CanDisableAccountParams): CanDisableAccountResult {
  const { actorRole, actorAccountId, targetRole, targetAccountId } = params;

  // Cannot enable yourself (though this is unlikely to happen)
  if (actorAccountId === targetAccountId) {
    return {
      allowed: false,
      reason: 'Cannot enable your own account',
    };
  }

  const actorPower = ROLE_HIERARCHY[actorRole];
  const targetPower = ROLE_HIERARCHY[targetRole];

  // Actor must have higher authority than target
  if (actorPower <= targetPower) {
    return {
      allowed: false,
      reason: `Role '${actorRole}' cannot enable role '${targetRole}'`,
    };
  }

  return { allowed: true };
}

/**
 * Gets all roles that an actor can manage (disable/enable).
 * Useful for UI display or validation.
 */
function getManageableRoles(actorRole: ITenantAccountRoleType): ITenantAccountRoleType[] {
  const actorPower = ROLE_HIERARCHY[actorRole];
  const manageableRoles: ITenantAccountRoleType[] = [];

  for (const [role, power] of Object.entries(ROLE_HIERARCHY)) {
    if (power < actorPower) {
      manageableRoles.push(role as ITenantAccountRoleType);
    }
  }

  return manageableRoles;
}

/**
 * Checks if a role has authority over another role.
 */
function hasAuthorityOver(
  actorRole: ITenantAccountRoleType,
  targetRole: ITenantAccountRoleType
): boolean {
  return ROLE_HIERARCHY[actorRole] > ROLE_HIERARCHY[targetRole];
}

export {
  ROLE_HIERARCHY,
  canDisableAccount,
  canEnableAccount,
  getManageableRoles,
  hasAuthorityOver,
};

export type { CanDisableAccountParams, CanDisableAccountResult };
