import { contexts } from '../../lib/contexts';
import { ServiceOperationError } from '../../lib/errors/service-operation.error';
import { logger } from '../../lib/logger';
import { uuidv4Schema } from '../../lib/types';
import { IUpdateAccountRepository } from '../../repositories/update-account/types';
import {
  IUpdateAccountProtectedFieldsDto,
  IUpdateAccountService,
  IUpdateAccountUnprotectedFieldsDto,
  updateAccountUnprotectedFieldsDtoSchema,
} from './types';

export class UpdateAccountService implements IUpdateAccountService {
  constructor(
    private readonly updateAccountRepository: IUpdateAccountRepository
  ) {}

  async updateUnprotectedFields(
    accountId: string,
    accountDto: IUpdateAccountUnprotectedFieldsDto
  ): Promise<boolean> {
    if (!uuidv4Schema.safeParse(accountId).success) {
      const errorInstance = new ServiceOperationError({
        details: {
          input: { id: accountId, payload: accountDto },
          type: 'validation',
          errors: 'The provided account id is not valid',
        },
        context: contexts.UPDATE_ACCOUNT_UNPROTECTED_FIELDS,
      });

      logger.error(errorInstance);
      throw errorInstance;
    }

    if (
      !updateAccountUnprotectedFieldsDtoSchema.safeParse(accountDto).success
    ) {
      const errorInstance = new ServiceOperationError({
        details: {
          input: { id: accountId, payload: accountDto },
          type: 'validation',
          errors: 'The provided payload is not valid',
        },
        context: contexts.UPDATE_ACCOUNT_UNPROTECTED_FIELDS,
      });

      logger.error(errorInstance);
      throw errorInstance;
    }

    try {
      const result = await this.updateAccountRepository.updateUnprotectedFields(
        accountId,
        accountDto
      );

      return result;
    } catch (error) {
      const errorInstance = new ServiceOperationError({
        details: {
          input: { id: accountId, payload: accountDto },
          type: 'technical',
        },
        cause: error as Error,
        context: contexts.UPDATE_ACCOUNT_UNPROTECTED_FIELDS,
      });

      logger.error(errorInstance);
      throw errorInstance;
    }
  }

  async updateProtectedFields(
    accountId: string,
    accountDto: IUpdateAccountProtectedFieldsDto
  ): Promise<boolean> {
    console.log(accountId);
    console.log(accountDto);
    return Promise.resolve(true);
  }
}
