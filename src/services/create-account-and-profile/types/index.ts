import z from 'zod';

const accountProfileDtoSchema = z.object({
  handle: z.string().min(1),
  fullName: z.string().min(1),
});

type ICreateAccountAndProfileDto = z.infer<typeof accountProfileDtoSchema>;

type ICreateAccountAndProfileResult = {
  accountId: string;
};

type ICreateAccountAndProfileService = {
  create: (
    newAcccount: ICreateAccountAndProfileDto
  ) => Promise<ICreateAccountAndProfileResult>;
};

export { accountProfileDtoSchema };
export type {
  ICreateAccountAndProfileDto,
  ICreateAccountAndProfileResult,
  ICreateAccountAndProfileService,
};
