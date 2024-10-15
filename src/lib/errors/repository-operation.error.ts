import { errors } from './application-error.list';
import { BaseCustomError, ErrorOpts } from './base-custom-error.error';

export class RepositoryOperationError extends BaseCustomError {
  constructor(opts?: ErrorOpts) {
    super(errors.REPOSITORY_OPERATION_ERROR.message, opts);
    this.name = errors.REPOSITORY_OPERATION_ERROR.name;
  }
}
