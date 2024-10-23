import { IProfile } from '../../../types/account.type';

type IProfileRetrieveService = {
  retrieveByAccountId: (accountId: string) => Promise<IProfile | null>;
};

export type { IProfileRetrieveService };
