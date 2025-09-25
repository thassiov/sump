/* eslint-disable @typescript-eslint/non-nullable-type-assertion-style */
import express, { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ICreateAccountDto } from '../../../core/types/account/dto.type';
import { IUpdateTenantNonSensitivePropertiesDto } from '../../../core/types/tenant/dto.type';
import { AccountUseCase } from '../../../core/use-cases';
import { EndpointHandler } from '../../../lib/types';

const router = express.Router({ mergeParams: true });

function makeAccountUseCaseEndpoints(useCase: AccountUseCase): express.Router {
  router.post(
    '/accounts',
    createNewAccountUseCaseEndpointFactory(useCase.createNewAccount)
  );

  router.delete(
    '/accounts/:accountId',
    deleteAccountByIdAndTenantIdUseCaseEndpointFactory(
      useCase.deleteAccountByIdAndTenantId
    )
  );

  router.patch(
    '/accounts/:accountId',
    updateNonSensitivePropertiesByIdAndTenantIdUseCaseEndpointFactory(
      useCase.updateNonSensitivePropertiesByIdAndTenantId
    )
  );

  return router;
}

function createNewAccountUseCaseEndpointFactory(
  useCase: AccountUseCase['createNewAccount']
): EndpointHandler {
  return async function createNewAccountUseCaseEndpoint(
    req: Request,
    res: Response
  ): Promise<void> {
    const tenantId = req.params['tenantId'] as string;
    const dto = req.body as ICreateAccountDto;
    const result = await useCase(tenantId, dto);

    res.status(StatusCodes.CREATED).json(result);
    return;
  };
}

function deleteAccountByIdAndTenantIdUseCaseEndpointFactory(
  useCase: AccountUseCase['deleteAccountByIdAndTenantId']
): EndpointHandler {
  return async function deleteAccountByIdAndTenantIdUseCaseEndpoint(
    req: Request,
    res: Response
  ): Promise<void> {
    const tenantId = req.params['tenantId'] as string;
    const accountId = req.params['accountId'] as string;
    await useCase(accountId, tenantId);

    res.status(StatusCodes.NO_CONTENT).send();
    return;
  };
}

function updateNonSensitivePropertiesByIdAndTenantIdUseCaseEndpointFactory(
  useCase: AccountUseCase['updateNonSensitivePropertiesByIdAndTenantId']
): EndpointHandler {
  return async function updateNonSensitivePropertiesByIdAndTenantIdUseCaseEndpoint(
    req: Request,
    res: Response
  ): Promise<void> {
    const tenantId = req.params['tenantId'] as string;
    const accountId = req.params['accountId'] as string;
    const dto = req.body as IUpdateTenantNonSensitivePropertiesDto;
    await useCase(accountId, tenantId, dto);

    res.status(StatusCodes.OK).send();
    return;
  };
}

export { makeAccountUseCaseEndpoints };
