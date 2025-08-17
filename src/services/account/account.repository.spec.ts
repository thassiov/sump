import { Knex } from 'knex';
import { IInsertReturningId } from '../../infra/database/postgres/types';
import { contexts } from '../../lib/contexts';
import { RepositoryOperationError } from '../../lib/errors';
import { AccountRepository } from './account.repository';
import { IAccount } from './types/account.type';
import { ICreateAccountDto, IUpdateAccountDto } from './types/dto.type';

describe('[repository] account', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  describe('create', () => {
    it('creates a new account', async () => {
      const mockAccountId = 'id';
      const mockDbResponse: IInsertReturningId = [{ id: mockAccountId }];
      const mockCreateAccountDto = {
        email: 'some@email.com',
        fullName: 'This Is The Full Name',
      } as ICreateAccountDto;

      const mockSendInsert = jest
        .spyOn(
          AccountRepository.prototype as unknown as {
            sendInsertReturningIdQuery: () => Promise<IInsertReturningId>;
          },
          'sendInsertReturningIdQuery'
        )
        .mockResolvedValueOnce(mockDbResponse);

      const instance = new AccountRepository({} as unknown as Knex);

      const result = await instance.create(mockCreateAccountDto);
      expect(result).toBe(mockAccountId);
      expect(mockSendInsert).toHaveBeenCalledTimes(1);
      expect(mockSendInsert).toHaveBeenCalledWith(
        mockCreateAccountDto,
        undefined
      );
    });

    // @TODO: this test is identical to the 'error thrown by the database' case. The repository logic maybe
    // needs a bit more refining
    it('fails to create a new account by receiving an empty response from the database', async () => {
      const mockDbResponse: IInsertReturningId = [];
      const mockCreateAccountDto = {
        email: 'some@email.com',
        fullName: 'This Is The Full Name',
      } as ICreateAccountDto;

      const mockThrownError = new Error('could-not-create-account');
      const repositoryError = new RepositoryOperationError({
        cause: mockThrownError,
        context: contexts.ACCOUNT_PROFILE_CREATE,
        details: {
          input: {
            payload: mockCreateAccountDto,
          },
        },
      });

      const mockSendInsert = jest
        .spyOn(
          AccountRepository.prototype as unknown as {
            sendInsertReturningIdQuery: () => Promise<IInsertReturningId>;
          },
          'sendInsertReturningIdQuery'
        )
        .mockResolvedValueOnce(mockDbResponse);

      const instance = new AccountRepository({} as unknown as Knex);

      let thrown;
      try {
        await instance.create(mockCreateAccountDto);
      } catch (error) {
        thrown = error;
      }

      expect(thrown).toBeInstanceOf(RepositoryOperationError);
      expect((thrown as RepositoryOperationError).cause).toEqual(
        mockThrownError
      );
      expect((thrown as RepositoryOperationError).context).toEqual(
        repositoryError.context
      );
      expect((thrown as RepositoryOperationError).details).toEqual(
        repositoryError.details
      );
      expect(mockSendInsert).toHaveBeenCalledTimes(1);
      expect(mockSendInsert).toHaveBeenCalledWith(
        mockCreateAccountDto,
        undefined
      );
    });

    it('fails to create a new account by a error thrown by the database', async () => {
      const mockCreateAccountDto = {
        email: 'some@email.com',
        fullName: 'This Is The Full Name',
      } as ICreateAccountDto;

      const mockThrownError = new Error('some-other-error');
      const repositoryError = new RepositoryOperationError({
        cause: mockThrownError,
        context: contexts.ACCOUNT_PROFILE_CREATE,
        details: {
          input: {
            payload: mockCreateAccountDto,
          },
        },
      });

      const mockSendInsert = jest
        .spyOn(
          AccountRepository.prototype as unknown as {
            sendInsertReturningIdQuery: () => Promise<IInsertReturningId>;
          },
          'sendInsertReturningIdQuery'
        )
        .mockRejectedValueOnce(mockThrownError);

      const instance = new AccountRepository({} as unknown as Knex);

      let thrown;
      try {
        await instance.create(mockCreateAccountDto);
      } catch (error) {
        thrown = error;
      }

      expect(thrown).toBeInstanceOf(RepositoryOperationError);
      expect((thrown as RepositoryOperationError).cause).toEqual(
        mockThrownError
      );
      expect((thrown as RepositoryOperationError).context).toEqual(
        repositoryError.context
      );
      expect((thrown as RepositoryOperationError).details).toEqual(
        repositoryError.details
      );
      expect(mockSendInsert).toHaveBeenCalledTimes(1);
      expect(mockSendInsert).toHaveBeenCalledWith(
        mockCreateAccountDto,
        undefined
      );
    });
  });

  describe('getAccountById', () => {
    it('gets an account by its id', async () => {
      const mockAccountId = 'id';
      const mockDbResponse: IAccount = {
        id: 'id',
        email: 'email',
        fullName: 'This Is The Full Name',
        createdAt: 'date',
        updatedAt: 'date',
      };

      const mockSendQuery = jest
        .spyOn(
          AccountRepository.prototype as unknown as {
            sendFindByIdQuery: () => Promise<IAccount | undefined>;
          },
          'sendFindByIdQuery'
        )
        .mockResolvedValueOnce(mockDbResponse);

      const instance = new AccountRepository({} as unknown as Knex);

      const result = await instance.getAccountById(mockAccountId);
      expect(result).toBe(mockDbResponse);
      expect(mockSendQuery).toHaveBeenCalledTimes(1);
      expect(mockSendQuery).toHaveBeenCalledWith(mockAccountId);
    });

    it('gets an empty response as the account does not exist', async () => {
      const mockAccountId = 'id';
      const mockDbResponse = undefined;

      const mockSendQuery = jest
        .spyOn(
          AccountRepository.prototype as unknown as {
            sendFindByIdQuery: () => Promise<IAccount | undefined>;
          },
          'sendFindByIdQuery'
        )
        .mockResolvedValueOnce(mockDbResponse);

      const instance = new AccountRepository({} as unknown as Knex);

      const result = await instance.getAccountById(mockAccountId);
      expect(result).toBe(mockDbResponse);
      expect(mockSendQuery).toHaveBeenCalledTimes(1);
      expect(mockSendQuery).toHaveBeenCalledWith(mockAccountId);
    });

    it('fails to get an account by a error thrown by the database', async () => {
      const mockAccountId = 'id';

      const mockThrownError = new Error('some-error');
      const repositoryError = new RepositoryOperationError({
        cause: mockThrownError,
        context: contexts.GET_ACCOUNT_BY_ID,
        details: {
          input: {
            accountId: mockAccountId,
          },
        },
      });

      const mockSendQuery = jest
        .spyOn(
          AccountRepository.prototype as unknown as {
            sendFindByIdQuery: () => Promise<IAccount | undefined>;
          },
          'sendFindByIdQuery'
        )
        .mockRejectedValueOnce(mockThrownError);

      const instance = new AccountRepository({} as unknown as Knex);

      let thrown;
      try {
        await instance.getAccountById(mockAccountId);
      } catch (error) {
        thrown = error;
      }

      expect(thrown).toBeInstanceOf(RepositoryOperationError);
      expect((thrown as RepositoryOperationError).cause).toEqual(
        mockThrownError
      );
      expect((thrown as RepositoryOperationError).context).toEqual(
        repositoryError.context
      );
      expect((thrown as RepositoryOperationError).details).toEqual(
        repositoryError.details
      );
      expect(mockSendQuery).toHaveBeenCalledTimes(1);
      expect(mockSendQuery).toHaveBeenCalledWith(mockAccountId);
    });
  });

  describe('updateAccountById', () => {
    it('updates an account by its id', async () => {
      const mockAccountId = 'id';
      const mockDbResponse = 1;
      const mockRepositoryResponse = true;

      const mockUpdateAccountDto = {
        fullName: 'This Is The Full Name',
      } as IUpdateAccountDto;

      const mockSendUpdate = jest
        .spyOn(
          AccountRepository.prototype as unknown as {
            sendUpdateByIdQuery: () => Promise<number>;
          },
          'sendUpdateByIdQuery'
        )
        .mockResolvedValueOnce(mockDbResponse);

      const instance = new AccountRepository({} as unknown as Knex);

      const result = await instance.updateAccountById(
        mockAccountId,
        mockUpdateAccountDto
      );
      expect(result).toBe(mockRepositoryResponse);
      expect(mockSendUpdate).toHaveBeenCalledTimes(1);
      expect(mockSendUpdate).toHaveBeenCalledWith(
        mockAccountId,
        mockUpdateAccountDto
      );
    });

    it('fails to update an account by receiving an empty response from the database (account does not exist)', async () => {
      const mockAccountId = 'id';
      const mockDbResponse = 0;
      const mockRepositoryResponse = false;

      const mockUpdateAccountDto = {
        fullName: 'This Is The Full Name',
      } as IUpdateAccountDto;

      const mockSendUpdate = jest
        .spyOn(
          AccountRepository.prototype as unknown as {
            sendUpdateByIdQuery: () => Promise<number>;
          },
          'sendUpdateByIdQuery'
        )
        .mockResolvedValueOnce(mockDbResponse);

      const instance = new AccountRepository({} as unknown as Knex);

      const result = await instance.updateAccountById(
        mockAccountId,
        mockUpdateAccountDto
      );
      expect(result).toBe(mockRepositoryResponse);
      expect(mockSendUpdate).toHaveBeenCalledTimes(1);
      expect(mockSendUpdate).toHaveBeenCalledWith(
        mockAccountId,
        mockUpdateAccountDto
      );
    });

    it('fails to update an account by a error thrown by the database', async () => {
      const mockAccountId = 'id';
      const mockUpdateAccountDto = {
        fullName: 'This Is The Full Name',
      } as IUpdateAccountDto;

      const mockThrownError = new Error('some-error');
      const repositoryError = new RepositoryOperationError({
        cause: mockThrownError,
        context: contexts.UPDATE_ACCOUNT_BY_ID,
        details: {
          input: {
            accountId: mockAccountId,
            payload: mockUpdateAccountDto,
          },
        },
      });

      const mockSendUpdate = jest
        .spyOn(
          AccountRepository.prototype as unknown as {
            sendUpdateByIdQuery: () => Promise<number>;
          },
          'sendUpdateByIdQuery'
        )
        .mockRejectedValueOnce(mockThrownError);

      const instance = new AccountRepository({} as unknown as Knex);

      let thrown;
      try {
        await instance.updateAccountById(mockAccountId, mockUpdateAccountDto);
      } catch (error) {
        thrown = error;
      }

      expect(thrown).toBeInstanceOf(RepositoryOperationError);
      expect((thrown as RepositoryOperationError).cause).toEqual(
        mockThrownError
      );
      expect((thrown as RepositoryOperationError).context).toEqual(
        repositoryError.context
      );
      expect((thrown as RepositoryOperationError).details).toEqual(
        repositoryError.details
      );
      expect(mockSendUpdate).toHaveBeenCalledTimes(1);
      expect(mockSendUpdate).toHaveBeenCalledWith(
        mockAccountId,
        mockUpdateAccountDto
      );
    });
  });

  describe('removeAccountById', () => {
    it('removes an account by its id', async () => {
      const mockAccountId = 'id';
      const mockDbResponse = 1;
      const mockRepositoryResponse = true;

      const mockSendQuery = jest
        .spyOn(
          AccountRepository.prototype as unknown as {
            sendDeleteByIdQuery: () => Promise<number>;
          },
          'sendDeleteByIdQuery'
        )
        .mockResolvedValueOnce(mockDbResponse);

      const instance = new AccountRepository({} as unknown as Knex);

      const result = await instance.removeAccountById(mockAccountId);
      expect(result).toBe(mockRepositoryResponse);
      expect(mockSendQuery).toHaveBeenCalledTimes(1);
      expect(mockSendQuery).toHaveBeenCalledWith(mockAccountId);
    });

    it('fails to remove an account by receiving an empty response from the database (account does not exist)', async () => {
      const mockAccountId = 'id';
      const mockDbResponse = 0;
      const mockRepositoryResponse = false;

      const mockSendQuery = jest
        .spyOn(
          AccountRepository.prototype as unknown as {
            sendDeleteByIdQuery: () => Promise<number>;
          },
          'sendDeleteByIdQuery'
        )
        .mockResolvedValueOnce(mockDbResponse);

      const instance = new AccountRepository({} as unknown as Knex);

      const result = await instance.removeAccountById(mockAccountId);
      expect(result).toBe(mockRepositoryResponse);
      expect(mockSendQuery).toHaveBeenCalledTimes(1);
      expect(mockSendQuery).toHaveBeenCalledWith(mockAccountId);
    });

    it('fails to remove an account by a error thrown by the database', async () => {
      const mockAccountId = 'id';

      const mockThrownError = new Error('some-error');
      const repositoryError = new RepositoryOperationError({
        cause: mockThrownError,
        context: contexts.REMOVE_ACCOUNT_BY_ID,
        details: {
          input: {
            accountId: mockAccountId,
          },
        },
      });

      const mockSendQuery = jest
        .spyOn(
          AccountRepository.prototype as unknown as {
            sendDeleteByIdQuery: () => Promise<number>;
          },
          'sendDeleteByIdQuery'
        )
        .mockRejectedValueOnce(mockThrownError);

      const instance = new AccountRepository({} as unknown as Knex);

      let thrown;
      try {
        await instance.removeAccountById(mockAccountId);
      } catch (error) {
        thrown = error;
      }

      expect(thrown).toBeInstanceOf(RepositoryOperationError);
      expect((thrown as RepositoryOperationError).cause).toEqual(
        mockThrownError
      );
      expect((thrown as RepositoryOperationError).context).toEqual(
        repositoryError.context
      );
      expect((thrown as RepositoryOperationError).details).toEqual(
        repositoryError.details
      );
      expect(mockSendQuery).toHaveBeenCalledTimes(1);
      expect(mockSendQuery).toHaveBeenCalledWith(mockAccountId);
    });
  });
});
