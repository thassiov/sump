import { faker } from '@faker-js/faker';
import { environmentSchema } from './environment.type';
import {
  createEnvironmentDtoSchema,
  createEnvironmentNoInternalPropertiesDtoSchema,
  updateEnvironmentNonSensitivePropertiesDtoSchema,
  environmentCustomPropertiesOperationDtoSchema,
} from './dto.type';

describe('Environment Schemas', () => {
  const validEnvironment = {
    id: faker.string.uuid(),
    name: 'production',
    tenantId: faker.string.uuid(),
    customProperties: { feature_flags: { dark_mode: true } },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe('environmentSchema', () => {
    it('should validate a valid environment', () => {
      const result = environmentSchema.safeParse(validEnvironment);
      expect(result.success).toBe(true);
    });

    it('should reject invalid uuid for id', () => {
      const result = environmentSchema.safeParse({
        ...validEnvironment,
        id: 'invalid-uuid',
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid uuid for tenantId', () => {
      const result = environmentSchema.safeParse({
        ...validEnvironment,
        tenantId: 'invalid-uuid',
      });
      expect(result.success).toBe(false);
    });

    it('should reject name shorter than 2 characters', () => {
      const result = environmentSchema.safeParse({
        ...validEnvironment,
        name: 'a',
      });
      expect(result.success).toBe(false);
    });

    it('should accept name with exactly 2 characters', () => {
      const result = environmentSchema.safeParse({
        ...validEnvironment,
        name: 'ab',
      });
      expect(result.success).toBe(true);
    });

    it('should accept long environment names', () => {
      const result = environmentSchema.safeParse({
        ...validEnvironment,
        name: 'production-east-us-2024',
      });
      expect(result.success).toBe(true);
    });

    it('should accept empty customProperties', () => {
      const result = environmentSchema.safeParse({
        ...validEnvironment,
        customProperties: {},
      });
      expect(result.success).toBe(true);
    });

    it('should accept complex nested customProperties', () => {
      const result = environmentSchema.safeParse({
        ...validEnvironment,
        customProperties: {
          settings: {
            database: { host: 'localhost', port: 5432 },
            cache: { enabled: true, ttl: 3600 },
          },
          feature_flags: ['feature1', 'feature2'],
        },
      });
      expect(result.success).toBe(true);
    });

    it('should reject non-object customProperties', () => {
      const result = environmentSchema.safeParse({
        ...validEnvironment,
        customProperties: 'not-an-object',
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid date for createdAt', () => {
      const result = environmentSchema.safeParse({
        ...validEnvironment,
        createdAt: 'not-a-date',
      });
      expect(result.success).toBe(false);
    });

    it('should reject missing required fields', () => {
      const result = environmentSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it('should reject when id is missing', () => {
      const { id, ...withoutId } = validEnvironment;
      const result = environmentSchema.safeParse(withoutId);
      expect(result.success).toBe(false);
    });

    it('should reject when tenantId is missing', () => {
      const { tenantId, ...withoutTenantId } = validEnvironment;
      const result = environmentSchema.safeParse(withoutTenantId);
      expect(result.success).toBe(false);
    });
  });

  describe('createEnvironmentDtoSchema', () => {
    const validCreateDto = {
      name: 'production',
      tenantId: faker.string.uuid(),
      customProperties: {},
    };

    it('should validate a valid create environment dto', () => {
      const result = createEnvironmentDtoSchema.safeParse(validCreateDto);
      expect(result.success).toBe(true);
    });

    it('should validate with custom properties', () => {
      const result = createEnvironmentDtoSchema.safeParse({
        ...validCreateDto,
        customProperties: { tier: 'premium' },
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid tenantId', () => {
      const result = createEnvironmentDtoSchema.safeParse({
        ...validCreateDto,
        tenantId: 'invalid-uuid',
      });
      expect(result.success).toBe(false);
    });

    it('should reject name shorter than 2 characters', () => {
      const result = createEnvironmentDtoSchema.safeParse({
        ...validCreateDto,
        name: 'a',
      });
      expect(result.success).toBe(false);
    });

    it('should reject missing name', () => {
      const { name, ...withoutName } = validCreateDto;
      const result = createEnvironmentDtoSchema.safeParse(withoutName);
      expect(result.success).toBe(false);
    });

    it('should reject missing tenantId', () => {
      const { tenantId, ...withoutTenantId } = validCreateDto;
      const result = createEnvironmentDtoSchema.safeParse(withoutTenantId);
      expect(result.success).toBe(false);
    });
  });

  describe('createEnvironmentNoInternalPropertiesDtoSchema', () => {
    it('should validate without tenantId', () => {
      const result = createEnvironmentNoInternalPropertiesDtoSchema.safeParse({
        name: 'production',
        customProperties: {},
      });
      expect(result.success).toBe(true);
    });

    it('should reject extra fields (strict object)', () => {
      const result = createEnvironmentNoInternalPropertiesDtoSchema.safeParse({
        name: 'production',
        customProperties: {},
        tenantId: faker.string.uuid(), // should not be allowed
      });
      expect(result.success).toBe(false);
    });

    it('should reject name shorter than 2 characters', () => {
      const result = createEnvironmentNoInternalPropertiesDtoSchema.safeParse({
        name: 'a',
        customProperties: {},
      });
      expect(result.success).toBe(false);
    });

    it('should accept missing customProperties (optional)', () => {
      const result = createEnvironmentNoInternalPropertiesDtoSchema.safeParse({
        name: 'production',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('updateEnvironmentNonSensitivePropertiesDtoSchema', () => {
    it('should validate with name field', () => {
      const result = updateEnvironmentNonSensitivePropertiesDtoSchema.safeParse({
        name: 'staging',
      });
      expect(result.success).toBe(true);
    });

    it('should reject empty object (refine check)', () => {
      const result = updateEnvironmentNonSensitivePropertiesDtoSchema.safeParse({});
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('payload cannot be empty');
      }
    });

    it('should reject name shorter than 2 characters', () => {
      const result = updateEnvironmentNonSensitivePropertiesDtoSchema.safeParse({
        name: 'a',
      });
      expect(result.success).toBe(false);
    });

    it('should reject extra fields (strict object)', () => {
      const result = updateEnvironmentNonSensitivePropertiesDtoSchema.safeParse({
        name: 'staging',
        tenantId: faker.string.uuid(),
      });
      expect(result.success).toBe(false);
    });

    it('should accept long environment names', () => {
      const result = updateEnvironmentNonSensitivePropertiesDtoSchema.safeParse({
        name: 'production-east-us-region-2024',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('environmentCustomPropertiesOperationDtoSchema', () => {
    it('should validate non-empty custom properties', () => {
      const result = environmentCustomPropertiesOperationDtoSchema.safeParse({
        key: 'value',
      });
      expect(result.success).toBe(true);
    });

    it('should reject empty custom properties (refine check)', () => {
      const result = environmentCustomPropertiesOperationDtoSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it('should accept complex nested properties', () => {
      const result = environmentCustomPropertiesOperationDtoSchema.safeParse({
        database: {
          host: 'localhost',
          port: 5432,
          credentials: { user: 'admin' },
        },
      });
      expect(result.success).toBe(true);
    });

    it('should accept array values', () => {
      const result = environmentCustomPropertiesOperationDtoSchema.safeParse({
        features: ['feature1', 'feature2', 'feature3'],
      });
      expect(result.success).toBe(true);
    });

    it('should accept boolean values', () => {
      const result = environmentCustomPropertiesOperationDtoSchema.safeParse({
        enabled: true,
      });
      expect(result.success).toBe(true);
    });

    it('should accept numeric values', () => {
      const result = environmentCustomPropertiesOperationDtoSchema.safeParse({
        maxConnections: 100,
      });
      expect(result.success).toBe(true);
    });
  });
});
