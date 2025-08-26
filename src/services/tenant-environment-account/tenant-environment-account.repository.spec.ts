import { Knex } from 'knex';
import { IInsertReturningId } from '../../infra/database/postgres/types';
import { contexts } from '../../lib/contexts';
import {
  NotExpectedError,
  NotFoundError,
  UnexpectedError,
} from '../../lib/errors';
import { TenantEnvironmentAccountRepository } from './tenant-environment-account.repository';
import {
  ICreateTenantEnvironmentAccountDto,
  IUpdateTenantEnvironmentAccountDto,
} from './types/dto.type';
import { ITenantEnvironmentAccount } from './types/tenant-environment-account.type';

describe('[repository] account', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  describe('create', () => {
    it('creates a new account', async () => {
      const mockTenantEnvironmentAccountId = 'id';
      const mockDbResponse: IInsertReturningId = [
        { id: mockTenantEnvironmentAccountId },
      ];
      const mockCreateTenantEnvironmentAccountDto = {
        email: 'some@email.com',
        fullName: 'This Is The Full Name',
      } as ICreateTenantEnvironmentAccountDto;

      const mockSendInsert = jest
        .spyOn(
          TenantEnvironmentAccountRepository.prototype as unknown as {
            sendInsertReturningIdQuery: () => Promise<IInsertReturningId>;
          },
          'sendInsertReturningIdQuery'
        )
        .mockResolvedValueOnce(mockDbResponse);

      const instance = new TenantEnvironmentAccountRepository(
        {} as unknown as Knex
      );

      const result = await instance.create(
        mockCreateTenantEnvironmentAccountDto
      );
      expect(result).toBe(mockTenantEnvironmentAccountId);
      expect(mockSendInsert).toHaveBeenCalledTimes(1);
      expect(mockSendInsert).toHaveBeenCalledWith(
        mockCreateTenantEnvironmentAccountDto,
        undefined
      );
    });

    it('fails to create a new account by receiving an empty response from the database', async () => {
      const mockDbResponse: IInsertReturningId = [];
      const mockCreateTenantEnvironmentAccountDto = {
        email: 'some@email.com',
        fullName: 'This Is The Full Name',
      } as ICreateTenantEnvironmentAccountDto;

      const mockThrownError = new NotExpectedError({
        context: contexts.TENANT_ENVIRONMENT_ACCOUNT_CREATE,
        details: {
          input: {
            ...mockCreateTenantEnvironmentAccountDto,
          },
          output: undefined,
          message: 'database insert operation did not return an id',
        },
      });

      const mockSendInsert = jest
        .spyOn(
          TenantEnvironmentAccountRepository.prototype as unknown as {
            sendInsertReturningIdQuery: () => Promise<IInsertReturningId>;
          },
          'sendInsertReturningIdQuery'
        )
        .mockResolvedValueOnce(mockDbResponse);

      const instance = new TenantEnvironmentAccountRepository(
        {} as unknown as Knex
      );

      let thrown;
      try {
        await instance.create(mockCreateTenantEnvironmentAccountDto);
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
        mockCreateTenantEnvironmentAccountDto,
        undefined
      );
    });

    it('fails to create a new account by a error thrown by the database', async () => {
      const mockCreateTenantEnvironmentAccountDto = {
        email: 'some@email.com',
        fullName: 'This Is The Full Name',
      } as ICreateTenantEnvironmentAccountDto;

      const mockThrownError = new Error('some-other-error');
      const repositoryError = new UnexpectedError({
        cause: mockThrownError,
        context: contexts.TENANT_ENVIRONMENT_ACCOUNT_CREATE,
        details: {
          input: {
            ...mockCreateTenantEnvironmentAccountDto,
          },
        },
      });

      const mockSendInsert = jest
        .spyOn(
          TenantEnvironmentAccountRepository.prototype as unknown as {
            sendInsertReturningIdQuery: () => Promise<IInsertReturningId>;
          },
          'sendInsertReturningIdQuery'
        )
        .mockRejectedValueOnce(mockThrownError);

      const instance = new TenantEnvironmentAccountRepository(
        {} as unknown as Knex
      );

      let thrown;
      try {
        await instance.create(mockCreateTenantEnvironmentAccountDto);
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
        mockCreateTenantEnvironmentAccountDto,
        undefined
      );
    });
  });

  describe('getById', () => {
    it('gets an account by its id', async () => {
      const mockTenantEnvironmentAccountId = 'id';
      const mockDbResponse: ITenantEnvironmentAccount = {
        id: 'id',
        email: 'email',
        fullName: 'This Is The Full Name',
        createdAt: 'date',
        updatedAt: 'date',
      };

      const mockSendQuery = jest
        .spyOn(
          TenantEnvironmentAccountRepository.prototype as unknown as {
            sendFindByIdQuery: () => Promise<
              ITenantEnvironmentAccount | undefined
            >;
          },
          'sendFindByIdQuery'
        )
        .mockResolvedValueOnce(mockDbResponse);

      const instance = new TenantEnvironmentAccountRepository(
        {} as unknown as Knex
      );

      const result = await instance.getById(mockTenantEnvironmentAccountId);
      expect(result).toBe(mockDbResponse);
      expect(mockSendQuery).toHaveBeenCalledTimes(1);
      expect(mockSendQuery).toHaveBeenCalledWith(
        mockTenantEnvironmentAccountId
      );
    });

    it('gets an empty response as the account does not exist', async () => {
      const mockTenantEnvironmentAccountId = 'id';
      const mockDbResponse = undefined;

      const mockSendQuery = jest
        .spyOn(
          TenantEnvironmentAccountRepository.prototype as unknown as {
            sendFindByIdQuery: () => Promise<
              ITenantEnvironmentAccount | undefined
            >;
          },
          'sendFindByIdQuery'
        )
        .mockResolvedValueOnce(mockDbResponse);

      const instance = new TenantEnvironmentAccountRepository(
        {} as unknown as Knex
      );

      const result = await instance.getById(mockTenantEnvironmentAccountId);
      expect(result).toBe(mockDbResponse);
      expect(mockSendQuery).toHaveBeenCalledTimes(1);
      expect(mockSendQuery).toHaveBeenCalledWith(
        mockTenantEnvironmentAccountId
      );
    });

    it('fails to get an account by a error thrown by the database', async () => {
      const mockTenantEnvironmentAccountId = 'id';

      const mockThrownError = new Error('some-error');
      const repositoryError = new UnexpectedError({
        cause: mockThrownError,
        context: contexts.TENANT_ENVIRONMENT_ACCOUNT_GET_BY_ID,
        details: {
          input: {
            id: mockTenantEnvironmentAccountId,
          },
        },
      });

      const mockSendQuery = jest
        .spyOn(
          TenantEnvironmentAccountRepository.prototype as unknown as {
            sendFindByIdQuery: () => Promise<
              ITenantEnvironmentAccount | undefined
            >;
          },
          'sendFindByIdQuery'
        )
        .mockRejectedValueOnce(mockThrownError);

      const instance = new TenantEnvironmentAccountRepository(
        {} as unknown as Knex
      );

      let thrown;
      try {
        await instance.getById(mockTenantEnvironmentAccountId);
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
      expect(mockSendQuery).toHaveBeenCalledWith(
        mockTenantEnvironmentAccountId
      );
    });
  });

  describe('updateById', () => {
    it('updates an account by its id', async () => {
      const mockTenantEnvironmentAccountId = 'id';
      const mockDbResponse = 1;
      const mockRepositoryResponse = true;

      const mockUpdateTenantEnvironmentAccountDto = {
        fullName: 'This Is The Full Name',
      } as IUpdateTenantEnvironmentAccountDto;

      const mockSendUpdate = jest
        .spyOn(
          TenantEnvironmentAccountRepository.prototype as unknown as {
            sendUpdateByIdQuery: () => Promise<number>;
          },
          'sendUpdateByIdQuery'
        )
        .mockResolvedValueOnce(mockDbResponse);

      const instance = new TenantEnvironmentAccountRepository(
        {} as unknown as Knex
      );

      const result = await instance.updateById(
        mockTenantEnvironmentAccountId,
        mockUpdateTenantEnvironmentAccountDto
      );
      expect(result).toBe(mockRepositoryResponse);
      expect(mockSendUpdate).toHaveBeenCalledTimes(1);
      expect(mockSendUpdate).toHaveBeenCalledWith(
        mockTenantEnvironmentAccountId,
        mockUpdateTenantEnvironmentAccountDto
      );
    });

    it('fails to update an account by receiving an empty response from the database (account does not exist)', async () => {
      const mockTenantEnvironmentAccountId = 'id';
      const mockDbResponse = 0;

      const mockUpdateTenantEnvironmentAccountDto = {
        fullName: 'This Is The Full Name',
      } as IUpdateTenantEnvironmentAccountDto;

      const mockThrownError = new NotFoundError({
        context: contexts.TENANT_ENVIRONMENT_ACCOUNT_UPDATE_BY_ID,
        details: {
          input: {
            id: mockTenantEnvironmentAccountId,
            ...mockUpdateTenantEnvironmentAccountDto,
          },
        },
      });

      const mockSendUpdate = jest
        .spyOn(
          TenantEnvironmentAccountRepository.prototype as unknown as {
            sendUpdateByIdQuery: () => Promise<number>;
          },
          'sendUpdateByIdQuery'
        )
        .mockResolvedValueOnce(mockDbResponse);

      const instance = new TenantEnvironmentAccountRepository(
        {} as unknown as Knex
      );

      let thrown;
      try {
        await instance.updateById(
          mockTenantEnvironmentAccountId,
          mockUpdateTenantEnvironmentAccountDto
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
        mockTenantEnvironmentAccountId,
        mockUpdateTenantEnvironmentAccountDto
      );
    });

    it('fails to update an account by a error thrown by the database', async () => {
      const mockTenantEnvironmentAccountId = 'id';
      const mockUpdateTenantEnvironmentAccountDto = {
        fullName: 'This Is The Full Name',
      } as IUpdateTenantEnvironmentAccountDto;

      const mockThrownError = new Error('some-error');
      const repositoryError = new UnexpectedError({
        cause: mockThrownError,
        context: contexts.TENANT_ENVIRONMENT_ACCOUNT_UPDATE_BY_ID,
        details: {
          input: {
            id: mockTenantEnvironmentAccountId,
            ...mockUpdateTenantEnvironmentAccountDto,
          },
        },
      });

      const mockSendUpdate = jest
        .spyOn(
          TenantEnvironmentAccountRepository.prototype as unknown as {
            sendUpdateByIdQuery: () => Promise<number>;
          },
          'sendUpdateByIdQuery'
        )
        .mockRejectedValueOnce(mockThrownError);

      const instance = new TenantEnvironmentAccountRepository(
        {} as unknown as Knex
      );

      let thrown;
      try {
        await instance.updateById(
          mockTenantEnvironmentAccountId,
          mockUpdateTenantEnvironmentAccountDto
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
        mockTenantEnvironmentAccountId,
        mockUpdateTenantEnvironmentAccountDto
      );
    });
  });

  describe('deleteById', () => {
    it('deletes an account by its id', async () => {
      const mockTenantEnvironmentAccountId = 'id';
      const mockDbResponse = 1;
      const mockRepositoryResponse = true;

      const mockSendQuery = jest
        .spyOn(
          TenantEnvironmentAccountRepository.prototype as unknown as {
            sendDeleteByIdQuery: () => Promise<number>;
          },
          'sendDeleteByIdQuery'
        )
        .mockResolvedValueOnce(mockDbResponse);

      const instance = new TenantEnvironmentAccountRepository(
        {} as unknown as Knex
      );

      const result = await instance.deleteById(mockTenantEnvironmentAccountId);
      expect(result).toBe(mockRepositoryResponse);
      expect(mockSendQuery).toHaveBeenCalledTimes(1);
      expect(mockSendQuery).toHaveBeenCalledWith(
        mockTenantEnvironmentAccountId
      );
    });

    it('fails to delete an account by receiving an empty response from the database (account does not exist)', async () => {
      const mockTenantEnvironmentAccountId = 'id';
      const mockDbResponse = 0;

      const mockThrownError = new NotFoundError({
        context: contexts.TENANT_ENVIRONMENT_ACCOUNT_DELETE_BY_ID,
        details: {
          input: {
            id: mockTenantEnvironmentAccountId,
          },
        },
      });

      const mockSendQuery = jest
        .spyOn(
          TenantEnvironmentAccountRepository.prototype as unknown as {
            sendDeleteByIdQuery: () => Promise<number>;
          },
          'sendDeleteByIdQuery'
        )
        .mockResolvedValueOnce(mockDbResponse);

      const instance = new TenantEnvironmentAccountRepository(
        {} as unknown as Knex
      );

      let thrown;
      try {
        await instance.deleteById(mockTenantEnvironmentAccountId);
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
      expect(mockSendQuery).toHaveBeenCalledWith(
        mockTenantEnvironmentAccountId
      );
    });

    it('fails to delete an account by a error thrown by the database', async () => {
      const mockTenantEnvironmentAccountId = 'id';

      const mockThrownError = new Error('some-error');
      const repositoryError = new UnexpectedError({
        cause: mockThrownError,
        context: contexts.TENANT_ENVIRONMENT_ACCOUNT_DELETE_BY_ID,
        details: {
          input: {
            id: mockTenantEnvironmentAccountId,
          },
        },
      });

      const mockSendQuery = jest
        .spyOn(
          TenantEnvironmentAccountRepository.prototype as unknown as {
            sendDeleteByIdQuery: () => Promise<number>;
          },
          'sendDeleteByIdQuery'
        )
        .mockRejectedValueOnce(mockThrownError);

      const instance = new TenantEnvironmentAccountRepository(
        {} as unknown as Knex
      );

      let thrown;
      try {
        await instance.deleteById(mockTenantEnvironmentAccountId);
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
      expect(mockSendQuery).toHaveBeenCalledWith(
        mockTenantEnvironmentAccountId
      );
    });
  });
});
