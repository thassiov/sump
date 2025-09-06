import z from 'zod';
import { createAccountNoInternalPropertiesDtoSchema } from '../../../../services/account/types/dto.type';
import { createTenantEnvironmentNoInternalPropertiesDtoSchema } from '../../../../services/tenant-environment/types/dto.type';
import { createTenantDtoSchema } from '../../../../services/tenant/types/dto.type';

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

export type { CreateNewTenantUseCaseDto, CreateNewTenantUseCaseResultDto };

export { createNewTenantUseCaseDtoSchema };
