import { UnexpectedError, ValidationError } from '../../lib/errors';
import { TenantEnvironmentService } from './tenant-environment.service';
import {
  ICreateTenantEnvironmentDto,
  IUpdateTenantEnvironmentDto,
} from './types/dto.type';
import { ITenantEnvironmentRepository } from './types/repository.type';
import { ITenantEnvironment } from './types/tenant-environment.type';

describe('TenantEnvironment Service', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  const mockTenantEnvironmentRepository = {
    create: jest.fn(),
    getById: jest.fn(),
    deleteById: jest.fn(),
    updateById: jest.fn(),
  };

  describe('create', () => {
    it.each([
      [{}],
      [true],
      [10],
      [{ name: '', ownerId: '' }],
      [{ name: undefined, ownerId: undefined }],
      [{ name: 2, ownerId: 3 }],
    ])(
      'should fail to create a new tenant environment due to validation error (%p)',
      async (mockTenantEnvironmentInfo) => {
        const tenantService = new TenantEnvironmentService(
          mockTenantEnvironmentRepository
        );

        const loggerSpyInfo = jest.spyOn(
          (tenantService as unknown as { logger: { info: typeof jest.fn } })
            .logger,
          'info'
        );
        const loggerSpyError = jest.spyOn(
          (tenantService as unknown as { logger: { error: typeof jest.fn } })
            .logger,
          'error'
        );

        await expect(
          tenantService.create(
            mockTenantEnvironmentInfo as ICreateTenantEnvironmentDto
          )
        ).rejects.toThrow(ValidationError);

        expect(loggerSpyInfo).not.toHaveBeenCalled();
        expect(loggerSpyError).toHaveBeenCalledTimes(1);
      }
    );

    it('should fail to create a new tenant due to repository error', async () => {
      const mockThrownError = new UnexpectedError({
        details: { message: 'repository-failure' },
      });
      mockTenantEnvironmentRepository.create.mockRejectedValueOnce(
        mockThrownError
      );

      const mockTenantEnvironment = {
        name: 'this tenant name',
        ownerId: 'fe1c191d-ebb5-4947-92aa-ace22a504079',
      };

      const tenantService = new TenantEnvironmentService(
        mockTenantEnvironmentRepository
      );

      const loggerSpyInfo = jest.spyOn(
        (tenantService as unknown as { logger: { info: typeof jest.fn } })
          .logger,
        'info'
      );
      const loggerSpyError = jest.spyOn(
        (tenantService as unknown as { logger: { error: typeof jest.fn } })
          .logger,
        'error'
      );

      let thrown;
      try {
        await tenantService.create(mockTenantEnvironment);
      } catch (error) {
        thrown = error;
      }

      expect(thrown).toBeInstanceOf(UnexpectedError);
      expect((thrown as UnexpectedError).details).toEqual(
        mockThrownError.details
      );

      expect(loggerSpyInfo).not.toHaveBeenCalled();
      expect(loggerSpyError).toHaveBeenCalledTimes(1);
    });

    it('should create a new tenant environment', async () => {
      const mockTenantEnvironment = {
        name: 'this tenant name',
        ownerId: '15af3610-e41b-424f-b1f2-8672b16cfb3c',
      };

      const mockTenantEnvironmentId = 'id';

      mockTenantEnvironmentRepository.create.mockResolvedValueOnce(
        mockTenantEnvironmentId
      );

      const tenantService = new TenantEnvironmentService(
        mockTenantEnvironmentRepository
      );

      const loggerSpyInfo = jest.spyOn(
        (tenantService as unknown as { logger: { info: typeof jest.fn } })
          .logger,
        'info'
      );
      const loggerSpyError = jest.spyOn(
        (tenantService as unknown as { logger: { error: typeof jest.fn } })
          .logger,
        'error'
      );

      const result = await tenantService.create(mockTenantEnvironment);

      expect(result).toEqual(mockTenantEnvironmentId);

      expect(loggerSpyInfo).toHaveBeenCalledTimes(1);
      expect(loggerSpyError).not.toHaveBeenCalled();
    });
  });

  describe('getById', () => {
    it('should retrieve a tenant environment', async () => {
      const mockTenantEnvironment: ITenantEnvironment = {
        id: 'cc20c36a-ce11-49bd-962a-d95d77807730',
        name: 'this tenant name',
        ownerId: 'c777aab5-a53b-4f55-b4fa-96ff1a703c10',
        createdAt: 'date',
        updatedAt: 'date',
      };

      mockTenantEnvironmentRepository.getById.mockResolvedValue(
        mockTenantEnvironment
      );

      const instance = new TenantEnvironmentService(
        mockTenantEnvironmentRepository as unknown as ITenantEnvironmentRepository
      );

      const result = await instance.getById(mockTenantEnvironment.id);

      expect(result).toEqual(mockTenantEnvironment);
    });
  });

  describe('removeTenantEnvironmentbyId', () => {
    it('should delete a tenant environment', async () => {
      const mockTenantEnvironmentId = '1310c276-2eb7-441c-9b5a-8b2efd874b1b';
      const mockResult = true;

      mockTenantEnvironmentRepository.deleteById.mockResolvedValue(mockResult);

      const instance = new TenantEnvironmentService(
        mockTenantEnvironmentRepository as unknown as ITenantEnvironmentRepository
      );

      const result = await instance.deleteById(mockTenantEnvironmentId);

      expect(result).toBe(mockResult);
    });
  });

  describe('updateById', () => {
    it('should update a tenant environment', async () => {
      const mockTenantEnvironmentId = 'dea9eb0d-bd75-4215-aebf-829f6d52a8ba';
      const mockUpdateTenantEnvironmentDto: IUpdateTenantEnvironmentDto = {
        name: 'this tenant name',
      };
      const mockUpdateTenantEnvironmentResult = true;

      mockTenantEnvironmentRepository.updateById.mockResolvedValue(
        mockUpdateTenantEnvironmentResult
      );

      const instance = new TenantEnvironmentService(
        mockTenantEnvironmentRepository as unknown as ITenantEnvironmentRepository
      );

      const result = await instance.updateById(
        mockTenantEnvironmentId,
        mockUpdateTenantEnvironmentDto
      );

      expect(result).toEqual(mockUpdateTenantEnvironmentResult);
    });
  });
});
