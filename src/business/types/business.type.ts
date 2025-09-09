import { IAccountService } from '../../services/account/types/service.type';
import { ITenantEnvironmentAccountService } from '../../services/tenant-environment-account/types/service.type';
import { ITenantEnvironmentService } from '../../services/tenant-environment/types/service.type';
import { ITenantService } from '../../services/tenant/types/service.type';
import { tenants } from '../tenants';

// @FIXME: these types make me feel icky

type ServiceRecord = {
  account: IAccountService;
  tenant: ITenantService;
  tenantEnvironment: ITenantEnvironmentService;
  tenantEnvironmentAccount: ITenantEnvironmentAccountService;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type UseCaseCaller<F> = F extends (dep: any, ...rest: infer R) => infer Ret
  ? (...rest: R) => Ret
  : never;

type UseCaseRecordDefinition<T> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [K in keyof T]: T[K] extends (...args: any[]) => any
    ? UseCaseCaller<T[K]>
    : never;
};

type UseCaseRecord = {
  tenants: UseCaseRecordDefinition<typeof tenants.useCases>;
  accounts: Record<string, unknown>;
  tenantEnvironments: Record<string, unknown>;
  tenantEnvironmentAccounts: Record<string, unknown>;
};

export type {
  ServiceRecord,
  UseCaseCaller,
  UseCaseRecord,
  UseCaseRecordDefinition,
};
