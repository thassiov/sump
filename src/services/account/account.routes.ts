import express, { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { setupLogger } from '../../lib/logger/logger';
import { EndpointHandler } from '../../lib/types';
import { AccountService } from './account.service';
import { ICreateAccountDto, IUpdateAccountDto } from './types/dto.type';

const router = express.Router();
const logger = setupLogger('enpoint-v1-accounts');

function makeServiceEndpoints(accountService: AccountService): express.Router {
  router.use('/v1/accounts');

  router.post('/', makeCreateAccountEndpointFactory(accountService));
  router.get('/:id', makeGetAccountByIdEndpointFactory(accountService));
  router.patch('/:id', makeUpdateAccountByIdEndpointFactory(accountService));
  router.delete('/:id', makeRemoveAccountByIdEndpointFactory(accountService));

  return router;
}

function makeCreateAccountEndpointFactory(
  accountService: AccountService
): EndpointHandler {
  return async function makeCreateAccountEndpoint(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { accountId } = await accountService.createAccount(
        req.body as ICreateAccountDto
      );

      res.status(StatusCodes.CREATED).json({ accountId });
      return;
    } catch (error) {
      logger.error(error);
      return;
    }
  };
}

function makeGetAccountByIdEndpointFactory(
  accountService: AccountService
): EndpointHandler {
  return async function makeGetAccountByIdEndpoint(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const account = await accountService.getAccountById(req.params['id']!);

      if (!account) {
        res.status(StatusCodes.NOT_FOUND).send();
        return;
      }

      res.status(StatusCodes.OK).json({ account });
      return;
    } catch (error) {
      logger.error(error);
      return;
    }
  };
}

function makeUpdateAccountByIdEndpointFactory(
  accountService: AccountService
): EndpointHandler {
  return async function makeUpdateAccountByIdEndpoint(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const accountId = req.params['id']!;
      const payload = req.body as IUpdateAccountDto;
      const account = await accountService.updateAccountById(
        accountId,
        payload
      );

      if (!account) {
        res.status(StatusCodes.NOT_FOUND).send();
        return;
      }

      res.status(StatusCodes.OK).send();
      return;
    } catch (error) {
      logger.error(error);
      return;
    }
  };
}

function makeRemoveAccountByIdEndpointFactory(
  accountService: AccountService
): EndpointHandler {
  return async function makeRemoveAccountByIdEndpoint(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const accountId = req.params['id']!;

      const result = await accountService.removeAccountById(accountId);

      if (!result) {
        res.status(StatusCodes.NOT_FOUND).send();
        return;
      }

      res.status(StatusCodes.NO_CONTENT).send();
      return;
    } catch (error) {
      logger.error(error);
      return;
    }
  };
}

export { makeServiceEndpoints };
