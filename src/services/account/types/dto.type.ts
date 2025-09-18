import z from 'zod';
import { accountSchema } from './account.type';

// @TODO: this schema might need to be reviewed at some point. it seems wrong
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

// @FIXME: this is dumb. fix it with `pick` instead
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

const accountUserDefinedIdentificationSchema = z
  .strictObject(accountSchema.shape)
  .pick({
    email: true,
    phone: true,
    username: true,
  })
  .partial({
    email: true,
    username: true,
  })
  .refine(
    (val) => {
      const values = Object.values(val);

      // @NOTE: I don't like the way I coded this, but it works well.
      //  it checks for falsy values in the object, like properties with 'undefined' as their value
      return !values.some((value) => !value);
    },
    {
      message: 'values cannot be undefined',
    }
  )
  .refine((val) => Object.keys(val).length, {
    message: 'payload cannot be empty',
  });

type IAccountUserDefinedIdentification = z.infer<
  typeof accountUserDefinedIdentificationSchema
>;

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

const accountOptionalQueryFiltersSchema = getAccountDtoSchema
  .omit({
    id: true,
    roles: true,
  })
  .partial()
  .refine((val) => Object.keys(val).length, {
    message: 'payload cannot be empty',
  });

type IAccountOptionalQueryFilters = z.infer<
  typeof accountOptionalQueryFiltersSchema
>;

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
  IAccountOptionalQueryFilters,
  IAccountUserDefinedIdentification,
  ICreateAccountDto,
  IGetAccountDto,
  IUpdateAccountAllowedDtos,
  IUpdateAccountEmailDto,
  IUpdateAccountNonSensitivePropertiesDto,
  IUpdateAccountPhoneDto,
  IUpdateAccountUsernameDto,
};

export {
  accountOptionalQueryFiltersSchema,
  accountUserDefinedIdentificationSchema,
  createAccountDtoSchema,
  createAccountNoInternalPropertiesDtoSchema,
  getAccountDtoSchema,
  updateAccountEmailDtoSchema,
  updateAccountNonSensitivePropertiesDtoSchema,
  updateAccountPhoneDtoSchema,
  updateAccountUsernameDtoSchema,
};
