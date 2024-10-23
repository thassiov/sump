import { logger } from '../../lib/logger';
import { IProfileRetrieveRepository } from '../../repositories/profile-retrieve/types';
import { ProfileRetrieveService } from './profile-retrieve.service';

describe('[SERVICE] profile-retrieve', () => {
  let mockProfileRetrieveRepository: IProfileRetrieveRepository;

  beforeAll(() => {
    jest.restoreAllMocks();

    mockProfileRetrieveRepository = {
      retrieveByAccountId: jest.fn(),
    };

    logger.info = jest.fn();
  });

  it('should get a profile from the account id', async () => {
    const mockAccountId = 'account-id';

    const mockProfile = {
      id: 'profile-id',
      createdAt: new Date().toString(),
      fullName: 'Profile Name',
    };

    (
      mockProfileRetrieveRepository.retrieveByAccountId as jest.Mock
    ).mockResolvedValueOnce(mockProfile);

    const prr = new ProfileRetrieveService(mockProfileRetrieveRepository);

    const result = await prr.retrieveByAccountId(mockAccountId);

    expect(result).toBe(mockProfile);
  });

  it('should not get a profile (not found)', async () => {
    const mockAccountId = 'account-id';

    (
      mockProfileRetrieveRepository.retrieveByAccountId as jest.Mock
    ).mockResolvedValueOnce(undefined);

    const prr = new ProfileRetrieveService(mockProfileRetrieveRepository);

    const result = await prr.retrieveByAccountId(mockAccountId);

    expect(result).toBeNull();
  });

  it('should handle a error when trying to retrieve a profile', async () => {
    const mockAccountId = 'account-id';

    const mockErrorMessage = 'the error';
    const mockError = new Error(mockErrorMessage);

    (
      mockProfileRetrieveRepository.retrieveByAccountId as jest.Mock
    ).mockRejectedValueOnce(mockError);

    const prr = new ProfileRetrieveService(mockProfileRetrieveRepository);

    await expect(() => prr.retrieveByAccountId(mockAccountId)).rejects.toThrow(
      mockErrorMessage
    );
  });
});
