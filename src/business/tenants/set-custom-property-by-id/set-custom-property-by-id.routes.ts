import express from 'express';

import { makeSetCustomPropertyByIdEndpointFactory } from '../../../services/tenant/tenant.routes';
import { ITenantService } from '../../../services/tenant/types/service.type';
import { UseCaseCaller } from '../../types/business.type';
import { SetCustomPropertyByIdUseCase } from './types/use-case.type';

const router = express.Router();

function makeServiceEndpoints(
  useCase: UseCaseCaller<SetCustomPropertyByIdUseCase>
): express.Router {
  router.patch(
    '/:id/customProperty',
    makeSetCustomPropertyByIdEndpointFactory({
      setCustomPropertyById: useCase,
    } as unknown as ITenantService)
  );

  return router;
}

export { makeServiceEndpoints };
