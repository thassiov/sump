import { logger } from '../../lib/logger';
import {
  CustomizableEntity,
  CustomizableEntityList,
  CustomizableEntityProperty,
  CustomizableEntityRecord,
} from './types';

function contentValidation(loadedCustomizableEntityData: object): boolean {
  for (const entity in loadedCustomizableEntityData) {
    if (!isValidEntityName(entity)) {
      const errmsg = `${entity} is not a valid customizable entity name`;
      logger.error(errmsg, {
        details: {
          op: 'Validating customizable entity name',
          input: entity,
        },
      });
      return false;
    }

    const properties = (
      loadedCustomizableEntityData as CustomizableEntityRecord
    )[entity as CustomizableEntity];

    for (const property of properties) {
      if (!isValidCustomizableEntityProperty(property)) {
        const errmsg = `${entity} has an invalid property`;
        logger.error(errmsg, {
          details: {
            op: 'Validating customizable entity property',
            input: property,
          },
        });
        return false;
      }
    }
  }
  return true;
}

function isValidEntityName(name: string): boolean {
  if (!(CustomizableEntityList as readonly string[]).includes(name)) {
    return false;
  }
  return true;
}

function isValidCustomizableEntityProperty(
  property: CustomizableEntityProperty
): boolean {
  if (!property.name || typeof property.name !== 'string') {
    return false;
  }

  if (!['string', 'number'].includes(property.type)) {
    return false;
  }

  if (
    property.sensitive !== undefined &&
    typeof property.sensitive !== 'boolean'
  ) {
    return false;
  }

  if (
    property.defaultValue !== undefined &&
    !['string', 'number'].includes(typeof property.defaultValue)
  ) {
    return false;
  }

  return true;
}

export { contentValidation };
