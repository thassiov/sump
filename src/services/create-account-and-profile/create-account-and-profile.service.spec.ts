import { ServiceOperationError } from '../../lib/errors/service-operation.error';
import { logger } from '../../lib/logger';
import { ICreateAccountAndProfileDto } from '../../types/dto.type';
import { CreateAccountAndProfileService } from './create-account-and-profile.service';
import { ICreateAccountAndProfileRepository } from './types/repository.type';

describe('[SERVICE] account-profile-create', () => {
  let accountProfileCreateRepository: ICreateAccountAndProfileRepository;

  beforeAll(() => {
    jest.restoreAllMocks();

    accountProfileCreateRepository = {
      createNewAccountAndProfile: jest.fn(),
    };

    logger.info = jest.fn();
  });

  beforeEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
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
      const apcs = new CreateAccountAndProfileService(
        accountProfileCreateRepository
      );

      await expect(
        apcs.createNewAccountAndProfile(
          mockAccountInfo as ICreateAccountAndProfileDto
        )
      ).rejects.toThrow(ServiceOperationError);

      expect(logger.info).toHaveBeenCalled();
    }
  );

  it('should fail to create a new account due to repository error', async () => {
    (
      accountProfileCreateRepository.createNewAccountAndProfile as jest.Mock
    ).mockRejectedValueOnce(new Error('repository-failure'));

    const mockAccount = {
      handle: 'fakeHandle',
      fullName: 'fake name',
    };

    const apcs = new CreateAccountAndProfileService(
      accountProfileCreateRepository
    );

    await expect(apcs.createNewAccountAndProfile(mockAccount)).rejects.toThrow(
      'repository-failure'
    );
    expect(logger.info).toHaveBeenCalled();
  });

  it('should create a new account', async () => {
    const mockAccount = {
      handle: 'userHandle',
      fullName: 'user full name',
    };

    (
      accountProfileCreateRepository.createNewAccountAndProfile as jest.Mock
    ).mockResolvedValueOnce({
      id: 'id',
    });

    const apcs = new CreateAccountAndProfileService(
      accountProfileCreateRepository
    );

    const result = await apcs.createNewAccountAndProfile(mockAccount);

    expect(result).toEqual({ id: 'id' });
  });
});
