import { BaseHttpService } from '../../base-classes';
import { ITenantEnvironment } from '../tenant-environment/types/tenant-environment.type';
import {
  ICreateTenantEnvironmentAccountNoInternalPropertiesDto,
  IGetTenantEnvironmentAccountDto,
  IUpdateTenantEnvironmentAccountEmailDto,
  IUpdateTenantEnvironmentAccountNonSensitivePropertiesDto,
  IUpdateTenantEnvironmentAccountPhoneDto,
  IUpdateTenantEnvironmentAccountUsernameDto,
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

  async create(
    tenantEnvironmentId: ITenantEnvironment['id'],
    dto: ICreateTenantEnvironmentAccountNoInternalPropertiesDto
  ): Promise<string> {
    const url = `${this.serviceUrl}?tenantEnvironmentId=${tenantEnvironmentId}`;
    return await this.httpClient.post<string>(url, {
      body: dto,
    });
  }

  async getById(
    id: ITenantEnvironmentAccount['id']
  ): Promise<IGetTenantEnvironmentAccountDto | undefined> {
    const url = `${this.serviceUrl}/${id}`;
    return await this.httpClient.get<
      IGetTenantEnvironmentAccountDto | undefined
    >(url);
  }

  async deleteById(id: ITenantEnvironmentAccount['id']): Promise<boolean> {
    const url = `${this.serviceUrl}/${id}`;
    return await this.httpClient.delete<boolean>(url);
  }

  async updateNonSensitivePropertiesById(
    id: ITenantEnvironmentAccount['id'],
    dto: IUpdateTenantEnvironmentAccountNonSensitivePropertiesDto
  ): Promise<boolean> {
    const url = `${this.serviceUrl}/${id}`;
    return await this.httpClient.patch<boolean>(url, {
      body: dto,
    });
  }

  async updateEmailById(
    id: ITenantEnvironmentAccount['id'],
    dto: IUpdateTenantEnvironmentAccountEmailDto
  ): Promise<boolean> {
    const url = `${this.serviceUrl}/${id}/email`;
    return await this.httpClient.patch<boolean>(url, {
      body: dto,
    });
  }

  async updatePhoneById(
    id: ITenantEnvironmentAccount['id'],
    dto: IUpdateTenantEnvironmentAccountPhoneDto
  ): Promise<boolean> {
    const url = `${this.serviceUrl}/${id}/phone`;
    return await this.httpClient.patch<boolean>(url, {
      body: dto,
    });
  }

  async updateUsernameById(
    id: ITenantEnvironmentAccount['id'],
    dto: IUpdateTenantEnvironmentAccountUsernameDto
  ): Promise<boolean> {
    const url = `${this.serviceUrl}/${id}/username`;
    return await this.httpClient.patch<boolean>(url, {
      body: dto,
    });
  }

  async setCustomPropertyById(
    id: ITenantEnvironmentAccount['id'],
    customProperty: ITenantEnvironmentAccount['customProperties']
  ): Promise<boolean> {
    const url = `${this.serviceUrl}/${id}/customProperty`;
    return await this.httpClient.post<boolean>(url, {
      body: customProperty,
    });
  }

  async deleteCustomPropertyById(
    id: ITenantEnvironmentAccount['id'],
    customPropertyKey: string
  ): Promise<boolean> {
    const url = `${this.serviceUrl}/${id}/customProperty`;
    return await this.httpClient.delete<boolean>(url, {
      body: { customPropertyKey },
    });
  }
}

export { TenantEnvironmentAccountHttpService };
