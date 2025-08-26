import { UnexpectedError, ValidationError } from '../../lib/errors';
import { TenantEnvironmentAccountService } from './tenant-environment-account.service';
import {
  ICreateTenantEnvironmentAccountDto,
  IUpdateTenantEnvironmentAccountDto,
} from './types/dto.type';
import { ITenantEnvironmentAccountRepository } from './types/repository.type';
import { ITenantEnvironmentAccount } from './types/tenant-environment-account.type';

describe('TenantEnvironmentAccount Service', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  const mockTenantEnvironmentAccountRepository = {
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
      [{ email: '', fullName: '' }],
      [{ email: undefined, fullName: undefined }],
      [{ email: 2, fullName: 3 }],
    ])(
      'should fail to create a new account due to validation error (%p)',
      async (mockTenantEnvironmentAccountInfo) => {
        const tenantEnvironmentAccountService =
          new TenantEnvironmentAccountService(
            mockTenantEnvironmentAccountRepository
          );

        const loggerSpyInfo = jest.spyOn(
          (
            tenantEnvironmentAccountService as unknown as {
              logger: { info: typeof jest.fn };
            }
          ).logger,
          'info'
        );
        const loggerSpyError = jest.spyOn(
          (
            tenantEnvironmentAccountService as unknown as {
              logger: { error: typeof jest.fn };
            }
          ).logger,
          'error'
        );

        await expect(
          tenantEnvironmentAccountService.create(
            mockTenantEnvironmentAccountInfo as ICreateTenantEnvironmentAccountDto
          )
        ).rejects.toThrow(ValidationError);

        expect(loggerSpyInfo).not.toHaveBeenCalled();
        expect(loggerSpyError).toHaveBeenCalledTimes(1);
      }
    );

    it('should fail to create a new account due to repository error', async () => {
      const mockThrownError = new UnexpectedError({
        details: { message: 'repository-failure' },
      });
      mockTenantEnvironmentAccountRepository.create.mockRejectedValueOnce(
        mockThrownError
      );

      const mockTenantEnvironmentAccount = {
        email: 'fake@email.com',
        fullName: 'This Is The Full Name',
      };

      const tenantEnvironmentAccountService =
        new TenantEnvironmentAccountService(
          mockTenantEnvironmentAccountRepository
        );

      const loggerSpyInfo = jest.spyOn(
        (
          tenantEnvironmentAccountService as unknown as {
            logger: { info: typeof jest.fn };
          }
        ).logger,
        'info'
      );
      const loggerSpyError = jest.spyOn(
        (
          tenantEnvironmentAccountService as unknown as {
            logger: { error: typeof jest.fn };
          }
        ).logger,
        'error'
      );

      let thrown;

      try {
        await tenantEnvironmentAccountService.create(
          mockTenantEnvironmentAccount
        );
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

    it('should create a new account', async () => {
      const mockTenantEnvironmentAccount = {
        email: 'user@email.com',
        fullName: 'This Is The Full Name',
      };

      const mockTenantEnvironmentAccountId =
        '3705306c-2a03-48da-91fa-707065f1c780';

      mockTenantEnvironmentAccountRepository.create.mockResolvedValueOnce(
        mockTenantEnvironmentAccountId
      );

      const tenantEnvironmentAccountService =
        new TenantEnvironmentAccountService(
          mockTenantEnvironmentAccountRepository
        );

      const loggerSpyInfo = jest.spyOn(
        (
          tenantEnvironmentAccountService as unknown as {
            logger: { info: typeof jest.fn };
          }
        ).logger,
        'info'
      );
      const loggerSpyError = jest.spyOn(
        (
          tenantEnvironmentAccountService as unknown as {
            logger: { error: typeof jest.fn };
          }
        ).logger,
        'error'
      );

      const result = await tenantEnvironmentAccountService.create(
        mockTenantEnvironmentAccount
      );

      expect(result).toEqual(mockTenantEnvironmentAccountId);

      expect(loggerSpyInfo).toHaveBeenCalledTimes(1);
      expect(loggerSpyError).not.toHaveBeenCalled();
    });
  });

  describe('getById', () => {
    it('should retrieve a account', async () => {
      const mockTenantEnvironmentAccount: ITenantEnvironmentAccount = {
        id: '4763444c-52aa-42c5-833d-7a7d5e683cb6',
        email: 'email',
        fullName: 'This Is The Full Name',
        createdAt: 'date',
        updatedAt: 'date',
      };

      mockTenantEnvironmentAccountRepository.getById.mockResolvedValue(
        mockTenantEnvironmentAccount
      );

      const instance = new TenantEnvironmentAccountService(
        mockTenantEnvironmentAccountRepository as unknown as ITenantEnvironmentAccountRepository
      );

      const result = await instance.getById(mockTenantEnvironmentAccount.id);

      expect(result).toEqual(mockTenantEnvironmentAccount);
    });
  });

  describe('deleteTenantEnvironmentAccountbyId', () => {
    it('should delete an account', async () => {
      const mockTenantEnvironmentAccountId =
        '9abde0b5-2a4c-43ff-ad9d-c47198a6cd11';
      const mockResult = true;

      mockTenantEnvironmentAccountRepository.deleteById.mockResolvedValue(
        mockResult
      );

      const instance = new TenantEnvironmentAccountService(
        mockTenantEnvironmentAccountRepository as unknown as ITenantEnvironmentAccountRepository
      );

      const result = await instance.deleteById(mockTenantEnvironmentAccountId);

      expect(result).toBe(mockResult);
    });
  });

  describe('updateById', () => {
    it('should update an account', async () => {
      const mockTenantEnvironmentAccountId =
        '63827dd1-b8b8-42e2-ae78-bd71d73958a3';
      const mockUpdateTenantEnvironmentAccountDto: IUpdateTenantEnvironmentAccountDto =
        {
          fullName: 'This Is The Full Name',
        };
      const mockUpdateTenantEnvironmentAccountResult = true;

      mockTenantEnvironmentAccountRepository.updateById.mockResolvedValue(
        mockUpdateTenantEnvironmentAccountResult
      );

      const instance = new TenantEnvironmentAccountService(
        mockTenantEnvironmentAccountRepository as unknown as ITenantEnvironmentAccountRepository
      );

      const result = await instance.updateById(
        mockTenantEnvironmentAccountId,
        mockUpdateTenantEnvironmentAccountDto
      );

      expect(result).toEqual(mockUpdateTenantEnvironmentAccountResult);
    });
  });
});
