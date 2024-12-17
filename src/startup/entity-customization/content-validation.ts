import yaml from 'js-yaml';
import { EntityCustomizationError } from '../../lib/errors/entity-customization.error';
import { logger } from '../../lib/logger';
import {
  CustomizableEntity,
  CustomizableEntityList,
  CustomizableEntityProperty,
  CustomizableEntityRecord,
} from './types';

export class ContentsVerificationUtil {
  private loadedCustomizableEntityData: unknown;

  constructor(private readonly rawYamlConfig?: string) {}

  public loadCustomizableEntityYaml(): boolean {
    if (!this.rawYamlConfig) {
      logger.info('No customizable entity provided');
      return false;
    }

    let parsedYaml;
    try {
      parsedYaml = yaml.load(this.rawYamlConfig);

      // js-yaml can load a string, a number, an object or throw an error when loading data.
      // here we just make sure that what we are loading is an object.
      if (
        !parsedYaml ||
        Array.isArray(parsedYaml) ||
        typeof parsedYaml !== 'object'
      ) {
        // @NOTE better phrasing
        throw new Error(
          'Customizable entity yaml contents does not have a valid format. An object is needed.'
        );
      }

      this.loadedCustomizableEntityData = parsedYaml;
      return true;
    } catch (error) {
      throw new EntityCustomizationError({
        cause: error as Error,
        details: { op: 'Loading raw yaml', input: this.rawYamlConfig },
      });
    }
  }

  public validateCustomizableEntity(): void {
    for (const entity in this.loadedCustomizableEntityData as object) {
      if (!isValidEntityName(entity)) {
        const errmsg = `${entity} is not a valid customizable entity name`;
        logger.error(errmsg);
        throw new EntityCustomizationError({
          details: {
            op: 'Validating customizable entity name',
            input: entity,
            info: errmsg,
          },
        });
      }

      const properties = (
        this.loadedCustomizableEntityData as CustomizableEntityRecord
      )[entity as CustomizableEntity];

      properties.forEach((property: CustomizableEntityProperty) => {
        if (!isValidCustomizableEntityProperty(property)) {
          const errmsg = `${entity} has an invalid property`;
          logger.error(errmsg);
          throw new EntityCustomizationError({
            details: {
              op: 'Validating customizable entity property',
              input: property,
              info: errmsg,
            },
          });
        }
      });
    }
  }

  public getCustomizableEntities(): CustomizableEntityRecord {
    return this.loadedCustomizableEntityData as CustomizableEntityRecord;
  }
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
