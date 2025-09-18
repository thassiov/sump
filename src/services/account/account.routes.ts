import express, { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
// import { setupLogger } from '../../lib/logger/logger';
import { EndpointHandler } from '../../lib/types';
import { AccountService } from './account.service';
import {
  ICreateAccountDto,
  IUpdateAccountEmailDto,
  IUpdateAccountNonSensitivePropertiesDto,
  IUpdateAccountPhoneDto,
  IUpdateAccountUsernameDto,
} from './types/dto.type';

const router = express.Router();
// const logger = setupLogger('enpoint-v1-accounts');

function makeServiceEndpoints(accountService: AccountService): express.Router {
  router.post('/v1/accounts/', makeCreateEndpointFactory(accountService));

  router.get(
    '/v1/accounts/',
    makeGetByUserDefinedIdentificationEndpointFactory(accountService)
  );

  router.get('/v1/accounts/:id', makeGetByIdEndpointFactory(accountService));

  router.patch(
    '/v1/accounts/:id',
    makeUpdateNonSensitivePropertiesByIdEndpointFactory(accountService)
  );

  router.patch(
    '/v1/accounts/:id/email',
    makeUpdateEmailByIdEndpointFactory(accountService)
  );

  router.patch(
    '/v1/accounts/:id/phone',
    makeUpdatePhoneByIdEndpointFactory(accountService)
  );

  router.patch(
    '/v1/accounts/:id/username',
    makeUpdateUsernameByIdEndpointFactory(accountService)
  );

  router.delete(
    '/v1/accounts/:id',
    makeDeleteByIdEndpointFactory(accountService)
  );

  return router;
}

function makeCreateEndpointFactory(
  accountService: AccountService
): EndpointHandler {
  return async function makeCreateEndpoint(
    req: Request,
    res: Response
  ): Promise<void> {
    const tenantId = req.query['tenantId'] as string;
    const id = await accountService.create(
      tenantId,
      req.body as ICreateAccountDto
    );

    res.status(StatusCodes.CREATED).json({ id });
    return;
  };
}

function makeGetByIdEndpointFactory(
  accountService: AccountService
): EndpointHandler {
  return async function makeGetByIdEndpoint(
    req: Request,
    res: Response
  ): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const id = req.params['id']!;

    const tenantId = req.query['tenantId'] as string;

    let account;

    if (tenantId) {
      account = await accountService.getByAccountIdAndTenantId(id, tenantId);
    }

    account = await accountService.getById(id);

    if (!account) {
      res.status(StatusCodes.NOT_FOUND).send();
      return;
    }

    res.status(StatusCodes.OK).json({ account });
    return;
  };
}

function makeGetByUserDefinedIdentificationEndpointFactory(
  accountService: AccountService
): EndpointHandler {
  return async function makeGetByUserDefinedIdentificationEndpoint(
    req: Request,
    res: Response
  ): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const userDefinedIdentification = req.query;
    const account = await accountService.getByUserDefinedIdentification(
      userDefinedIdentification
    );

    if (!account) {
      res.status(StatusCodes.NOT_FOUND).send();
      return;
    }

    res.status(StatusCodes.OK).json({ account });
    return;
  };
}

function makeUpdateNonSensitivePropertiesByIdEndpointFactory(
  accountService: AccountService
): EndpointHandler {
  return async function makeUpdateNonSensitivePropertiesByIdEndpoint(
    req: Request,
    res: Response
  ): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const id = req.params['id']!;
    const dto = req.body as IUpdateAccountNonSensitivePropertiesDto;
    const account = await accountService.updateNonSensitivePropertiesById(
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
  accountService: AccountService
): EndpointHandler {
  return async function makeUpdateEmailByIdEndpoint(
    req: Request,
    res: Response
  ): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const id = req.params['id']!;
    const dto = req.body as IUpdateAccountEmailDto;
    const account = await accountService.updateEmailById(id, dto);

    if (!account) {
      res.status(StatusCodes.NOT_FOUND).send();
      return;
    }

    res.status(StatusCodes.OK).send();
    return;
  };
}

function makeUpdatePhoneByIdEndpointFactory(
  accountService: AccountService
): EndpointHandler {
  return async function makeUpdatePhoneByIdEndpoint(
    req: Request,
    res: Response
  ): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const id = req.params['id']!;
    const dto = req.body as IUpdateAccountPhoneDto;
    const account = await accountService.updatePhoneById(id, dto);

    if (!account) {
      res.status(StatusCodes.NOT_FOUND).send();
      return;
    }

    res.status(StatusCodes.OK).send();
    return;
  };
}

function makeUpdateUsernameByIdEndpointFactory(
  accountService: AccountService
): EndpointHandler {
  return async function makeUpdateUsernameByIdEndpoint(
    req: Request,
    res: Response
  ): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const id = req.params['id']!;
    const dto = req.body as IUpdateAccountUsernameDto;
    const account = await accountService.updateUsernameById(id, dto);

    if (!account) {
      res.status(StatusCodes.NOT_FOUND).send();
      return;
    }

    res.status(StatusCodes.OK).send();
    return;
  };
}

function makeDeleteByIdEndpointFactory(
  accountService: AccountService
): EndpointHandler {
  return async function makeDeleteByIdEndpoint(
    req: Request,
    res: Response
  ): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const id = req.params['id']!;

    await accountService.deleteById(id);

    res.status(StatusCodes.NO_CONTENT).send();
    return;
  };
}

export { makeServiceEndpoints };
