import { BaseHttpService } from '../../base-classes';
import { contexts } from '../../lib/contexts';
import { ValidationError } from '../../lib/errors';
import { formatZodError } from '../../lib/utils/formatters';
import { IUpdateTenantNonSensitivePropertiesDto } from '../tenant/types/dto.type';
import { ITenant } from '../tenant/types/tenant.type';
import { IAccount } from './types/account.type';
import {
  accountUserDefinedIdentificationSchema,
  IAccountUserDefinedIdentification,
  ICreateAccountDto,
  IGetAccountDto,
  IUpdateAccountEmailDto,
  IUpdateAccountPhoneDto,
  IUpdateAccountUsernameDto,
} from './types/dto.type';
import { IAccountService } from './types/service.type';

class AccountHttpService extends BaseHttpService implements IAccountService {
  constructor(url: string) {
    super('account-http-service', url);
  }

  async create(
    tenantId: ITenant['id'],
    dto: ICreateAccountDto
  ): Promise<string> {
    const url = `${this.serviceUrl}?tenantId=${tenantId}`;
    return await this.httpClient.post<string>(url, {
      body: dto,
    });
  }

  async getById(id: IAccount['id']): Promise<IGetAccountDto | undefined> {
    const url = `${this.serviceUrl}/${id}`;
    return await this.httpClient.get<IGetAccountDto | undefined>(url);
  }

  async getByUserDefinedIdentification(
    accountUserDefinedIdentification: IAccountUserDefinedIdentification
  ): Promise<IGetAccountDto[] | undefined> {
    const isUDIValid = accountUserDefinedIdentificationSchema.safeParse(
      accountUserDefinedIdentification
    );

    if (!isUDIValid.success) {
      const errorInstance = new ValidationError({
        details: {
          input: { ...accountUserDefinedIdentification },
          errors: formatZodError(isUDIValid.error.issues),
        },
        context: contexts.ACCOUNT_GET_BY_USER_DEFINED_IDENTIFICATION,
      });

      this.logger.error(errorInstance);
      throw errorInstance;
    }

    const url = `${this.serviceUrl}/?${new URLSearchParams(accountUserDefinedIdentification as Record<string, string>).toString()}`;
    return await this.httpClient.get<IGetAccountDto[] | undefined>(url);
  }

  async deleteById(id: IAccount['id']): Promise<boolean> {
    const url = `${this.serviceUrl}/${id}`;
    return await this.httpClient.delete<boolean>(url);
  }

  async updateNonSensitivePropertiesById(
    id: string,
    dto: IUpdateTenantNonSensitivePropertiesDto
  ): Promise<boolean> {
    const url = `${this.serviceUrl}/${id}`;
    return await this.httpClient.patch<boolean>(url, {
      body: dto,
    });
  }

  async updateEmailById(
    id: IAccount['id'],
    dto: IUpdateAccountEmailDto
  ): Promise<boolean> {
    const url = `${this.serviceUrl}/${id}/email`;
    return await this.httpClient.patch<boolean>(url, {
      body: dto,
    });
  }

  async updatePhoneById(
    id: IAccount['id'],
    dto: IUpdateAccountPhoneDto
  ): Promise<boolean> {
    const url = `${this.serviceUrl}/${id}/phone`;
    return await this.httpClient.patch<boolean>(url, {
      body: dto,
    });
  }

  async updateUsernameById(
    id: IAccount['id'],
    dto: IUpdateAccountUsernameDto
  ): Promise<boolean> {
    const url = `${this.serviceUrl}/${id}/username`;
    return await this.httpClient.patch<boolean>(url, {
      body: dto,
    });
  }
}

export { AccountHttpService };
