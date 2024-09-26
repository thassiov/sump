import { IAccount } from 'src/services/account/types';

export type IAccountRepository = {
  create: () => Promise<IAccount>;
  retrieve: (accountId: string) => Promise<IAccount | undefined>;
  remove: (accountId: string) => Promise<boolean>;
};
