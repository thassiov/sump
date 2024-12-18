import { ModelStatic, Sequelize, Transaction } from 'sequelize';
import { AccountModel, ProfileModel } from '../../infra/db';
import { contexts } from '../../lib/contexts';
import { RepositoryOperationError } from '../../lib/errors';
import { logger } from '../../lib/logger';
import { ICreateAccountAndProfileResult } from '../../services/create-account-and-profile/types';
import {
  ICreateAccountAndProfileRepository,
  ICreateAccountDto,
  ICreateProfileDto,
} from './types';

export class CreateAccountAndProfileRepository
  implements ICreateAccountAndProfileRepository
{
  private accountModel: ModelStatic<AccountModel>;
  private profileModel: ModelStatic<ProfileModel>;

  constructor(private readonly db: Sequelize) {
    this.accountModel = this.db.model('account');
    this.profileModel = this.db.model('profile');
  }

  async create(
    accountInfo: ICreateAccountDto,
    profileInfo: ICreateProfileDto
  ): Promise<ICreateAccountAndProfileResult> {
    const transaction = await this.createTransation();

    try {
      const accountCreateResult = await this.createAccount(
        accountInfo,
        transaction
      );
      await this.createProfile(profileInfo, transaction);
      await transaction.commit();

      return { accountId: accountCreateResult.get('id') as string };
    } catch (error) {
      await transaction.rollback();

      const repositoryError = new RepositoryOperationError({
        cause: error as Error,
        context: contexts.ACCOUNT_PROFILE_CREATE,
        details: {
          input: { accountInfo, profileInfo },
        },
      });

      logger.error(repositoryError);
      throw repositoryError;
    }
  }

  private async createAccount(
    accountInfo: ICreateAccountDto,
    tx: Transaction
  ): Promise<AccountModel> {
    logger.info('creating account');
    return await this.accountModel.create(accountInfo, { transaction: tx });
  }

  private async createProfile(
    profileInfo: ICreateProfileDto,
    tx: Transaction
  ): Promise<ProfileModel> {
    logger.info('creating profile');
    return this.profileModel.create(profileInfo, { transaction: tx });
  }

  private async createTransation(): Promise<Transaction> {
    return this.db.transaction();
  }
}
