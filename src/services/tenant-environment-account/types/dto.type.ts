// @NOTE: I know the names in the file are becoming a little crazy.
import z from 'zod';
import { tenantEnvironmentAccountSchema } from './tenant-environment-account.type';

const createTenantEnvironmentAccountDtoSchema = z
  .strictObject(tenantEnvironmentAccountSchema.shape)
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  });

type ICreateTenantEnvironmentAccountDto = z.infer<
  typeof createTenantEnvironmentAccountDtoSchema
>;

const createTenantEnvironmentAccountNoInternalPropertiesDtoSchema = z
  .strictObject(tenantEnvironmentAccountSchema.shape)
  .omit({
    id: true,
    tenantEnvironmentId: true,
    emailVerified: true,
    phoneVerified: true,
    createdAt: true,
    updatedAt: true,
  });

type ICreateTenantEnvironmentAccountNoInternalPropertiesDto = z.infer<
  typeof createTenantEnvironmentAccountNoInternalPropertiesDtoSchema
>;

const getTenantEnvironmentAccountDtoSchema = z
  .strictObject(tenantEnvironmentAccountSchema.shape)
  .omit({
    createdAt: true,
    updatedAt: true,
    phoneVerified: true,
    emailVerified: true,
  });

type IGetTenantEnvironmentAccountDto = z.infer<
  typeof getTenantEnvironmentAccountDtoSchema
>;

const updateTenantEnvironmentAccountNonSensitivePropertiesDtoSchema = z
  .strictObject(tenantEnvironmentAccountSchema.shape)
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

type IUpdateTenantEnvironmentAccountNonSensitivePropertiesDto = z.infer<
  typeof updateTenantEnvironmentAccountNonSensitivePropertiesDtoSchema
>;

const tenantEnvironmentAccountCustomPropertiesOperationDtoSchema =
  tenantEnvironmentAccountSchema.shape.customProperties.refine(
    (val) => Object.keys(val).length
  );

type ITenantEnvironmentAccountCustomPropertiesOperationDtoSchema = z.infer<
  typeof tenantEnvironmentAccountCustomPropertiesOperationDtoSchema
>;

const updateTenantEnvironmentAccountEmailDtoSchema = z
  .strictObject(tenantEnvironmentAccountSchema.shape)
  .pick({ email: true })
  .required();
type IUpdateTenantEnvironmentAccountEmailDto = z.infer<
  typeof updateTenantEnvironmentAccountEmailDtoSchema
>;

const updateTenantEnvironmentAccountPhoneDtoSchema = z
  .strictObject(tenantEnvironmentAccountSchema.shape)
  .pick({ phone: true })
  .required();
type IUpdateTenantEnvironmentAccountPhoneDto = z.infer<
  typeof updateTenantEnvironmentAccountPhoneDtoSchema
>;

const updateTenantEnvironmentAccountUsernameDtoSchema = z
  .strictObject(tenantEnvironmentAccountSchema.shape)
  .pick({ username: true })
  .required();
type IUpdateTenantEnvironmentAccountUsernameDto = z.infer<
  typeof updateTenantEnvironmentAccountUsernameDtoSchema
>;

type IUpdateTenantEnvironmentAccountAllowedDtos =
  | IUpdateTenantEnvironmentAccountNonSensitivePropertiesDto
  | IUpdateTenantEnvironmentAccountEmailDto
  | IUpdateTenantEnvironmentAccountPhoneDto
  | IUpdateTenantEnvironmentAccountUsernameDto;

export type {
  ICreateTenantEnvironmentAccountDto,
  ICreateTenantEnvironmentAccountNoInternalPropertiesDto,
  IGetTenantEnvironmentAccountDto,
  ITenantEnvironmentAccountCustomPropertiesOperationDtoSchema,
  IUpdateTenantEnvironmentAccountAllowedDtos,
  IUpdateTenantEnvironmentAccountEmailDto,
  IUpdateTenantEnvironmentAccountNonSensitivePropertiesDto,
  IUpdateTenantEnvironmentAccountPhoneDto,
  IUpdateTenantEnvironmentAccountUsernameDto,
};

export {
  createTenantEnvironmentAccountDtoSchema,
  createTenantEnvironmentAccountNoInternalPropertiesDtoSchema,
  getTenantEnvironmentAccountDtoSchema,
  tenantEnvironmentAccountCustomPropertiesOperationDtoSchema,
  updateTenantEnvironmentAccountEmailDtoSchema,
  updateTenantEnvironmentAccountNonSensitivePropertiesDtoSchema,
  updateTenantEnvironmentAccountPhoneDtoSchema,
  updateTenantEnvironmentAccountUsernameDtoSchema,
};
