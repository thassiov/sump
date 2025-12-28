import { Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AUTH_CONFIG, SumpAuthConfig } from '../config';

@Injectable()
export class PasswordService {
  private readonly saltRounds: number;

  constructor(@Inject(AUTH_CONFIG) private readonly config: SumpAuthConfig) {
    this.saltRounds = config.password?.saltRounds ?? 12;
  }

  /**
   * Hash a password using bcrypt
   */
  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  /**
   * Verify a password against a hash
   */
  async verify(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Check if password meets minimum requirements
   */
  validateStrength(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const minLength = this.config.password?.minLength ?? 8;
    const maxLength = this.config.password?.maxLength ?? 72;

    if (password.length < minLength) {
      errors.push(`Password must be at least ${minLength} characters`);
    }

    if (password.length > maxLength) {
      errors.push(`Password must be at most ${maxLength} characters`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
