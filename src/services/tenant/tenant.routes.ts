import express, { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
// import { setupLogger } from '../../lib/logger/logger';
import { EndpointHandler } from '../../lib/types';
import { TenantService } from './tenant.service';
import { ICreateTenantDto, IUpdateTenantDto } from './types/dto.type';

const router = express.Router();
// const logger = setupLogger('enpoint-v1-accounts');

function makeServiceEndpoints(tenantService: TenantService): express.Router {
  router.post('/v1/tenants/', makeCreateEndpointFactory(tenantService));
  router.get('/v1/tenants/:id', makeGetByIdEndpointFactory(tenantService));
  router.patch('/v1/tenants/:id', makeUpdateByIdEndpointFactory(tenantService));
  router.delete(
    '/v1/tenants/:id',
    makeDeleteByIdEndpointFactory(tenantService)
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

function makeUpdateByIdEndpointFactory(
  tenantService: TenantService
): EndpointHandler {
  return async function makeUpdateByIdEndpoint(
    req: Request,
    res: Response
  ): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const id = req.params['id']!;
    const dto = req.body as IUpdateTenantDto;
    const tenant = await tenantService.updateById(id, dto);

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

export { makeServiceEndpoints };
