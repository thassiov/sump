import { faker } from '@faker-js/faker';
import { TenantService } from './tenant.service';
import { TenantRepository } from '../repositories/tenant.repository';
import { ValidationError, UnexpectedError } from '../../lib/errors';

describe('TenantService', () => {
  let tenantService: TenantService;
  let mockTenantRepository: jest.Mocked<TenantRepository>;

  beforeEach(() => {
    mockTenantRepository = {
      create: jest.fn(),
      getById: jest.fn(),
      deleteById: jest.fn(),
      updateById: jest.fn(),
      setCustomPropertyById: jest.fn(),
      deleteCustomPropertyById: jest.fn(),
    } as unknown as jest.Mocked<TenantRepository>;

    tenantService = new TenantService(mockTenantRepository);
  });

  describe('create', () => {
    it('should create a tenant successfully', async () => {
      const tenantId = faker.string.uuid();
      const dto = {
        name: 'Test Tenant',
        customProperties: {},
      };

      mockTenantRepository.create.mockResolvedValue(tenantId);

      const result = await tenantService.create(dto);

      expect(result).toBe(tenantId);
      expect(mockTenantRepository.create).toHaveBeenCalledWith(dto, undefined);
    });

    it('should throw ValidationError for empty name', async () => {
      const dto = {
        name: '',
        customProperties: {},
      };

      await expect(tenantService.create(dto)).rejects.toThrow(ValidationError);
      expect(mockTenantRepository.create).not.toHaveBeenCalled();
    });

    it('should throw ValidationError for name too short', async () => {
      const dto = {
        name: 'A', // less than 2 chars (min is 2)
        customProperties: {},
      };

      await expect(tenantService.create(dto)).rejects.toThrow(ValidationError);
    });

    it('should wrap repository errors in UnexpectedError', async () => {
      const dto = {
        name: 'Test Tenant',
        customProperties: {},
      };

      mockTenantRepository.create.mockRejectedValue(new Error('Database error'));

      await expect(tenantService.create(dto)).rejects.toThrow(UnexpectedError);
    });

    it('should pass transaction to repository', async () => {
      const tenantId = faker.string.uuid();
      const dto = {
        name: 'Test Tenant',
        customProperties: {},
      };
      const mockTransaction = {} as any;

      mockTenantRepository.create.mockResolvedValue(tenantId);

      await tenantService.create(dto, mockTransaction);

      expect(mockTenantRepository.create).toHaveBeenCalledWith(dto, mockTransaction);
    });
  });

  describe('getById', () => {
    it('should return tenant when found', async () => {
      const tenantId = faker.string.uuid();
      const tenant = {
        id: tenantId,
        name: 'Test Tenant',
        customProperties: {},
      };

      mockTenantRepository.getById.mockResolvedValue(tenant);

      const result = await tenantService.getById(tenantId);

      expect(result).toEqual(tenant);
      expect(mockTenantRepository.getById).toHaveBeenCalledWith(tenantId);
    });

    it('should return undefined when tenant not found', async () => {
      const tenantId = faker.string.uuid();
      mockTenantRepository.getById.mockResolvedValue(undefined);

      const result = await tenantService.getById(tenantId);

      expect(result).toBeUndefined();
    });

    it('should throw ValidationError for invalid id', async () => {
      await expect(tenantService.getById('invalid-id')).rejects.toThrow(
        ValidationError
      );
      expect(mockTenantRepository.getById).not.toHaveBeenCalled();
    });
  });

  describe('deleteById', () => {
    it('should delete tenant successfully', async () => {
      const tenantId = faker.string.uuid();
      mockTenantRepository.deleteById.mockResolvedValue(true);

      const result = await tenantService.deleteById(tenantId);

      expect(result).toBe(true);
      expect(mockTenantRepository.deleteById).toHaveBeenCalledWith(tenantId);
    });

    it('should throw ValidationError for invalid id', async () => {
      await expect(tenantService.deleteById('invalid-id')).rejects.toThrow(
        ValidationError
      );
      expect(mockTenantRepository.deleteById).not.toHaveBeenCalled();
    });
  });

  describe('updateNonSensitivePropertiesById', () => {
    it('should update tenant name successfully', async () => {
      const tenantId = faker.string.uuid();
      const dto = { name: 'Updated Tenant Name' };

      mockTenantRepository.updateById.mockResolvedValue(true);

      const result = await tenantService.updateNonSensitivePropertiesById(
        tenantId,
        dto
      );

      expect(result).toBe(true);
      expect(mockTenantRepository.updateById).toHaveBeenCalledWith(tenantId, dto);
    });

    it('should throw ValidationError for invalid id', async () => {
      const dto = { name: 'Updated Name' };

      await expect(
        tenantService.updateNonSensitivePropertiesById('invalid-id', dto)
      ).rejects.toThrow(ValidationError);
      expect(mockTenantRepository.updateById).not.toHaveBeenCalled();
    });

    it('should throw ValidationError for empty payload', async () => {
      const tenantId = faker.string.uuid();
      const dto = {};

      await expect(
        tenantService.updateNonSensitivePropertiesById(tenantId, dto as any)
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('setCustomPropertyById', () => {
    it('should set custom property successfully', async () => {
      const tenantId = faker.string.uuid();
      const customProperties = { myKey: 'myValue' };

      mockTenantRepository.setCustomPropertyById.mockResolvedValue(true);

      const result = await tenantService.setCustomPropertyById(
        tenantId,
        customProperties
      );

      expect(result).toBe(true);
      expect(mockTenantRepository.setCustomPropertyById).toHaveBeenCalledWith(
        tenantId,
        customProperties
      );
    });

    it('should throw ValidationError for invalid id', async () => {
      await expect(
        tenantService.setCustomPropertyById('invalid-id', { key: 'value' })
      ).rejects.toThrow(ValidationError);
      expect(mockTenantRepository.setCustomPropertyById).not.toHaveBeenCalled();
    });

    it('should allow setting properties with complex values', async () => {
      const tenantId = faker.string.uuid();
      const customProperties = { config: { nested: true, count: 5 } };

      mockTenantRepository.setCustomPropertyById.mockResolvedValue(true);

      const result = await tenantService.setCustomPropertyById(
        tenantId,
        customProperties
      );

      expect(result).toBe(true);
    });
  });

  describe('deleteCustomPropertyById', () => {
    it('should delete custom property successfully', async () => {
      const tenantId = faker.string.uuid();
      const propertyKey = 'myKey';

      mockTenantRepository.deleteCustomPropertyById.mockResolvedValue(true);

      const result = await tenantService.deleteCustomPropertyById(
        tenantId,
        propertyKey
      );

      expect(result).toBe(true);
      expect(mockTenantRepository.deleteCustomPropertyById).toHaveBeenCalledWith(
        tenantId,
        propertyKey
      );
    });

    it('should throw ValidationError for invalid id', async () => {
      await expect(
        tenantService.deleteCustomPropertyById('invalid-id', 'key')
      ).rejects.toThrow(ValidationError);
      expect(mockTenantRepository.deleteCustomPropertyById).not.toHaveBeenCalled();
    });

    it('should handle property keys with special characters', async () => {
      const tenantId = faker.string.uuid();
      const propertyKey = 'my-special_key.name';

      mockTenantRepository.deleteCustomPropertyById.mockResolvedValue(true);

      const result = await tenantService.deleteCustomPropertyById(
        tenantId,
        propertyKey
      );

      expect(result).toBe(true);
    });
  });
});
