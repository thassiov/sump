import { faker } from '@faker-js/faker';
import { tenantAccountSchema, tenantAccountRoleSchema } from './tenant-account.type';
import {
  createTenantAccountDtoSchema,
  tenantAccountUserDefinedIdentificationSchema,
  updateTenantAccountNonSensitivePropertiesDtoSchema,
  updateTenantAccountEmailDtoSchema,
  updateTenantAccountPhoneDtoSchema,
  updateTenantAccountUsernameDtoSchema,
} from './dto.type';

describe('TenantAccount Schemas', () => {
  const validRole = {
    role: 'owner' as const,
    target: 'tenant' as const,
    targetId: faker.string.uuid(),
  };

  const validTenantAccount = {
    id: faker.string.uuid(),
    email: 'test@example.com',
    emailVerified: false,
    phone: '+14155551234',
    phoneVerified: false,
    name: 'John Doe',
    username: 'johndoe',
    avatarUrl: 'https://example.com/avatar.png',
    tenantId: faker.string.uuid(),
    roles: [validRole],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe('tenantAccountRoleSchema', () => {
    it('should validate a valid role', () => {
      const result = tenantAccountRoleSchema.safeParse(validRole);
      expect(result.success).toBe(true);
    });

    it('should accept owner role', () => {
      const result = tenantAccountRoleSchema.safeParse({
        ...validRole,
        role: 'owner',
      });
      expect(result.success).toBe(true);
    });

    it('should accept admin role', () => {
      const result = tenantAccountRoleSchema.safeParse({
        ...validRole,
        role: 'admin',
      });
      expect(result.success).toBe(true);
    });

    it('should accept user role', () => {
      const result = tenantAccountRoleSchema.safeParse({
        ...validRole,
        role: 'user',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid role', () => {
      const result = tenantAccountRoleSchema.safeParse({
        ...validRole,
        role: 'superadmin',
      });
      expect(result.success).toBe(false);
    });

    it('should accept tenant target', () => {
      const result = tenantAccountRoleSchema.safeParse({
        ...validRole,
        target: 'tenant',
      });
      expect(result.success).toBe(true);
    });

    it('should accept environment target', () => {
      const result = tenantAccountRoleSchema.safeParse({
        ...validRole,
        target: 'environment',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid target', () => {
      const result = tenantAccountRoleSchema.safeParse({
        ...validRole,
        target: 'organization',
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid targetId', () => {
      const result = tenantAccountRoleSchema.safeParse({
        ...validRole,
        targetId: 'not-a-uuid',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('tenantAccountSchema', () => {
    it('should validate a valid tenant account', () => {
      const result = tenantAccountSchema.safeParse(validTenantAccount);
      expect(result.success).toBe(true);
    });

    it('should reject invalid uuid for id', () => {
      const result = tenantAccountSchema.safeParse({
        ...validTenantAccount,
        id: 'invalid-uuid',
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid email', () => {
      const result = tenantAccountSchema.safeParse({
        ...validTenantAccount,
        email: 'not-an-email',
      });
      expect(result.success).toBe(false);
    });

    it('should accept valid email formats', () => {
      const emails = ['user@example.com', 'user.name@domain.co.uk', 'user+tag@example.org'];
      emails.forEach((email) => {
        const result = tenantAccountSchema.safeParse({
          ...validTenantAccount,
          email,
        });
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid phone (non-e164)', () => {
      const result = tenantAccountSchema.safeParse({
        ...validTenantAccount,
        phone: '123-456-7890', // not e164 format
      });
      expect(result.success).toBe(false);
    });

    it('should accept valid e164 phone numbers', () => {
      const phones = ['+14155551234', '+442071234567', '+5511987654321'];
      phones.forEach((phone) => {
        const result = tenantAccountSchema.safeParse({
          ...validTenantAccount,
          phone,
        });
        expect(result.success).toBe(true);
      });
    });

    it('should accept undefined phone (optional)', () => {
      const accountWithoutPhone = { ...validTenantAccount };
      delete (accountWithoutPhone as any).phone;
      const result = tenantAccountSchema.safeParse(accountWithoutPhone);
      expect(result.success).toBe(true);
    });

    it('should reject name shorter than 3 characters', () => {
      const result = tenantAccountSchema.safeParse({
        ...validTenantAccount,
        name: 'ab',
      });
      expect(result.success).toBe(false);
    });

    it('should reject name longer than 100 characters', () => {
      const result = tenantAccountSchema.safeParse({
        ...validTenantAccount,
        name: 'a'.repeat(101),
      });
      expect(result.success).toBe(false);
    });

    it('should accept name with exactly 3 characters', () => {
      const result = tenantAccountSchema.safeParse({
        ...validTenantAccount,
        name: 'abc',
      });
      expect(result.success).toBe(true);
    });

    it('should accept name with exactly 100 characters', () => {
      const result = tenantAccountSchema.safeParse({
        ...validTenantAccount,
        name: 'a'.repeat(100),
      });
      expect(result.success).toBe(true);
    });

    it('should reject username shorter than 3 characters', () => {
      const result = tenantAccountSchema.safeParse({
        ...validTenantAccount,
        username: 'ab',
      });
      expect(result.success).toBe(false);
    });

    it('should reject username longer than 20 characters', () => {
      const result = tenantAccountSchema.safeParse({
        ...validTenantAccount,
        username: 'a'.repeat(21),
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid avatarUrl', () => {
      const result = tenantAccountSchema.safeParse({
        ...validTenantAccount,
        avatarUrl: 'not-a-url',
      });
      expect(result.success).toBe(false);
    });

    it('should accept undefined avatarUrl (optional)', () => {
      const accountWithoutAvatar = { ...validTenantAccount };
      delete (accountWithoutAvatar as any).avatarUrl;
      const result = tenantAccountSchema.safeParse(accountWithoutAvatar);
      expect(result.success).toBe(true);
    });

    it('should accept valid https avatarUrl', () => {
      const result = tenantAccountSchema.safeParse({
        ...validTenantAccount,
        avatarUrl: 'https://example.com/avatar.png',
      });
      expect(result.success).toBe(true);
    });

    it('should reject empty roles array', () => {
      const result = tenantAccountSchema.safeParse({
        ...validTenantAccount,
        roles: [],
      });
      expect(result.success).toBe(false);
    });

    it('should reject roles array with more than 1 item', () => {
      const result = tenantAccountSchema.safeParse({
        ...validTenantAccount,
        roles: [validRole, { ...validRole, role: 'admin' }],
      });
      expect(result.success).toBe(false);
    });

    it('should accept roles array with exactly 1 item', () => {
      const result = tenantAccountSchema.safeParse({
        ...validTenantAccount,
        roles: [validRole],
      });
      expect(result.success).toBe(true);
    });
  });

  describe('createTenantAccountDtoSchema', () => {
    const validCreateDto = {
      email: 'test@example.com',
      name: 'John Doe',
      username: 'johndoe',
    };

    it('should validate a minimal create dto', () => {
      const result = createTenantAccountDtoSchema.safeParse(validCreateDto);
      expect(result.success).toBe(true);
    });

    it('should validate with optional fields', () => {
      const result = createTenantAccountDtoSchema.safeParse({
        ...validCreateDto,
        phone: '+14155551234',
        avatarUrl: 'https://example.com/avatar.png',
        roles: [validRole],
        tenantId: faker.string.uuid(),
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const result = createTenantAccountDtoSchema.safeParse({
        ...validCreateDto,
        email: 'invalid',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('tenantAccountUserDefinedIdentificationSchema', () => {
    it('should validate with email only', () => {
      const result = tenantAccountUserDefinedIdentificationSchema.safeParse({
        email: 'test@example.com',
      });
      expect(result.success).toBe(true);
    });

    it('should validate with phone only', () => {
      const result = tenantAccountUserDefinedIdentificationSchema.safeParse({
        phone: '+14155551234',
      });
      expect(result.success).toBe(true);
    });

    it('should validate with username only', () => {
      const result = tenantAccountUserDefinedIdentificationSchema.safeParse({
        username: 'johndoe',
      });
      expect(result.success).toBe(true);
    });

    it('should validate with multiple identifications', () => {
      const result = tenantAccountUserDefinedIdentificationSchema.safeParse({
        email: 'test@example.com',
        phone: '+14155551234',
      });
      expect(result.success).toBe(true);
    });

    it('should reject empty object', () => {
      const result = tenantAccountUserDefinedIdentificationSchema.safeParse({});
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((i) => i.message === 'payload cannot be empty')).toBe(true);
      }
    });

    it('should reject undefined values', () => {
      const result = tenantAccountUserDefinedIdentificationSchema.safeParse({
        email: undefined,
        phone: '+14155551234',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('updateTenantAccountNonSensitivePropertiesDtoSchema', () => {
    it('should validate with name only', () => {
      const result = updateTenantAccountNonSensitivePropertiesDtoSchema.safeParse({
        name: 'Updated Name',
      });
      expect(result.success).toBe(true);
    });

    it('should validate with avatarUrl only', () => {
      const result = updateTenantAccountNonSensitivePropertiesDtoSchema.safeParse({
        avatarUrl: 'https://example.com/new-avatar.png',
      });
      expect(result.success).toBe(true);
    });

    it('should validate with both name and avatarUrl', () => {
      const result = updateTenantAccountNonSensitivePropertiesDtoSchema.safeParse({
        name: 'Updated Name',
        avatarUrl: 'https://example.com/new-avatar.png',
      });
      expect(result.success).toBe(true);
    });

    it('should reject empty object', () => {
      const result = updateTenantAccountNonSensitivePropertiesDtoSchema.safeParse({});
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('payload cannot be empty');
      }
    });

    it('should reject extra fields (strict object)', () => {
      const result = updateTenantAccountNonSensitivePropertiesDtoSchema.safeParse({
        name: 'Updated Name',
        email: 'extra@example.com',
      });
      expect(result.success).toBe(false);
    });

    it('should reject name shorter than 3 characters', () => {
      const result = updateTenantAccountNonSensitivePropertiesDtoSchema.safeParse({
        name: 'ab',
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid avatarUrl', () => {
      const result = updateTenantAccountNonSensitivePropertiesDtoSchema.safeParse({
        avatarUrl: 'not-a-url',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('updateTenantAccountEmailDtoSchema', () => {
    it('should validate valid email', () => {
      const result = updateTenantAccountEmailDtoSchema.safeParse({
        email: 'new@example.com',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const result = updateTenantAccountEmailDtoSchema.safeParse({
        email: 'invalid-email',
      });
      expect(result.success).toBe(false);
    });

    it('should reject missing email', () => {
      const result = updateTenantAccountEmailDtoSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe('updateTenantAccountPhoneDtoSchema', () => {
    it('should validate valid e164 phone', () => {
      const result = updateTenantAccountPhoneDtoSchema.safeParse({
        phone: '+14155559999',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid phone format', () => {
      const result = updateTenantAccountPhoneDtoSchema.safeParse({
        phone: '415-555-9999',
      });
      expect(result.success).toBe(false);
    });

    it('should reject missing phone', () => {
      const result = updateTenantAccountPhoneDtoSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe('updateTenantAccountUsernameDtoSchema', () => {
    it('should validate valid username', () => {
      const result = updateTenantAccountUsernameDtoSchema.safeParse({
        username: 'newusername',
      });
      expect(result.success).toBe(true);
    });

    it('should reject username shorter than 3 characters', () => {
      const result = updateTenantAccountUsernameDtoSchema.safeParse({
        username: 'ab',
      });
      expect(result.success).toBe(false);
    });

    it('should reject username longer than 20 characters', () => {
      const result = updateTenantAccountUsernameDtoSchema.safeParse({
        username: 'a'.repeat(21),
      });
      expect(result.success).toBe(false);
    });

    it('should reject missing username', () => {
      const result = updateTenantAccountUsernameDtoSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });
});
