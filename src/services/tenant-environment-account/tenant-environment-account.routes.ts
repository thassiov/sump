import express, { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
// import { setupLogger } from '../../lib/logger/logger';
import { EndpointHandler } from '../../lib/types';
import { TenantEnvironmentAccountService } from './tenant-environment-account.service';
import {
  ICreateTenantEnvironmentAccountNoInternalPropertiesDto,
  ITenantEnvironmentAccountCustomPropertiesOperationDtoSchema,
  IUpdateTenantEnvironmentAccountEmailDto,
  IUpdateTenantEnvironmentAccountNonSensitivePropertiesDto,
  IUpdateTenantEnvironmentAccountPhoneDto,
  IUpdateTenantEnvironmentAccountUsernameDto,
} from './types/dto.type';

const router = express.Router();
// const logger = setupLogger('enpoint-v1-accounts');

function makeServiceEndpoints(
  tenantEnvironmentAccountService: TenantEnvironmentAccountService
): express.Router {
  router.post(
    '/v1/tenant-environment-accounts/',
    makeCreateEndpointFactory(tenantEnvironmentAccountService)
  );

  router.get(
    '/v1/tenant-environment-accounts/:id',
    makeGetByIdEndpointFactory(tenantEnvironmentAccountService)
  );

  router.patch(
    '/v1/tenant-environment-accounts/:id',
    makeUpdateNonSensitivePropertiesByIdEndpointFactory(
      tenantEnvironmentAccountService
    )
  );

  router.patch(
    '/v1/tenant-environment-accounts/:id/email',
    makeUpdateEmailByIdEndpointFactory(tenantEnvironmentAccountService)
  );

  router.patch(
    '/v1/tenant-environment-accounts/:id/phone',
    makeUpdatePhoneByIdEndpointFactory(tenantEnvironmentAccountService)
  );

  router.patch(
    '/v1/tenant-environment-accounts/:id/username',
    makeUpdateUsernameByIdEndpointFactory(tenantEnvironmentAccountService)
  );

  router.delete(
    '/v1/tenant-environment-accounts/:id',
    makeDeleteByIdEndpointFactory(tenantEnvironmentAccountService)
  );

  router.post(
    '/v1/tenant-environment-accounts/:id/customProperty',
    makeSetCustomPropertyByIdEndpointFactory(tenantEnvironmentAccountService)
  );

  router.delete(
    '/v1/tenant-environment-accounts/:id/customProperty',
    makeDeleteCustomPropertyByIdEndpointFactory(tenantEnvironmentAccountService)
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
    const tenantEnvironmentId = req.query['tenantEnvironmentId'] as string;
    const id = await tenantEnvironmentAccountService.create(
      tenantEnvironmentId,
      req.body as ICreateTenantEnvironmentAccountNoInternalPropertiesDto
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

function makeUpdateNonSensitivePropertiesByIdEndpointFactory(
  tenantEnvironmentAccountService: TenantEnvironmentAccountService
): EndpointHandler {
  return async function makeUpdateNonSensitivePropertiesByIdEndpoint(
    req: Request,
    res: Response
  ): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const id = req.params['id']!;
    const dto =
      req.body as IUpdateTenantEnvironmentAccountNonSensitivePropertiesDto;
    const account =
      await tenantEnvironmentAccountService.updateNonSensitivePropertiesById(
        id,
        dto
      );

    if (!account) {
      res.status(StatusCodes.NOT_FOUND).send();
      return;
    }

    res.status(StatusCodes.OK).send();
    return;
  };
}

function makeUpdateEmailByIdEndpointFactory(
  tenantEnvironmentAccountService: TenantEnvironmentAccountService
): EndpointHandler {
  return async function makeUpdateEmailByIdEndpoint(
    req: Request,
    res: Response
  ): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const id = req.params['id']!;
    const dto = req.body as IUpdateTenantEnvironmentAccountEmailDto;
    const account = await tenantEnvironmentAccountService.updateEmailById(
      id,
      dto
    );

    if (!account) {
      res.status(StatusCodes.NOT_FOUND).send();
      return;
    }

    res.status(StatusCodes.OK).send();
    return;
  };
}

function makeUpdatePhoneByIdEndpointFactory(
  tenantEnvironmentAccountService: TenantEnvironmentAccountService
): EndpointHandler {
  return async function makeUpdatePhoneByIdEndpoint(
    req: Request,
    res: Response
  ): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const id = req.params['id']!;
    const dto = req.body as IUpdateTenantEnvironmentAccountPhoneDto;
    const account = await tenantEnvironmentAccountService.updatePhoneById(
      id,
      dto
    );

    if (!account) {
      res.status(StatusCodes.NOT_FOUND).send();
      return;
    }

    res.status(StatusCodes.OK).send();
    return;
  };
}

function makeUpdateUsernameByIdEndpointFactory(
  tenantEnvironmentAccountService: TenantEnvironmentAccountService
): EndpointHandler {
  return async function makeUpdateUsernameByIdEndpoint(
    req: Request,
    res: Response
  ): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const id = req.params['id']!;
    const dto = req.body as IUpdateTenantEnvironmentAccountUsernameDto;
    const account = await tenantEnvironmentAccountService.updateUsernameById(
      id,
      dto
    );

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

function makeSetCustomPropertyByIdEndpointFactory(
  tenantEnvironmentAccountService: TenantEnvironmentAccountService
): EndpointHandler {
  return async function makeSetCustomPropertyByIdEndpoint(
    req: Request,
    res: Response
  ): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const id = req.params['id']!;
    const dto =
      req.body as ITenantEnvironmentAccountCustomPropertiesOperationDtoSchema;
    const tenant = await tenantEnvironmentAccountService.setCustomPropertyById(
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
  tenantEnvironmentAccountService: TenantEnvironmentAccountService
): EndpointHandler {
  return async function makeDeleteCustomPropertyByIdEndpoint(
    req: Request,
    res: Response
  ): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const id = req.params['id']!;
    const dto = req.body as { customPropertyKey: string };
    const tenant =
      await tenantEnvironmentAccountService.deleteCustomPropertyById(
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
