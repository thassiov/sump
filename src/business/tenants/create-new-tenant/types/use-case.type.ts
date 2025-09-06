import { IAccountService } from '../../../../services/account/types/service.type';
import { ITenantEnvironmentService } from '../../../../services/tenant-environment/types/service.type';
import { ITenantService } from '../../../../services/tenant/types/service.type';
import {
  CreateNewTenantUseCaseDto,
  CreateNewTenantUseCaseResultDto,
} from './dto.type';

type CreateNewTenantServices = {
  account: IAccountService;
  tenant: ITenantService;
  tenantEnvironment: ITenantEnvironmentService;
};

type CreateNewTenantUseCase = (
  services: CreateNewTenantServices,
  createNewTenantDto: CreateNewTenantUseCaseDto
) => Promise<CreateNewTenantUseCaseResultDto>;

export type { CreateNewTenantServices, CreateNewTenantUseCase };
