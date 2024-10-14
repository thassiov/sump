import { errors } from './application-error.list';
import { BaseCustomError, ErrorOpts } from './base-custom-error.error';

export class DatabaseInstanceError extends BaseCustomError {
  constructor(opts?: ErrorOpts) {
    super(errors.DATABASE_INSTANCE_ERROR.message, opts);
    this.name = errors.DATABASE_INSTANCE_ERROR.name;
  }
}
