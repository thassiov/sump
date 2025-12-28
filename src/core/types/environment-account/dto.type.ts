// @NOTE: I know the names in the file are becoming a little crazy.
import z from 'zod';
import {
  IEnvironmentAccount,
  environmentAccountSchema,
} from './environment-account.type';

const createEnvironmentAccountDtoSchema = z
  .strictObject(environmentAccountSchema.shape)
  .omit({
    id: true,
    disabled: true,
    disabledAt: true,
    createdAt: true,
    updatedAt: true,
  });

type ICreateEnvironmentAccountDto = z.infer<
  typeof createEnvironmentAccountDtoSchema
>;

const createTenantEnvironmentAccountNoInternalPropertiesDtoSchema = z
  .strictObject(environmentAccountSchema.shape)
  .omit({
    id: true,
    environmentId: true,
    emailVerified: true,
    phoneVerified: true,
    disabled: true,
    disabledAt: true,
    createdAt: true,
    updatedAt: true,
  });

type ICreateTenantEnvironmentAccountNoInternalPropertiesDto = z.infer<
  typeof createTenantEnvironmentAccountNoInternalPropertiesDtoSchema
>;

const getEnvironmentAccountDtoSchema = z
  .strictObject(environmentAccountSchema.shape)
  .omit({
    createdAt: true,
    updatedAt: true,
    phoneVerified: true,
    emailVerified: true,
  });

type IGetEnvironmentAccountDto = z.infer<
  typeof getEnvironmentAccountDtoSchema
>;

const updateEnvironmentAccountNonSensitivePropertiesDtoSchema = z
  .strictObject(environmentAccountSchema.shape)
  .pick({
    avatarUrl: true,
    name: true,
  })
  .partial({
    avatarUrl: true,
    name: true,
  })
  .refine((val) => Object.keys(val).length, {
    message: 'payload cannot be empty',
  });

type IUpdateEnvironmentAccountNonSensitivePropertiesDto = z.infer<
  typeof updateEnvironmentAccountNonSensitivePropertiesDtoSchema
>;

const tenantEnvironmentAccountCustomPropertiesOperationDtoSchema =
  environmentAccountSchema.shape.customProperties.refine(
    (val) => Object.keys(val).length
  );

type IEnvironmentAccountCustomPropertiesOperationDtoSchema = z.infer<
  typeof tenantEnvironmentAccountCustomPropertiesOperationDtoSchema
>;

const updateTenantEnvironmentAccountEmailDtoSchema = z
  .strictObject(environmentAccountSchema.shape)
  .pick({ email: true })
  .required();
type IUpdateTenantEnvironmentAccountEmailDto = z.infer<
  typeof updateTenantEnvironmentAccountEmailDtoSchema
>;

const updateTenantEnvironmentAccountPhoneDtoSchema = z
  .strictObject(environmentAccountSchema.shape)
  .pick({ phone: true })
  .required();
type IUpdateTenantEnvironmentAccountPhoneDto = z.infer<
  typeof updateTenantEnvironmentAccountPhoneDtoSchema
>;

const updateTenantEnvironmentAccountUsernameDtoSchema = z
  .strictObject(environmentAccountSchema.shape)
  .pick({ username: true })
  .required();
type IUpdateTenantEnvironmentAccountUsernameDto = z.infer<
  typeof updateTenantEnvironmentAccountUsernameDtoSchema
>;

const updateEnvironmentAccountDisabledDtoSchema = z
  .strictObject(environmentAccountSchema.shape)
  .pick({ disabled: true, disabledAt: true });
type IUpdateEnvironmentAccountDisabledDto = z.infer<
  typeof updateEnvironmentAccountDisabledDtoSchema
>;

// Password hash update (for password reset)
type IUpdateEnvironmentAccountPasswordHashDto = { passwordHash: string };

type IUpdateEnvironmentAccountAllowedDtos =
  | IUpdateEnvironmentAccountNonSensitivePropertiesDto
  | IUpdateTenantEnvironmentAccountEmailDto
  | IUpdateTenantEnvironmentAccountPhoneDto
  | IUpdateTenantEnvironmentAccountUsernameDto
  | IUpdateEnvironmentAccountDisabledDto
  | IUpdateEnvironmentAccountPasswordHashDto;

type CreateNewEnvironmentAccountUseCaseDtoResult =
  IEnvironmentAccount['id'];

export type {
  CreateNewEnvironmentAccountUseCaseDtoResult,
  ICreateEnvironmentAccountDto,
  ICreateTenantEnvironmentAccountNoInternalPropertiesDto,
  IGetEnvironmentAccountDto,
  IEnvironmentAccountCustomPropertiesOperationDtoSchema,
  IUpdateEnvironmentAccountAllowedDtos,
  IUpdateTenantEnvironmentAccountEmailDto,
  IUpdateEnvironmentAccountNonSensitivePropertiesDto,
  IUpdateTenantEnvironmentAccountPhoneDto,
  IUpdateTenantEnvironmentAccountUsernameDto,
};

export {
  createEnvironmentAccountDtoSchema,
  createTenantEnvironmentAccountNoInternalPropertiesDtoSchema,
  getEnvironmentAccountDtoSchema,
  tenantEnvironmentAccountCustomPropertiesOperationDtoSchema,
  updateTenantEnvironmentAccountEmailDtoSchema,
  updateEnvironmentAccountNonSensitivePropertiesDtoSchema,
  updateTenantEnvironmentAccountPhoneDtoSchema,
  updateTenantEnvironmentAccountUsernameDtoSchema,
};
