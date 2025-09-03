import { faker } from '@faker-js/faker';
import { contexts } from '../../lib/contexts';
import { UnexpectedError, ValidationError } from '../../lib/errors';
import { TenantEnvironmentService } from './tenant-environment.service';
import {
  ICreateTenantEnvironmentDto,
  ICreateTenantEnvironmentNoInternalPropertiesDto,
  IGetTenantEnvironmentDto,
  ITenantEnvironmentCustomPropertiesOperationDtoSchema,
  IUpdateTenantEnvironmentNonSensitivePropertiesDto,
} from './types/dto.type';
import { ITenantEnvironmentRepository } from './types/repository.type';

describe('TenantEnvironment Service', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  const mockTenantEnvironmentRepository = {
    create: jest.fn(),
    getById: jest.fn(),
    deleteById: jest.fn(),
    updateById: jest.fn(),
    setCustomPropertyById: jest.fn(),
    deleteCustomPropertyById: jest.fn(),
  };

  describe('create', () => {
    it('should fail to create a new tenant environment due to invalid tenantId format', async () => {
      const tenantIdWithInvalidFormat = 'this-is-not-a-uuid';
      const mockThrownError = {
        details: {
          input: { tenantId: tenantIdWithInvalidFormat },
          errors: { tenantId: 'field value is invalid' },
        },
        context: contexts.TENANT_ENVIRONMENT_CREATE,
      };

      const mockTenantEnvironment = {};

      const tenantEnvironmentService = new TenantEnvironmentService(
        mockTenantEnvironmentRepository
      );

      const loggerSpyInfo = jest.spyOn(
        (
          tenantEnvironmentService as unknown as {
            logger: { info: typeof jest.fn };
          }
        ).logger,
        'info'
      );
      const loggerSpyError = jest.spyOn(
        (
          tenantEnvironmentService as unknown as {
            logger: { error: typeof jest.fn };
          }
        ).logger,
        'error'
      );

      let thrown;

      try {
        await tenantEnvironmentService.create(
          tenantIdWithInvalidFormat,
          mockTenantEnvironment as ICreateTenantEnvironmentNoInternalPropertiesDto
        );
      } catch (error) {
        thrown = error;
      }

      expect(thrown).toBeInstanceOf(ValidationError);
      expect((thrown as ValidationError).details).toEqual(
        mockThrownError.details
      );
      expect((thrown as ValidationError).context).toEqual(
        mockThrownError.context
      );

      expect(loggerSpyInfo).toHaveBeenCalledTimes(1);
      expect(loggerSpyInfo).toHaveBeenCalledWith(
        `create environment in tenant ${tenantIdWithInvalidFormat}`
      );
      expect(loggerSpyError).toHaveBeenCalledTimes(1);
      expect(loggerSpyError).toHaveBeenCalledWith(thrown);
    });

    it.each([
      [{}],
      [true],
      [10],
      [{ name: '', customProperties: '' }],
      [{ name: undefined, customProperties: undefined }],
      [{ name: 2, customProperties: 3 }],
    ])(
      'should fail to create a new tenant environment due to validation error (%p)',
      async (mockTenantEnvironmentInfo) => {
        const mockTenantId = faker.string.uuid();
        const tenantEnvironmentService = new TenantEnvironmentService(
          mockTenantEnvironmentRepository
        );

        const loggerSpyInfo = jest.spyOn(
          (
            tenantEnvironmentService as unknown as {
              logger: { info: typeof jest.fn };
            }
          ).logger,
          'info'
        );
        const loggerSpyError = jest.spyOn(
          (
            tenantEnvironmentService as unknown as {
              logger: { error: typeof jest.fn };
            }
          ).logger,
          'error'
        );

        await expect(
          tenantEnvironmentService.create(
            mockTenantId,
            mockTenantEnvironmentInfo as ICreateTenantEnvironmentDto
          )
        ).rejects.toThrow(ValidationError);

        expect(loggerSpyInfo).toHaveBeenCalledTimes(1);
        expect(loggerSpyInfo).toHaveBeenCalledWith(
          `create environment in tenant ${mockTenantId}`
        );
        expect(loggerSpyError).toHaveBeenCalledTimes(1);
      }
    );

    it('should fail to create a new tenant environment due to repository error', async () => {
      const mockTenantId = faker.string.uuid();
      const mockThrownError = new UnexpectedError({
        details: { message: 'repository-failure' },
      });

      mockTenantEnvironmentRepository.create.mockRejectedValueOnce(
        mockThrownError
      );

      const mockTenantEnvironment = {
        name: faker.word.noun(),
        customProperties: {},
      };

      const tenantEnvironmentService = new TenantEnvironmentService(
        mockTenantEnvironmentRepository
      );

      const loggerSpyInfo = jest.spyOn(
        (
          tenantEnvironmentService as unknown as {
            logger: { info: typeof jest.fn };
          }
        ).logger,
        'info'
      );
      const loggerSpyError = jest.spyOn(
        (
          tenantEnvironmentService as unknown as {
            logger: { error: typeof jest.fn };
          }
        ).logger,
        'error'
      );

      let thrown;
      try {
        await tenantEnvironmentService.create(
          mockTenantId,
          mockTenantEnvironment
        );
      } catch (error) {
        thrown = error;
      }

      expect(thrown).toBeInstanceOf(UnexpectedError);
      expect((thrown as UnexpectedError).details).toEqual(
        mockThrownError.details
      );

      expect(loggerSpyInfo).toHaveBeenCalledTimes(1);
      expect(loggerSpyInfo).toHaveBeenCalledWith(
        `create environment in tenant ${mockTenantId}`
      );
      expect(loggerSpyError).toHaveBeenCalledTimes(1);
    });

    it('should create a new tenant environment', async () => {
      const mockTenantId = faker.string.uuid();
      const mockTenantEnvironment = {
        name: faker.word.noun(),
        customProperties: {},
      };

      const mockTenantEnvironmentId = faker.string.uuid();

      mockTenantEnvironmentRepository.create.mockResolvedValueOnce(
        mockTenantEnvironmentId
      );

      const tenantEnvironmentService = new TenantEnvironmentService(
        mockTenantEnvironmentRepository
      );

      const loggerSpyInfo = jest.spyOn(
        (
          tenantEnvironmentService as unknown as {
            logger: { info: typeof jest.fn };
          }
        ).logger,
        'info'
      );
      const loggerSpyError = jest.spyOn(
        (
          tenantEnvironmentService as unknown as {
            logger: { error: typeof jest.fn };
          }
        ).logger,
        'error'
      );

      const result = await tenantEnvironmentService.create(
        mockTenantId,
        mockTenantEnvironment
      );

      expect(result).toEqual(mockTenantEnvironmentId);

      expect(loggerSpyInfo).toHaveBeenCalledTimes(2);
      expect(loggerSpyInfo).toHaveBeenNthCalledWith(
        1,
        `create environment in tenant ${mockTenantId}`
      );
      expect(loggerSpyInfo).toHaveBeenNthCalledWith(
        2,
        `new environment created: ${mockTenantEnvironmentId}`
      );
      expect(loggerSpyError).not.toHaveBeenCalled();
    });
  });

  describe('getById', () => {
    it('should retrieve a tenant environment', async () => {
      const mockTenantEnvironment: IGetTenantEnvironmentDto = {
        id: faker.string.uuid(),
        name: faker.word.noun(),
        tenantId: faker.string.uuid(),
        customProperties: {
          customProp1: 'value 1',
          customProp2: 'value 2',
        },
      };

      mockTenantEnvironmentRepository.getById.mockResolvedValue(
        mockTenantEnvironment
      );

      const tenantEnvironmentService = new TenantEnvironmentService(
        mockTenantEnvironmentRepository as unknown as ITenantEnvironmentRepository
      );

      const loggerSpyInfo = jest.spyOn(
        (
          tenantEnvironmentService as unknown as {
            logger: { info: typeof jest.fn };
          }
        ).logger,
        'info'
      );
      const loggerSpyError = jest.spyOn(
        (
          tenantEnvironmentService as unknown as {
            logger: { error: typeof jest.fn };
          }
        ).logger,
        'error'
      );

      const result = await tenantEnvironmentService.getById(
        mockTenantEnvironment.id
      );

      expect(result).toEqual(mockTenantEnvironment);
      expect(loggerSpyInfo).toHaveBeenCalledTimes(1);
      expect(loggerSpyInfo).toHaveBeenCalledWith(
        `getById: ${mockTenantEnvironment.id}`
      );
      expect(loggerSpyError).toHaveBeenCalledTimes(0);
    });

    it('should return undefined when the tenant environment was not found', async () => {
      const mockTenantEnvironmentId = faker.string.uuid();
      const mockTenantEnvironment = undefined;

      mockTenantEnvironmentRepository.getById.mockResolvedValue(
        mockTenantEnvironment
      );

      const tenantEnvironmentService = new TenantEnvironmentService(
        mockTenantEnvironmentRepository as unknown as ITenantEnvironmentRepository
      );

      const loggerSpyInfo = jest.spyOn(
        (
          tenantEnvironmentService as unknown as {
            logger: { info: typeof jest.fn };
          }
        ).logger,
        'info'
      );
      const loggerSpyError = jest.spyOn(
        (
          tenantEnvironmentService as unknown as {
            logger: { error: typeof jest.fn };
          }
        ).logger,
        'error'
      );

      const result = await tenantEnvironmentService.getById(
        mockTenantEnvironmentId
      );

      expect(result).toEqual(mockTenantEnvironment);
      expect(loggerSpyInfo).toHaveBeenCalledTimes(1);
      expect(loggerSpyInfo).toHaveBeenCalledWith(
        `getById: ${mockTenantEnvironmentId}`
      );
      expect(loggerSpyError).toHaveBeenCalledTimes(0);
    });

    it('should fail by not sending a valid tenant environment id (uuid)', async () => {
      const faultyTenantEnvironmentId = 'thisshouldbeauuid';
      const expectedValidationError = {
        details: {
          input: { id: faultyTenantEnvironmentId },
          errors: { id: 'field value is invalid' },
        },
        context: contexts.TENANT_ENVIRONMENT_GET_BY_ID,
      };

      const tenantEnvironmentService = new TenantEnvironmentService(
        mockTenantEnvironmentRepository as unknown as ITenantEnvironmentRepository
      );

      const loggerSpyInfo = jest.spyOn(
        (
          tenantEnvironmentService as unknown as {
            logger: { info: typeof jest.fn };
          }
        ).logger,
        'info'
      );
      const loggerSpyError = jest.spyOn(
        (
          tenantEnvironmentService as unknown as {
            logger: { error: typeof jest.fn };
          }
        ).logger,
        'error'
      );

      let thrown;

      try {
        await tenantEnvironmentService.getById(faultyTenantEnvironmentId);
      } catch (error) {
        thrown = error;
      }

      expect(thrown).toBeInstanceOf(ValidationError);
      expect((thrown as ValidationError).details).toEqual(
        expectedValidationError.details
      );
      expect((thrown as ValidationError).context).toEqual(
        expectedValidationError.context
      );

      expect(loggerSpyInfo).toHaveBeenCalledTimes(1);
      expect(loggerSpyInfo).toHaveBeenCalledWith(
        `getById: ${faultyTenantEnvironmentId}`
      );
      expect(loggerSpyError).toHaveBeenCalledTimes(1);
    });
  });

  describe('deleteById', () => {
    it('should delete a tenant environment', async () => {
      const mockTenantEnvironmentId = faker.string.uuid();
      const mockResult = true;

      mockTenantEnvironmentRepository.deleteById.mockResolvedValue(mockResult);

      const tenantEnvironmentService = new TenantEnvironmentService(
        mockTenantEnvironmentRepository as unknown as ITenantEnvironmentRepository
      );

      const loggerSpyInfo = jest.spyOn(
        (
          tenantEnvironmentService as unknown as {
            logger: { info: typeof jest.fn };
          }
        ).logger,
        'info'
      );
      const loggerSpyError = jest.spyOn(
        (
          tenantEnvironmentService as unknown as {
            logger: { error: typeof jest.fn };
          }
        ).logger,
        'error'
      );

      const result = await tenantEnvironmentService.deleteById(
        mockTenantEnvironmentId
      );

      expect(result).toBe(mockResult);
      expect(loggerSpyInfo).toHaveBeenCalledTimes(1);
      expect(loggerSpyInfo).toHaveBeenCalledWith(
        `deleteById: ${mockTenantEnvironmentId}`
      );
      expect(loggerSpyError).toHaveBeenCalledTimes(0);
    });

    it('should fail by not sending a valid tenant environment id (uuid)', async () => {
      const mockTenantEnvironmentId = 'thisshouldbeauuid';
      const expectedValidationError = {
        details: {
          input: { id: mockTenantEnvironmentId },
          errors: { id: 'field value is invalid' },
        },
        context: contexts.TENANT_ENVIRONMENT_DELETE_BY_ID,
      };

      const tenantEnvironmentService = new TenantEnvironmentService(
        mockTenantEnvironmentRepository as unknown as ITenantEnvironmentRepository
      );

      const loggerSpyInfo = jest.spyOn(
        (
          tenantEnvironmentService as unknown as {
            logger: { info: typeof jest.fn };
          }
        ).logger,
        'info'
      );
      const loggerSpyError = jest.spyOn(
        (
          tenantEnvironmentService as unknown as {
            logger: { error: typeof jest.fn };
          }
        ).logger,
        'error'
      );

      let thrown;

      try {
        await tenantEnvironmentService.deleteById(mockTenantEnvironmentId);
      } catch (error) {
        thrown = error;
      }

      expect(thrown).toBeInstanceOf(ValidationError);
      expect((thrown as ValidationError).details).toEqual(
        expectedValidationError.details
      );
      expect((thrown as ValidationError).context).toEqual(
        expectedValidationError.context
      );

      expect(loggerSpyInfo).toHaveBeenCalledTimes(1);
      expect(loggerSpyInfo).toHaveBeenCalledWith(
        `deleteById: ${mockTenantEnvironmentId}`
      );
      expect(loggerSpyError).toHaveBeenCalledTimes(1);
    });
  });

  describe('update', () => {
    describe('updateNonSensitivePropertiesById', () => {
      it.each([
        [
          {
            name: faker.word.noun(),
          },
        ],
      ])('should update non sensitive properties ', async (dto) => {
        const mockTenantEnvironmentId = faker.string.uuid();
        const mockUpdateTenanEnvironmentDto: IUpdateTenantEnvironmentNonSensitivePropertiesDto =
          dto;
        const mockUpdateTenantEnvironmentResult = true;

        mockTenantEnvironmentRepository.updateById.mockResolvedValue(
          mockUpdateTenantEnvironmentResult
        );

        const tenantEnvironmentService = new TenantEnvironmentService(
          mockTenantEnvironmentRepository as unknown as ITenantEnvironmentRepository
        );

        const loggerSpyInfo = jest.spyOn(
          (
            tenantEnvironmentService as unknown as {
              logger: { info: typeof jest.fn };
            }
          ).logger,
          'info'
        );
        const loggerSpyError = jest.spyOn(
          (
            tenantEnvironmentService as unknown as {
              logger: { error: typeof jest.fn };
            }
          ).logger,
          'error'
        );

        const result =
          await tenantEnvironmentService.updateNonSensitivePropertiesById(
            mockTenantEnvironmentId,
            mockUpdateTenanEnvironmentDto
          );

        expect(result).toEqual(mockUpdateTenantEnvironmentResult);
        expect(loggerSpyInfo).toHaveBeenCalledTimes(1);
        expect(loggerSpyInfo).toHaveBeenCalledWith(
          `updateNonSensitivePropertiesById: ${mockTenantEnvironmentId}`
        );
        expect(loggerSpyError).toHaveBeenCalledTimes(0);
      });

      it.each([
        [
          {
            name: '',
          },
        ],
        [{}],
        [true],
        [3],
      ])(
        'should fail update a tenant environment _non sensitive properties_ by sending empty values (%p)',
        async (dto) => {
          const mockTenantEnvironmentId = faker.string.uuid();
          const mockUpdateTenanEnvironmentDto =
            dto as IUpdateTenantEnvironmentNonSensitivePropertiesDto;

          const tenantEnvironmentService = new TenantEnvironmentService(
            mockTenantEnvironmentRepository as unknown as ITenantEnvironmentRepository
          );

          const loggerSpyInfo = jest.spyOn(
            (
              tenantEnvironmentService as unknown as {
                logger: { info: typeof jest.fn };
              }
            ).logger,
            'info'
          );
          const loggerSpyError = jest.spyOn(
            (
              tenantEnvironmentService as unknown as {
                logger: { error: typeof jest.fn };
              }
            ).logger,
            'error'
          );

          let thrown;
          try {
            await tenantEnvironmentService.updateNonSensitivePropertiesById(
              mockTenantEnvironmentId,
              mockUpdateTenanEnvironmentDto
            );
          } catch (error) {
            thrown = error;
          }

          expect(thrown).toBeInstanceOf(ValidationError);
          expect((thrown as ValidationError).context).toEqual(
            contexts.TENANT_ENVIRONMENT_UPDATE_NON_SENSITIVE_PROPERTIES_BY_ID
          );

          expect(loggerSpyInfo).toHaveBeenCalledTimes(1);
          expect(loggerSpyInfo).toHaveBeenCalledWith(
            `updateNonSensitivePropertiesById: ${mockTenantEnvironmentId}`
          );
          expect(loggerSpyError).toHaveBeenCalledTimes(1);
        }
      );

      it('should fail by not sending a valid tenant environment id (uuid)', async () => {
        const mockTenantEnvironmentId = 'thisshouldbeauuid';
        const expectedValidationError = {
          details: {
            input: { id: mockTenantEnvironmentId },
            errors: { id: 'field value is invalid' },
          },
          context:
            contexts.TENANT_ENVIRONMENT_UPDATE_NON_SENSITIVE_PROPERTIES_BY_ID,
        };

        const tenantEnvironmentService = new TenantEnvironmentService(
          mockTenantEnvironmentRepository as unknown as ITenantEnvironmentRepository
        );

        const loggerSpyInfo = jest.spyOn(
          (
            tenantEnvironmentService as unknown as {
              logger: { info: typeof jest.fn };
            }
          ).logger,
          'info'
        );
        const loggerSpyError = jest.spyOn(
          (
            tenantEnvironmentService as unknown as {
              logger: { error: typeof jest.fn };
            }
          ).logger,
          'error'
        );

        let thrown;

        try {
          await tenantEnvironmentService.updateNonSensitivePropertiesById(
            mockTenantEnvironmentId,
            {} as IUpdateTenantEnvironmentNonSensitivePropertiesDto
          );
        } catch (error) {
          thrown = error;
        }

        expect(thrown).toBeInstanceOf(ValidationError);
        expect((thrown as ValidationError).details).toEqual(
          expectedValidationError.details
        );
        expect((thrown as ValidationError).context).toEqual(
          expectedValidationError.context
        );

        expect(loggerSpyInfo).toHaveBeenCalledTimes(1);
        expect(loggerSpyInfo).toHaveBeenCalledWith(
          `updateNonSensitivePropertiesById: ${mockTenantEnvironmentId}`
        );
        expect(loggerSpyError).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('customProperties', () => {
    describe('setCustomPropertyById', () => {
      it.each([
        [
          {
            customProperty1: faker.lorem.sentence(),
          },
        ],
        [
          {
            customProperty1: faker.number.int(),
          },
        ],
        [
          {
            customProperty1: true,
          },
        ],
        [
          {
            customProperty1: false,
          },
        ],
        [
          {
            customProperty1: [],
          },
        ],
        [
          {
            customProperty1: ['one', 2, 0x0003, false],
          },
        ],
        [
          {
            customProperty1: {
              sub1: true,
              sub2: 'false',
              sub3: { sub1: [1, 2, 3], sub2: new Date().toDateString() },
            },
          },
        ],
      ])('should set a custom property by id (%p)', async (dto) => {
        const mockTenantEnvironmentId = faker.string.uuid();
        const mockUpdateTenantEnvironmentDto =
          dto as unknown as ITenantEnvironmentCustomPropertiesOperationDtoSchema;

        const mockUpdateTenantEnvironmentResult = true;

        mockTenantEnvironmentRepository.setCustomPropertyById.mockResolvedValue(
          mockUpdateTenantEnvironmentResult
        );

        const tenantService = new TenantEnvironmentService(
          mockTenantEnvironmentRepository as unknown as ITenantEnvironmentRepository
        );

        const loggerSpyInfo = jest.spyOn(
          (tenantService as unknown as { logger: { info: typeof jest.fn } })
            .logger,
          'info'
        );
        const loggerSpyError = jest.spyOn(
          (tenantService as unknown as { logger: { error: typeof jest.fn } })
            .logger,
          'error'
        );

        const result = await tenantService.setCustomPropertyById(
          mockTenantEnvironmentId,
          mockUpdateTenantEnvironmentDto
        );

        expect(result).toEqual(mockUpdateTenantEnvironmentResult);
        expect(loggerSpyInfo).toHaveBeenCalledTimes(1);
        expect(loggerSpyInfo).toHaveBeenCalledWith(
          `setCustomPropertyById: ${mockTenantEnvironmentId}`
        );
        expect(loggerSpyError).toHaveBeenCalledTimes(0);
      });

      it.each([
        [
          {
            customProperty1: undefined,
          },
        ],
        [
          {
            customProperty1: [undefined],
          },
        ],
        [
          {
            customProperty1: {
              sub1: true,
              sub2: 'false',
              sub3: { sub1: [1, 2, 3], sub2: undefined },
            },
          },
        ],
      ])(
        'should fail by trting to set invalid (undefined) property values (%p)',
        async (dto) => {
          const mockTenantEnvironmentId = faker.string.uuid();
          const mockUpdateTenantEnvironmentDto =
            dto as unknown as ITenantEnvironmentCustomPropertiesOperationDtoSchema;
          const expectedValidationError = {
            details: {
              input: { ...mockUpdateTenantEnvironmentDto },
              errors: { customProperties: 'field value is invalid' },
            },
            context: contexts.TENANT_ENVIRONMENT_SET_CUSTOM_PROPERTY_BY_ID,
          };

          const mockUpdateTenantEnvironmentResult = true;

          mockTenantEnvironmentRepository.updateById.mockResolvedValue(
            mockUpdateTenantEnvironmentResult
          );

          const tenantService = new TenantEnvironmentService(
            mockTenantEnvironmentRepository as unknown as ITenantEnvironmentRepository
          );

          const loggerSpyInfo = jest.spyOn(
            (tenantService as unknown as { logger: { info: typeof jest.fn } })
              .logger,
            'info'
          );
          const loggerSpyError = jest.spyOn(
            (tenantService as unknown as { logger: { error: typeof jest.fn } })
              .logger,
            'error'
          );

          let thrown;
          try {
            await tenantService.setCustomPropertyById(
              mockTenantEnvironmentId,
              mockUpdateTenantEnvironmentDto
            );
          } catch (error) {
            thrown = error;
          }

          expect(thrown).toBeInstanceOf(ValidationError);
          expect((thrown as ValidationError).details).toEqual(
            expectedValidationError.details
          );
          expect((thrown as ValidationError).context).toEqual(
            expectedValidationError.context
          );

          expect(loggerSpyInfo).toHaveBeenCalledTimes(1);
          expect(loggerSpyInfo).toHaveBeenCalledWith(
            `setCustomPropertyById: ${mockTenantEnvironmentId}`
          );
          expect(loggerSpyError).toHaveBeenCalledTimes(1);
        }
      );

      it('should fail by not sending a valid tenant id (uuid)', async () => {
        const faultyTenantEnvironmentId = 'thisshouldbeauuid';
        const expectedValidationError = {
          details: {
            input: { id: faultyTenantEnvironmentId },
            errors: { id: 'field value is invalid' },
          },
          context: contexts.TENANT_ENVIRONMENT_SET_CUSTOM_PROPERTY_BY_ID,
        };

        const tenantService = new TenantEnvironmentService(
          mockTenantEnvironmentRepository
        );

        const loggerSpyInfo = jest.spyOn(
          (tenantService as unknown as { logger: { info: typeof jest.fn } })
            .logger,
          'info'
        );
        const loggerSpyError = jest.spyOn(
          (tenantService as unknown as { logger: { error: typeof jest.fn } })
            .logger,
          'error'
        );

        let thrown;

        try {
          await tenantService.setCustomPropertyById(
            faultyTenantEnvironmentId,
            {} as ITenantEnvironmentCustomPropertiesOperationDtoSchema
          );
        } catch (error) {
          thrown = error;
        }

        expect(thrown).toBeInstanceOf(ValidationError);
        expect((thrown as ValidationError).details).toEqual(
          expectedValidationError.details
        );
        expect((thrown as ValidationError).context).toEqual(
          expectedValidationError.context
        );

        expect(loggerSpyInfo).toHaveBeenCalledTimes(1);
        expect(loggerSpyInfo).toHaveBeenCalledWith(
          `setCustomPropertyById: ${faultyTenantEnvironmentId}`
        );
        expect(loggerSpyError).toHaveBeenCalledTimes(1);
      });
    });

    describe('deleteCustomPropertyById', () => {
      it('should delete a custom property by id', async () => {
        const mockTenantEnvironmentId = faker.string.uuid();
        const customPropertyKey = 'customProperty1';

        const mockUpdateTenantEnvironmentResult = true;

        mockTenantEnvironmentRepository.deleteCustomPropertyById.mockResolvedValue(
          mockUpdateTenantEnvironmentResult
        );

        const tenantService = new TenantEnvironmentService(
          mockTenantEnvironmentRepository as unknown as ITenantEnvironmentRepository
        );

        const loggerSpyInfo = jest.spyOn(
          (tenantService as unknown as { logger: { info: typeof jest.fn } })
            .logger,
          'info'
        );
        const loggerSpyError = jest.spyOn(
          (tenantService as unknown as { logger: { error: typeof jest.fn } })
            .logger,
          'error'
        );

        const result = await tenantService.deleteCustomPropertyById(
          mockTenantEnvironmentId,
          customPropertyKey
        );

        expect(result).toEqual(mockUpdateTenantEnvironmentResult);
        expect(loggerSpyInfo).toHaveBeenCalledTimes(1);
        expect(loggerSpyInfo).toHaveBeenCalledWith(
          `deleteCustomPropertyById: ${mockTenantEnvironmentId}`
        );
        expect(loggerSpyError).toHaveBeenCalledTimes(0);
      });

      it.each([[''], [true], [3], [{}], [0x032], [undefined]])(
        'should fail by not sending a valid custom property key (string)',
        async (dto) => {
          const faultyTenantEnvironmentId = 'thisshouldbeauuid';
          const customPropertyKey = dto as unknown as string;
          const expectedValidationError = {
            details: {
              input: { id: faultyTenantEnvironmentId },
              errors: { id: 'field value is invalid' },
            },
            context: contexts.TENANT_ENVIRONMENT_DELETE_CUSTOM_PROPERTY_BY_ID,
          };

          const tenantService = new TenantEnvironmentService(
            mockTenantEnvironmentRepository
          );

          const loggerSpyInfo = jest.spyOn(
            (tenantService as unknown as { logger: { info: typeof jest.fn } })
              .logger,
            'info'
          );
          const loggerSpyError = jest.spyOn(
            (tenantService as unknown as { logger: { error: typeof jest.fn } })
              .logger,
            'error'
          );

          let thrown;

          try {
            await tenantService.deleteCustomPropertyById(
              faultyTenantEnvironmentId,
              customPropertyKey
            );
          } catch (error) {
            thrown = error;
          }

          expect(thrown).toBeInstanceOf(ValidationError);
          expect((thrown as ValidationError).details).toEqual(
            expectedValidationError.details
          );
          expect((thrown as ValidationError).context).toEqual(
            expectedValidationError.context
          );

          expect(loggerSpyInfo).toHaveBeenCalledTimes(1);
          expect(loggerSpyInfo).toHaveBeenCalledWith(
            `deleteCustomPropertyById: ${faultyTenantEnvironmentId}`
          );
          expect(loggerSpyError).toHaveBeenCalledTimes(1);
        }
      );

      it('should fail by not sending a valid tenant id (uuid)', async () => {
        const faultyTenantEnvironmentId = 'thisshouldbeauuid';
        const customPropertyKey = 'customProperty1';
        const expectedValidationError = {
          details: {
            input: { id: faultyTenantEnvironmentId },
            errors: { id: 'field value is invalid' },
          },
          context: contexts.TENANT_ENVIRONMENT_DELETE_CUSTOM_PROPERTY_BY_ID,
        };

        const tenantService = new TenantEnvironmentService(
          mockTenantEnvironmentRepository
        );

        const loggerSpyInfo = jest.spyOn(
          (tenantService as unknown as { logger: { info: typeof jest.fn } })
            .logger,
          'info'
        );
        const loggerSpyError = jest.spyOn(
          (tenantService as unknown as { logger: { error: typeof jest.fn } })
            .logger,
          'error'
        );

        let thrown;

        try {
          await tenantService.deleteCustomPropertyById(
            faultyTenantEnvironmentId,
            customPropertyKey
          );
        } catch (error) {
          thrown = error;
        }

        expect(thrown).toBeInstanceOf(ValidationError);
        expect((thrown as ValidationError).details).toEqual(
          expectedValidationError.details
        );
        expect((thrown as ValidationError).context).toEqual(
          expectedValidationError.context
        );

        expect(loggerSpyInfo).toHaveBeenCalledTimes(1);
        expect(loggerSpyInfo).toHaveBeenCalledWith(
          `deleteCustomPropertyById: ${faultyTenantEnvironmentId}`
        );
        expect(loggerSpyError).toHaveBeenCalledTimes(1);
      });
    });
  });
});
