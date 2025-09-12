import {
  createNewTenantUseCase,
  createNewTenantUseCaseEndpoint,
} from './create-new-tenant';
import {
  getTenantByIdUseCase,
  getTenantByIdUseCaseEndpoint,
} from './get-tenant-by-id';
import {
  setCustomPropertyByIdUseCase,
  setCustomPropertyByIdUseCaseEndpoint,
} from './set-custom-property-by-id';
import {
  updateNonSensitivePropertiesByIdUseCase,
  updateNonSensitivePropertiesByIdUseCaseEndpoint,
} from './update-non-sensitive-properties-by-id';

export const tenants = {
  createNewTenantUseCase: {
    service: createNewTenantUseCase,
    endpoint: createNewTenantUseCaseEndpoint,
  },
  getTenantByIdUseCase: {
    service: getTenantByIdUseCase,
    endpoint: getTenantByIdUseCaseEndpoint,
  },
  updateNonSensitivePropertiesByIdUseCase: {
    service: updateNonSensitivePropertiesByIdUseCase,
    endpoint: updateNonSensitivePropertiesByIdUseCaseEndpoint,
  },
  setCustomPropertyByIdUseCase: {
    service: setCustomPropertyByIdUseCase,
    endpoint: setCustomPropertyByIdUseCaseEndpoint,
  },
};
