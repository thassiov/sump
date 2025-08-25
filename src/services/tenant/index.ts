import { TenantHttpService } from './tenant.http-service';
import { TenantRepository } from './tenant.repository';
import { makeServiceEndpoints } from './tenant.routes';
import { TenantService } from './tenant.service';

export const tenant = {
  service: TenantService,
  httpService: TenantHttpService,
  repository: TenantRepository,
  endpoints: makeServiceEndpoints,
};
