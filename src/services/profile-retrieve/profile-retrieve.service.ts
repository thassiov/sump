import { contexts } from '../../lib/contexts';
import { ServiceOperationError } from '../../lib/errors/service-operation.error';
import { logger } from '../../lib/logger';
import { IProfileRetrieveRepository } from '../../repositories/profile-retrieve/types';
import { IProfile } from '../../types/account.type';

export class ProfileRetrieveService {
  constructor(
    private readonly profileRetrieveRepository: IProfileRetrieveRepository
  ) {}

  async retrieveByAccountId(accountId: string): Promise<IProfile | null> {
    try {
      const profile =
        await this.profileRetrieveRepository.retrieveByAccountId(accountId);

      if (!profile) {
        return null;
      }

      return profile;
    } catch (error) {
      const errorInstance = new ServiceOperationError({
        details: {
          input: accountId,
          type: 'technical',
        },
        cause: error as Error,
        context: contexts.PROFILE_RETRIEVE,
      });

      logger.info(errorInstance);

      throw errorInstance;
    }
  }
}
