import { BaseHttpService } from '../../base-classes/http-service.base-class';
import { IAccount } from './types/account.type';
import {
  ICreateAccountDto,
  ICreateAccountOperationResult,
  IUpdateAccountDto,
} from './types/dto.type';
import { IAccountService } from './types/service.type';

class AccountHttpService extends BaseHttpService implements IAccountService {
  constructor(url: string) {
    super('account-http-service', url);
  }

  async createAccount(
    newAccount: ICreateAccountDto
  ): Promise<ICreateAccountOperationResult> {
    try {
      return await this.httpClient.post<ICreateAccountOperationResult>(
        this.serviceUrl,
        { body: newAccount }
      );
    } catch (error) {
      this.logger.error(error);
      // @TODO: we have to check for instances of UtilsOperationError and theirs nested causes
      //  to return the actual problem the service threw at us
      throw error;
    }
  }

  async getAccountById(accountId: string): Promise<IAccount | undefined> {
    try {
      const url = `${this.serviceUrl}/${accountId}`;
      return await this.httpClient.get<IAccount | undefined>(url);
    } catch (error) {
      this.logger.error(error);
      // @TODO: we have to check for instances of UtilsOperationError and theirs nested causes
      //  to return the actual problem the service threw at us
      throw error;
    }
  }

  async removeAccountById(accountId: string): Promise<boolean> {
    try {
      const url = `${this.serviceUrl}/${accountId}`;
      return await this.httpClient.delete<boolean>(url);
    } catch (error) {
      this.logger.error(error);
      // @TODO: we have to check for instances of UtilsOperationError and theirs nested causes
      //  to return the actual problem the service threw at us
      throw error;
    }
  }

  async updateAccountById(
    accountId: string,
    updateAccountDto: IUpdateAccountDto
  ): Promise<boolean> {
    try {
      const url = `${this.serviceUrl}/${accountId}`;
      return await this.httpClient.patch<boolean>(url, {
        body: updateAccountDto,
      });
    } catch (error) {
      this.logger.error(error);
      // @TODO: we have to check for instances of UtilsOperationError and theirs nested causes
      //  to return the actual problem the service threw at us
      throw error;
    }
  }
}

export { AccountHttpService };
