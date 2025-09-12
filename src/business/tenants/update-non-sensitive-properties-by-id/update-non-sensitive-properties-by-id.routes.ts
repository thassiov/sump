import express from 'express';

import { makeUpdateNonSensitivePropertiesByIdEndpointFactory } from '../../../services/tenant/tenant.routes';
import { ITenantService } from '../../../services/tenant/types/service.type';
import { UseCaseCaller } from '../../types/business.type';
import { UpdateNonSensitivePropertiesUseCase } from './types/use-case.type';

const router = express.Router();

function makeServiceEndpoints(
  useCase: UseCaseCaller<UpdateNonSensitivePropertiesUseCase>
): express.Router {
  router.patch(
    '/:id',
    makeUpdateNonSensitivePropertiesByIdEndpointFactory({
      updateNonSensitivePropertiesById: useCase,
    } as unknown as ITenantService)
  );

  return router;
}

export { makeServiceEndpoints };
