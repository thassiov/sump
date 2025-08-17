import z from 'zod';
import { profileSchema } from './profile.type';

const createProfileDtoSchema = profileSchema.pick({ fullName: true });
type ICreateProfileDto = z.infer<typeof createProfileDtoSchema>;

const updateProfileDtoSchema = createProfileDtoSchema.partial();
type IUpdateProfileDto = z.infer<typeof updateProfileDtoSchema>;

export type { ICreateProfileDto, IUpdateProfileDto };

export { createProfileDtoSchema, updateProfileDtoSchema };
