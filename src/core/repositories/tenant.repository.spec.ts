import { faker } from '@faker-js/faker';
import { TenantRepository } from './tenant.repository';
import { NotExpectedError, NotFoundError, UnexpectedError } from '../../lib/errors';

describe('TenantRepository', () => {
  let tenantRepository: TenantRepository;
  let mockDbClient: any;

  beforeEach(() => {
    mockDbClient = jest.fn();
    mockDbClient.insert = jest.fn();
    mockDbClient.jsonSet = jest.fn().mockReturnValue('jsonSetResult');
    mockDbClient.jsonRemove = jest.fn().mockReturnValue('jsonRemoveResult');

    tenantRepository = new TenantRepository(mockDbClient);
  });

  const createMockTenant = (overrides = {}) => ({
    id: faker.string.uuid(),
    name: faker.company.name(),
    customProperties: {},
    ...overrides,
  });

  describe('create', () => {
    it('should create a tenant and return the id', async () => {
      const tenantId = faker.string.uuid();
      const dto = { name: 'Test Tenant', customProperties: {} };

      const mockBuilder = {
        into: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([{ id: tenantId }]),
        transacting: jest.fn().mockReturnThis(),
      };
      mockDbClient.insert.mockReturnValue(mockBuilder);

      const result = await tenantRepository.create(dto);

      expect(result).toBe(tenantId);
      expect(mockDbClient.insert).toHaveBeenCalledWith(dto);
      expect(mockBuilder.into).toHaveBeenCalledWith('tenant');
      expect(mockBuilder.returning).toHaveBeenCalledWith('id');
    });

    it('should use transaction when provided', async () => {
      const tenantId = faker.string.uuid();
      const dto = { name: 'Test Tenant', customProperties: {} };
      const mockTransaction = {} as any;

      // The query chain: insert().into().returning() returns a thenable with transacting method
      const mockQueryResult = {
        then: (resolve: (value: { id: string }[]) => void) => resolve([{ id: tenantId }]),
        transacting: jest.fn(),
      };
      const mockBuilder = {
        into: jest.fn().mockReturnThis(),
        returning: jest.fn().mockReturnValue(mockQueryResult),
      };
      mockDbClient.insert.mockReturnValue(mockBuilder);

      await tenantRepository.create(dto, mockTransaction);

      expect(mockQueryResult.transacting).toHaveBeenCalledWith(mockTransaction);
    });

    it('should throw NotExpectedError when insert returns no result', async () => {
      const dto = { name: 'Test Tenant', customProperties: {} };

      const mockBuilder = {
        into: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([]),
        transacting: jest.fn().mockReturnThis(),
      };
      mockDbClient.insert.mockReturnValue(mockBuilder);

      await expect(tenantRepository.create(dto)).rejects.toThrow(NotExpectedError);
    });

    it('should throw UnexpectedError on database error', async () => {
      const dto = { name: 'Test Tenant', customProperties: {} };

      const mockBuilder = {
        into: jest.fn().mockReturnThis(),
        returning: jest.fn().mockRejectedValue(new Error('Database error')),
        transacting: jest.fn().mockReturnThis(),
      };
      mockDbClient.insert.mockReturnValue(mockBuilder);

      await expect(tenantRepository.create(dto)).rejects.toThrow(UnexpectedError);
    });

    it('should rethrow custom errors as-is', async () => {
      const dto = { name: 'Test Tenant', customProperties: {} };
      const customError = new NotFoundError({ context: 'TEST' });

      const mockBuilder = {
        into: jest.fn().mockReturnThis(),
        returning: jest.fn().mockRejectedValue(customError),
        transacting: jest.fn().mockReturnThis(),
      };
      mockDbClient.insert.mockReturnValue(mockBuilder);

      await expect(tenantRepository.create(dto)).rejects.toThrow(NotFoundError);
    });
  });

  describe('getById', () => {
    it('should return tenant when found', async () => {
      const tenant = createMockTenant();

      const mockBuilder = {
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(tenant),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      const result = await tenantRepository.getById(tenant.id);

      expect(result).toEqual(tenant);
      expect(mockDbClient).toHaveBeenCalledWith('tenant');
      expect(mockBuilder.where).toHaveBeenCalledWith('id', tenant.id);
      expect(mockBuilder.first).toHaveBeenCalled();
    });

    it('should return undefined when tenant not found', async () => {
      const tenantId = faker.string.uuid();

      const mockBuilder = {
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(undefined),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      const result = await tenantRepository.getById(tenantId);

      expect(result).toBeUndefined();
    });

    it('should throw UnexpectedError on database error', async () => {
      const tenantId = faker.string.uuid();

      const mockBuilder = {
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockRejectedValue(new Error('Database error')),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      await expect(tenantRepository.getById(tenantId)).rejects.toThrow(
        UnexpectedError
      );
    });
  });

  describe('updateById', () => {
    it('should update tenant and return true', async () => {
      const tenantId = faker.string.uuid();
      const dto = { name: 'Updated Tenant' };

      const mockBuilder = {
        where: jest.fn().mockReturnValue({
          update: jest.fn().mockResolvedValue(1),
        }),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      const result = await tenantRepository.updateById(tenantId, dto);

      expect(result).toBe(true);
      expect(mockDbClient).toHaveBeenCalledWith('tenant');
      expect(mockBuilder.where).toHaveBeenCalledWith('id', tenantId);
    });

    it('should throw NotFoundError when tenant not found', async () => {
      const tenantId = faker.string.uuid();
      const dto = { name: 'Updated Tenant' };

      const mockBuilder = {
        where: jest.fn().mockReturnValue({
          update: jest.fn().mockResolvedValue(0),
        }),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      await expect(tenantRepository.updateById(tenantId, dto)).rejects.toThrow(
        NotFoundError
      );
    });

    it('should throw UnexpectedError on database error', async () => {
      const tenantId = faker.string.uuid();
      const dto = { name: 'Updated Tenant' };

      const mockBuilder = {
        where: jest.fn().mockReturnValue({
          update: jest.fn().mockRejectedValue(new Error('Database error')),
        }),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      await expect(tenantRepository.updateById(tenantId, dto)).rejects.toThrow(
        UnexpectedError
      );
    });

    it('should rethrow custom errors as-is', async () => {
      const tenantId = faker.string.uuid();
      const dto = { name: 'Updated Tenant' };
      const customError = new NotFoundError({ context: 'TEST' });

      const mockBuilder = {
        where: jest.fn().mockReturnValue({
          update: jest.fn().mockRejectedValue(customError),
        }),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      await expect(tenantRepository.updateById(tenantId, dto)).rejects.toThrow(
        NotFoundError
      );
    });
  });

  describe('deleteById', () => {
    it('should delete tenant and return true', async () => {
      const tenantId = faker.string.uuid();

      const mockBuilder = {
        where: jest.fn().mockReturnValue({
          del: jest.fn().mockResolvedValue(1),
        }),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      const result = await tenantRepository.deleteById(tenantId);

      expect(result).toBe(true);
      expect(mockDbClient).toHaveBeenCalledWith('tenant');
      expect(mockBuilder.where).toHaveBeenCalledWith('id', tenantId);
    });

    it('should throw NotFoundError when tenant not found', async () => {
      const tenantId = faker.string.uuid();

      const mockBuilder = {
        where: jest.fn().mockReturnValue({
          del: jest.fn().mockResolvedValue(0),
        }),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      await expect(tenantRepository.deleteById(tenantId)).rejects.toThrow(
        NotFoundError
      );
    });

    it('should throw UnexpectedError on database error', async () => {
      const tenantId = faker.string.uuid();

      const mockBuilder = {
        where: jest.fn().mockReturnValue({
          del: jest.fn().mockRejectedValue(new Error('Database error')),
        }),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      await expect(tenantRepository.deleteById(tenantId)).rejects.toThrow(
        UnexpectedError
      );
    });

    it('should rethrow custom errors as-is', async () => {
      const tenantId = faker.string.uuid();
      const customError = new NotFoundError({ context: 'TEST' });

      const mockBuilder = {
        where: jest.fn().mockReturnValue({
          del: jest.fn().mockRejectedValue(customError),
        }),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      await expect(tenantRepository.deleteById(tenantId)).rejects.toThrow(
        NotFoundError
      );
    });
  });

  describe('setCustomPropertyById', () => {
    it('should set custom property and return true', async () => {
      const tenantId = faker.string.uuid();
      const customProperties = { myKey: 'myValue' };

      const mockBuilder = {
        update: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(1),
        }),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      const result = await tenantRepository.setCustomPropertyById(
        tenantId,
        customProperties
      );

      expect(result).toBe(true);
      expect(mockDbClient).toHaveBeenCalledWith('tenant');
      expect(mockDbClient.jsonSet).toHaveBeenCalledWith(
        'customProperties',
        '$.myKey',
        '"myValue"'
      );
    });

    it('should throw UnexpectedError on database error', async () => {
      const tenantId = faker.string.uuid();
      const customProperties = { myKey: 'myValue' };

      const mockBuilder = {
        update: jest.fn().mockReturnValue({
          where: jest.fn().mockRejectedValue(new Error('Database error')),
        }),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      await expect(
        tenantRepository.setCustomPropertyById(tenantId, customProperties)
      ).rejects.toThrow(UnexpectedError);
    });

    it('should rethrow custom errors as-is', async () => {
      const tenantId = faker.string.uuid();
      const customProperties = { myKey: 'myValue' };
      const customError = new NotFoundError({ context: 'TEST' });

      const mockBuilder = {
        update: jest.fn().mockReturnValue({
          where: jest.fn().mockRejectedValue(customError),
        }),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      await expect(
        tenantRepository.setCustomPropertyById(tenantId, customProperties)
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('deleteCustomPropertyById', () => {
    it('should delete custom property and return true', async () => {
      const tenantId = faker.string.uuid();
      const propertyKey = 'myKey';

      const mockBuilder = {
        update: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(1),
        }),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      const result = await tenantRepository.deleteCustomPropertyById(
        tenantId,
        propertyKey
      );

      expect(result).toBe(true);
      expect(mockDbClient).toHaveBeenCalledWith('tenant');
      expect(mockDbClient.jsonRemove).toHaveBeenCalledWith(
        'customProperties',
        '$.myKey'
      );
    });

    it('should throw UnexpectedError on database error', async () => {
      const tenantId = faker.string.uuid();
      const propertyKey = 'myKey';

      const mockBuilder = {
        update: jest.fn().mockReturnValue({
          where: jest.fn().mockRejectedValue(new Error('Database error')),
        }),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      await expect(
        tenantRepository.deleteCustomPropertyById(tenantId, propertyKey)
      ).rejects.toThrow(UnexpectedError);
    });

    it('should rethrow custom errors as-is', async () => {
      const tenantId = faker.string.uuid();
      const propertyKey = 'myKey';
      const customError = new NotFoundError({ context: 'TEST' });

      const mockBuilder = {
        update: jest.fn().mockReturnValue({
          where: jest.fn().mockRejectedValue(customError),
        }),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      await expect(
        tenantRepository.deleteCustomPropertyById(tenantId, propertyKey)
      ).rejects.toThrow(NotFoundError);
    });
  });
});
