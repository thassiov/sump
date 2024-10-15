import { contexts } from '../../lib/contexts';
import { ServiceOperationError } from '../../lib/errors/service-operation.error';
import { logger } from '../../lib/logger';
import { IAccountProfileCreateRepository } from '../../repositories/account-profile-create/types';
import {
  accountProfileDtoSchema,
  IAccountProfileCreateResult,
  IAccountProfileCreateService,
  IAccountProfileDto,
} from './types';

export class AccountProfileCreateService
  implements IAccountProfileCreateService
{
  constructor(
    private readonly accountProfileCreateRepository: IAccountProfileCreateRepository
  ) {}

  async create(
    newAccount: IAccountProfileDto
  ): Promise<IAccountProfileCreateResult> {
    const validationResult = accountProfileDtoSchema.safeParse(newAccount);

    if (!validationResult.success) {
      const errorInstance = new ServiceOperationError({
        details: {
          input: newAccount,
          type: 'validation',
          errors: validationResult.error.issues,
        },
        context: contexts.ACCOUNT_PROFILE_CREATE,
      });

      logger.info(errorInstance);
      throw errorInstance;
    }

    const accountInfo = { handle: newAccount.handle };
    const profileInfo = { fullName: newAccount.fullName };

    try {
      const result = await this.accountProfileCreateRepository.create(
        accountInfo,
        profileInfo
      );

      return result as IAccountProfileCreateResult;
    } catch (error) {
      const errorInstance = new ServiceOperationError({
        details: {
          input: newAccount,
          type: 'technical',
        },
        cause: error as Error,
        context: contexts.ACCOUNT_PROFILE_CREATE,
      });

      logger.info(errorInstance);

      throw errorInstance;
    }
  }
}
