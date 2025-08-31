import { faker } from '@faker-js/faker';
import { contexts } from '../../lib/contexts';
import { UnexpectedError, ValidationError } from '../../lib/errors';
import { TenantService } from './tenant.service';
import {
  ICreateTenantDto,
  IGetTenantDto,
  ITenantCustomPropertiesOperationDtoSchema,
  IUpdateTenantNonSensitivePropertiesDto,
} from './types/dto.type';
import { ITenantRepository } from './types/repository.type';

describe('Tenant Service', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  const mockTenantRepository = {
    create: jest.fn(),
    getById: jest.fn(),
    deleteById: jest.fn(),
    updateById: jest.fn(),
    setCustomPropertyById: jest.fn(),
    deleteCustomPropertyById: jest.fn(),
  };

  describe('create', () => {
    it.each([
      [{}],
      [true],
      [10],
      [{ name: '', customProperties: '' }],
      [{ name: undefined, customProperties: undefined }],
      [{ name: 2, customProperties: 3 }],
    ])(
      'should fail to create a new tenant due to validation error (%p)',
      async (mockTenantInfo) => {
        const tenantService = new TenantService(mockTenantRepository);

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

        await expect(
          tenantService.create(mockTenantInfo as ICreateTenantDto)
        ).rejects.toThrow(ValidationError);

        expect(loggerSpyInfo).toHaveBeenCalledTimes(1);
        expect(loggerSpyInfo).toHaveBeenCalledWith('create new tenant');
        expect(loggerSpyError).toHaveBeenCalledTimes(1);
      }
    );

    it('should fail to create a new tenant due to repository error', async () => {
      const mockThrownError = new UnexpectedError({
        details: { message: 'repository-failure' },
      });
      mockTenantRepository.create.mockRejectedValueOnce(mockThrownError);

      const mockTenant = {
        name: 'this tenant name',
        customProperties: {},
      };

      const tenantService = new TenantService(mockTenantRepository);

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
        await tenantService.create(mockTenant);
      } catch (error) {
        thrown = error;
      }

      expect(thrown).toBeInstanceOf(UnexpectedError);
      expect((thrown as UnexpectedError).details).toEqual(
        mockThrownError.details
      );

      expect(loggerSpyInfo).toHaveBeenCalledTimes(1);
      expect(loggerSpyInfo).toHaveBeenCalledWith('create new tenant');
      expect(loggerSpyError).toHaveBeenCalledTimes(1);
    });

    it('should create a new tenant', async () => {
      const mockTenant = {
        name: 'this tenant name',
        customProperties: {},
      };

      const mockTenantId = faker.string.uuid();

      mockTenantRepository.create.mockResolvedValueOnce(mockTenantId);

      const tenantService = new TenantService(mockTenantRepository);

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

      const result = await tenantService.create(mockTenant);

      expect(result).toEqual(mockTenantId);

      expect(loggerSpyInfo).toHaveBeenCalledTimes(2);
      expect(loggerSpyInfo).toHaveBeenNthCalledWith(1, 'create new tenant');
      expect(loggerSpyInfo).toHaveBeenNthCalledWith(
        2,
        `new tenant created: ${mockTenantId}`
      );
      expect(loggerSpyError).not.toHaveBeenCalled();
    });
  });

  describe('getById', () => {
    it('should retrieve a tenant', async () => {
      const mockTenantId = faker.string.uuid();
      const mockTenant: IGetTenantDto = {
        id: mockTenantId,
        name: 'this tenant name',
        customProperties: {
          customProp1: 'value 1',
          customProp2: 'value 2',
        },
      };

      mockTenantRepository.getById.mockResolvedValue(mockTenant);

      const tenantService = new TenantService(
        mockTenantRepository as unknown as ITenantRepository
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

      const result = await tenantService.getById(mockTenant.id);

      expect(result).toEqual(mockTenant);
      expect(loggerSpyInfo).toHaveBeenCalledTimes(1);
      expect(loggerSpyInfo).toHaveBeenCalledWith(`getById: ${mockTenantId}`);
      expect(loggerSpyError).toHaveBeenCalledTimes(0);
    });

    it('should return undefined when the tenant was not found', async () => {
      const mockTenantId = faker.string.uuid();
      const mockTenant = undefined;
      // @TODO: spy on this method so we assert number of calls and arguments passed
      mockTenantRepository.getById.mockResolvedValue(mockTenant);

      const tenantService = new TenantService(
        mockTenantRepository as unknown as ITenantRepository
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

      const result = await tenantService.getById(mockTenantId);

      expect(result).toEqual(mockTenant);

      expect(loggerSpyInfo).toHaveBeenCalledTimes(1);
      expect(loggerSpyInfo).toHaveBeenCalledWith(`getById: ${mockTenantId}`);
      expect(loggerSpyError).toHaveBeenCalledTimes(0);
    });

    it('should fail by not sending a valid tenant id (uuid)', async () => {
      const faultyTenantId = 'thisshouldbeauuid';
      const expectedValidationError = {
        details: {
          input: { id: faultyTenantId },
          errors: { id: 'field value is invalid' },
        },
        context: contexts.TENANT_GET_BY_ID,
      };

      const tenantService = new TenantService(mockTenantRepository);

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
        await tenantService.getById(faultyTenantId);
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
      expect(loggerSpyInfo).toHaveBeenCalledWith(`getById: ${faultyTenantId}`);
      expect(loggerSpyError).toHaveBeenCalledTimes(1);
    });
  });

  describe('deleteById', () => {
    it('should delete a tenant', async () => {
      const mockTenantId = faker.string.uuid();
      const mockResult = true;

      mockTenantRepository.deleteById.mockResolvedValue(mockResult);

      const tenantService = new TenantService(
        mockTenantRepository as unknown as ITenantRepository
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

      const result = await tenantService.deleteById(mockTenantId);

      expect(result).toBe(mockResult);
      expect(loggerSpyInfo).toHaveBeenCalledTimes(1);
      expect(loggerSpyInfo).toHaveBeenCalledWith(`deleteById: ${mockTenantId}`);
      expect(loggerSpyError).toHaveBeenCalledTimes(0);
    });

    it('should fail by not sending a valid tenant id (uuid)', async () => {
      const faultyTenantId = 'thisshouldbeauuid';
      const expectedValidationError = {
        details: {
          input: { id: faultyTenantId },
          errors: { id: 'field value is invalid' },
        },
        context: contexts.TENANT_DELETE_BY_ID,
      };

      const tenantService = new TenantService(mockTenantRepository);

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
        await tenantService.deleteById(faultyTenantId);
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
        `deleteById: ${faultyTenantId}`
      );
      expect(loggerSpyError).toHaveBeenCalledTimes(1);
    });
  });

  describe('update', () => {
    describe('updateNonSensitivePropertiesById', () => {
      it.each([
        [
          {
            name: faker.person.fullName(),
          },
        ],
      ])('should update non sensitive properties ', async (dto) => {
        const mockTenantId = faker.string.uuid();
        const mockUpdateTenantDto: IUpdateTenantNonSensitivePropertiesDto = dto;
        const mockUpdateTenantResult = true;

        mockTenantRepository.updateById.mockResolvedValue(
          mockUpdateTenantResult
        );

        const tenantService = new TenantService(
          mockTenantRepository as unknown as ITenantRepository
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

        const result = await tenantService.updateNonSensitivePropertiesById(
          mockTenantId,
          mockUpdateTenantDto
        );

        expect(result).toEqual(mockUpdateTenantResult);
        expect(loggerSpyInfo).toHaveBeenCalledTimes(1);
        expect(loggerSpyInfo).toHaveBeenCalledWith(
          `updateNonSensitivePropertiesById: ${mockTenantId}`
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
        'should fail update a tenant _non sensitive properties_ by sending empty values (%p)',
        async (dto) => {
          const mockTenantId = faker.string.uuid();
          const mockUpdateTenantDto =
            dto as IUpdateTenantNonSensitivePropertiesDto;

          const tenantService = new TenantService(
            mockTenantRepository as unknown as ITenantRepository
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
            await tenantService.updateNonSensitivePropertiesById(
              mockTenantId,
              mockUpdateTenantDto
            );
          } catch (error) {
            thrown = error;
          }

          expect(thrown).toBeInstanceOf(ValidationError);
          expect((thrown as ValidationError).context).toEqual(
            contexts.TENANT_UPDATE_NON_SENSITIVE_PROPERTIES_BY_ID
          );

          expect(loggerSpyInfo).toHaveBeenCalledTimes(1);
          expect(loggerSpyInfo).toHaveBeenCalledWith(
            `updateNonSensitivePropertiesById: ${mockTenantId}`
          );
          expect(loggerSpyError).toHaveBeenCalledTimes(1);
        }
      );

      it('should fail by not sending a valid tenant id (uuid)', async () => {
        const faultyTenantId = 'thisshouldbeauuid';
        const expectedValidationError = {
          details: {
            input: { id: faultyTenantId },
            errors: { id: 'field value is invalid' },
          },
          context: contexts.TENANT_UPDATE_NON_SENSITIVE_PROPERTIES_BY_ID,
        };

        const tenantService = new TenantService(mockTenantRepository);

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
          await tenantService.updateNonSensitivePropertiesById(
            faultyTenantId,
            {} as IUpdateTenantNonSensitivePropertiesDto
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
          `updateNonSensitivePropertiesById: ${faultyTenantId}`
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
        const mockTenantId = faker.string.uuid();
        const mockUpdateTenantDto =
          dto as unknown as ITenantCustomPropertiesOperationDtoSchema;

        const mockUpdateTenantResult = true;

        mockTenantRepository.setCustomPropertyById.mockResolvedValue(
          mockUpdateTenantResult
        );

        const tenantService = new TenantService(
          mockTenantRepository as unknown as ITenantRepository
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
          mockTenantId,
          mockUpdateTenantDto
        );

        expect(result).toEqual(mockUpdateTenantResult);
        expect(loggerSpyInfo).toHaveBeenCalledTimes(1);
        expect(loggerSpyInfo).toHaveBeenCalledWith(
          `setCustomPropertyById: ${mockTenantId}`
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
          const mockTenantId = faker.string.uuid();
          const mockUpdateTenantDto =
            dto as unknown as ITenantCustomPropertiesOperationDtoSchema;
          const expectedValidationError = {
            details: {
              input: { ...mockUpdateTenantDto },
              errors: { customProperties: 'field value is invalid' },
            },
            context: contexts.TENANT_SET_CUSTOM_PROPERTY_BY_ID,
          };

          const mockUpdateTenantResult = true;

          mockTenantRepository.updateById.mockResolvedValue(
            mockUpdateTenantResult
          );

          const tenantService = new TenantService(
            mockTenantRepository as unknown as ITenantRepository
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
              mockTenantId,
              mockUpdateTenantDto
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
            `setCustomPropertyById: ${mockTenantId}`
          );
          expect(loggerSpyError).toHaveBeenCalledTimes(1);
        }
      );

      it('should fail by not sending a valid tenant id (uuid)', async () => {
        const faultyTenantId = 'thisshouldbeauuid';
        const expectedValidationError = {
          details: {
            input: { id: faultyTenantId },
            errors: { id: 'field value is invalid' },
          },
          context: contexts.TENANT_SET_CUSTOM_PROPERTY_BY_ID,
        };

        const tenantService = new TenantService(mockTenantRepository);

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
            faultyTenantId,
            {} as ITenantCustomPropertiesOperationDtoSchema
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
          `setCustomPropertyById: ${faultyTenantId}`
        );
        expect(loggerSpyError).toHaveBeenCalledTimes(1);
      });
    });

    describe('deleteCustomPropertyById', () => {
      it('should delete a custom property by id', async () => {
        const mockTenantId = faker.string.uuid();
        const customPropertyKey = 'customProperty1';

        const mockUpdateTenantResult = true;

        mockTenantRepository.deleteCustomPropertyById.mockResolvedValue(
          mockUpdateTenantResult
        );

        const tenantService = new TenantService(
          mockTenantRepository as unknown as ITenantRepository
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
          mockTenantId,
          customPropertyKey
        );

        expect(result).toEqual(mockUpdateTenantResult);
        expect(loggerSpyInfo).toHaveBeenCalledTimes(1);
        expect(loggerSpyInfo).toHaveBeenCalledWith(
          `deleteCustomPropertyById: ${mockTenantId}`
        );
        expect(loggerSpyError).toHaveBeenCalledTimes(0);
      });

      it.each([[''], [true], [3], [{}], [0x032], [undefined]])(
        'should fail by not sending a valid custom property key (string)',
        async (dto) => {
          const faultyTenantId = 'thisshouldbeauuid';
          const customPropertyKey = dto as unknown as string;
          const expectedValidationError = {
            details: {
              input: { id: faultyTenantId },
              errors: { id: 'field value is invalid' },
            },
            context: contexts.TENANT_DELETE_CUSTOM_PROPERTY_BY_ID,
          };

          const tenantService = new TenantService(mockTenantRepository);

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
              faultyTenantId,
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
            `deleteCustomPropertyById: ${faultyTenantId}`
          );
          expect(loggerSpyError).toHaveBeenCalledTimes(1);
        }
      );

      it('should fail by not sending a valid tenant id (uuid)', async () => {
        const faultyTenantId = 'thisshouldbeauuid';
        const customPropertyKey = 'customProperty1';
        const expectedValidationError = {
          details: {
            input: { id: faultyTenantId },
            errors: { id: 'field value is invalid' },
          },
          context: contexts.TENANT_DELETE_CUSTOM_PROPERTY_BY_ID,
        };

        const tenantService = new TenantService(mockTenantRepository);

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
            faultyTenantId,
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
          `deleteCustomPropertyById: ${faultyTenantId}`
        );
        expect(loggerSpyError).toHaveBeenCalledTimes(1);
      });
    });
  });
});
