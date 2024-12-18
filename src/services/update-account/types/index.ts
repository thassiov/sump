import { isMobilePhone } from 'validator';
import z from 'zod';

const updateAccountUnprotectedFieldsDtoSchema = z.object({
  // @NOTE i don't have a rule for what can be considered a handle right now. any 3 char string goes.
  handle: z.string().min(3).optional(),
  phone: z.string().refine(isMobilePhone).optional(),
  email: z.string().email().optional(),
});

const updateAccountProtectedFieldsDtoSchema = z.object({
  password: z.string().min(10).optional(),
  // @NOTE this should be somewhere else for reuse
  role: z.enum(['root', 'admin', 'moderator', 'common', 'guest']).optional(),
});

type IUpdateAccountUnprotectedFieldsDto = z.infer<
  typeof updateAccountUnprotectedFieldsDtoSchema
>;

type IUpdateAccountProtectedFieldsDto = z.infer<
  typeof updateAccountProtectedFieldsDtoSchema
>;

type IUpdateAccountService = {
  updateUnprotectedFields: (
    accountId: string,
    accountDto: IUpdateAccountUnprotectedFieldsDto
  ) => Promise<boolean>;
  updateProtectedFields: (
    accountId: string,
    accountDto: IUpdateAccountProtectedFieldsDto
  ) => Promise<boolean>;
};

export {
  updateAccountProtectedFieldsDtoSchema,
  updateAccountUnprotectedFieldsDtoSchema,
};
export type {
  IUpdateAccountProtectedFieldsDto,
  IUpdateAccountService,
  IUpdateAccountUnprotectedFieldsDto,
};
