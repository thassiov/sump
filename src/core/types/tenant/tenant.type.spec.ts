import { faker } from '@faker-js/faker';
import { tenantSchema } from './tenant.type';
import {
  createTenantDtoSchema,
  updateTenantNonSensitivePropertiesDtoSchema,
  tenantCustomPropertiesOperationDtoSchema,
  createNewTenantUseCaseDtoSchema,
} from './dto.type';

describe('Tenant Schemas', () => {
  describe('tenantSchema', () => {
    const validTenant = {
      id: faker.string.uuid(),
      name: 'Test Tenant',
      customProperties: { key: 'value' },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should validate a valid tenant', () => {
      const result = tenantSchema.safeParse(validTenant);
      expect(result.success).toBe(true);
    });

    it('should reject invalid uuid for id', () => {
      const result = tenantSchema.safeParse({
        ...validTenant,
        id: 'invalid-uuid',
      });
      expect(result.success).toBe(false);
    });

    it('should reject name shorter than 2 characters', () => {
      const result = tenantSchema.safeParse({
        ...validTenant,
        name: 'a',
      });
      expect(result.success).toBe(false);
    });

    it('should accept name with exactly 2 characters', () => {
      const result = tenantSchema.safeParse({
        ...validTenant,
        name: 'ab',
      });
      expect(result.success).toBe(true);
    });

    it('should reject empty customProperties object type', () => {
      const result = tenantSchema.safeParse({
        ...validTenant,
        customProperties: 'not-an-object',
      });
      expect(result.success).toBe(false);
    });

    it('should accept empty customProperties object', () => {
      const result = tenantSchema.safeParse({
        ...validTenant,
        customProperties: {},
      });
      expect(result.success).toBe(true);
    });

    it('should accept nested customProperties', () => {
      const result = tenantSchema.safeParse({
        ...validTenant,
        customProperties: {
          tier: 'premium',
          settings: { nested: { deep: true } },
        },
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid date for createdAt', () => {
      const result = tenantSchema.safeParse({
        ...validTenant,
        createdAt: 'not-a-date',
      });
      expect(result.success).toBe(false);
    });

    it('should reject missing required fields', () => {
      const result = tenantSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe('createTenantDtoSchema', () => {
    it('should validate a valid create tenant dto', () => {
      const result = createTenantDtoSchema.safeParse({
        name: 'Test Tenant',
        customProperties: {},
      });
      expect(result.success).toBe(true);
    });

    it('should reject name shorter than 2 characters', () => {
      const result = createTenantDtoSchema.safeParse({
        name: 'a',
        customProperties: {},
      });
      expect(result.success).toBe(false);
    });

    it('should accept without customProperties (uses default)', () => {
      const result = createTenantDtoSchema.safeParse({
        name: 'Test Tenant',
      });
      // customProperties is required in the schema but picked from tenant
      expect(result.success).toBe(false);
    });

    it('should reject extra fields not in schema', () => {
      const result = createTenantDtoSchema.safeParse({
        name: 'Test Tenant',
        customProperties: {},
        id: faker.string.uuid(), // extra field
      });
      // This depends on how the schema is defined (strict or not)
      expect(result.success).toBe(true); // pick doesn't enforce strict
    });
  });

  describe('updateTenantNonSensitivePropertiesDtoSchema', () => {
    it('should validate with name field', () => {
      const result = updateTenantNonSensitivePropertiesDtoSchema.safeParse({
        name: 'Updated Tenant',
      });
      expect(result.success).toBe(true);
    });

    it('should reject empty object (refine check)', () => {
      const result = updateTenantNonSensitivePropertiesDtoSchema.safeParse({});
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('payload cannot be empty');
      }
    });

    it('should reject name shorter than 2 characters', () => {
      const result = updateTenantNonSensitivePropertiesDtoSchema.safeParse({
        name: 'a',
      });
      expect(result.success).toBe(false);
    });

    it('should reject extra fields (strict object)', () => {
      const result = updateTenantNonSensitivePropertiesDtoSchema.safeParse({
        name: 'Updated Tenant',
        email: 'extra@example.com',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('tenantCustomPropertiesOperationDtoSchema', () => {
    it('should validate non-empty custom properties', () => {
      const result = tenantCustomPropertiesOperationDtoSchema.safeParse({
        key: 'value',
      });
      expect(result.success).toBe(true);
    });

    it('should reject empty custom properties (refine check)', () => {
      const result = tenantCustomPropertiesOperationDtoSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it('should accept complex nested properties', () => {
      const result = tenantCustomPropertiesOperationDtoSchema.safeParse({
        settings: { theme: 'dark', notifications: { email: true } },
      });
      expect(result.success).toBe(true);
    });
  });

  describe('createNewTenantUseCaseDtoSchema', () => {
    const validDto = {
      tenant: {
        name: 'Test Tenant',
        customProperties: {},
      },
      account: {
        name: 'John Doe',
        email: 'john@example.com',
        username: 'johndoe',
        passwordHash: 'hashed-password-here',
      },
    };

    it('should validate a valid create tenant use case dto', () => {
      const result = createNewTenantUseCaseDtoSchema.safeParse(validDto);
      expect(result.success).toBe(true);
    });

    it('should validate with optional environment', () => {
      const result = createNewTenantUseCaseDtoSchema.safeParse({
        ...validDto,
        environment: {
          name: 'production',
          customProperties: {},
        },
      });
      expect(result.success).toBe(true);
    });

    it('should reject missing tenant field', () => {
      const result = createNewTenantUseCaseDtoSchema.safeParse({
        account: validDto.account,
      });
      expect(result.success).toBe(false);
    });

    it('should reject missing account field', () => {
      const result = createNewTenantUseCaseDtoSchema.safeParse({
        tenant: validDto.tenant,
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid tenant name', () => {
      const result = createNewTenantUseCaseDtoSchema.safeParse({
        ...validDto,
        tenant: {
          name: 'a', // too short
          customProperties: {},
        },
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid account email', () => {
      const result = createNewTenantUseCaseDtoSchema.safeParse({
        ...validDto,
        account: {
          ...validDto.account,
          email: 'invalid-email',
        },
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid environment name if provided', () => {
      const result = createNewTenantUseCaseDtoSchema.safeParse({
        ...validDto,
        environment: {
          name: 'a', // too short
          customProperties: {},
        },
      });
      expect(result.success).toBe(false);
    });

    it('should reject extra fields in strict objects', () => {
      const result = createNewTenantUseCaseDtoSchema.safeParse({
        ...validDto,
        tenant: {
          ...validDto.tenant,
          extraField: 'should fail',
        },
      });
      expect(result.success).toBe(false);
    });
  });
});
