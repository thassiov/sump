import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { BaseService } from '../../lib/base-classes';
import { ITenantAccount, ITenantAccountRole } from '../types/tenant-account/tenant-account.type';
import {
  ITenantAccountUserDefinedIdentification,
  ICreateTenantAccountDto,
  ICreateTenantAccountWithPasswordDto,
  IGetTenantAccountDto,
  IUpdateTenantAccountEmailDto,
  IUpdateTenantAccountNonSensitivePropertiesDto,
  IUpdateTenantAccountPhoneDto,
  IUpdateTenantAccountUsernameDto,
} from '../types/tenant-account/dto.type';
import { ITenantAccountService } from '../types/tenant-account/service.type';
import { ITenant } from '../types/tenant/tenant.type';
import { TenantAccountRepository } from '../repositories/tenant-account.repository';

@Injectable()
export class TenantAccountService extends BaseService implements ITenantAccountService {
  constructor(private readonly accountRepository: TenantAccountRepository) {
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

  /**
   * Create account with password hash (for auth signup)
   */
  async createWithPassword(
    tenantId: ITenant['id'],
    dto: ICreateTenantAccountWithPasswordDto,
    transaction?: Knex.Transaction
  ): Promise<string> {
    this.logger.info(`create account with password for tenant ${tenantId}`);

    const accountId = await this.accountRepository.create(
      { ...dto, tenantId },
      transaction
    );

    this.logger.info(`new account with password created: ${accountId}`);

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

  /**
   * Get account by identifier (email, phone, or username) with password hash (for auth signin)
   */
  async getByIdentifierWithPassword(
    identifier: { email?: string; phone?: string; username?: string },
    tenantId: ITenantAccount['tenantId']
  ): Promise<(IGetTenantAccountDto & { passwordHash: string | null }) | undefined> {
    this.logger.info(`getByIdentifierWithPassword: ${JSON.stringify(identifier)}`);

    return await this.accountRepository.getByIdentifierWithPassword(identifier, tenantId);
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

  async disableByIdAndTenantId(
    id: ITenantAccount['id'],
    tenantId: ITenantAccount['tenantId']
  ): Promise<boolean> {
    this.logger.info(`disableByIdAndTenantId: ${id}`);

    return this.accountRepository.updateByIdAndTenantId(id, tenantId, {
      disabled: true,
      disabledAt: new Date(),
    });
  }

  async enableByIdAndTenantId(
    id: ITenantAccount['id'],
    tenantId: ITenantAccount['tenantId']
  ): Promise<boolean> {
    this.logger.info(`enableByIdAndTenantId: ${id}`);

    return this.accountRepository.updateByIdAndTenantId(id, tenantId, {
      disabled: false,
      disabledAt: null,
    });
  }

  /**
   * Update password hash for an account (for password reset)
   */
  async updatePasswordHashById(
    id: ITenantAccount['id'],
    passwordHash: string
  ): Promise<boolean> {
    this.logger.info(`updatePasswordHashById: ${id}`);

    // Get the account to find its tenantId
    const account = await this.accountRepository.getById(id);
    if (!account) {
      return false;
    }

    return this.accountRepository.updateByIdAndTenantId(id, account.tenantId, {
      passwordHash,
    });
  }
}
