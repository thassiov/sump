import { faker } from '@faker-js/faker';
import { PasswordResetRepository } from './password-reset.repository';
import { IPasswordResetToken } from '../types';

describe('PasswordResetRepository', () => {
  let repository: PasswordResetRepository;
  let mockDbClient: any;

  const createMockDbRow = (overrides = {}) => ({
    id: faker.string.uuid(),
    token: faker.string.alphanumeric(64),
    account_type: 'tenant_account',
    account_id: faker.string.uuid(),
    expires_at: new Date(Date.now() + 3600 * 1000),
    used_at: null,
    created_at: new Date(),
    updated_at: new Date(),
    ...overrides,
  });

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
    mockDbClient = jest.fn();
    repository = new PasswordResetRepository(mockDbClient);
  });

  describe('create', () => {
    it('should create a password reset token and return mapped result', async () => {
      const dbRow = createMockDbRow();
      const createData = {
        token: dbRow.token,
        accountType: 'tenant_account' as const,
        accountId: dbRow.account_id,
        expiresAt: dbRow.expires_at,
      };

      const mockBuilder = {
        insert: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([dbRow]),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      const result = await repository.create(createData);

      expect(result.id).toBe(dbRow.id);
      expect(result.token).toBe(dbRow.token);
      expect(result.accountType).toBe('tenant_account');
      expect(result.accountId).toBe(dbRow.account_id);
      expect(result.usedAt).toBeNull();
      expect(mockDbClient).toHaveBeenCalledWith('password_reset_token');
      expect(mockBuilder.insert).toHaveBeenCalledWith({
        token: createData.token,
        account_type: createData.accountType,
        account_id: createData.accountId,
        expires_at: createData.expiresAt,
      });
    });

    it('should create token for environment_account', async () => {
      const dbRow = createMockDbRow({ account_type: 'environment_account' });
      const createData = {
        token: dbRow.token,
        accountType: 'environment_account' as const,
        accountId: dbRow.account_id,
        expiresAt: dbRow.expires_at,
      };

      const mockBuilder = {
        insert: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([dbRow]),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      const result = await repository.create(createData);

      expect(result.accountType).toBe('environment_account');
    });
  });

  describe('findValidByToken', () => {
    it('should return token when found and valid', async () => {
      const dbRow = createMockDbRow();

      const mockBuilder = {
        where: jest.fn().mockReturnThis(),
        whereNull: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(dbRow),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      const result = await repository.findValidByToken(dbRow.token);

      expect(result).not.toBeNull();
      expect(result!.token).toBe(dbRow.token);
      expect(result!.accountType).toBe('tenant_account');
      expect(mockBuilder.where).toHaveBeenCalledWith('token', dbRow.token);
      expect(mockBuilder.whereNull).toHaveBeenCalledWith('used_at');
    });

    it('should return null when token not found', async () => {
      const mockBuilder = {
        where: jest.fn().mockReturnThis(),
        whereNull: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(undefined),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      const result = await repository.findValidByToken('nonexistent-token');

      expect(result).toBeNull();
    });

    it('should correctly map usedAt when token was used', async () => {
      const usedAt = new Date();
      const dbRow = createMockDbRow({ used_at: usedAt });

      const mockBuilder = {
        where: jest.fn().mockReturnThis(),
        whereNull: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(dbRow),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      const result = await repository.findValidByToken(dbRow.token);

      expect(result!.usedAt).toEqual(usedAt);
    });
  });

  describe('markAsUsed', () => {
    it('should mark token as used and return true', async () => {
      const token = faker.string.alphanumeric(64);

      const mockBuilder = {
        where: jest.fn().mockReturnThis(),
        update: jest.fn().mockResolvedValue(1),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      const result = await repository.markAsUsed(token);

      expect(result).toBe(true);
      expect(mockBuilder.where).toHaveBeenCalledWith('token', token);
      expect(mockBuilder.update).toHaveBeenCalledWith({ used_at: expect.any(Date) });
    });

    it('should return false when token not found', async () => {
      const mockBuilder = {
        where: jest.fn().mockReturnThis(),
        update: jest.fn().mockResolvedValue(0),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      const result = await repository.markAsUsed('nonexistent-token');

      expect(result).toBe(false);
    });
  });

  describe('deleteAllByAccount', () => {
    it('should delete all tokens for tenant account', async () => {
      const accountId = faker.string.uuid();

      const mockBuilder = {
        where: jest.fn().mockReturnThis(),
        del: jest.fn().mockResolvedValue(3),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      const result = await repository.deleteAllByAccount('tenant_account', accountId);

      expect(result).toBe(3);
      expect(mockBuilder.where).toHaveBeenCalledWith('account_type', 'tenant_account');
      expect(mockBuilder.where).toHaveBeenCalledWith('account_id', accountId);
    });

    it('should delete all tokens for environment account', async () => {
      const accountId = faker.string.uuid();

      const mockBuilder = {
        where: jest.fn().mockReturnThis(),
        del: jest.fn().mockResolvedValue(2),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      const result = await repository.deleteAllByAccount('environment_account', accountId);

      expect(result).toBe(2);
      expect(mockBuilder.where).toHaveBeenCalledWith('account_type', 'environment_account');
    });

    it('should return 0 when no tokens found', async () => {
      const accountId = faker.string.uuid();

      const mockBuilder = {
        where: jest.fn().mockReturnThis(),
        del: jest.fn().mockResolvedValue(0),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      const result = await repository.deleteAllByAccount('tenant_account', accountId);

      expect(result).toBe(0);
    });
  });

  describe('deleteExpired', () => {
    it('should delete expired tokens and return count', async () => {
      const mockBuilder = {
        where: jest.fn().mockReturnThis(),
        del: jest.fn().mockResolvedValue(5),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      const result = await repository.deleteExpired();

      expect(result).toBe(5);
      expect(mockDbClient).toHaveBeenCalledWith('password_reset_token');
      expect(mockBuilder.where).toHaveBeenCalledWith('expires_at', '<', expect.any(Date));
    });

    it('should return 0 when no expired tokens', async () => {
      const mockBuilder = {
        where: jest.fn().mockReturnThis(),
        del: jest.fn().mockResolvedValue(0),
      };
      mockDbClient.mockReturnValue(mockBuilder);

      const result = await repository.deleteExpired();

      expect(result).toBe(0);
    });
  });
});
