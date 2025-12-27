import { faker } from '@faker-js/faker';
import { EnvironmentAccountService } from './environment-account.service';
import { EnvironmentAccountRepository } from '../repositories/environment-account.repository';
import { ValidationError, UnexpectedError } from '../../lib/errors';

describe('EnvironmentAccountService', () => {
  let environmentAccountService: EnvironmentAccountService;
  let mockEnvironmentAccountRepository: jest.Mocked<EnvironmentAccountRepository>;

  beforeEach(() => {
    mockEnvironmentAccountRepository = {
      create: jest.fn(),
      getById: jest.fn(),
      getByIdAndTenantEnvironmentId: jest.fn(),
      updateByIdAndTenantEnvironmentId: jest.fn(),
      deleteById: jest.fn(),
      deleteByIdAndTenantEnvironmentId: jest.fn(),
      setCustomPropertyByIdAndTenantEnvironmentId: jest.fn(),
      deleteCustomPropertyByIdAndTenantEnvironmentId: jest.fn(),
    } as unknown as jest.Mocked<EnvironmentAccountRepository>;

    environmentAccountService = new EnvironmentAccountService(
      mockEnvironmentAccountRepository
    );
  });

  const createMockAccount = (overrides = {}) => ({
    id: faker.string.uuid(),
    environmentId: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    username: faker.internet.username(),
    phone: faker.phone.number(),
    avatarUrl: faker.internet.url(),
    customProperties: {},
    ...overrides,
  });

  describe('create', () => {
    it('should create an environment account successfully', async () => {
      const environmentId = faker.string.uuid();
      const accountId = faker.string.uuid();
      const dto = {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        username: faker.internet.username(),
        customProperties: {},
      };

      mockEnvironmentAccountRepository.create.mockResolvedValue(accountId);

      const result = await environmentAccountService.create(environmentId, dto);

      expect(result).toBe(accountId);
      expect(mockEnvironmentAccountRepository.create).toHaveBeenCalledWith(
        {
          ...dto,
          phoneVerified: false,
          emailVerified: false,
          environmentId,
        },
        undefined
      );
    });

    it('should pass transaction to repository', async () => {
      const environmentId = faker.string.uuid();
      const accountId = faker.string.uuid();
      const dto = {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        customProperties: {},
      };
      const mockTransaction = {} as any;

      mockEnvironmentAccountRepository.create.mockResolvedValue(accountId);

      await environmentAccountService.create(
        environmentId,
        dto,
        mockTransaction
      );

      expect(mockEnvironmentAccountRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ environmentId }),
        mockTransaction
      );
    });

    it('should wrap repository errors in UnexpectedError', async () => {
      const environmentId = faker.string.uuid();
      const dto = {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        customProperties: {},
      };

      mockEnvironmentAccountRepository.create.mockRejectedValue(
        new Error('Database error')
      );

      await expect(
        environmentAccountService.create(environmentId, dto)
      ).rejects.toThrow(UnexpectedError);
    });
  });

  describe('getById', () => {
    it('should return account when found', async () => {
      const account = createMockAccount();
      mockEnvironmentAccountRepository.getById.mockResolvedValue(account);

      const result = await environmentAccountService.getById(account.id);

      expect(result).toEqual(account);
      expect(mockEnvironmentAccountRepository.getById).toHaveBeenCalledWith(
        account.id
      );
    });

    it('should return undefined when account not found', async () => {
      const accountId = faker.string.uuid();
      mockEnvironmentAccountRepository.getById.mockResolvedValue(undefined);

      const result = await environmentAccountService.getById(accountId);

      expect(result).toBeUndefined();
    });
  });

  describe('getByIdAndTenantEnvironmentId', () => {
    it('should return account when found', async () => {
      const account = createMockAccount();
      mockEnvironmentAccountRepository.getByIdAndTenantEnvironmentId.mockResolvedValue(
        account
      );

      const result = await environmentAccountService.getByIdAndTenantEnvironmentId(
        account.id,
        account.environmentId
      );

      expect(result).toEqual(account);
      expect(
        mockEnvironmentAccountRepository.getByIdAndTenantEnvironmentId
      ).toHaveBeenCalledWith(account.id, account.environmentId);
    });

    it('should return undefined when account not found', async () => {
      const accountId = faker.string.uuid();
      const environmentId = faker.string.uuid();

      mockEnvironmentAccountRepository.getByIdAndTenantEnvironmentId.mockResolvedValue(
        undefined
      );

      const result = await environmentAccountService.getByIdAndTenantEnvironmentId(
        accountId,
        environmentId
      );

      expect(result).toBeUndefined();
    });
  });

  describe('deleteById', () => {
    it('should delete account successfully', async () => {
      const accountId = faker.string.uuid();
      mockEnvironmentAccountRepository.deleteById.mockResolvedValue(true);

      const result = await environmentAccountService.deleteById(accountId);

      expect(result).toBe(true);
      expect(mockEnvironmentAccountRepository.deleteById).toHaveBeenCalledWith(
        accountId
      );
    });

    it('should throw ValidationError for invalid id', async () => {
      await expect(
        environmentAccountService.deleteById('invalid-id')
      ).rejects.toThrow(ValidationError);
      expect(mockEnvironmentAccountRepository.deleteById).not.toHaveBeenCalled();
    });
  });

  describe('deleteByIdAndTenantEnvironmentId', () => {
    it('should delete account by id and environment id', async () => {
      const accountId = faker.string.uuid();
      const environmentId = faker.string.uuid();
      mockEnvironmentAccountRepository.deleteByIdAndTenantEnvironmentId.mockResolvedValue(
        true
      );

      const result =
        await environmentAccountService.deleteByIdAndTenantEnvironmentId(
          accountId,
          environmentId
        );

      expect(result).toBe(true);
      expect(
        mockEnvironmentAccountRepository.deleteByIdAndTenantEnvironmentId
      ).toHaveBeenCalledWith(accountId, environmentId);
    });
  });

  describe('updateNonSensitivePropertiesByIdAndTenantEnvironmentId', () => {
    it('should update name successfully', async () => {
      const accountId = faker.string.uuid();
      const environmentId = faker.string.uuid();
      const dto = { name: faker.person.fullName() };

      mockEnvironmentAccountRepository.updateByIdAndTenantEnvironmentId.mockResolvedValue(
        true
      );

      const result =
        await environmentAccountService.updateNonSensitivePropertiesByIdAndTenantEnvironmentId(
          accountId,
          environmentId,
          dto
        );

      expect(result).toBe(true);
      expect(
        mockEnvironmentAccountRepository.updateByIdAndTenantEnvironmentId
      ).toHaveBeenCalledWith(accountId, environmentId, dto);
    });

    it('should update avatarUrl successfully', async () => {
      const accountId = faker.string.uuid();
      const environmentId = faker.string.uuid();
      const dto = { avatarUrl: faker.internet.url() };

      mockEnvironmentAccountRepository.updateByIdAndTenantEnvironmentId.mockResolvedValue(
        true
      );

      const result =
        await environmentAccountService.updateNonSensitivePropertiesByIdAndTenantEnvironmentId(
          accountId,
          environmentId,
          dto
        );

      expect(result).toBe(true);
    });
  });

  describe('updateEmailByIdAndTenantEnvironmentId', () => {
    it('should update email successfully', async () => {
      const accountId = faker.string.uuid();
      const environmentId = faker.string.uuid();
      const dto = { email: faker.internet.email() };

      mockEnvironmentAccountRepository.updateByIdAndTenantEnvironmentId.mockResolvedValue(
        true
      );

      const result =
        await environmentAccountService.updateEmailByIdAndTenantEnvironmentId(
          accountId,
          environmentId,
          dto
        );

      expect(result).toBe(true);
      expect(
        mockEnvironmentAccountRepository.updateByIdAndTenantEnvironmentId
      ).toHaveBeenCalledWith(accountId, environmentId, dto);
    });
  });

  describe('updateUsernameByIdAndTenantEnvironmentId', () => {
    it('should update username successfully', async () => {
      const accountId = faker.string.uuid();
      const environmentId = faker.string.uuid();
      const dto = { username: faker.internet.username() };

      mockEnvironmentAccountRepository.updateByIdAndTenantEnvironmentId.mockResolvedValue(
        true
      );

      const result =
        await environmentAccountService.updateUsernameByIdAndTenantEnvironmentId(
          accountId,
          environmentId,
          dto
        );

      expect(result).toBe(true);
      expect(
        mockEnvironmentAccountRepository.updateByIdAndTenantEnvironmentId
      ).toHaveBeenCalledWith(accountId, environmentId, dto);
    });
  });

  describe('updatePhoneByIdAndTenantEnvironmentId', () => {
    it('should update phone successfully', async () => {
      const accountId = faker.string.uuid();
      const environmentId = faker.string.uuid();
      const dto = { phone: faker.phone.number() };

      mockEnvironmentAccountRepository.updateByIdAndTenantEnvironmentId.mockResolvedValue(
        true
      );

      const result =
        await environmentAccountService.updatePhoneByIdAndTenantEnvironmentId(
          accountId,
          environmentId,
          dto
        );

      expect(result).toBe(true);
      expect(
        mockEnvironmentAccountRepository.updateByIdAndTenantEnvironmentId
      ).toHaveBeenCalledWith(accountId, environmentId, dto);
    });
  });

  describe('setCustomPropertyByIdAndTenantEnvironmentId', () => {
    it('should set custom property successfully', async () => {
      const accountId = faker.string.uuid();
      const environmentId = faker.string.uuid();
      const customProperties = { myKey: 'myValue' };

      mockEnvironmentAccountRepository.setCustomPropertyByIdAndTenantEnvironmentId.mockResolvedValue(
        true
      );

      const result =
        await environmentAccountService.setCustomPropertyByIdAndTenantEnvironmentId(
          accountId,
          environmentId,
          customProperties
        );

      expect(result).toBe(true);
      expect(
        mockEnvironmentAccountRepository.setCustomPropertyByIdAndTenantEnvironmentId
      ).toHaveBeenCalledWith(accountId, environmentId, customProperties);
    });

    it('should allow setting properties with complex values', async () => {
      const accountId = faker.string.uuid();
      const environmentId = faker.string.uuid();
      const customProperties = { config: { nested: true, count: 5 } };

      mockEnvironmentAccountRepository.setCustomPropertyByIdAndTenantEnvironmentId.mockResolvedValue(
        true
      );

      const result =
        await environmentAccountService.setCustomPropertyByIdAndTenantEnvironmentId(
          accountId,
          environmentId,
          customProperties
        );

      expect(result).toBe(true);
    });
  });

  describe('deleteCustomPropertyByIdAndTenantEnvironmentId', () => {
    it('should delete custom property successfully', async () => {
      const accountId = faker.string.uuid();
      const environmentId = faker.string.uuid();
      const propertyKey = 'myKey';

      mockEnvironmentAccountRepository.deleteCustomPropertyByIdAndTenantEnvironmentId.mockResolvedValue(
        true
      );

      const result =
        await environmentAccountService.deleteCustomPropertyByIdAndTenantEnvironmentId(
          accountId,
          environmentId,
          propertyKey
        );

      expect(result).toBe(true);
      expect(
        mockEnvironmentAccountRepository.deleteCustomPropertyByIdAndTenantEnvironmentId
      ).toHaveBeenCalledWith(accountId, environmentId, propertyKey);
    });

    it('should handle property keys with special characters', async () => {
      const accountId = faker.string.uuid();
      const environmentId = faker.string.uuid();
      const propertyKey = 'my-special_key.name';

      mockEnvironmentAccountRepository.deleteCustomPropertyByIdAndTenantEnvironmentId.mockResolvedValue(
        true
      );

      const result =
        await environmentAccountService.deleteCustomPropertyByIdAndTenantEnvironmentId(
          accountId,
          environmentId,
          propertyKey
        );

      expect(result).toBe(true);
    });
  });
});
