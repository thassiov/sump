import { httpClient, HttpClient } from '../lib/utils/http-client';
import { BaseService } from './service.base-class';

// @FIX: http services need to translate errors into native errors.
//  native to http errors is done in the express error handler.
//  http to native is still missing
class BaseHttpService extends BaseService {
  protected httpClient: HttpClient;
  protected serviceUrl: string;

  constructor(moduleName: string, url: string) {
    super(moduleName);
    this.httpClient = httpClient;
    this.serviceUrl = url;
  }
}

export { BaseHttpService };
