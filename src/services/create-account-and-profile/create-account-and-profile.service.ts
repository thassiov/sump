import { contexts } from '../../lib/contexts';
import { ServiceOperationError } from '../../lib/errors/service-operation.error';
import { logger } from '../../lib/logger';
import { ICreateAccountAndProfileRepository } from '../../repositories/create-account-and-profile/types';
import {
  accountProfileDtoSchema,
  ICreateAccountAndProfileDto,
  ICreateAccountAndProfileResult,
  ICreateAccountAndProfileService,
} from './types';

export class CreateAccountAndProfileService
  implements ICreateAccountAndProfileService
{
  constructor(
    private readonly accountProfileCreateRepository: ICreateAccountAndProfileRepository
  ) {}

  async create(
    newAccount: ICreateAccountAndProfileDto
  ): Promise<ICreateAccountAndProfileResult> {
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

      return result;
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
