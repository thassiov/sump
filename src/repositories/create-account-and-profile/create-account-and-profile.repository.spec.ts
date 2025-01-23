import { Knex } from 'knex';
import { contexts } from '../../lib/contexts';
import { RepositoryOperationError } from '../../lib/errors';
import { ICreateAccountDto, ICreateProfileDto } from '../../types/dto.type';
import { IAccountRepository } from '../account/types';
import { IProfileRepository } from '../profile/types';
import { CreateAccountAndProfileRepository } from './create-account-and-profile.repository';

describe('[REPOSITORY] create-account-profile', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  const mockTransactionObject = {
    commit: jest.fn(),
    rollback: jest.fn(),
  };

  const mockDbClient = {
    transaction: async () => Promise.resolve(mockTransactionObject),
  };

  const mockAccountRepository = {
    create: jest.fn(),
  };

  const mockProfileRepository = {
    create: jest.fn(),
  };

  it('should create account and profile', async () => {
    const mockCreateAccountDto = {
      username: 'username',
    } as ICreateAccountDto;

    const mockCreateProfileDto = {
      fullName: 'full name',
    } as ICreateProfileDto;

    const mockAccountId = 'mockaccountid';
    const mockProfileId = 'mockprofileid';

    mockAccountRepository.create.mockResolvedValueOnce(mockAccountId);
    mockProfileRepository.create.mockResolvedValueOnce(mockProfileId);

    const instance = new CreateAccountAndProfileRepository(
      mockDbClient as unknown as Knex,
      mockAccountRepository as unknown as IAccountRepository,
      mockProfileRepository as unknown as IProfileRepository
    );

    const result = await instance.createNewAccountAndProfile(
      mockCreateAccountDto,
      mockCreateProfileDto
    );

    expect(result).toEqual({ accountId: mockAccountId });
    expect(mockAccountRepository.create).toHaveBeenCalledTimes(1);
    expect(mockAccountRepository.create).toHaveBeenCalledWith(
      mockCreateAccountDto,
      mockTransactionObject
    );
    expect(mockProfileRepository.create).toHaveBeenCalledTimes(1);
    expect(mockProfileRepository.create).toHaveBeenCalledWith(
      {
        ...mockCreateProfileDto,
        accountId: mockAccountId,
      },
      mockTransactionObject
    );
    expect(mockTransactionObject.commit).toHaveBeenCalledTimes(1);
    expect(mockTransactionObject.rollback).not.toHaveBeenCalled();
  });

  it('should fail by having the account creating process to throw an error', async () => {
    const mockCreateAccountDto = {
      username: 'username',
    } as ICreateAccountDto;

    const mockCreateProfileDto = {
      fullName: 'full name',
    } as ICreateProfileDto;

    const mockError = new Error('some-error');
    const mockOperationError = new RepositoryOperationError({
      cause: mockError,
      context: contexts.ACCOUNT_PROFILE_CREATE,
      details: {
        input: { accountDto: mockCreateAccountDto },
      },
    });

    mockAccountRepository.create.mockRejectedValueOnce(mockOperationError);

    const instance = new CreateAccountAndProfileRepository(
      mockDbClient as unknown as Knex,
      mockAccountRepository as unknown as IAccountRepository,
      mockProfileRepository as unknown as IProfileRepository
    );

    let thrown;
    try {
      await instance.createNewAccountAndProfile(
        mockCreateAccountDto,
        mockCreateProfileDto
      );
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBeInstanceOf(RepositoryOperationError);
    expect((thrown as RepositoryOperationError).cause).toEqual(mockError);
    expect((thrown as RepositoryOperationError).context).toEqual(
      mockOperationError.context
    );
    expect((thrown as RepositoryOperationError).details).toStrictEqual(
      mockOperationError.details
    );
    expect(mockAccountRepository.create).toHaveBeenCalledTimes(1);
    expect(mockAccountRepository.create).toHaveBeenCalledWith(
      mockCreateAccountDto,
      mockTransactionObject
    );
    expect(mockProfileRepository.create).not.toHaveBeenCalled();
    expect(mockTransactionObject.commit).not.toHaveBeenCalled();
    expect(mockTransactionObject.rollback).toHaveBeenCalledTimes(1);
  });

  it('should fail by having the profile creating process to throw an error', async () => {
    const mockCreateAccountDto = {
      username: 'username',
    } as ICreateAccountDto;

    const mockCreateProfileDto = {
      fullName: 'full name',
    } as ICreateProfileDto;

    const mockAccountId = 'mockaccountid';
    mockAccountRepository.create.mockResolvedValueOnce(mockAccountId);

    const mockError = new Error('some-error');
    const mockOperationError = new RepositoryOperationError({
      cause: mockError,
      context: contexts.ACCOUNT_PROFILE_CREATE,
      details: {
        input: {
          profileDto: { ...mockCreateProfileDto, accountId: mockAccountId },
        },
      },
    });

    mockProfileRepository.create.mockRejectedValueOnce(mockOperationError);

    const instance = new CreateAccountAndProfileRepository(
      mockDbClient as unknown as Knex,
      mockAccountRepository as unknown as IAccountRepository,
      mockProfileRepository as unknown as IProfileRepository
    );

    let thrown;
    try {
      await instance.createNewAccountAndProfile(
        mockCreateAccountDto,
        mockCreateProfileDto
      );
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBeInstanceOf(RepositoryOperationError);
    expect((thrown as RepositoryOperationError).cause).toEqual(mockError);
    expect((thrown as RepositoryOperationError).context).toEqual(
      mockOperationError.context
    );
    expect((thrown as RepositoryOperationError).details).toStrictEqual(
      mockOperationError.details
    );
    expect(mockAccountRepository.create).toHaveBeenCalledTimes(1);
    expect(mockAccountRepository.create).toHaveBeenCalledWith(
      mockCreateAccountDto,
      mockTransactionObject
    );
    expect(mockProfileRepository.create).toHaveBeenCalledTimes(1);
    expect(mockProfileRepository.create).toHaveBeenCalledWith(
      {
        ...mockCreateProfileDto,
        accountId: mockAccountId,
      },
      mockTransactionObject
    );
    expect(mockTransactionObject.commit).not.toHaveBeenCalled();
    expect(mockTransactionObject.rollback).toHaveBeenCalledTimes(1);
  });
});
