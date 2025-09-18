import { createAccountUseCase, createAccountUseCaseEndpoint } from './create';

import {
  getAccountByIdAndTenantIdUseCase,
  getAccountByIdAndTenantIdUseCaseEndpoint,
} from './get-account-by-id-and-tenant-id';
import {
  updateNonSensitivePropertiesByIdAndTenantIdUseCase,
  updateNonSensitivePropertiesByIdAndTenantIdUseCaseEndpoint,
} from './update-non-sensitive-properties-by-id-and-tenant-id';

export const accounts = {
  createAccountUseCase: {
    service: createAccountUseCase,
    endpoint: createAccountUseCaseEndpoint,
  },
  getAccountByIdAndTenantIdUseCase: {
    service: getAccountByIdAndTenantIdUseCase,
    endpoint: getAccountByIdAndTenantIdUseCaseEndpoint,
  },
  updateNonSensitivePropertiesByIdAndTenantIdUseCase: {
    service: updateNonSensitivePropertiesByIdAndTenantIdUseCase,
    endpoint: updateNonSensitivePropertiesByIdAndTenantIdUseCaseEndpoint,
  },
};
