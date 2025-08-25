import express, { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
// import { setupLogger } from '../../lib/logger/logger';
import { EndpointHandler } from '../../lib/types';
import { AccountService } from './account.service';
import { ICreateAccountDto, IUpdateAccountDto } from './types/dto.type';

const router = express.Router();
// const logger = setupLogger('enpoint-v1-accounts');

function makeServiceEndpoints(accountService: AccountService): express.Router {
  router.post(
    '/v1/accounts/',
    makeCreateAccountEndpointFactory(accountService)
  );
  router.get(
    '/v1/accounts/:id',
    makeGetAccountByIdEndpointFactory(accountService)
  );
  router.patch(
    '/v1/accounts/:id',
    makeUpdateAccountByIdEndpointFactory(accountService)
  );
  router.delete(
    '/v1/accounts/:id',
    makeRemoveAccountByIdEndpointFactory(accountService)
  );

  return router;
}

function makeCreateAccountEndpointFactory(
  accountService: AccountService
): EndpointHandler {
  return async function makeCreateAccountEndpoint(
    req: Request,
    res: Response
  ): Promise<void> {
    const accountId = await accountService.createAccount(
      req.body as ICreateAccountDto
    );

    res.status(StatusCodes.CREATED).json({ accountId });
    return;
  };
}

function makeGetAccountByIdEndpointFactory(
  accountService: AccountService
): EndpointHandler {
  return async function makeGetAccountByIdEndpoint(
    req: Request,
    res: Response
  ): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const account = await accountService.getAccountById(req.params['id']!);

    if (!account) {
      res.status(StatusCodes.NOT_FOUND).send();
      return;
    }

    res.status(StatusCodes.OK).json({ account });
    return;
  };
}

function makeUpdateAccountByIdEndpointFactory(
  accountService: AccountService
): EndpointHandler {
  return async function makeUpdateAccountByIdEndpoint(
    req: Request,
    res: Response
  ): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const accountId = req.params['id']!;
    const payload = req.body as IUpdateAccountDto;
    const account = await accountService.updateAccountById(accountId, payload);

    if (!account) {
      res.status(StatusCodes.NOT_FOUND).send();
      return;
    }

    res.status(StatusCodes.OK).send();
    return;
  };
}

function makeRemoveAccountByIdEndpointFactory(
  accountService: AccountService
): EndpointHandler {
  return async function makeRemoveAccountByIdEndpoint(
    req: Request,
    res: Response
  ): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const accountId = req.params['id']!;

    await accountService.removeAccountById(accountId);

    res.status(StatusCodes.NO_CONTENT).send();
    return;
  };
}

export { makeServiceEndpoints };
