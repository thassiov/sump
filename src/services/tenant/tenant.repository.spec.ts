import { faker } from '@faker-js/faker';
import { Knex } from 'knex';
import { IInsertReturningId } from '../../infra/database/postgres/types';
import { contexts } from '../../lib/contexts';
import {
  NotExpectedError,
  NotFoundError,
  UnexpectedError,
} from '../../lib/errors';
import { TenantRepository } from './tenant.repository';
import {
  ICreateTenantDto,
  IGetTenantDto,
  IUpdateTenantNonSensitivePropertiesDto,
} from './types/dto.type';
import { ITenant } from './types/tenant.type';

describe('tenant.repository', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  describe('create', () => {
    it('creates a new tenant', async () => {
      const mockTenantId = faker.string.uuid();
      const mockDbResponse: IInsertReturningId = [{ id: mockTenantId }];
      const mockCreateTenantDto = {
        name: faker.company.name(),
        customProperties: {},
      } as ICreateTenantDto;

      const mockSendInsert = jest
        .spyOn(
          TenantRepository.prototype as unknown as {
            sendInsertReturningIdQuery: () => Promise<IInsertReturningId>;
          },
          'sendInsertReturningIdQuery'
        )
        .mockResolvedValueOnce(mockDbResponse);

      const instance = new TenantRepository({} as unknown as Knex);

      const result = await instance.create(mockCreateTenantDto);
      expect(result).toBe(mockTenantId);
      expect(mockSendInsert).toHaveBeenCalledTimes(1);
      expect(mockSendInsert).toHaveBeenCalledWith(
        mockCreateTenantDto,
        undefined
      );
    });

    it('fails to create a new tenant by receiving an empty response from the database', async () => {
      const mockDbResponse: IInsertReturningId = [];
      const mockCreateTenantDto = {
        name: faker.company.name(),
        customProperties: {},
      } as ICreateTenantDto;

      const mockThrownError = new NotExpectedError({
        context: contexts.TENANT_CREATE,
        details: {
          input: {
            ...mockCreateTenantDto,
          },
          output: undefined,
          message: 'database insert operation did not return an id',
        },
      });

      const mockSendInsert = jest
        .spyOn(
          TenantRepository.prototype as unknown as {
            sendInsertReturningIdQuery: () => Promise<IInsertReturningId>;
          },
          'sendInsertReturningIdQuery'
        )
        .mockResolvedValueOnce(mockDbResponse);

      const instance = new TenantRepository({} as unknown as Knex);

      let thrown;
      try {
        await instance.create(mockCreateTenantDto);
      } catch (error) {
        thrown = error;
      }

      expect(thrown).toBeInstanceOf(NotExpectedError);
      expect((thrown as NotExpectedError).cause).not.toBeDefined();
      expect((thrown as NotExpectedError).context).toEqual(
        mockThrownError.context
      );
      expect((thrown as NotExpectedError).details).toEqual(
        mockThrownError.details
      );
      expect(mockSendInsert).toHaveBeenCalledTimes(1);
      expect(mockSendInsert).toHaveBeenCalledWith(
        mockCreateTenantDto,
        undefined
      );
    });

    it('fails to create a new tenant by a error thrown by the database', async () => {
      const mockCreateTenantDto = {
        name: faker.company.name(),
        customProperties: {},
      } as ICreateTenantDto;

      const mockThrownError = new Error('some-other-error');
      const repositoryError = new UnexpectedError({
        cause: mockThrownError,
        context: contexts.TENANT_CREATE,
        details: {
          input: {
            ...mockCreateTenantDto,
          },
        },
      });

      const mockSendInsert = jest
        .spyOn(
          TenantRepository.prototype as unknown as {
            sendInsertReturningIdQuery: () => Promise<IInsertReturningId>;
          },
          'sendInsertReturningIdQuery'
        )
        .mockRejectedValueOnce(mockThrownError);

      const instance = new TenantRepository({} as unknown as Knex);

      let thrown;
      try {
        await instance.create(mockCreateTenantDto);
      } catch (error) {
        thrown = error;
      }

      expect(thrown).toBeInstanceOf(UnexpectedError);
      expect((thrown as UnexpectedError).cause).toEqual(mockThrownError);
      expect((thrown as UnexpectedError).context).toEqual(
        repositoryError.context
      );
      expect((thrown as UnexpectedError).details).toEqual(
        repositoryError.details
      );
      expect(mockSendInsert).toHaveBeenCalledTimes(1);
      expect(mockSendInsert).toHaveBeenCalledWith(
        mockCreateTenantDto,
        undefined
      );
    });
  });

  describe('getById', () => {
    it('gets an tenant by its id', async () => {
      const mockTenantId = faker.string.uuid();
      const mockDbResponse = {
        id: mockTenantId,
        name: faker.company.name(),
        customProperties: {},
      } as IGetTenantDto;

      const mockSendQuery = jest
        .spyOn(
          TenantRepository.prototype as unknown as {
            sendFindByIdQuery: () => Promise<IGetTenantDto | undefined>;
          },
          'sendFindByIdQuery'
        )
        .mockResolvedValueOnce(mockDbResponse);

      const instance = new TenantRepository({} as unknown as Knex);

      const result = await instance.getById(mockTenantId);
      expect(result).toBe(mockDbResponse);
      expect(mockSendQuery).toHaveBeenCalledTimes(1);
      expect(mockSendQuery).toHaveBeenCalledWith(mockTenantId);
    });

    it('gets an empty response as the tenant does not exist', async () => {
      const mockTenantId = faker.string.uuid();
      const mockDbResponse = undefined;

      const mockSendQuery = jest
        .spyOn(
          TenantRepository.prototype as unknown as {
            sendFindByIdQuery: () => Promise<ITenant | undefined>;
          },
          'sendFindByIdQuery'
        )
        .mockResolvedValueOnce(mockDbResponse);

      const instance = new TenantRepository({} as unknown as Knex);

      const result = await instance.getById(mockTenantId);
      expect(result).toBe(mockDbResponse);
      expect(mockSendQuery).toHaveBeenCalledTimes(1);
      expect(mockSendQuery).toHaveBeenCalledWith(mockTenantId);
    });

    it('fails to get an tenant by a error thrown by the database', async () => {
      const mockTenantId = faker.string.uuid();

      const mockThrownError = new Error('some-error');
      const repositoryError = new UnexpectedError({
        cause: mockThrownError,
        context: contexts.TENANT_GET_BY_ID,
        details: {
          input: {
            id: mockTenantId,
          },
        },
      });

      const mockSendQuery = jest
        .spyOn(
          TenantRepository.prototype as unknown as {
            sendFindByIdQuery: () => Promise<ITenant | undefined>;
          },
          'sendFindByIdQuery'
        )
        .mockRejectedValueOnce(mockThrownError);

      const instance = new TenantRepository({} as unknown as Knex);

      let thrown;
      try {
        await instance.getById(mockTenantId);
      } catch (error) {
        thrown = error;
      }

      expect(thrown).toBeInstanceOf(UnexpectedError);
      expect((thrown as UnexpectedError).cause).toEqual(mockThrownError);
      expect((thrown as UnexpectedError).context).toEqual(
        repositoryError.context
      );
      expect((thrown as UnexpectedError).details).toEqual(
        repositoryError.details
      );
      expect(mockSendQuery).toHaveBeenCalledTimes(1);
      expect(mockSendQuery).toHaveBeenCalledWith(mockTenantId);
    });
  });

  describe('updateById', () => {
    it('updates an tenant by its id', async () => {
      const mockTenantId = faker.string.uuid();
      const mockDbResponse = 1;
      const mockRepositoryResponse = true;

      const mockUpdateTenantDto = {
        name: faker.company.name(),
      } as IUpdateTenantNonSensitivePropertiesDto;

      const mockSendUpdate = jest
        .spyOn(
          TenantRepository.prototype as unknown as {
            sendUpdateByIdQuery: () => Promise<number>;
          },
          'sendUpdateByIdQuery'
        )
        .mockResolvedValueOnce(mockDbResponse);

      const instance = new TenantRepository({} as unknown as Knex);

      const result = await instance.updateById(
        mockTenantId,
        mockUpdateTenantDto
      );
      expect(result).toBe(mockRepositoryResponse);
      expect(mockSendUpdate).toHaveBeenCalledTimes(1);
      expect(mockSendUpdate).toHaveBeenCalledWith(
        mockTenantId,
        mockUpdateTenantDto
      );
    });

    it('fails to update an tenant by receiving an empty response from the database (tenant does not exist)', async () => {
      const mockTenantId = faker.string.uuid();
      const mockDbResponse = 0;

      const mockUpdateTenantDto = {
        name: faker.company.name(),
      } as IUpdateTenantNonSensitivePropertiesDto;

      const mockThrownError = new NotFoundError({
        context: contexts.TENANT_UPDATE_BY_ID,
        details: {
          input: {
            id: mockTenantId,
            ...mockUpdateTenantDto,
          },
        },
      });

      const mockSendUpdate = jest
        .spyOn(
          TenantRepository.prototype as unknown as {
            sendUpdateByIdQuery: () => Promise<number>;
          },
          'sendUpdateByIdQuery'
        )
        .mockResolvedValueOnce(mockDbResponse);

      const instance = new TenantRepository({} as unknown as Knex);

      let thrown;
      try {
        await instance.updateById(mockTenantId, mockUpdateTenantDto);
      } catch (error) {
        thrown = error;
      }

      expect(thrown).toBeInstanceOf(NotFoundError);
      expect((thrown as NotFoundError).context).toEqual(
        mockThrownError.context
      );
      expect((thrown as NotFoundError).details).toEqual(
        mockThrownError.details
      );
      expect(mockSendUpdate).toHaveBeenCalledTimes(1);
      expect(mockSendUpdate).toHaveBeenCalledWith(
        mockTenantId,
        mockUpdateTenantDto
      );
    });

    it('fails to update an tenant by a error thrown by the database', async () => {
      const mockTenantId = faker.string.uuid();
      const mockUpdateTenantDto = {
        name: faker.company.name(),
      } as IUpdateTenantNonSensitivePropertiesDto;

      const mockThrownError = new Error('some-error');
      const repositoryError = new UnexpectedError({
        cause: mockThrownError,
        context: contexts.TENANT_UPDATE_BY_ID,
        details: {
          input: {
            id: mockTenantId,
            ...mockUpdateTenantDto,
          },
        },
      });

      const mockSendUpdate = jest
        .spyOn(
          TenantRepository.prototype as unknown as {
            sendUpdateByIdQuery: () => Promise<number>;
          },
          'sendUpdateByIdQuery'
        )
        .mockRejectedValueOnce(mockThrownError);

      const instance = new TenantRepository({} as unknown as Knex);

      let thrown;
      try {
        await instance.updateById(mockTenantId, mockUpdateTenantDto);
      } catch (error) {
        thrown = error;
      }

      expect(thrown).toBeInstanceOf(UnexpectedError);
      expect((thrown as UnexpectedError).cause).toEqual(mockThrownError);
      expect((thrown as UnexpectedError).context).toEqual(
        repositoryError.context
      );
      expect((thrown as UnexpectedError).details).toEqual(
        repositoryError.details
      );
      expect(mockSendUpdate).toHaveBeenCalledTimes(1);
      expect(mockSendUpdate).toHaveBeenCalledWith(
        mockTenantId,
        mockUpdateTenantDto
      );
    });
  });

  describe('deleteById', () => {
    it('deletes a tenant by its id', async () => {
      const mockTenantId = faker.string.uuid();
      const mockDbResponse = 1;
      const mockRepositoryResponse = true;

      const mockSendQuery = jest
        .spyOn(
          TenantRepository.prototype as unknown as {
            sendDeleteByIdQuery: () => Promise<number>;
          },
          'sendDeleteByIdQuery'
        )
        .mockResolvedValueOnce(mockDbResponse);

      const instance = new TenantRepository({} as unknown as Knex);

      const result = await instance.deleteById(mockTenantId);
      expect(result).toBe(mockRepositoryResponse);
      expect(mockSendQuery).toHaveBeenCalledTimes(1);
      expect(mockSendQuery).toHaveBeenCalledWith(mockTenantId);
    });

    it('fails to delete an tenant by receiving an empty response from the database (tenant does not exist)', async () => {
      const mockTenantId = faker.string.uuid();
      const mockDbResponse = 0;

      const mockThrownError = new NotFoundError({
        context: contexts.TENANT_DELETE_BY_ID,
        details: {
          input: {
            id: mockTenantId,
          },
        },
      });

      const mockSendQuery = jest
        .spyOn(
          TenantRepository.prototype as unknown as {
            sendDeleteByIdQuery: () => Promise<number>;
          },
          'sendDeleteByIdQuery'
        )
        .mockResolvedValueOnce(mockDbResponse);

      const instance = new TenantRepository({} as unknown as Knex);

      let thrown;
      try {
        await instance.deleteById(mockTenantId);
      } catch (error) {
        thrown = error;
      }

      expect(thrown).toBeInstanceOf(NotFoundError);
      expect((thrown as NotFoundError).context).toEqual(
        mockThrownError.context
      );
      expect((thrown as NotFoundError).details).toEqual(
        mockThrownError.details
      );

      expect(mockSendQuery).toHaveBeenCalledTimes(1);
      expect(mockSendQuery).toHaveBeenCalledWith(mockTenantId);
    });

    it('fails to delete a tenant by a error thrown by the database', async () => {
      const mockTenantId = faker.string.uuid();

      const mockThrownError = new Error('some-error');
      const repositoryError = new UnexpectedError({
        cause: mockThrownError,
        context: contexts.TENANT_DELETE_BY_ID,
        details: {
          input: {
            id: mockTenantId,
          },
        },
      });

      const mockSendQuery = jest
        .spyOn(
          TenantRepository.prototype as unknown as {
            sendDeleteByIdQuery: () => Promise<number>;
          },
          'sendDeleteByIdQuery'
        )
        .mockRejectedValueOnce(mockThrownError);

      const instance = new TenantRepository({} as unknown as Knex);

      let thrown;
      try {
        await instance.deleteById(mockTenantId);
      } catch (error) {
        thrown = error;
      }

      expect(thrown).toBeInstanceOf(UnexpectedError);
      expect((thrown as UnexpectedError).cause).toEqual(mockThrownError);
      expect((thrown as UnexpectedError).context).toEqual(
        repositoryError.context
      );
      expect((thrown as UnexpectedError).details).toEqual(
        repositoryError.details
      );
      expect(mockSendQuery).toHaveBeenCalledTimes(1);
      expect(mockSendQuery).toHaveBeenCalledWith(mockTenantId);
    });
  });

  describe('customProperties', () => {
    describe('setCustomPropertyById', () => {
      it('should set a custom property by the tenant id', async () => {
        const mockTenantId = faker.string.uuid();
        const mockRepositoryResponse = true;

        const mockCustomProperty = {
          customProperty1: faker.lorem.paragraph(),
        };

        const sendSetJsonDataOnPathById = jest
          .spyOn(
            TenantRepository.prototype as unknown as {
              sendSetJsonDataOnPathById: () => Promise<void>;
            },
            'sendSetJsonDataOnPathById'
          )
          .mockResolvedValueOnce();

        const instance = new TenantRepository({} as unknown as Knex);

        const result = await instance.setCustomPropertyById(
          mockTenantId,
          mockCustomProperty
        );
        expect(result).toBe(mockRepositoryResponse);
        expect(sendSetJsonDataOnPathById).toHaveBeenCalledTimes(1);
        expect(sendSetJsonDataOnPathById).toHaveBeenCalledWith(
          mockTenantId,
          mockCustomProperty
        );
      });

      it('should fail to set the property by a error thrown by the database', async () => {
        const mockTenantId = faker.string.uuid();
        const mockCustomProperty = {
          customProperty1: faker.lorem.paragraph(),
        };

        const mockThrownError = new Error('some-error');
        const repositoryError = new UnexpectedError({
          cause: mockThrownError,
          context: contexts.TENANT_SET_CUSTOM_PROPERTY_BY_ID,
          details: {
            input: {
              id: mockTenantId,
              ...mockCustomProperty,
            },
          },
        });

        const sendSetJsonDataOnPathById = jest
          .spyOn(
            TenantRepository.prototype as unknown as {
              sendSetJsonDataOnPathById: () => Promise<void>;
            },
            'sendSetJsonDataOnPathById'
          )
          .mockRejectedValueOnce(mockThrownError);

        const instance = new TenantRepository({} as unknown as Knex);

        let thrown;
        try {
          await instance.setCustomPropertyById(
            mockTenantId,
            mockCustomProperty
          );
        } catch (error) {
          thrown = error;
        }

        expect(thrown).toBeInstanceOf(UnexpectedError);
        expect((thrown as UnexpectedError).cause).toEqual(mockThrownError);
        expect((thrown as UnexpectedError).context).toEqual(
          repositoryError.context
        );
        expect((thrown as UnexpectedError).details).toEqual(
          repositoryError.details
        );
        expect(sendSetJsonDataOnPathById).toHaveBeenCalledTimes(1);
        expect(sendSetJsonDataOnPathById).toHaveBeenCalledWith(
          mockTenantId,
          mockCustomProperty
        );
      });
    });

    describe('deleteCustomPropertyById', () => {
      it('should delete a custom property by the tenant id', async () => {
        const mockTenantId = faker.string.uuid();
        const mockRepositoryResponse = true;

        const mockCustomPropertyKey = 'customProperty1';

        const mockSendDeleteJsonDataOnPathById = jest
          .spyOn(
            TenantRepository.prototype as unknown as {
              sendDeleteJsonDataOnPathById: () => Promise<void>;
            },
            'sendDeleteJsonDataOnPathById'
          )
          .mockResolvedValueOnce();

        const instance = new TenantRepository({} as unknown as Knex);

        const result = await instance.deleteCustomPropertyById(
          mockTenantId,
          mockCustomPropertyKey
        );
        expect(result).toBe(mockRepositoryResponse);
        expect(mockSendDeleteJsonDataOnPathById).toHaveBeenCalledTimes(1);
        expect(mockSendDeleteJsonDataOnPathById).toHaveBeenCalledWith(
          mockTenantId,
          mockCustomPropertyKey
        );
      });

      it('should fail to delete the property by a error thrown by the database', async () => {
        const mockTenantId = faker.string.uuid();
        const mockCustomPropertyKey = 'customProperty1';

        const mockThrownError = new Error('some-error');
        const repositoryError = new UnexpectedError({
          cause: mockThrownError,
          context: contexts.TENANT_DELETE_CUSTOM_PROPERTY_BY_ID,
          details: {
            input: {
              id: mockTenantId,
              customPropertyKey: mockCustomPropertyKey,
            },
          },
        });

        const mockSendDeleteJsonDataOnPathById = jest
          .spyOn(
            TenantRepository.prototype as unknown as {
              sendDeleteJsonDataOnPathById: () => Promise<void>;
            },
            'sendDeleteJsonDataOnPathById'
          )
          .mockRejectedValueOnce(mockThrownError);

        const instance = new TenantRepository({} as unknown as Knex);

        let thrown;
        try {
          await instance.deleteCustomPropertyById(
            mockTenantId,
            mockCustomPropertyKey
          );
        } catch (error) {
          thrown = error;
        }

        expect(thrown).toBeInstanceOf(UnexpectedError);
        expect((thrown as UnexpectedError).cause).toEqual(mockThrownError);
        expect((thrown as UnexpectedError).context).toEqual(
          repositoryError.context
        );
        expect((thrown as UnexpectedError).details).toEqual(
          repositoryError.details
        );
        expect(mockSendDeleteJsonDataOnPathById).toHaveBeenCalledTimes(1);
        expect(mockSendDeleteJsonDataOnPathById).toHaveBeenCalledWith(
          mockTenantId,
          mockCustomPropertyKey
        );
      });
    });
  });
});
