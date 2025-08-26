import { TenantEnvironmentHttpService } from './tenant-environment.http-service';
import { TenantEnvironmentRepository } from './tenant-environment.repository';
import { makeServiceEndpoints } from './tenant-environment.routes';
import { TenantEnvironmentService } from './tenant-environment.service';

export const tenant = {
  service: TenantEnvironmentService,
  httpService: TenantEnvironmentHttpService,
  repository: TenantEnvironmentRepository,
  endpoints: makeServiceEndpoints,
};
