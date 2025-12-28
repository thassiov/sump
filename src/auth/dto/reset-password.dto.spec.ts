import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { ResetPasswordDto } from './reset-password.dto';

describe('ResetPasswordDto', () => {
  const validateDto = async (data: Record<string, unknown>) => {
    const dto = plainToInstance(ResetPasswordDto, data);
    return validate(dto, { whitelist: true, forbidNonWhitelisted: true });
  };

  describe('valid payloads', () => {
    it('should accept valid token and newPassword', async () => {
      const errors = await validateDto({
        token: 'a1b2c3d4e5f6g7h8i9j0',
        newPassword: 'NewSecureP@ssw0rd!',
      });
      expect(errors).toHaveLength(0);
    });

    it('should accept password exactly 8 characters', async () => {
      const errors = await validateDto({
        token: 'valid-token',
        newPassword: '12345678',
      });
      expect(errors).toHaveLength(0);
    });

    it('should accept long passwords', async () => {
      const errors = await validateDto({
        token: 'valid-token',
        newPassword: 'ThisIsAVeryLongPasswordThatShouldStillBeValid123!',
      });
      expect(errors).toHaveLength(0);
    });
  });

  describe('token validation', () => {
    it('should reject missing token', async () => {
      const errors = await validateDto({
        newPassword: 'NewSecureP@ssw0rd!',
      });
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'token')).toBe(true);
    });

    it('should reject non-string token', async () => {
      const errors = await validateDto({
        token: 12345,
        newPassword: 'NewSecureP@ssw0rd!',
      });
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'token')).toBe(true);
    });
  });

  describe('newPassword validation', () => {
    it('should reject missing newPassword', async () => {
      const errors = await validateDto({
        token: 'valid-token',
      });
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'newPassword')).toBe(true);
    });

    it('should reject password shorter than 8 characters', async () => {
      const errors = await validateDto({
        token: 'valid-token',
        newPassword: 'short',
      });
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'newPassword')).toBe(true);
    });

    it('should reject password with exactly 7 characters', async () => {
      const errors = await validateDto({
        token: 'valid-token',
        newPassword: '1234567',
      });
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'newPassword')).toBe(true);
    });

    it('should reject non-string newPassword', async () => {
      const errors = await validateDto({
        token: 'valid-token',
        newPassword: 12345678,
      });
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'newPassword')).toBe(true);
    });
  });

  describe('unknown properties', () => {
    it('should reject unknown properties', async () => {
      const errors = await validateDto({
        token: 'valid-token',
        newPassword: 'NewSecureP@ssw0rd!',
        unknownField: 'should-be-rejected',
      });
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'unknownField')).toBe(true);
    });
  });
});
