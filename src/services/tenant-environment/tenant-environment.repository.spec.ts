import { faker } from '@faker-js/faker';
import { Knex } from 'knex';
import { IInsertReturningId } from '../../infra/database/postgres/types';
import { contexts } from '../../lib/contexts';
import {
  NotExpectedError,
  NotFoundError,
  UnexpectedError,
} from '../../lib/errors';
import { TenantEnvironmentRepository } from './tenant-environment.repository';
import {
  ICreateTenantEnvironmentDto,
  IGetTenantEnvironmentDto,
  IUpdateTenantEnvironmentAllowedDtos,
} from './types/dto.type';
import { ITenantEnvironment } from './types/tenant-environment.type';

describe('tenant-environment.repository', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  describe('create', () => {
    it('creates a new tenant environment', async () => {
      const mockTenantEnvironmentId = faker.string.uuid();
      const mockDbResponse: IInsertReturningId = [
        { id: mockTenantEnvironmentId },
      ];

      const mockCreateTenantEnvironmentDto = {
        tenantId: faker.string.uuid(),
        name: faker.company.name(),
        customProperties: {},
      } as ICreateTenantEnvironmentDto;

      const mockSendInsert = jest
        .spyOn(
          TenantEnvironmentRepository.prototype as unknown as {
            sendInsertReturningIdQuery: () => Promise<IInsertReturningId>;
          },
          'sendInsertReturningIdQuery'
        )
        .mockResolvedValueOnce(mockDbResponse);

      const instance = new TenantEnvironmentRepository({} as unknown as Knex);

      const result = await instance.create(mockCreateTenantEnvironmentDto);
      expect(result).toBe(mockTenantEnvironmentId);
      expect(mockSendInsert).toHaveBeenCalledTimes(1);
      expect(mockSendInsert).toHaveBeenCalledWith(
        mockCreateTenantEnvironmentDto,
        undefined
      );
    });

    it('fails to create a new tenant environment by receiving an empty response from the database', async () => {
      const mockDbResponse: IInsertReturningId = [];
      const mockCreateTenantEnvironmentDto = {
        tenantId: faker.string.uuid(),
        name: faker.company.name(),
        customProperties: {},
      } as ICreateTenantEnvironmentDto;

      const mockThrownError = new NotExpectedError({
        context: contexts.TENANT_ENVIRONMENT_CREATE,
        details: {
          input: {
            ...mockCreateTenantEnvironmentDto,
          },
          output: undefined,
          message: 'database insert operation did not return an id',
        },
      });

      const mockSendInsert = jest
        .spyOn(
          TenantEnvironmentRepository.prototype as unknown as {
            sendInsertReturningIdQuery: () => Promise<IInsertReturningId>;
          },
          'sendInsertReturningIdQuery'
        )
        .mockResolvedValueOnce(mockDbResponse);

      const instance = new TenantEnvironmentRepository({} as unknown as Knex);

      let thrown;
      try {
        await instance.create(mockCreateTenantEnvironmentDto);
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
        mockCreateTenantEnvironmentDto,
        undefined
      );
    });

    it('fails to create a new tenant environment by a error thrown by the database', async () => {
      const mockCreateTenantEnvironmentDto = {
        tenantId: faker.string.uuid(),
        name: faker.company.name(),
        customProperties: {},
      } as ICreateTenantEnvironmentDto;

      const mockThrownError = new Error('some-other-error');
      const repositoryError = new UnexpectedError({
        cause: mockThrownError,
        context: contexts.TENANT_ENVIRONMENT_CREATE,
        details: {
          input: {
            ...mockCreateTenantEnvironmentDto,
          },
        },
      });

      const mockSendInsert = jest
        .spyOn(
          TenantEnvironmentRepository.prototype as unknown as {
            sendInsertReturningIdQuery: () => Promise<IInsertReturningId>;
          },
          'sendInsertReturningIdQuery'
        )
        .mockRejectedValueOnce(mockThrownError);

      const instance = new TenantEnvironmentRepository({} as unknown as Knex);

      let thrown;
      try {
        await instance.create(mockCreateTenantEnvironmentDto);
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
        mockCreateTenantEnvironmentDto,
        undefined
      );
    });
  });

  describe('getById', () => {
    it('gets an tenant environment by its id', async () => {
      const mockTenantEnvironmentId = faker.string.uuid();
      const mockDbResponse: IGetTenantEnvironmentDto = {
        id: mockTenantEnvironmentId,
        tenantId: faker.string.uuid(),
        name: faker.company.name(),
        customProperties: {},
      };

      const mockSendQuery = jest
        .spyOn(
          TenantEnvironmentRepository.prototype as unknown as {
            sendFindByIdQuery: () => Promise<
              IGetTenantEnvironmentDto | undefined
            >;
          },
          'sendFindByIdQuery'
        )
        .mockResolvedValueOnce(mockDbResponse);

      const instance = new TenantEnvironmentRepository({} as unknown as Knex);

      const result = await instance.getById(mockTenantEnvironmentId);
      expect(result).toBe(mockDbResponse);
      expect(mockSendQuery).toHaveBeenCalledTimes(1);
      expect(mockSendQuery).toHaveBeenCalledWith(mockTenantEnvironmentId);
    });

    it('gets an empty response as the tenant environment does not exist', async () => {
      const mockTenantEnvironmentId = faker.string.uuid();
      const mockDbResponse = undefined;

      const mockSendQuery = jest
        .spyOn(
          TenantEnvironmentRepository.prototype as unknown as {
            sendFindByIdQuery: () => Promise<
              IGetTenantEnvironmentDto | undefined
            >;
          },
          'sendFindByIdQuery'
        )
        .mockResolvedValueOnce(mockDbResponse);

      const instance = new TenantEnvironmentRepository({} as unknown as Knex);

      const result = await instance.getById(mockTenantEnvironmentId);
      expect(result).toBe(mockDbResponse);
      expect(mockSendQuery).toHaveBeenCalledTimes(1);
      expect(mockSendQuery).toHaveBeenCalledWith(mockTenantEnvironmentId);
    });

    it('fails to get a tenant environment by a error thrown by the database', async () => {
      const mockTenantEnvironmentId = faker.string.uuid();

      const mockThrownError = new Error('some-error');
      const repositoryError = new UnexpectedError({
        cause: mockThrownError,
        context: contexts.TENANT_ENVIRONMENT_GET_BY_ID,
        details: {
          input: {
            id: mockTenantEnvironmentId,
          },
        },
      });

      const mockSendQuery = jest
        .spyOn(
          TenantEnvironmentRepository.prototype as unknown as {
            sendFindByIdQuery: () => Promise<ITenantEnvironment | undefined>;
          },
          'sendFindByIdQuery'
        )
        .mockRejectedValueOnce(mockThrownError);

      const instance = new TenantEnvironmentRepository({} as unknown as Knex);

      let thrown;
      try {
        await instance.getById(mockTenantEnvironmentId);
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
      expect(mockSendQuery).toHaveBeenCalledWith(mockTenantEnvironmentId);
    });
  });

  describe('updateById', () => {
    it('updates a tenant environment by its id', async () => {
      const mockTenantEnvironmentId = faker.string.uuid();
      const mockDbResponse = 1;
      const mockRepositoryResponse = true;

      const mockUpdateTenantEnvironmentDto = {
        name: faker.word.noun(),
      } as IUpdateTenantEnvironmentAllowedDtos;

      const mockSendUpdate = jest
        .spyOn(
          TenantEnvironmentRepository.prototype as unknown as {
            sendUpdateByIdQuery: () => Promise<number>;
          },
          'sendUpdateByIdQuery'
        )
        .mockResolvedValueOnce(mockDbResponse);

      const instance = new TenantEnvironmentRepository({} as unknown as Knex);

      const result = await instance.updateById(
        mockTenantEnvironmentId,
        mockUpdateTenantEnvironmentDto
      );
      expect(result).toBe(mockRepositoryResponse);
      expect(mockSendUpdate).toHaveBeenCalledTimes(1);
      expect(mockSendUpdate).toHaveBeenCalledWith(
        mockTenantEnvironmentId,
        mockUpdateTenantEnvironmentDto
      );
    });

    it('fails to update a tenant environment by receiving an empty response from the database (tenant environment does not exist)', async () => {
      const mockTenantEnvironmentId = faker.string.uuid();
      const mockDbResponse = 0;

      const mockUpdateTenantEnvironmentDto = {
        name: faker.word.noun(),
      } as IUpdateTenantEnvironmentAllowedDtos;

      const mockThrownError = new NotFoundError({
        context: contexts.TENANT_ENVIRONMENT_UPDATE_BY_ID,
        details: {
          input: {
            id: mockTenantEnvironmentId,
            ...mockUpdateTenantEnvironmentDto,
          },
        },
      });

      const mockSendUpdate = jest
        .spyOn(
          TenantEnvironmentRepository.prototype as unknown as {
            sendUpdateByIdQuery: () => Promise<number>;
          },
          'sendUpdateByIdQuery'
        )
        .mockResolvedValueOnce(mockDbResponse);

      const instance = new TenantEnvironmentRepository({} as unknown as Knex);

      let thrown;
      try {
        await instance.updateById(
          mockTenantEnvironmentId,
          mockUpdateTenantEnvironmentDto
        );
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
        mockTenantEnvironmentId,
        mockUpdateTenantEnvironmentDto
      );
    });

    it('fails to update a tenant environment by a error thrown by the database', async () => {
      const mockTenantEnvironmentId = faker.string.uuid();
      const mockUpdateTenantEnvironmentDto = {
        name: faker.word.noun(),
      } as IUpdateTenantEnvironmentAllowedDtos;

      const mockThrownError = new Error('some-error');
      const repositoryError = new UnexpectedError({
        cause: mockThrownError,
        context: contexts.TENANT_ENVIRONMENT_UPDATE_BY_ID,
        details: {
          input: {
            id: mockTenantEnvironmentId,
            ...mockUpdateTenantEnvironmentDto,
          },
        },
      });

      const mockSendUpdate = jest
        .spyOn(
          TenantEnvironmentRepository.prototype as unknown as {
            sendUpdateByIdQuery: () => Promise<number>;
          },
          'sendUpdateByIdQuery'
        )
        .mockRejectedValueOnce(mockThrownError);

      const instance = new TenantEnvironmentRepository({} as unknown as Knex);

      let thrown;
      try {
        await instance.updateById(
          mockTenantEnvironmentId,
          mockUpdateTenantEnvironmentDto
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
      expect(mockSendUpdate).toHaveBeenCalledTimes(1);
      expect(mockSendUpdate).toHaveBeenCalledWith(
        mockTenantEnvironmentId,
        mockUpdateTenantEnvironmentDto
      );
    });
  });

  describe('deleteById', () => {
    it('deletes a tenant environment by its id', async () => {
      const mockTenantEnvironmentId = faker.string.uuid();
      const mockDbResponse = 1;
      const mockRepositoryResponse = true;

      const mockSendQuery = jest
        .spyOn(
          TenantEnvironmentRepository.prototype as unknown as {
            sendDeleteByIdQuery: () => Promise<number>;
          },
          'sendDeleteByIdQuery'
        )
        .mockResolvedValueOnce(mockDbResponse);

      const instance = new TenantEnvironmentRepository({} as unknown as Knex);

      const result = await instance.deleteById(mockTenantEnvironmentId);
      expect(result).toBe(mockRepositoryResponse);
      expect(mockSendQuery).toHaveBeenCalledTimes(1);
      expect(mockSendQuery).toHaveBeenCalledWith(mockTenantEnvironmentId);
    });

    it('fails to delete a tenant environment by receiving an empty response from the database (tenant does not exist)', async () => {
      const mockTenantEnvironmentId = faker.string.uuid();
      const mockDbResponse = 0;

      const mockThrownError = new NotFoundError({
        context: contexts.TENANT_ENVIRONMENT_DELETE_BY_ID,
        details: {
          input: {
            id: mockTenantEnvironmentId,
          },
        },
      });

      const mockSendQuery = jest
        .spyOn(
          TenantEnvironmentRepository.prototype as unknown as {
            sendDeleteByIdQuery: () => Promise<number>;
          },
          'sendDeleteByIdQuery'
        )
        .mockResolvedValueOnce(mockDbResponse);

      const instance = new TenantEnvironmentRepository({} as unknown as Knex);

      let thrown;
      try {
        await instance.deleteById(mockTenantEnvironmentId);
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
      expect(mockSendQuery).toHaveBeenCalledWith(mockTenantEnvironmentId);
    });

    it('fails to delete a tenant environment by a error thrown by the database', async () => {
      const mockTenantEnvironmentId = faker.string.uuid();

      const mockThrownError = new Error('some-error');
      const repositoryError = new UnexpectedError({
        cause: mockThrownError,
        context: contexts.TENANT_ENVIRONMENT_DELETE_BY_ID,
        details: {
          input: {
            id: mockTenantEnvironmentId,
          },
        },
      });

      const mockSendQuery = jest
        .spyOn(
          TenantEnvironmentRepository.prototype as unknown as {
            sendDeleteByIdQuery: () => Promise<number>;
          },
          'sendDeleteByIdQuery'
        )
        .mockRejectedValueOnce(mockThrownError);

      const instance = new TenantEnvironmentRepository({} as unknown as Knex);

      let thrown;
      try {
        await instance.deleteById(mockTenantEnvironmentId);
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
      expect(mockSendQuery).toHaveBeenCalledWith(mockTenantEnvironmentId);
    });
  });

  describe('customProperties', () => {
    describe('setCustomPropertyById', () => {
      it('should set a custom property by the tenant environment id', async () => {
        const mockTenantEnvironmentId = faker.string.uuid();
        const mockRepositoryResponse = true;

        const mockCustomProperty = {
          customProperty1: faker.lorem.paragraph(),
        };

        const sendSetJsonDataOnPathById = jest
          .spyOn(
            TenantEnvironmentRepository.prototype as unknown as {
              sendSetJsonDataOnPathById: () => Promise<void>;
            },
            'sendSetJsonDataOnPathById'
          )
          .mockResolvedValueOnce();

        const instance = new TenantEnvironmentRepository({} as unknown as Knex);

        const result = await instance.setCustomPropertyById(
          mockTenantEnvironmentId,
          mockCustomProperty
        );
        expect(result).toBe(mockRepositoryResponse);
        expect(sendSetJsonDataOnPathById).toHaveBeenCalledTimes(1);
        expect(sendSetJsonDataOnPathById).toHaveBeenCalledWith(
          mockTenantEnvironmentId,
          mockCustomProperty
        );
      });

      it('should fail to set the property by a error thrown by the database', async () => {
        const mockTenantEnvironmentId = faker.string.uuid();
        const mockCustomProperty = {
          customProperty1: faker.lorem.paragraph(),
        };

        const mockThrownError = new Error('some-error');
        const repositoryError = new UnexpectedError({
          cause: mockThrownError,
          context: contexts.TENANT_ENVIRONMENT_SET_CUSTOM_PROPERTY_BY_ID,
          details: {
            input: {
              id: mockTenantEnvironmentId,
              ...mockCustomProperty,
            },
          },
        });

        const sendSetJsonDataOnPathById = jest
          .spyOn(
            TenantEnvironmentRepository.prototype as unknown as {
              sendSetJsonDataOnPathById: () => Promise<void>;
            },
            'sendSetJsonDataOnPathById'
          )
          .mockRejectedValueOnce(mockThrownError);

        const instance = new TenantEnvironmentRepository({} as unknown as Knex);

        let thrown;
        try {
          await instance.setCustomPropertyById(
            mockTenantEnvironmentId,
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
          mockTenantEnvironmentId,
          mockCustomProperty
        );
      });
    });

    describe('deleteCustomPropertyById', () => {
      it('should delete a custom property by the tenant environment id', async () => {
        const mockTenantEnvironmentId = faker.string.uuid();
        const mockRepositoryResponse = true;

        const mockCustomPropertyKey = 'customProperty1';

        const mockSendDeleteJsonDataOnPathById = jest
          .spyOn(
            TenantEnvironmentRepository.prototype as unknown as {
              sendDeleteJsonDataOnPathById: () => Promise<void>;
            },
            'sendDeleteJsonDataOnPathById'
          )
          .mockResolvedValueOnce();

        const instance = new TenantEnvironmentRepository({} as unknown as Knex);

        const result = await instance.deleteCustomPropertyById(
          mockTenantEnvironmentId,
          mockCustomPropertyKey
        );
        expect(result).toBe(mockRepositoryResponse);
        expect(mockSendDeleteJsonDataOnPathById).toHaveBeenCalledTimes(1);
        expect(mockSendDeleteJsonDataOnPathById).toHaveBeenCalledWith(
          mockTenantEnvironmentId,
          mockCustomPropertyKey
        );
      });

      it('should fail to delete the property by a error thrown by the database', async () => {
        const mockTenantEnvironmentId = faker.string.uuid();
        const mockCustomPropertyKey = 'customProperty1';

        const mockThrownError = new Error('some-error');
        const repositoryError = new UnexpectedError({
          cause: mockThrownError,
          context: contexts.TENANT_ENVIRONMENT_DELETE_CUSTOM_PROPERTY_BY_ID,
          details: {
            input: {
              id: mockTenantEnvironmentId,
              customPropertyKey: mockCustomPropertyKey,
            },
          },
        });

        const mockSendDeleteJsonDataOnPathById = jest
          .spyOn(
            TenantEnvironmentRepository.prototype as unknown as {
              sendDeleteJsonDataOnPathById: () => Promise<void>;
            },
            'sendDeleteJsonDataOnPathById'
          )
          .mockRejectedValueOnce(mockThrownError);

        const instance = new TenantEnvironmentRepository({} as unknown as Knex);

        let thrown;
        try {
          await instance.deleteCustomPropertyById(
            mockTenantEnvironmentId,
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
          mockTenantEnvironmentId,
          mockCustomPropertyKey
        );
      });
    });
  });
});
