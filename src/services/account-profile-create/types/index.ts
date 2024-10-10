import z from 'zod';

const accountProfileDtoSchema = z.object({
  handle: z.string().min(1),
  fullName: z.string().min(1),
});

type IAccountProfileDto = z.infer<typeof accountProfileDtoSchema>;

type IAccountProfileCreateResult = {
  accountId: string;
};

type IAccountProfileCreateService = {
  create: (
    newAcccount: IAccountProfileDto
  ) => Promise<IAccountProfileCreateResult>;
};

export { accountProfileDtoSchema };
export type {
  IAccountProfileDto,
  IAccountProfileCreateResult,
  IAccountProfileCreateService,
};
