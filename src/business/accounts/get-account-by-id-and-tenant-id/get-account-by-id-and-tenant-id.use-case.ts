import { contexts } from '../../../lib/contexts';
import { NotFoundError } from '../../../lib/errors';
import { IAccount } from '../../../services/account/types/account.type';
import { ITenant } from '../../../services/tenant/types/tenant.type';
import { GetAccountByIdAndTenantIdUseCaseResultDto } from './types/dto.type';
import { GetAccountByIdAndTenantIdServices } from './types/use-case.type';

async function getAccountByIdAndTenantIdUseCase(
  services: GetAccountByIdAndTenantIdServices,
  accountId: IAccount['id'],
  tenantId: ITenant['id']
): Promise<GetAccountByIdAndTenantIdUseCaseResultDto> {
  const account = await services.account.getByAccountIdAndTenantId(
    accountId,
    tenantId
  );

  if (!account) {
    throw new NotFoundError({
      context: contexts.ACCOUNT_GET_BY_ACCOUNT_ID_AND_TENANT_ID,
      details: {
        input: { tenantId, accountId },
      },
    });
  }

  return account;
}

export { getAccountByIdAndTenantIdUseCase };
