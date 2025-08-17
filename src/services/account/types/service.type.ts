import { IUpdateAccountDto } from '../../../types/dto.type';
import { IAccount } from './account.type';

export type IAccountService = {
  getAccountById: (accountId: string) => Promise<IAccount | undefined>;
  removeAccountById: (accountId: string) => Promise<boolean>;
  updateAccountById: (
    accountId: string,
    updateAccountDto: IUpdateAccountDto
  ) => Promise<boolean>;
};
