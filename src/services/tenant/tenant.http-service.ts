import { BaseHttpService } from '../../base-classes';
import { ICreateTenantDto, IUpdateTenantDto } from './types/dto.type';
import { ITenantService } from './types/service.type';
import { ITenant } from './types/tenant.type';

class TenantHttpService extends BaseHttpService implements ITenantService {
  constructor(url: string) {
    super('tenant-http-service', url);
  }

  async create(dto: ICreateTenantDto): Promise<string> {
    return await this.httpClient.post<string>(this.serviceUrl, {
      body: dto,
    });
  }

  async getById(id: string): Promise<ITenant | undefined> {
    const url = `${this.serviceUrl}/${id}`;
    return await this.httpClient.get<ITenant | undefined>(url);
  }

  async deleteById(id: string): Promise<boolean> {
    const url = `${this.serviceUrl}/${id}`;
    return await this.httpClient.delete<boolean>(url);
  }

  async updateById(id: string, dto: IUpdateTenantDto): Promise<boolean> {
    const url = `${this.serviceUrl}/${id}`;
    return await this.httpClient.patch<boolean>(url, {
      body: dto,
    });
  }
}

export { TenantHttpService };
