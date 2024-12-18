import { ICreateAccountAndProfileResult } from '../../../services/create-account-and-profile/types';

export type ICreateAccountDto = {
  handle: string;
};

export type ICreateProfileDto = {
  fullName: string;
};

export type ICreateAccountAndProfileRepository = {
  create: (
    accountInfo: ICreateAccountDto,
    profileInfo: ICreateProfileDto
  ) => Promise<ICreateAccountAndProfileResult>;
};
