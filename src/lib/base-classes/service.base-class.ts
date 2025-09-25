import { setupLogger } from '../logger';
import { BaseRepository } from './repository.base-class';

class BaseService {
  protected logger;
  protected repository;

  constructor(moduleName: string, repository?: BaseRepository) {
    this.logger = setupLogger(moduleName);
    if (repository) {
      this.repository = repository;
    }
  }
}

export { BaseService };
