import z from 'zod';
import {
  IEnvironment,
  environmentSchema,
} from './environment.type';

const createEnvironmentDtoSchema = environmentSchema.pick({
  name: true,
  tenantId: true,
  customProperties: true,
});

type ICreateEnvironmentDto = z.infer<
  typeof createEnvironmentDtoSchema
>;

const createTenantEnvironmentNoInternalPropertiesDtoSchema = z
  .strictObject(environmentSchema.shape)
  .pick({
    name: true,
    customProperties: true,
  });

type ICreateTenantEnvironmentNoInternalPropertiesDto = z.infer<
  typeof createTenantEnvironmentNoInternalPropertiesDtoSchema
>;

const getEnvironmentDtoSchema = environmentSchema.pick({
  id: true,
  name: true,
  tenantId: true,
  customProperties: true,
});

type IGetEnvironmentDto = z.infer<typeof getEnvironmentDtoSchema>;

const updateEnvironmentNonSensitivePropertiesDtoSchema = z
  .strictObject(environmentSchema.shape)
  .pick({
    name: true,
  })
  .partial({
    name: true,
  })
  .refine((val) => Object.keys(val).length, {
    message: 'payload cannot be empty',
  });

type IUpdateEnvironmentNonSensitivePropertiesDto = z.infer<
  typeof updateEnvironmentNonSensitivePropertiesDtoSchema
>;

const tenantEnvironmentCustomPropertiesOperationDtoSchema =
  environmentSchema.shape.customProperties.refine(
    (val) => Object.keys(val).length
  );

type IEnvironmentCustomPropertiesOperationDtoSchema = z.infer<
  typeof tenantEnvironmentCustomPropertiesOperationDtoSchema
>;

type IUpdateEnvironmentAllowedDtos =
  IUpdateEnvironmentNonSensitivePropertiesDto;

type CreateNewEnvironmentUseCaseDtoResult = IEnvironment['id'];
type DeleteTenantEnvironmentUseCaseDtoResult = boolean;
type UpdateTenantEnvironmentNonSensitivePropertiesUseCaseDtoResult = boolean;
type SetTenantEnvironmentCustomPropertiesUseCaseDtoResult = boolean;
type DeleteTenantEnvironmentCustomPropertiesUseCaseDtoResult = boolean;

export type {
  CreateNewEnvironmentUseCaseDtoResult,
  DeleteTenantEnvironmentCustomPropertiesUseCaseDtoResult,
  DeleteTenantEnvironmentUseCaseDtoResult,
  ICreateEnvironmentDto,
  ICreateTenantEnvironmentNoInternalPropertiesDto,
  IGetEnvironmentDto,
  IEnvironmentCustomPropertiesOperationDtoSchema,
  IUpdateEnvironmentAllowedDtos,
  IUpdateEnvironmentNonSensitivePropertiesDto,
  SetTenantEnvironmentCustomPropertiesUseCaseDtoResult,
  UpdateTenantEnvironmentNonSensitivePropertiesUseCaseDtoResult,
};

export {
  createEnvironmentDtoSchema,
  createTenantEnvironmentNoInternalPropertiesDtoSchema,
  getEnvironmentDtoSchema,
  tenantEnvironmentCustomPropertiesOperationDtoSchema,
  updateEnvironmentNonSensitivePropertiesDtoSchema,
};
