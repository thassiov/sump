/* eslint-disable @typescript-eslint/non-nullable-type-assertion-style */
import express, { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import {
  ICreateTenantEnvironmentAccountDto,
  ITenantEnvironmentAccountCustomPropertiesOperationDtoSchema,
  IUpdateTenantEnvironmentAccountEmailDto,
  IUpdateTenantEnvironmentAccountNonSensitivePropertiesDto,
  IUpdateTenantEnvironmentAccountPhoneDto,
  IUpdateTenantEnvironmentAccountUsernameDto,
} from '../../../core/types/tenant-environment-account/dto.type';
import { TenantEnvironmentAccountUseCase } from '../../../core/use-cases';
import { EndpointHandler } from '../../../lib/types';

const router = express.Router({ mergeParams: true });

function makeTenantEnvironmentAccountUseCaseEndpoints(
  useCase: TenantEnvironmentAccountUseCase
): express.Router {
  router.post(
    '/accounts',
    createNewAccountUseCaseEndpointFactory(useCase.createNewAccount)
  );

  router.get(
    '/accounts/:environmentAccountId',
    getAccountByIdAndEnvironmentIdUseCaseEndpointFactory(
      useCase.getAccountByIdAndTenantEnvironmentId
    )
  );

  router.delete(
    '/accounts/:environmentAccountId',
    deleteAccountByIdAndEnvironmentIdUseCaseEndpointFactory(
      useCase.deleteAccountByIdAndTenantEnvironmentId
    )
  );

  router.patch(
    '/accounts/:environmentAccountId',
    updateAccountNonSensitivePropertiesByIdAndEnvironmentIdUseCaseEndpointFactory(
      useCase.updateAccountNonSensitivePropertiesByIdAndTenantEnvironmentId
    )
  );

  router.patch(
    '/accounts/:environmentAccountId/email',
    updateAccountEmailByIdAndEnvironmentIdUseCaseEndpointFactory(
      useCase.updateAccountEmailByIdAndTenantEnvironmentId
    )
  );

  router.patch(
    '/accounts/:environmentAccountId/phone',
    updateAccountPhoneByIdAndEnvironmentIdUseCaseEndpointFactory(
      useCase.updateAccountPhoneByIdAndTenantEnvironmentId
    )
  );

  router.patch(
    '/accounts/:environmentAccountId/username',
    updateAccountUsernameByIdAndEnvironmentIdUseCaseEndpointFactory(
      useCase.updateAccountUsernameByIdAndTenantEnvironmentId
    )
  );

  router.patch(
    '/accounts/:environmentAccountId/custom-property',
    setAccountCustomPropertyByIdAndEnvironmentIdUseCaseEndpointFactory(
      useCase.setAccountCustomPropertyByIdAndTenantEnvironmentId
    )
  );

  router.delete(
    '/accounts/:environmentAccountId/custom-property',
    deleteAccountCustomPropertyByIdAndEnvironmentIdUseCaseEndpointFactory(
      useCase.deleteAccountCustomPropertyByIdAndTenantEnvironmentId
    )
  );

  return router;
}

function createNewAccountUseCaseEndpointFactory(
  useCase: TenantEnvironmentAccountUseCase['createNewAccount']
): EndpointHandler {
  return async function createNewAccountUseCaseEndpoint(
    req: Request,
    res: Response
  ): Promise<void> {
    const tenantEnvironmentId = req.params['tenantEnvironmentId'] as string;
    const dto = req.body as ICreateTenantEnvironmentAccountDto;
    const result = await useCase(tenantEnvironmentId, dto);

    res.status(StatusCodes.CREATED).json(result);
    return;
  };
}

function getAccountByIdAndEnvironmentIdUseCaseEndpointFactory(
  useCase: TenantEnvironmentAccountUseCase['getAccountByIdAndTenantEnvironmentId']
): EndpointHandler {
  return async function getAccountByIdAndEnvironmentIdUseCaseEndpoint(
    req: Request,
    res: Response
  ): Promise<void> {
    const tenantEnvironmentId = req.params['tenantEnvironmentId'] as string;
    const accountId = req.params['environmentAccountId'] as string;
    const account = await useCase(accountId, tenantEnvironmentId);

    if (!account) {
      res.status(StatusCodes.NOT_FOUND).send();
      return;
    }

    res.status(StatusCodes.OK).json(account);
    return;
  };
}

function deleteAccountByIdAndEnvironmentIdUseCaseEndpointFactory(
  useCase: TenantEnvironmentAccountUseCase['deleteAccountByIdAndTenantEnvironmentId']
): EndpointHandler {
  return async function deleteAccountByIdAndEnvironmentIdUseCaseEndpoint(
    req: Request,
    res: Response
  ): Promise<void> {
    const tenantEnvironmentId = req.params['tenantEnvironmentId'] as string;
    const accountId = req.params['environmentAccountId'] as string;
    await useCase(accountId, tenantEnvironmentId);

    res.status(StatusCodes.NO_CONTENT).send();
    return;
  };
}

function updateAccountNonSensitivePropertiesByIdAndEnvironmentIdUseCaseEndpointFactory(
  useCase: TenantEnvironmentAccountUseCase['updateAccountNonSensitivePropertiesByIdAndTenantEnvironmentId']
): EndpointHandler {
  return async function updateAccountNonSensitivePropertiesByIdAndEnvironmentIdUseCaseEndpoint(
    req: Request,
    res: Response
  ): Promise<void> {
    const tenantEnvironmentId = req.params['tenantEnvironmentId'] as string;
    const accountId = req.params['environmentAccountId'] as string;
    const dto =
      req.body as IUpdateTenantEnvironmentAccountNonSensitivePropertiesDto;
    await useCase(accountId, tenantEnvironmentId, dto);

    res.status(StatusCodes.OK).send();
    return;
  };
}

function updateAccountEmailByIdAndEnvironmentIdUseCaseEndpointFactory(
  useCase: TenantEnvironmentAccountUseCase['updateAccountEmailByIdAndTenantEnvironmentId']
): EndpointHandler {
  return async function updateAccountEmailByIdAndEnvironmentIdUseCaseEndpoint(
    req: Request,
    res: Response
  ): Promise<void> {
    const tenantEnvironmentId = req.params['tenantEnvironmentId'] as string;
    const accountId = req.params['environmentAccountId'] as string;
    const dto = req.body as IUpdateTenantEnvironmentAccountEmailDto;
    await useCase(accountId, tenantEnvironmentId, dto);

    res.status(StatusCodes.OK).send();
    return;
  };
}

function updateAccountPhoneByIdAndEnvironmentIdUseCaseEndpointFactory(
  useCase: TenantEnvironmentAccountUseCase['updateAccountPhoneByIdAndTenantEnvironmentId']
): EndpointHandler {
  return async function updateAccountPhoneByIdAndEnvironmentIdUseCaseEndpoint(
    req: Request,
    res: Response
  ): Promise<void> {
    const tenantEnvironmentId = req.params['tenantEnvironmentId'] as string;
    const accountId = req.params['environmentAccountId'] as string;
    const dto = req.body as IUpdateTenantEnvironmentAccountPhoneDto;
    await useCase(accountId, tenantEnvironmentId, dto);

    res.status(StatusCodes.OK).send();
    return;
  };
}

function updateAccountUsernameByIdAndEnvironmentIdUseCaseEndpointFactory(
  useCase: TenantEnvironmentAccountUseCase['updateAccountUsernameByIdAndTenantEnvironmentId']
): EndpointHandler {
  return async function updateAccountUsernameByIdAndEnvironmentIdUseCaseEndpoint(
    req: Request,
    res: Response
  ): Promise<void> {
    const tenantEnvironmentId = req.params['tenantEnvironmentId'] as string;
    const accountId = req.params['environmentAccountId'] as string;
    const dto = req.body as IUpdateTenantEnvironmentAccountUsernameDto;
    await useCase(accountId, tenantEnvironmentId, dto);

    res.status(StatusCodes.OK).send();
    return;
  };
}

function setAccountCustomPropertyByIdAndEnvironmentIdUseCaseEndpointFactory(
  useCase: TenantEnvironmentAccountUseCase['setAccountCustomPropertyByIdAndTenantEnvironmentId']
): EndpointHandler {
  return async function setAccountCustomPropertyByIdAndEnvironmentIdUseCaseEndpoint(
    req: Request,
    res: Response
  ): Promise<void> {
    const tenantEnvironmentId = req.params['tenantEnvironmentId'] as string;
    const accountId = req.params['environmentAccountId'] as string;
    const dto =
      req.body as ITenantEnvironmentAccountCustomPropertiesOperationDtoSchema;
    await useCase(accountId, tenantEnvironmentId, dto);

    res.status(StatusCodes.OK).send();
    return;
  };
}

function deleteAccountCustomPropertyByIdAndEnvironmentIdUseCaseEndpointFactory(
  useCase: TenantEnvironmentAccountUseCase['deleteAccountCustomPropertyByIdAndTenantEnvironmentId']
): EndpointHandler {
  return async function deleteAccountCustomPropertyByIdAndEnvironmentIdUseCaseEndpoint(
    req: Request,
    res: Response
  ): Promise<void> {
    const tenantEnvironmentId = req.params['tenantEnvironmentId'] as string;
    const accountId = req.params['environmentAccountId'] as string;
    const payload = req.body as { customProperty: string };
    await useCase(accountId, tenantEnvironmentId, payload.customProperty);

    res.status(StatusCodes.OK).send();
    return;
  };
}

export { makeTenantEnvironmentAccountUseCaseEndpoints };
