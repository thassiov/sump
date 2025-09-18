import { contexts } from '../../../lib/contexts';
import { NotFoundError } from '../../../lib/errors';
import { ICreateAccountDto } from '../../../services/account/types/dto.type';
import { ITenant } from '../../../services/tenant/types/tenant.type';
import { CreateAccountServices } from './types/use-case.type';

async function createAccountUseCase(
  services: CreateAccountServices,
  tenantId: ITenant['id'],
  dto: ICreateAccountDto
): Promise<string> {
  const tenant = await services.tenant.getById(tenantId);

  if (!tenant) {
    throw new NotFoundError({
      context: contexts.ACCOUNT_CREATE,
      details: {
        input: { tenantId },
      },
    });
  }

  // @TODO: add a `canCreateAccount` for cheking for a previously registered token, email, phone
  //  this must be paired with a `inviteAccount` functionality as well to send an invitation

  return services.account.create(tenantId, dto);
}

export { createAccountUseCase };
