import { Knex } from 'knex';
import { IAccount } from './account.type';
import { ICreateAccountDto, IUpdateAccountDto } from './dto.type';

export type IAccountService = {
  create: (
    dto: ICreateAccountDto,
    transaction?: Knex.Transaction
  ) => Promise<string>;
  getById: (id: string) => Promise<IAccount | undefined>;
  deleteById: (id: string) => Promise<boolean>;
  updateById: (id: string, dto: IUpdateAccountDto) => Promise<boolean>;
};
