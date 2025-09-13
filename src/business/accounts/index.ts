import { createAccountUseCase, createAccountUseCaseEndpoint } from './create';

export const accounts = {
  createAccountUseCase: {
    service: createAccountUseCase,
    endpoint: createAccountUseCaseEndpoint,
  },
};
