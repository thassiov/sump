import { IAccountProfileCreateResult } from 'src/services/account-profile-create/types';

export type IAccountCreateDto = {
  handle: string;
};

export type IProfileCreateDto = {
  fullName: string;
};

export type IAccountProfileCreateRepository = {
  create: (
    accountInfo: IAccountCreateDto,
    profileInfo: IProfileCreateDto
  ) => Promise<IAccountProfileCreateResult>;
};
