import { faker } from '@faker-js/faker';
import { EnvironmentAccountRepository } from './environment-account.repository';
import { NotExpectedError, NotFoundError, UnexpectedError, ConflictError } from '../../lib/errors';
import { DatabaseError } from 'pg';

describe('EnvironmentAccountRepository', () => {
  let environmentAccountRepository: EnvironmentAccountRepository;
  let mockDbClient: any;

  beforeEach(() => {
    mockDbClient = jest.fn();
    mockDbClient.insert = jest.fn();

    environmentAccountRepository = new EnvironmentAccountRepository(mockDbClient);
  });

  const createMockAccount = (overrides = {}) => ({
    id: faker.string.uuid(),
    environmentId: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    emailVerified: false,
    username: faker.internet.username(),
    phone: faker.phone.number(),
    phoneVerified: false,
    avatarUrl: faker.internet.url(),
    customProperties: {},
    ...overrides,
  });

  describe('create', () => {
    it('should create an account and return the id', async () => {
      const accountId = faker.string.uuid();
      const environmentId = faker.string.uuid();
      const dto = {
        environmentId,
        name: 'Test Account',
        email: 'test@example.com',
        emailVerified: false,
        username: 'testuser',
        phone: '+14155551234',
        phoneVerified: false,
        avatarUrl: 'https://example.com/avatar.png',
        customProperties: {},
      };

      const mockBuilder = {
        into: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([{ id: accountId }]),
      };
      mockDbClient.insert.mockReturnValue(mockBuilder);

      const result = await environmentAccountRepository.create(dto);

      expect(result).toBe(accountId);
      expect(mockDbClient.insert).toHaveBeenCalledWith(dto);
      expect(mockBuilder.into).toHaveBeenCalledWith('environment_account');
      expect(mockBuilder.returning).toHaveBeenCalledWith('id');
    });

    it('should use transaction when provided', async () => {
      const accountId = faker.string.uuid();
      const environmentId = faker.string.uuid();
      const dto = {
        environmentId,
        name: 'Test Account',
        email: 'test@example.com',
        emailVerified: false,
        username: 'testuser',
        phone: '+14155551234',
        phoneVerified: false,
        avatarUrl: 'https://example.com/avatar.png',
        customProperties: {},
      };
      const mockTransaction = {} as any;

      const mockQueryResult = {
        then: (resolve: (value: { id: string }[]) => void) => resolve([{ id: accountId }]),
        transacting: jest.fn(),
      };
      const mockBuilder = {
        into: jest.fn().mockReturnThis(),
        returning: jest.fn().mockReturnValue(mockQueryResult),
      };
      mockDbClient.insert.mockReturnValue(mockBuilder);

      await environmentAccountRepository.create(dto, mockTransaction);

      expect(mockQueryResult.transacting).toHaveBeenCalledWith(mockTransaction);
    });

    it('should throw NotExpectedError when insert returns no result', async () => {
      const environmentId = faker.string.uuid();
      const dto = {
        environmentId,
        name: 'Test Account',
        email: 'test@example.com',
        emailVerified: false,
        username: 'testuser',
        phone: '+14155551234',
        phoneVerified: false,
        avatarUrl: 'https://example.com/avatar.png',
        customProperties: {},
      };

      const mockBuilder = {
        into: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([]),
      };
      mockDbClient.insert.mockReturnValue(mockBuilder);

      await expect(environmentAccountRepository.create(dto)).rejects.toThrow(NotExpectedError);
    });

    it('should throw ConflictError when user identification already exists', async () => {
      const environmentId = faker.string.uuid();
      const dto = {
        environmentId,
        name: 'Test Account',
        email: 'test@example.com',
        emailVerified: false,
        username: 'testuser',
        phone: '+14155551234',
        phoneVerified: false,
        avatarUrl: 'https://example.com/avatar.png',
        customProperties: {},
      };

      const dbError = new DatabaseError('duplicate key', 1, 'error');
      dbError.detail = 'Key (email)=(test@example.com) already exists.';

      const mockBuilder = {
        into: jest.fn().mockReturnThis(),
        returning: jest.fn().mockRejectedValue(dbError),
      };
      mockDbClient.insert.mockReturnValue(mockBuilder);

      await expect(environmentAccountRepository.create(dto)).rejects.toThrow(ConflictError);
    });

    it('should throw UnexpectedError on database error', async () => {
      const environmentId = faker.string.uuid();
      const dto = {
        environmentId,
        name: 'Test Account',
        email: 'test@example.com',
        emailVerified: false,
        username: 'testuser',
        phone: '+14155551234',
        phoneVerified: false,
        avatarUrl: 'https://example.com/avatar.png',
        customProperties: {},
      };

      const mockBuilder = {
        into: jest.fn().mockReturnThis(),
        returning: jest.fn().mockRejectedValue(new Error('Database error')),
      };
      mockDbClient.insert.mockReturnValue(mockBuilder);

      await expect(environmentAccountRepository.create(dto)).rejects.toThrow(UnexpectedError);
    });

    it('should rethrow custom errors as-is', async () => {
      const environmentId = faker.string.uuid();
      const dto = {
        environmentId,
        name: 'Test Account',
        email: 'test@example.com',
        emailVerified: false,
        username: 'testuser',
        phone: '+14155551234',
        phoneVerified: false,
        avatarUrl: 'https://example.com/avatar.png',
        customProperties: {},
      };
      const customError = new NotFoundError({ context: 'TEST' });

      const mockBuilder = {
        into: jest.fn().mockReturnThis(),
        returning: jest.fn().mockRejectedValue(customError),
      };
      mockDbClient.insert.mockReturnValue(mockBuilder);

      await expect(environmentAccountRepository.create(dto)).rejects.toThrow(NotFoundError);
    });
  });

  describe('getById', () => {
    it('should return account when found', async () => {
      const account = createMockAccount();

      const mockBuilder = {
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(account),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      const result = await environmentAccountRepository.getById(account.id);

      expect(result).toEqual(account);
      expect(mockDbClient).toHaveBeenCalledWith('environment_account');
      expect(mockBuilder.where).toHaveBeenCalledWith('id', account.id);
    });

    it('should return undefined when account not found', async () => {
      const accountId = faker.string.uuid();

      const mockBuilder = {
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(undefined),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      const result = await environmentAccountRepository.getById(accountId);

      expect(result).toBeUndefined();
    });

    it('should throw UnexpectedError on database error', async () => {
      const accountId = faker.string.uuid();

      const mockBuilder = {
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockRejectedValue(new Error('Database error')),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      await expect(environmentAccountRepository.getById(accountId)).rejects.toThrow(UnexpectedError);
    });
  });

  describe('getByIdAndTenantEnvironmentId', () => {
    it('should return account when found', async () => {
      const account = createMockAccount();

      const mockBuilder = {
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(account),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      const result = await environmentAccountRepository.getByIdAndTenantEnvironmentId(
        account.id,
        account.environmentId
      );

      expect(result).toEqual(account);
      expect(mockDbClient).toHaveBeenCalledWith('environment_account');
      expect(mockBuilder.where).toHaveBeenCalledWith({ id: account.id, environmentId: account.environmentId });
    });

    it('should return undefined when account not found', async () => {
      const accountId = faker.string.uuid();
      const environmentId = faker.string.uuid();

      const mockBuilder = {
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(undefined),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      const result = await environmentAccountRepository.getByIdAndTenantEnvironmentId(accountId, environmentId);

      expect(result).toBeUndefined();
    });

    it('should throw UnexpectedError on database error', async () => {
      const accountId = faker.string.uuid();
      const environmentId = faker.string.uuid();

      const mockBuilder = {
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockRejectedValue(new Error('Database error')),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      await expect(
        environmentAccountRepository.getByIdAndTenantEnvironmentId(accountId, environmentId)
      ).rejects.toThrow(UnexpectedError);
    });
  });

  describe('updateByIdAndTenantEnvironmentId', () => {
    it('should update account and return true', async () => {
      const accountId = faker.string.uuid();
      const environmentId = faker.string.uuid();
      const dto = { name: 'Updated Name' };

      const mockBuilder = {
        where: jest.fn().mockReturnValue({
          update: jest.fn().mockResolvedValue(1),
        }),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      const result = await environmentAccountRepository.updateByIdAndTenantEnvironmentId(
        accountId,
        environmentId,
        dto
      );

      expect(result).toBe(true);
      expect(mockDbClient).toHaveBeenCalledWith('environment_account');
      expect(mockBuilder.where).toHaveBeenCalledWith({ id: accountId, environmentId });
    });

    it('should throw NotFoundError when account not found', async () => {
      const accountId = faker.string.uuid();
      const environmentId = faker.string.uuid();
      const dto = { name: 'Updated Name' };

      const mockBuilder = {
        where: jest.fn().mockReturnValue({
          update: jest.fn().mockResolvedValue(0),
        }),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      await expect(
        environmentAccountRepository.updateByIdAndTenantEnvironmentId(accountId, environmentId, dto)
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw UnexpectedError on database error', async () => {
      const accountId = faker.string.uuid();
      const environmentId = faker.string.uuid();
      const dto = { name: 'Updated Name' };

      const mockBuilder = {
        where: jest.fn().mockReturnValue({
          update: jest.fn().mockRejectedValue(new Error('Database error')),
        }),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      await expect(
        environmentAccountRepository.updateByIdAndTenantEnvironmentId(accountId, environmentId, dto)
      ).rejects.toThrow(UnexpectedError);
    });

    it('should rethrow custom errors as-is', async () => {
      const accountId = faker.string.uuid();
      const environmentId = faker.string.uuid();
      const dto = { name: 'Updated Name' };
      const customError = new NotFoundError({ context: 'TEST' });

      const mockBuilder = {
        where: jest.fn().mockReturnValue({
          update: jest.fn().mockRejectedValue(customError),
        }),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      await expect(
        environmentAccountRepository.updateByIdAndTenantEnvironmentId(accountId, environmentId, dto)
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('deleteById', () => {
    it('should delete account and return true', async () => {
      const accountId = faker.string.uuid();

      const mockBuilder = {
        where: jest.fn().mockReturnValue({
          del: jest.fn().mockResolvedValue(1),
        }),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      const result = await environmentAccountRepository.deleteById(accountId);

      expect(result).toBe(true);
      expect(mockDbClient).toHaveBeenCalledWith('environment_account');
      expect(mockBuilder.where).toHaveBeenCalledWith('id', accountId);
    });

    it('should throw NotFoundError when account not found', async () => {
      const accountId = faker.string.uuid();

      const mockBuilder = {
        where: jest.fn().mockReturnValue({
          del: jest.fn().mockResolvedValue(0),
        }),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      await expect(environmentAccountRepository.deleteById(accountId)).rejects.toThrow(NotFoundError);
    });

    it('should throw UnexpectedError on database error', async () => {
      const accountId = faker.string.uuid();

      const mockBuilder = {
        where: jest.fn().mockReturnValue({
          del: jest.fn().mockRejectedValue(new Error('Database error')),
        }),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      await expect(environmentAccountRepository.deleteById(accountId)).rejects.toThrow(UnexpectedError);
    });

    it('should rethrow custom errors as-is', async () => {
      const accountId = faker.string.uuid();
      const customError = new NotFoundError({ context: 'TEST' });

      const mockBuilder = {
        where: jest.fn().mockReturnValue({
          del: jest.fn().mockRejectedValue(customError),
        }),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      await expect(environmentAccountRepository.deleteById(accountId)).rejects.toThrow(NotFoundError);
    });
  });

  describe('deleteByIdAndTenantEnvironmentId', () => {
    it('should delete account and return true', async () => {
      const accountId = faker.string.uuid();
      const environmentId = faker.string.uuid();

      const mockBuilder = {
        where: jest.fn().mockReturnValue({
          del: jest.fn().mockResolvedValue(1),
        }),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      const result = await environmentAccountRepository.deleteByIdAndTenantEnvironmentId(
        accountId,
        environmentId
      );

      expect(result).toBe(true);
      expect(mockDbClient).toHaveBeenCalledWith('environment_account');
      expect(mockBuilder.where).toHaveBeenCalledWith({ id: accountId, environmentId });
    });

    it('should throw NotFoundError when account not found', async () => {
      const accountId = faker.string.uuid();
      const environmentId = faker.string.uuid();

      const mockBuilder = {
        where: jest.fn().mockReturnValue({
          del: jest.fn().mockResolvedValue(0),
        }),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      await expect(
        environmentAccountRepository.deleteByIdAndTenantEnvironmentId(accountId, environmentId)
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw UnexpectedError on database error', async () => {
      const accountId = faker.string.uuid();
      const environmentId = faker.string.uuid();

      const mockBuilder = {
        where: jest.fn().mockReturnValue({
          del: jest.fn().mockRejectedValue(new Error('Database error')),
        }),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      await expect(
        environmentAccountRepository.deleteByIdAndTenantEnvironmentId(accountId, environmentId)
      ).rejects.toThrow(UnexpectedError);
    });

    it('should rethrow custom errors as-is', async () => {
      const accountId = faker.string.uuid();
      const environmentId = faker.string.uuid();
      const customError = new NotFoundError({ context: 'TEST' });

      const mockBuilder = {
        where: jest.fn().mockReturnValue({
          del: jest.fn().mockRejectedValue(customError),
        }),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      await expect(
        environmentAccountRepository.deleteByIdAndTenantEnvironmentId(accountId, environmentId)
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('setCustomPropertyByIdAndTenantEnvironmentId', () => {
    it('should set custom property and return true', async () => {
      const accountId = faker.string.uuid();
      const environmentId = faker.string.uuid();
      const customProperties = { myKey: 'myValue' };

      const mockBuilder = {
        where: jest.fn().mockReturnValue({
          jsonSet: jest.fn().mockResolvedValue(undefined),
        }),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      const result = await environmentAccountRepository.setCustomPropertyByIdAndTenantEnvironmentId(
        accountId,
        environmentId,
        customProperties
      );

      expect(result).toBe(true);
      expect(mockDbClient).toHaveBeenCalledWith('environment_account');
      expect(mockBuilder.where).toHaveBeenCalledWith({ id: accountId, environmentId });
    });

    it('should throw UnexpectedError on database error', async () => {
      const accountId = faker.string.uuid();
      const environmentId = faker.string.uuid();
      const customProperties = { myKey: 'myValue' };

      const mockBuilder = {
        where: jest.fn().mockReturnValue({
          jsonSet: jest.fn().mockRejectedValue(new Error('Database error')),
        }),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      await expect(
        environmentAccountRepository.setCustomPropertyByIdAndTenantEnvironmentId(
          accountId,
          environmentId,
          customProperties
        )
      ).rejects.toThrow(UnexpectedError);
    });

    it('should rethrow custom errors as-is', async () => {
      const accountId = faker.string.uuid();
      const environmentId = faker.string.uuid();
      const customProperties = { myKey: 'myValue' };
      const customError = new NotFoundError({ context: 'TEST' });

      const mockBuilder = {
        where: jest.fn().mockReturnValue({
          jsonSet: jest.fn().mockRejectedValue(customError),
        }),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      await expect(
        environmentAccountRepository.setCustomPropertyByIdAndTenantEnvironmentId(
          accountId,
          environmentId,
          customProperties
        )
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('deleteCustomPropertyByIdAndTenantEnvironmentId', () => {
    it('should delete custom property and return true', async () => {
      const accountId = faker.string.uuid();
      const environmentId = faker.string.uuid();
      const propertyKey = 'myKey';

      const mockBuilder = {
        where: jest.fn().mockReturnValue({
          jsonRemove: jest.fn().mockResolvedValue(undefined),
        }),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      const result = await environmentAccountRepository.deleteCustomPropertyByIdAndTenantEnvironmentId(
        accountId,
        environmentId,
        propertyKey
      );

      expect(result).toBe(true);
      expect(mockDbClient).toHaveBeenCalledWith('environment_account');
      expect(mockBuilder.where).toHaveBeenCalledWith({ id: accountId, environmentId });
    });

    it('should throw UnexpectedError on database error', async () => {
      const accountId = faker.string.uuid();
      const environmentId = faker.string.uuid();
      const propertyKey = 'myKey';

      const mockBuilder = {
        where: jest.fn().mockReturnValue({
          jsonRemove: jest.fn().mockRejectedValue(new Error('Database error')),
        }),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      await expect(
        environmentAccountRepository.deleteCustomPropertyByIdAndTenantEnvironmentId(
          accountId,
          environmentId,
          propertyKey
        )
      ).rejects.toThrow(UnexpectedError);
    });

    it('should rethrow custom errors as-is', async () => {
      const accountId = faker.string.uuid();
      const environmentId = faker.string.uuid();
      const propertyKey = 'myKey';
      const customError = new NotFoundError({ context: 'TEST' });

      const mockBuilder = {
        where: jest.fn().mockReturnValue({
          jsonRemove: jest.fn().mockRejectedValue(customError),
        }),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      await expect(
        environmentAccountRepository.deleteCustomPropertyByIdAndTenantEnvironmentId(
          accountId,
          environmentId,
          propertyKey
        )
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('deleteCustomPropertyById', () => {
    it('should delete custom property and return true', async () => {
      const accountId = faker.string.uuid();
      const environmentId = faker.string.uuid();
      const propertyKey = 'myKey';

      const mockBuilder = {
        where: jest.fn().mockReturnValue({
          jsonRemove: jest.fn().mockResolvedValue(undefined),
        }),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      const result = await environmentAccountRepository.deleteCustomPropertyById(
        accountId,
        environmentId,
        propertyKey
      );

      expect(result).toBe(true);
      expect(mockDbClient).toHaveBeenCalledWith('environment_account');
      expect(mockBuilder.where).toHaveBeenCalledWith({ id: accountId, environmentId });
    });

    it('should throw UnexpectedError on database error', async () => {
      const accountId = faker.string.uuid();
      const environmentId = faker.string.uuid();
      const propertyKey = 'myKey';

      const mockBuilder = {
        where: jest.fn().mockReturnValue({
          jsonRemove: jest.fn().mockRejectedValue(new Error('Database error')),
        }),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      await expect(
        environmentAccountRepository.deleteCustomPropertyById(accountId, environmentId, propertyKey)
      ).rejects.toThrow(UnexpectedError);
    });

    it('should rethrow custom errors as-is', async () => {
      const accountId = faker.string.uuid();
      const environmentId = faker.string.uuid();
      const propertyKey = 'myKey';
      const customError = new NotFoundError({ context: 'TEST' });

      const mockBuilder = {
        where: jest.fn().mockReturnValue({
          jsonRemove: jest.fn().mockRejectedValue(customError),
        }),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      await expect(
        environmentAccountRepository.deleteCustomPropertyById(accountId, environmentId, propertyKey)
      ).rejects.toThrow(NotFoundError);
    });
  });
});
