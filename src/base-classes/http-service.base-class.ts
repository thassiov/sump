import { httpClient, HttpClient } from '../lib/utils/http-client';
import { BaseService } from './service.base-class';

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
