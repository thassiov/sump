export type IAccountService = {
  create: () => Promise<string>;
  retrieve: (accountId: string) => Promise<IAccount | undefined>;
  remove: (accountId: string) => Promise<boolean>;
};

export type IAccount = {
  id: string;
  createdAt: string;
};
