import z from 'zod';
import { tenantAccountSchema, ITenantAccount } from './tenant-account.type';

// @TODO: this schema might need to be reviewed at some point. it seems wrong
const createTenantAccountDtoSchema = tenantAccountSchema
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
type ICreateTenantAccountDto = z.infer<typeof createTenantAccountDtoSchema>;

// Extended DTO for auth signup - includes passwordHash (internal use only)
type ICreateTenantAccountWithPasswordDto = ICreateTenantAccountDto & {
  passwordHash: string;
};

// @FIXME: this is dumb. fix it with `pick` instead
const createTenantAccountNoInternalPropertiesDtoSchema = z
  .strictObject(tenantAccountSchema.shape)
  .omit({
    id: true,
    phoneVerified: true,
    emailVerified: true,
    tenantId: true,
    disabled: true,
    disabledAt: true,
    createdAt: true,
    updatedAt: true,
  });

const tenantAccountUserDefinedIdentificationSchema = z
  .strictObject(tenantAccountSchema.shape)
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

type ITenantAccountUserDefinedIdentification = z.infer<
  typeof tenantAccountUserDefinedIdentificationSchema
>;

const getTenantAccountDtoSchema = tenantAccountSchema.pick({
  id: true,
  email: true,
  phone: true,
  name: true,
  username: true,
  avatarUrl: true,
  tenantId: true,
  roles: true,
  disabled: true,
  disabledAt: true,
});
type IGetTenantAccountDto = z.infer<typeof getTenantAccountDtoSchema>;

const tenantAccountOptionalQueryFiltersSchema = getTenantAccountDtoSchema
  .omit({
    id: true,
    roles: true,
  })
  .partial()
  .refine((val) => Object.keys(val).length, {
    message: 'payload cannot be empty',
  });

type ITenantAccountOptionalQueryFilters = z.infer<
  typeof tenantAccountOptionalQueryFiltersSchema
>;

const updateTenantAccountNonSensitivePropertiesDtoSchema = z
  .strictObject(tenantAccountSchema.shape)
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

type IUpdateTenantAccountNonSensitivePropertiesDto = z.infer<
  typeof updateTenantAccountNonSensitivePropertiesDtoSchema
>;

const updateTenantAccountEmailDtoSchema = tenantAccountSchema
  .pick({ email: true })
  .required();
type IUpdateTenantAccountEmailDto = z.infer<typeof updateTenantAccountEmailDtoSchema>;

const updateTenantAccountPhoneDtoSchema = tenantAccountSchema
  .pick({ phone: true })
  .required();
type IUpdateTenantAccountPhoneDto = z.infer<typeof updateTenantAccountPhoneDtoSchema>;

const updateTenantAccountUsernameDtoSchema = tenantAccountSchema
  .pick({ username: true })
  .required();
type IUpdateTenantAccountUsernameDto = z.infer<typeof updateTenantAccountUsernameDtoSchema>;

type IUpdateTenantAccountDisabledDto = {
  disabled: boolean;
  disabledAt: Date | null;
};

// Password hash update (for password reset)
type IUpdateTenantAccountPasswordHashDto = { passwordHash: string };

type IUpdateTenantAccountAllowedDtos =
  | IUpdateTenantAccountNonSensitivePropertiesDto
  | IUpdateTenantAccountEmailDto
  | IUpdateTenantAccountPhoneDto
  | IUpdateTenantAccountUsernameDto
  | IUpdateTenantAccountDisabledDto
  | IUpdateTenantAccountPasswordHashDto;

type CreateNewTenantAccountUseCaseDtoResult = ITenantAccount['id'];
type DeleteTenantAccountByIdAndTenantIdUseCaseResultDto = boolean;
type UpdateTenantAccountNonSensitivePropertiesByIdAndTenantIdUseCaseResultDto =
  boolean;
type UpdateTenantAccountEmailByIdAndTenantIdUseCaseResultDto = boolean;
type UpdateTenantAccountPhoneByIdAndTenantIdUseCaseResultDto = boolean;
type UpdateTenantAccountUsernameByIdAndTenantIdUseCaseResultDto = boolean;

export type {
  CreateNewTenantAccountUseCaseDtoResult,
  DeleteTenantAccountByIdAndTenantIdUseCaseResultDto,
  ITenantAccountOptionalQueryFilters,
  ITenantAccountUserDefinedIdentification,
  ICreateTenantAccountDto,
  ICreateTenantAccountWithPasswordDto,
  IGetTenantAccountDto,
  IUpdateTenantAccountAllowedDtos,
  IUpdateTenantAccountEmailDto,
  IUpdateTenantAccountNonSensitivePropertiesDto,
  IUpdateTenantAccountPhoneDto,
  IUpdateTenantAccountUsernameDto,
  UpdateTenantAccountEmailByIdAndTenantIdUseCaseResultDto,
  UpdateTenantAccountNonSensitivePropertiesByIdAndTenantIdUseCaseResultDto,
  UpdateTenantAccountPhoneByIdAndTenantIdUseCaseResultDto,
  UpdateTenantAccountUsernameByIdAndTenantIdUseCaseResultDto,
};

export {
  tenantAccountOptionalQueryFiltersSchema,
  tenantAccountUserDefinedIdentificationSchema,
  createTenantAccountDtoSchema,
  createTenantAccountNoInternalPropertiesDtoSchema,
  getTenantAccountDtoSchema,
  updateTenantAccountEmailDtoSchema,
  updateTenantAccountNonSensitivePropertiesDtoSchema,
  updateTenantAccountPhoneDtoSchema,
  updateTenantAccountUsernameDtoSchema,
};
