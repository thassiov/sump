/* eslint-disable @typescript-eslint/no-unsafe-argument */
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
import { EnvironmentAccountUseCase } from '../../../core/use-cases';
import { EndpointHandler } from '../../../lib/types';

const router = express.Router({ mergeParams: true });

function makeEnvironmentAccountUseCaseEndpoints(
  useCase: EnvironmentAccountUseCase
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
  useCase: EnvironmentAccountUseCase['createNewAccount']
): EndpointHandler {
  return async function createNewAccountUseCaseEndpoint(
    req: Request,
    res: Response
  ): Promise<void> {
    const environmentId = req.params['environmentId'] as string;
    const dto = req.body as ICreateTenantEnvironmentAccountDto;
    const result = await useCase(environmentId, dto);

    res.status(StatusCodes.CREATED).json(result);
    return;
  };
}

function getAccountByIdAndEnvironmentIdUseCaseEndpointFactory(
  useCase: EnvironmentAccountUseCase['getAccountByIdAndTenantEnvironmentId']
): EndpointHandler {
  return async function getAccountByIdAndEnvironmentIdUseCaseEndpoint(
    req: Request,
    res: Response
  ): Promise<void> {
    const environmentId = req.params['environmentId'] as string;
    const accountId = req.params['environmentAccountId'] as string;
    const account = await useCase(accountId, environmentId);

    if (!account) {
      res.status(StatusCodes.NOT_FOUND).send();
      return;
    }

    res.status(StatusCodes.OK).json(account);
    return;
  };
}

function deleteAccountByIdAndEnvironmentIdUseCaseEndpointFactory(
  useCase: EnvironmentAccountUseCase['deleteAccountByIdAndTenantEnvironmentId']
): EndpointHandler {
  return async function deleteAccountByIdAndEnvironmentIdUseCaseEndpoint(
    req: Request,
    res: Response
  ): Promise<void> {
    const environmentId = req.params['environmentId'] as string;
    const accountId = req.params['environmentAccountId'] as string;
    await useCase(accountId, environmentId);

    res.status(StatusCodes.NO_CONTENT).send();
    return;
  };
}

function updateAccountNonSensitivePropertiesByIdAndEnvironmentIdUseCaseEndpointFactory(
  useCase: EnvironmentAccountUseCase['updateAccountNonSensitivePropertiesByIdAndTenantEnvironmentId']
): EndpointHandler {
  return async function updateAccountNonSensitivePropertiesByIdAndEnvironmentIdUseCaseEndpoint(
    req: Request,
    res: Response
  ): Promise<void> {
    const environmentId = req.params['environmentId'] as string;
    const accountId = req.params['environmentAccountId'] as string;
    const dto =
      req.body as IUpdateTenantEnvironmentAccountNonSensitivePropertiesDto;
    await useCase(accountId, environmentId, dto);

    res.status(StatusCodes.OK).send();
    return;
  };
}

function updateAccountEmailByIdAndEnvironmentIdUseCaseEndpointFactory(
  useCase: EnvironmentAccountUseCase['updateAccountEmailByIdAndTenantEnvironmentId']
): EndpointHandler {
  return async function updateAccountEmailByIdAndEnvironmentIdUseCaseEndpoint(
    req: Request,
    res: Response
  ): Promise<void> {
    const environmentId = req.params['environmentId'] as string;
    const accountId = req.params['environmentAccountId'] as string;
    const dto = req.body as IUpdateTenantEnvironmentAccountEmailDto;
    await useCase(accountId, environmentId, dto);

    res.status(StatusCodes.OK).send();
    return;
  };
}

function updateAccountPhoneByIdAndEnvironmentIdUseCaseEndpointFactory(
  useCase: EnvironmentAccountUseCase['updateAccountPhoneByIdAndTenantEnvironmentId']
): EndpointHandler {
  return async function updateAccountPhoneByIdAndEnvironmentIdUseCaseEndpoint(
    req: Request,
    res: Response
  ): Promise<void> {
    const environmentId = req.params['environmentId'] as string;
    const accountId = req.params['environmentAccountId'] as string;
    const dto = req.body as IUpdateTenantEnvironmentAccountPhoneDto;
    await useCase(accountId, environmentId, dto);

    res.status(StatusCodes.OK).send();
    return;
  };
}

function updateAccountUsernameByIdAndEnvironmentIdUseCaseEndpointFactory(
  useCase: EnvironmentAccountUseCase['updateAccountUsernameByIdAndTenantEnvironmentId']
): EndpointHandler {
  return async function updateAccountUsernameByIdAndEnvironmentIdUseCaseEndpoint(
    req: Request,
    res: Response
  ): Promise<void> {
    const environmentId = req.params['environmentId'] as string;
    const accountId = req.params['environmentAccountId'] as string;
    const dto = req.body as IUpdateTenantEnvironmentAccountUsernameDto;
    await useCase(accountId, environmentId, dto);

    res.status(StatusCodes.OK).send();
    return;
  };
}

function setAccountCustomPropertyByIdAndEnvironmentIdUseCaseEndpointFactory(
  useCase: EnvironmentAccountUseCase['setAccountCustomPropertyByIdAndTenantEnvironmentId']
): EndpointHandler {
  return async function setAccountCustomPropertyByIdAndEnvironmentIdUseCaseEndpoint(
    req: Request,
    res: Response
  ): Promise<void> {
    const environmentId = req.params['environmentId'] as string;
    const accountId = req.params['environmentAccountId'] as string;
    const dto =
      req.body as ITenantEnvironmentAccountCustomPropertiesOperationDtoSchema;
    await useCase(accountId, environmentId, dto);

    res.status(StatusCodes.OK).send();
    return;
  };
}

function deleteAccountCustomPropertyByIdAndEnvironmentIdUseCaseEndpointFactory(
  useCase: EnvironmentAccountUseCase['deleteAccountCustomPropertyByIdAndTenantEnvironmentId']
): EndpointHandler {
  return async function deleteAccountCustomPropertyByIdAndEnvironmentIdUseCaseEndpoint(
    req: Request,
    res: Response
  ): Promise<void> {
    const environmentId = req.params['environmentId'] as string;
    const accountId = req.params['environmentAccountId'] as string;
    const payload = req.body as { customProperty: string };
    await useCase(accountId, environmentId, payload.customProperty);

    res.status(StatusCodes.OK).send();
    return;
  };
}

export { makeEnvironmentAccountUseCaseEndpoints };
