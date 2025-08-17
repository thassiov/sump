import { contexts } from '../../lib/contexts';
import { ServiceOperationError } from '../../lib/errors/service-operation.error';
import { logger } from '../../lib/logger';
import {
  createAccountAndProfileDtoSchema,
  ICreateAccountAndProfileDto,
  ICreateAccountAndProfileOperationResult,
} from '../../types/dto.type';
import { splitCreateAccountAndProfileDto } from './lib/utils';
import { ICreateAccountAndProfileRepository } from './types/repository.type';
import { ICreateAccountAndProfileService } from './types/service.type';

export class CreateAccountAndProfileService
  implements ICreateAccountAndProfileService
{
  constructor(
    private readonly accountProfileCreateRepository: ICreateAccountAndProfileRepository
  ) {}

  async createNewAccountAndProfile(
    newAccount: ICreateAccountAndProfileDto
  ): Promise<ICreateAccountAndProfileOperationResult> {
    // @TODO: move this validation to a api middleware. this service is suposed to receive the correct data
    const validationResult =
      createAccountAndProfileDtoSchema.safeParse(newAccount);

    if (!validationResult.success) {
      const errorInstance = new ServiceOperationError({
        details: {
          input: newAccount,
          errors: validationResult.error.issues,
        },
        context: contexts.ACCOUNT_PROFILE_CREATE,
      });

      logger.info(errorInstance);
      throw errorInstance;
    }

    const { accountInfo, profileInfo } =
      splitCreateAccountAndProfileDto(newAccount);

    try {
      const result =
        await this.accountProfileCreateRepository.createNewAccountAndProfile(
          accountInfo,
          profileInfo
        );

      return result;
    } catch (error) {
      const errorInstance = new ServiceOperationError({
        details: {
          input: newAccount,
        },
        cause: error as Error,
        context: contexts.ACCOUNT_PROFILE_CREATE,
      });

      logger.error(errorInstance);

      throw errorInstance;
    }
  }
}
