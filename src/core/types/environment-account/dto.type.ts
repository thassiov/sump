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

const createEnvironmentAccountNoInternalPropertiesDtoSchema = z
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
  })
  .partial({
    customProperties: true,
  });

type ICreateEnvironmentAccountNoInternalPropertiesDto = z.infer<
  typeof createEnvironmentAccountNoInternalPropertiesDtoSchema
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

const environmentAccountCustomPropertiesOperationDtoSchema =
  environmentAccountSchema.shape.customProperties.refine(
    (val) => Object.keys(val).length
  );

type IEnvironmentAccountCustomPropertiesOperationDtoSchema = z.infer<
  typeof environmentAccountCustomPropertiesOperationDtoSchema
>;

const updateEnvironmentAccountEmailDtoSchema = z
  .strictObject(environmentAccountSchema.shape)
  .pick({ email: true })
  .required();
type IUpdateEnvironmentAccountEmailDto = z.infer<
  typeof updateEnvironmentAccountEmailDtoSchema
>;

const updateEnvironmentAccountPhoneDtoSchema = z
  .strictObject(environmentAccountSchema.shape)
  .pick({ phone: true })
  .required();
type IUpdateEnvironmentAccountPhoneDto = z.infer<
  typeof updateEnvironmentAccountPhoneDtoSchema
>;

const updateEnvironmentAccountUsernameDtoSchema = z
  .strictObject(environmentAccountSchema.shape)
  .pick({ username: true })
  .required();
type IUpdateEnvironmentAccountUsernameDto = z.infer<
  typeof updateEnvironmentAccountUsernameDtoSchema
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
  | IUpdateEnvironmentAccountEmailDto
  | IUpdateEnvironmentAccountPhoneDto
  | IUpdateEnvironmentAccountUsernameDto
  | IUpdateEnvironmentAccountDisabledDto
  | IUpdateEnvironmentAccountPasswordHashDto;

type CreateNewEnvironmentAccountUseCaseDtoResult =
  IEnvironmentAccount['id'];

export type {
  CreateNewEnvironmentAccountUseCaseDtoResult,
  ICreateEnvironmentAccountDto,
  ICreateEnvironmentAccountNoInternalPropertiesDto,
  IGetEnvironmentAccountDto,
  IEnvironmentAccountCustomPropertiesOperationDtoSchema,
  IUpdateEnvironmentAccountAllowedDtos,
  IUpdateEnvironmentAccountEmailDto,
  IUpdateEnvironmentAccountNonSensitivePropertiesDto,
  IUpdateEnvironmentAccountPhoneDto,
  IUpdateEnvironmentAccountUsernameDto,
};

export {
  createEnvironmentAccountDtoSchema,
  createEnvironmentAccountNoInternalPropertiesDtoSchema,
  getEnvironmentAccountDtoSchema,
  environmentAccountCustomPropertiesOperationDtoSchema,
  updateEnvironmentAccountEmailDtoSchema,
  updateEnvironmentAccountNonSensitivePropertiesDtoSchema,
  updateEnvironmentAccountPhoneDtoSchema,
  updateEnvironmentAccountUsernameDtoSchema,
};
