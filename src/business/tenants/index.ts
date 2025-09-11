import {
  createNewTenantUseCase,
  createNewTenantUseCaseEndpoint,
} from './create-new-tenant';
import {
  getTenantByIdUseCase,
  getTenantByIdUseCaseEndpoint,
} from './get-tenant-by-id';

export const tenants = {
  createNewTenantUseCase: {
    service: createNewTenantUseCase,
    endpoint: createNewTenantUseCaseEndpoint,
  },
  getTenantByIdUseCase: {
    service: getTenantByIdUseCase,
    endpoint: getTenantByIdUseCaseEndpoint,
  },
};
