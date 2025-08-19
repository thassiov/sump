import { AccountHttpService } from './account.http-service';
import { AccountRepository } from './account.repository';
import { makeServiceEndpoints } from './account.routes';
import { AccountService } from './account.service';

export const account = {
  service: AccountService,
  httpService: AccountHttpService,
  repository: AccountRepository,
  endpoints: makeServiceEndpoints
};
