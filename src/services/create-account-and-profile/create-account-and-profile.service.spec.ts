import { ServiceOperationError } from '../../lib/errors/service-operation.error';
import { logger } from '../../lib/logger';
import { IAccountProfileCreateRepository } from '../../repositories/account-profile-create/types';
import { AccountProfileCreateService } from './account-profile-create.service';
import { IAccountProfileDto } from './types';

describe('[SERVICE] account-profile-create', () => {
  let accountProfileCreateRepository: IAccountProfileCreateRepository;

  beforeAll(() => {
    jest.restoreAllMocks();

    accountProfileCreateRepository = {
      create: jest.fn(),
    };

    logger.info = jest.fn();
  });

  it.each([
    [{}],
    [true],
    [10],
    [{ fullName: '', handle: '' }],
    [{ fullName: undefined, handle: '' }],
    [{ fullName: undefined, handle: undefined }],
    [{ fullName: 'a', handle: 2 }],
    [{ fullName: [], handle: 'a' }],
  ])(
    'should fail to create a new account due to validation error (%p)',
    async (mockAccountInfo) => {
      const apcs = new AccountProfileCreateService(
        accountProfileCreateRepository
      );

      await expect(
        apcs.create(mockAccountInfo as IAccountProfileDto)
      ).rejects.toThrow(ServiceOperationError);

      expect(logger.info).toHaveBeenCalled();
    }
  );

  it('should fail to create a new account due to repository error', async () => {
    (accountProfileCreateRepository.create as jest.Mock).mockRejectedValueOnce(
      new Error('repository-failure')
    );

    const mockAccount = {
      handle: 'fakeHandle',
      fullName: 'fake name',
    };

    const apcs = new AccountProfileCreateService(
      accountProfileCreateRepository
    );

    await expect(apcs.create(mockAccount)).rejects.toThrow(
      'repository-failure'
    );
    expect(logger.info).toHaveBeenCalled();
  });

  it('should create a new account', async () => {
    const mockAccount = {
      handle: 'userHandle',
      fullName: 'user full name',
    };

    (accountProfileCreateRepository.create as jest.Mock).mockResolvedValueOnce({
      id: 'id',
    });

    const apcs = new AccountProfileCreateService(
      accountProfileCreateRepository
    );

    const result = await apcs.create(mockAccount);

    expect(result).toEqual({ id: 'id' });
  });
});
