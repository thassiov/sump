/* eslint-disable @typescript-eslint/non-nullable-type-assertion-style */
import express, { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import {
  IAccountUserDefinedIdentification,
  ICreateAccountDto,
  IUpdateAccountEmailDto,
  IUpdateAccountPhoneDto,
  IUpdateAccountUsernameDto,
} from '../../../core/types/account/dto.type';
import { IUpdateTenantNonSensitivePropertiesDto } from '../../../core/types/tenant/dto.type';
import { TenantAccountUseCase } from '../../../core/use-cases';
import { EndpointHandler } from '../../../lib/types';

const router = express.Router({ mergeParams: true });

function makeTenantTenantAccountUseCaseEndpoints(useCase: TenantAccountUseCase): express.Router {
  router.post(
    '/accounts',
    createNewTenantAccountUseCaseEndpointFactory(useCase.createNewAccount)
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

  router.patch(
    '/accounts/:accountId/email',
    updateAccountEmailByIdAndTenantIdUseCaseEndpointFactory(
      useCase.updateAccountEmailByIdAndTenantId
    )
  );

  router.patch(
    '/accounts/:accountId/phone',
    updateAccountPhoneByIdAndTenantIdUseCaseEndpointFactory(
      useCase.updateAccountPhoneByIdAndTenantId
    )
  );
  router.patch(
    '/accounts/:accountId/username',
    updateAccountUsernameByIdAndTenantIdUseCaseEndpointFactory(
      useCase.updateAccountUsernameByIdAndTenantId
    )
  );

  router.get(
    '/accounts/user-defined-identification',
    getAccountByUserDefinedIdentificationAndTenantIdUseCaseEndpointFactory(
      useCase.getAccountByUserDefinedIdentificationAndTenantId
    )
  );

  router.get(
    '/accounts/:accountId',
    getAccountByIdAndTenantIdUseCaseEndpointFactory(
      useCase.getAccountByIdAndTenantId
    )
  );

  return router;
}

function createNewTenantAccountUseCaseEndpointFactory(
  useCase: TenantAccountUseCase['createNewAccount']
): EndpointHandler {
  return async function createNewTenantAccountUseCaseEndpoint(
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
  useCase: TenantAccountUseCase['deleteAccountByIdAndTenantId']
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
  useCase: TenantAccountUseCase['updateNonSensitivePropertiesByIdAndTenantId']
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

function updateAccountEmailByIdAndTenantIdUseCaseEndpointFactory(
  useCase: TenantAccountUseCase['updateAccountEmailByIdAndTenantId']
): EndpointHandler {
  return async function updateAccountEmailByIdAndTenantIdUseCaseEndpoint(
    req: Request,
    res: Response
  ): Promise<void> {
    const tenantId = req.params['tenantId'] as string;
    const accountId = req.params['accountId'] as string;
    const dto = req.body as IUpdateAccountEmailDto;
    await useCase(accountId, tenantId, dto);

    res.status(StatusCodes.OK).send();
    return;
  };
}

function updateAccountPhoneByIdAndTenantIdUseCaseEndpointFactory(
  useCase: TenantAccountUseCase['updateAccountPhoneByIdAndTenantId']
): EndpointHandler {
  return async function updateAccountPhoneByIdAndTenantIdUseCaseEndpoint(
    req: Request,
    res: Response
  ): Promise<void> {
    const tenantId = req.params['tenantId'] as string;
    const accountId = req.params['accountId'] as string;
    const dto = req.body as IUpdateAccountPhoneDto;
    await useCase(accountId, tenantId, dto);

    res.status(StatusCodes.OK).send();
    return;
  };
}

function updateAccountUsernameByIdAndTenantIdUseCaseEndpointFactory(
  useCase: TenantAccountUseCase['updateAccountUsernameByIdAndTenantId']
): EndpointHandler {
  return async function updateAccountUsernameByIdAndTenantIdUseCaseEndpoint(
    req: Request,
    res: Response
  ): Promise<void> {
    const tenantId = req.params['tenantId'] as string;
    const accountId = req.params['accountId'] as string;
    const dto = req.body as IUpdateAccountUsernameDto;
    await useCase(accountId, tenantId, dto);

    res.status(StatusCodes.OK).send();
    return;
  };
}

function getAccountByIdAndTenantIdUseCaseEndpointFactory(
  useCase: TenantAccountUseCase['getAccountByIdAndTenantId']
): EndpointHandler {
  return async function getAccountByIdAndTenantIdUseCaseEndpoint(
    req: Request,
    res: Response
  ): Promise<void> {
    const tenantId = req.params['tenantId'] as string;
    const accountId = req.params['accountId'] as string;
    const account = await useCase(accountId, tenantId);

    if (!account) {
      res.status(StatusCodes.NOT_FOUND).send();
      return;
    }

    res.status(StatusCodes.OK).json(account);
    return;
  };
}

function getAccountByUserDefinedIdentificationAndTenantIdUseCaseEndpointFactory(
  useCase: TenantAccountUseCase['getAccountByUserDefinedIdentificationAndTenantId']
): EndpointHandler {
  return async function getAccountByUserDefinedIdentificationAndTenantIdUseCaseEndpoint(
    req: Request,
    res: Response
  ): Promise<void> {
    const tenantId = req.params['tenantId'] as string;
    const dto = req.body as IAccountUserDefinedIdentification;

    const account = await useCase(dto, tenantId);

    if (!account) {
      res.status(StatusCodes.NOT_FOUND).send();
      return;
    }

    res.status(StatusCodes.OK).json(account);
    return;
  };
}

export { makeTenantTenantAccountUseCaseEndpoints };
