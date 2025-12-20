import { Knex } from 'knex';
import { BaseService } from '../../lib/base-classes';
import { ITenantAccount, ITenantAccountRole } from '../types/tenant-account/tenant-account.type';
import {
  ITenantAccountUserDefinedIdentification,
  ICreateTenantAccountDto,
  IGetTenantAccountDto,
  IUpdateTenantAccountEmailDto,
  IUpdateTenantAccountNonSensitivePropertiesDto,
  IUpdateTenantAccountPhoneDto,
  IUpdateTenantAccountUsernameDto,
} from '../types/tenant-account/dto.type';
import { ITenantAccountRepository } from '../types/account/repository.type';
import { ITenantAccountService } from '../types/tenant-account/service.type';
import { ITenant } from '../types/tenant/tenant.type';

export class TenantAccountService extends BaseService implements ITenantAccountService {
  constructor(private readonly accountRepository: ITenantAccountRepository) {
    super('tenant-account-service');
  }

  // @NOTE: maybe the transaction argument must be called something else here
  async create(
    tenantId: ITenant['id'],
    dto: ICreateTenantAccountDto,
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

  async getById(id: ITenantAccount['id']): Promise<IGetTenantAccountDto | undefined> {
    this.logger.info(`getById: ${id}`);

    return this.accountRepository.getById(id);
  }

  async getByTenantId(
    tenantId: ITenantAccount['tenantId']
  ): Promise<IGetTenantAccountDto[] | undefined> {
    this.logger.info(`getByTenantId: ${tenantId}`);

    return this.accountRepository.getByTenantId(tenantId);
  }

  async getByAccountIdAndTenantId(
    accountId: ITenantAccount['id'],
    tenantId: ITenantAccount['tenantId']
  ): Promise<IGetTenantAccountDto | undefined> {
    this.logger.info(`getByAccountIdAndTenantId: ${accountId} ${tenantId}`);

    return this.accountRepository.getByAccountIdAndTenantId(
      accountId,
      tenantId
    );
  }

  async getByUserDefinedIdentificationAndTenantId(
    accountUserDefinedIdentification: ITenantAccountUserDefinedIdentification,
    tenantId: ITenantAccount['tenantId']
  ): Promise<IGetTenantAccountDto[] | undefined> {
    this.logger.info(
      `getByUserDefinedIdentification: ${JSON.stringify(accountUserDefinedIdentification)}`
    );

    return await this.accountRepository.getByUserDefinedIdentificationAndTenantId(
      accountUserDefinedIdentification,
      tenantId
    );
  }

  async getByUserDefinedIdentification(
    accountUserDefinedIdentification: ITenantAccountUserDefinedIdentification
  ): Promise<IGetTenantAccountDto[] | undefined> {
    this.logger.info(
      `getByUserDefinedIdentification: ${JSON.stringify(accountUserDefinedIdentification)}`
    );

    return await this.accountRepository.getByUserDefinedIdentification(
      accountUserDefinedIdentification
    );
  }

  async deleteById(id: ITenantAccount['id']): Promise<boolean> {
    this.logger.info(`deleteById: ${id}`);

    return this.accountRepository.deleteById(id);
  }

  async deleteByIdAndTenantId(
    id: ITenantAccount['id'],
    tenantId: ITenantAccount['tenantId']
  ): Promise<boolean> {
    this.logger.info(`deleteById: ${id}`);

    return this.accountRepository.deleteByIdAndTenantId(id, tenantId);
  }

  /**
   * this method must be used for *non sensitive properties* only
   * the other properties must have their own methods, with their own specific validations
   * */
  async updateNonSensitivePropertiesByIdAndTenantId(
    id: ITenantAccount['id'],
    tenantId: ITenantAccount['tenantId'],
    dto: IUpdateTenantAccountNonSensitivePropertiesDto
  ): Promise<boolean> {
    this.logger.info(`updateNonSensitivePropertiesById: ${id}`);

    return this.accountRepository.updateByIdAndTenantId(id, tenantId, dto);
  }

  async updateEmailByIdAndTenantId(
    id: ITenantAccount['id'],
    tenantId: ITenantAccount['tenantId'],
    dto: IUpdateTenantAccountEmailDto
  ): Promise<boolean> {
    this.logger.info(`updateEmailById: ${id}`);

    return this.accountRepository.updateByIdAndTenantId(id, tenantId, dto);
  }

  async updateUsernameByIdAndTenantId(
    id: ITenantAccount['id'],
    tenantId: ITenantAccount['tenantId'],
    dto: IUpdateTenantAccountUsernameDto
  ): Promise<boolean> {
    this.logger.info(`updateUsernameById: ${id}`);

    return this.accountRepository.updateByIdAndTenantId(id, tenantId, dto);
  }

  async updatePhoneByIdAndTenantId(
    id: ITenantAccount['id'],
    tenantId: ITenantAccount['tenantId'],
    dto: IUpdateTenantAccountPhoneDto
  ): Promise<boolean> {
    this.logger.info(`updatePhoneById: ${id}`);

    return this.accountRepository.updateByIdAndTenantId(id, tenantId, dto);
  }

  async canAccountBeDeleted(
    id: ITenantAccount['id'],
    tenantId: ITenantAccount['tenantId']
  ): Promise<boolean> {
    this.logger.info(`doesAccountHasRole: ${id}`);

    const tenantOwnerRole = {
      role: 'owner',
      target: 'tenant',
      targetId: tenantId,
    } as ITenantAccountRole;

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
