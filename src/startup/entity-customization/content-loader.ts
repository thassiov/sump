import yaml from 'js-yaml';
import { EntityCustomizationError } from '../../lib/errors';
import { logger } from '../../lib/logger';

// @NOTE this return type is kinda goofy now
// @TODO fix it
function contentLoader(rawYamlConfig?: string): false | object {
  if (!rawYamlConfig) {
    logger.info('No customizable entity provided');
    return false;
  }

  let parsedYaml;
  try {
    parsedYaml = yaml.load(rawYamlConfig);

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

    return parsedYaml;
  } catch (error) {
    throw new EntityCustomizationError({
      cause: error as Error,
      details: { op: 'Loading raw yaml', input: rawYamlConfig },
    });
  }
}

export { contentLoader };
