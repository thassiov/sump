import { faker } from '@faker-js/faker';
import { PasswordResetService } from './password-reset.service';
import { PasswordResetRepository } from '../repositories';
import { PasswordService } from './password.service';
import { SessionService } from './session.service';
import { SumpAuthConfig } from '../config';
import { IPasswordResetToken } from '../types';

describe('PasswordResetService', () => {
  let service: PasswordResetService;
  let mockPasswordResetRepository: jest.Mocked<PasswordResetRepository>;
  let mockPasswordService: jest.Mocked<PasswordService>;
  let mockSessionService: jest.Mocked<SessionService>;
  let mockConfig: SumpAuthConfig;

  const createMockToken = (overrides: Partial<IPasswordResetToken> = {}): IPasswordResetToken => ({
    id: faker.string.uuid(),
    token: faker.string.alphanumeric(64),
    accountType: 'tenant_account',
    accountId: faker.string.uuid(),
    expiresAt: new Date(Date.now() + 3600 * 1000),
    usedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  beforeEach(() => {
    mockPasswordResetRepository = {
      create: jest.fn(),
      findValidByToken: jest.fn(),
      markAsUsed: jest.fn(),
      deleteAllByAccount: jest.fn(),
      deleteExpired: jest.fn(),
    } as unknown as jest.Mocked<PasswordResetRepository>;

    mockPasswordService = {
      hash: jest.fn(),
      verify: jest.fn(),
      validateStrength: jest.fn(),
    } as unknown as jest.Mocked<PasswordService>;

    mockSessionService = {
      revokeAll: jest.fn(),
    } as unknown as jest.Mocked<SessionService>;

    mockConfig = {
      secret: faker.string.alphanumeric(64),
    };

    service = new PasswordResetService(
      mockConfig,
      mockPasswordResetRepository,
      mockPasswordService,
      mockSessionService
    );
  });

  describe('requestReset', () => {
    it('should create a password reset token for tenant account', async () => {
      const accountId = faker.string.uuid();
      const mockToken = createMockToken({ accountId });

      mockPasswordResetRepository.deleteAllByAccount.mockResolvedValue(0);
      mockPasswordResetRepository.create.mockResolvedValue(mockToken);

      const result = await service.requestReset('tenant_account', accountId);

      expect(result.token).toBeDefined();
      expect(result.token.length).toBe(64); // hex string from 32 bytes
      expect(result.expiresAt).toBeInstanceOf(Date);
      expect(result.expiresAt.getTime()).toBeGreaterThan(Date.now());
      expect(mockPasswordResetRepository.deleteAllByAccount).toHaveBeenCalledWith(
        'tenant_account',
        accountId
      );
      expect(mockPasswordResetRepository.create).toHaveBeenCalledWith({
        token: expect.any(String),
        accountType: 'tenant_account',
        accountId,
        expiresAt: expect.any(Date),
      });
    });

    it('should create a password reset token for environment account', async () => {
      const accountId = faker.string.uuid();
      const mockToken = createMockToken({ accountId, accountType: 'environment_account' });

      mockPasswordResetRepository.deleteAllByAccount.mockResolvedValue(0);
      mockPasswordResetRepository.create.mockResolvedValue(mockToken);

      const result = await service.requestReset('environment_account', accountId);

      expect(result.token).toBeDefined();
      expect(mockPasswordResetRepository.deleteAllByAccount).toHaveBeenCalledWith(
        'environment_account',
        accountId
      );
    });

    it('should delete existing tokens before creating new one', async () => {
      const accountId = faker.string.uuid();
      const mockToken = createMockToken({ accountId });

      // Track call order
      const callOrder: string[] = [];
      mockPasswordResetRepository.deleteAllByAccount.mockImplementation(async () => {
        callOrder.push('delete');
        return 2;
      });
      mockPasswordResetRepository.create.mockImplementation(async () => {
        callOrder.push('create');
        return mockToken;
      });

      await service.requestReset('tenant_account', accountId);

      expect(callOrder).toEqual(['delete', 'create']);
    });

    it('should generate token with 1 hour expiration', async () => {
      const accountId = faker.string.uuid();
      const mockToken = createMockToken({ accountId });
      const beforeCall = Date.now();

      mockPasswordResetRepository.deleteAllByAccount.mockResolvedValue(0);
      mockPasswordResetRepository.create.mockResolvedValue(mockToken);

      const result = await service.requestReset('tenant_account', accountId);

      const afterCall = Date.now();
      const expectedMinExpiration = beforeCall + 3600 * 1000;
      const expectedMaxExpiration = afterCall + 3600 * 1000;

      expect(result.expiresAt.getTime()).toBeGreaterThanOrEqual(expectedMinExpiration);
      expect(result.expiresAt.getTime()).toBeLessThanOrEqual(expectedMaxExpiration);
    });
  });

  describe('validateToken', () => {
    it('should return token data when valid', async () => {
      const mockToken = createMockToken();
      mockPasswordResetRepository.findValidByToken.mockResolvedValue(mockToken);

      const result = await service.validateToken(mockToken.token);

      expect(result).toEqual(mockToken);
      expect(mockPasswordResetRepository.findValidByToken).toHaveBeenCalledWith(mockToken.token);
    });

    it('should return null when token is invalid', async () => {
      mockPasswordResetRepository.findValidByToken.mockResolvedValue(null);

      const result = await service.validateToken('invalid-token');

      expect(result).toBeNull();
    });

    it('should return null when token is expired', async () => {
      mockPasswordResetRepository.findValidByToken.mockResolvedValue(null);

      const result = await service.validateToken('expired-token');

      expect(result).toBeNull();
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      const mockToken = createMockToken();
      const newPassword = 'NewSecureP@ss123!';
      const passwordHash = faker.string.alphanumeric(60);
      const updatePasswordFn = jest.fn().mockResolvedValue(true);

      mockPasswordResetRepository.findValidByToken.mockResolvedValue(mockToken);
      mockPasswordService.validateStrength.mockReturnValue({ valid: true, errors: [] });
      mockPasswordService.hash.mockResolvedValue(passwordHash);
      mockPasswordResetRepository.markAsUsed.mockResolvedValue(true);
      mockSessionService.revokeAll.mockResolvedValue(3);

      const result = await service.resetPassword(mockToken.token, newPassword, updatePasswordFn);

      expect(result).toBe(true);
      expect(mockPasswordService.validateStrength).toHaveBeenCalledWith(newPassword);
      expect(mockPasswordService.hash).toHaveBeenCalledWith(newPassword);
      expect(updatePasswordFn).toHaveBeenCalledWith(mockToken.accountId, passwordHash);
      expect(mockPasswordResetRepository.markAsUsed).toHaveBeenCalledWith(mockToken.token);
      expect(mockSessionService.revokeAll).toHaveBeenCalledWith(
        mockToken.accountType,
        mockToken.accountId
      );
    });

    it('should return false when token is invalid', async () => {
      const updatePasswordFn = jest.fn();
      mockPasswordResetRepository.findValidByToken.mockResolvedValue(null);

      const result = await service.resetPassword('invalid-token', 'NewPassword123!', updatePasswordFn);

      expect(result).toBe(false);
      expect(updatePasswordFn).not.toHaveBeenCalled();
      expect(mockPasswordService.validateStrength).not.toHaveBeenCalled();
    });

    it('should throw error when password is too weak', async () => {
      const mockToken = createMockToken();
      const updatePasswordFn = jest.fn();

      mockPasswordResetRepository.findValidByToken.mockResolvedValue(mockToken);
      mockPasswordService.validateStrength.mockReturnValue({
        valid: false,
        errors: ['Password must be at least 8 characters', 'Password must contain uppercase'],
      });

      await expect(
        service.resetPassword(mockToken.token, 'weak', updatePasswordFn)
      ).rejects.toThrow('Password validation failed:');

      expect(updatePasswordFn).not.toHaveBeenCalled();
      expect(mockPasswordResetRepository.markAsUsed).not.toHaveBeenCalled();
    });

    it('should return false when updatePasswordFn fails', async () => {
      const mockToken = createMockToken();
      const updatePasswordFn = jest.fn().mockResolvedValue(false);

      mockPasswordResetRepository.findValidByToken.mockResolvedValue(mockToken);
      mockPasswordService.validateStrength.mockReturnValue({ valid: true, errors: [] });
      mockPasswordService.hash.mockResolvedValue('hashed-password');

      const result = await service.resetPassword(mockToken.token, 'ValidP@ss123!', updatePasswordFn);

      expect(result).toBe(false);
      expect(mockPasswordResetRepository.markAsUsed).not.toHaveBeenCalled();
      expect(mockSessionService.revokeAll).not.toHaveBeenCalled();
    });

    it('should revoke all sessions after successful reset', async () => {
      const mockToken = createMockToken({ accountType: 'environment_account' });
      const updatePasswordFn = jest.fn().mockResolvedValue(true);

      mockPasswordResetRepository.findValidByToken.mockResolvedValue(mockToken);
      mockPasswordService.validateStrength.mockReturnValue({ valid: true, errors: [] });
      mockPasswordService.hash.mockResolvedValue('hashed-password');
      mockPasswordResetRepository.markAsUsed.mockResolvedValue(true);
      mockSessionService.revokeAll.mockResolvedValue(5);

      await service.resetPassword(mockToken.token, 'ValidP@ss123!', updatePasswordFn);

      expect(mockSessionService.revokeAll).toHaveBeenCalledWith(
        'environment_account',
        mockToken.accountId
      );
    });
  });

  describe('cleanup', () => {
    it('should delete expired tokens and return count', async () => {
      mockPasswordResetRepository.deleteExpired.mockResolvedValue(10);

      const result = await service.cleanup();

      expect(result).toBe(10);
      expect(mockPasswordResetRepository.deleteExpired).toHaveBeenCalled();
    });

    it('should return 0 when no expired tokens', async () => {
      mockPasswordResetRepository.deleteExpired.mockResolvedValue(0);

      const result = await service.cleanup();

      expect(result).toBe(0);
    });
  });
});
