import { faker } from '@faker-js/faker';
import { TenantUseCase } from './tenant.use-case';
import { TenantService } from '../services/tenant.service';
import { TenantAccountService } from '../services/tenant-account.service';
import { EnvironmentService } from '../services/environment.service';
import { ValidationError, ConflictError, NotFoundError } from '../../lib/errors';

describe('TenantUseCase', () => {
  let tenantUseCase: TenantUseCase;
  let mockTenantService: jest.Mocked<TenantService>;
  let mockTenantAccountService: jest.Mocked<TenantAccountService>;
  let mockEnvironmentService: jest.Mocked<EnvironmentService>;

  beforeEach(() => {
    mockTenantService = {
      create: jest.fn(),
      getById: jest.fn(),
      deleteById: jest.fn(),
      updateNonSensitivePropertiesById: jest.fn(),
      setCustomPropertyById: jest.fn(),
      deleteCustomPropertyById: jest.fn(),
    } as unknown as jest.Mocked<TenantService>;

    mockTenantAccountService = {
      create: jest.fn(),
      getByUserDefinedIdentification: jest.fn(),
      getByTenantId: jest.fn(),
    } as unknown as jest.Mocked<TenantAccountService>;

    mockEnvironmentService = {
      create: jest.fn(),
      getByTenantId: jest.fn(),
    } as unknown as jest.Mocked<EnvironmentService>;

    tenantUseCase = new TenantUseCase(
      mockTenantService,
      mockTenantAccountService,
      mockEnvironmentService
    );
  });

  describe('createNewTenant', () => {
    const validDto = {
      tenant: {
        name: 'Test Tenant',
        customProperties: {},
      },
      account: {
        name: 'Admin User',
        email: 'admin@example.com',
        username: 'adminuser',
        roles: [{ role: 'owner' as const, target: 'tenant' as const, targetId: faker.string.uuid() }],
      },
      environment: {
        name: 'production',
        customProperties: {},
      },
    };

    it('should create a new tenant with account and environment', async () => {
      const tenantId = faker.string.uuid();
      const accountId = faker.string.uuid();
      const environmentId = faker.string.uuid();

      mockTenantAccountService.getByUserDefinedIdentification.mockResolvedValue(undefined);
      mockTenantService.create.mockResolvedValue(tenantId);
      mockTenantAccountService.create.mockResolvedValue(accountId);
      mockEnvironmentService.create.mockResolvedValue(environmentId);

      const result = await tenantUseCase.createNewTenant(validDto);

      expect(result).toEqual({ tenantId, accountId, environmentId });
      expect(mockTenantService.create).toHaveBeenCalledWith(validDto.tenant);
      // The use case sets the owner role's targetId to the newly created tenantId
      expect(mockTenantAccountService.create).toHaveBeenCalledWith(tenantId, {
        ...validDto.account,
        roles: [{ role: 'owner', target: 'tenant', targetId: tenantId }],
      });
      expect(mockEnvironmentService.create).toHaveBeenCalledWith(tenantId, validDto.environment);
    });

    it('should create default environment when not provided', async () => {
      const dtoWithoutEnv = {
        tenant: validDto.tenant,
        account: validDto.account,
      };
      const tenantId = faker.string.uuid();
      const accountId = faker.string.uuid();
      const environmentId = faker.string.uuid();

      mockTenantAccountService.getByUserDefinedIdentification.mockResolvedValue(undefined);
      mockTenantService.create.mockResolvedValue(tenantId);
      mockTenantAccountService.create.mockResolvedValue(accountId);
      mockEnvironmentService.create.mockResolvedValue(environmentId);

      await tenantUseCase.createNewTenant(dtoWithoutEnv);

      expect(mockEnvironmentService.create).toHaveBeenCalledWith(tenantId, {
        name: 'default',
        customProperties: {},
      });
    });

    it('should throw ValidationError for invalid dto', async () => {
      const invalidDto = {
        tenant: { name: '' }, // name cannot be empty
        account: { name: 'Test' }, // missing required fields
      };

      await expect(
        tenantUseCase.createNewTenant(invalidDto as any)
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ConflictError when email is already in use', async () => {
      mockTenantAccountService.getByUserDefinedIdentification.mockResolvedValue([
        {
          id: faker.string.uuid(),
          tenantId: faker.string.uuid(),
          name: 'Existing User',
          email: validDto.account.email,
          username: 'existinguser',
          roles: [{ role: 'user' as const, target: 'tenant' as const, targetId: faker.string.uuid() }],
        },
      ]);

      await expect(tenantUseCase.createNewTenant(validDto)).rejects.toThrow(
        ConflictError
      );
    });

    it('should throw ConflictError when phone is already in use', async () => {
      const dtoWithPhone = {
        ...validDto,
        account: {
          ...validDto.account,
          phone: '+1234567890',
        },
      };

      mockTenantAccountService.getByUserDefinedIdentification.mockResolvedValue([
        {
          id: faker.string.uuid(),
          tenantId: faker.string.uuid(),
          name: 'Existing User',
          email: 'other@example.com',
          username: 'otheruser',
          phone: '+1234567890',
          roles: [{ role: 'user' as const, target: 'tenant' as const, targetId: faker.string.uuid() }],
        },
      ]);

      await expect(tenantUseCase.createNewTenant(dtoWithPhone)).rejects.toThrow(
        ConflictError
      );
    });

    it('should throw ConflictError when username is already in use', async () => {
      const dtoWithUsername = {
        ...validDto,
        account: {
          ...validDto.account,
          username: 'existinguser',
        },
      };

      mockTenantAccountService.getByUserDefinedIdentification.mockResolvedValue([
        {
          id: faker.string.uuid(),
          tenantId: faker.string.uuid(),
          name: 'Existing User',
          email: 'other@example.com',
          username: 'existinguser',
          roles: [{ role: 'user' as const, target: 'tenant' as const, targetId: faker.string.uuid() }],
        },
      ]);

      await expect(tenantUseCase.createNewTenant(dtoWithUsername)).rejects.toThrow(
        ConflictError
      );
    });
  });

  describe('getTenantById', () => {
    it('should return tenant with environments', async () => {
      const tenantId = faker.string.uuid();
      const tenant = {
        id: tenantId,
        name: 'Test Tenant',
        customProperties: {},
      };
      const environments = [
        {
          id: faker.string.uuid(),
          name: 'production',
          tenantId,
          customProperties: {},
        },
      ];

      mockTenantService.getById.mockResolvedValue(tenant);
      mockEnvironmentService.getByTenantId.mockResolvedValue(environments);

      const result = await tenantUseCase.getTenantById(tenantId);

      expect(result).toEqual({ ...tenant, environments });
      expect(mockTenantService.getById).toHaveBeenCalledWith(tenantId);
      expect(mockEnvironmentService.getByTenantId).toHaveBeenCalledWith(tenantId);
    });

    it('should throw NotFoundError when tenant does not exist', async () => {
      const tenantId = faker.string.uuid();
      mockTenantService.getById.mockResolvedValue(undefined);

      await expect(tenantUseCase.getTenantById(tenantId)).rejects.toThrow(
        NotFoundError
      );
    });

    it('should throw ValidationError for invalid tenant id', async () => {
      await expect(tenantUseCase.getTenantById('invalid-id')).rejects.toThrow(
        ValidationError
      );
    });

    it('should return empty environments array when tenant has no environments', async () => {
      const tenantId = faker.string.uuid();
      const tenant = {
        id: tenantId,
        name: 'Test Tenant',
        customProperties: {},
      };

      mockTenantService.getById.mockResolvedValue(tenant);
      mockEnvironmentService.getByTenantId.mockResolvedValue(undefined);

      const result = await tenantUseCase.getTenantById(tenantId);

      expect(result.environments).toEqual([]);
    });
  });

  describe('deleteTenantById', () => {
    it('should delete tenant successfully', async () => {
      const tenantId = faker.string.uuid();
      mockTenantService.deleteById.mockResolvedValue(true);

      const result = await tenantUseCase.deleteTenantById(tenantId);

      expect(result).toBe(true);
      expect(mockTenantService.deleteById).toHaveBeenCalledWith(tenantId);
    });

    it('should throw ValidationError for invalid tenant id', async () => {
      await expect(tenantUseCase.deleteTenantById('invalid-id')).rejects.toThrow(
        ValidationError
      );
    });
  });

  describe('getAccountsByTenantId', () => {
    it('should return accounts for tenant', async () => {
      const tenantId = faker.string.uuid();
      const tenant = {
        id: tenantId,
        name: 'Test Tenant',
        customProperties: {},
      };
      const accounts = [
        {
          id: faker.string.uuid(),
          tenantId,
          name: 'User 1',
          email: 'user1@example.com',
          username: 'user1',
          roles: [{ role: 'owner' as const, target: 'tenant' as const, targetId: tenantId }],
        },
        {
          id: faker.string.uuid(),
          tenantId,
          name: 'User 2',
          email: 'user2@example.com',
          username: 'user2',
          roles: [{ role: 'user' as const, target: 'tenant' as const, targetId: tenantId }],
        },
      ];

      mockTenantService.getById.mockResolvedValue(tenant);
      mockTenantAccountService.getByTenantId.mockResolvedValue(accounts);

      const result = await tenantUseCase.getAccountsByTenantId(tenantId);

      expect(result).toEqual(accounts);
    });

    it('should throw NotFoundError when tenant does not exist', async () => {
      const tenantId = faker.string.uuid();
      mockTenantService.getById.mockResolvedValue(undefined);

      await expect(tenantUseCase.getAccountsByTenantId(tenantId)).rejects.toThrow(
        NotFoundError
      );
    });

    it('should throw ValidationError for invalid tenant id', async () => {
      await expect(
        tenantUseCase.getAccountsByTenantId('invalid-id')
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('setCustomPropertyByTenantIdUseCase', () => {
    it('should set custom property successfully', async () => {
      const tenantId = faker.string.uuid();
      const customProperty = { myKey: 'myValue' };

      mockTenantService.setCustomPropertyById.mockResolvedValue(true);

      const result = await tenantUseCase.setCustomPropertyByTenantIdUseCase(
        tenantId,
        customProperty
      );

      expect(result).toBe(true);
      expect(mockTenantService.setCustomPropertyById).toHaveBeenCalledWith(
        tenantId,
        customProperty
      );
    });

    it('should throw ValidationError for invalid tenant id', async () => {
      await expect(
        tenantUseCase.setCustomPropertyByTenantIdUseCase('invalid-id', {
          key: 'value',
        })
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('deleteCustomPropertyByTenantIdUseCase', () => {
    it('should delete custom property successfully', async () => {
      const tenantId = faker.string.uuid();
      const propertyKey = 'myKey';

      mockTenantService.deleteCustomPropertyById.mockResolvedValue(true);

      const result = await tenantUseCase.deleteCustomPropertyByTenantIdUseCase(
        tenantId,
        propertyKey
      );

      expect(result).toBe(true);
      expect(mockTenantService.deleteCustomPropertyById).toHaveBeenCalledWith(
        tenantId,
        propertyKey
      );
    });

    it('should throw ValidationError for invalid tenant id', async () => {
      await expect(
        tenantUseCase.deleteCustomPropertyByTenantIdUseCase('invalid-id', 'key')
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('updateNonSensitivePropertiesByIdUseCase', () => {
    it('should update tenant name successfully', async () => {
      const tenantId = faker.string.uuid();
      const dto = { name: 'New Tenant Name' };

      mockTenantService.updateNonSensitivePropertiesById.mockResolvedValue(true);

      const result = await tenantUseCase.updateNonSensitivePropertiesByIdUseCase(
        tenantId,
        dto
      );

      expect(result).toBe(true);
      expect(mockTenantService.updateNonSensitivePropertiesById).toHaveBeenCalledWith(
        tenantId,
        dto
      );
    });

    it('should throw ValidationError for invalid tenant id', async () => {
      await expect(
        tenantUseCase.updateNonSensitivePropertiesByIdUseCase('invalid-id', {
          name: 'New Name',
        })
      ).rejects.toThrow(ValidationError);
    });
  });
});
