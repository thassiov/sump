import {
  ICreateAccountAndProfileOperationResult,
  ICreateAccountDto,
  ICreateProfileDto,
} from '../../../types/dto.type';

export type ICreateAccountAndProfileRepository = {
  createNewAccountAndProfile: (
    accountInfo: ICreateAccountDto,
    profileInfo: ICreateProfileDto
  ) => Promise<ICreateAccountAndProfileOperationResult>;
};
