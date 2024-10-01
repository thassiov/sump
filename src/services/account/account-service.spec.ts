import { IAccountRepository } from 'src/repositories/account/types';
import { AccountService } from './account-service';
import { IAccount } from './types';

describe('Account Service', () => {
  let mockAccountRepository: IAccountRepository;

  beforeAll(() => {
    jest.restoreAllMocks();

    mockAccountRepository = {
      create: jest.fn(),
      retrieve: jest.fn(),
      remove: jest.fn(),
    };
  });

  describe('create', () => {
    it('should create a new account', async () => {
      const mockAccount = { id: 'id' };
      (mockAccountRepository.create as jest.Mock).mockResolvedValueOnce(
        mockAccount
      );

      const accountService = new AccountService(mockAccountRepository);

      const result = await accountService.create();

      expect(result).toBe(mockAccount.id);
    });
  });

  describe('retrieve', () => {
    it('should retrieve a account', async () => {
      const mockAccount: IAccount = {
        id: 'id',
        createdAt: 'date',
      };

      (mockAccountRepository.retrieve as jest.Mock).mockResolvedValue(
        mockAccount
      );

      const accountService = new AccountService(mockAccountRepository);

      const result = await accountService.retrieve(mockAccount.id);

      expect(result).toEqual(mockAccount);
    });
  });

  describe('remove', () => {
    it('should delete a account', async () => {
      const mockAccountId = 'id';
      const mockResult = false;

      (mockAccountRepository.remove as jest.Mock).mockResolvedValue(mockResult);

      const accountService = new AccountService(mockAccountRepository);

      const result = await accountService.remove(mockAccountId);

      expect(result).toBe(mockResult);
    });
  });
});
