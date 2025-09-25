import { Knex } from 'knex';
import { BaseService } from '../../lib/base-classes';
import { IAccount, IAccountRole } from '../types/account/account.type';
import {
  IAccountUserDefinedIdentification,
  ICreateAccountDto,
  IGetAccountDto,
  IUpdateAccountEmailDto,
  IUpdateAccountNonSensitivePropertiesDto,
  IUpdateAccountPhoneDto,
  IUpdateAccountUsernameDto,
} from '../types/account/dto.type';
import { IAccountRepository } from '../types/account/repository.type';
import { IAccountService } from '../types/account/service.type';
import { ITenant } from '../types/tenant/tenant.type';

export class AccountService extends BaseService implements IAccountService {
  constructor(private readonly accountRepository: IAccountRepository) {
    super('account-service');
  }

  // @NOTE: maybe the transaction argument must be called something else here
  async create(
    tenantId: ITenant['id'],
    dto: ICreateAccountDto,
    transaction?: Knex.Transaction
  ): Promise<string> {
    this.logger.info(`create account for tenant ${tenantId}`);

    const accountId = await this.accountRepository.create(
      { ...dto, tenantId },
      transaction
    );

    this.logger.info(`new account created: ${accountId}`);

    return accountId;
  }

  async getById(id: IAccount['id']): Promise<IGetAccountDto | undefined> {
    this.logger.info(`getById: ${id}`);

    return this.accountRepository.getById(id);
  }

  async getByTenantId(
    tenantId: IAccount['tenantId']
  ): Promise<IGetAccountDto[] | undefined> {
    this.logger.info(`getByTenantId: ${tenantId}`);

    return this.accountRepository.getByTenantId(tenantId);
  }

  async getByAccountIdAndTenantId(
    accountId: IAccount['id'],
    tenantId: IAccount['tenantId']
  ): Promise<IGetAccountDto | undefined> {
    this.logger.info(`getByAccountIdAndTenantId: ${accountId} ${tenantId}`);

    return this.accountRepository.getByAccountIdAndTenantId(
      accountId,
      tenantId
    );
  }

  async getByUserDefinedIdentificationAndTenantId(
    accountUserDefinedIdentification: IAccountUserDefinedIdentification,
    tenantId: IAccount['tenantId']
  ): Promise<IGetAccountDto[] | undefined> {
    this.logger.info(
      `getByUserDefinedIdentification: ${JSON.stringify(accountUserDefinedIdentification)}`
    );

    return await this.accountRepository.getByUserDefinedIdentificationAndTenantId(
      accountUserDefinedIdentification,
      tenantId
    );
  }

  async deleteById(id: IAccount['id']): Promise<boolean> {
    this.logger.info(`deleteById: ${id}`);

    return this.accountRepository.deleteById(id);
  }

  async deleteByIdAndTenantId(
    id: IAccount['id'],
    tenantId: IAccount['tenantId']
  ): Promise<boolean> {
    this.logger.info(`deleteById: ${id}`);

    return this.accountRepository.deleteByIdAndTenantId(id, tenantId);
  }

  /**
   * this method must be used for *non sensitive properties* only
   * the other properties must have their own methods, with their own specific validations
   * */
  async updateNonSensitivePropertiesByIdAndTenantId(
    id: IAccount['id'],
    tenantId: IAccount['tenantId'],
    dto: IUpdateAccountNonSensitivePropertiesDto
  ): Promise<boolean> {
    this.logger.info(`updateNonSensitivePropertiesById: ${id}`);

    return this.accountRepository.updateByIdAndTenantId(id, tenantId, dto);
  }

  async updateEmailByIdAndTenantId(
    id: IAccount['id'],
    tenantId: IAccount['tenantId'],
    dto: IUpdateAccountEmailDto
  ): Promise<boolean> {
    this.logger.info(`updateEmailById: ${id}`);

    return this.accountRepository.updateByIdAndTenantId(id, tenantId, dto);
  }

  async updateUsernameByIdAndTenantId(
    id: IAccount['id'],
    tenantId: IAccount['tenantId'],
    dto: IUpdateAccountUsernameDto
  ): Promise<boolean> {
    this.logger.info(`updateUsernameById: ${id}`);

    return this.accountRepository.updateByIdAndTenantId(id, tenantId, dto);
  }

  async updatePhoneByIdAndTenantId(
    id: IAccount['id'],
    tenantId: IAccount['tenantId'],
    dto: IUpdateAccountPhoneDto
  ): Promise<boolean> {
    this.logger.info(`updatePhoneById: ${id}`);

    return this.accountRepository.updateByIdAndTenantId(id, tenantId, dto);
  }

  async canAccountBeDeleted(
    id: IAccount['id'],
    tenantId: IAccount['tenantId']
  ): Promise<boolean> {
    this.logger.info(`doesAccountHasRole: ${id}`);

    const tenantOwnerRole = {
      role: 'owner',
      target: 'tenant',
      targetId: tenantId,
    } as IAccountRole;

    const accounts =
      await this.accountRepository.getAccountsByRoleAndByTenantId(
        tenantId,
        tenantOwnerRole
      );

    const isOwner = accounts.find((account) => account.id === id);

    if (isOwner && accounts.length === 0) {
      return false;
    }

    return true;
  }
}
