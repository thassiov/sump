import z from 'zod';
import { accountSchema } from './account.type';

const createAccountDtoSchema = accountSchema
  .pick({
    email: true,
    phone: true,
    name: true,
    username: true,
    avatarUrl: true,
    tenantId: true,
    roles: true,
  })
  .partial({
    avatarUrl: true, // this is actually optional
    phone: true, // this is actually optional
    tenantId: true, // this will be added by the service method, but is needed in the type
    roles: true, // this will be added by the service method, but is needed in the type
  });
type ICreateAccountDto = z.infer<typeof createAccountDtoSchema>;

const createAccountNoInternalPropertiesDtoSchema = z
  .strictObject(accountSchema.shape)
  .omit({
    id: true,
    phoneVerified: true,
    emailVerified: true,
    tenantId: true,
    createdAt: true,
    updatedAt: true,
  });

const getAccountDtoSchema = accountSchema.pick({
  id: true,
  email: true,
  phone: true,
  name: true,
  username: true,
  avatarUrl: true,
  tenantId: true,
  roles: true,
});
type IGetAccountDto = z.infer<typeof getAccountDtoSchema>;

const updateAccountNonSensitivePropertiesDtoSchema = z
  .strictObject(accountSchema.shape)
  .pick({
    avatarUrl: true,
    name: true,
  })
  .partial({
    name: true,
  })
  .refine((val) => Object.keys(val).length, {
    message: 'payload cannot be empty',
  });

type IUpdateAccountNonSensitivePropertiesDto = z.infer<
  typeof updateAccountNonSensitivePropertiesDtoSchema
>;

const updateAccountEmailDtoSchema = accountSchema
  .pick({ email: true })
  .required();
type IUpdateAccountEmailDto = z.infer<typeof updateAccountEmailDtoSchema>;

const updateAccountPhoneDtoSchema = accountSchema
  .pick({ phone: true })
  .required();
type IUpdateAccountPhoneDto = z.infer<typeof updateAccountPhoneDtoSchema>;

const updateAccountUsernameDtoSchema = accountSchema
  .pick({ username: true })
  .required();
type IUpdateAccountUsernameDto = z.infer<typeof updateAccountUsernameDtoSchema>;

type IUpdateAccountAllowedDtos =
  | IUpdateAccountNonSensitivePropertiesDto
  | IUpdateAccountEmailDto
  | IUpdateAccountPhoneDto
  | IUpdateAccountUsernameDto;

export type {
  ICreateAccountDto,
  IGetAccountDto,
  IUpdateAccountAllowedDtos,
  IUpdateAccountEmailDto,
  IUpdateAccountNonSensitivePropertiesDto,
  IUpdateAccountPhoneDto,
  IUpdateAccountUsernameDto,
};

export {
  createAccountDtoSchema,
  createAccountNoInternalPropertiesDtoSchema,
  getAccountDtoSchema,
  updateAccountEmailDtoSchema,
  updateAccountNonSensitivePropertiesDtoSchema,
  updateAccountPhoneDtoSchema,
  updateAccountUsernameDtoSchema,
};
