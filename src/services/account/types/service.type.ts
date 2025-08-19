import { Knex } from 'knex';
import { IAccount } from './account.type';
import {
  ICreateAccountDto,
  ICreateAccountOperationResult,
  IUpdateAccountDto,
} from './dto.type';

export type IAccountService = {
  createAccount: (
    newAccount: ICreateAccountDto,
    transaction?: Knex.Transaction
  ) => Promise<ICreateAccountOperationResult>;
  getAccountById: (accountId: string) => Promise<IAccount | undefined>;
  removeAccountById: (accountId: string) => Promise<boolean>;
  updateAccountById: (
    accountId: string,
    updateAccountDto: IUpdateAccountDto
  ) => Promise<boolean>;
};
