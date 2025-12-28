import { faker } from '@faker-js/faker';
import { UnauthorizedException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { Request, Response } from 'express';
import { EnvironmentAuthController } from './environment-auth.controller';
import { AuthService, PasswordResetService } from '../services';
import { EnvironmentService } from '../../core/services/environment.service';
import { EnvironmentAccountService } from '../../core/services/environment-account.service';
import { NotFoundError } from '../../lib/errors';
import { ISession } from '../types';

describe('EnvironmentAuthController', () => {
  let controller: EnvironmentAuthController;
  let mockAuthService: jest.Mocked<AuthService>;
  let mockEnvironmentService: jest.Mocked<EnvironmentService>;
  let mockEnvironmentAccountService: jest.Mocked<EnvironmentAccountService>;
  let mockPasswordResetService: jest.Mocked<PasswordResetService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  const createMockSession = (overrides: Partial<ISession> = {}): ISession => ({
    id: faker.string.uuid(),
    token: faker.string.alphanumeric(64),
    accountType: 'environment_account',
    accountId: faker.string.uuid(),
    contextType: 'environment',
    contextId: faker.string.uuid(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    lastActiveAt: new Date(),
    createdAt: new Date(),
    ...overrides,
  });

  const createMockEnvironment = (overrides = {}) => ({
    id: faker.string.uuid(),
    tenantId: faker.string.uuid(),
    name: faker.company.name(),
    customProperties: {},
    ...overrides,
  });

  const createMockAccount = (overrides = {}) => ({
    id: faker.string.uuid(),
    environmentId: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    username: faker.internet.username(),
    phone: faker.phone.number(),
    avatarUrl: faker.internet.url(),
    customProperties: {},
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

    mockEnvironmentService = {
      getById: jest.fn(),
    } as unknown as jest.Mocked<EnvironmentService>;

    mockEnvironmentAccountService = {
      createWithPassword: jest.fn(),
      getByIdentifierWithPassword: jest.fn(),
      updatePasswordHashById: jest.fn(),
    } as unknown as jest.Mocked<EnvironmentAccountService>;

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

    controller = new EnvironmentAuthController(
      mockAuthService,
      mockEnvironmentService,
      mockEnvironmentAccountService,
      mockPasswordResetService
    );
  });

  describe('signup', () => {
    const environmentId = faker.string.uuid();
    const signupDto = {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      username: faker.internet.username(),
      password: 'SecureP@ssw0rd!',
    };

    it('should create account and return session on successful signup', async () => {
      const environment = createMockEnvironment({ id: environmentId });
      const accountId = faker.string.uuid();
      const passwordHash = faker.string.alphanumeric(60);
      const session = createMockSession({ accountId, contextId: environmentId });

      mockEnvironmentService.getById.mockResolvedValue(environment);
      mockAuthService.hashPassword.mockResolvedValue(passwordHash);
      mockEnvironmentAccountService.createWithPassword.mockResolvedValue(accountId);
      mockAuthService.getIpAddress.mockReturnValue('127.0.0.1');
      mockAuthService.getUserAgent.mockReturnValue('test-agent');
      mockAuthService.createSession.mockResolvedValue(session);

      const result = await controller.signup(
        environmentId,
        signupDto,
        mockRequest as Request,
        mockResponse as Response
      );

      expect(result.accountId).toBe(accountId);
      expect(result.session.id).toBe(session.id);
      expect(mockEnvironmentService.getById).toHaveBeenCalledWith(environmentId);
      expect(mockAuthService.hashPassword).toHaveBeenCalledWith(signupDto.password);
      expect(mockEnvironmentAccountService.createWithPassword).toHaveBeenCalledWith(
        environmentId,
        expect.objectContaining({
          name: signupDto.name,
          email: signupDto.email,
          username: signupDto.username,
          passwordHash,
        })
      );
      expect(mockAuthService.createSession).toHaveBeenCalledWith(
        mockResponse,
        expect.objectContaining({
          accountType: 'environment_account',
          accountId,
          contextType: 'environment',
          contextId: environmentId,
        })
      );
    });

    it('should throw NotFoundError when environment does not exist', async () => {
      mockEnvironmentService.getById.mockResolvedValue(undefined);

      await expect(
        controller.signup(
          environmentId,
          signupDto,
          mockRequest as Request,
          mockResponse as Response
        )
      ).rejects.toThrow(NotFoundError);

      expect(mockEnvironmentAccountService.createWithPassword).not.toHaveBeenCalled();
    });

    it('should include optional phone and avatarUrl when provided', async () => {
      const environment = createMockEnvironment({ id: environmentId });
      const accountId = faker.string.uuid();
      const dtoWithOptionals = {
        ...signupDto,
        phone: '+1234567890',
        avatarUrl: 'https://example.com/avatar.png',
      };

      mockEnvironmentService.getById.mockResolvedValue(environment);
      mockAuthService.hashPassword.mockResolvedValue('hash');
      mockEnvironmentAccountService.createWithPassword.mockResolvedValue(accountId);
      mockAuthService.createSession.mockResolvedValue(createMockSession());

      await controller.signup(
        environmentId,
        dtoWithOptionals,
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockEnvironmentAccountService.createWithPassword).toHaveBeenCalledWith(
        environmentId,
        expect.objectContaining({
          phone: dtoWithOptionals.phone,
          avatarUrl: dtoWithOptionals.avatarUrl,
        })
      );
    });

    it('should handle missing ipAddress and userAgent gracefully', async () => {
      const environment = createMockEnvironment({ id: environmentId });
      const accountId = faker.string.uuid();
      const session = createMockSession({ accountId });

      mockEnvironmentService.getById.mockResolvedValue(environment);
      mockAuthService.hashPassword.mockResolvedValue('hash');
      mockEnvironmentAccountService.createWithPassword.mockResolvedValue(accountId);
      mockAuthService.getIpAddress.mockReturnValue(undefined);
      mockAuthService.getUserAgent.mockReturnValue(undefined);
      mockAuthService.createSession.mockResolvedValue(session);

      await controller.signup(
        environmentId,
        signupDto,
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockAuthService.createSession).toHaveBeenCalledWith(
        mockResponse,
        expect.objectContaining({
          accountType: 'environment_account',
          accountId,
          contextType: 'environment',
          contextId: environmentId,
        })
      );
    });
  });

  describe('login', () => {
    const environmentId = faker.string.uuid();

    it('should return session on successful login with email', async () => {
      const loginDto = {
        email: faker.internet.email(),
        password: 'SecureP@ssw0rd!',
      };
      const environment = createMockEnvironment({ id: environmentId });
      const account = createMockAccount({ environmentId });
      const session = createMockSession({ accountId: account.id, contextId: environmentId });

      mockEnvironmentService.getById.mockResolvedValue(environment);
      mockEnvironmentAccountService.getByIdentifierWithPassword.mockResolvedValue(account);
      mockAuthService.verifyPassword.mockResolvedValue(true);
      mockAuthService.getIpAddress.mockReturnValue('127.0.0.1');
      mockAuthService.getUserAgent.mockReturnValue('test-agent');
      mockAuthService.createSession.mockResolvedValue(session);

      const result = await controller.login(
        environmentId,
        loginDto,
        mockRequest as Request,
        mockResponse as Response
      );

      expect(result.accountId).toBe(account.id);
      expect(result.session.id).toBe(session.id);
      expect(mockEnvironmentAccountService.getByIdentifierWithPassword).toHaveBeenCalledWith(
        { email: loginDto.email },
        environmentId
      );
    });

    it('should return session on successful login with username', async () => {
      const loginDto = {
        username: faker.internet.username(),
        password: 'SecureP@ssw0rd!',
      };
      const environment = createMockEnvironment({ id: environmentId });
      const account = createMockAccount({ environmentId });
      const session = createMockSession({ accountId: account.id });

      mockEnvironmentService.getById.mockResolvedValue(environment);
      mockEnvironmentAccountService.getByIdentifierWithPassword.mockResolvedValue(account);
      mockAuthService.verifyPassword.mockResolvedValue(true);
      mockAuthService.createSession.mockResolvedValue(session);

      await controller.login(
        environmentId,
        loginDto,
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockEnvironmentAccountService.getByIdentifierWithPassword).toHaveBeenCalledWith(
        { username: loginDto.username },
        environmentId
      );
    });

    it('should return session on successful login with phone', async () => {
      const loginDto = {
        phone: '+1234567890',
        password: 'SecureP@ssw0rd!',
      };
      const environment = createMockEnvironment({ id: environmentId });
      const account = createMockAccount({ environmentId });
      const session = createMockSession({ accountId: account.id });

      mockEnvironmentService.getById.mockResolvedValue(environment);
      mockEnvironmentAccountService.getByIdentifierWithPassword.mockResolvedValue(account);
      mockAuthService.verifyPassword.mockResolvedValue(true);
      mockAuthService.createSession.mockResolvedValue(session);

      await controller.login(
        environmentId,
        loginDto,
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockEnvironmentAccountService.getByIdentifierWithPassword).toHaveBeenCalledWith(
        { phone: loginDto.phone },
        environmentId
      );
    });

    it('should throw BadRequestException when no identifier provided', async () => {
      const loginDto = {
        password: 'SecureP@ssw0rd!',
      };

      await expect(
        controller.login(
          environmentId,
          loginDto,
          mockRequest as Request,
          mockResponse as Response
        )
      ).rejects.toThrow(BadRequestException);

      expect(mockEnvironmentService.getById).not.toHaveBeenCalled();
    });

    it('should throw NotFoundError when environment does not exist', async () => {
      const loginDto = {
        email: faker.internet.email(),
        password: 'SecureP@ssw0rd!',
      };

      mockEnvironmentService.getById.mockResolvedValue(undefined);

      await expect(
        controller.login(
          environmentId,
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
      const environment = createMockEnvironment({ id: environmentId });

      mockEnvironmentService.getById.mockResolvedValue(environment);
      mockEnvironmentAccountService.getByIdentifierWithPassword.mockResolvedValue(undefined);

      await expect(
        controller.login(
          environmentId,
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
      const environment = createMockEnvironment({ id: environmentId });
      const account = createMockAccount({ passwordHash: null });

      mockEnvironmentService.getById.mockResolvedValue(environment);
      mockEnvironmentAccountService.getByIdentifierWithPassword.mockResolvedValue(account);

      await expect(
        controller.login(
          environmentId,
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
      const environment = createMockEnvironment({ id: environmentId });
      const account = createMockAccount({ environmentId });

      mockEnvironmentService.getById.mockResolvedValue(environment);
      mockEnvironmentAccountService.getByIdentifierWithPassword.mockResolvedValue(account);
      mockAuthService.verifyPassword.mockResolvedValue(false);

      await expect(
        controller.login(
          environmentId,
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
      const environment = createMockEnvironment({ id: environmentId });
      const account = createMockAccount({
        environmentId,
        disabled: true,
        disabledAt: new Date(),
      });

      mockEnvironmentService.getById.mockResolvedValue(environment);
      mockEnvironmentAccountService.getByIdentifierWithPassword.mockResolvedValue(account);
      mockAuthService.verifyPassword.mockResolvedValue(true);

      await expect(
        controller.login(
          environmentId,
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
    const environmentId = faker.string.uuid();

    it('should return success message when account exists', async () => {
      const dto = { email: faker.internet.email() };
      const environment = createMockEnvironment({ id: environmentId });
      const account = createMockAccount({ environmentId });
      const resetResult = {
        token: faker.string.alphanumeric(64),
        expiresAt: new Date(Date.now() + 3600 * 1000),
      };

      mockEnvironmentService.getById.mockResolvedValue(environment);
      mockEnvironmentAccountService.getByIdentifierWithPassword.mockResolvedValue(account);
      mockPasswordResetService.requestReset.mockResolvedValue(resetResult);

      const result = await controller.forgotPassword(environmentId, dto);

      expect(result.message).toBe('If an account exists with this identifier, a reset link has been sent.');
      expect(mockPasswordResetService.requestReset).toHaveBeenCalledWith(
        'environment_account',
        account.id
      );
    });

    it('should return same success message when account does not exist (security)', async () => {
      const dto = { email: faker.internet.email() };
      const environment = createMockEnvironment({ id: environmentId });

      mockEnvironmentService.getById.mockResolvedValue(environment);
      mockEnvironmentAccountService.getByIdentifierWithPassword.mockResolvedValue(undefined);

      const result = await controller.forgotPassword(environmentId, dto);

      expect(result.message).toBe('If an account exists with this identifier, a reset link has been sent.');
      expect(mockPasswordResetService.requestReset).not.toHaveBeenCalled();
    });

    it('should work with username identifier', async () => {
      const dto = { username: faker.internet.username() };
      const environment = createMockEnvironment({ id: environmentId });
      const account = createMockAccount({ environmentId });

      mockEnvironmentService.getById.mockResolvedValue(environment);
      mockEnvironmentAccountService.getByIdentifierWithPassword.mockResolvedValue(account);
      mockPasswordResetService.requestReset.mockResolvedValue({
        token: faker.string.alphanumeric(64),
        expiresAt: new Date(),
      });

      await controller.forgotPassword(environmentId, dto);

      expect(mockEnvironmentAccountService.getByIdentifierWithPassword).toHaveBeenCalledWith(
        { username: dto.username },
        environmentId
      );
    });

    it('should work with phone identifier', async () => {
      const dto = { phone: '+1234567890' };
      const environment = createMockEnvironment({ id: environmentId });
      const account = createMockAccount({ environmentId });

      mockEnvironmentService.getById.mockResolvedValue(environment);
      mockEnvironmentAccountService.getByIdentifierWithPassword.mockResolvedValue(account);
      mockPasswordResetService.requestReset.mockResolvedValue({
        token: faker.string.alphanumeric(64),
        expiresAt: new Date(),
      });

      await controller.forgotPassword(environmentId, dto);

      expect(mockEnvironmentAccountService.getByIdentifierWithPassword).toHaveBeenCalledWith(
        { phone: dto.phone },
        environmentId
      );
    });

    it('should throw BadRequestException when no identifier provided', async () => {
      const dto = {};

      await expect(controller.forgotPassword(environmentId, dto)).rejects.toThrow(BadRequestException);

      expect(mockEnvironmentService.getById).not.toHaveBeenCalled();
    });

    it('should throw NotFoundError when environment does not exist', async () => {
      const dto = { email: faker.internet.email() };

      mockEnvironmentService.getById.mockResolvedValue(undefined);

      await expect(controller.forgotPassword(environmentId, dto)).rejects.toThrow(NotFoundError);
    });
  });

  describe('resetPassword', () => {
    const environmentId = faker.string.uuid();

    it('should reset password successfully', async () => {
      const dto = {
        token: faker.string.alphanumeric(64),
        newPassword: 'NewSecureP@ss123!',
      };
      const environment = createMockEnvironment({ id: environmentId });

      mockEnvironmentService.getById.mockResolvedValue(environment);
      mockPasswordResetService.resetPassword.mockResolvedValue(true);

      const result = await controller.resetPassword(environmentId, dto);

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
      const environment = createMockEnvironment({ id: environmentId });

      mockEnvironmentService.getById.mockResolvedValue(environment);
      mockPasswordResetService.resetPassword.mockResolvedValue(false);

      await expect(controller.resetPassword(environmentId, dto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when password validation fails', async () => {
      const dto = {
        token: faker.string.alphanumeric(64),
        newPassword: 'weak',
      };
      const environment = createMockEnvironment({ id: environmentId });

      mockEnvironmentService.getById.mockResolvedValue(environment);
      mockPasswordResetService.resetPassword.mockRejectedValue(
        new Error('Password validation failed: Password too short')
      );

      await expect(controller.resetPassword(environmentId, dto)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundError when environment does not exist', async () => {
      const dto = {
        token: faker.string.alphanumeric(64),
        newPassword: 'NewSecureP@ss123!',
      };

      mockEnvironmentService.getById.mockResolvedValue(undefined);

      await expect(controller.resetPassword(environmentId, dto)).rejects.toThrow(NotFoundError);
    });

    it('should pass updatePasswordFn that calls environmentAccountService', async () => {
      const dto = {
        token: faker.string.alphanumeric(64),
        newPassword: 'NewSecureP@ss123!',
      };
      const environment = createMockEnvironment({ id: environmentId });
      const accountId = faker.string.uuid();
      const passwordHash = faker.string.alphanumeric(60);

      mockEnvironmentService.getById.mockResolvedValue(environment);
      mockEnvironmentAccountService.updatePasswordHashById.mockResolvedValue(true);

      // Capture the updatePasswordFn passed to resetPassword
      let capturedUpdateFn: ((accountId: string, passwordHash: string) => Promise<boolean>) | undefined;
      mockPasswordResetService.resetPassword.mockImplementation(async (_token, _password, updateFn) => {
        capturedUpdateFn = updateFn;
        await updateFn(accountId, passwordHash);
        return true;
      });

      await controller.resetPassword(environmentId, dto);

      expect(capturedUpdateFn).toBeDefined();
      expect(mockEnvironmentAccountService.updatePasswordHashById).toHaveBeenCalledWith(
        accountId,
        passwordHash
      );
    });
  });
});
