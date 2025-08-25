import { UnexpectedError, ValidationError } from '../../lib/errors';
import { AccountService } from './account.service';
import { IAccount } from './types/account.type';
import { ICreateAccountDto, IUpdateAccountDto } from './types/dto.type';
import { IAccountRepository } from './types/repository.type';

describe('Account Service', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  const mockAccountRepository = {
    create: jest.fn(),
    getAccountById: jest.fn(),
    removeAccountById: jest.fn(),
    updateAccountById: jest.fn(),
  };

  describe('createAccount', () => {
    it.each([
      [{}],
      [true],
      [10],
      [{ email: '', fullName: '' }],
      [{ email: undefined, fullName: undefined }],
      [{ email: 2, fullName: 3 }],
    ])(
      'should fail to create a new account due to validation error (%p)',
      async (mockAccountInfo) => {
        const accountService = new AccountService(mockAccountRepository);

        const loggerSpyInfo = jest.spyOn(
          (accountService as unknown as { logger: { info: typeof jest.fn } })
            .logger,
          'info'
        );
        const loggerSpyError = jest.spyOn(
          (accountService as unknown as { logger: { error: typeof jest.fn } })
            .logger,
          'error'
        );

        await expect(
          accountService.createAccount(mockAccountInfo as ICreateAccountDto)
        ).rejects.toThrow(ValidationError);

        expect(loggerSpyInfo).not.toHaveBeenCalled();
        expect(loggerSpyError).toHaveBeenCalledTimes(1);
      }
    );

    it('should fail to create a new account due to repository error', async () => {
      const mockThrownError = new UnexpectedError({
        details: { message: 'repository-failure' },
      });
      mockAccountRepository.create.mockRejectedValueOnce(mockThrownError);

      const mockAccount = {
        email: 'fake@email.com',
        fullName: 'This Is The Full Name',
      };

      const accountService = new AccountService(mockAccountRepository);

      const loggerSpyInfo = jest.spyOn(
        (accountService as unknown as { logger: { info: typeof jest.fn } })
          .logger,
        'info'
      );
      const loggerSpyError = jest.spyOn(
        (accountService as unknown as { logger: { error: typeof jest.fn } })
          .logger,
        'error'
      );

      let thrown;

      try {
        await accountService.createAccount(mockAccount);
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
      const mockAccount = {
        email: 'user@email.com',
        fullName: 'This Is The Full Name',
      };

      const mockAccountId = '3705306c-2a03-48da-91fa-707065f1c780';

      mockAccountRepository.create.mockResolvedValueOnce(mockAccountId);

      const accountService = new AccountService(mockAccountRepository);

      const loggerSpyInfo = jest.spyOn(
        (accountService as unknown as { logger: { info: typeof jest.fn } })
          .logger,
        'info'
      );
      const loggerSpyError = jest.spyOn(
        (accountService as unknown as { logger: { error: typeof jest.fn } })
          .logger,
        'error'
      );

      const result = await accountService.createAccount(mockAccount);

      expect(result).toEqual(mockAccountId);

      expect(loggerSpyInfo).toHaveBeenCalledTimes(1);
      expect(loggerSpyError).not.toHaveBeenCalled();
    });
  });

  describe('getAccountById', () => {
    it('should retrieve a account', async () => {
      const mockAccount: IAccount = {
        id: '4763444c-52aa-42c5-833d-7a7d5e683cb6',
        email: 'email',
        fullName: 'This Is The Full Name',
        createdAt: 'date',
        updatedAt: 'date',
      };

      mockAccountRepository.getAccountById.mockResolvedValue(mockAccount);

      const instance = new AccountService(
        mockAccountRepository as unknown as IAccountRepository
      );

      const result = await instance.getAccountById(mockAccount.id);

      expect(result).toEqual(mockAccount);
    });
  });

  describe('removeAccountbyId', () => {
    it('should delete an account', async () => {
      const mockAccountId = '9abde0b5-2a4c-43ff-ad9d-c47198a6cd11';
      const mockResult = true;

      mockAccountRepository.removeAccountById.mockResolvedValue(mockResult);

      const instance = new AccountService(
        mockAccountRepository as unknown as IAccountRepository
      );

      const result = await instance.removeAccountById(mockAccountId);

      expect(result).toBe(mockResult);
    });
  });

  describe('updateAccountById', () => {
    it('should update an account', async () => {
      const mockAccountId = '63827dd1-b8b8-42e2-ae78-bd71d73958a3';
      const mockUpdateAccountDto: IUpdateAccountDto = {
        fullName: 'This Is The Full Name',
      };
      const mockUpdateAccountResult = true;

      mockAccountRepository.updateAccountById.mockResolvedValue(
        mockUpdateAccountResult
      );

      const instance = new AccountService(
        mockAccountRepository as unknown as IAccountRepository
      );

      const result = await instance.updateAccountById(
        mockAccountId,
        mockUpdateAccountDto
      );

      expect(result).toEqual(mockUpdateAccountResult);
    });
  });
});
