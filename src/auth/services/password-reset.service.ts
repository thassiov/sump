import { Inject, Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { BaseService } from '../../lib/base-classes';
import { AUTH_CONFIG, SumpAuthConfig } from '../config';
import { PasswordResetRepository } from '../repositories';
import { PasswordService } from './password.service';
import { SessionService } from './session.service';
import { IPasswordResetToken, AccountType } from '../types';

/**
 * Result of requesting a password reset
 */
interface RequestResetResult {
  token: string;
  expiresAt: Date;
}

/**
 * Service for handling password reset flows
 */
@Injectable()
export class PasswordResetService extends BaseService {
  // Token expiration time in seconds (default: 1 hour)
  private readonly tokenExpiration: number = 3600;

  constructor(
    @Inject(AUTH_CONFIG) private readonly config: SumpAuthConfig,
    private readonly passwordResetRepository: PasswordResetRepository,
    private readonly passwordService: PasswordService,
    private readonly sessionService: SessionService
  ) {
    super('password-reset-service');
    // Config available for future options
    void this.config;
  }

  /**
   * Request a password reset for an account
   * Creates a reset token that can be sent to the user (via email, etc.)
   *
   * @returns The token and expiration date (to be sent to the user)
   */
  async requestReset(
    accountType: AccountType,
    accountId: string
  ): Promise<RequestResetResult> {
    // Generate a cryptographically secure token
    const token = this.generateToken();
    const expiresAt = new Date(Date.now() + this.tokenExpiration * 1000);

    // Delete any existing tokens for this account (only one active at a time)
    await this.passwordResetRepository.deleteAllByAccount(accountType, accountId);

    // Create the new token
    await this.passwordResetRepository.create({
      token,
      accountType,
      accountId,
      expiresAt,
    });

    this.logger.info(
      { accountType, accountId },
      'Password reset token created'
    );

    return { token, expiresAt };
  }

  /**
   * Validate a password reset token
   *
   * @returns The token data if valid, null otherwise
   */
  async validateToken(token: string): Promise<IPasswordResetToken | null> {
    const resetToken = await this.passwordResetRepository.findValidByToken(token);

    if (!resetToken) {
      this.logger.info('Invalid or expired password reset token');
      return null;
    }

    return resetToken;
  }

  /**
   * Reset a password using a valid token
   *
   * @param token - The reset token
   * @param newPassword - The new password (will be validated and hashed)
   * @param updatePasswordFn - Function to update the password in the account table
   * @returns true if successful
   */
  async resetPassword(
    token: string,
    newPassword: string,
    updatePasswordFn: (accountId: string, passwordHash: string) => Promise<boolean>
  ): Promise<boolean> {
    // Validate the token
    const resetToken = await this.passwordResetRepository.findValidByToken(token);

    if (!resetToken) {
      this.logger.info('Password reset failed: invalid or expired token');
      return false;
    }

    // Validate password strength
    const validation = this.passwordService.validateStrength(newPassword);
    if (!validation.valid) {
      this.logger.info(
        { errors: validation.errors },
        'Password reset failed: weak password'
      );
      throw new Error(`Password validation failed: ${validation.errors.join(', ')}`);
    }

    // Hash the new password
    const passwordHash = await this.passwordService.hash(newPassword);

    // Update the password in the account table
    const updated = await updatePasswordFn(resetToken.accountId, passwordHash);

    if (!updated) {
      this.logger.error(
        { accountId: resetToken.accountId },
        'Password reset failed: could not update account'
      );
      return false;
    }

    // Mark the token as used
    await this.passwordResetRepository.markAsUsed(token);

    // Revoke all sessions for this account (security measure)
    await this.sessionService.revokeAll(resetToken.accountType, resetToken.accountId);

    this.logger.info(
      { accountType: resetToken.accountType, accountId: resetToken.accountId },
      'Password reset successful, all sessions revoked'
    );

    return true;
  }

  /**
   * Generate a cryptographically secure token
   */
  private generateToken(): string {
    return randomBytes(32).toString('hex'); // 64 character hex string
  }

  /**
   * Cleanup expired tokens (should be called periodically)
   */
  async cleanup(): Promise<number> {
    const deleted = await this.passwordResetRepository.deleteExpired();
    if (deleted > 0) {
      this.logger.info({ count: deleted }, 'Cleaned up expired password reset tokens');
    }
    return deleted;
  }
}
