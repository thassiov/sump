import { Knex } from 'knex';
import { IAccount } from '../../../types/account.type';
import { ICreateAccountDto, IUpdateAccountDto } from '../../../types/dto.type';

type IAccountRepository = {
  create: (
    createAccountDto: ICreateAccountDto,
    transaction?: Knex.Transaction
  ) => Promise<string>;
  getAccountById(accountId: string): Promise<IAccount | undefined>;
  removeAccountById(accountId: string): Promise<boolean>;
  updateAccountById(
    accountId: string,
    updateAccountDto: IUpdateAccountDto
  ): Promise<boolean>;
};

export type { IAccountRepository };
