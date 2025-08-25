import { BaseHttpService } from '../../base-classes';
import { ICreateTenantDto, IUpdateTenantDto } from './types/dto.type';
import { ITenantService } from './types/service.type';
import { ITenant } from './types/tenant.type';

class TenantHttpService extends BaseHttpService implements ITenantService {
  constructor(url: string) {
    super('tenant-http-service', url);
  }

  async createTenant(newTenant: ICreateTenantDto): Promise<string> {
    return await this.httpClient.post<string>(this.serviceUrl, {
      body: newTenant,
    });
  }

  async getTenantById(tenantId: string): Promise<ITenant | undefined> {
    const url = `${this.serviceUrl}/${tenantId}`;
    return await this.httpClient.get<ITenant | undefined>(url);
  }

  async removeTenantById(tenantId: string): Promise<boolean> {
    const url = `${this.serviceUrl}/${tenantId}`;
    return await this.httpClient.delete<boolean>(url);
  }

  async updateTenantById(
    tenantId: string,
    updateTenantDto: IUpdateTenantDto
  ): Promise<boolean> {
    const url = `${this.serviceUrl}/${tenantId}`;
    return await this.httpClient.patch<boolean>(url, {
      body: updateTenantDto,
    });
  }
}

export { TenantHttpService };
