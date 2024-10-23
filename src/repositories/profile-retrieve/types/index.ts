import { IProfile } from '../../../types/account.type';

type IProfileRetrieveRepository = {
  retrieveByAccountId: (accountId: string) => Promise<IProfile | null>;
};

export type { IProfileRetrieveRepository };
