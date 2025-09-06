import z from 'zod';

// @NOTE: I chatgptd this thing.
//  It should match: 'owner', 'admin', 'admin|<uuid>', 'user', 'user|<uuid>'
const roleRegex =
  /^(owner|(admin|user)(|[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})?)$/;

const accountSchema = z.object({
  id: z.uuid(),
  email: z.string().check(z.email()),
  emailVerified: z.boolean().default(false),
  phone: z.string().check(z.e164()).optional(),
  phoneVerified: z.boolean().default(false),
  name: z.string().min(3).max(100),
  username: z.string().min(3).max(20),
  avatarUrl: z.string().check(z.url()).optional(),
  tenantId: z.uuid(),
  roles: z
    .array(
      z.string().refine((val) => roleRegex.test(val), {
        message: 'Invalid role format',
      })
    )
    .min(0)
    .max(1),
  createdAt: z.date(),
  updatedAt: z.date(),
});

type IAccount = z.infer<typeof accountSchema>;

export { accountSchema };
export type { IAccount };
