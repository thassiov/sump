import { IAccount } from '../../types/account.type';
import { IUpdateAccountDto } from '../../types/dto.type';
import { AccountService } from './account.service';
import { IAccountRepository } from './types/repository.type';

describe('Account Service', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  const mockAccountRepository = {
    getAccountById: jest.fn(),
    removeAccountById: jest.fn(),
    updateAccountById: jest.fn(),
  };

  describe('getAccountById', () => {
    it('should retrieve a account', async () => {
      const mockAccount: IAccount = {
        id: 'id',
        username: 'username',
        email: 'email',
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
        username: 'username',
        email: 'email',
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
