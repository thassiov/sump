import { BaseHttpService } from '../../base-classes';
import {
  ICreateTenantEnvironmentDto,
  IUpdateTenantEnvironmentDto,
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

  async create(dto: ICreateTenantEnvironmentDto): Promise<string> {
    return await this.httpClient.post<string>(this.serviceUrl, {
      body: dto,
    });
  }

  async getById(id: string): Promise<ITenantEnvironment | undefined> {
    const url = `${this.serviceUrl}/${id}`;
    return await this.httpClient.get<ITenantEnvironment | undefined>(url);
  }

  async deleteById(id: string): Promise<boolean> {
    const url = `${this.serviceUrl}/${id}`;
    return await this.httpClient.delete<boolean>(url);
  }

  async updateById(
    id: string,
    dto: IUpdateTenantEnvironmentDto
  ): Promise<boolean> {
    const url = `${this.serviceUrl}/${id}`;
    return await this.httpClient.patch<boolean>(url, {
      body: dto,
    });
  }
}

export { TenantEnvironmentHttpService };
