import {
  accountProfileDtoSchema,
  IAccountProfileCreateResult,
  IAccountProfileCreateService,
  IAccountProfileDto,
} from './types';
import { IAccountProfileCreateRepository } from 'src/repositories/account-profile-create/types';
import { logger } from '../../lib/logger';
import { AccountProfileCreateError } from '../../lib/errors';

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
      const errorInstance = new AccountProfileCreateError({
        details: {
          input: newAccount,
          type: 'validation',
          errors: validationResult.error.issues,
        },
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
      const errorInstance = new AccountProfileCreateError({
        details: {
          input: newAccount,
          type: 'technical',
        },
        cause: error as Error,
      });

      logger.info(errorInstance);

      throw errorInstance;
    }
  }
}
