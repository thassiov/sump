import express, { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
// import { setupLogger } from '../../lib/logger/logger';
import { EndpointHandler } from '../../lib/types';
import { TenantService } from './tenant.service';
import { ICreateTenantDto, IUpdateTenantDto } from './types/dto.type';

const router = express.Router();
// const logger = setupLogger('enpoint-v1-accounts');

function makeServiceEndpoints(tenantService: TenantService): express.Router {
  router.post('/v1/tenants/', makeCreateTenantEndpointFactory(tenantService));
  router.get(
    '/v1/tenants/:id',
    makeGetTenantByIdEndpointFactory(tenantService)
  );
  router.patch(
    '/v1/tenants/:id',
    makeUpdateTenantByIdEndpointFactory(tenantService)
  );
  router.delete(
    '/v1/tenants/:id',
    makeRemoveTenantByIdEndpointFactory(tenantService)
  );

  return router;
}

function makeCreateTenantEndpointFactory(
  tenantService: TenantService
): EndpointHandler {
  return async function makeCreateTenantEndpoint(
    req: Request,
    res: Response
  ): Promise<void> {
    const accountId = await tenantService.createTenant(
      req.body as ICreateTenantDto
    );

    res.status(StatusCodes.CREATED).json({ accountId });
    return;
  };
}

function makeGetTenantByIdEndpointFactory(
  tenantService: TenantService
): EndpointHandler {
  return async function makeGetTenantByIdEndpoint(
    req: Request,
    res: Response
  ): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const account = await tenantService.getTenantById(req.params['id']!);

    if (!account) {
      res.status(StatusCodes.NOT_FOUND).send();
      return;
    }

    res.status(StatusCodes.OK).json({ account });
    return;
  };
}

function makeUpdateTenantByIdEndpointFactory(
  tenantService: TenantService
): EndpointHandler {
  return async function makeUpdateTenantByIdEndpoint(
    req: Request,
    res: Response
  ): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const tenantId = req.params['id']!;
    const payload = req.body as IUpdateTenantDto;
    const tenant = await tenantService.updateTenantById(tenantId, payload);

    if (!tenant) {
      res.status(StatusCodes.NOT_FOUND).send();
      return;
    }

    res.status(StatusCodes.OK).send();
    return;
  };
}

function makeRemoveTenantByIdEndpointFactory(
  tenantService: TenantService
): EndpointHandler {
  return async function makeRemoveTenantByIdEndpoint(
    req: Request,
    res: Response
  ): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const tenantId = req.params['id']!;

    await tenantService.removeTenantById(tenantId);

    res.status(StatusCodes.NO_CONTENT).send();
    return;
  };
}

export { makeServiceEndpoints };
