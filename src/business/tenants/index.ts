import {
  createNewTenantUseCase,
  createNewTenantUseCaseEndpoint,
} from './create-new-tenant';

export const tenants = {
  createNewTenantUseCase: {
    service: createNewTenantUseCase,
    endpoint: createNewTenantUseCaseEndpoint,
  },
};
