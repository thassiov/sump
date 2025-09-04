import express, { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
// import { setupLogger } from '../../lib/logger/logger';
import { EndpointHandler } from '../../lib/types';
import { TenantService } from './tenant.service';
import {
  ICreateTenantDto,
  ITenantCustomPropertiesOperationDtoSchema,
  IUpdateTenantNonSensitivePropertiesDto,
} from './types/dto.type';

const router = express.Router();
// const logger = setupLogger('enpoint-v1-accounts');

function makeServiceEndpoints(tenantService: TenantService): express.Router {
  router.post('/v1/tenants/', makeCreateEndpointFactory(tenantService));

  router.get('/v1/tenants/:id', makeGetByIdEndpointFactory(tenantService));

  router.patch(
    '/v1/tenants/:id',
    makeUpdateNonSensitivePropertiesByIdEndpointFactory(tenantService)
  );

  router.delete(
    '/v1/tenants/:id',
    makeDeleteByIdEndpointFactory(tenantService)
  );

  router.post(
    '/v1/tenants/:id/customProperty',
    makeSetCustomPropertyByIdEndpointFactory(tenantService)
  );

  router.delete(
    '/v1/tenants/:id/customProperty',
    makeDeleteCustomPropertyByIdEndpointFactory(tenantService)
  );

  return router;
}

function makeCreateEndpointFactory(
  tenantService: TenantService
): EndpointHandler {
  return async function makeCreateEndpoint(
    req: Request,
    res: Response
  ): Promise<void> {
    const id = await tenantService.create(req.body as ICreateTenantDto);

    res.status(StatusCodes.CREATED).json({ id });
    return;
  };
}

function makeGetByIdEndpointFactory(
  tenantService: TenantService
): EndpointHandler {
  return async function makeGetByIdEndpoint(
    req: Request,
    res: Response
  ): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const id = req.params['id']!;
    const tenant = await tenantService.getById(id);

    if (!tenant) {
      res.status(StatusCodes.NOT_FOUND).send();
      return;
    }

    res.status(StatusCodes.OK).json({ tenant });
    return;
  };
}

function makeUpdateNonSensitivePropertiesByIdEndpointFactory(
  tenantService: TenantService
): EndpointHandler {
  return async function makeUpdateNonSensitivePropertiesByIdEndpoint(
    req: Request,
    res: Response
  ): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const id = req.params['id']!;
    const dto = req.body as IUpdateTenantNonSensitivePropertiesDto;
    const tenant = await tenantService.updateNonSensitivePropertiesById(
      id,
      dto
    );

    if (!tenant) {
      res.status(StatusCodes.NOT_FOUND).send();
      return;
    }

    res.status(StatusCodes.OK).send();
    return;
  };
}

function makeDeleteByIdEndpointFactory(
  tenantService: TenantService
): EndpointHandler {
  return async function makeDeleteByIdEndpoint(
    req: Request,
    res: Response
  ): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const id = req.params['id']!;

    await tenantService.deleteById(id);

    res.status(StatusCodes.NO_CONTENT).send();
    return;
  };
}

function makeSetCustomPropertyByIdEndpointFactory(
  tenantService: TenantService
): EndpointHandler {
  return async function makeSetCustomPropertyByIdEndpoint(
    req: Request,
    res: Response
  ): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const id = req.params['id']!;
    const dto = req.body as ITenantCustomPropertiesOperationDtoSchema;
    const tenant = await tenantService.setCustomPropertyById(id, dto);

    if (!tenant) {
      res.status(StatusCodes.NOT_FOUND).send();
      return;
    }

    res.status(StatusCodes.OK).send();
    return;
  };
}

function makeDeleteCustomPropertyByIdEndpointFactory(
  tenantService: TenantService
): EndpointHandler {
  return async function makeDeleteCustomPropertyByIdEndpoint(
    req: Request,
    res: Response
  ): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const id = req.params['id']!;
    const dto = req.body as { customPropertyKey: string };
    const tenant = await tenantService.deleteCustomPropertyById(
      id,
      dto.customPropertyKey
    );

    if (!tenant) {
      res.status(StatusCodes.NOT_FOUND).send();
      return;
    }

    res.status(StatusCodes.OK).send();
    return;
  };
}

export { makeServiceEndpoints };
