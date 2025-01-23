import { Knex } from 'knex';
import { ICreateAccountDto } from '../../../types/dto.type';

export type IAccountRepository = {
  create: (
    createAccountDto: ICreateAccountDto,
    transaction?: Knex.Transaction
  ) => Promise<string>;
};
