import { IAccountRepository } from 'src/repositories/account/types';
import { IAccount, IAccountService } from './types';

export class AccountService implements IAccountService {
  constructor(private readonly accountRepository: IAccountRepository) {}

  async create(): Promise<string> {
    const newUser = await this.accountRepository.create();

    return newUser.id;
  }

  async retrieve(accountId: string): Promise<IAccount | undefined> {
    const account = await this.accountRepository.retrieve(accountId);

    return account;
  }

  async remove(accountId: string): Promise<boolean> {
    const removed = await this.accountRepository.remove(accountId);

    return removed;
  }
}
