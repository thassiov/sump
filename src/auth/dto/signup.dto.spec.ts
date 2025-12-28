import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { TenantSignupDto, EnvironmentSignupDto } from './signup.dto';

describe('TenantSignupDto', () => {
  const validateDto = async (data: Record<string, unknown>) => {
    const dto = plainToInstance(TenantSignupDto, data);
    return validate(dto, { whitelist: true, forbidNonWhitelisted: true });
  };

  const validPayload = {
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    username: 'janesmith',
    password: 'SecureP@ssw0rd!',
  };

  describe('valid payloads', () => {
    it('should accept valid full payload with required fields only', async () => {
      const errors = await validateDto(validPayload);
      expect(errors).toHaveLength(0);
    });

    it('should accept valid payload with optional phone', async () => {
      const errors = await validateDto({
        ...validPayload,
        phone: '+1234567890',
      });
      expect(errors).toHaveLength(0);
    });

    it('should accept valid payload with optional avatarUrl', async () => {
      const errors = await validateDto({
        ...validPayload,
        avatarUrl: 'https://example.com/avatar.png',
      });
      expect(errors).toHaveLength(0);
    });

    it('should accept valid payload with all fields', async () => {
      const errors = await validateDto({
        ...validPayload,
        phone: '+1234567890',
        avatarUrl: 'https://example.com/avatar.png',
      });
      expect(errors).toHaveLength(0);
    });
  });

  describe('name validation', () => {
    it('should reject missing name', async () => {
      const { name: _, ...payloadWithoutName } = validPayload;
      const errors = await validateDto(payloadWithoutName);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'name')).toBe(true);
    });

    it('should reject name shorter than 3 characters', async () => {
      const errors = await validateDto({
        ...validPayload,
        name: 'Jo',
      });
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'name')).toBe(true);
    });

    it('should accept name with exactly 3 characters', async () => {
      const errors = await validateDto({
        ...validPayload,
        name: 'Joe',
      });
      expect(errors).toHaveLength(0);
    });

    it('should reject name longer than 100 characters', async () => {
      const errors = await validateDto({
        ...validPayload,
        name: 'A'.repeat(101),
      });
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'name')).toBe(true);
    });

    it('should accept name with exactly 100 characters', async () => {
      const errors = await validateDto({
        ...validPayload,
        name: 'A'.repeat(100),
      });
      expect(errors).toHaveLength(0);
    });
  });

  describe('email validation', () => {
    it('should reject missing email', async () => {
      const { email: _, ...payloadWithoutEmail } = validPayload;
      const errors = await validateDto(payloadWithoutEmail);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'email')).toBe(true);
    });

    it('should reject invalid email format', async () => {
      const errors = await validateDto({
        ...validPayload,
        email: 'not-an-email',
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
        const errors = await validateDto({ ...validPayload, email });
        expect(errors).toHaveLength(0);
      }
    });
  });

  describe('username validation', () => {
    it('should reject missing username', async () => {
      const { username: _, ...payloadWithoutUsername } = validPayload;
      const errors = await validateDto(payloadWithoutUsername);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'username')).toBe(true);
    });

    it('should reject username shorter than 3 characters', async () => {
      const errors = await validateDto({
        ...validPayload,
        username: 'ab',
      });
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'username')).toBe(true);
    });

    it('should accept username with exactly 3 characters', async () => {
      const errors = await validateDto({
        ...validPayload,
        username: 'abc',
      });
      expect(errors).toHaveLength(0);
    });

    it('should reject username longer than 20 characters', async () => {
      const errors = await validateDto({
        ...validPayload,
        username: 'a'.repeat(21),
      });
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'username')).toBe(true);
    });

    it('should accept username with exactly 20 characters', async () => {
      const errors = await validateDto({
        ...validPayload,
        username: 'a'.repeat(20),
      });
      expect(errors).toHaveLength(0);
    });
  });

  describe('password validation', () => {
    it('should reject missing password', async () => {
      const { password: _, ...payloadWithoutPassword } = validPayload;
      const errors = await validateDto(payloadWithoutPassword);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'password')).toBe(true);
    });

    it('should reject password shorter than 8 characters', async () => {
      const errors = await validateDto({
        ...validPayload,
        password: 'short',
      });
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'password')).toBe(true);
    });

    it('should accept password with exactly 8 characters', async () => {
      const errors = await validateDto({
        ...validPayload,
        password: '12345678',
      });
      expect(errors).toHaveLength(0);
    });
  });

  describe('avatarUrl validation', () => {
    it('should reject invalid URL format', async () => {
      const errors = await validateDto({
        ...validPayload,
        avatarUrl: 'not-a-url',
      });
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'avatarUrl')).toBe(true);
    });

    it('should accept valid URL formats', async () => {
      const validUrls = [
        'https://example.com/avatar.png',
        'http://example.com/image.jpg',
        'https://cdn.example.com/path/to/avatar.webp',
      ];

      for (const avatarUrl of validUrls) {
        const errors = await validateDto({ ...validPayload, avatarUrl });
        expect(errors).toHaveLength(0);
      }
    });
  });

  describe('unknown properties', () => {
    it('should reject unknown properties', async () => {
      const errors = await validateDto({
        ...validPayload,
        unknownField: 'should-be-rejected',
      });
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'unknownField')).toBe(true);
    });
  });
});

