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
  IUpdateTenantEnvironmentDto,
} from './types/dto.type';
import { ITenantEnvironment } from './types/tenant-environment.type';

describe('[repository] tenant', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  describe('create', () => {
    it('creates a new tenant environment', async () => {
      const mockTenantEnvironmentId = 'id';
      const mockDbResponse: IInsertReturningId = [
        { id: mockTenantEnvironmentId },
      ];
      const mockCreateTenantEnvironmentDto = {
        name: 'this tenant name',
        ownerId: '84acb0bb-f8ab-4ea1-a4f1-830747cedcb3',
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
        name: 'this tenant name',
        ownerId: 'af442a12-8088-4c81-8fcc-2a5bf37230ca',
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
        name: 'this tenant name',
        ownerId: 'f2fc4410-0c6c-4075-8094-75229c995ed4',
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
      const mockTenantEnvironmentId = 'fc743488-35e4-41a6-8ce4-0b59edd1e4e8';
      const mockDbResponse: ITenantEnvironment = {
        id: 'fc743488-35e4-41a6-8ce4-0b59edd1e4e8',
        name: 'this tenant name',
        ownerId: '8be2b60d-a7e0-4179-a7ee-94a325dcf6a8',
        createdAt: 'date',
        updatedAt: 'date',
      };

      const mockSendQuery = jest
        .spyOn(
          TenantEnvironmentRepository.prototype as unknown as {
            sendFindByIdQuery: () => Promise<ITenantEnvironment | undefined>;
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
      const mockTenantEnvironmentId = '050cfde1-e5ed-4266-a254-57642b41d72e';
      const mockDbResponse = undefined;

      const mockSendQuery = jest
        .spyOn(
          TenantEnvironmentRepository.prototype as unknown as {
            sendFindByIdQuery: () => Promise<ITenantEnvironment | undefined>;
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
      const mockTenantEnvironmentId = 'fa0f210d-b28c-423d-9a5e-c9ed3d871682';

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
      const mockTenantEnvironmentId = '18d61ace-180a-44e2-9604-fecc66d6f3d4';
      const mockDbResponse = 1;
      const mockRepositoryResponse = true;

      const mockUpdateTenantEnvironmentDto = {
        name: 'this tenant name',
      } as IUpdateTenantEnvironmentDto;

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
      const mockTenantEnvironmentId = '3e1c379b-3989-41e7-9a11-5ada7bf5c312';
      const mockDbResponse = 0;

      const mockUpdateTenantEnvironmentDto = {
        name: 'this tenant name',
      } as IUpdateTenantEnvironmentDto;

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
      const mockTenantEnvironmentId = '71d9a25c-5cec-4255-8169-580c00d7dffe';
      const mockUpdateTenantEnvironmentDto = {
        name: 'this tenant name',
      } as IUpdateTenantEnvironmentDto;

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
      const mockTenantEnvironmentId = '4ad3201a-ac8d-4a84-a8b9-35456e9e4f93';
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
      const mockTenantEnvironmentId = '03770fbd-23a3-46d1-88c0-f78169cfdd41';
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
      const mockTenantEnvironmentId = 'aa692f0b-1df5-4412-a836-6cbdd1790362';

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
});
