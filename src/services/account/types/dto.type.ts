import z from 'zod';
import { accountSchema } from './account.type';

const idSchema = z.string().uuid();

const createAccountDtoSchema = accountSchema.pick({
  email: true,
  fullName: true,
});
type ICreateAccountDto = z.infer<typeof createAccountDtoSchema>;

const updateAccountDtoSchema = createAccountDtoSchema.partial();
type IUpdateAccountDto = z.infer<typeof updateAccountDtoSchema>;

type ICreateAccountOperationResult = {
  id: string;
};

export type {
  ICreateAccountDto,
  ICreateAccountOperationResult,
  IUpdateAccountDto,
};

export { createAccountDtoSchema, idSchema, updateAccountDtoSchema };
