import { BaseHttpService } from '../../base-classes';
import { IAccount } from './types/account.type';
import { ICreateAccountDto, IUpdateAccountDto } from './types/dto.type';
import { IAccountService } from './types/service.type';

class AccountHttpService extends BaseHttpService implements IAccountService {
  constructor(url: string) {
    super('account-http-service', url);
  }

  async createAccount(newAccount: ICreateAccountDto): Promise<string> {
    return await this.httpClient.post<string>(this.serviceUrl, {
      body: newAccount,
    });
  }

  async getAccountById(accountId: string): Promise<IAccount | undefined> {
    const url = `${this.serviceUrl}/${accountId}`;
    return await this.httpClient.get<IAccount | undefined>(url);
  }

  async removeAccountById(accountId: string): Promise<boolean> {
    const url = `${this.serviceUrl}/${accountId}`;
    return await this.httpClient.delete<boolean>(url);
  }

  async updateAccountById(
    accountId: string,
    updateAccountDto: IUpdateAccountDto
  ): Promise<boolean> {
    const url = `${this.serviceUrl}/${accountId}`;
    return await this.httpClient.patch<boolean>(url, {
      body: updateAccountDto,
    });
  }
}

export { AccountHttpService };
