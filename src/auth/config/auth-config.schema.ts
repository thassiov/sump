import z from 'zod';

const sessionConfigSchema = z.object({
  cookieName: z.string().min(1).default('sump_session'),
  // Absolute timeout - max session lifetime regardless of activity (default: 30 days)
  absoluteTimeout: z.number().positive().default(2592000),
  // Idle timeout - max inactivity before session expires (default: 7 days)
  idleTimeout: z.number().positive().default(604800),
  secure: z.boolean().optional(), // defaults based on NODE_ENV
  sameSite: z.enum(['strict', 'lax', 'none']).default('lax'),
});

const passwordConfigSchema = z.object({
  minLength: z.number().min(6).default(8),
  maxLength: z.number().max(128).default(72), // bcrypt max
  saltRounds: z.number().min(10).max(15).default(12),
});

const sumpAuthConfigSchema = z.object({
  // Required - for cookie signing
  secret: z.string().min(32, 'AUTH_SECRET must be at least 32 characters'),

  // Optional - for key rotation during transition
  previousSecret: z.string().min(32).optional(),

  // Session configuration
  session: sessionConfigSchema.optional(),

  // Password configuration
  password: passwordConfigSchema.optional(),
});

type SumpAuthConfig = z.infer<typeof sumpAuthConfigSchema>;
type SessionConfig = z.infer<typeof sessionConfigSchema>;
type PasswordConfig = z.infer<typeof passwordConfigSchema>;

export {
  passwordConfigSchema,
  sessionConfigSchema,
  sumpAuthConfigSchema,
};
export type { PasswordConfig, SessionConfig, SumpAuthConfig };
