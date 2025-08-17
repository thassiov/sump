import { IUpdateProfileDto } from '../../types/dto.type';
import { IProfile } from '../../types/profile.type';
import { IProfileRepository } from './types/repository.type';
import { IProfileService } from './types/service.type';

class ProfileService implements IProfileService {
  constructor(private readonly profileRepository: IProfileRepository) {}

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
