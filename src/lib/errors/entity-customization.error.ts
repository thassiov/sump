import { errors } from './application-error.list';
import { BaseCustomError, ErrorOpts } from './base-custom-error.error';

export class EntityCustomizationError extends BaseCustomError {
  constructor(opts?: ErrorOpts) {
    super(errors.ENTITY_CUSTOMIZATION_ERROR.message, opts);
    this.name = errors.ENTITY_CUSTOMIZATION_ERROR.name;
  }
}
