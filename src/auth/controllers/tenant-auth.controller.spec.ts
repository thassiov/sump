import { faker } from '@faker-js/faker';
import { UnauthorizedException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { Request, Response } from 'express';
import { TenantAuthController } from './tenant-auth.controller';
import { AuthService, PasswordResetService } from '../services';
import { TenantService } from '../../core/services/tenant.service';
import { TenantAccountService } from '../../core/services/tenant-account.service';
import { NotFoundError } from '../../lib/errors';
import { ISession } from '../types';

describe('TenantAuthController', () => {
  let controller: TenantAuthController;
  let mockAuthService: jest.Mocked<AuthService>;
  let mockTenantService: jest.Mocked<TenantService>;
  let mockTenantAccountService: jest.Mocked<TenantAccountService>;
  let mockPasswordResetService: jest.Mocked<PasswordResetService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  const createMockSession = (overrides: Partial<ISession> = {}): ISession => ({
    id: faker.string.uuid(),
    token: faker.string.alphanumeric(64),
    accountType: 'tenant_account',
    accountId: faker.string.uuid(),
    contextType: 'tenant',
    contextId: faker.string.uuid(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    lastActiveAt: new Date(),
    createdAt: new Date(),
    ...overrides,
  });

  const createMockTenant = (overrides = {}) => ({
    id: faker.string.uuid(),
    name: faker.company.name(),
    customProperties: {},
    ...overrides,
  });

  const createMockAccount = (overrides = {}) => ({
    id: faker.string.uuid(),
    tenantId: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    username: faker.internet.username(),
    phone: faker.phone.number(),
    avatarUrl: faker.internet.url(),
    roles: [{ role: 'user', target: 'tenant', targetId: faker.string.uuid() }],
    passwordHash: faker.string.alphanumeric(60),
    disabled: false,
    disabledAt: null,
    ...overrides,
  });

  beforeEach(() => {
    mockAuthService = {
      hashPassword: jest.fn(),
      verifyPassword: jest.fn(),
      createSession: jest.fn(),
      validateSession: jest.fn(),
      signout: jest.fn(),
      signoutAll: jest.fn(),
      listSessions: jest.fn(),
      getIpAddress: jest.fn(),
      getUserAgent: jest.fn(),
    } as unknown as jest.Mocked<AuthService>;

    mockTenantService = {
      getById: jest.fn(),
    } as unknown as jest.Mocked<TenantService>;

    mockTenantAccountService = {
      getByIdentifierWithPassword: jest.fn(),
      updatePasswordHashById: jest.fn(),
    } as unknown as jest.Mocked<TenantAccountService>;

    mockPasswordResetService = {
      requestReset: jest.fn(),
      validateToken: jest.fn(),
      resetPassword: jest.fn(),
      cleanup: jest.fn(),
    } as unknown as jest.Mocked<PasswordResetService>;

    mockRequest = {
      headers: {},
      ip: '127.0.0.1',
    };

    mockResponse = {
      cookie: jest.fn(),
      clearCookie: jest.fn(),
    };

    controller = new TenantAuthController(
      mockAuthService,
      mockTenantService,
      mockTenantAccountService,
      mockPasswordResetService
    );
  });

  describe('login', () => {
    const tenantId = faker.string.uuid();

    it('should return session on successful login with email', async () => {
      const loginDto = {
        email: faker.internet.email(),
        password: 'SecureP@ssw0rd!',
      };
      const tenant = createMockTenant({ id: tenantId });
      const account = createMockAccount({ tenantId });
      const session = createMockSession({ accountId: account.id, contextId: tenantId });

      mockTenantService.getById.mockResolvedValue(tenant);
      mockTenantAccountService.getByIdentifierWithPassword.mockResolvedValue(account);
      mockAuthService.verifyPassword.mockResolvedValue(true);
      mockAuthService.getIpAddress.mockReturnValue('127.0.0.1');
      mockAuthService.getUserAgent.mockReturnValue('test-agent');
      mockAuthService.createSession.mockResolvedValue(session);

      const result = await controller.login(
        tenantId,
        loginDto,
        mockRequest as Request,
        mockResponse as Response
      );

      expect(result.accountId).toBe(account.id);
      expect(result.session.id).toBe(session.id);
      expect(mockTenantAccountService.getByIdentifierWithPassword).toHaveBeenCalledWith(
        { email: loginDto.email },
        tenantId
      );
    });

    it('should return session on successful login with username', async () => {
      const loginDto = {
        username: faker.internet.username(),
        password: 'SecureP@ssw0rd!',
      };
      const tenant = createMockTenant({ id: tenantId });
      const account = createMockAccount({ tenantId });
      const session = createMockSession({ accountId: account.id });

      mockTenantService.getById.mockResolvedValue(tenant);
      mockTenantAccountService.getByIdentifierWithPassword.mockResolvedValue(account);
      mockAuthService.verifyPassword.mockResolvedValue(true);
      mockAuthService.createSession.mockResolvedValue(session);

      await controller.login(
        tenantId,
        loginDto,
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockTenantAccountService.getByIdentifierWithPassword).toHaveBeenCalledWith(
        { username: loginDto.username },
        tenantId
      );
    });

    it('should return session on successful login with phone', async () => {
      const loginDto = {
        phone: '+1234567890',
        password: 'SecureP@ssw0rd!',
      };
      const tenant = createMockTenant({ id: tenantId });
      const account = createMockAccount({ tenantId });
      const session = createMockSession({ accountId: account.id });

      mockTenantService.getById.mockResolvedValue(tenant);
      mockTenantAccountService.getByIdentifierWithPassword.mockResolvedValue(account);
      mockAuthService.verifyPassword.mockResolvedValue(true);
      mockAuthService.createSession.mockResolvedValue(session);

      await controller.login(
        tenantId,
        loginDto,
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockTenantAccountService.getByIdentifierWithPassword).toHaveBeenCalledWith(
        { phone: loginDto.phone },
        tenantId
      );
    });

    it('should throw BadRequestException when no identifier provided', async () => {
      const loginDto = {
        password: 'SecureP@ssw0rd!',
      };

      await expect(
        controller.login(
          tenantId,
          loginDto,
          mockRequest as Request,
          mockResponse as Response
        )
      ).rejects.toThrow(BadRequestException);

      expect(mockTenantService.getById).not.toHaveBeenCalled();
    });

    it('should throw NotFoundError when tenant does not exist', async () => {
      const loginDto = {
        email: faker.internet.email(),
        password: 'SecureP@ssw0rd!',
      };

      mockTenantService.getById.mockResolvedValue(undefined);

      await expect(
        controller.login(
          tenantId,
          loginDto,
          mockRequest as Request,
          mockResponse as Response
        )
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw UnauthorizedException when account not found', async () => {
      const loginDto = {
        email: faker.internet.email(),
        password: 'SecureP@ssw0rd!',
      };
      const tenant = createMockTenant({ id: tenantId });

      mockTenantService.getById.mockResolvedValue(tenant);
      mockTenantAccountService.getByIdentifierWithPassword.mockResolvedValue(undefined);

      await expect(
        controller.login(
          tenantId,
          loginDto,
          mockRequest as Request,
          mockResponse as Response
        )
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when account has no password', async () => {
      const loginDto = {
        email: faker.internet.email(),
        password: 'SecureP@ssw0rd!',
      };
      const tenant = createMockTenant({ id: tenantId });
      const account = createMockAccount({ passwordHash: null });

      mockTenantService.getById.mockResolvedValue(tenant);
      mockTenantAccountService.getByIdentifierWithPassword.mockResolvedValue(account);

      await expect(
        controller.login(
          tenantId,
          loginDto,
          mockRequest as Request,
          mockResponse as Response
        )
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      const loginDto = {
        email: faker.internet.email(),
        password: 'WrongPassword!',
      };
      const tenant = createMockTenant({ id: tenantId });
      const account = createMockAccount({ tenantId });

      mockTenantService.getById.mockResolvedValue(tenant);
      mockTenantAccountService.getByIdentifierWithPassword.mockResolvedValue(account);
      mockAuthService.verifyPassword.mockResolvedValue(false);

      await expect(
        controller.login(
          tenantId,
          loginDto,
          mockRequest as Request,
          mockResponse as Response
        )
      ).rejects.toThrow(UnauthorizedException);

      expect(mockAuthService.createSession).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when account is disabled', async () => {
      const loginDto = {
        email: faker.internet.email(),
        password: 'SecureP@ssw0rd!',
      };
      const tenant = createMockTenant({ id: tenantId });
      const account = createMockAccount({ tenantId, disabled: true, disabledAt: new Date() });

      mockTenantService.getById.mockResolvedValue(tenant);
      mockTenantAccountService.getByIdentifierWithPassword.mockResolvedValue(account);
      mockAuthService.verifyPassword.mockResolvedValue(true);

      await expect(
        controller.login(
          tenantId,
          loginDto,
          mockRequest as Request,
          mockResponse as Response
        )
      ).rejects.toThrow(ForbiddenException);

      expect(mockAuthService.createSession).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should call authService.signout', async () => {
      mockAuthService.signout.mockResolvedValue(undefined);

      await controller.logout(mockRequest as Request, mockResponse as Response);

      expect(mockAuthService.signout).toHaveBeenCalledWith(mockRequest, mockResponse);
    });
  });

  describe('getSession', () => {
    it('should return session when valid', async () => {
      const session = createMockSession();
      mockAuthService.validateSession.mockResolvedValue(session);

      const result = await controller.getSession(mockRequest as Request);

      expect(result.id).toBe(session.id);
      expect(result.accountId).toBe(session.accountId);
      expect(mockAuthService.validateSession).toHaveBeenCalledWith(mockRequest);
    });

    it('should throw UnauthorizedException when no valid session', async () => {
      mockAuthService.validateSession.mockResolvedValue(null);

      await expect(
        controller.getSession(mockRequest as Request)
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should include optional ipAddress and userAgent in response', async () => {
      const session = createMockSession({
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      });
      mockAuthService.validateSession.mockResolvedValue(session);

      const result = await controller.getSession(mockRequest as Request);

      expect(result.ipAddress).toBe('192.168.1.1');
      expect(result.userAgent).toBe('Mozilla/5.0');
    });
  });

  describe('listSessions', () => {
    it('should return list of sessions', async () => {
      const currentSession = createMockSession();
      const sessions = [
        currentSession,
        createMockSession({ accountId: currentSession.accountId }),
        createMockSession({ accountId: currentSession.accountId }),
      ];

      mockAuthService.validateSession.mockResolvedValue(currentSession);
      mockAuthService.listSessions.mockResolvedValue(sessions);

      const result = await controller.listSessions(mockRequest as Request);

      expect(result).toHaveLength(3);
      expect(mockAuthService.listSessions).toHaveBeenCalledWith(
        currentSession.accountType,
        currentSession.accountId
      );
    });

    it('should throw UnauthorizedException when no valid session', async () => {
      mockAuthService.validateSession.mockResolvedValue(null);

      await expect(
        controller.listSessions(mockRequest as Request)
      ).rejects.toThrow(UnauthorizedException);

      expect(mockAuthService.listSessions).not.toHaveBeenCalled();
    });
  });

  describe('logoutAll', () => {
    it('should revoke all sessions and return count', async () => {
      const currentSession = createMockSession();
      mockAuthService.validateSession.mockResolvedValue(currentSession);
      mockAuthService.signoutAll.mockResolvedValue(5);

      const result = await controller.logoutAll(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(result.revoked).toBe(5);
      expect(mockAuthService.signoutAll).toHaveBeenCalledWith(
        mockRequest,
        mockResponse,
        currentSession.accountType,
        currentSession.accountId
      );
    });

    it('should throw UnauthorizedException when no valid session', async () => {
      mockAuthService.validateSession.mockResolvedValue(null);

      await expect(
        controller.logoutAll(mockRequest as Request, mockResponse as Response)
      ).rejects.toThrow(UnauthorizedException);

      expect(mockAuthService.signoutAll).not.toHaveBeenCalled();
    });
  });

  describe('forgotPassword', () => {
    const tenantId = faker.string.uuid();

    it('should return success message when account exists', async () => {
      const dto = { email: faker.internet.email() };
      const tenant = createMockTenant({ id: tenantId });
      const account = createMockAccount({ tenantId });
      const resetResult = {
        token: faker.string.alphanumeric(64),
        expiresAt: new Date(Date.now() + 3600 * 1000),
      };

      mockTenantService.getById.mockResolvedValue(tenant);
      mockTenantAccountService.getByIdentifierWithPassword.mockResolvedValue(account);
      mockPasswordResetService.requestReset.mockResolvedValue(resetResult);

      const result = await controller.forgotPassword(tenantId, dto);

      expect(result.message).toBe('If an account exists with this identifier, a reset link has been sent.');
      expect(mockPasswordResetService.requestReset).toHaveBeenCalledWith(
        'tenant_account',
        account.id
      );
    });

    it('should return same success message when account does not exist (security)', async () => {
      const dto = { email: faker.internet.email() };
      const tenant = createMockTenant({ id: tenantId });

      mockTenantService.getById.mockResolvedValue(tenant);
      mockTenantAccountService.getByIdentifierWithPassword.mockResolvedValue(undefined);

      const result = await controller.forgotPassword(tenantId, dto);

      expect(result.message).toBe('If an account exists with this identifier, a reset link has been sent.');
      expect(mockPasswordResetService.requestReset).not.toHaveBeenCalled();
    });

    it('should work with username identifier', async () => {
      const dto = { username: faker.internet.username() };
      const tenant = createMockTenant({ id: tenantId });
      const account = createMockAccount({ tenantId });

      mockTenantService.getById.mockResolvedValue(tenant);
      mockTenantAccountService.getByIdentifierWithPassword.mockResolvedValue(account);
      mockPasswordResetService.requestReset.mockResolvedValue({
        token: faker.string.alphanumeric(64),
        expiresAt: new Date(),
      });

      await controller.forgotPassword(tenantId, dto);

      expect(mockTenantAccountService.getByIdentifierWithPassword).toHaveBeenCalledWith(
        { username: dto.username },
        tenantId
      );
    });

    it('should work with phone identifier', async () => {
      const dto = { phone: '+1234567890' };
      const tenant = createMockTenant({ id: tenantId });
      const account = createMockAccount({ tenantId });

      mockTenantService.getById.mockResolvedValue(tenant);
      mockTenantAccountService.getByIdentifierWithPassword.mockResolvedValue(account);
      mockPasswordResetService.requestReset.mockResolvedValue({
        token: faker.string.alphanumeric(64),
        expiresAt: new Date(),
      });

      await controller.forgotPassword(tenantId, dto);

      expect(mockTenantAccountService.getByIdentifierWithPassword).toHaveBeenCalledWith(
        { phone: dto.phone },
        tenantId
      );
    });

    it('should throw BadRequestException when no identifier provided', async () => {
      const dto = {};

      await expect(controller.forgotPassword(tenantId, dto)).rejects.toThrow(BadRequestException);

      expect(mockTenantService.getById).not.toHaveBeenCalled();
    });

    it('should throw NotFoundError when tenant does not exist', async () => {
      const dto = { email: faker.internet.email() };

      mockTenantService.getById.mockResolvedValue(undefined);

      await expect(controller.forgotPassword(tenantId, dto)).rejects.toThrow(NotFoundError);
    });
  });

  describe('resetPassword', () => {
    const tenantId = faker.string.uuid();

    it('should reset password successfully', async () => {
      const dto = {
        token: faker.string.alphanumeric(64),
        newPassword: 'NewSecureP@ss123!',
      };
      const tenant = createMockTenant({ id: tenantId });

      mockTenantService.getById.mockResolvedValue(tenant);
      mockPasswordResetService.resetPassword.mockResolvedValue(true);

      const result = await controller.resetPassword(tenantId, dto);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Password has been reset successfully. Please log in with your new password.');
      expect(mockPasswordResetService.resetPassword).toHaveBeenCalledWith(
        dto.token,
        dto.newPassword,
        expect.any(Function)
      );
    });

    it('should throw BadRequestException when token is invalid', async () => {
      const dto = {
        token: 'invalid-token',
        newPassword: 'NewSecureP@ss123!',
      };
      const tenant = createMockTenant({ id: tenantId });

      mockTenantService.getById.mockResolvedValue(tenant);
      mockPasswordResetService.resetPassword.mockResolvedValue(false);

      await expect(controller.resetPassword(tenantId, dto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when password validation fails', async () => {
      const dto = {
        token: faker.string.alphanumeric(64),
        newPassword: 'weak',
      };
      const tenant = createMockTenant({ id: tenantId });

      mockTenantService.getById.mockResolvedValue(tenant);
      mockPasswordResetService.resetPassword.mockRejectedValue(
        new Error('Password validation failed: Password too short')
      );

      await expect(controller.resetPassword(tenantId, dto)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundError when tenant does not exist', async () => {
      const dto = {
        token: faker.string.alphanumeric(64),
        newPassword: 'NewSecureP@ss123!',
      };

      mockTenantService.getById.mockResolvedValue(undefined);

      await expect(controller.resetPassword(tenantId, dto)).rejects.toThrow(NotFoundError);
    });

    it('should pass updatePasswordFn that calls tenantAccountService', async () => {
      const dto = {
        token: faker.string.alphanumeric(64),
        newPassword: 'NewSecureP@ss123!',
      };
      const tenant = createMockTenant({ id: tenantId });
      const accountId = faker.string.uuid();
      const passwordHash = faker.string.alphanumeric(60);

      mockTenantService.getById.mockResolvedValue(tenant);
      mockTenantAccountService.updatePasswordHashById.mockResolvedValue(true);

      // Capture the updatePasswordFn passed to resetPassword
      let capturedUpdateFn: ((accountId: string, passwordHash: string) => Promise<boolean>) | undefined;
      mockPasswordResetService.resetPassword.mockImplementation(async (_token, _password, updateFn) => {
        capturedUpdateFn = updateFn;
        await updateFn(accountId, passwordHash);
        return true;
      });

      await controller.resetPassword(tenantId, dto);

      expect(capturedUpdateFn).toBeDefined();
      expect(mockTenantAccountService.updatePasswordHashById).toHaveBeenCalledWith(
        accountId,
        passwordHash
      );
    });
  });
});
