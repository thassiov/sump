import { randomUUID } from 'crypto';
import { IAccountRepository } from './types';
import { IAccount } from 'src/services/account/types';

export class AccountRepository implements IAccountRepository {
  private db: IAccount[];

  constructor() {
    this.db = [];
  }

  async create(): Promise<IAccount> {
    const id = randomUUID();
    const now = Date.now().toString();

    const newAccount = {
      id,
      createdAt: now,
    };

    this.db.push(newAccount);

    return Promise.resolve(newAccount);
  }

  async retrieve(accountId: string): Promise<IAccount | undefined> {
    const account = this.db.find((a) => a.id === accountId);

    if (!account) {
      return Promise.resolve(undefined);
    }

    return Promise.resolve(account);
  }

  async remove(accountId: string): Promise<boolean> {
    const index = this.db.findIndex((a) => a.id === accountId);

    if (index === -1) {
      return Promise.resolve(false);
    }

    this.db.splice(index, 1);

    return Promise.resolve(true);
  }
}
