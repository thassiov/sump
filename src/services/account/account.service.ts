import { IAccount } from '../../types/account.type';
import { IUpdateAccountDto } from '../../types/dto.type';
import { IAccountRepository } from './types/repository.type';
import { IAccountService } from './types/service.type';

export class AccountService implements IAccountService {
  constructor(private readonly accountRepository: IAccountRepository) {}

  async getAccountById(accountId: string): Promise<IAccount | undefined> {
    return this.accountRepository.getAccountById(accountId);
  }

  async removeAccountById(accountId: string): Promise<boolean> {
    return this.accountRepository.removeAccountById(accountId);
  }

  async updateAccountById(
    accountId: string,
    updateAccountDto: IUpdateAccountDto
  ): Promise<boolean> {
    return this.accountRepository.updateAccountById(
      accountId,
      updateAccountDto
    );
  }
}
