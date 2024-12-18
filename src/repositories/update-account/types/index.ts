import {
  IUpdateAccountProtectedFieldsDto,
  IUpdateAccountUnprotectedFieldsDto,
} from '../../../services/update-account/types';

type IUpdateAccountRepository = {
  updateUnprotectedFields: (
    accountId: string,
    accountDto: IUpdateAccountUnprotectedFieldsDto
  ) => Promise<boolean>;

  updateProtectedFields: (
    accountId: string,
    accountDto: IUpdateAccountProtectedFieldsDto
  ) => Promise<boolean>;
};

export type { IUpdateAccountRepository };
