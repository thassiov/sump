import { Knex } from 'knex';
import { ICreateProfileDto, IUpdateProfileDto } from '../../../types/dto.type';
import { IProfile } from '../../../types/profile.type';

type IProfileRepository = {
  create: (
    createProfileDto: ICreateProfileDto & { accountId: string },
    transaction?: Knex.Transaction
  ) => Promise<string>;
  getProfileByAccountId: (accountId: string) => Promise<IProfile>;
  updateProfileByAccountId: (
    accountId: string,
    updateProfileDto: IUpdateProfileDto
  ) => Promise<boolean>;
};

export type { IProfileRepository };
