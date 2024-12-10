import { EntityCustomizationError } from '../../lib/errors';
import { logger } from '../../lib/logger';
import { EntityCustomizationUtil } from './entity-personalization.util';

jest.mock('../../lib/logger');

describe('[UTIL] entity personalization', () => {
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

  describe('creates EntityCustomizationUtil instance', () => {
    it('creates an instance by not passing an argument', () => {
      let instance;
      expect(() => (instance = new EntityCustomizationUtil())).not.toThrow();
      expect(instance).toBeInstanceOf(EntityCustomizationUtil);
    });

    it('creates an instance by passing a string as argument', () => {
      let instance;
      expect(
        () =>
          (instance = new EntityCustomizationUtil(validCustomisableEntityYaml))
      ).not.toThrow();
      expect(instance).toBeInstanceOf(EntityCustomizationUtil);
    });
  });

  describe('load customizable entity yaml', () => {
    it('loads a yaml successfully', () => {
      const instance = new EntityCustomizationUtil(validCustomisableEntityYaml);

      let loadResult;
      expect(
        () => (loadResult = instance.loadCustomizableEntityYaml())
      ).not.toThrow();
      expect(loadResult).toBe(true);
    });

    it.each([['just a string'], [2], [[]], [true]])(
      'fails to load entity content (%p)',
      (testInput) => {
        const instance = new EntityCustomizationUtil(testInput as string);

        let resultingError;
        try {
          instance.loadCustomizableEntityYaml();
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
      const instance = new EntityCustomizationUtil('');

      const result = instance.loadCustomizableEntityYaml();
      expect(result).toBe(false);

      expect(logger.info).toHaveBeenCalledTimes(1);
      expect(logger.info).toHaveBeenCalledWith(
        'No customizable entity provided'
      );
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

      const instance = new EntityCustomizationUtil(malformedYaml);

      expect(() => instance.loadCustomizableEntityYaml()).toThrow(
        'Failure when loading customized entity data'
      );
    });
  });

  describe('validates customizable entity', () => {
    it('successfully validates an entity', () => {
      const instance = new EntityCustomizationUtil(validCustomisableEntityYaml);
      instance.loadCustomizableEntityYaml();
      let thrown;
      try {
        instance.validateCustomizableEntity();
      } catch (error) {
        thrown = error;
      }
      expect(thrown).not.toBeDefined();
    });

    it('fails to validate due to invalid entity name', () => {
      const invalidEntityYaml = `
---
user:
- name: "password"
  type: "string"
  sentitive: true
  defaultValue: "this is secure"
`;

      const instance = new EntityCustomizationUtil(invalidEntityYaml);
      instance.loadCustomizableEntityYaml();
      let thrown;
      try {
        instance.validateCustomizableEntity();
      } catch (error) {
        thrown = error as EntityCustomizationError;
      }
      expect(thrown).toBeDefined();
      expect(thrown?.message).toEqual(
        'Failure when loading customized entity data'
      );
      expect(thrown?.details?.['op']).toEqual(
        'Validating customizable entity name'
      );
      expect(thrown?.details?.['input']).toEqual('user');
      expect(thrown?.details?.['info']).toEqual(
        'user is not a valid customizable entity name'
      );
    });

    it('fails to validate due to invalid property values', () => {
      const invalidEntityYaml = `
---
account:
- names: "password"
  type: "string"
  sensitive: true
  defaultValue: "this is secure"
`;

      const instance = new EntityCustomizationUtil(invalidEntityYaml);
      instance.loadCustomizableEntityYaml();
      let thrown;
      try {
        instance.validateCustomizableEntity();
      } catch (error) {
        thrown = error as EntityCustomizationError;
      }
      expect(thrown).toBeDefined();
      expect(thrown?.message).toEqual(
        'Failure when loading customized entity data'
      );
      expect(thrown?.details?.['op']).toEqual(
        'Validating customizable entity property'
      );
      expect(thrown?.details?.['input']).toEqual({
        names: 'password',
        type: 'string',
        sensitive: true,
        defaultValue: 'this is secure',
      });
      expect(thrown?.details?.['info']).toEqual(
        'account has an invalid property'
      );
    });
  });

  describe('get customizable entities', () => {
    it('should retrieve the entities stored in the utility class', () => {
      const instance = new EntityCustomizationUtil(validCustomisableEntityYaml);
      instance.loadCustomizableEntityYaml();
      instance.validateCustomizableEntity();
      const result = instance.getCustomizableEntities();

      expect(result).toHaveProperty('account[0]', {
        name: 'password',
        type: 'string',
        sensitive: true,
        defaultValue: 'this is secure',
      });

      expect(result).toHaveProperty('account[1]', {
        name: 'phone',
        type: 'string',
        sensitive: true,
        defaultValue: '+535323423423',
      });
    });
  });
});
