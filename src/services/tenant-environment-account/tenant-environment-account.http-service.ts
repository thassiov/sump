import { BaseHttpService } from '../../base-classes';
import {
  ICreateTenantEnvironmentAccountDto,
  IUpdateTenantEnvironmentAccountDto,
} from './types/dto.type';
import { ITenantEnvironmentAccountService } from './types/service.type';
import { ITenantEnvironmentAccount } from './types/tenant-environment-account.type';

class TenantEnvironmentAccountHttpService
  extends BaseHttpService
  implements ITenantEnvironmentAccountService
{
  constructor(url: string) {
    super('account-http-service', url);
  }

  async create(dto: ICreateTenantEnvironmentAccountDto): Promise<string> {
    return await this.httpClient.post<string>(this.serviceUrl, {
      body: dto,
    });
  }

  async getById(id: string): Promise<ITenantEnvironmentAccount | undefined> {
    const url = `${this.serviceUrl}/${id}`;
    return await this.httpClient.get<ITenantEnvironmentAccount | undefined>(
      url
    );
  }

  async deleteById(id: string): Promise<boolean> {
    const url = `${this.serviceUrl}/${id}`;
    return await this.httpClient.delete<boolean>(url);
  }

  async updateById(
    id: string,
    dto: IUpdateTenantEnvironmentAccountDto
  ): Promise<boolean> {
    const url = `${this.serviceUrl}/${id}`;
    return await this.httpClient.patch<boolean>(url, {
      body: dto,
    });
  }
}

export { TenantEnvironmentAccountHttpService };
