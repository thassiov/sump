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

const createEnvironmentNoInternalPropertiesDtoSchema = z
  .strictObject(environmentSchema.shape)
  .pick({
    name: true,
    customProperties: true,
  })
  .partial({
    customProperties: true,
  });

type ICreateEnvironmentNoInternalPropertiesDto = z.infer<
  typeof createEnvironmentNoInternalPropertiesDtoSchema
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

const environmentCustomPropertiesOperationDtoSchema =
  environmentSchema.shape.customProperties.refine(
    (val) => Object.keys(val).length
  );

type IEnvironmentCustomPropertiesOperationDtoSchema = z.infer<
  typeof environmentCustomPropertiesOperationDtoSchema
>;

type IUpdateEnvironmentAllowedDtos =
  IUpdateEnvironmentNonSensitivePropertiesDto;

type CreateNewEnvironmentUseCaseDtoResult = IEnvironment['id'];
type DeleteEnvironmentUseCaseDtoResult = boolean;
type UpdateEnvironmentNonSensitivePropertiesUseCaseDtoResult = boolean;
type SetEnvironmentCustomPropertiesUseCaseDtoResult = boolean;
type DeleteEnvironmentCustomPropertiesUseCaseDtoResult = boolean;

export type {
  CreateNewEnvironmentUseCaseDtoResult,
  DeleteEnvironmentCustomPropertiesUseCaseDtoResult,
  DeleteEnvironmentUseCaseDtoResult,
  ICreateEnvironmentDto,
  ICreateEnvironmentNoInternalPropertiesDto,
  IGetEnvironmentDto,
  IEnvironmentCustomPropertiesOperationDtoSchema,
  IUpdateEnvironmentAllowedDtos,
  IUpdateEnvironmentNonSensitivePropertiesDto,
  SetEnvironmentCustomPropertiesUseCaseDtoResult,
  UpdateEnvironmentNonSensitivePropertiesUseCaseDtoResult,
};

export {
  createEnvironmentDtoSchema,
  createEnvironmentNoInternalPropertiesDtoSchema,
  getEnvironmentDtoSchema,
  environmentCustomPropertiesOperationDtoSchema,
  updateEnvironmentNonSensitivePropertiesDtoSchema,
};
