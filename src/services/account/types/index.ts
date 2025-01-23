import { IAccount } from '../../../types/account.type';
import { IUpdateAccountDto } from '../../../types/dto.type';

export type IAccountService = {
  getAccountById: (accountId: string) => Promise<IAccount | undefined>;
  removeAccountById: (accountId: string) => Promise<boolean>;
  updateAccountById: (
    accountId: string,
    updateAccountDto: IUpdateAccountDto
  ) => Promise<boolean>;
};
