import { IUpdateProfileDto } from '../../types/dto.type';
import { IProfile } from '../../types/profile.type';
import { ProfileService } from './profile.service';
import { IProfileRepository } from './types/repository.type';

describe('Profile Service', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  const mockProfileRepository = {
    getProfileByAccountId: jest.fn(),
    updateProfileByAccountId: jest.fn(),
  };

  describe('getProfileByAccountId', () => {
    it('should retrieve a profile', async () => {
      const mockAccountId = 'accountId';
      const mockProfile: IProfile = {
        id: 'id',
        accountId: mockAccountId,
        fullName: 'full name',
        createdAt: 'date',
        updatedAt: 'date',
      };

      mockProfileRepository.getProfileByAccountId.mockResolvedValue(
        mockProfile
      );

      const instance = new ProfileService(
        mockProfileRepository as unknown as IProfileRepository
      );

      const result = await instance.getProfileByAccountId(mockAccountId);

      expect(result).toEqual(mockProfile);
    });
  });

  describe('updateProfileByAccountId', () => {
    it('should update an profile', async () => {
      const mockAccountId = 'id';
      const mockUpdateProfileDto: IUpdateProfileDto = {
        fullName: 'full name',
      };
      const mockUpdateProfileResult = true;

      mockProfileRepository.updateProfileByAccountId.mockResolvedValue(
        mockUpdateProfileResult
      );

      const instance = new ProfileService(
        mockProfileRepository as unknown as IProfileRepository
      );

      const result = await instance.updateProfileByAccountId(
        mockAccountId,
        mockUpdateProfileDto
      );

      expect(result).toEqual(mockUpdateProfileResult);
    });
  });
});
