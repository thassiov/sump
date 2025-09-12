import express from 'express';

import { makeDeleteByIdEndpointFactory } from '../../../services/tenant/tenant.routes';
import { ITenantService } from '../../../services/tenant/types/service.type';
import { UseCaseCaller } from '../../types/business.type';
import { DeleteByIdServices } from './types/use-case.type';

const router = express.Router();

function makeServiceEndpoints(
  useCase: UseCaseCaller<DeleteByIdServices>
): express.Router {
  router.delete(
    '/:id',
    makeDeleteByIdEndpointFactory({
      deleteById: useCase,
    } as unknown as ITenantService)
  );

  return router;
}

export { makeServiceEndpoints };
