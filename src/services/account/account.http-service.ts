import { BaseHttpService } from '../../base-classes';
import { IAccount } from './types/account.type';
import { ICreateAccountDto, IUpdateAccountDto } from './types/dto.type';
import { IAccountService } from './types/service.type';

class AccountHttpService extends BaseHttpService implements IAccountService {
  constructor(url: string) {
    super('account-http-service', url);
  }

  async create(dto: ICreateAccountDto): Promise<string> {
    return await this.httpClient.post<string>(this.serviceUrl, {
      body: dto,
    });
  }

  async getById(id: string): Promise<IAccount | undefined> {
    const url = `${this.serviceUrl}/${id}`;
    return await this.httpClient.get<IAccount | undefined>(url);
  }

  async deleteById(id: string): Promise<boolean> {
    const url = `${this.serviceUrl}/${id}`;
    return await this.httpClient.delete<boolean>(url);
  }

  async updateById(id: string, dto: IUpdateAccountDto): Promise<boolean> {
    const url = `${this.serviceUrl}/${id}`;
    return await this.httpClient.patch<boolean>(url, {
      body: dto,
    });
  }
}

export { AccountHttpService };
