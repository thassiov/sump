import { IUpdateProfileDto } from '../../../types/dto.type';
import { IProfile } from '../../../types/profile.type';

export type IProfileService = {
  getProfileByAccountId: (accountId: string) => Promise<IProfile | undefined>;
  updateProfileByAccountId: (
    accountId: string,
    updateProfileDto: IUpdateProfileDto
  ) => Promise<boolean>;
};
