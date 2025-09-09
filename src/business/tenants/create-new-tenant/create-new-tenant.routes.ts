import express, { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { EndpointHandler } from '../../../lib/types';
import { UseCaseCaller } from '../../types/business.type';
import { CreateNewTenantUseCaseDto } from './types/dto.type';
import { CreateNewTenantUseCase } from './types/use-case.type';

const router = express.Router();

function makeServiceEndpoints(
  useCase: UseCaseCaller<CreateNewTenantUseCase>
): express.Router {
  router.post('/', makeCreateNewTenantUseCaseEndpointFactory(useCase));

  return router;
}

function makeCreateNewTenantUseCaseEndpointFactory(
  useCase: UseCaseCaller<CreateNewTenantUseCase>
): EndpointHandler {
  return async function createNewTenantUseCaseEndpoint(
    req: Request,
    res: Response
  ): Promise<void> {
    const payload = req.body as CreateNewTenantUseCaseDto;
    const result = await useCase(payload);

    res.status(StatusCodes.CREATED).json(result);
    return;
  };
}

export { makeServiceEndpoints };
