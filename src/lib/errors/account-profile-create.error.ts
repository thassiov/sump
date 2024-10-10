import { errors } from './application-error.list';
import { BaseCustomError, ErrorOpts } from './base-custom-error.error';

export class AccountProfileCreateError extends BaseCustomError {
  constructor(opts?: ErrorOpts) {
    super(errors.ACCOUNT_PROFILE_CREATE_ERROR.message, opts);
    this.name = errors.ACCOUNT_PROFILE_CREATE_ERROR.name;
  }
}
