import express, { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { EndpointHandler } from '../../../lib/types';
import { ICreateAccountDto } from '../../../services/account/types/dto.type';
import { UseCaseCaller } from '../../types/business.type';
import { CreateAccountUseCase } from './types/use-case.type';

const router = express.Router({ mergeParams: true });

function makeServiceEndpoints(
  useCase: UseCaseCaller<CreateAccountUseCase>
): express.Router {
  router.post('/', makeCreateAccountEndpointFactory(useCase));

  return router;
}

function makeCreateAccountEndpointFactory(
  useCase: UseCaseCaller<CreateAccountUseCase>
): EndpointHandler {
  return async function makeCreateAccountEndpoint(
    req: Request,
    res: Response
  ): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
    const tenantId = req.params['tenantId'] as string;

    const dto = req.body as ICreateAccountDto;

    const result = await useCase(tenantId, dto);

    res.status(StatusCodes.CREATED).json({ accountId: result });
    return;
  };
}

export { makeServiceEndpoints };
