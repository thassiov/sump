import express, { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { EndpointHandler } from '../../../lib/types';
import { UseCaseCaller } from '../../types/business.type';
import { GetTenantByIdUseCase } from './types/use-case.type';

const router = express.Router();

function makeServiceEndpoints(
  useCase: UseCaseCaller<GetTenantByIdUseCase>
): express.Router {
  router.get('/:id', makeGetTenantByIdEndpointFactory(useCase));

  return router;
}

function makeGetTenantByIdEndpointFactory(
  useCase: UseCaseCaller<GetTenantByIdUseCase>
): EndpointHandler {
  return async function makeGetTenantByIdEndpoint(
    req: Request,
    res: Response
  ): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
    const id = req.params['id'] as string;

    const tenant = await useCase(id);

    res.status(StatusCodes.OK).json(tenant);
    return;
  };
}

export { makeServiceEndpoints };
