/* eslint-disable @typescript-eslint/non-nullable-type-assertion-style */
import express, { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import {
  CreateNewTenantUseCaseDto,
  IUpdateTenantNonSensitivePropertiesDto,
} from '../../../core/types/tenant/dto.type';
import { ITenant } from '../../../core/types/tenant/tenant.type';
import { TenantUseCase } from '../../../core/use-cases';
import { EndpointHandler } from '../../../lib/types';

const router = express.Router();

function makeTenantUseCaseEndpoints(useCase: TenantUseCase): express.Router {
  router.post(
    '/tenants',
    createNewTenantUseCaseEndpointFactory(useCase.createNewTenant)
  );

  router.delete(
    '/tenants/:tenantId',
    deleteTenantByIdUseCaseEndpointFactory(useCase.deleteTenantById)
  );

  router.get(
    '/tenants/:tenantId',
    getTenantByIdUseCaseEndpointFactory(useCase.getTenantById)
  );

  router.patch(
    '/tenants/:tenantId/',
    updateNonSensitivePropertiesByTenantIdUseCaseEndpointFactory(
      useCase.updateNonSensitivePropertiesByIdUseCase
    )
  );

  router.get(
    '/tenants/:tenantId/accounts',
    getAccountsByTenantIdUseCaseEndpointFactory(useCase.getAccountsByTenantId)
  );

  router.delete(
    '/tenants/:tenantId/custom-property',
    deleteCustomPropertyByTenantIdUseCaseEndpointFactory(
      useCase.deleteCustomPropertyByTenantIdUseCase
    )
  );

  router.patch(
    '/tenants/:tenantId/custom-property',
    setCustomPropertyByTenantIdUseCaseEndpointFactory(
      useCase.setCustomPropertyByTenantIdUseCase
    )
  );

  return router;
}

function createNewTenantUseCaseEndpointFactory(
  useCase: TenantUseCase['createNewTenant']
): EndpointHandler {
  return async function createNewTenantUseCaseEndpoint(
    req: Request,
    res: Response
  ): Promise<void> {
    const dto = req.body as CreateNewTenantUseCaseDto;
    const result = await useCase(dto);

    res.status(StatusCodes.CREATED).json(result);
    return;
  };
}

function deleteTenantByIdUseCaseEndpointFactory(
  useCase: TenantUseCase['deleteTenantById']
): EndpointHandler {
  return async function deleteTenantByIdUseCaseEndpoint(
    req: Request,
    res: Response
  ): Promise<void> {
    const tenantId = req.params['tenantId'] as string;
    await useCase(tenantId);

    res.status(StatusCodes.NO_CONTENT).send();
    return;
  };
}

function getTenantByIdUseCaseEndpointFactory(
  useCase: TenantUseCase['getTenantById']
): EndpointHandler {
  return async function getTenantByIdUseCaseEndpoint(
    req: Request,
    res: Response
  ): Promise<void> {
    const tenantId = req.params['tenantId'] as string;
    const tenant = await useCase(tenantId);

    res.status(StatusCodes.OK).json(tenant);
    return;
  };
}

function getAccountsByTenantIdUseCaseEndpointFactory(
  useCase: TenantUseCase['getAccountsByTenantId']
): EndpointHandler {
  return async function getAccountsByTenantIdUseCaseEndpoint(
    req: Request,
    res: Response
  ): Promise<void> {
    const tenantId = req.params['tenantId'] as string;
    const accounts = await useCase(tenantId);

    res.status(StatusCodes.OK).json(accounts);
    return;
  };
}

function deleteCustomPropertyByTenantIdUseCaseEndpointFactory(
  useCase: TenantUseCase['deleteCustomPropertyByTenantIdUseCase']
): EndpointHandler {
  return async function deleteCustomPropertyByTenantIdUseCaseEndpoint(
    req: Request,
    res: Response
  ): Promise<void> {
    const tenantId = req.params['tenantId'] as string;
    const payload = req.body as { customProperty: string };
    await useCase(tenantId, payload.customProperty);

    res.status(StatusCodes.NO_CONTENT).send();
    return;
  };
}

function setCustomPropertyByTenantIdUseCaseEndpointFactory(
  useCase: TenantUseCase['setCustomPropertyByTenantIdUseCase']
): EndpointHandler {
  return async function setCustomPropertyByTenantIdUseCaseEndpoint(
    req: Request,
    res: Response
  ): Promise<void> {
    const tenantId = req.params['tenantId'] as string;
    const dto = req.body as ITenant['customProperties'];
    await useCase(tenantId, dto);

    res.status(StatusCodes.OK).send();
    return;
  };
}

function updateNonSensitivePropertiesByTenantIdUseCaseEndpointFactory(
  useCase: TenantUseCase['updateNonSensitivePropertiesByIdUseCase']
): EndpointHandler {
  return async function updateNonSensitivePropertiesByTenantIdUseCaseEndpoint(
    req: Request,
    res: Response
  ): Promise<void> {
    const tenantId = req.params['tenantId'] as string;
    const dto = req.body as IUpdateTenantNonSensitivePropertiesDto;
    await useCase(tenantId, dto);

    res.status(StatusCodes.OK).send();
    return;
  };
}

export { makeTenantUseCaseEndpoints };
