import z from 'zod';
import { tenantSchema } from './tenant.type';

const createTenantDtoSchema = tenantSchema.pick({
  name: true,
  customProperties: true,
});

type ICreateTenantDto = z.infer<typeof createTenantDtoSchema>;

const updateTenantNonSensitivePropertiesDtoSchema = z
  .strictObject(tenantSchema.shape)
  .pick({
    name: true,
  })
  .partial({
    name: true,
  })
  .refine((val) => Object.keys(val).length, {
    message: 'payload cannot be empty',
  });

type IUpdateTenantNonSensitivePropertiesDto = z.infer<
  typeof updateTenantNonSensitivePropertiesDtoSchema
>;

const tenantCustomPropertiesOperationDtoSchema =
  tenantSchema.shape.customProperties.refine((val) => Object.keys(val).length);

type ITenantCustomPropertiesOperationDtoSchema = z.infer<
  typeof tenantCustomPropertiesOperationDtoSchema
>;

const updateTenantDtoSchema = createTenantDtoSchema
  .partial()
  .refine((val) => Object.keys(val).length, {
    message: 'payload cannot be empty',
  });
type IUpdateTenantDto = z.infer<typeof updateTenantDtoSchema>;

const getTenantDtoSchema = tenantSchema.pick({
  id: true,
  name: true,
  customProperties: true,
});
type IGetTenantDto = z.infer<typeof getTenantDtoSchema>;

type IUpdateTenantAllowedDtos = IUpdateTenantNonSensitivePropertiesDto;

export type {
  ICreateTenantDto,
  IGetTenantDto,
  ITenantCustomPropertiesOperationDtoSchema,
  IUpdateTenantAllowedDtos,
  IUpdateTenantDto,
  IUpdateTenantNonSensitivePropertiesDto,
};

export {
  createTenantDtoSchema,
  getTenantDtoSchema,
  tenantCustomPropertiesOperationDtoSchema,
  updateTenantDtoSchema,
  updateTenantNonSensitivePropertiesDtoSchema,
};
