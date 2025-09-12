import express from 'express';

import { makeDeleteCustomPropertyByIdEndpointFactory } from '../../../services/tenant/tenant.routes';
import { ITenantService } from '../../../services/tenant/types/service.type';
import { UseCaseCaller } from '../../types/business.type';
import { DeleteCustomPropertyByIdUseCase } from './types/use-case.type';

const router = express.Router();

function makeServiceEndpoints(
  useCase: UseCaseCaller<DeleteCustomPropertyByIdUseCase>
): express.Router {
  router.delete(
    '/:id/customProperty',
    makeDeleteCustomPropertyByIdEndpointFactory({
      deleteCustomPropertyById: useCase,
    } as unknown as ITenantService)
  );

  return router;
}

export { makeServiceEndpoints };
