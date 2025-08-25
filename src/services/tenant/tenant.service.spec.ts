import { UnexpectedError, ValidationError } from '../../lib/errors';
import { TenantService } from './tenant.service';
import { ICreateTenantDto, IUpdateTenantDto } from './types/dto.type';
import { ITenantRepository } from './types/repository.type';
import { ITenant } from './types/tenant.type';

describe('Tenant Service', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  const mockTenantRepository = {
    create: jest.fn(),
    getTenantById: jest.fn(),
    removeTenantById: jest.fn(),
    updateTenantById: jest.fn(),
  };

  describe('createTenant', () => {
    it.each([
      [{}],
      [true],
      [10],
      [{ name: '', ownerId: '' }],
      [{ name: undefined, ownerId: undefined }],
      [{ name: 2, ownerId: 3 }],
    ])(
      'should fail to create a new tenant due to validation error (%p)',
      async (mockTenantInfo) => {
        const tenantService = new TenantService(mockTenantRepository);

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
          tenantService.createTenant(mockTenantInfo as ICreateTenantDto)
        ).rejects.toThrow(ValidationError);

        expect(loggerSpyInfo).not.toHaveBeenCalled();
        expect(loggerSpyError).toHaveBeenCalledTimes(1);
      }
    );

    it('should fail to create a new tenant due to repository error', async () => {
      const mockThrownError = new UnexpectedError({
        details: { message: 'repository-failure' },
      });
      mockTenantRepository.create.mockRejectedValueOnce(mockThrownError);

      const mockTenant = {
        name: 'this tenant name',
        ownerId: 'fe1c191d-ebb5-4947-92aa-ace22a504079',
      };

      const tenantService = new TenantService(mockTenantRepository);

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
        await tenantService.createTenant(mockTenant);
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

    it('should create a new tenant', async () => {
      const mockTenant = {
        name: 'this tenant name',
        ownerId: '15af3610-e41b-424f-b1f2-8672b16cfb3c',
      };

      const mockTenantId = 'id';

      mockTenantRepository.create.mockResolvedValueOnce(mockTenantId);

      const tenantService = new TenantService(mockTenantRepository);

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

      const result = await tenantService.createTenant(mockTenant);

      expect(result).toEqual(mockTenantId);

      expect(loggerSpyInfo).toHaveBeenCalledTimes(1);
      expect(loggerSpyError).not.toHaveBeenCalled();
    });
  });

  describe('getTenantById', () => {
    it('should retrieve a tenant', async () => {
      const mockTenant: ITenant = {
        id: 'cc20c36a-ce11-49bd-962a-d95d77807730',
        name: 'this tenant name',
        ownerId: 'c777aab5-a53b-4f55-b4fa-96ff1a703c10',
        createdAt: 'date',
        updatedAt: 'date',
      };

      mockTenantRepository.getTenantById.mockResolvedValue(mockTenant);

      const instance = new TenantService(
        mockTenantRepository as unknown as ITenantRepository
      );

      const result = await instance.getTenantById(mockTenant.id);

      expect(result).toEqual(mockTenant);
    });
  });

  describe('removeTenantbyId', () => {
    it('should delete an tenant', async () => {
      const mockTenantId = '1310c276-2eb7-441c-9b5a-8b2efd874b1b';
      const mockResult = true;

      mockTenantRepository.removeTenantById.mockResolvedValue(mockResult);

      const instance = new TenantService(
        mockTenantRepository as unknown as ITenantRepository
      );

      const result = await instance.removeTenantById(mockTenantId);

      expect(result).toBe(mockResult);
    });
  });

  describe('updateTenantById', () => {
    it('should update an tenant', async () => {
      const mockTenantId = 'dea9eb0d-bd75-4215-aebf-829f6d52a8ba';
      const mockUpdateTenantDto: IUpdateTenantDto = {
        name: 'this tenant name',
      };
      const mockUpdateTenantResult = true;

      mockTenantRepository.updateTenantById.mockResolvedValue(
        mockUpdateTenantResult
      );

      const instance = new TenantService(
        mockTenantRepository as unknown as ITenantRepository
      );

      const result = await instance.updateTenantById(
        mockTenantId,
        mockUpdateTenantDto
      );

      expect(result).toEqual(mockUpdateTenantResult);
    });
  });
});
