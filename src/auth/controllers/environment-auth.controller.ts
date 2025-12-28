import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { EnvironmentAccountService } from '../../core/services/environment-account.service';
import { EnvironmentService } from '../../core/services/environment.service';
import { AuthService, PasswordResetService } from '../services';
import {
  EnvironmentSignupDto,
  LoginDto,
  AuthResponseDto,
  SessionResponseDto,
  ForgotPasswordDto,
  ForgotPasswordResponseDto,
  ResetPasswordDto,
  ResetPasswordResponseDto,
} from '../dto';
import { NotFoundError } from '../../lib/errors';
import { ISession } from '../types';

/**
 * Convert session to response DTO, handling optional properties
 */
function toSessionResponse(session: ISession): SessionResponseDto {
  const response: SessionResponseDto = {
    id: session.id,
    accountType: session.accountType,
    accountId: session.accountId,
    contextType: session.contextType,
    contextId: session.contextId,
    expiresAt: session.expiresAt,
    lastActiveAt: session.lastActiveAt,
    createdAt: session.createdAt,
  };

  if (session.ipAddress) {
    response.ipAddress = session.ipAddress;
  }
  if (session.userAgent) {
    response.userAgent = session.userAgent;
  }

  return response;
}

@ApiTags('Environment Authentication')
@Controller('auth/environments/:environmentId')
export class EnvironmentAuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly environmentService: EnvironmentService,
    private readonly environmentAccountService: EnvironmentAccountService,
    private readonly passwordResetService: PasswordResetService
  ) {}

  @Post('signup')
  @ApiOperation({
    summary: 'Sign up a new environment account',
    description: 'Creates a new account with credentials for the specified environment.',
  })
  @ApiParam({ name: 'environmentId', description: 'UUID of the environment' })
  @ApiBody({ type: EnvironmentSignupDto })
  @ApiResponse({
    status: 201,
    description: 'Account created and session started',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input or weak password' })
  @ApiResponse({ status: 404, description: 'Environment not found' })
  @ApiResponse({ status: 409, description: 'Email/username already exists' })
  async signup(
    @Param('environmentId') environmentId: string,
    @Body() dto: EnvironmentSignupDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ): Promise<AuthResponseDto> {
    // Verify environment exists
    const environment = await this.environmentService.getById(environmentId);
    if (!environment) {
      throw new NotFoundError({
        context: 'AUTH_SIGNUP',
        details: { environmentId },
      });
    }

    // Hash password (validates strength internally)
    const passwordHash = await this.authService.hashPassword(dto.password);

    // Create account with password
    const accountId = await this.environmentAccountService.createWithPassword(environmentId, {
      name: dto.name,
      email: dto.email,
      username: dto.username,
      phone: dto.phone,
      avatarUrl: dto.avatarUrl,
      customProperties: {},
      passwordHash,
    });

    // Create session
    const ipAddress = this.authService.getIpAddress(req);
    const userAgent = this.authService.getUserAgent(req);

    const session = await this.authService.createSession(res, {
      accountType: 'environment_account',
      accountId,
      contextType: 'environment',
      contextId: environmentId,
      ...(ipAddress && { ipAddress }),
      ...(userAgent && { userAgent }),
    });

    return {
      accountId,
      session: toSessionResponse(session),
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Log in to an environment account',
    description: 'Authenticates with email, phone, or username and password, creates a session.',
  })
  @ApiParam({ name: 'environmentId', description: 'UUID of the environment' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Successfully logged in',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Must provide email, phone, or username' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 403, description: 'Account is disabled' })
  @ApiResponse({ status: 404, description: 'Environment not found' })
  async login(
    @Param('environmentId') environmentId: string,
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ): Promise<AuthResponseDto> {
    // Validate at least one identifier is provided
    if (!dto.email && !dto.phone && !dto.username) {
      throw new BadRequestException('Must provide email, phone, or username');
    }

    // Verify environment exists
    const environment = await this.environmentService.getById(environmentId);
    if (!environment) {
      throw new NotFoundError({
        context: 'AUTH_LOGIN',
        details: { environmentId },
      });
    }

    // Find account by identifier - only include defined values
    const identifier: { email?: string; phone?: string; username?: string } = {};
    if (dto.email) identifier.email = dto.email;
    if (dto.phone) identifier.phone = dto.phone;
    if (dto.username) identifier.username = dto.username;

    const account = await this.environmentAccountService.getByIdentifierWithPassword(
      identifier,
      environmentId
    );

    if (!account || !account.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isValid = await this.authService.verifyPassword(
      dto.password,
      account.passwordHash
    );

    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if account is disabled
    if (account.disabled) {
      throw new ForbiddenException('Account is disabled');
    }

    // Create session
    const ipAddress = this.authService.getIpAddress(req);
    const userAgent = this.authService.getUserAgent(req);

    const session = await this.authService.createSession(res, {
      accountType: 'environment_account',
      accountId: account.id,
      contextType: 'environment',
      contextId: environmentId,
      ...(ipAddress && { ipAddress }),
      ...(userAgent && { userAgent }),
    });

    return {
      accountId: account.id,
      session: toSessionResponse(session),
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Log out of current session',
    description: 'Revokes the current session and clears the cookie.',
  })
  @ApiParam({ name: 'environmentId', description: 'UUID of the environment' })
  @ApiResponse({ status: 204, description: 'Successfully logged out' })
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ): Promise<void> {
    await this.authService.signout(req, res);
  }

  @Get('session')
  @ApiOperation({
    summary: 'Get current session',
    description: 'Returns the current session if valid.',
  })
  @ApiParam({ name: 'environmentId', description: 'UUID of the environment' })
  @ApiResponse({
    status: 200,
    description: 'Current session',
    type: SessionResponseDto,
  })
  @ApiResponse({ status: 401, description: 'No valid session' })
  async getSession(@Req() req: Request): Promise<SessionResponseDto> {
    const session = await this.authService.validateSession(req);

    if (!session) {
      throw new UnauthorizedException('No valid session');
    }

    return toSessionResponse(session);
  }

  @Get('sessions')
  @ApiOperation({
    summary: 'List all active sessions',
    description: 'Returns all active sessions for the current account.',
  })
  @ApiParam({ name: 'environmentId', description: 'UUID of the environment' })
  @ApiResponse({
    status: 200,
    description: 'List of active sessions',
    type: [SessionResponseDto],
  })
  @ApiResponse({ status: 401, description: 'No valid session' })
  async listSessions(@Req() req: Request): Promise<SessionResponseDto[]> {
    const currentSession = await this.authService.validateSession(req);

    if (!currentSession) {
      throw new UnauthorizedException('No valid session');
    }

    const sessions = await this.authService.listSessions(
      currentSession.accountType,
      currentSession.accountId
    );

    return sessions.map(toSessionResponse);
  }

  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Log out of all sessions',
    description: 'Revokes all sessions for the current account.',
  })
  @ApiParam({ name: 'environmentId', description: 'UUID of the environment' })
  @ApiResponse({
    status: 200,
    description: 'Number of sessions revoked',
    schema: { type: 'object', properties: { revoked: { type: 'number' } } },
  })
  @ApiResponse({ status: 401, description: 'No valid session' })
  async logoutAll(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ): Promise<{ revoked: number }> {
    const currentSession = await this.authService.validateSession(req);

    if (!currentSession) {
      throw new UnauthorizedException('No valid session');
    }

    const revoked = await this.authService.signoutAll(
      req,
      res,
      currentSession.accountType,
      currentSession.accountId
    );

    return { revoked };
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Request a password reset',
    description:
      'Initiates a password reset flow by creating a reset token. The token should be sent to the user via email/SMS.',
  })
  @ApiParam({ name: 'environmentId', description: 'UUID of the environment' })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Password reset initiated (always returns success for security)',
    type: ForgotPasswordResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Must provide email, phone, or username' })
  @ApiResponse({ status: 404, description: 'Environment not found' })
  async forgotPassword(
    @Param('environmentId') environmentId: string,
    @Body() dto: ForgotPasswordDto
  ): Promise<ForgotPasswordResponseDto> {
    // Validate at least one identifier is provided
    if (!dto.email && !dto.phone && !dto.username) {
      throw new BadRequestException('Must provide email, phone, or username');
    }

    // Verify environment exists
    const environment = await this.environmentService.getById(environmentId);
    if (!environment) {
      throw new NotFoundError({
        context: 'AUTH_FORGOT_PASSWORD',
        details: { environmentId },
      });
    }

    // Find account by identifier
    const identifier: { email?: string; phone?: string; username?: string } = {};
    if (dto.email) identifier.email = dto.email;
    if (dto.phone) identifier.phone = dto.phone;
    if (dto.username) identifier.username = dto.username;

    const account = await this.environmentAccountService.getByIdentifierWithPassword(
      identifier,
      environmentId
    );

    // Always return success message for security (don't reveal if account exists)
    const response: ForgotPasswordResponseDto = {
      message: 'If an account exists with this identifier, a reset link has been sent.',
    };

    // Only create token if account exists
    if (account) {
      const { token, expiresAt } = await this.passwordResetService.requestReset(
        'environment_account',
        account.id
      );

      // TODO: Send email/SMS with token
      // For now, log it (in production, this should trigger an email/SMS)
      console.log(`Password reset token for ${account.id}: ${token} (expires: ${expiresAt})`);
    }

    return response;
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reset password with token',
    description: 'Resets the password using a valid reset token. All sessions will be revoked.',
  })
  @ApiParam({ name: 'environmentId', description: 'UUID of the environment' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Password reset result',
    type: ResetPasswordResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid or expired token, or weak password' })
  @ApiResponse({ status: 404, description: 'Environment not found' })
  async resetPassword(
    @Param('environmentId') environmentId: string,
    @Body() dto: ResetPasswordDto
  ): Promise<ResetPasswordResponseDto> {
    // Verify environment exists
    const environment = await this.environmentService.getById(environmentId);
    if (!environment) {
      throw new NotFoundError({
        context: 'AUTH_RESET_PASSWORD',
        details: { environmentId },
      });
    }

    try {
      const success = await this.passwordResetService.resetPassword(
        dto.token,
        dto.newPassword,
        async (accountId: string, passwordHash: string) => {
          return this.environmentAccountService.updatePasswordHashById(accountId, passwordHash);
        }
      );

      if (!success) {
        throw new BadRequestException('Invalid or expired token');
      }

      return {
        success: true,
        message: 'Password has been reset successfully. Please log in with your new password.',
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      // Handle password validation errors from PasswordResetService
      if (error instanceof Error && error.message.startsWith('Password validation failed:')) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }
}
