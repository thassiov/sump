import { errors } from './application-error.list';
import { BaseCustomError, ErrorOpts } from './base-custom-error.error';

export class ServiceOperationError extends BaseCustomError {
  constructor(opts?: ErrorOpts) {
    super(errors.SERVICE_OPERATION_ERROR.message, opts);
    this.name = errors.SERVICE_OPERATION_ERROR.name;
  }
}
