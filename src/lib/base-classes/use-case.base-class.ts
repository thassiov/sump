import { setupLogger } from '../logger';

class BaseUseCase {
  protected logger;

  constructor(moduleName: string) {
    this.logger = setupLogger(moduleName);
  }
}

export { BaseUseCase };
