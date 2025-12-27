import { faker } from '@faker-js/faker';
import { TenantAccountService } from './tenant-account.service';
import { TenantAccountRepository } from '../repositories/tenant-account.repository';
import { ITenantAccountRole } from '../types/tenant-account/tenant-account.type';

describe('TenantAccountService', () => {
  let tenantAccountService: TenantAccountService;
  let mockAccountRepository: jest.Mocked<TenantAccountRepository>;

  beforeEach(() => {
    mockAccountRepository = {
      create: jest.fn(),
      getById: jest.fn(),
      getByTenantId: jest.fn(),
      getByAccountIdAndTenantId: jest.fn(),
      getByUserDefinedIdentificationAndTenantId: jest.fn(),
      getByUserDefinedIdentification: jest.fn(),
      updateByIdAndTenantId: jest.fn(),
      deleteById: jest.fn(),
      deleteByIdAndTenantId: jest.fn(),
      getAccountsByRoleAndByTenantId: jest.fn(),
    } as unknown as jest.Mocked<TenantAccountRepository>;

    tenantAccountService = new TenantAccountService(mockAccountRepository);
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
    it('should create an account successfully', async () => {
      const tenantId = faker.string.uuid();
      const accountId = faker.string.uuid();
      const dto = {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        username: faker.internet.username(),
        roles: [{ role: 'member', target: 'tenant', targetId: tenantId }],
      };

      mockAccountRepository.create.mockResolvedValue(accountId);

      const result = await tenantAccountService.create(tenantId, dto);

      expect(result).toBe(accountId);
      expect(mockAccountRepository.create).toHaveBeenCalledWith(
        { ...dto, tenantId },
        undefined
      );
    });

    it('should pass transaction to repository', async () => {
      const tenantId = faker.string.uuid();
      const accountId = faker.string.uuid();
      const dto = {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        roles: [],
      };
      const mockTransaction = {} as any;

      mockAccountRepository.create.mockResolvedValue(accountId);

      await tenantAccountService.create(tenantId, dto, mockTransaction);

      expect(mockAccountRepository.create).toHaveBeenCalledWith(
        { ...dto, tenantId },
        mockTransaction
      );
    });
  });

  describe('getById', () => {
    it('should return account when found', async () => {
      const account = createMockAccount();
      mockAccountRepository.getById.mockResolvedValue(account);

      const result = await tenantAccountService.getById(account.id);

      expect(result).toEqual(account);
      expect(mockAccountRepository.getById).toHaveBeenCalledWith(account.id);
    });

    it('should return undefined when account not found', async () => {
      const accountId = faker.string.uuid();
      mockAccountRepository.getById.mockResolvedValue(undefined);

      const result = await tenantAccountService.getById(accountId);

      expect(result).toBeUndefined();
    });
  });

  describe('getByTenantId', () => {
    it('should return accounts for a tenant', async () => {
      const tenantId = faker.string.uuid();
      const accounts = [
        createMockAccount({ tenantId }),
        createMockAccount({ tenantId }),
      ];
      mockAccountRepository.getByTenantId.mockResolvedValue(accounts);

      const result = await tenantAccountService.getByTenantId(tenantId);

      expect(result).toEqual(accounts);
      expect(mockAccountRepository.getByTenantId).toHaveBeenCalledWith(tenantId);
    });

    it('should return undefined when no accounts found', async () => {
      const tenantId = faker.string.uuid();
      mockAccountRepository.getByTenantId.mockResolvedValue(undefined);

      const result = await tenantAccountService.getByTenantId(tenantId);

      expect(result).toBeUndefined();
    });
  });

  describe('getByAccountIdAndTenantId', () => {
    it('should return account when found', async () => {
      const account = createMockAccount();
      mockAccountRepository.getByAccountIdAndTenantId.mockResolvedValue(account);

      const result = await tenantAccountService.getByAccountIdAndTenantId(
        account.id,
        account.tenantId
      );

      expect(result).toEqual(account);
      expect(mockAccountRepository.getByAccountIdAndTenantId).toHaveBeenCalledWith(
        account.id,
        account.tenantId
      );
    });

    it('should return undefined when account not found', async () => {
      const accountId = faker.string.uuid();
      const tenantId = faker.string.uuid();
      mockAccountRepository.getByAccountIdAndTenantId.mockResolvedValue(undefined);

      const result = await tenantAccountService.getByAccountIdAndTenantId(
        accountId,
        tenantId
      );

      expect(result).toBeUndefined();
    });
  });

  describe('getByUserDefinedIdentificationAndTenantId', () => {
    it('should return accounts matching identification', async () => {
      const tenantId = faker.string.uuid();
      const email = faker.internet.email();
      const accounts = [createMockAccount({ tenantId, email })];
      mockAccountRepository.getByUserDefinedIdentificationAndTenantId.mockResolvedValue(
        accounts
      );

      const result =
        await tenantAccountService.getByUserDefinedIdentificationAndTenantId(
          { email },
          tenantId
        );

      expect(result).toEqual(accounts);
      expect(
        mockAccountRepository.getByUserDefinedIdentificationAndTenantId
      ).toHaveBeenCalledWith({ email }, tenantId);
    });

    it('should search by username', async () => {
      const tenantId = faker.string.uuid();
      const username = faker.internet.username();
      mockAccountRepository.getByUserDefinedIdentificationAndTenantId.mockResolvedValue(
        undefined
      );

      await tenantAccountService.getByUserDefinedIdentificationAndTenantId(
        { username },
        tenantId
      );

      expect(
        mockAccountRepository.getByUserDefinedIdentificationAndTenantId
      ).toHaveBeenCalledWith({ username }, tenantId);
    });

    it('should search by phone', async () => {
      const tenantId = faker.string.uuid();
      const phone = faker.phone.number();
      mockAccountRepository.getByUserDefinedIdentificationAndTenantId.mockResolvedValue(
        undefined
      );

      await tenantAccountService.getByUserDefinedIdentificationAndTenantId(
        { phone },
        tenantId
      );

      expect(
        mockAccountRepository.getByUserDefinedIdentificationAndTenantId
      ).toHaveBeenCalledWith({ phone }, tenantId);
    });
  });

  describe('getByUserDefinedIdentification', () => {
    it('should return accounts matching identification across all tenants', async () => {
      const email = faker.internet.email();
      const accounts = [createMockAccount({ email }), createMockAccount({ email })];
      mockAccountRepository.getByUserDefinedIdentification.mockResolvedValue(accounts);

      const result = await tenantAccountService.getByUserDefinedIdentification({
        email,
      });

      expect(result).toEqual(accounts);
      expect(
        mockAccountRepository.getByUserDefinedIdentification
      ).toHaveBeenCalledWith({ email });
    });

    it('should return undefined when no matches', async () => {
      mockAccountRepository.getByUserDefinedIdentification.mockResolvedValue(
        undefined
      );

      const result = await tenantAccountService.getByUserDefinedIdentification({
        email: faker.internet.email(),
      });

      expect(result).toBeUndefined();
    });
  });

  describe('deleteById', () => {
    it('should delete account successfully', async () => {
      const accountId = faker.string.uuid();
      mockAccountRepository.deleteById.mockResolvedValue(true);

      const result = await tenantAccountService.deleteById(accountId);

      expect(result).toBe(true);
      expect(mockAccountRepository.deleteById).toHaveBeenCalledWith(accountId);
    });
  });

  describe('deleteByIdAndTenantId', () => {
    it('should delete account by id and tenant id', async () => {
      const accountId = faker.string.uuid();
      const tenantId = faker.string.uuid();
      mockAccountRepository.deleteByIdAndTenantId.mockResolvedValue(true);

      const result = await tenantAccountService.deleteByIdAndTenantId(
        accountId,
        tenantId
      );

      expect(result).toBe(true);
      expect(mockAccountRepository.deleteByIdAndTenantId).toHaveBeenCalledWith(
        accountId,
        tenantId
      );
    });
  });

  describe('updateNonSensitivePropertiesByIdAndTenantId', () => {
    it('should update name successfully', async () => {
      const accountId = faker.string.uuid();
      const tenantId = faker.string.uuid();
      const dto = { name: faker.person.fullName() };
      mockAccountRepository.updateByIdAndTenantId.mockResolvedValue(true);

      const result =
        await tenantAccountService.updateNonSensitivePropertiesByIdAndTenantId(
          accountId,
          tenantId,
          dto
        );

      expect(result).toBe(true);
      expect(mockAccountRepository.updateByIdAndTenantId).toHaveBeenCalledWith(
        accountId,
        tenantId,
        dto
      );
    });

    it('should update avatarUrl successfully', async () => {
      const accountId = faker.string.uuid();
      const tenantId = faker.string.uuid();
      const dto = { avatarUrl: faker.internet.url() };
      mockAccountRepository.updateByIdAndTenantId.mockResolvedValue(true);

      const result =
        await tenantAccountService.updateNonSensitivePropertiesByIdAndTenantId(
          accountId,
          tenantId,
          dto
        );

      expect(result).toBe(true);
    });
  });

  describe('updateEmailByIdAndTenantId', () => {
    it('should update email successfully', async () => {
      const accountId = faker.string.uuid();
      const tenantId = faker.string.uuid();
      const dto = { email: faker.internet.email() };
      mockAccountRepository.updateByIdAndTenantId.mockResolvedValue(true);

      const result = await tenantAccountService.updateEmailByIdAndTenantId(
        accountId,
        tenantId,
        dto
      );

      expect(result).toBe(true);
      expect(mockAccountRepository.updateByIdAndTenantId).toHaveBeenCalledWith(
        accountId,
        tenantId,
        dto
      );
    });
  });

  describe('updateUsernameByIdAndTenantId', () => {
    it('should update username successfully', async () => {
      const accountId = faker.string.uuid();
      const tenantId = faker.string.uuid();
      const dto = { username: faker.internet.username() };
      mockAccountRepository.updateByIdAndTenantId.mockResolvedValue(true);

      const result = await tenantAccountService.updateUsernameByIdAndTenantId(
        accountId,
        tenantId,
        dto
      );

      expect(result).toBe(true);
      expect(mockAccountRepository.updateByIdAndTenantId).toHaveBeenCalledWith(
        accountId,
        tenantId,
        dto
      );
    });
  });

  describe('updatePhoneByIdAndTenantId', () => {
    it('should update phone successfully', async () => {
      const accountId = faker.string.uuid();
      const tenantId = faker.string.uuid();
      const dto = { phone: faker.phone.number() };
      mockAccountRepository.updateByIdAndTenantId.mockResolvedValue(true);

      const result = await tenantAccountService.updatePhoneByIdAndTenantId(
        accountId,
        tenantId,
        dto
      );

      expect(result).toBe(true);
      expect(mockAccountRepository.updateByIdAndTenantId).toHaveBeenCalledWith(
        accountId,
        tenantId,
        dto
      );
    });
  });

  describe('canAccountBeDeleted', () => {
    it('should return true when account is not an owner', async () => {
      const accountId = faker.string.uuid();
      const tenantId = faker.string.uuid();
      const otherOwnerId = faker.string.uuid();

      mockAccountRepository.getAccountsByRoleAndByTenantId.mockResolvedValue([
        createMockAccount({ id: otherOwnerId, tenantId }),
      ]);

      const result = await tenantAccountService.canAccountBeDeleted(
        accountId,
        tenantId
      );

      expect(result).toBe(true);
      expect(
        mockAccountRepository.getAccountsByRoleAndByTenantId
      ).toHaveBeenCalledWith(tenantId, {
        role: 'owner',
        target: 'tenant',
        targetId: tenantId,
      } as ITenantAccountRole);
    });

    it('should return true when account is owner but there are other owners', async () => {
      const accountId = faker.string.uuid();
      const tenantId = faker.string.uuid();
      const otherOwnerId = faker.string.uuid();

      mockAccountRepository.getAccountsByRoleAndByTenantId.mockResolvedValue([
        createMockAccount({ id: accountId, tenantId }),
        createMockAccount({ id: otherOwnerId, tenantId }),
      ]);

      const result = await tenantAccountService.canAccountBeDeleted(
        accountId,
        tenantId
      );

      expect(result).toBe(true);
    });

    it('should return true when there are no owners at all', async () => {
      const accountId = faker.string.uuid();
      const tenantId = faker.string.uuid();

      mockAccountRepository.getAccountsByRoleAndByTenantId.mockResolvedValue([]);

      const result = await tenantAccountService.canAccountBeDeleted(
        accountId,
        tenantId
      );

      expect(result).toBe(true);
    });
  });
});