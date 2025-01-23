import { Knex } from 'knex';
import { ICreateProfileDto } from '../../../types/dto.type';

type IProfileRepository = {
  create: (
    createProfileDto: ICreateProfileDto & { accountId: string },
    transaction?: Knex.Transaction
  ) => Promise<string>;
};

export type { IProfileRepository };