describe('EnvironmentSignupDto', () => {
  const validateDto = async (data: Record<string, unknown>) => {
    const dto = plainToInstance(EnvironmentSignupDto, data);
    return validate(dto, { whitelist: true, forbidNonWhitelisted: true });
  };

  const validPayload = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    username: 'johndoe',
    password: 'SecureP@ssw0rd!',
  };

  describe('valid payloads', () => {
    it('should accept valid full payload with required fields only', async () => {
      const errors = await validateDto(validPayload);
      expect(errors).toHaveLength(0);
    });

    it('should accept valid payload with optional phone', async () => {
      const errors = await validateDto({
        ...validPayload,
        phone: '+1234567890',
      });
      expect(errors).toHaveLength(0);
    });

    it('should accept valid payload with optional avatarUrl', async () => {
      const errors = await validateDto({
        ...validPayload,
        avatarUrl: 'https://example.com/avatar.png',
      });
      expect(errors).toHaveLength(0);
    });

    it('should accept valid payload with all fields', async () => {
      const errors = await validateDto({
        ...validPayload,
        phone: '+1234567890',
        avatarUrl: 'https://example.com/avatar.png',
      });
      expect(errors).toHaveLength(0);
    });
  });

  describe('name validation', () => {
    it('should reject missing name', async () => {
      const { name: _, ...payloadWithoutName } = validPayload;
      const errors = await validateDto(payloadWithoutName);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'name')).toBe(true);
    });

    it('should reject name shorter than 3 characters', async () => {
      const errors = await validateDto({
        ...validPayload,
        name: 'Jo',
      });
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'name')).toBe(true);
    });

    it('should accept name with exactly 3 characters', async () => {
      const errors = await validateDto({
        ...validPayload,
        name: 'Joe',
      });
      expect(errors).toHaveLength(0);
    });

    it('should reject name longer than 100 characters', async () => {
      const errors = await validateDto({
        ...validPayload,
        name: 'A'.repeat(101),
      });
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'name')).toBe(true);
    });

    it('should accept name with exactly 100 characters', async () => {
      const errors = await validateDto({
        ...validPayload,
        name: 'A'.repeat(100),
      });
      expect(errors).toHaveLength(0);
    });
  });

  describe('email validation', () => {
    it('should reject missing email', async () => {
      const { email: _, ...payloadWithoutEmail } = validPayload;
      const errors = await validateDto(payloadWithoutEmail);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'email')).toBe(true);
    });

    it('should reject invalid email format', async () => {
      const errors = await validateDto({
        ...validPayload,
        email: 'not-an-email',
      });
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'email')).toBe(true);
    });
  });

  describe('username validation', () => {
    it('should reject missing username', async () => {
      const { username: _, ...payloadWithoutUsername } = validPayload;
      const errors = await validateDto(payloadWithoutUsername);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'username')).toBe(true);
    });

    it('should reject username shorter than 3 characters', async () => {
      const errors = await validateDto({
        ...validPayload,
        username: 'ab',
      });
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'username')).toBe(true);
    });

    it('should reject username longer than 20 characters', async () => {
      const errors = await validateDto({
        ...validPayload,
        username: 'a'.repeat(21),
      });
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'username')).toBe(true);
    });
  });

  describe('password validation', () => {
    it('should reject missing password', async () => {
      const { password: _, ...payloadWithoutPassword } = validPayload;
      const errors = await validateDto(payloadWithoutPassword);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'password')).toBe(true);
    });

    it('should reject password shorter than 8 characters', async () => {
      const errors = await validateDto({
        ...validPayload,
        password: 'short',
      });
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'password')).toBe(true);
    });

    it('should accept password with exactly 8 characters', async () => {
      const errors = await validateDto({
        ...validPayload,
        password: '12345678',
      });
      expect(errors).toHaveLength(0);
    });
  });

  describe('avatarUrl validation', () => {
    it('should reject invalid URL format', async () => {
      const errors = await validateDto({
        ...validPayload,
        avatarUrl: 'not-a-url',
      });
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'avatarUrl')).toBe(true);
    });

    it('should accept valid URL formats', async () => {
      const errors = await validateDto({
        ...validPayload,
        avatarUrl: 'https://example.com/avatar.png',
      });
      expect(errors).toHaveLength(0);
    });
  });

  describe('unknown properties', () => {
    it('should reject unknown properties', async () => {
      const errors = await validateDto({
        ...validPayload,
        unknownField: 'should-be-rejected',
      });
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'unknownField')).toBe(true);
    });
  });
});
