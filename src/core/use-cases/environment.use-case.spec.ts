import { faker } from '@faker-js/faker';
import { EnvironmentUseCase } from './environment.use-case';
import { EnvironmentService } from '../services/environment.service';
import { ValidationError } from '../../lib/errors';

describe('EnvironmentUseCase', () => {
  let environmentUseCase: EnvironmentUseCase;
  let mockEnvironmentService: jest.Mocked<EnvironmentService>;

  beforeEach(() => {
    mockEnvironmentService = {
      create: jest.fn(),
      getByIdAndTenantId: jest.fn(),
      deleteByIdAndTenantId: jest.fn(),
      updateNonSensitivePropertiesByIdAndTenantId: jest.fn(),
      setCustomPropertyByIdAndTenantId: jest.fn(),
      deleteCustomPropertyByIdAndTenantId: jest.fn(),
    } as unknown as jest.Mocked<EnvironmentService>;

    environmentUseCase = new EnvironmentUseCase(mockEnvironmentService);
  });

  const createMockEnvironment = (overrides = {}) => ({
    id: faker.string.uuid(),
    tenantId: faker.string.uuid(),
    name: 'production',
    customProperties: {},
    ...overrides,
  });

  describe('createNewEnvironment', () => {
    it('should create an environment successfully', async () => {
      const tenantId = faker.string.uuid();
      const environmentId = faker.string.uuid();
      const dto = {
        name: 'production',
        customProperties: {},
      };

      mockEnvironmentService.create.mockResolvedValue(environmentId);

      const result = await environmentUseCase.createNewEnvironment(tenantId, dto);

      expect(result).toBe(environmentId);
      expect(mockEnvironmentService.create).toHaveBeenCalledWith(tenantId, dto);
    });

    it('should throw ValidationError for invalid tenant id', async () => {
      const dto = {
        name: 'production',
        customProperties: {},
      };

      await expect(
        environmentUseCase.createNewEnvironment('invalid-id', dto)
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid dto', async () => {
      const tenantId = faker.string.uuid();
      const invalidDto = {
        name: 'a', // name must be min 2 chars
        customProperties: {},
      };

      await expect(
        environmentUseCase.createNewEnvironment(tenantId, invalidDto)
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for empty name', async () => {
      const tenantId = faker.string.uuid();
      const invalidDto = {
        name: '',
        customProperties: {},
      };

      await expect(
        environmentUseCase.createNewEnvironment(tenantId, invalidDto)
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('getEnvironmentByIdAndTenantId', () => {
    it('should return environment when found', async () => {
      const environment = createMockEnvironment();
      mockEnvironmentService.getByIdAndTenantId.mockResolvedValue(environment);

      const result = await environmentUseCase.getEnvironmentByIdAndTenantId(
        environment.id,
        environment.tenantId
      );

      expect(result).toEqual(environment);
      expect(mockEnvironmentService.getByIdAndTenantId).toHaveBeenCalledWith(
        environment.id,
        environment.tenantId
      );
    });

    it('should return undefined when environment not found', async () => {
      const environmentId = faker.string.uuid();
      const tenantId = faker.string.uuid();

      mockEnvironmentService.getByIdAndTenantId.mockResolvedValue(undefined);

      const result = await environmentUseCase.getEnvironmentByIdAndTenantId(
        environmentId,
        tenantId
      );

      expect(result).toBeUndefined();
    });

    it('should throw ValidationError for invalid environment id', async () => {
      const tenantId = faker.string.uuid();

      await expect(
        environmentUseCase.getEnvironmentByIdAndTenantId('invalid-id', tenantId)
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid tenant id', async () => {
      const environmentId = faker.string.uuid();

      await expect(
        environmentUseCase.getEnvironmentByIdAndTenantId(
          environmentId,
          'invalid-id'
        )
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('deleteEnvironmentByIdAndTenantId', () => {
    it('should delete environment successfully', async () => {
      const environmentId = faker.string.uuid();
      const tenantId = faker.string.uuid();

      mockEnvironmentService.deleteByIdAndTenantId.mockResolvedValue(true);

      const result = await environmentUseCase.deleteEnvironmentByIdAndTenantId(
        environmentId,
        tenantId
      );

      expect(result).toBe(true);
      expect(mockEnvironmentService.deleteByIdAndTenantId).toHaveBeenCalledWith(
        environmentId,
        tenantId
      );
    });

    it('should throw ValidationError for invalid environment id', async () => {
      const tenantId = faker.string.uuid();

      await expect(
        environmentUseCase.deleteEnvironmentByIdAndTenantId(
          'invalid-id',
          tenantId
        )
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid tenant id', async () => {
      const environmentId = faker.string.uuid();

      await expect(
        environmentUseCase.deleteEnvironmentByIdAndTenantId(
          environmentId,
          'invalid-id'
        )
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('updateEnvironmentNonSensitivePropertiesByIdAndTenantId', () => {
    it('should update environment name successfully', async () => {
      const environmentId = faker.string.uuid();
      const tenantId = faker.string.uuid();
      const dto = { name: 'staging' };

      mockEnvironmentService.updateNonSensitivePropertiesByIdAndTenantId.mockResolvedValue(
        true
      );

      const result =
        await environmentUseCase.updateEnvironmentNonSensitivePropertiesByIdAndTenantId(
          environmentId,
          tenantId,
          dto
        );

      expect(result).toBe(true);
      expect(
        mockEnvironmentService.updateNonSensitivePropertiesByIdAndTenantId
      ).toHaveBeenCalledWith(environmentId, tenantId, dto);
    });

    it('should throw ValidationError for invalid environment id', async () => {
      const tenantId = faker.string.uuid();
      const dto = { name: 'staging' };

      await expect(
        environmentUseCase.updateEnvironmentNonSensitivePropertiesByIdAndTenantId(
          'invalid-id',
          tenantId,
          dto
        )
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid tenant id', async () => {
      const environmentId = faker.string.uuid();
      const dto = { name: 'staging' };

      await expect(
        environmentUseCase.updateEnvironmentNonSensitivePropertiesByIdAndTenantId(
          environmentId,
          'invalid-id',
          dto
        )
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for empty dto', async () => {
      const environmentId = faker.string.uuid();
      const tenantId = faker.string.uuid();

      await expect(
        environmentUseCase.updateEnvironmentNonSensitivePropertiesByIdAndTenantId(
          environmentId,
          tenantId,
          {} as any
        )
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('setEnvironmentCustomPropertyByIdAndTenantId', () => {
    it('should set custom property successfully', async () => {
      const environmentId = faker.string.uuid();
      const tenantId = faker.string.uuid();
      const dto = { myKey: 'myValue' };

      mockEnvironmentService.setCustomPropertyByIdAndTenantId.mockResolvedValue(
        true
      );

      const result =
        await environmentUseCase.setEnvironmentCustomPropertyByIdAndTenantId(
          environmentId,
          tenantId,
          dto
        );

      expect(result).toBe(true);
      expect(
        mockEnvironmentService.setCustomPropertyByIdAndTenantId
      ).toHaveBeenCalledWith(environmentId, tenantId, dto);
    });

    it('should throw ValidationError for invalid environment id', async () => {
      const tenantId = faker.string.uuid();

      await expect(
        environmentUseCase.setEnvironmentCustomPropertyByIdAndTenantId(
          'invalid-id',
          tenantId,
          { key: 'value' }
        )
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid tenant id', async () => {
      const environmentId = faker.string.uuid();

      await expect(
        environmentUseCase.setEnvironmentCustomPropertyByIdAndTenantId(
          environmentId,
          'invalid-id',
          { key: 'value' }
        )
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for empty custom properties', async () => {
      const environmentId = faker.string.uuid();
      const tenantId = faker.string.uuid();

      await expect(
        environmentUseCase.setEnvironmentCustomPropertyByIdAndTenantId(
          environmentId,
          tenantId,
          {}
        )
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('deleteEnvironmentCustomPropertyByIdAndTenantId', () => {
    it('should delete custom property successfully', async () => {
      const environmentId = faker.string.uuid();
      const tenantId = faker.string.uuid();
      const propertyKey = 'myKey';

      mockEnvironmentService.deleteCustomPropertyByIdAndTenantId.mockResolvedValue(
        true
      );

      const result =
        await environmentUseCase.deleteEnvironmentCustomPropertyByIdAndTenantId(
          environmentId,
          tenantId,
          propertyKey
        );

      expect(result).toBe(true);
      expect(
        mockEnvironmentService.deleteCustomPropertyByIdAndTenantId
      ).toHaveBeenCalledWith(environmentId, tenantId, propertyKey);
    });

    it('should throw ValidationError for invalid environment id', async () => {
      const tenantId = faker.string.uuid();

      await expect(
        environmentUseCase.deleteEnvironmentCustomPropertyByIdAndTenantId(
          'invalid-id',
          tenantId,
          'key'
        )
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid tenant id', async () => {
      const environmentId = faker.string.uuid();

      await expect(
        environmentUseCase.deleteEnvironmentCustomPropertyByIdAndTenantId(
          environmentId,
          'invalid-id',
          'key'
        )
      ).rejects.toThrow(ValidationError);
    });

    it('should handle property keys with special characters', async () => {
      const environmentId = faker.string.uuid();
      const tenantId = faker.string.uuid();
      const propertyKey = 'my-special_key.name';

      mockEnvironmentService.deleteCustomPropertyByIdAndTenantId.mockResolvedValue(
        true
      );

      const result =
        await environmentUseCase.deleteEnvironmentCustomPropertyByIdAndTenantId(
          environmentId,
          tenantId,
          propertyKey
        );

      expect(result).toBe(true);
    });
  });
});
