import { contexts } from '../../lib/contexts';
import { ServiceOperationError } from '../../lib/errors/service-operation.error';
import { logger } from '../../lib/logger';
import { createProfileDtoSchema, ICreateProfileDto } from './types/dto.type';
import { IProfile } from './types/profile.type';
import { IProfileRepository } from './types/repository.type';
import { IProfileService } from './types/service.type';

class ProfileService implements IProfileService {
  constructor(private readonly profileRepository: IProfileRepository) {}

  async createProfile(newProfile: ICreateProfileDto, accountId: string) {
    const validationResult = createProfileDtoSchema.safeParse(newProfile);

    if (!validationResult.success) {
      const errorInstance = new ServiceOperationError({
        details: {
          input: newProfile,
          errors: validationResult.error.issues,
        },
        // @NOTE: add a new context, just for the profile
        context: contexts.ACCOUNT_PROFILE_CREATE,
      });

      logger.info(errorInstance);
      throw errorInstance;
    }

    try {
      const profileId = await this.profileRepository.create({
        ...newProfile,
        accountId,
      });
      return { profileId };
    } catch (error) {
      const errorInstance = new ServiceOperationError({
        details: {
          input: newProfile,
        },
        cause: error as Error,
        // @NOTE: add a new context, just for the profile
        context: contexts.ACCOUNT_PROFILE_CREATE,
      });

      logger.error(errorInstance);

      throw errorInstance;
    }
  }

  async getProfileByAccountId(
    accountId: string
  ): Promise<IProfile | undefined> {
    return this.profileRepository.getProfileByAccountId(accountId);
  }

  async updateProfileByAccountId(
    accountId: string,
    updateProfileDto: IUpdateProfileDto
  ): Promise<boolean> {
    return this.profileRepository.updateProfileByAccountId(
      accountId,
      updateProfileDto
    );
  }
}

export { ProfileService };
