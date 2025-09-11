import express, { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
// import { setupLogger } from '../../lib/logger/logger';
import { EndpointHandler } from '../../lib/types';
import { TenantEnvironmentService } from './tenant-environment.service';
import {
  ICreateTenantEnvironmentDto,
  ITenantEnvironmentCustomPropertiesOperationDtoSchema,
  IUpdateTenantEnvironmentNonSensitivePropertiesDto,
} from './types/dto.type';

const router = express.Router();
// const logger = setupLogger('enpoint-v1-accounts');

function makeServiceEndpoints(
  tenantEnvironmentService: TenantEnvironmentService
): express.Router {
  // @FIX: this endpoints are dependent on tenant . Also, it shouldnt be called directly
  router.post(
    '/v1/environments/',
    makeCreateEndpointFactory(tenantEnvironmentService)
  );

  router.get(
    '/v1/environments/',
    makeGetByTenantIdEndpointFactory(tenantEnvironmentService)
  );

  router.get(
    '/v1/environments/:id',
    makeGetByIdEndpointFactory(tenantEnvironmentService)
  );

  router.patch(
    '/v1/environments/:id',
    makeUpdateNonSensitivePropertiesByIdEndpointFactory(
      tenantEnvironmentService
    )
  );

  router.delete(
    '/v1/environments/:id',
    makeDeleteByIdEndpointFactory(tenantEnvironmentService)
  );

  router.post(
    '/v1/environments/:id/customProperty',
    makeSetCustomPropertyByIdEndpointFactory(tenantEnvironmentService)
  );

  router.delete(
    '/v1/environments/:id/customProperty',
    makeDeleteCustomPropertyByIdEndpointFactory(tenantEnvironmentService)
  );

  return router;
}

function makeCreateEndpointFactory(
  tenantEnvironmentService: TenantEnvironmentService
): EndpointHandler {
  return async function makeCreateEndpoint(
    req: Request,
    res: Response
  ): Promise<void> {
    const tenantId = req.query['tenantId'] as string;
    const id = await tenantEnvironmentService.create(
      tenantId,
      req.body as ICreateTenantEnvironmentDto
    );

    res.status(StatusCodes.CREATED).json({ id });
    return;
  };
}

function makeGetByIdEndpointFactory(
  tenantEnvironmentService: TenantEnvironmentService
): EndpointHandler {
  return async function makeGetByIdEndpoint(
    req: Request,
    res: Response
  ): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const id = req.params['id']!;
    const tenant = await tenantEnvironmentService.getById(id);

    if (!tenant) {
      res.status(StatusCodes.NOT_FOUND).send();
      return;
    }

    res.status(StatusCodes.OK).json({ tenant });
    return;
  };
}

function makeGetByTenantIdEndpointFactory(
  tenantEnvironmentService: TenantEnvironmentService
): EndpointHandler {
  return async function makeGetByTenantIdEndpoint(
    req: Request,
    res: Response
  ): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const tenantId = req.query['tenantId'] as string;
    const tenant = await tenantEnvironmentService.getByTenantId(tenantId);

    if (!tenant) {
      res.status(StatusCodes.OK).json([]);
      return;
    }

    res.status(StatusCodes.OK).json({ tenant });
    return;
  };
}

function makeUpdateNonSensitivePropertiesByIdEndpointFactory(
  tenantEnvironmentService: TenantEnvironmentService
): EndpointHandler {
  return async function makeUpdateNonSensitivePropertiesByIdEndpoint(
    req: Request,
    res: Response
  ): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const id = req.params['id']!;
    const dto = req.body as IUpdateTenantEnvironmentNonSensitivePropertiesDto;
    const tenant =
      await tenantEnvironmentService.updateNonSensitivePropertiesById(id, dto);

    if (!tenant) {
      res.status(StatusCodes.NOT_FOUND).send();
      return;
    }

    res.status(StatusCodes.OK).send();
    return;
  };
}

function makeDeleteByIdEndpointFactory(
  tenantEnvironmentService: TenantEnvironmentService
): EndpointHandler {
  return async function makeDeleteByIdEndpoint(
    req: Request,
    res: Response
  ): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const id = req.params['id']!;

    await tenantEnvironmentService.deleteById(id);

    res.status(StatusCodes.NO_CONTENT).send();
    return;
  };
}

function makeSetCustomPropertyByIdEndpointFactory(
  tenantEnvironmentService: TenantEnvironmentService
): EndpointHandler {
  return async function makeSetCustomPropertyByIdEndpoint(
    req: Request,
    res: Response
  ): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const id = req.params['id']!;
    const dto =
      req.body as ITenantEnvironmentCustomPropertiesOperationDtoSchema;
    const tenant = await tenantEnvironmentService.setCustomPropertyById(
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

function makeDeleteCustomPropertyByIdEndpointFactory(
  tenantEnvironmentService: TenantEnvironmentService
): EndpointHandler {
  return async function makeDeleteCustomPropertyByIdEndpoint(
    req: Request,
    res: Response
  ): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const id = req.params['id']!;
    const dto = req.body as { customPropertyKey: string };
    const tenant = await tenantEnvironmentService.deleteCustomPropertyById(
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
