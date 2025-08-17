import {
  ICreateAccountAndProfileDto,
  ICreateAccountAndProfileOperationResult,
} from '../../../types/dto.type';

type ICreateAccountAndProfileService = {
  createNewAccountAndProfile: (
    payload: ICreateAccountAndProfileDto
  ) => Promise<ICreateAccountAndProfileOperationResult>;
};

export type { ICreateAccountAndProfileService };
