import { faker } from '@faker-js/faker';
import { Knex } from 'knex';
import { IInsertReturningId } from '../../infra/database/postgres/types';
import { contexts } from '../../lib/contexts';
import {
  NotExpectedError,
  NotFoundError,
  UnexpectedError,
} from '../../lib/errors';
import { AccountRepository } from './account.repository';
import { IGetAccountDto, IUpdateAccountAllowedDtos } from './types/dto.type';

describe('account.repository', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  describe('create', () => {
    it('creates a new account', async () => {
      const mockAccountId = faker.string.uuid();
      const mockDbResponse: IInsertReturningId = [{ id: mockAccountId }];

      const mockAccount = {
        email: faker.internet.email(),
        phone: faker.phone.number({ style: 'international' }),
        name: faker.person.fullName(),
        username: faker.internet.username(),
        avatarUrl: faker.image.url(),
        tenantId: faker.string.uuid(),
        roles: ['admin'],
      };

      const mockSendInsert = jest
        .spyOn(
          AccountRepository.prototype as unknown as {
            sendInsertReturningIdQuery: () => Promise<IInsertReturningId>;
          },
          'sendInsertReturningIdQuery'
        )
        .mockResolvedValueOnce(mockDbResponse);

      const accountRepository = new AccountRepository({} as unknown as Knex);

      const result = await accountRepository.create(mockAccount);
      expect(result).toBe(mockAccountId);
      expect(mockSendInsert).toHaveBeenCalledTimes(1);
      expect(mockSendInsert).toHaveBeenCalledWith(mockAccount, undefined);
    });

    it('fails to create a new account by receiving an empty response from the database', async () => {
      const mockDbResponse: IInsertReturningId = [];
      const mockAccount = {
        email: faker.internet.email(),
        phone: faker.phone.number({ style: 'international' }),
        name: faker.person.fullName(),
        username: faker.internet.username(),
        avatarUrl: faker.image.url(),
        tenantId: faker.string.uuid(),
        roles: ['admin'],
      };

      const mockThrownError = new NotExpectedError({
        context: contexts.ACCOUNT_CREATE,
        details: {
          input: {
            ...mockAccount,
          },
          output: undefined,
          message: 'database insert operation did not return an id',
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

      const accountRepository = new AccountRepository({} as unknown as Knex);

      let thrown;
      try {
        await accountRepository.create(mockAccount);
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
      expect(mockSendInsert).toHaveBeenCalledWith(mockAccount, undefined);
    });

    it('fails to create a new account by a error thrown by the database', async () => {
      const mockAccount = {
        email: faker.internet.email(),
        phone: faker.phone.number({ style: 'international' }),
        name: faker.person.fullName(),
        username: faker.internet.username(),
        avatarUrl: faker.image.url(),
        tenantId: faker.string.uuid(),
        roles: ['admin'],
      };

      const mockThrownError = new Error('some-other-error');
      const repositoryError = new UnexpectedError({
        cause: mockThrownError,
        context: contexts.ACCOUNT_CREATE,
        details: {
          input: {
            ...mockAccount,
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

      const accountRepository = new AccountRepository({} as unknown as Knex);

      let thrown;
      try {
        await accountRepository.create(mockAccount);
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
      expect(mockSendInsert).toHaveBeenCalledWith(mockAccount, undefined);
    });
  });

  describe('getById', () => {
    it('gets an account by its id', async () => {
      const mockAccountId = faker.string.uuid();

      const mockGetAccountResponse: IGetAccountDto = {
        id: mockAccountId,
        email: faker.internet.email(),
        phone: faker.phone.number({ style: 'international' }),
        name: faker.person.fullName(),
        username: faker.internet.username(),
        avatarUrl: faker.image.url(),
        tenantId: faker.string.uuid(),
        roles: ['owner'],
      };

      const mockSendQuery = jest
        .spyOn(
          AccountRepository.prototype as unknown as {
            sendFindByIdQuery: () => Promise<IGetAccountDto | undefined>;
          },
          'sendFindByIdQuery'
        )
        .mockResolvedValueOnce(mockGetAccountResponse);

      const instance = new AccountRepository({} as unknown as Knex);

      const result = await instance.getById(mockAccountId);
      expect(result).toEqual(mockGetAccountResponse);
      expect(mockSendQuery).toHaveBeenCalledTimes(1);
      expect(mockSendQuery).toHaveBeenCalledWith(mockAccountId);
    });

    it('gets an empty response as the account does not exist', async () => {
      const mockAccountId = faker.string.uuid();
      const mockDbResponse = undefined;

      const mockSendQuery = jest
        .spyOn(
          AccountRepository.prototype as unknown as {
            sendFindByIdQuery: () => Promise<IGetAccountDto | undefined>;
          },
          'sendFindByIdQuery'
        )
        .mockResolvedValueOnce(mockDbResponse);

      const instance = new AccountRepository({} as unknown as Knex);

      const result = await instance.getById(mockAccountId);
      expect(result).toBe(mockDbResponse);
      expect(mockSendQuery).toHaveBeenCalledTimes(1);
      expect(mockSendQuery).toHaveBeenCalledWith(mockAccountId);
    });

    it('fails to get an account by a error thrown by the database', async () => {
      const mockAccountId = faker.string.uuid();

      const mockThrownError = new Error('some-error');
      const repositoryError = new UnexpectedError({
        cause: mockThrownError,
        context: contexts.ACCOUNT_GET_BY_ID,
        details: {
          input: {
            id: mockAccountId,
          },
        },
      });

      const mockSendQuery = jest
        .spyOn(
          AccountRepository.prototype as unknown as {
            sendFindByIdQuery: () => Promise<IGetAccountDto | undefined>;
          },
          'sendFindByIdQuery'
        )
        .mockRejectedValueOnce(mockThrownError);

      const instance = new AccountRepository({} as unknown as Knex);

      let thrown;
      try {
        await instance.getById(mockAccountId);
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
      expect(mockSendQuery).toHaveBeenCalledWith(mockAccountId);
    });
  });

  describe('updateById', () => {
    it('updates an account by its id', async () => {
      const mockAccountId = faker.string.uuid();
      const mockDbResponse = 1;
      const mockRepositoryResponse = true;

      const mockUpdateAccountDto = {
        name: 'This Is The Full Name',
      } as IUpdateAccountAllowedDtos;

      const mockSendUpdate = jest
        .spyOn(
          AccountRepository.prototype as unknown as {
            sendUpdateByIdQuery: () => Promise<number>;
          },
          'sendUpdateByIdQuery'
        )
        .mockResolvedValueOnce(mockDbResponse);

      const instance = new AccountRepository({} as unknown as Knex);

      const result = await instance.updateById(
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
      const mockAccountId = faker.string.uuid();
      const mockDbResponse = 0;

      const mockUpdateAccountDto = {
        name: 'This Is The Full Name',
      } as IUpdateAccountAllowedDtos;

      const mockThrownError = new NotFoundError({
        context: contexts.ACCOUNT_UPDATE_BY_ID,
        details: {
          input: {
            id: mockAccountId,
            ...mockUpdateAccountDto,
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
        .mockResolvedValueOnce(mockDbResponse);

      const instance = new AccountRepository({} as unknown as Knex);

      let thrown;
      try {
        await instance.updateById(mockAccountId, mockUpdateAccountDto);
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
        mockAccountId,
        mockUpdateAccountDto
      );
    });

    it('fails to update an account by a error thrown by the database', async () => {
      const mockAccountId = faker.string.uuid();
      const mockUpdateAccountDto = {
        name: 'This Is The Full Name',
      } as IUpdateAccountAllowedDtos;

      const mockThrownError = new Error('some-error');
      const repositoryError = new UnexpectedError({
        cause: mockThrownError,
        context: contexts.ACCOUNT_UPDATE_BY_ID,
        details: {
          input: {
            id: mockAccountId,
            ...mockUpdateAccountDto,
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
        await instance.updateById(mockAccountId, mockUpdateAccountDto);
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
        mockAccountId,
        mockUpdateAccountDto
      );
    });
  });

  describe('deleteById', () => {
    it('removes an account by its id', async () => {
      const mockAccountId = faker.string.uuid();
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

      const result = await instance.deleteById(mockAccountId);
      expect(result).toBe(mockRepositoryResponse);
      expect(mockSendQuery).toHaveBeenCalledTimes(1);
      expect(mockSendQuery).toHaveBeenCalledWith(mockAccountId);
    });

    it('fails to remove an account by receiving an empty response from the database (account does not exist)', async () => {
      const mockAccountId = faker.string.uuid();
      const mockDbResponse = 0;

      const mockThrownError = new NotFoundError({
        context: contexts.ACCOUNT_DELETE_BY_ID,
        details: {
          input: {
            id: mockAccountId,
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
        .mockResolvedValueOnce(mockDbResponse);

      const instance = new AccountRepository({} as unknown as Knex);

      let thrown;
      try {
        await instance.deleteById(mockAccountId);
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
      expect(mockSendQuery).toHaveBeenCalledWith(mockAccountId);
    });

    it('fails to remove an account by a error thrown by the database', async () => {
      const mockAccountId = faker.string.uuid();

      const mockThrownError = new Error('some-error');
      const repositoryError = new UnexpectedError({
        cause: mockThrownError,
        context: contexts.ACCOUNT_DELETE_BY_ID,
        details: {
          input: {
            id: mockAccountId,
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
        await instance.deleteById(mockAccountId);
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
      expect(mockSendQuery).toHaveBeenCalledWith(mockAccountId);
    });
  });
});
