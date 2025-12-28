import { faker } from '@faker-js/faker';
import { EnvironmentAccountUseCase } from './environment-account.use-case';
import { EnvironmentAccountService } from '../services/environment-account.service';
import { ValidationError } from '../../lib/errors';

describe('EnvironmentAccountUseCase', () => {
  let environmentAccountUseCase: EnvironmentAccountUseCase;
  let mockEnvironmentAccountService: jest.Mocked<EnvironmentAccountService>;

  beforeEach(() => {
    mockEnvironmentAccountService = {
      create: jest.fn(),
      getByIdAndTenantEnvironmentId: jest.fn(),
      deleteByIdAndTenantEnvironmentId: jest.fn(),
      updateNonSensitivePropertiesByIdAndTenantEnvironmentId: jest.fn(),
      updateEmailByIdAndTenantEnvironmentId: jest.fn(),
      updatePhoneByIdAndTenantEnvironmentId: jest.fn(),
      updateUsernameByIdAndTenantEnvironmentId: jest.fn(),
      setCustomPropertyByIdAndTenantEnvironmentId: jest.fn(),
      deleteCustomPropertyByIdAndTenantEnvironmentId: jest.fn(),
    } as unknown as jest.Mocked<EnvironmentAccountService>;

    environmentAccountUseCase = new EnvironmentAccountUseCase(
      mockEnvironmentAccountService
    );
  });

  const createMockAccount = (overrides = {}) => ({
    id: faker.string.uuid(),
    environmentId: faker.string.uuid(),
    name: 'John Doe',
    email: 'john@example.com',
    emailVerified: false,
    phone: '+14155551234',
    phoneVerified: false,
    username: 'johndoe',
    avatarUrl: 'https://example.com/avatar.png',
    customProperties: {},
    ...overrides,
  });

  // Valid DTO for creating accounts (matches the strict schema)
  // Note: environmentId, emailVerified, phoneVerified are omitted from the schema
  const createValidDto = () => ({
    email: 'john@example.com',
    phone: '+14155551234',
    name: 'John Doe',
    username: 'johndoe',
    avatarUrl: 'https://example.com/avatar.png',
    customProperties: {},
  });

  describe('createNewAccount', () => {
    it('should create an account successfully', async () => {
      const environmentId = faker.string.uuid();
      const accountId = faker.string.uuid();
      const dto = createValidDto();

      mockEnvironmentAccountService.create.mockResolvedValue(accountId);

      const result = await environmentAccountUseCase.createNewAccount(
        environmentId,
        dto
      );

      expect(result).toBe(accountId);
      expect(mockEnvironmentAccountService.create).toHaveBeenCalledWith(
        environmentId,
        dto
      );
    });

    it('should throw ValidationError for invalid environment id', async () => {
      const dto = createValidDto();

      await expect(
        environmentAccountUseCase.createNewAccount('invalid-id', dto)
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid dto', async () => {
      const environmentId = faker.string.uuid();
      const invalidDto = {
        name: 'ab', // name must be min 3 chars
      };

      await expect(
        environmentAccountUseCase.createNewAccount(environmentId, invalidDto as any)
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('getAccountByIdAndTenantEnvironmentId', () => {
    it('should return account when found', async () => {
      const account = createMockAccount();
      mockEnvironmentAccountService.getByIdAndTenantEnvironmentId.mockResolvedValue(
        account
      );

      const result =
        await environmentAccountUseCase.getAccountByIdAndTenantEnvironmentId(
          account.id,
          account.environmentId
        );

      expect(result).toEqual(account);
      expect(
        mockEnvironmentAccountService.getByIdAndTenantEnvironmentId
      ).toHaveBeenCalledWith(account.id, account.environmentId);
    });

    it('should return undefined when account not found', async () => {
      const accountId = faker.string.uuid();
      const environmentId = faker.string.uuid();

      mockEnvironmentAccountService.getByIdAndTenantEnvironmentId.mockResolvedValue(
        undefined
      );

      const result =
        await environmentAccountUseCase.getAccountByIdAndTenantEnvironmentId(
          accountId,
          environmentId
        );

      expect(result).toBeUndefined();
    });

    it('should throw ValidationError for invalid account id', async () => {
      const environmentId = faker.string.uuid();

      await expect(
        environmentAccountUseCase.getAccountByIdAndTenantEnvironmentId(
          'invalid-id',
          environmentId
        )
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid environment id', async () => {
      const accountId = faker.string.uuid();

      await expect(
        environmentAccountUseCase.getAccountByIdAndTenantEnvironmentId(
          accountId,
          'invalid-id'
        )
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('deleteAccountByIdAndTenantEnvironmentId', () => {
    it('should delete account successfully', async () => {
      const accountId = faker.string.uuid();
      const environmentId = faker.string.uuid();

      mockEnvironmentAccountService.deleteByIdAndTenantEnvironmentId.mockResolvedValue(
        true
      );

      const result =
        await environmentAccountUseCase.deleteAccountByIdAndTenantEnvironmentId(
          accountId,
          environmentId
        );

      expect(result).toBe(true);
      expect(
        mockEnvironmentAccountService.deleteByIdAndTenantEnvironmentId
      ).toHaveBeenCalledWith(accountId, environmentId);
    });

    it('should throw ValidationError for invalid account id', async () => {
      const environmentId = faker.string.uuid();

      await expect(
        environmentAccountUseCase.deleteAccountByIdAndTenantEnvironmentId(
          'invalid-id',
          environmentId
        )
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid environment id', async () => {
      const accountId = faker.string.uuid();

      await expect(
        environmentAccountUseCase.deleteAccountByIdAndTenantEnvironmentId(
          accountId,
          'invalid-id'
        )
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('updateAccountNonSensitivePropertiesByIdAndTenantEnvironmentId', () => {
    it('should update name successfully', async () => {
      const accountId = faker.string.uuid();
      const environmentId = faker.string.uuid();
      const dto = { name: 'Jane Doe' };

      mockEnvironmentAccountService.updateNonSensitivePropertiesByIdAndTenantEnvironmentId.mockResolvedValue(
        true
      );

      const result =
        await environmentAccountUseCase.updateAccountNonSensitivePropertiesByIdAndTenantEnvironmentId(
          accountId,
          environmentId,
          dto
        );

      expect(result).toBe(true);
      expect(
        mockEnvironmentAccountService.updateNonSensitivePropertiesByIdAndTenantEnvironmentId
      ).toHaveBeenCalledWith(accountId, environmentId, dto);
    });

    it('should throw ValidationError for invalid account id', async () => {
      const environmentId = faker.string.uuid();
      const dto = { name: 'Jane Doe' };

      await expect(
        environmentAccountUseCase.updateAccountNonSensitivePropertiesByIdAndTenantEnvironmentId(
          'invalid-id',
          environmentId,
          dto
        )
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid environment id', async () => {
      const accountId = faker.string.uuid();
      const dto = { name: 'Jane Doe' };

      await expect(
        environmentAccountUseCase.updateAccountNonSensitivePropertiesByIdAndTenantEnvironmentId(
          accountId,
          'invalid-id',
          dto
        )
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for empty dto', async () => {
      const accountId = faker.string.uuid();
      const environmentId = faker.string.uuid();

      await expect(
        environmentAccountUseCase.updateAccountNonSensitivePropertiesByIdAndTenantEnvironmentId(
          accountId,
          environmentId,
          {} as any
        )
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('updateAccountEmailByIdAndTenantEnvironmentId', () => {
    it('should update email successfully', async () => {
      const accountId = faker.string.uuid();
      const environmentId = faker.string.uuid();
      const dto = { email: 'jane@example.com' };

      mockEnvironmentAccountService.updateEmailByIdAndTenantEnvironmentId.mockResolvedValue(
        true
      );

      const result =
        await environmentAccountUseCase.updateAccountEmailByIdAndTenantEnvironmentId(
          accountId,
          environmentId,
          dto
        );

      expect(result).toBe(true);
      expect(
        mockEnvironmentAccountService.updateEmailByIdAndTenantEnvironmentId
      ).toHaveBeenCalledWith(accountId, environmentId, dto);
    });

    it('should throw ValidationError for invalid account id', async () => {
      const environmentId = faker.string.uuid();
      const dto = { email: 'jane@example.com' };

      await expect(
        environmentAccountUseCase.updateAccountEmailByIdAndTenantEnvironmentId(
          'invalid-id',
          environmentId,
          dto
        )
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid environment id', async () => {
      const accountId = faker.string.uuid();
      const dto = { email: 'jane@example.com' };

      await expect(
        environmentAccountUseCase.updateAccountEmailByIdAndTenantEnvironmentId(
          accountId,
          'invalid-id',
          dto
        )
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('updateAccountPhoneByIdAndTenantEnvironmentId', () => {
    it('should update phone successfully', async () => {
      const accountId = faker.string.uuid();
      const environmentId = faker.string.uuid();
      const dto = { phone: '+14155559999' };

      mockEnvironmentAccountService.updatePhoneByIdAndTenantEnvironmentId.mockResolvedValue(
        true
      );

      const result =
        await environmentAccountUseCase.updateAccountPhoneByIdAndTenantEnvironmentId(
          accountId,
          environmentId,
          dto
        );

      expect(result).toBe(true);
      expect(
        mockEnvironmentAccountService.updatePhoneByIdAndTenantEnvironmentId
      ).toHaveBeenCalledWith(accountId, environmentId, dto);
    });

    it('should throw ValidationError for invalid account id', async () => {
      const environmentId = faker.string.uuid();
      const dto = { phone: '+14155559999' };

      await expect(
        environmentAccountUseCase.updateAccountPhoneByIdAndTenantEnvironmentId(
          'invalid-id',
          environmentId,
          dto
        )
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid environment id', async () => {
      const accountId = faker.string.uuid();
      const dto = { phone: '+14155559999' };

      await expect(
        environmentAccountUseCase.updateAccountPhoneByIdAndTenantEnvironmentId(
          accountId,
          'invalid-id',
          dto
        )
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('updateAccountUsernameByIdAndTenantEnvironmentId', () => {
    it('should update username successfully', async () => {
      const accountId = faker.string.uuid();
      const environmentId = faker.string.uuid();
      const dto = { username: 'janedoe' };

      mockEnvironmentAccountService.updateUsernameByIdAndTenantEnvironmentId.mockResolvedValue(
        true
      );

      const result =
        await environmentAccountUseCase.updateAccountUsernameByIdAndTenantEnvironmentId(
          accountId,
          environmentId,
          dto
        );

      expect(result).toBe(true);
      expect(
        mockEnvironmentAccountService.updateUsernameByIdAndTenantEnvironmentId
      ).toHaveBeenCalledWith(accountId, environmentId, dto);
    });

    it('should throw ValidationError for invalid account id', async () => {
      const environmentId = faker.string.uuid();
      const dto = { username: 'janedoe' };

      await expect(
        environmentAccountUseCase.updateAccountUsernameByIdAndTenantEnvironmentId(
          'invalid-id',
          environmentId,
          dto
        )
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid environment id', async () => {
      const accountId = faker.string.uuid();
      const dto = { username: 'janedoe' };

      await expect(
        environmentAccountUseCase.updateAccountUsernameByIdAndTenantEnvironmentId(
          accountId,
          'invalid-id',
          dto
        )
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('setAccountCustomPropertyByIdAndTenantEnvironmentId', () => {
    it('should set custom property successfully', async () => {
      const accountId = faker.string.uuid();
      const environmentId = faker.string.uuid();
      const customProperties = { myKey: 'myValue' };

      mockEnvironmentAccountService.setCustomPropertyByIdAndTenantEnvironmentId.mockResolvedValue(
        true
      );

      const result =
        await environmentAccountUseCase.setAccountCustomPropertyByIdAndTenantEnvironmentId(
          accountId,
          environmentId,
          customProperties
        );

      expect(result).toBe(true);
      expect(
        mockEnvironmentAccountService.setCustomPropertyByIdAndTenantEnvironmentId
      ).toHaveBeenCalledWith(accountId, environmentId, customProperties);
    });

    it('should throw ValidationError for invalid account id', async () => {
      const environmentId = faker.string.uuid();

      await expect(
        environmentAccountUseCase.setAccountCustomPropertyByIdAndTenantEnvironmentId(
          'invalid-id',
          environmentId,
          { key: 'value' }
        )
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid environment id', async () => {
      const accountId = faker.string.uuid();

      await expect(
        environmentAccountUseCase.setAccountCustomPropertyByIdAndTenantEnvironmentId(
          accountId,
          'invalid-id',
          { key: 'value' }
        )
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for empty custom properties', async () => {
      const accountId = faker.string.uuid();
      const environmentId = faker.string.uuid();

      await expect(
        environmentAccountUseCase.setAccountCustomPropertyByIdAndTenantEnvironmentId(
          accountId,
          environmentId,
          {}
        )
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('deleteAccountCustomPropertyByIdAndTenantEnvironmentId', () => {
    it('should delete custom property successfully', async () => {
      const accountId = faker.string.uuid();
      const environmentId = faker.string.uuid();
      const propertyKey = 'myKey';

      mockEnvironmentAccountService.deleteCustomPropertyByIdAndTenantEnvironmentId.mockResolvedValue(
        true
      );

      const result =
        await environmentAccountUseCase.deleteAccountCustomPropertyByIdAndTenantEnvironmentId(
          accountId,
          environmentId,
          propertyKey
        );

      expect(result).toBe(true);
      expect(
        mockEnvironmentAccountService.deleteCustomPropertyByIdAndTenantEnvironmentId
      ).toHaveBeenCalledWith(accountId, environmentId, propertyKey);
    });

    it('should throw ValidationError for invalid account id', async () => {
      const environmentId = faker.string.uuid();

      await expect(
        environmentAccountUseCase.deleteAccountCustomPropertyByIdAndTenantEnvironmentId(
          'invalid-id',
          environmentId,
          'key'
        )
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid environment id', async () => {
      const accountId = faker.string.uuid();

      await expect(
        environmentAccountUseCase.deleteAccountCustomPropertyByIdAndTenantEnvironmentId(
          accountId,
          'invalid-id',
          'key'
        )
      ).rejects.toThrow(ValidationError);
    });

    it('should handle property keys with special characters', async () => {
      const accountId = faker.string.uuid();
      const environmentId = faker.string.uuid();
      const propertyKey = 'my-special_key.name';

      mockEnvironmentAccountService.deleteCustomPropertyByIdAndTenantEnvironmentId.mockResolvedValue(
        true
      );

      const result =
        await environmentAccountUseCase.deleteAccountCustomPropertyByIdAndTenantEnvironmentId(
          accountId,
          environmentId,
          propertyKey
        );

      expect(result).toBe(true);
    });
  });
});
