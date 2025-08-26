import express, { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
// import { setupLogger } from '../../lib/logger/logger';
import { EndpointHandler } from '../../lib/types';
import { TenantEnvironmentAccountService } from './tenant-environment-account.service';
import {
  ICreateTenantEnvironmentAccountDto,
  IUpdateTenantEnvironmentAccountDto,
} from './types/dto.type';

const router = express.Router();
// const logger = setupLogger('enpoint-v1-accounts');

function makeServiceEndpoints(
  tenantEnvironmentAccountService: TenantEnvironmentAccountService
): express.Router {
  // @FIX: this endpoints are dependent on tenant environment. Also, it shouldnt be called directly
  router.post(
    '/v1/accounts/',
    makeCreateEndpointFactory(tenantEnvironmentAccountService)
  );
  router.get(
    '/v1/accounts/:id',
    makeGetByIdEndpointFactory(tenantEnvironmentAccountService)
  );
  router.patch(
    '/v1/accounts/:id',
    makeUpdateByIdEndpointFactory(tenantEnvironmentAccountService)
  );
  router.delete(
    '/v1/accounts/:id',
    makeDeleteByIdEndpointFactory(tenantEnvironmentAccountService)
  );

  return router;
}

function makeCreateEndpointFactory(
  tenantEnvironmentAccountService: TenantEnvironmentAccountService
): EndpointHandler {
  return async function makeCreateEndpoint(
    req: Request,
    res: Response
  ): Promise<void> {
    const id = await tenantEnvironmentAccountService.create(
      req.body as ICreateTenantEnvironmentAccountDto
    );

    res.status(StatusCodes.CREATED).json({ id });
    return;
  };
}

function makeGetByIdEndpointFactory(
  tenantEnvironmentAccountService: TenantEnvironmentAccountService
): EndpointHandler {
  return async function makeGetByIdEndpoint(
    req: Request,
    res: Response
  ): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const id = req.params['id']!;
    const account = await tenantEnvironmentAccountService.getById(id);

    if (!account) {
      res.status(StatusCodes.NOT_FOUND).send();
      return;
    }

    res.status(StatusCodes.OK).json({ account });
    return;
  };
}

function makeUpdateByIdEndpointFactory(
  tenantEnvironmentAccountService: TenantEnvironmentAccountService
): EndpointHandler {
  return async function makeUpdateByIdEndpoint(
    req: Request,
    res: Response
  ): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const id = req.params['id']!;
    const dto = req.body as IUpdateTenantEnvironmentAccountDto;
    const account = await tenantEnvironmentAccountService.updateById(id, dto);

    if (!account) {
      res.status(StatusCodes.NOT_FOUND).send();
      return;
    }

    res.status(StatusCodes.OK).send();
    return;
  };
}

function makeDeleteByIdEndpointFactory(
  tenantEnvironmentAccountService: TenantEnvironmentAccountService
): EndpointHandler {
  return async function makeDeleteByIdEndpoint(
    req: Request,
    res: Response
  ): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const id = req.params['id']!;

    await tenantEnvironmentAccountService.deleteById(id);

    res.status(StatusCodes.NO_CONTENT).send();
    return;
  };
}

export { makeServiceEndpoints };
