import { faker } from '@faker-js/faker';
import { TenantAccountUseCase } from './tenant-account.use-case';
import { TenantService } from '../services/tenant.service';
import { TenantAccountService } from '../services/tenant-account.service';
import { ValidationError, NotFoundError } from '../../lib/errors';

describe('TenantAccountUseCase', () => {
  let tenantAccountUseCase: TenantAccountUseCase;
  let mockTenantService: jest.Mocked<TenantService>;
  let mockTenantAccountService: jest.Mocked<TenantAccountService>;

  beforeEach(() => {
    mockTenantService = {
      getById: jest.fn(),
    } as unknown as jest.Mocked<TenantService>;

    mockTenantAccountService = {
      create: jest.fn(),
      getByAccountIdAndTenantId: jest.fn(),
      getByUserDefinedIdentificationAndTenantId: jest.fn(),
      deleteByIdAndTenantId: jest.fn(),
      canAccountBeDeleted: jest.fn(),
      updateNonSensitivePropertiesByIdAndTenantId: jest.fn(),
      updateEmailByIdAndTenantId: jest.fn(),
      updatePhoneByIdAndTenantId: jest.fn(),
      updateUsernameByIdAndTenantId: jest.fn(),
    } as unknown as jest.Mocked<TenantAccountService>;

    tenantAccountUseCase = new TenantAccountUseCase(
      mockTenantService,
      mockTenantAccountService
    );
  });

  const createMockTenant = (overrides = {}) => ({
    id: faker.string.uuid(),
    name: faker.company.name(),
    customProperties: {},
    ...overrides,
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

  describe('createNewAccount', () => {
    it('should create an account successfully', async () => {
      const tenantId = faker.string.uuid();
      const accountId = faker.string.uuid();
      const tenant = createMockTenant({ id: tenantId });
      const dto = {
        name: 'John Doe',
        email: 'john@example.com',
        username: 'johndoe',
      };

      mockTenantService.getById.mockResolvedValue(tenant);
      mockTenantAccountService.create.mockResolvedValue(accountId);

      const result = await tenantAccountUseCase.createNewAccount(tenantId, dto);

      expect(result).toBe(accountId);
      expect(mockTenantService.getById).toHaveBeenCalledWith(tenantId);
      expect(mockTenantAccountService.create).toHaveBeenCalledWith(tenantId, dto);
    });

    it('should throw NotFoundError when tenant does not exist', async () => {
      const tenantId = faker.string.uuid();
      const dto = {
        name: 'John Doe',
        email: 'john@example.com',
        username: 'johndoe',
      };

      mockTenantService.getById.mockResolvedValue(undefined);

      await expect(
        tenantAccountUseCase.createNewAccount(tenantId, dto)
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw ValidationError for invalid tenant id', async () => {
      const dto = {
        name: 'John Doe',
        email: 'john@example.com',
        username: 'johndoe',
      };

      await expect(
        tenantAccountUseCase.createNewAccount('invalid-id', dto)
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid dto', async () => {
      const tenantId = faker.string.uuid();
      const invalidDto = {
        name: '', // name cannot be empty
      };

      await expect(
        tenantAccountUseCase.createNewAccount(tenantId, invalidDto as any)
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('deleteAccountByIdAndTenantId', () => {
    it('should delete account successfully', async () => {
      const accountId = faker.string.uuid();
      const tenantId = faker.string.uuid();

      mockTenantAccountService.canAccountBeDeleted.mockResolvedValue(true);
      mockTenantAccountService.deleteByIdAndTenantId.mockResolvedValue(true);

      const result = await tenantAccountUseCase.deleteAccountByIdAndTenantId(
        accountId,
        tenantId
      );

      expect(result).toBe(true);
      expect(mockTenantAccountService.canAccountBeDeleted).toHaveBeenCalledWith(
        accountId,
        tenantId
      );
      expect(mockTenantAccountService.deleteByIdAndTenantId).toHaveBeenCalledWith(
        accountId,
        tenantId
      );
    });

    it('should throw ValidationError when account cannot be deleted (last owner)', async () => {
      const accountId = faker.string.uuid();
      const tenantId = faker.string.uuid();

      mockTenantAccountService.canAccountBeDeleted.mockResolvedValue(false);

      await expect(
        tenantAccountUseCase.deleteAccountByIdAndTenantId(accountId, tenantId)
      ).rejects.toThrow(ValidationError);

      expect(mockTenantAccountService.deleteByIdAndTenantId).not.toHaveBeenCalled();
    });

    it('should throw ValidationError for invalid account id', async () => {
      const tenantId = faker.string.uuid();

      await expect(
        tenantAccountUseCase.deleteAccountByIdAndTenantId('invalid-id', tenantId)
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid tenant id', async () => {
      const accountId = faker.string.uuid();

      await expect(
        tenantAccountUseCase.deleteAccountByIdAndTenantId(accountId, 'invalid-id')
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('updateNonSensitivePropertiesByIdAndTenantId', () => {
    it('should update account name successfully', async () => {
      const accountId = faker.string.uuid();
      const tenantId = faker.string.uuid();
      const tenant = createMockTenant({ id: tenantId });
      const dto = { name: faker.person.fullName() };

      mockTenantService.getById.mockResolvedValue(tenant);
      mockTenantAccountService.updateNonSensitivePropertiesByIdAndTenantId.mockResolvedValue(
        true
      );

      const result =
        await tenantAccountUseCase.updateNonSensitivePropertiesByIdAndTenantId(
          accountId,
          tenantId,
          dto
        );

      expect(result).toBe(true);
      expect(
        mockTenantAccountService.updateNonSensitivePropertiesByIdAndTenantId
      ).toHaveBeenCalledWith(accountId, tenantId, dto);
    });

    it('should throw NotFoundError when tenant does not exist', async () => {
      const accountId = faker.string.uuid();
      const tenantId = faker.string.uuid();
      const dto = { name: faker.person.fullName() };

      mockTenantService.getById.mockResolvedValue(undefined);

      await expect(
        tenantAccountUseCase.updateNonSensitivePropertiesByIdAndTenantId(
          accountId,
          tenantId,
          dto
        )
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw ValidationError for invalid account id', async () => {
      const tenantId = faker.string.uuid();
      const dto = { name: faker.person.fullName() };

      await expect(
        tenantAccountUseCase.updateNonSensitivePropertiesByIdAndTenantId(
          'invalid-id',
          tenantId,
          dto
        )
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid tenant id', async () => {
      const accountId = faker.string.uuid();
      const dto = { name: faker.person.fullName() };

      await expect(
        tenantAccountUseCase.updateNonSensitivePropertiesByIdAndTenantId(
          accountId,
          'invalid-id',
          dto
        )
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for empty dto', async () => {
      const accountId = faker.string.uuid();
      const tenantId = faker.string.uuid();

      await expect(
        tenantAccountUseCase.updateNonSensitivePropertiesByIdAndTenantId(
          accountId,
          tenantId,
          {} as any
        )
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('getAccountByIdAndTenantId', () => {
    it('should return account when found', async () => {
      const accountId = faker.string.uuid();
      const tenantId = faker.string.uuid();
      const account = createMockAccount({ id: accountId, tenantId });

      mockTenantAccountService.getByAccountIdAndTenantId.mockResolvedValue(account);

      const result = await tenantAccountUseCase.getAccountByIdAndTenantId(
        accountId,
        tenantId
      );

      expect(result).toEqual(account);
      expect(
        mockTenantAccountService.getByAccountIdAndTenantId
      ).toHaveBeenCalledWith(accountId, tenantId);
    });

    it('should return undefined when account not found', async () => {
      const accountId = faker.string.uuid();
      const tenantId = faker.string.uuid();

      mockTenantAccountService.getByAccountIdAndTenantId.mockResolvedValue(
        undefined
      );

      const result = await tenantAccountUseCase.getAccountByIdAndTenantId(
        accountId,
        tenantId
      );

      expect(result).toBeUndefined();
    });

    it('should throw ValidationError for invalid account id', async () => {
      const tenantId = faker.string.uuid();

      await expect(
        tenantAccountUseCase.getAccountByIdAndTenantId('invalid-id', tenantId)
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid tenant id', async () => {
      const accountId = faker.string.uuid();

      await expect(
        tenantAccountUseCase.getAccountByIdAndTenantId(accountId, 'invalid-id')
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('getAccountByUserDefinedIdentificationAndTenantId', () => {
    it('should return accounts matching email', async () => {
      const tenantId = faker.string.uuid();
      const email = 'test@example.com';
      const accounts = [createMockAccount({ tenantId, email })];

      mockTenantAccountService.getByUserDefinedIdentificationAndTenantId.mockResolvedValue(
        accounts
      );

      const result =
        await tenantAccountUseCase.getAccountByUserDefinedIdentificationAndTenantId(
          { email, phone: '+14155551234' },
          tenantId
        );

      expect(result).toEqual(accounts);
      expect(
        mockTenantAccountService.getByUserDefinedIdentificationAndTenantId
      ).toHaveBeenCalledWith({ email, phone: '+14155551234' }, tenantId);
    });

    it('should return accounts matching phone', async () => {
      const tenantId = faker.string.uuid();
      const phone = '+14155551234';
      const accounts = [createMockAccount({ tenantId, phone })];

      mockTenantAccountService.getByUserDefinedIdentificationAndTenantId.mockResolvedValue(
        accounts
      );

      const result =
        await tenantAccountUseCase.getAccountByUserDefinedIdentificationAndTenantId(
          { phone },
          tenantId
        );

      expect(result).toEqual(accounts);
    });

    it('should return undefined when no matches', async () => {
      const tenantId = faker.string.uuid();

      mockTenantAccountService.getByUserDefinedIdentificationAndTenantId.mockResolvedValue(
        undefined
      );

      const result =
        await tenantAccountUseCase.getAccountByUserDefinedIdentificationAndTenantId(
          { phone: '+14155559999' },
          tenantId
        );

      expect(result).toBeUndefined();
    });

    it('should throw ValidationError for invalid tenant id', async () => {
      await expect(
        tenantAccountUseCase.getAccountByUserDefinedIdentificationAndTenantId(
          { phone: '+14155551234' },
          'invalid-id'
        )
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('updateAccountEmailByIdAndTenantId', () => {
    it('should update email successfully', async () => {
      const accountId = faker.string.uuid();
      const tenantId = faker.string.uuid();
      const dto = { email: 'newemail@example.com' };

      mockTenantAccountService.updateEmailByIdAndTenantId.mockResolvedValue(true);

      const result = await tenantAccountUseCase.updateAccountEmailByIdAndTenantId(
        accountId,
        tenantId,
        dto
      );

      expect(result).toBe(true);
      expect(
        mockTenantAccountService.updateEmailByIdAndTenantId
      ).toHaveBeenCalledWith(accountId, tenantId, dto);
    });

    it('should throw ValidationError for invalid account id', async () => {
      const tenantId = faker.string.uuid();
      const dto = { email: 'newemail@example.com' };

      await expect(
        tenantAccountUseCase.updateAccountEmailByIdAndTenantId(
          'invalid-id',
          tenantId,
          dto
        )
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid tenant id', async () => {
      const accountId = faker.string.uuid();
      const dto = { email: 'newemail@example.com' };

      await expect(
        tenantAccountUseCase.updateAccountEmailByIdAndTenantId(
          accountId,
          'invalid-id',
          dto
        )
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('updateAccountPhoneByIdAndTenantId', () => {
    it('should update phone successfully', async () => {
      const accountId = faker.string.uuid();
      const tenantId = faker.string.uuid();
      const dto = { phone: '+14155559999' };

      mockTenantAccountService.updatePhoneByIdAndTenantId.mockResolvedValue(true);

      const result = await tenantAccountUseCase.updateAccountPhoneByIdAndTenantId(
        accountId,
        tenantId,
        dto
      );

      expect(result).toBe(true);
      expect(
        mockTenantAccountService.updatePhoneByIdAndTenantId
      ).toHaveBeenCalledWith(accountId, tenantId, dto);
    });

    it('should throw ValidationError for invalid account id', async () => {
      const tenantId = faker.string.uuid();
      const dto = { phone: '+14155559999' };

      await expect(
        tenantAccountUseCase.updateAccountPhoneByIdAndTenantId(
          'invalid-id',
          tenantId,
          dto
        )
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid tenant id', async () => {
      const accountId = faker.string.uuid();
      const dto = { phone: '+14155559999' };

      await expect(
        tenantAccountUseCase.updateAccountPhoneByIdAndTenantId(
          accountId,
          'invalid-id',
          dto
        )
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('updateAccountUsernameByIdAndTenantId', () => {
    it('should update username successfully', async () => {
      const accountId = faker.string.uuid();
      const tenantId = faker.string.uuid();
      const dto = { username: 'newusername' };

      mockTenantAccountService.updateUsernameByIdAndTenantId.mockResolvedValue(
        true
      );

      const result =
        await tenantAccountUseCase.updateAccountUsernameByIdAndTenantId(
          accountId,
          tenantId,
          dto
        );

      expect(result).toBe(true);
      expect(
        mockTenantAccountService.updateUsernameByIdAndTenantId
      ).toHaveBeenCalledWith(accountId, tenantId, dto);
    });

    it('should throw ValidationError for invalid account id', async () => {
      const tenantId = faker.string.uuid();
      const dto = { username: 'testuser' };

      await expect(
        tenantAccountUseCase.updateAccountUsernameByIdAndTenantId(
          'invalid-id',
          tenantId,
          dto
        )
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid tenant id', async () => {
      const accountId = faker.string.uuid();
      const dto = { username: 'testuser' };

      await expect(
        tenantAccountUseCase.updateAccountUsernameByIdAndTenantId(
          accountId,
          'invalid-id',
          dto
        )
      ).rejects.toThrow(ValidationError);
    });
  });
});