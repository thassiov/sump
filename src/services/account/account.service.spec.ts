import { ServiceOperationError } from '../../lib/errors/service-operation.error';
import { logger } from '../../lib/logger';
import { AccountService } from './account.service';
import { IAccount } from './types/account.type';
import { ICreateAccountDto, IUpdateAccountDto } from './types/dto.type';
import { IAccountRepository } from './types/repository.type';

describe('Account Service', () => {
  beforeAll(() => {
    logger.info = jest.fn();
    logger.error = jest.fn();
  });

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

        await expect(
          accountService.createAccount(mockAccountInfo as ICreateAccountDto)
        ).rejects.toThrow(ServiceOperationError);

        expect(logger.info).not.toHaveBeenCalled();
        expect(logger.error).toHaveBeenCalledTimes(1);
      }
    );

    it('should fail to create a new account due to repository error', async () => {
      mockAccountRepository.create.mockRejectedValueOnce(
        new Error('repository-failure')
      );

      const mockAccount = {
        email: 'fake@email.com',
        fullName: 'This Is The Full Name',
      };

      const accountService = new AccountService(mockAccountRepository);

      await expect(accountService.createAccount(mockAccount)).rejects.toThrow(
        'repository-failure'
      );

      expect(logger.info).not.toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalledTimes(1);
    });

    it('should create a new account', async () => {
      const mockAccount = {
        email: 'user@email.com',
        fullName: 'This Is The Full Name',
      };

      mockAccountRepository.create.mockResolvedValueOnce('id');

      const accountService = new AccountService(mockAccountRepository);

      const result = await accountService.createAccount(mockAccount);

      expect(result).toEqual({ accountId: 'id' });

      expect(logger.info).toHaveBeenCalledTimes(1);
      expect(logger.error).not.toHaveBeenCalled();
    });
  });

  describe('getAccountById', () => {
    it('should retrieve a account', async () => {
      const mockAccount: IAccount = {
        id: 'id',
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
      const mockAccountId = 'id';
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
      const mockAccountId = 'id';
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
