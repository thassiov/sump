import { EntityCustomizationError } from '../../lib/errors';
import { contentLoader } from './content-loader';

import { logger } from '../../lib/logger';

jest.mock('../../lib/logger');

describe('[UTIL] content loader', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  const validCustomisableEntityYaml = `
---
account: 
- name: "password"
  type: "string"
  sensitive: true
  defaultValue: "this is secure"
- name: "phone"
  type: "string"
  sensitive: true
  defaultValue: "+535323423423"
`;

  const validLoadedCustomizableEntityJson = {
    account: [
      {
        name: 'password',
        type: 'string',
        sensitive: true,
        defaultValue: 'this is secure',
      },
      {
        name: 'phone',
        type: 'string',
        sensitive: true,
        defaultValue: '+535323423423',
      },
    ],
  };

  it('loads a yaml successfully', () => {
    let loadResult;
    expect(
      () => (loadResult = contentLoader(validCustomisableEntityYaml))
    ).not.toThrow();
    expect(loadResult).toStrictEqual(validLoadedCustomizableEntityJson);
  });

  it.each([['just a string'], [2], [[]], [true]])(
    'fails to load entity content (%p)',
    (testInput) => {
      let resultingError;
      try {
        contentLoader(testInput as string);
      } catch (error) {
        resultingError = error as EntityCustomizationError;
      }

      expect(resultingError?.message).toMatch(
        'Customizable entity yaml contents does not have a valid format. An object is needed.'
      );
      expect(resultingError?.details?.['op']).toEqual('Loading raw yaml');
      expect(resultingError?.details?.['input']).toEqual(testInput);
    }
  );

  it('does not load empty string (ignores input)', () => {
    jest.spyOn(logger, 'info');

    const result = contentLoader();
    expect(result).toBe(false);

    expect(logger.info).toHaveBeenCalledTimes(1);
    expect(logger.info).toHaveBeenCalledWith('No customizable entity provided');
  });

  it('fails to load a malformed yaml', () => {
    const malformedYaml = `
-
a:
- name: "password"
  type: "string"
  sensitive: "true"
  defaultValue: "this is secure"
`;

    expect(() => contentLoader(malformedYaml)).toThrow(
      'Failure when loading customized entity data'
    );
  });
});
