import express, { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { EndpointHandler } from '../../../lib/types';
import { UseCaseCaller } from '../../types/business.type';
import { GetAccountByIdAndTenantIdUseCase } from './types/use-case.type';

const router = express.Router({ mergeParams: true });

function makeServiceEndpoints(
  useCase: UseCaseCaller<GetAccountByIdAndTenantIdUseCase>
): express.Router {
  router.get('/:id', getAccountByIdAndTenantIdEndpointFactory(useCase));

  return router;
}

function getAccountByIdAndTenantIdEndpointFactory(
  useCase: UseCaseCaller<GetAccountByIdAndTenantIdUseCase>
): EndpointHandler {
  return async function getAccountByIdAndTenantIdEndpoint(
    req: Request,
    res: Response
  ): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
    const tenantId = req.params['tenantId'] as string;
    // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
    const accountId = req.params['id'] as string;

    req.log.info(req.params);

    const tenant = await useCase(accountId, tenantId);

    res.status(StatusCodes.OK).json(tenant);
    return;
  };
}

export { makeServiceEndpoints };
