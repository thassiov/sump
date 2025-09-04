import { BaseHttpService } from '../../base-classes';
import { IUpdateTenantNonSensitivePropertiesDto } from '../tenant/types/dto.type';
import { ITenant } from '../tenant/types/tenant.type';
import {
  ICreateTenantEnvironmentNoInternalPropertiesDto,
  IGetTenantEnvironmentDto,
} from './types/dto.type';
import { ITenantEnvironmentService } from './types/service.type';
import { ITenantEnvironment } from './types/tenant-environment.type';

class TenantEnvironmentHttpService
  extends BaseHttpService
  implements ITenantEnvironmentService
{
  constructor(url: string) {
    super('tenant-http-service', url);
  }

  async create(
    tenantId: ITenant['id'],
    dto: ICreateTenantEnvironmentNoInternalPropertiesDto
  ): Promise<string> {
    const url = `${this.serviceUrl}?tenantId=${tenantId}`;
    return await this.httpClient.post<string>(url, {
      body: dto,
    });
  }

  async getById(
    id: ITenantEnvironment['id']
  ): Promise<IGetTenantEnvironmentDto | undefined> {
    const url = `${this.serviceUrl}/${id}`;
    return await this.httpClient.get<IGetTenantEnvironmentDto | undefined>(url);
  }

  async deleteById(id: ITenantEnvironment['id']): Promise<boolean> {
    const url = `${this.serviceUrl}/${id}`;
    return await this.httpClient.delete<boolean>(url);
  }

  async updateNonSensitivePropertiesById(
    id: ITenantEnvironment['id'],
    dto: IUpdateTenantNonSensitivePropertiesDto
  ): Promise<boolean> {
    const url = `${this.serviceUrl}/${id}`;
    return await this.httpClient.patch<boolean>(url, {
      body: dto,
    });
  }

  async setCustomPropertyById(
    id: ITenant['id'],
    customProperty: ITenant['customProperties']
  ): Promise<boolean> {
    const url = `${this.serviceUrl}/${id}/customProperty`;
    return await this.httpClient.post<boolean>(url, {
      body: customProperty,
    });
  }

  async deleteCustomPropertyById(
    id: ITenant['id'],
    customPropertyKey: string
  ): Promise<boolean> {
    const url = `${this.serviceUrl}/${id}/customProperty`;
    return await this.httpClient.delete<boolean>(url, {
      body: { customPropertyKey },
    });
  }
}

export { TenantEnvironmentHttpService };
