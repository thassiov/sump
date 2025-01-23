import {
  createAccountDtoSchema,
  createProfileDtoSchema,
  ICreateAccountAndProfileDto,
  ICreateAccountDto,
  ICreateProfileDto,
} from '../../../types/dto.type';

function splitCreateAccountAndProfileDto(
  payload: ICreateAccountAndProfileDto
): { accountInfo: ICreateAccountDto; profileInfo: ICreateProfileDto } {
  const accountInfo = createAccountDtoSchema.parse(payload);
  const profileInfo = createProfileDtoSchema.parse(payload);

  return { accountInfo, profileInfo };
}

export { splitCreateAccountAndProfileDto };
