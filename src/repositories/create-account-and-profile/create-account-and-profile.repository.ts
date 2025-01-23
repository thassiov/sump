import { Knex } from 'knex';
import {
  ICreateAccountAndProfileOperationResult,
  ICreateAccountDto,
  ICreateProfileDto,
} from '../../types/dto.type';
import { IAccountRepository } from '../account/types';
import { IProfileRepository } from '../profile/types';
import { ICreateAccountAndProfileRepository } from './types';

class CreateAccountAndProfileRepository
  implements ICreateAccountAndProfileRepository
{
  constructor(
    private readonly dbClient: Knex,
    private readonly accountRepository: IAccountRepository,
    private readonly profileRepository: IProfileRepository
  ) {}

  async createNewAccountAndProfile(
    accountDto: ICreateAccountDto,
    profileDto: ICreateProfileDto
  ): Promise<ICreateAccountAndProfileOperationResult> {
    const transaction = await this.createTransation();

    try {
      const accountId = await this.accountRepository.create(
        accountDto,
        transaction
      );

      await this.profileRepository.create(
        { ...profileDto, accountId },
        transaction
      );

      await transaction.commit();

      return { accountId };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  private async createTransation(): Promise<Knex.Transaction> {
    return this.dbClient.transaction();
  }
}

export { CreateAccountAndProfileRepository };
