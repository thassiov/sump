import z from 'zod';
import { tenantEnvironmentSchema } from './tenant-environment.type';

const createTenantEnvironmentDtoSchema = tenantEnvironmentSchema.pick({
  name: true,
  tenantId: true,
  customProperties: true,
});

type ICreateTenantEnvironmentDto = z.infer<
  typeof createTenantEnvironmentDtoSchema
>;

const createTenantEnvironmentNoInternalPropertiesDtoSchema = z
  .strictObject(tenantEnvironmentSchema.shape)
  .pick({
    name: true,
    customProperties: true,
  });

type ICreateTenantEnvironmentNoInternalPropertiesDto = z.infer<
  typeof createTenantEnvironmentNoInternalPropertiesDtoSchema
>;

const getTenantEnvironmentDtoSchema = tenantEnvironmentSchema.pick({
  id: true,
  name: true,
  tenantId: true,
  customProperties: true,
});

type IGetTenantEnvironmentDto = z.infer<typeof getTenantEnvironmentDtoSchema>;

const updateTenantEnvironmentNonSensitivePropertiesDtoSchema = z
  .strictObject(tenantEnvironmentSchema.shape)
  .pick({
    name: true,
  })
  .partial({
    name: true,
  })
  .refine((val) => Object.keys(val).length, {
    message: 'payload cannot be empty',
  });

type IUpdateTenantEnvironmentNonSensitivePropertiesDto = z.infer<
  typeof updateTenantEnvironmentNonSensitivePropertiesDtoSchema
>;

const tenantEnvironmentCustomPropertiesOperationDtoSchema =
  tenantEnvironmentSchema.shape.customProperties.refine(
    (val) => Object.keys(val).length
  );

type ITenantEnvironmentCustomPropertiesOperationDtoSchema = z.infer<
  typeof tenantEnvironmentCustomPropertiesOperationDtoSchema
>;

type IUpdateTenantEnvironmentAllowedDtos =
  IUpdateTenantEnvironmentNonSensitivePropertiesDto;

export type {
  ICreateTenantEnvironmentDto,
  ICreateTenantEnvironmentNoInternalPropertiesDto,
  IGetTenantEnvironmentDto,
  ITenantEnvironmentCustomPropertiesOperationDtoSchema,
  IUpdateTenantEnvironmentAllowedDtos,
  IUpdateTenantEnvironmentNonSensitivePropertiesDto,
};

export {
  createTenantEnvironmentDtoSchema,
  createTenantEnvironmentNoInternalPropertiesDtoSchema,
  getTenantEnvironmentDtoSchema,
  tenantEnvironmentCustomPropertiesOperationDtoSchema,
  updateTenantEnvironmentNonSensitivePropertiesDtoSchema,
};
