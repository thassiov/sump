import { ModelStatic, Sequelize, Transaction } from 'sequelize';
import { AccountModel, ProfileModel } from '../../infra/db';
import { contexts } from '../../lib/contexts';
import { RepositoryOperationError } from '../../lib/errors';
import { logger } from '../../lib/logger';
import { CreateAccountAndProfileRepository } from './create-account-and-profile.repository';
import { ICreateAccountDto, ICreateProfileDto } from './types';

jest.mock('sequelize');
jest.mock('../../lib/errors');
jest.mock('../../infra/db');

describe('[REPOSITORY] account-profile-create', () => {
  beforeAll(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();

    logger.info = jest.fn();
    logger.error = jest.fn();
  });

  it('should create account and profile', async () => {
    const mockAccountInfo = {
      handle: 'userhandle',
    } as ICreateAccountDto;

    const mockAccountId = 'mockaccountid';
    const mockProfileId = 'mockprofileid';

    const mockProfileInfo = {
      fullName: 'user name',
    } as ICreateProfileDto;

    const sequelize = new Sequelize();
    const mockTransaction = new Transaction(sequelize, {});
    jest.spyOn(sequelize, 'transaction').mockResolvedValueOnce(mockTransaction);

    const mockCreateAccountResult = {
      get: jest.fn().mockReturnValueOnce(mockAccountId),
    };

    jest
      .spyOn(AccountModel, 'create')
      .mockResolvedValueOnce(mockCreateAccountResult);

    const mockCreateProfileResult = {
      get: jest.fn().mockReturnValueOnce(mockProfileId),
    };

    jest
      .spyOn(ProfileModel, 'create')
      .mockResolvedValueOnce(mockCreateProfileResult);

    jest.spyOn(sequelize, 'model').mockReturnValueOnce(AccountModel);
    jest.spyOn(sequelize, 'model').mockReturnValueOnce(ProfileModel);

    const accountProfileCreateRepository =
      new CreateAccountAndProfileRepository(sequelize);

    const result = await accountProfileCreateRepository.create(
      mockAccountInfo,
      mockProfileInfo
    );

    expect(result).toEqual({ accountId: mockAccountId });
    expect(logger.info).toHaveBeenCalledWith('creating account');
    expect(logger.info).toHaveBeenCalledWith('creating profile');
  });

  it('should fail to create by throwing at createAccount method', async () => {
    const mockAccountInfo = {
      handle: 'userhandle',
    } as ICreateAccountDto;

    const mockProfileId = 'mockprofileid';

    const mockProfileInfo = {
      fullName: 'user name',
    } as ICreateProfileDto;

    const sequelize = new Sequelize();
    const mockTransaction = new Transaction(sequelize, {});
    jest.spyOn(sequelize, 'transaction').mockResolvedValueOnce(mockTransaction);

    const mockAccountCreateError = new Error('error');

    const mockAccountModel = {
      create: jest.fn().mockRejectedValueOnce(mockAccountCreateError),
    };

    const mockCreateProfileResult = {
      get: jest.fn().mockReturnValueOnce(mockProfileId),
    };

    const mockProfileModel = {
      create: jest.fn().mockResolvedValueOnce(mockCreateProfileResult),
    };

    jest
      .spyOn(sequelize, 'model')
      .mockReturnValueOnce(
        mockAccountModel as unknown as ModelStatic<AccountModel>
      );

    jest
      .spyOn(sequelize, 'model')
      .mockReturnValueOnce(
        mockProfileModel as unknown as ModelStatic<ProfileModel>
      );

    const accountProfileCreateRepository =
      new CreateAccountAndProfileRepository(sequelize);

    await expect(
      accountProfileCreateRepository.create(mockAccountInfo, mockProfileInfo)
    ).rejects.toBeInstanceOf(RepositoryOperationError);

    expect(logger.error).toHaveBeenCalled();

    expect(RepositoryOperationError).toHaveBeenCalledWith({
      cause: mockAccountCreateError,
      details: {
        input: {
          accountInfo: mockAccountInfo,
          profileInfo: mockProfileInfo,
        },
      },
      context: contexts.ACCOUNT_PROFILE_CREATE,
    });

    expect(mockAccountModel.create).toHaveBeenCalledWith(mockAccountInfo, {
      transaction: mockTransaction,
    });

    expect(mockProfileModel.create).not.toHaveBeenCalled();
  });

  it('should fail to create by throwing at createProfile method', async () => {
    const mockAccountInfo = {
      handle: 'userhandle',
    } as ICreateAccountDto;

    const mockAccountId = 'mockaccountid';

    const mockProfileInfo = {
      fullName: 'user name',
    } as ICreateProfileDto;

    const sequelize = new Sequelize();
    const mockTransaction = new Transaction(sequelize, {});
    jest.spyOn(sequelize, 'transaction').mockResolvedValueOnce(mockTransaction);

    const mockCreateAccountResult = {
      get: jest.fn().mockReturnValueOnce(mockAccountId),
    };

    const mockAccountModel = {
      create: jest.fn().mockResolvedValueOnce(mockCreateAccountResult),
    };

    const mockProfileCreateError = new Error('error');

    const mockProfileModel = {
      create: jest.fn().mockRejectedValueOnce(mockProfileCreateError),
    };

    jest
      .spyOn(sequelize, 'model')
      .mockReturnValueOnce(
        mockAccountModel as unknown as ModelStatic<AccountModel>
      );

    jest
      .spyOn(sequelize, 'model')
      .mockReturnValueOnce(
        mockProfileModel as unknown as ModelStatic<ProfileModel>
      );

    const accountProfileCreateRepository =
      new CreateAccountAndProfileRepository(sequelize);

    await expect(
      accountProfileCreateRepository.create(mockAccountInfo, mockProfileInfo)
    ).rejects.toBeInstanceOf(RepositoryOperationError);

    expect(logger.error).toHaveBeenCalled();

    expect(RepositoryOperationError).toHaveBeenCalledWith({
      cause: mockProfileCreateError,
      details: {
        input: {
          accountInfo: mockAccountInfo,
          profileInfo: mockProfileInfo,
        },
      },
      context: contexts.ACCOUNT_PROFILE_CREATE,
    });

    expect(mockAccountModel.create).toHaveBeenCalledWith(mockAccountInfo, {
      transaction: mockTransaction,
    });

    expect(mockProfileModel.create).toHaveBeenCalledWith(mockProfileInfo, {
      transaction: mockTransaction,
    });
  });
});
