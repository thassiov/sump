import { faker } from '@faker-js/faker';
import { environmentAccountSchema } from './environment-account.type';
import {
  createEnvironmentAccountDtoSchema,
  updateEnvironmentAccountNonSensitivePropertiesDtoSchema,
  updateEnvironmentAccountEmailDtoSchema,
  updateEnvironmentAccountPhoneDtoSchema,
  updateEnvironmentAccountUsernameDtoSchema,
  environmentAccountCustomPropertiesOperationDtoSchema,
} from './dto.type';

describe('EnvironmentAccount Schemas', () => {
  const validEnvironmentAccount = {
    id: faker.string.uuid(),
    email: 'test@example.com',
    emailVerified: false,
    phone: '+14155551234',
    phoneVerified: false,
    name: 'John Doe',
    username: 'johndoe',
    avatarUrl: 'https://example.com/avatar.png',
    environmentId: faker.string.uuid(),
    customProperties: { role: 'user' },
    disabled: false,
    disabledAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe('environmentAccountSchema', () => {
    it('should validate a valid environment account', () => {
      const result = environmentAccountSchema.safeParse(validEnvironmentAccount);
      expect(result.success).toBe(true);
    });

    it('should reject invalid uuid for id', () => {
      const result = environmentAccountSchema.safeParse({
        ...validEnvironmentAccount,
        id: 'invalid-uuid',
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid uuid for environmentId', () => {
      const result = environmentAccountSchema.safeParse({
        ...validEnvironmentAccount,
        environmentId: 'invalid-uuid',
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid email', () => {
      const result = environmentAccountSchema.safeParse({
        ...validEnvironmentAccount,
        email: 'not-an-email',
      });
      expect(result.success).toBe(false);
    });

    it('should accept valid email formats', () => {
      const emails = ['user@example.com', 'user.name@domain.co.uk', 'user+tag@example.org'];
      emails.forEach((email) => {
        const result = environmentAccountSchema.safeParse({
          ...validEnvironmentAccount,
          email,
        });
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid phone (non-e164)', () => {
      const result = environmentAccountSchema.safeParse({
        ...validEnvironmentAccount,
        phone: '123-456-7890',
      });
      expect(result.success).toBe(false);
    });

    it('should accept valid e164 phone numbers', () => {
      const phones = ['+14155551234', '+442071234567', '+5511987654321'];
      phones.forEach((phone) => {
        const result = environmentAccountSchema.safeParse({
          ...validEnvironmentAccount,
          phone,
        });
        expect(result.success).toBe(true);
      });
    });

    it('should reject name shorter than 3 characters', () => {
      const result = environmentAccountSchema.safeParse({
        ...validEnvironmentAccount,
        name: 'ab',
      });
      expect(result.success).toBe(false);
    });

    it('should reject name longer than 100 characters', () => {
      const result = environmentAccountSchema.safeParse({
        ...validEnvironmentAccount,
        name: 'a'.repeat(101),
      });
      expect(result.success).toBe(false);
    });

    it('should accept name with exactly 3 characters', () => {
      const result = environmentAccountSchema.safeParse({
        ...validEnvironmentAccount,
        name: 'abc',
      });
      expect(result.success).toBe(true);
    });

    it('should accept name with exactly 100 characters', () => {
      const result = environmentAccountSchema.safeParse({
        ...validEnvironmentAccount,
        name: 'a'.repeat(100),
      });
      expect(result.success).toBe(true);
    });

    it('should reject username shorter than 3 characters', () => {
      const result = environmentAccountSchema.safeParse({
        ...validEnvironmentAccount,
        username: 'ab',
      });
      expect(result.success).toBe(false);
    });

    it('should reject username longer than 20 characters', () => {
      const result = environmentAccountSchema.safeParse({
        ...validEnvironmentAccount,
        username: 'a'.repeat(21),
      });
      expect(result.success).toBe(false);
    });

    it('should accept username with exactly 3 characters', () => {
      const result = environmentAccountSchema.safeParse({
        ...validEnvironmentAccount,
        username: 'abc',
      });
      expect(result.success).toBe(true);
    });

    it('should accept username with exactly 20 characters', () => {
      const result = environmentAccountSchema.safeParse({
        ...validEnvironmentAccount,
        username: 'a'.repeat(20),
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid avatarUrl', () => {
      const result = environmentAccountSchema.safeParse({
        ...validEnvironmentAccount,
        avatarUrl: 'not-a-url',
      });
      expect(result.success).toBe(false);
    });

    it('should accept valid https avatarUrl', () => {
      const result = environmentAccountSchema.safeParse({
        ...validEnvironmentAccount,
        avatarUrl: 'https://example.com/avatar.png',
      });
      expect(result.success).toBe(true);
    });

    it('should accept empty customProperties', () => {
      const result = environmentAccountSchema.safeParse({
        ...validEnvironmentAccount,
        customProperties: {},
      });
      expect(result.success).toBe(true);
    });

    it('should accept complex nested customProperties', () => {
      const result = environmentAccountSchema.safeParse({
        ...validEnvironmentAccount,
        customProperties: {
          preferences: { theme: 'dark', language: 'en' },
          metadata: { lastLogin: '2024-01-01' },
        },
      });
      expect(result.success).toBe(true);
    });

    it('should validate emailVerified as boolean', () => {
      const result = environmentAccountSchema.safeParse({
        ...validEnvironmentAccount,
        emailVerified: 'true', // string instead of boolean
      });
      expect(result.success).toBe(false);
    });

    it('should validate phoneVerified as boolean', () => {
      const result = environmentAccountSchema.safeParse({
        ...validEnvironmentAccount,
        phoneVerified: 1, // number instead of boolean
      });
      expect(result.success).toBe(false);
    });

    it('should reject missing required fields', () => {
      const result = environmentAccountSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe('createEnvironmentAccountDtoSchema', () => {
    const validCreateDto = {
      email: 'test@example.com',
      emailVerified: false,
      phone: '+14155551234',
      phoneVerified: false,
      name: 'John Doe',
      username: 'johndoe',
      avatarUrl: 'https://example.com/avatar.png',
      environmentId: faker.string.uuid(),
      customProperties: {},
    };

    it('should validate a valid create dto', () => {
      const result = createEnvironmentAccountDtoSchema.safeParse(validCreateDto);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const result = createEnvironmentAccountDtoSchema.safeParse({
        ...validCreateDto,
        email: 'invalid',
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid phone', () => {
      const result = createEnvironmentAccountDtoSchema.safeParse({
        ...validCreateDto,
        phone: '123-456-7890',
      });
      expect(result.success).toBe(false);
    });

    it('should reject extra fields (strict object)', () => {
      const result = createEnvironmentAccountDtoSchema.safeParse({
        ...validCreateDto,
        id: faker.string.uuid(), // should not be allowed
      });
      expect(result.success).toBe(false);
    });

    it('should reject missing required fields', () => {
      const result = createEnvironmentAccountDtoSchema.safeParse({
        email: 'test@example.com',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('updateEnvironmentAccountNonSensitivePropertiesDtoSchema', () => {
    it('should validate with name only', () => {
      const result = updateEnvironmentAccountNonSensitivePropertiesDtoSchema.safeParse({
        name: 'Updated Name',
      });
      expect(result.success).toBe(true);
    });

    it('should validate with avatarUrl only', () => {
      const result = updateEnvironmentAccountNonSensitivePropertiesDtoSchema.safeParse({
        avatarUrl: 'https://example.com/new-avatar.png',
      });
      expect(result.success).toBe(true);
    });

    it('should validate with both name and avatarUrl', () => {
      const result = updateEnvironmentAccountNonSensitivePropertiesDtoSchema.safeParse({
        name: 'Updated Name',
        avatarUrl: 'https://example.com/new-avatar.png',
      });
      expect(result.success).toBe(true);
    });

    it('should reject empty object (refine check)', () => {
      const result = updateEnvironmentAccountNonSensitivePropertiesDtoSchema.safeParse({});
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('payload cannot be empty');
      }
    });

    it('should reject extra fields (strict object)', () => {
      const result = updateEnvironmentAccountNonSensitivePropertiesDtoSchema.safeParse({
        name: 'Updated Name',
        email: 'extra@example.com',
      });
      expect(result.success).toBe(false);
    });

    it('should reject name shorter than 3 characters', () => {
      const result = updateEnvironmentAccountNonSensitivePropertiesDtoSchema.safeParse({
        name: 'ab',
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid avatarUrl', () => {
      const result = updateEnvironmentAccountNonSensitivePropertiesDtoSchema.safeParse({
        avatarUrl: 'not-a-url',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('updateEnvironmentAccountEmailDtoSchema', () => {
    it('should validate valid email', () => {
      const result = updateEnvironmentAccountEmailDtoSchema.safeParse({
        email: 'new@example.com',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const result = updateEnvironmentAccountEmailDtoSchema.safeParse({
        email: 'invalid-email',
      });
      expect(result.success).toBe(false);
    });

    it('should reject missing email', () => {
      const result = updateEnvironmentAccountEmailDtoSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it('should reject extra fields (strict object)', () => {
      const result = updateEnvironmentAccountEmailDtoSchema.safeParse({
        email: 'new@example.com',
        name: 'should not be here',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('updateEnvironmentAccountPhoneDtoSchema', () => {
    it('should validate valid e164 phone', () => {
      const result = updateEnvironmentAccountPhoneDtoSchema.safeParse({
        phone: '+14155559999',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid phone format', () => {
      const result = updateEnvironmentAccountPhoneDtoSchema.safeParse({
        phone: '415-555-9999',
      });
      expect(result.success).toBe(false);
    });

    it('should reject missing phone', () => {
      const result = updateEnvironmentAccountPhoneDtoSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it('should reject extra fields (strict object)', () => {
      const result = updateEnvironmentAccountPhoneDtoSchema.safeParse({
        phone: '+14155559999',
        email: 'should not be here',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('updateEnvironmentAccountUsernameDtoSchema', () => {
    it('should validate valid username', () => {
      const result = updateEnvironmentAccountUsernameDtoSchema.safeParse({
        username: 'newusername',
      });
      expect(result.success).toBe(true);
    });

    it('should reject username shorter than 3 characters', () => {
      const result = updateEnvironmentAccountUsernameDtoSchema.safeParse({
        username: 'ab',
      });
      expect(result.success).toBe(false);
    });

    it('should reject username longer than 20 characters', () => {
      const result = updateEnvironmentAccountUsernameDtoSchema.safeParse({
        username: 'a'.repeat(21),
      });
      expect(result.success).toBe(false);
    });

    it('should reject missing username', () => {
      const result = updateEnvironmentAccountUsernameDtoSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it('should reject extra fields (strict object)', () => {
      const result = updateEnvironmentAccountUsernameDtoSchema.safeParse({
        username: 'newusername',
        email: 'should not be here',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('environmentAccountCustomPropertiesOperationDtoSchema', () => {
    it('should validate non-empty custom properties', () => {
      const result = environmentAccountCustomPropertiesOperationDtoSchema.safeParse({
        key: 'value',
      });
      expect(result.success).toBe(true);
    });

    it('should reject empty custom properties (refine check)', () => {
      const result = environmentAccountCustomPropertiesOperationDtoSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it('should accept complex nested properties', () => {
      const result = environmentAccountCustomPropertiesOperationDtoSchema.safeParse({
        preferences: {
          notifications: { email: true, push: false },
          theme: 'dark',
        },
      });
      expect(result.success).toBe(true);
    });

    it('should accept array values', () => {
      const result = environmentAccountCustomPropertiesOperationDtoSchema.safeParse({
        permissions: ['read', 'write', 'delete'],
      });
      expect(result.success).toBe(true);
    });

    it('should accept boolean values', () => {
      const result = environmentAccountCustomPropertiesOperationDtoSchema.safeParse({
        isActive: true,
      });
      expect(result.success).toBe(true);
    });

    it('should accept numeric values', () => {
      const result = environmentAccountCustomPropertiesOperationDtoSchema.safeParse({
        score: 100,
      });
      expect(result.success).toBe(true);
    });

    it('should accept null values', () => {
      const result = environmentAccountCustomPropertiesOperationDtoSchema.safeParse({
        deletedField: null,
      });
      expect(result.success).toBe(true);
    });
  });
});
