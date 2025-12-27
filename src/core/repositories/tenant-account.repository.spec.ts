import { faker } from '@faker-js/faker';
import { TenantAccountRepository } from './tenant-account.repository';
import { NotExpectedError, NotFoundError, UnexpectedError, ConflictError } from '../../lib/errors';
import { DatabaseError } from 'pg';

describe('TenantAccountRepository', () => {
  let tenantAccountRepository: TenantAccountRepository;
  let mockDbClient: any;

  beforeEach(() => {
    mockDbClient = jest.fn();
    mockDbClient.insert = jest.fn();

    tenantAccountRepository = new TenantAccountRepository(mockDbClient);
  });

  const createMockAccount = (overrides = {}) => ({
    id: faker.string.uuid(),
    tenantId: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    username: faker.internet.username(),
    phone: faker.phone.number(),
    avatarUrl: faker.internet.url(),
    roles: [{ role: 'member', target: 'tenant', targetId: faker.string.uuid() }],
    ...overrides,
  });

  describe('create', () => {
    it('should create an account and return the id', async () => {
      const accountId = faker.string.uuid();
      const tenantId = faker.string.uuid();
      const dto = {
        tenantId,
        name: 'Test Account',
        email: 'test@example.com',
        username: 'testuser',
        roles: [{ role: 'member', target: 'tenant', targetId: tenantId }],
      };

      const mockBuilder = {
        into: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([{ id: accountId }]),
      };
      mockDbClient.insert.mockReturnValue(mockBuilder);

      const result = await tenantAccountRepository.create(dto);

      expect(result).toBe(accountId);
      expect(mockDbClient.insert).toHaveBeenCalledWith({
        ...dto,
        roles: JSON.stringify(dto.roles),
      });
      expect(mockBuilder.into).toHaveBeenCalledWith('tenant_account');
      expect(mockBuilder.returning).toHaveBeenCalledWith('id');
    });

    it('should use transaction when provided', async () => {
      const accountId = faker.string.uuid();
      const tenantId = faker.string.uuid();
      const dto = {
        tenantId,
        name: 'Test Account',
        email: 'test@example.com',
        username: 'testuser',
        roles: [{ role: 'member', target: 'tenant', targetId: tenantId }],
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

      await tenantAccountRepository.create(dto, mockTransaction);

      expect(mockQueryResult.transacting).toHaveBeenCalledWith(mockTransaction);
    });

    it('should throw NotExpectedError when insert returns no result', async () => {
      const tenantId = faker.string.uuid();
      const dto = {
        tenantId,
        name: 'Test Account',
        email: 'test@example.com',
        username: 'testuser',
        roles: [],
      };

      const mockBuilder = {
        into: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([]),
      };
      mockDbClient.insert.mockReturnValue(mockBuilder);

      await expect(tenantAccountRepository.create(dto)).rejects.toThrow(NotExpectedError);
    });

    it('should throw ConflictError when user identification already exists', async () => {
      const tenantId = faker.string.uuid();
      const dto = {
        tenantId,
        name: 'Test Account',
        email: 'test@example.com',
        username: 'testuser',
        roles: [],
      };

      const dbError = new DatabaseError('duplicate key', 1, 'error');
      dbError.detail = 'Key (email)=(test@example.com) already exists.';

      const mockBuilder = {
        into: jest.fn().mockReturnThis(),
        returning: jest.fn().mockRejectedValue(dbError),
      };
      mockDbClient.insert.mockReturnValue(mockBuilder);

      await expect(tenantAccountRepository.create(dto)).rejects.toThrow(ConflictError);
    });

    it('should throw UnexpectedError on database error', async () => {
      const tenantId = faker.string.uuid();
      const dto = {
        tenantId,
        name: 'Test Account',
        email: 'test@example.com',
        username: 'testuser',
        roles: [],
      };

      const mockBuilder = {
        into: jest.fn().mockReturnThis(),
        returning: jest.fn().mockRejectedValue(new Error('Database error')),
      };
      mockDbClient.insert.mockReturnValue(mockBuilder);

      await expect(tenantAccountRepository.create(dto)).rejects.toThrow(UnexpectedError);
    });

    it('should rethrow custom errors as-is', async () => {
      const tenantId = faker.string.uuid();
      const dto = {
        tenantId,
        name: 'Test Account',
        email: 'test@example.com',
        username: 'testuser',
        roles: [],
      };
      const customError = new NotFoundError({ context: 'TEST' });

      const mockBuilder = {
        into: jest.fn().mockReturnThis(),
        returning: jest.fn().mockRejectedValue(customError),
      };
      mockDbClient.insert.mockReturnValue(mockBuilder);

      await expect(tenantAccountRepository.create(dto)).rejects.toThrow(NotFoundError);
    });
  });

  describe('getById', () => {
    it('should return account when found', async () => {
      const account = createMockAccount();

      const mockBuilder = {
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(account),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      const result = await tenantAccountRepository.getById(account.id);

      expect(result).toEqual(account);
      expect(mockDbClient).toHaveBeenCalledWith('tenant_account');
      expect(mockBuilder.where).toHaveBeenCalledWith('id', account.id);
    });

    it('should return undefined when account not found', async () => {
      const accountId = faker.string.uuid();

      const mockBuilder = {
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(undefined),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      const result = await tenantAccountRepository.getById(accountId);

      expect(result).toBeUndefined();
    });

    it('should throw UnexpectedError on database error', async () => {
      const accountId = faker.string.uuid();

      const mockBuilder = {
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        first: jest.fn().mockRejectedValue(new Error('Database error')),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      await expect(tenantAccountRepository.getById(accountId)).rejects.toThrow(UnexpectedError);
    });
  });

  describe('getByTenantId', () => {
    it('should return accounts when found', async () => {
      const tenantId = faker.string.uuid();
      const accounts = [
        createMockAccount({ tenantId }),
        createMockAccount({ tenantId }),
      ];

      const mockBuilder = {
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue(accounts),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      const result = await tenantAccountRepository.getByTenantId(tenantId);

      expect(result).toEqual(accounts);
      expect(mockDbClient).toHaveBeenCalledWith('tenant_account');
      expect(mockBuilder.where).toHaveBeenCalledWith('tenantId', tenantId);
    });

    it('should return empty array when no accounts found', async () => {
      const tenantId = faker.string.uuid();

      const mockBuilder = {
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue([]),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      const result = await tenantAccountRepository.getByTenantId(tenantId);

      expect(result).toEqual([]);
    });

    it('should throw UnexpectedError on database error', async () => {
      const tenantId = faker.string.uuid();

      const mockBuilder = {
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockRejectedValue(new Error('Database error')),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      await expect(tenantAccountRepository.getByTenantId(tenantId)).rejects.toThrow(UnexpectedError);
    });
  });

  describe('getByAccountIdAndTenantId', () => {
    it('should return account when found', async () => {
      const account = createMockAccount();

      const mockBuilder = {
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(account),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      const result = await tenantAccountRepository.getByAccountIdAndTenantId(
        account.id,
        account.tenantId
      );

      expect(result).toEqual(account);
      expect(mockDbClient).toHaveBeenCalledWith('tenant_account');
      expect(mockBuilder.where).toHaveBeenCalledWith({ tenantId: account.tenantId, id: account.id });
    });

    it('should return undefined when account not found', async () => {
      const accountId = faker.string.uuid();
      const tenantId = faker.string.uuid();

      const mockBuilder = {
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(undefined),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      const result = await tenantAccountRepository.getByAccountIdAndTenantId(accountId, tenantId);

      expect(result).toBeUndefined();
    });

    it('should throw UnexpectedError on database error', async () => {
      const accountId = faker.string.uuid();
      const tenantId = faker.string.uuid();

      const mockBuilder = {
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        first: jest.fn().mockRejectedValue(new Error('Database error')),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      await expect(
        tenantAccountRepository.getByAccountIdAndTenantId(accountId, tenantId)
      ).rejects.toThrow(UnexpectedError);
    });
  });

  describe('getByUserDefinedIdentificationAndTenantId', () => {
    it('should return accounts matching email', async () => {
      const tenantId = faker.string.uuid();
      const email = 'test@example.com';
      const accounts = [createMockAccount({ tenantId, email })];

      const mockBuilder = {
        where: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        then: jest.fn().mockImplementation((cb) => Promise.resolve(cb(accounts))),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      const result = await tenantAccountRepository.getByUserDefinedIdentificationAndTenantId(
        { email },
        tenantId
      );

      expect(result).toEqual(accounts);
      expect(mockDbClient).toHaveBeenCalledWith('tenant_account');
    });

    it('should return undefined when no matches', async () => {
      const tenantId = faker.string.uuid();

      const mockBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        then: jest.fn().mockImplementation((cb) => Promise.resolve(cb([]))),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      const result = await tenantAccountRepository.getByUserDefinedIdentificationAndTenantId(
        { email: 'nonexistent@example.com' },
        tenantId
      );

      expect(result).toBeUndefined();
    });

    it('should throw UnexpectedError on database error', async () => {
      const tenantId = faker.string.uuid();

      const mockBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        then: (_resolve: any, reject: any) => reject(new Error('Database error')),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      await expect(
        tenantAccountRepository.getByUserDefinedIdentificationAndTenantId(
          { email: 'test@example.com' },
          tenantId
        )
      ).rejects.toThrow(UnexpectedError);
    });
  });

  describe('getByUserDefinedIdentification', () => {
    it('should return accounts matching email', async () => {
      const email = 'test@example.com';
      const accounts = [createMockAccount({ email })];

      const mockBuilder = {
        where: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        then: jest.fn().mockImplementation((cb) => Promise.resolve(cb(accounts))),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      const result = await tenantAccountRepository.getByUserDefinedIdentification({ email });

      expect(result).toEqual(accounts);
      expect(mockDbClient).toHaveBeenCalledWith('tenant_account');
    });

    it('should return undefined when no matches', async () => {
      const mockBuilder = {
        where: jest.fn().mockReturnThis(),
        then: jest.fn().mockImplementation((cb) => Promise.resolve(cb([]))),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      const result = await tenantAccountRepository.getByUserDefinedIdentification({
        email: 'nonexistent@example.com',
      });

      expect(result).toBeUndefined();
    });

    it('should throw UnexpectedError on database error', async () => {
      const mockBuilder = {
        where: jest.fn().mockReturnThis(),
        then: (_resolve: any, reject: any) => reject(new Error('Database error')),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      await expect(
        tenantAccountRepository.getByUserDefinedIdentification({ email: 'test@example.com' })
      ).rejects.toThrow(UnexpectedError);
    });
  });

  describe('updateByIdAndTenantId', () => {
    it('should update account and return true', async () => {
      const accountId = faker.string.uuid();
      const tenantId = faker.string.uuid();
      const dto = { name: 'Updated Name' };

      const mockBuilder = {
        where: jest.fn().mockReturnValue({
          update: jest.fn().mockResolvedValue(1),
        }),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      const result = await tenantAccountRepository.updateByIdAndTenantId(
        accountId,
        tenantId,
        dto
      );

      expect(result).toBe(true);
      expect(mockDbClient).toHaveBeenCalledWith('tenant_account');
      expect(mockBuilder.where).toHaveBeenCalledWith({ id: accountId, tenantId });
    });

    it('should throw NotFoundError when account not found', async () => {
      const accountId = faker.string.uuid();
      const tenantId = faker.string.uuid();
      const dto = { name: 'Updated Name' };

      const mockBuilder = {
        where: jest.fn().mockReturnValue({
          update: jest.fn().mockResolvedValue(0),
        }),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      await expect(
        tenantAccountRepository.updateByIdAndTenantId(accountId, tenantId, dto)
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw UnexpectedError on database error', async () => {
      const accountId = faker.string.uuid();
      const tenantId = faker.string.uuid();
      const dto = { name: 'Updated Name' };

      const mockBuilder = {
        where: jest.fn().mockReturnValue({
          update: jest.fn().mockRejectedValue(new Error('Database error')),
        }),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      await expect(
        tenantAccountRepository.updateByIdAndTenantId(accountId, tenantId, dto)
      ).rejects.toThrow(UnexpectedError);
    });

    it('should rethrow custom errors as-is', async () => {
      const accountId = faker.string.uuid();
      const tenantId = faker.string.uuid();
      const dto = { name: 'Updated Name' };
      const customError = new NotFoundError({ context: 'TEST' });

      const mockBuilder = {
        where: jest.fn().mockReturnValue({
          update: jest.fn().mockRejectedValue(customError),
        }),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      await expect(
        tenantAccountRepository.updateByIdAndTenantId(accountId, tenantId, dto)
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

      const result = await tenantAccountRepository.deleteById(accountId);

      expect(result).toBe(true);
      expect(mockDbClient).toHaveBeenCalledWith('tenant_account');
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

      await expect(tenantAccountRepository.deleteById(accountId)).rejects.toThrow(NotFoundError);
    });

    it('should throw UnexpectedError on database error', async () => {
      const accountId = faker.string.uuid();

      const mockBuilder = {
        where: jest.fn().mockReturnValue({
          del: jest.fn().mockRejectedValue(new Error('Database error')),
        }),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      await expect(tenantAccountRepository.deleteById(accountId)).rejects.toThrow(UnexpectedError);
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

      await expect(tenantAccountRepository.deleteById(accountId)).rejects.toThrow(NotFoundError);
    });
  });

  describe('deleteByIdAndTenantId', () => {
    it('should delete account and return true', async () => {
      const accountId = faker.string.uuid();
      const tenantId = faker.string.uuid();

      const mockBuilder = {
        where: jest.fn().mockReturnValue({
          del: jest.fn().mockResolvedValue(1),
        }),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      const result = await tenantAccountRepository.deleteByIdAndTenantId(accountId, tenantId);

      expect(result).toBe(true);
      expect(mockDbClient).toHaveBeenCalledWith('tenant_account');
      expect(mockBuilder.where).toHaveBeenCalledWith({ id: accountId, tenantId });
    });

    it('should throw NotFoundError when account not found', async () => {
      const accountId = faker.string.uuid();
      const tenantId = faker.string.uuid();

      const mockBuilder = {
        where: jest.fn().mockReturnValue({
          del: jest.fn().mockResolvedValue(0),
        }),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      await expect(
        tenantAccountRepository.deleteByIdAndTenantId(accountId, tenantId)
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw UnexpectedError on database error', async () => {
      const accountId = faker.string.uuid();
      const tenantId = faker.string.uuid();

      const mockBuilder = {
        where: jest.fn().mockReturnValue({
          del: jest.fn().mockRejectedValue(new Error('Database error')),
        }),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      await expect(
        tenantAccountRepository.deleteByIdAndTenantId(accountId, tenantId)
      ).rejects.toThrow(UnexpectedError);
    });

    it('should rethrow custom errors as-is', async () => {
      const accountId = faker.string.uuid();
      const tenantId = faker.string.uuid();
      const customError = new NotFoundError({ context: 'TEST' });

      const mockBuilder = {
        where: jest.fn().mockReturnValue({
          del: jest.fn().mockRejectedValue(customError),
        }),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      await expect(
        tenantAccountRepository.deleteByIdAndTenantId(accountId, tenantId)
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('getAccountsByRoleAndByTenantId', () => {
    it('should return accounts with matching role', async () => {
      const tenantId = faker.string.uuid();
      const role = { role: 'owner', target: 'tenant', targetId: tenantId };
      const accounts = [
        createMockAccount({ tenantId, roles: [role] }),
        createMockAccount({ tenantId, roles: [role] }),
      ];

      const mockBuilder = {
        whereRaw: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue(accounts),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      const result = await tenantAccountRepository.getAccountsByRoleAndByTenantId(tenantId, role);

      expect(result).toEqual(accounts);
      expect(mockDbClient).toHaveBeenCalledWith('tenant_account');
      expect(mockBuilder.whereRaw).toHaveBeenCalledWith(`roles @> ?`, [JSON.stringify(role)]);
      expect(mockBuilder.andWhere).toHaveBeenCalledWith({ tenantId });
    });

    it('should return empty array when no accounts match', async () => {
      const tenantId = faker.string.uuid();
      const role = { role: 'owner', target: 'tenant', targetId: tenantId };

      const mockBuilder = {
        whereRaw: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue([]),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      const result = await tenantAccountRepository.getAccountsByRoleAndByTenantId(tenantId, role);

      expect(result).toEqual([]);
    });

    it('should throw UnexpectedError on database error', async () => {
      const tenantId = faker.string.uuid();
      const role = { role: 'owner', target: 'tenant', targetId: tenantId };

      const mockBuilder = {
        whereRaw: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        select: jest.fn().mockRejectedValue(new Error('Database error')),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      await expect(
        tenantAccountRepository.getAccountsByRoleAndByTenantId(tenantId, role)
      ).rejects.toThrow(UnexpectedError);
    });

    it('should rethrow custom errors as-is', async () => {
      const tenantId = faker.string.uuid();
      const role = { role: 'owner', target: 'tenant', targetId: tenantId };
      const customError = new NotFoundError({ context: 'TEST' });

      const mockBuilder = {
        whereRaw: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        select: jest.fn().mockRejectedValue(customError),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      await expect(
        tenantAccountRepository.getAccountsByRoleAndByTenantId(tenantId, role)
      ).rejects.toThrow(NotFoundError);
    });
  });
});
