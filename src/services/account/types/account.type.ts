import z from 'zod';

// @NOTE: I chatgptd this thing.
//  It should match: 'owner', 'admin', 'admin|<uuid>', 'user', 'user|<uuid>'
const roleRegex =
  /^(owner|(admin|user)(|[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})?)$/;

const accountSchema = z.object({
  id: z.uuid(),
  email: z.string().check(z.email()),
  emailVerified: z.boolean(),
  phone: z.string().check(z.e164()),
  phoneVerified: z.boolean(),
  name: z.string().max(100),
  username: z.string().max(20),
  avatarUrl: z.string().check(z.url()),
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
