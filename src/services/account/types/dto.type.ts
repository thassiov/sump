import z from 'zod';
import { accountSchema } from './account.type';

const createAccountDtoSchema = accountSchema.pick({
  username: true,
  email: true,
});
type ICreateAccountDto = z.infer<typeof createAccountDtoSchema>;

const updateAccountDtoSchema = createAccountDtoSchema.partial();
type IUpdateAccountDto = z.infer<typeof updateAccountDtoSchema>;

type ICreateAccountOperationResult = {
  accountId: string;
};

export type {
  ICreateAccountDto,
  ICreateAccountOperationResult,
  IUpdateAccountDto,
};

export { createAccountDtoSchema, updateAccountDtoSchema };
