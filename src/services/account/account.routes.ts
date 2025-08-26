import express, { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
// import { setupLogger } from '../../lib/logger/logger';
import { EndpointHandler } from '../../lib/types';
import { AccountService } from './account.service';
import { ICreateAccountDto, IUpdateAccountDto } from './types/dto.type';

const router = express.Router();
// const logger = setupLogger('enpoint-v1-accounts');

function makeServiceEndpoints(accountService: AccountService): express.Router {
  router.post('/v1/accounts/', makeCreateEndpointFactory(accountService));
  router.get('/v1/accounts/:id', makeGetByIdEndpointFactory(accountService));
  router.patch(
    '/v1/accounts/:id',
    makeUpdateByIdEndpointFactory(accountService)
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
    const id = await accountService.create(req.body as ICreateAccountDto);

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
    const account = await accountService.getById(id);

    if (!account) {
      res.status(StatusCodes.NOT_FOUND).send();
      return;
    }

    res.status(StatusCodes.OK).json({ account });
    return;
  };
}

function makeUpdateByIdEndpointFactory(
  accountService: AccountService
): EndpointHandler {
  return async function makeUpdateByIdEndpoint(
    req: Request,
    res: Response
  ): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const id = req.params['id']!;
    const dto = req.body as IUpdateAccountDto;
    const account = await accountService.updateById(id, dto);

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
