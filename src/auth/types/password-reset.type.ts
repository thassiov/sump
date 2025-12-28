import { AccountType } from './session.type';

/**
 * Password reset token stored in the database
 */
interface IPasswordResetToken {
  id: string;
  token: string;
  accountType: AccountType;
  accountId: string;
  expiresAt: Date;
  usedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Data required to create a password reset token
 */
interface ICreatePasswordResetToken {
  token: string;
  accountType: AccountType;
  accountId: string;
  expiresAt: Date;
}

export type { IPasswordResetToken, ICreatePasswordResetToken };
