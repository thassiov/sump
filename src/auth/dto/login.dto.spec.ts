import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { LoginDto } from './login.dto';

describe('LoginDto', () => {
  const validateDto = async (data: Record<string, unknown>) => {
    const dto = plainToInstance(LoginDto, data);
    return validate(dto, { whitelist: true, forbidNonWhitelisted: true });
  };

  describe('valid payloads', () => {
    it('should accept email + password', async () => {
      const errors = await validateDto({
        email: 'jane.smith@example.com',
        password: 'SecureP@ssw0rd!',
      });
      expect(errors).toHaveLength(0);
    });

    it('should accept username + password', async () => {
      const errors = await validateDto({
        username: 'janesmith',
        password: 'SecureP@ssw0rd!',
      });
      expect(errors).toHaveLength(0);
    });

    it('should accept phone + password', async () => {
      const errors = await validateDto({
        phone: '+1234567890',
        password: 'SecureP@ssw0rd!',
      });
      expect(errors).toHaveLength(0);
    });

    it('should accept all identifiers together', async () => {
      const errors = await validateDto({
        email: 'jane.smith@example.com',
        username: 'janesmith',
        phone: '+1234567890',
        password: 'SecureP@ssw0rd!',
      });
      expect(errors).toHaveLength(0);
    });
  });

  describe('password validation', () => {
    it('should reject missing password', async () => {
      const errors = await validateDto({
        email: 'jane.smith@example.com',
      });
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'password')).toBe(true);
    });

    it('should reject non-string password', async () => {
      const errors = await validateDto({
        email: 'jane.smith@example.com',
        password: 12345,
      });
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'password')).toBe(true);
    });
  });

  describe('email validation', () => {
    it('should reject invalid email format', async () => {
      const errors = await validateDto({
        email: 'not-an-email',
        password: 'SecureP@ssw0rd!',
      });
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'email')).toBe(true);
    });

    it('should accept valid email formats', async () => {
      const validEmails = [
        'user@example.com',
        'user.name@example.com',
        'user+tag@example.co.uk',
      ];

      for (const email of validEmails) {
        const errors = await validateDto({ email, password: 'SecureP@ssw0rd!' });
        expect(errors).toHaveLength(0);
      }
    });
  });

  describe('unknown properties', () => {
    it('should reject unknown properties', async () => {
      const errors = await validateDto({
        email: 'jane.smith@example.com',
        password: 'SecureP@ssw0rd!',
        unknownField: 'should-be-rejected',
      });
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'unknownField')).toBe(true);
    });
  });

  describe('optional identifiers', () => {
    it('should allow omitting email', async () => {
      const errors = await validateDto({
        username: 'janesmith',
        password: 'SecureP@ssw0rd!',
      });
      expect(errors).toHaveLength(0);
    });

    it('should allow omitting phone', async () => {
      const errors = await validateDto({
        email: 'jane@example.com',
        password: 'SecureP@ssw0rd!',
      });
      expect(errors).toHaveLength(0);
    });

    it('should allow omitting username', async () => {
      const errors = await validateDto({
        email: 'jane@example.com',
        password: 'SecureP@ssw0rd!',
      });
      expect(errors).toHaveLength(0);
    });
  });
});
