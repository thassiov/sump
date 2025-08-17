import { setupLogger } from '../lib/logger/logger';

class BaseService {
  protected logger;

  constructor(moduleName: string) {
    this.logger = setupLogger(moduleName);
  }
}

export { BaseService };
