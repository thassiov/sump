import z from 'zod';
import {
  createAccountNoInternalPropertiesDtoSchema,
  IGetAccountDto,
} from '../account/dto.type';
import { createTenantEnvironmentNoInternalPropertiesDtoSchema } from '../tenant-environment/dto.type';
import { tenantEnvironmentSchema } from '../tenant-environment/tenant-environment.type';
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

const getTenantDtoSchema = tenantSchema.pick({
  id: true,
  name: true,
  customProperties: true,
});
type IGetTenantDto = z.infer<typeof getTenantDtoSchema>;

type IUpdateTenantAllowedDtos = IUpdateTenantNonSensitivePropertiesDto;

const createNewTenantUseCaseDtoSchema = z.object({
  tenant: z.strictObject(createTenantDtoSchema.shape),
  account: z.strictObject(createAccountNoInternalPropertiesDtoSchema.shape),
  environment: z
    .strictObject(createTenantEnvironmentNoInternalPropertiesDtoSchema.shape)
    .optional(),
});

type CreateNewTenantUseCaseDto = z.infer<
  typeof createNewTenantUseCaseDtoSchema
>;

type CreateNewTenantUseCaseResultDto = {
  tenantId: string;
  accountId: string;
  tenantEnvironmentId: string;
};

type DeleteTenantByIdUseCaseResultDto = boolean;
type DeleteCustomPropertyByTenantIdUseCaseResultDto = boolean;
type SetCustomPropertyByTenantIdUseCaseResultDto = boolean;
type UpdateNonSensitivePropertiesByTenantIdUseCaseResultDto = boolean;

const tenantEnvironmentListSchema = z.array(
  z.strictObject(tenantEnvironmentSchema.shape).pick({
    id: true,
    name: true,
    tenantId: true,
    customProperties: true,
  })
);

const getTenantByIdUseCaseResultDtoSchema = z
  .strictObject(tenantSchema.shape)
  .pick({
    id: true,
    name: true,
    customProperties: true,
  })
  .extend({
    environments: tenantEnvironmentListSchema,
  });

type GetTenantByIdUseCaseResultDto = z.infer<
  typeof getTenantByIdUseCaseResultDtoSchema
>;

type GetAccountsByTenantIdSUseCaseResultDto = IGetAccountDto[] | undefined;

export type {
  CreateNewTenantUseCaseDto,
  CreateNewTenantUseCaseResultDto,
  DeleteCustomPropertyByTenantIdUseCaseResultDto,
  DeleteTenantByIdUseCaseResultDto,
  GetAccountsByTenantIdSUseCaseResultDto,
  GetTenantByIdUseCaseResultDto,
  ICreateTenantDto,
  IGetTenantDto,
  ITenantCustomPropertiesOperationDtoSchema,
  IUpdateTenantAllowedDtos,
  IUpdateTenantNonSensitivePropertiesDto,
  SetCustomPropertyByTenantIdUseCaseResultDto,
  UpdateNonSensitivePropertiesByTenantIdUseCaseResultDto,
};

export {
  createNewTenantUseCaseDtoSchema,
  createTenantDtoSchema,
  getTenantByIdUseCaseResultDtoSchema,
  getTenantDtoSchema,
  tenantCustomPropertiesOperationDtoSchema,
  updateTenantNonSensitivePropertiesDtoSchema,
};
