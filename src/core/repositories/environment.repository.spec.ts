import { faker } from '@faker-js/faker';
import { EnvironmentRepository } from './environment.repository';
import { NotExpectedError, NotFoundError, UnexpectedError } from '../../lib/errors';

describe('EnvironmentRepository', () => {
  let environmentRepository: EnvironmentRepository;
  let mockDbClient: any;

  beforeEach(() => {
    mockDbClient = jest.fn();
    mockDbClient.insert = jest.fn();

    environmentRepository = new EnvironmentRepository(mockDbClient);
  });

  const createMockEnvironment = (overrides = {}) => ({
    id: faker.string.uuid(),
    tenantId: faker.string.uuid(),
    name: faker.company.name(),
    customProperties: {},
    ...overrides,
  });

  describe('create', () => {
    it('should create an environment and return the id', async () => {
      const environmentId = faker.string.uuid();
      const tenantId = faker.string.uuid();
      const dto = {
        tenantId,
        name: 'Test Environment',
        customProperties: {},
      };

      const mockBuilder = {
        into: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([{ id: environmentId }]),
      };
      mockDbClient.insert.mockReturnValue(mockBuilder);

      const result = await environmentRepository.create(dto);

      expect(result).toBe(environmentId);
      expect(mockDbClient.insert).toHaveBeenCalledWith(dto);
      expect(mockBuilder.into).toHaveBeenCalledWith('environment');
      expect(mockBuilder.returning).toHaveBeenCalledWith('id');
    });

    it('should use transaction when provided', async () => {
      const environmentId = faker.string.uuid();
      const tenantId = faker.string.uuid();
      const dto = {
        tenantId,
        name: 'Test Environment',
        customProperties: {},
      };
      const mockTransaction = {} as any;

      const mockQueryResult = {
        then: (resolve: (value: { id: string }[]) => void) => resolve([{ id: environmentId }]),
        transacting: jest.fn(),
      };
      const mockBuilder = {
        into: jest.fn().mockReturnThis(),
        returning: jest.fn().mockReturnValue(mockQueryResult),
      };
      mockDbClient.insert.mockReturnValue(mockBuilder);

      await environmentRepository.create(dto, mockTransaction);

      expect(mockQueryResult.transacting).toHaveBeenCalledWith(mockTransaction);
    });

    it('should throw NotExpectedError when insert returns no result', async () => {
      const tenantId = faker.string.uuid();
      const dto = {
        tenantId,
        name: 'Test Environment',
        customProperties: {},
      };

      const mockBuilder = {
        into: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([]),
      };
      mockDbClient.insert.mockReturnValue(mockBuilder);

      await expect(environmentRepository.create(dto)).rejects.toThrow(NotExpectedError);
    });

    it('should throw UnexpectedError on database error', async () => {
      const tenantId = faker.string.uuid();
      const dto = {
        tenantId,
        name: 'Test Environment',
        customProperties: {},
      };

      const mockBuilder = {
        into: jest.fn().mockReturnThis(),
        returning: jest.fn().mockRejectedValue(new Error('Database error')),
      };
      mockDbClient.insert.mockReturnValue(mockBuilder);

      await expect(environmentRepository.create(dto)).rejects.toThrow(UnexpectedError);
    });

    it('should rethrow custom errors as-is', async () => {
      const tenantId = faker.string.uuid();
      const dto = {
        tenantId,
        name: 'Test Environment',
        customProperties: {},
      };
      const customError = new NotFoundError({ context: 'TEST' });

      const mockBuilder = {
        into: jest.fn().mockReturnThis(),
        returning: jest.fn().mockRejectedValue(customError),
      };
      mockDbClient.insert.mockReturnValue(mockBuilder);

      await expect(environmentRepository.create(dto)).rejects.toThrow(NotFoundError);
    });
  });

  describe('getById', () => {
    it('should return environment when found', async () => {
      const environment = createMockEnvironment();

      const mockBuilder = {
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(environment),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      const result = await environmentRepository.getById(environment.id);

      expect(result).toEqual(environment);
      expect(mockDbClient).toHaveBeenCalledWith('environment');
      expect(mockBuilder.where).toHaveBeenCalledWith('id', environment.id);
    });

    it('should return undefined when environment not found', async () => {
      const environmentId = faker.string.uuid();

      const mockBuilder = {
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(undefined),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      const result = await environmentRepository.getById(environmentId);

      expect(result).toBeUndefined();
    });

    it('should throw UnexpectedError on database error', async () => {
      const environmentId = faker.string.uuid();

      const mockBuilder = {
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        first: jest.fn().mockRejectedValue(new Error('Database error')),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      await expect(environmentRepository.getById(environmentId)).rejects.toThrow(UnexpectedError);
    });
  });

  describe('getByIdAndTenantId', () => {
    it('should return environment when found', async () => {
      const environment = createMockEnvironment();

      const mockBuilder = {
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(environment),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      const result = await environmentRepository.getByIdAndTenantId(
        environment.id,
        environment.tenantId
      );

      expect(result).toEqual(environment);
      expect(mockDbClient).toHaveBeenCalledWith('environment');
      expect(mockBuilder.where).toHaveBeenCalledWith({ id: environment.id, tenantId: environment.tenantId });
    });

    it('should return undefined when environment not found', async () => {
      const environmentId = faker.string.uuid();
      const tenantId = faker.string.uuid();

      const mockBuilder = {
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(undefined),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      const result = await environmentRepository.getByIdAndTenantId(environmentId, tenantId);

      expect(result).toBeUndefined();
    });

    it('should throw UnexpectedError on database error', async () => {
      const environmentId = faker.string.uuid();
      const tenantId = faker.string.uuid();

      const mockBuilder = {
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        first: jest.fn().mockRejectedValue(new Error('Database error')),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      await expect(
        environmentRepository.getByIdAndTenantId(environmentId, tenantId)
      ).rejects.toThrow(UnexpectedError);
    });
  });

  describe('getByTenantId', () => {
    it('should return environments when found', async () => {
      const tenantId = faker.string.uuid();
      const environments = [
        createMockEnvironment({ tenantId }),
        createMockEnvironment({ tenantId }),
      ];

      const mockBuilder = {
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue(environments),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      const result = await environmentRepository.getByTenantId(tenantId);

      expect(result).toEqual(environments);
      expect(mockDbClient).toHaveBeenCalledWith('environment');
      expect(mockBuilder.where).toHaveBeenCalledWith('tenantId', tenantId);
    });

    it('should return undefined when no environments found', async () => {
      const tenantId = faker.string.uuid();

      const mockBuilder = {
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue([]),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      const result = await environmentRepository.getByTenantId(tenantId);

      expect(result).toBeUndefined();
    });

    it('should throw UnexpectedError on database error', async () => {
      const tenantId = faker.string.uuid();

      const mockBuilder = {
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockRejectedValue(new Error('Database error')),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      await expect(environmentRepository.getByTenantId(tenantId)).rejects.toThrow(UnexpectedError);
    });
  });

  describe('updateByIdAndTenantId', () => {
    it('should update environment and return true', async () => {
      const environmentId = faker.string.uuid();
      const tenantId = faker.string.uuid();
      const dto = { name: 'Updated Environment' };

      const mockBuilder = {
        where: jest.fn().mockReturnValue({
          update: jest.fn().mockResolvedValue(1),
        }),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      const result = await environmentRepository.updateByIdAndTenantId(
        environmentId,
        tenantId,
        dto
      );

      expect(result).toBe(true);
      expect(mockDbClient).toHaveBeenCalledWith('environment');
      expect(mockBuilder.where).toHaveBeenCalledWith({ id: environmentId, tenantId });
    });

    it('should throw NotFoundError when environment not found', async () => {
      const environmentId = faker.string.uuid();
      const tenantId = faker.string.uuid();
      const dto = { name: 'Updated Environment' };

      const mockBuilder = {
        where: jest.fn().mockReturnValue({
          update: jest.fn().mockResolvedValue(0),
        }),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      await expect(
        environmentRepository.updateByIdAndTenantId(environmentId, tenantId, dto)
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw UnexpectedError on database error', async () => {
      const environmentId = faker.string.uuid();
      const tenantId = faker.string.uuid();
      const dto = { name: 'Updated Environment' };

      const mockBuilder = {
        where: jest.fn().mockReturnValue({
          update: jest.fn().mockRejectedValue(new Error('Database error')),
        }),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      await expect(
        environmentRepository.updateByIdAndTenantId(environmentId, tenantId, dto)
      ).rejects.toThrow(UnexpectedError);
    });

    it('should rethrow custom errors as-is', async () => {
      const environmentId = faker.string.uuid();
      const tenantId = faker.string.uuid();
      const dto = { name: 'Updated Environment' };
      const customError = new NotFoundError({ context: 'TEST' });

      const mockBuilder = {
        where: jest.fn().mockReturnValue({
          update: jest.fn().mockRejectedValue(customError),
        }),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      await expect(
        environmentRepository.updateByIdAndTenantId(environmentId, tenantId, dto)
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('deleteById', () => {
    it('should delete environment and return true', async () => {
      const environmentId = faker.string.uuid();

      const mockBuilder = {
        where: jest.fn().mockReturnValue({
          del: jest.fn().mockResolvedValue(1),
        }),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      const result = await environmentRepository.deleteById(environmentId);

      expect(result).toBe(true);
      expect(mockDbClient).toHaveBeenCalledWith('environment');
      expect(mockBuilder.where).toHaveBeenCalledWith('id', environmentId);
    });

    it('should throw NotFoundError when environment not found', async () => {
      const environmentId = faker.string.uuid();

      const mockBuilder = {
        where: jest.fn().mockReturnValue({
          del: jest.fn().mockResolvedValue(0),
        }),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      await expect(environmentRepository.deleteById(environmentId)).rejects.toThrow(NotFoundError);
    });

    it('should throw UnexpectedError on database error', async () => {
      const environmentId = faker.string.uuid();

      const mockBuilder = {
        where: jest.fn().mockReturnValue({
          del: jest.fn().mockRejectedValue(new Error('Database error')),
        }),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      await expect(environmentRepository.deleteById(environmentId)).rejects.toThrow(UnexpectedError);
    });

    it('should rethrow custom errors as-is', async () => {
      const environmentId = faker.string.uuid();
      const customError = new NotFoundError({ context: 'TEST' });

      const mockBuilder = {
        where: jest.fn().mockReturnValue({
          del: jest.fn().mockRejectedValue(customError),
        }),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      await expect(environmentRepository.deleteById(environmentId)).rejects.toThrow(NotFoundError);
    });
  });

  describe('deleteByIdAndTenantId', () => {
    it('should delete environment and return true', async () => {
      const environmentId = faker.string.uuid();
      const tenantId = faker.string.uuid();

      const mockBuilder = {
        where: jest.fn().mockReturnValue({
          del: jest.fn().mockResolvedValue(1),
        }),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      const result = await environmentRepository.deleteByIdAndTenantId(environmentId, tenantId);

      expect(result).toBe(true);
      expect(mockDbClient).toHaveBeenCalledWith('environment');
      expect(mockBuilder.where).toHaveBeenCalledWith({ id: environmentId, tenantId });
    });

    it('should throw NotFoundError when environment not found', async () => {
      const environmentId = faker.string.uuid();
      const tenantId = faker.string.uuid();

      const mockBuilder = {
        where: jest.fn().mockReturnValue({
          del: jest.fn().mockResolvedValue(0),
        }),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      await expect(
        environmentRepository.deleteByIdAndTenantId(environmentId, tenantId)
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw UnexpectedError on database error', async () => {
      const environmentId = faker.string.uuid();
      const tenantId = faker.string.uuid();

      const mockBuilder = {
        where: jest.fn().mockReturnValue({
          del: jest.fn().mockRejectedValue(new Error('Database error')),
        }),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      await expect(
        environmentRepository.deleteByIdAndTenantId(environmentId, tenantId)
      ).rejects.toThrow(UnexpectedError);
    });

    it('should rethrow custom errors as-is', async () => {
      const environmentId = faker.string.uuid();
      const tenantId = faker.string.uuid();
      const customError = new NotFoundError({ context: 'TEST' });

      const mockBuilder = {
        where: jest.fn().mockReturnValue({
          del: jest.fn().mockRejectedValue(customError),
        }),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      await expect(
        environmentRepository.deleteByIdAndTenantId(environmentId, tenantId)
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('setCustomPropertyByIdAndTenantId', () => {
    it('should set custom property and return true', async () => {
      const environmentId = faker.string.uuid();
      const tenantId = faker.string.uuid();
      const customProperties = { myKey: 'myValue' };

      const mockBuilder = {
        where: jest.fn().mockReturnValue({
          jsonSet: jest.fn().mockResolvedValue(undefined),
        }),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      const result = await environmentRepository.setCustomPropertyByIdAndTenantId(
        environmentId,
        tenantId,
        customProperties
      );

      expect(result).toBe(true);
      expect(mockDbClient).toHaveBeenCalledWith('environment');
      expect(mockBuilder.where).toHaveBeenCalledWith({ id: environmentId, tenantId });
    });

    it('should throw UnexpectedError on database error', async () => {
      const environmentId = faker.string.uuid();
      const tenantId = faker.string.uuid();
      const customProperties = { myKey: 'myValue' };

      const mockBuilder = {
        where: jest.fn().mockReturnValue({
          jsonSet: jest.fn().mockRejectedValue(new Error('Database error')),
        }),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      await expect(
        environmentRepository.setCustomPropertyByIdAndTenantId(
          environmentId,
          tenantId,
          customProperties
        )
      ).rejects.toThrow(UnexpectedError);
    });

    it('should rethrow custom errors as-is', async () => {
      const environmentId = faker.string.uuid();
      const tenantId = faker.string.uuid();
      const customProperties = { myKey: 'myValue' };
      const customError = new NotFoundError({ context: 'TEST' });

      const mockBuilder = {
        where: jest.fn().mockReturnValue({
          jsonSet: jest.fn().mockRejectedValue(customError),
        }),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      await expect(
        environmentRepository.setCustomPropertyByIdAndTenantId(
          environmentId,
          tenantId,
          customProperties
        )
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('deleteCustomPropertyByIdAndTenantId', () => {
    it('should delete custom property and return true', async () => {
      const environmentId = faker.string.uuid();
      const tenantId = faker.string.uuid();
      const propertyKey = 'myKey';

      const mockBuilder = {
        where: jest.fn().mockReturnValue({
          jsonRemove: jest.fn().mockResolvedValue(undefined),
        }),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      const result = await environmentRepository.deleteCustomPropertyByIdAndTenantId(
        environmentId,
        tenantId,
        propertyKey
      );

      expect(result).toBe(true);
      expect(mockDbClient).toHaveBeenCalledWith('environment');
      expect(mockBuilder.where).toHaveBeenCalledWith({ id: environmentId, tenantId });
    });

    it('should throw UnexpectedError on database error', async () => {
      const environmentId = faker.string.uuid();
      const tenantId = faker.string.uuid();
      const propertyKey = 'myKey';

      const mockBuilder = {
        where: jest.fn().mockReturnValue({
          jsonRemove: jest.fn().mockRejectedValue(new Error('Database error')),
        }),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      await expect(
        environmentRepository.deleteCustomPropertyByIdAndTenantId(
          environmentId,
          tenantId,
          propertyKey
        )
      ).rejects.toThrow(UnexpectedError);
    });

    it('should rethrow custom errors as-is', async () => {
      const environmentId = faker.string.uuid();
      const tenantId = faker.string.uuid();
      const propertyKey = 'myKey';
      const customError = new NotFoundError({ context: 'TEST' });

      const mockBuilder = {
        where: jest.fn().mockReturnValue({
          jsonRemove: jest.fn().mockRejectedValue(customError),
        }),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      await expect(
        environmentRepository.deleteCustomPropertyByIdAndTenantId(
          environmentId,
          tenantId,
          propertyKey
        )
      ).rejects.toThrow(NotFoundError);
    });
  });
});
