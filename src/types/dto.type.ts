import z from 'zod';
import { accountSchema } from './account.type';
import { profileSchema } from './profile.type';

const createAccountDtoSchema = accountSchema.pick({
  username: true,
  email: true,
});

type ICreateAccountDto = z.infer<typeof createAccountDtoSchema>;

const createProfileDtoSchema = profileSchema.pick({ fullName: true });
type ICreateProfileDto = z.infer<typeof createProfileDtoSchema>;

const createAccountAndProfileDtoSchema = createAccountDtoSchema.merge(
  createProfileDtoSchema
);

type ICreateAccountAndProfileDto = z.infer<
  typeof createAccountAndProfileDtoSchema
>;

type ICreateAccountAndProfileOperationResult = {
  accountId: string;
};

export type {
  ICreateAccountAndProfileDto,
  ICreateAccountAndProfileOperationResult,
  ICreateAccountDto,
  ICreateProfileDto,
};

export {
  createAccountAndProfileDtoSchema,
  createAccountDtoSchema,
  createProfileDtoSchema,
};
