import express, { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { EndpointHandler } from '../../../lib/types';
import { UseCaseCaller } from '../../types/business.type';
import { GetAccountsByTenantIdSUseCase } from './types/use-case.type';

const router = express.Router();

function makeServiceEndpoints(
  useCase: UseCaseCaller<GetAccountsByTenantIdSUseCase>
): express.Router {
  router.get('/:id/accounts', makeGetTenantByIdEndpointFactory(useCase));

  return router;
}

function makeGetTenantByIdEndpointFactory(
  useCase: UseCaseCaller<GetAccountsByTenantIdSUseCase>
): EndpointHandler {
  return async function (req: Request, res: Response): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
    const id = req.params['id'] as string;

    const result = await useCase(id);

    if (!result) {
      res.status(StatusCodes.NO_CONTENT).send();
    } else {
      res.status(StatusCodes.OK).json(result);
    }

    return;
  };
}

export { makeServiceEndpoints };
