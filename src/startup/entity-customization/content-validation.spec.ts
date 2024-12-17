import { logger } from '../../lib/logger';
import { contentValidation } from './content-validation';

jest.mock('../../lib/logger');

describe('[UTIL] entity personalization', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

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

  it('successfully validates an entity', () => {
    expect(contentValidation(validLoadedCustomizableEntityJson)).toBe(true);
  });

  it('fails to validate due to invalid entity name', () => {
    jest.spyOn(logger, 'error');

    const invalidLoadedCustomizableEntityJson = {
      user: [
        {
          name: 'password',
          type: 'string',
          sensitive: true,
          defaultValue: 'this is secure',
        },
      ],
    };

    contentValidation(invalidLoadedCustomizableEntityJson);
    expect(logger.error).toHaveBeenCalledTimes(1);
    expect(logger.error).toHaveBeenCalledWith(
      'user is not a valid customizable entity name',
      {
        details: {
          op: 'Validating customizable entity name',
          input: 'user',
        },
      }
    );
  });

  it('fails to validate due to invalid property values', () => {
    jest.spyOn(logger, 'error');

    const invalidLoadedCustomizableEntityJson = {
      account: [
        {
          name: 'phone',
          type: 'string',
          sensitive: true,
          defaultValue: '+55231498723',
        },
        {
          names: 'password',
          type: 'string',
          sensitive: true,
          defaultValue: 'this is secure',
        },
      ],
    };

    contentValidation(invalidLoadedCustomizableEntityJson);
    expect(logger.error).toHaveBeenCalledTimes(1);
    expect(logger.error).toHaveBeenCalledWith(
      'account has an invalid property',
      {
        details: {
          op: 'Validating customizable entity property',
          input: {
            names: 'password',
            type: 'string',
            sensitive: true,
            defaultValue: 'this is secure',
          },
        },
      }
    );
  });
});
