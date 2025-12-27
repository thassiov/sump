import { faker } from '@faker-js/faker';
import { EnvironmentService } from './environment.service';
import { EnvironmentRepository } from '../repositories/environment.repository';
import { ValidationError, UnexpectedError } from '../../lib/errors';

describe('EnvironmentService', () => {
  let environmentService: EnvironmentService;
  let mockEnvironmentRepository: jest.Mocked<EnvironmentRepository>;

  beforeEach(() => {
    mockEnvironmentRepository = {
      create: jest.fn(),
      getById: jest.fn(),
      getByIdAndTenantId: jest.fn(),
      getByTenantId: jest.fn(),
      updateByIdAndTenantId: jest.fn(),
      deleteById: jest.fn(),
      deleteByIdAndTenantId: jest.fn(),
      setCustomPropertyByIdAndTenantId: jest.fn(),
      deleteCustomPropertyByIdAndTenantId: jest.fn(),
    } as unknown as jest.Mocked<EnvironmentRepository>;

    environmentService = new EnvironmentService(mockEnvironmentRepository);
  });

  const createMockEnvironment = (overrides = {}) => ({
    id: faker.string.uuid(),
    tenantId: faker.string.uuid(),
    name: faker.company.name(),
    customProperties: {},
    ...overrides,
  });

  describe('create', () => {
    it('should create an environment successfully', async () => {
      const tenantId = faker.string.uuid();
      const environmentId = faker.string.uuid();
      const dto = {
        name: 'production',
        customProperties: {},
      };

      mockEnvironmentRepository.create.mockResolvedValue(environmentId);

      const result = await environmentService.create(tenantId, dto);

      expect(result).toBe(environmentId);
      expect(mockEnvironmentRepository.create).toHaveBeenCalledWith(
        { ...dto, tenantId },
        undefined
      );
    });

    it('should pass transaction to repository', async () => {
      const tenantId = faker.string.uuid();
      const environmentId = faker.string.uuid();
      const dto = {
        name: 'staging',
        customProperties: {},
      };
      const mockTransaction = {} as any;

      mockEnvironmentRepository.create.mockResolvedValue(environmentId);

      await environmentService.create(tenantId, dto, mockTransaction);

      expect(mockEnvironmentRepository.create).toHaveBeenCalledWith(
        { ...dto, tenantId },
        mockTransaction
      );
    });

    it('should wrap repository errors in UnexpectedError', async () => {
      const tenantId = faker.string.uuid();
      const dto = {
        name: 'production',
        customProperties: {},
      };

      mockEnvironmentRepository.create.mockRejectedValue(
        new Error('Database error')
      );

      await expect(environmentService.create(tenantId, dto)).rejects.toThrow(
        UnexpectedError
      );
    });
  });

  describe('getById', () => {
    it('should return environment when found', async () => {
      const environment = createMockEnvironment();
      mockEnvironmentRepository.getById.mockResolvedValue(environment);

      const result = await environmentService.getById(environment.id);

      expect(result).toEqual(environment);
      expect(mockEnvironmentRepository.getById).toHaveBeenCalledWith(
        environment.id
      );
    });

    it('should return undefined when environment not found', async () => {
      const environmentId = faker.string.uuid();
      mockEnvironmentRepository.getById.mockResolvedValue(undefined);

      const result = await environmentService.getById(environmentId);

      expect(result).toBeUndefined();
    });
  });

  describe('getByIdAndTenantId', () => {
    it('should return environment when found', async () => {
      const environment = createMockEnvironment();
      mockEnvironmentRepository.getByIdAndTenantId.mockResolvedValue(environment);

      const result = await environmentService.getByIdAndTenantId(
        environment.id,
        environment.tenantId
      );

      expect(result).toEqual(environment);
      expect(mockEnvironmentRepository.getByIdAndTenantId).toHaveBeenCalledWith(
        environment.id,
        environment.tenantId
      );
    });

    it('should return undefined when environment not found', async () => {
      const environmentId = faker.string.uuid();
      const tenantId = faker.string.uuid();
      mockEnvironmentRepository.getByIdAndTenantId.mockResolvedValue(undefined);

      const result = await environmentService.getByIdAndTenantId(
        environmentId,
        tenantId
      );

      expect(result).toBeUndefined();
    });
  });

  describe('getByTenantId', () => {
    it('should return environments for a tenant', async () => {
      const tenantId = faker.string.uuid();
      const environments = [
        createMockEnvironment({ tenantId }),
        createMockEnvironment({ tenantId }),
      ];
      mockEnvironmentRepository.getByTenantId.mockResolvedValue(environments);

      const result = await environmentService.getByTenantId(tenantId);

      expect(result).toEqual(environments);
      expect(mockEnvironmentRepository.getByTenantId).toHaveBeenCalledWith(
        tenantId
      );
    });

    it('should return undefined when no environments found', async () => {
      const tenantId = faker.string.uuid();
      mockEnvironmentRepository.getByTenantId.mockResolvedValue(undefined);

      const result = await environmentService.getByTenantId(tenantId);

      expect(result).toBeUndefined();
    });
  });

  describe('deleteById', () => {
    it('should delete environment successfully', async () => {
      const environmentId = faker.string.uuid();
      mockEnvironmentRepository.deleteById.mockResolvedValue(true);

      const result = await environmentService.deleteById(environmentId);

      expect(result).toBe(true);
      expect(mockEnvironmentRepository.deleteById).toHaveBeenCalledWith(
        environmentId
      );
    });

    it('should throw ValidationError for invalid id', async () => {
      await expect(
        environmentService.deleteById('invalid-id')
      ).rejects.toThrow(ValidationError);
      expect(mockEnvironmentRepository.deleteById).not.toHaveBeenCalled();
    });
  });

  describe('deleteByIdAndTenantId', () => {
    it('should delete environment by id and tenant id', async () => {
      const environmentId = faker.string.uuid();
      const tenantId = faker.string.uuid();
      mockEnvironmentRepository.deleteByIdAndTenantId.mockResolvedValue(true);

      const result = await environmentService.deleteByIdAndTenantId(
        environmentId,
        tenantId
      );

      expect(result).toBe(true);
      expect(
        mockEnvironmentRepository.deleteByIdAndTenantId
      ).toHaveBeenCalledWith(environmentId, tenantId);
    });
  });

  describe('updateNonSensitivePropertiesByIdAndTenantId', () => {
    it('should update environment name successfully', async () => {
      const environmentId = faker.string.uuid();
      const tenantId = faker.string.uuid();
      const dto = { name: 'updated-environment' };

      mockEnvironmentRepository.updateByIdAndTenantId.mockResolvedValue(true);

      const result =
        await environmentService.updateNonSensitivePropertiesByIdAndTenantId(
          environmentId,
          tenantId,
          dto
        );

      expect(result).toBe(true);
      expect(
        mockEnvironmentRepository.updateByIdAndTenantId
      ).toHaveBeenCalledWith(environmentId, tenantId, dto);
    });

    it('should throw ValidationError for invalid id', async () => {
      const tenantId = faker.string.uuid();
      const dto = { name: 'updated-environment' };

      await expect(
        environmentService.updateNonSensitivePropertiesByIdAndTenantId(
          'invalid-id',
          tenantId,
          dto
        )
      ).rejects.toThrow(ValidationError);
      expect(
        mockEnvironmentRepository.updateByIdAndTenantId
      ).not.toHaveBeenCalled();
    });

    it('should throw ValidationError for empty payload', async () => {
      const environmentId = faker.string.uuid();
      const tenantId = faker.string.uuid();
      const dto = {};

      await expect(
        environmentService.updateNonSensitivePropertiesByIdAndTenantId(
          environmentId,
          tenantId,
          dto as any
        )
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('setCustomPropertyByIdAndTenantId', () => {
    it('should set custom property successfully', async () => {
      const environmentId = faker.string.uuid();
      const tenantId = faker.string.uuid();
      const customProperties = { myKey: 'myValue' };

      mockEnvironmentRepository.setCustomPropertyByIdAndTenantId.mockResolvedValue(
        true
      );

      const result = await environmentService.setCustomPropertyByIdAndTenantId(
        environmentId,
        tenantId,
        customProperties
      );

      expect(result).toBe(true);
      expect(
        mockEnvironmentRepository.setCustomPropertyByIdAndTenantId
      ).toHaveBeenCalledWith(environmentId, tenantId, customProperties);
    });

    it('should throw ValidationError for invalid id', async () => {
      const tenantId = faker.string.uuid();

      await expect(
        environmentService.setCustomPropertyByIdAndTenantId(
          'invalid-id',
          tenantId,
          { key: 'value' }
        )
      ).rejects.toThrow(ValidationError);
      expect(
        mockEnvironmentRepository.setCustomPropertyByIdAndTenantId
      ).not.toHaveBeenCalled();
    });

    it('should allow setting properties with complex values', async () => {
      const environmentId = faker.string.uuid();
      const tenantId = faker.string.uuid();
      const customProperties = { config: { nested: true, count: 5 } };

      mockEnvironmentRepository.setCustomPropertyByIdAndTenantId.mockResolvedValue(
        true
      );

      const result = await environmentService.setCustomPropertyByIdAndTenantId(
        environmentId,
        tenantId,
        customProperties
      );

      expect(result).toBe(true);
    });
  });

  describe('deleteCustomPropertyByIdAndTenantId', () => {
    it('should delete custom property successfully', async () => {
      const environmentId = faker.string.uuid();
      const tenantId = faker.string.uuid();
      const propertyKey = 'myKey';

      mockEnvironmentRepository.deleteCustomPropertyByIdAndTenantId.mockResolvedValue(
        true
      );

      const result =
        await environmentService.deleteCustomPropertyByIdAndTenantId(
          environmentId,
          tenantId,
          propertyKey
        );

      expect(result).toBe(true);
      expect(
        mockEnvironmentRepository.deleteCustomPropertyByIdAndTenantId
      ).toHaveBeenCalledWith(environmentId, tenantId, propertyKey);
    });

    it('should throw ValidationError for invalid id', async () => {
      const tenantId = faker.string.uuid();

      await expect(
        environmentService.deleteCustomPropertyByIdAndTenantId(
          'invalid-id',
          tenantId,
          'key'
        )
      ).rejects.toThrow(ValidationError);
      expect(
        mockEnvironmentRepository.deleteCustomPropertyByIdAndTenantId
      ).not.toHaveBeenCalled();
    });

    it('should handle property keys with special characters', async () => {
      const environmentId = faker.string.uuid();
      const tenantId = faker.string.uuid();
      const propertyKey = 'my-special_key.name';

      mockEnvironmentRepository.deleteCustomPropertyByIdAndTenantId.mockResolvedValue(
        true
      );

      const result =
        await environmentService.deleteCustomPropertyByIdAndTenantId(
          environmentId,
          tenantId,
          propertyKey
        );

      expect(result).toBe(true);
    });
  });
});
