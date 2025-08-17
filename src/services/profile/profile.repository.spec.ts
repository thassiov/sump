import { Knex } from 'knex';
import { IInsertReturningId } from '../../infra/database/postgres/types';
import { contexts } from '../../lib/contexts';
import { RepositoryOperationError } from '../../lib/errors';
import { ICreateProfileDto, IUpdateProfileDto } from '../../types/dto.type';
import { IProfile } from '../../types/profile.type';
import { ProfileRepository } from './profile.repository';

describe('[repository] profile', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  describe('create', () => {
    it('creates a new profile', async () => {
      const mockProfileId = 'id';
      const mockDbResponse: IInsertReturningId = [{ id: mockProfileId }];
      const mockCreateProfileDto = {
        fullName: 'full name',
      } as ICreateProfileDto;

      const mockSendInsert = jest
        .spyOn(
          ProfileRepository.prototype as unknown as {
            sendInsertReturningIdQuery: () => Promise<IInsertReturningId>;
          },
          'sendInsertReturningIdQuery'
        )
        .mockResolvedValueOnce(mockDbResponse);

      const instance = new ProfileRepository({} as unknown as Knex);

      const result = await instance.create(mockCreateProfileDto);
      expect(result).toBe(mockProfileId);
      expect(mockSendInsert).toHaveBeenCalledTimes(1);
      expect(mockSendInsert).toHaveBeenCalledWith(
        mockCreateProfileDto,
        undefined
      );
    });

    // @TODO: this test is identical to the 'error thrown by the database' case. The repository logic maybe
    // needs a bit more refining
    it('fails to create a new profile by receiving an empty response from the database', async () => {
      const mockDbResponse: IInsertReturningId = [];
      const mockCreateProfileDto = {
        fullName: 'full name',
      } as ICreateProfileDto;

      const mockThrownError = new Error('could-not-create-profile');
      const repositoryError = new RepositoryOperationError({
        cause: mockThrownError,
        context: contexts.ACCOUNT_PROFILE_CREATE,
        details: {
          input: {
            payload: mockCreateProfileDto,
          },
        },
      });

      const mockSendInsert = jest
        .spyOn(
          ProfileRepository.prototype as unknown as {
            sendInsertReturningIdQuery: () => Promise<IInsertReturningId>;
          },
          'sendInsertReturningIdQuery'
        )
        .mockResolvedValueOnce(mockDbResponse);

      const instance = new ProfileRepository({} as unknown as Knex);

      let thrown;
      try {
        await instance.create(mockCreateProfileDto);
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
        mockCreateProfileDto,
        undefined
      );
    });

    it('fails to create a new profile by a error thrown by the database', async () => {
      const mockCreateProfileDto = {
        fullName: 'full name',
      } as ICreateProfileDto;

      const mockThrownError = new Error('some-other-error');
      const repositoryError = new RepositoryOperationError({
        cause: mockThrownError,
        context: contexts.ACCOUNT_PROFILE_CREATE,
        details: {
          input: {
            payload: mockCreateProfileDto,
          },
        },
      });

      const mockSendInsert = jest
        .spyOn(
          ProfileRepository.prototype as unknown as {
            sendInsertReturningIdQuery: () => Promise<IInsertReturningId>;
          },
          'sendInsertReturningIdQuery'
        )
        .mockRejectedValueOnce(mockThrownError);

      const instance = new ProfileRepository({} as unknown as Knex);

      let thrown;
      try {
        await instance.create(mockCreateProfileDto);
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
        mockCreateProfileDto,
        undefined
      );
    });
  });

  describe('getProfileByAccountId', () => {
    it('gets a profile by its account id', async () => {
      const mockAccountId = 'account_id';
      const mockDbResponse: IProfile = {
        id: 'id',
        accountId: mockAccountId,
        fullName: 'full name',
        createdAt: 'date',
        updatedAt: 'date',
      };

      const mockSendQuery = jest
        .spyOn(
          ProfileRepository.prototype as unknown as {
            sendFindByAccountIdQuery: () => Promise<IProfile | undefined>;
          },
          'sendFindByAccountIdQuery'
        )
        .mockResolvedValueOnce(mockDbResponse);

      const instance = new ProfileRepository({} as unknown as Knex);

      const result = await instance.getProfileByAccountId(mockAccountId);
      expect(result).toBe(mockDbResponse);
      expect(mockSendQuery).toHaveBeenCalledTimes(1);
      expect(mockSendQuery).toHaveBeenCalledWith(mockAccountId);
    });

    it('gets an empty response as the profile does not exist', async () => {
      const mockAccountId = 'account_id';
      const mockDbResponse = undefined;

      const mockSendQuery = jest
        .spyOn(
          ProfileRepository.prototype as unknown as {
            sendFindByAccountIdQuery: () => Promise<IProfile | undefined>;
          },
          'sendFindByAccountIdQuery'
        )
        .mockResolvedValueOnce(mockDbResponse);

      const instance = new ProfileRepository({} as unknown as Knex);

      const result = await instance.getProfileByAccountId(mockAccountId);
      expect(result).toBe(mockDbResponse);
      expect(mockSendQuery).toHaveBeenCalledTimes(1);
      expect(mockSendQuery).toHaveBeenCalledWith(mockAccountId);
    });

    it('fails to get a profile by a error thrown by the database', async () => {
      const mockAccountId = 'account_id';

      const mockThrownError = new Error('some-error');
      const repositoryError = new RepositoryOperationError({
        cause: mockThrownError,
        context: contexts.GET_PROFILE_BY_ACCOUNT_ID,
        details: {
          input: {
            accountId: mockAccountId,
          },
        },
      });

      const mockSendQuery = jest
        .spyOn(
          ProfileRepository.prototype as unknown as {
            sendFindByAccountIdQuery: () => Promise<IProfile | undefined>;
          },
          'sendFindByAccountIdQuery'
        )
        .mockRejectedValueOnce(mockThrownError);

      const instance = new ProfileRepository({} as unknown as Knex);

      let thrown;
      try {
        await instance.getProfileByAccountId(mockAccountId);
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

  describe('updateProfileByAccountId', () => {
    it('updates an profile by its account id', async () => {
      const mockAccountId = 'account_id';
      const mockDbResponse = 1;
      const mockRepositoryResponse = true;

      const mockUpdateProfileDto = {
        fullName: 'full name',
      } as IUpdateProfileDto;

      const mockSendUpdate = jest
        .spyOn(
          ProfileRepository.prototype as unknown as {
            sendUpdateByAccountIdQuery: () => Promise<number>;
          },
          'sendUpdateByAccountIdQuery'
        )
        .mockResolvedValueOnce(mockDbResponse);

      const instance = new ProfileRepository({} as unknown as Knex);

      const result = await instance.updateProfileByAccountId(
        mockAccountId,
        mockUpdateProfileDto
      );
      expect(result).toBe(mockRepositoryResponse);
      expect(mockSendUpdate).toHaveBeenCalledTimes(1);
      expect(mockSendUpdate).toHaveBeenCalledWith(
        mockAccountId,
        mockUpdateProfileDto
      );
    });

    it('fails to update a profile by receiving an empty response from the database (profile does not exist)', async () => {
      const mockAccountId = 'account_id';
      const mockDbResponse = 0;
      const mockRepositoryResponse = false;

      const mockUpdateProfileDto = {
        fullName: 'full name',
      } as IUpdateProfileDto;

      const mockSendUpdate = jest
        .spyOn(
          ProfileRepository.prototype as unknown as {
            sendUpdateByAccountIdQuery: () => Promise<number>;
          },
          'sendUpdateByAccountIdQuery'
        )
        .mockResolvedValueOnce(mockDbResponse);

      const instance = new ProfileRepository({} as unknown as Knex);

      const result = await instance.updateProfileByAccountId(
        mockAccountId,
        mockUpdateProfileDto
      );
      expect(result).toBe(mockRepositoryResponse);
      expect(mockSendUpdate).toHaveBeenCalledTimes(1);
      expect(mockSendUpdate).toHaveBeenCalledWith(
        mockAccountId,
        mockUpdateProfileDto
      );
    });

    it('fails to update a profile by a error thrown by the database', async () => {
      const mockAccountId = 'account_id';
      const mockUpdateProfileDto = {
        fullName: 'full name',
      } as IUpdateProfileDto;

      const mockThrownError = new Error('some-error');
      const repositoryError = new RepositoryOperationError({
        cause: mockThrownError,
        context: contexts.UPDATE_PROFILE_BY_ACCOUNT_ID,
        details: {
          input: {
            accountId: mockAccountId,
            payload: mockUpdateProfileDto,
          },
        },
      });

      const mockSendUpdate = jest
        .spyOn(
          ProfileRepository.prototype as unknown as {
            sendUpdateByAccountIdQuery: () => Promise<number>;
          },
          'sendUpdateByAccountIdQuery'
        )
        .mockRejectedValueOnce(mockThrownError);

      const instance = new ProfileRepository({} as unknown as Knex);

      let thrown;
      try {
        await instance.updateProfileByAccountId(
          mockAccountId,
          mockUpdateProfileDto
        );
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
        mockUpdateProfileDto
      );
    });
  });
});
