/* eslint-disable @typescript-eslint/non-nullable-type-assertion-style */
import express, { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import {
  ICreateTenantEnvironmentDto,
  ITenantEnvironmentCustomPropertiesOperationDtoSchema,
  IUpdateTenantEnvironmentNonSensitivePropertiesDto,
} from '../../../core/types/tenant-environment/dto.type';
import { EnvironmentUseCase } from '../../../core/use-cases/environment.use-case';
import { EndpointHandler } from '../../../lib/types';

const router = express.Router({ mergeParams: true });

function makeEnvironmentUseCaseEndpoints(
  useCase: EnvironmentUseCase
): express.Router {
  router.post(
    '/environments',
    createNewEnvironmentUseCaseEndpointFactory(useCase.createNewEnvironment)
  );

  router.get(
    '/environments/:environmentId',
    getEnvironmentByIdAndTenantIdUseCaseEndpointFactory(
      useCase.getEnvironmentByIdAndTenantId
    )
  );

  router.delete(
    '/environments/:environmentId',
    deleteEnvironmentByIdAndTenantIdUseCaseEndpointFactory(
      useCase.deleteEnvironmentByIdAndTenantId
    )
  );

  router.patch(
    '/environments/:environmentId',
    updateEnvironmentNonSensitivePropertiesByIdAndTenantIdUseCaseEndpointFactory(
      useCase.updateEnvironmentNonSensitivePropertiesByIdAndTenantId
    )
  );

  router.patch(
    '/environments/:environmentId/custom-property',
    setEnvironmentCustomPropertyByIdAndTenantIdUseCaseEndpointFactory(
      useCase.setEnvironmentCustomPropertyByIdAndTenantId
    )
  );

  router.delete(
    '/environments/:environmentId/custom-property',
    deleteEnvironmentCustomPropertyByIdAndTenantIdUseCaseEndpointFactory(
      useCase.deleteEnvironmentCustomPropertyByIdAndTenantId
    )
  );

  return router;
}

function createNewEnvironmentUseCaseEndpointFactory(
  useCase: EnvironmentUseCase['createNewEnvironment']
): EndpointHandler {
  return async function createNewEnvironmentUseCaseEndpoint(
    req: Request,
    res: Response
  ): Promise<void> {
    const tenantId = req.params['tenantId'] as string;
    const dto = req.body as ICreateTenantEnvironmentDto;
    const result = await useCase(tenantId, dto);

    res.status(StatusCodes.CREATED).json(result);
    return;
  };
}

function getEnvironmentByIdAndTenantIdUseCaseEndpointFactory(
  useCase: EnvironmentUseCase['getEnvironmentByIdAndTenantId']
): EndpointHandler {
  return async function getEnvironmentByIdAndTenantIdUseCaseEndpoint(
    req: Request,
    res: Response
  ): Promise<void> {
    const tenantId = req.params['tenantId'] as string;
    const environmentId = req.params['environmentId'] as string;
    const environment = await useCase(environmentId, tenantId);

    if (!environment) {
      res.status(StatusCodes.NOT_FOUND).send();
      return;
    }

    res.status(StatusCodes.OK).json(environment);
    return;
  };
}

function deleteEnvironmentByIdAndTenantIdUseCaseEndpointFactory(
  useCase: EnvironmentUseCase['deleteEnvironmentByIdAndTenantId']
): EndpointHandler {
  return async function deleteEnvironmentByIdAndTenantIdUseCaseEndpoint(
    req: Request,
    res: Response
  ): Promise<void> {
    const tenantId = req.params['tenantId'] as string;
    const environmentId = req.params['environmentId'] as string;
    await useCase(environmentId, tenantId);

    res.status(StatusCodes.NO_CONTENT).send();
    return;
  };
}

function updateEnvironmentNonSensitivePropertiesByIdAndTenantIdUseCaseEndpointFactory(
  useCase: EnvironmentUseCase['updateEnvironmentNonSensitivePropertiesByIdAndTenantId']
): EndpointHandler {
  return async function updateEnvironmentNonSensitivePropertiesByIdAndTenantIdUseCaseEndpoint(
    req: Request,
    res: Response
  ): Promise<void> {
    const tenantId = req.params['tenantId'] as string;
    const environmentId = req.params['environmentId'] as string;
    const dto = req.body as IUpdateTenantEnvironmentNonSensitivePropertiesDto;
    await useCase(environmentId, tenantId, dto);

    res.status(StatusCodes.OK).send();
    return;
  };
}

function setEnvironmentCustomPropertyByIdAndTenantIdUseCaseEndpointFactory(
  useCase: EnvironmentUseCase['setEnvironmentCustomPropertyByIdAndTenantId']
): EndpointHandler {
  return async function setEnvironmentCustomPropertyByIdAndTenantIdUseCaseEndpoint(
    req: Request,
    res: Response
  ): Promise<void> {
    const tenantId = req.params['tenantId'] as string;
    const environmentId = req.params['environmentId'] as string;
    const dto =
      req.body as ITenantEnvironmentCustomPropertiesOperationDtoSchema;
    await useCase(environmentId, tenantId, dto);

    res.status(StatusCodes.OK).send();
    return;
  };
}

function deleteEnvironmentCustomPropertyByIdAndTenantIdUseCaseEndpointFactory(
  useCase: EnvironmentUseCase['deleteEnvironmentCustomPropertyByIdAndTenantId']
): EndpointHandler {
  return async function deleteEnvironmentCustomPropertyByIdAndTenantIdUseCaseEndpoint(
    req: Request,
    res: Response
  ): Promise<void> {
    const tenantId = req.params['tenantId'] as string;
    const environmentId = req.params['environmentId'] as string;
    const payload = req.body as { customProperty: string };
    await useCase(environmentId, tenantId, payload.customProperty);

    res.status(StatusCodes.OK).send();
    return;
  };
}

export { makeEnvironmentUseCaseEndpoints };
