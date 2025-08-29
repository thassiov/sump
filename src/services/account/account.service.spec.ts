import { faker } from '@faker-js/faker';

import { contexts } from '../../lib/contexts';
import { UnexpectedError, ValidationError } from '../../lib/errors';
import { AccountService } from './account.service';
import {
  ICreateAccountDto,
  IGetAccountDto,
  IUpdateAccountDto,
  IUpdateAccountEmailDto,
  IUpdateAccountNonSensitivePropertiesDto,
  IUpdateAccountPhoneDto,
  IUpdateAccountUsernameDto,
} from './types/dto.type';
import { IAccountRepository } from './types/repository.type';

describe('Account Service', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  const mockAccountRepository = {
    create: jest.fn(),
    getById: jest.fn(),
    deleteById: jest.fn(),
    updateById: jest.fn(),
  };

  describe('create', () => {
    it('should fail to create a new account due to invalid tenantId format', async () => {
      const tenantIdWithInvalidFormat = 'this-is-not-a-uuid';
      const mockThrownError = {
        details: {
          input: { tenantId: tenantIdWithInvalidFormat },
          errors: { tenantId: 'field value is invalid' },
        },
        context: contexts.ACCOUNT_CREATE,
      };

      const mockAccount = {};

      const accountService = new AccountService(mockAccountRepository);

      const loggerSpyInfo = jest.spyOn(
        (accountService as unknown as { logger: { info: typeof jest.fn } })
          .logger,
        'info'
      );
      const loggerSpyError = jest.spyOn(
        (accountService as unknown as { logger: { error: typeof jest.fn } })
          .logger,
        'error'
      );

      let thrown;

      try {
        await accountService.create(
          tenantIdWithInvalidFormat,
          mockAccount as ICreateAccountDto
        );
      } catch (error) {
        thrown = error;
      }

      expect(thrown).toBeInstanceOf(ValidationError);
      expect((thrown as ValidationError).details).toEqual(
        mockThrownError.details
      );
      expect((thrown as ValidationError).context).toEqual(
        mockThrownError.context
      );

      expect(loggerSpyInfo).toHaveBeenCalledTimes(1);
      expect(loggerSpyInfo).toHaveBeenCalledWith(
        `create account for tenant ${tenantIdWithInvalidFormat}`
      );
      expect(loggerSpyError).toHaveBeenCalledTimes(1);
      expect(loggerSpyError).toHaveBeenCalledWith(thrown);
    });

    it.each([
      [{}],
      [true],
      [10],
      [
        {
          email: '',
          phone: '',
          name: '',
          username: '',
          avatarUrl: '',
        },
      ],
      [
        {
          email: undefined,
          phone: undefined,
          name: undefined,
          username: undefined,
          avatarUrl: undefined,
        },
      ],
    ])(
      'should fail to create a new account due to validation errors in the new account payload (%p)',
      async (mockAccountInfo) => {
        const mockTenantId = faker.string.uuid();
        const accountService = new AccountService(mockAccountRepository);

        const loggerSpyInfo = jest.spyOn(
          (accountService as unknown as { logger: { info: typeof jest.fn } })
            .logger,
          'info'
        );
        const loggerSpyError = jest.spyOn(
          (accountService as unknown as { logger: { error: typeof jest.fn } })
            .logger,
          'error'
        );

        let thrown;
        try {
          await accountService.create(
            mockTenantId,
            mockAccountInfo as ICreateAccountDto
          );
        } catch (error) {
          thrown = error;
        }

        expect(thrown).toBeInstanceOf(ValidationError);
        expect((thrown as ValidationError).context).toEqual(
          contexts.ACCOUNT_CREATE
        );
        expect(loggerSpyInfo).toHaveBeenCalledTimes(1);
        expect(loggerSpyInfo).toHaveBeenCalledWith(
          `create account for tenant ${mockTenantId}`
        );
        expect(loggerSpyError).toHaveBeenCalledTimes(1);
      }
    );

    it.each([
      [
        {
          id: faker.string.uuid(),
        },
      ],
      [
        {
          tenantId: faker.string.uuid(),
        },
      ],
      [
        {
          roles: ['owner'],
        },
      ],
      [
        {
          emailVerified: true,
        },
      ],
      [
        {
          phoneVerified: true,
        },
      ],
      [
        {
          createdAt: new Date(),
        },
      ],
      [
        {
          updatedAt: new Date(),
        },
      ],
    ])(
      'should fail to create a new account due to trying to add internal properties (%p)',
      async (internalProperty) => {
        const mockTenantId = faker.string.uuid();

        const mockAccountInfo = {
          email: faker.internet.email(),
          phone: faker.phone.number({ style: 'international' }),
          name: faker.person.fullName(),
          username: faker.internet.username(),
          avatarUrl: faker.image.url(),
          ...internalProperty,
        };

        const internalPropertyKey = Object.keys(
          internalProperty
        )[0] as unknown as string;

        const mockThrownError = {
          details: {
            input: mockAccountInfo,
            errors: {
              [internalPropertyKey]: 'field is not allowed',
            },
          },
          context: contexts.ACCOUNT_CREATE,
        };

        const accountService = new AccountService(mockAccountRepository);

        const loggerSpyInfo = jest.spyOn(
          (accountService as unknown as { logger: { info: typeof jest.fn } })
            .logger,
          'info'
        );
        const loggerSpyError = jest.spyOn(
          (accountService as unknown as { logger: { error: typeof jest.fn } })
            .logger,
          'error'
        );

        let thrown;
        try {
          await accountService.create(
            mockTenantId,
            mockAccountInfo as ICreateAccountDto
          );
        } catch (error) {
          thrown = error;
        }

        expect(thrown).toBeInstanceOf(ValidationError);
        expect((thrown as ValidationError).context).toEqual(
          mockThrownError.context
        );
        expect((thrown as ValidationError).details).toEqual(
          mockThrownError.details
        );

        expect(loggerSpyInfo).toHaveBeenCalledTimes(1);
        expect(loggerSpyInfo).toHaveBeenCalledWith(
          `create account for tenant ${mockTenantId}`
        );
        expect(loggerSpyError).toHaveBeenCalledTimes(1);
      }
    );

    it('should fail to create a new account due to repository error', async () => {
      const mockTenantId = faker.string.uuid();
      const mockThrownError = new UnexpectedError({
        details: { message: 'repository-failure' },
      });
      mockAccountRepository.create.mockRejectedValueOnce(mockThrownError);

      const mockAccount = {
        email: faker.internet.email(),
        phone: faker.phone.number({ style: 'international' }),
        name: faker.person.fullName(),
        username: faker.internet.username(),
        avatarUrl: faker.image.url(),
      };

      const accountService = new AccountService(mockAccountRepository);

      const loggerSpyInfo = jest.spyOn(
        (accountService as unknown as { logger: { info: typeof jest.fn } })
          .logger,
        'info'
      );
      const loggerSpyError = jest.spyOn(
        (accountService as unknown as { logger: { error: typeof jest.fn } })
          .logger,
        'error'
      );

      let thrown;

      try {
        await accountService.create(mockTenantId, mockAccount);
      } catch (error) {
        thrown = error;
      }

      expect(thrown).toBeInstanceOf(UnexpectedError);
      expect((thrown as UnexpectedError).details).toEqual(
        mockThrownError.details
      );

      expect(loggerSpyInfo).toHaveBeenCalledTimes(1);
      expect(loggerSpyInfo).toHaveBeenCalledWith(
        `create account for tenant ${mockTenantId}`
      );
      expect(loggerSpyError).toHaveBeenCalledTimes(1);
    });

    it('should create a new account', async () => {
      const mockTenantId = faker.string.uuid();
      const mockAccount = {
        email: faker.internet.email(),
        phone: faker.phone.number({ style: 'international' }),
        name: faker.person.fullName(),
        username: faker.internet.username(),
        avatarUrl: faker.image.url(),
        roles: ['admin'],
      };

      const mockAccountId = faker.string.uuid();

      mockAccountRepository.create.mockResolvedValueOnce(mockAccountId);

      const accountService = new AccountService(mockAccountRepository);

      const loggerSpyInfo = jest.spyOn(
        (accountService as unknown as { logger: { info: typeof jest.fn } })
          .logger,
        'info'
      );
      const loggerSpyError = jest.spyOn(
        (accountService as unknown as { logger: { error: typeof jest.fn } })
          .logger,
        'error'
      );

      const result = await accountService.create(mockTenantId, mockAccount);

      expect(result).toEqual(mockAccountId);

      expect(loggerSpyInfo).toHaveBeenCalledTimes(2);
      expect(loggerSpyInfo).toHaveBeenNthCalledWith(
        1,
        `create account for tenant ${mockTenantId}`
      );
      expect(loggerSpyInfo).toHaveBeenNthCalledWith(
        2,
        `new account created: ${mockAccountId}`
      );
      expect(loggerSpyError).not.toHaveBeenCalled();
    });
  });

  describe('getById', () => {
    it('should retrieve a account', async () => {
      const mockAccount: IGetAccountDto = {
        id: faker.string.uuid(),
        email: faker.internet.email(),
        phone: faker.phone.number({ style: 'international' }),
        name: faker.person.fullName(),
        username: faker.internet.username(),
        avatarUrl: faker.image.url(),
        tenantId: faker.string.uuid(),
        roles: ['owner'],
      };

      // @TODO: spy on this method so we assert number of calls and arguments passed
      mockAccountRepository.getById.mockResolvedValue(mockAccount);

      const accountService = new AccountService(
        mockAccountRepository as unknown as IAccountRepository
      );

      const loggerSpyInfo = jest.spyOn(
        (accountService as unknown as { logger: { info: typeof jest.fn } })
          .logger,
        'info'
      );
      const loggerSpyError = jest.spyOn(
        (accountService as unknown as { logger: { error: typeof jest.fn } })
          .logger,
        'error'
      );

      const result = await accountService.getById(mockAccount.id);

      expect(result).toEqual(mockAccount);

      expect(loggerSpyInfo).toHaveBeenCalledTimes(1);
      expect(loggerSpyInfo).toHaveBeenCalledWith(`getById: ${mockAccount.id}`);
      expect(loggerSpyError).toHaveBeenCalledTimes(0);
    });

    it('should return undefined when the account was not found', async () => {
      const mockAccountId = faker.string.uuid();
      const mockAccount = undefined;
      // @TODO: spy on this method so we assert number of calls and arguments passed
      mockAccountRepository.getById.mockResolvedValue(mockAccount);

      const accountService = new AccountService(
        mockAccountRepository as unknown as IAccountRepository
      );

      const loggerSpyInfo = jest.spyOn(
        (accountService as unknown as { logger: { info: typeof jest.fn } })
          .logger,
        'info'
      );
      const loggerSpyError = jest.spyOn(
        (accountService as unknown as { logger: { error: typeof jest.fn } })
          .logger,
        'error'
      );

      const result = await accountService.getById(mockAccountId);

      expect(result).toEqual(mockAccount);

      expect(loggerSpyInfo).toHaveBeenCalledTimes(1);
      expect(loggerSpyInfo).toHaveBeenCalledWith(`getById: ${mockAccountId}`);
      expect(loggerSpyError).toHaveBeenCalledTimes(0);
    });

    it('should fail by not sending a valid account id (uuid)', async () => {
      const faultyAccountId = 'thisshouldbeauuid';
      const expectedValidationError = {
        details: {
          input: { id: faultyAccountId },
          errors: { id: 'field value is invalid' },
        },
        context: contexts.ACCOUNT_GET_BY_ID,
      };

      const accountService = new AccountService(mockAccountRepository);

      const loggerSpyInfo = jest.spyOn(
        (accountService as unknown as { logger: { info: typeof jest.fn } })
          .logger,
        'info'
      );
      const loggerSpyError = jest.spyOn(
        (accountService as unknown as { logger: { error: typeof jest.fn } })
          .logger,
        'error'
      );

      let thrown;

      try {
        await accountService.getById(faultyAccountId);
      } catch (error) {
        thrown = error;
      }

      expect(thrown).toBeInstanceOf(ValidationError);
      expect((thrown as ValidationError).details).toEqual(
        expectedValidationError.details
      );
      expect((thrown as ValidationError).context).toEqual(
        expectedValidationError.context
      );

      expect(loggerSpyInfo).toHaveBeenCalledTimes(1);
      expect(loggerSpyInfo).toHaveBeenCalledWith(`getById: ${faultyAccountId}`);
      expect(loggerSpyError).toHaveBeenCalledTimes(1);
    });
  });

  describe('deleteById', () => {
    it('should delete an account', async () => {
      const mockAccountId = faker.string.uuid();
      const mockResult = true;

      mockAccountRepository.deleteById.mockResolvedValue(mockResult);

      const accountService = new AccountService(
        mockAccountRepository as unknown as IAccountRepository
      );

      const loggerSpyInfo = jest.spyOn(
        (accountService as unknown as { logger: { info: typeof jest.fn } })
          .logger,
        'info'
      );
      const loggerSpyError = jest.spyOn(
        (accountService as unknown as { logger: { error: typeof jest.fn } })
          .logger,
        'error'
      );

      const result = await accountService.deleteById(mockAccountId);

      expect(result).toBe(mockResult);

      expect(loggerSpyInfo).toHaveBeenCalledTimes(1);
      expect(loggerSpyInfo).toHaveBeenCalledWith(
        `deleteById: ${mockAccountId}`
      );
      expect(loggerSpyError).toHaveBeenCalledTimes(0);
    });

    it('should fail by not sending a valid account id (uuid)', async () => {
      const faultyAccountId = 'thisshouldbeauuid';
      const expectedValidationError = {
        details: {
          input: { id: faultyAccountId },
          errors: { id: 'field value is invalid' },
        },
        context: contexts.ACCOUNT_DELETE_BY_ID,
      };

      const accountService = new AccountService(mockAccountRepository);

      const loggerSpyInfo = jest.spyOn(
        (accountService as unknown as { logger: { info: typeof jest.fn } })
          .logger,
        'info'
      );
      const loggerSpyError = jest.spyOn(
        (accountService as unknown as { logger: { error: typeof jest.fn } })
          .logger,
        'error'
      );

      let thrown;

      try {
        await accountService.deleteById(faultyAccountId);
      } catch (error) {
        thrown = error;
      }

      expect(thrown).toBeInstanceOf(ValidationError);
      expect((thrown as ValidationError).details).toEqual(
        expectedValidationError.details
      );
      expect((thrown as ValidationError).context).toEqual(
        expectedValidationError.context
      );

      expect(loggerSpyInfo).toHaveBeenCalledTimes(1);
      expect(loggerSpyInfo).toHaveBeenCalledWith(
        `deleteById: ${faultyAccountId}`
      );
      expect(loggerSpyError).toHaveBeenCalledTimes(1);
    });
  });

  describe('update', () => {
    describe('updateNonSensitivePropertiesById', () => {
      it.each([
        [
          {
            name: faker.person.fullName(),
            avatarUrl: faker.image.url(),
          },
        ],
        [
          {
            name: faker.person.fullName(),
          },
        ],
        [
          {
            avatarUrl: faker.image.url(),
          },
        ],
      ])(
        'should update an account _non sensitive properties_ by id (%p)',
        async (dto) => {
          const mockAccountId = faker.string.uuid();
          const mockUpdateAccountDto: IUpdateAccountDto = dto;
          const mockUpdateAccountResult = true;

          mockAccountRepository.updateById.mockResolvedValue(
            mockUpdateAccountResult
          );

          const accountService = new AccountService(
            mockAccountRepository as unknown as IAccountRepository
          );

          const loggerSpyInfo = jest.spyOn(
            (accountService as unknown as { logger: { info: typeof jest.fn } })
              .logger,
            'info'
          );
          const loggerSpyError = jest.spyOn(
            (accountService as unknown as { logger: { error: typeof jest.fn } })
              .logger,
            'error'
          );

          const result = await accountService.updateNonSensitivePropertiesById(
            mockAccountId,
            mockUpdateAccountDto as IUpdateAccountNonSensitivePropertiesDto
          );

          expect(result).toEqual(mockUpdateAccountResult);

          expect(loggerSpyInfo).toHaveBeenCalledTimes(1);
          expect(loggerSpyInfo).toHaveBeenCalledWith(
            `updateNonSensitivePropertiesById: ${mockAccountId}`
          );
          expect(loggerSpyError).toHaveBeenCalledTimes(0);
        }
      );

      it.each([
        [
          {
            name: '',
            avatarUrl: '',
          },
        ],
        [
          {
            name: '',
          },
        ],
        [
          {
            avatarUrl: '',
          },
        ],
        [{}],
        [true],
        [3],
      ])(
        'should fail update an account _non sensitive properties_ by sending empty values (%p)',
        async (dto) => {
          const mockAccountId = faker.string.uuid();
          const mockUpdateAccountDto: IUpdateAccountDto = dto;

          const accountService = new AccountService(
            mockAccountRepository as unknown as IAccountRepository
          );

          const loggerSpyInfo = jest.spyOn(
            (accountService as unknown as { logger: { info: typeof jest.fn } })
              .logger,
            'info'
          );
          const loggerSpyError = jest.spyOn(
            (accountService as unknown as { logger: { error: typeof jest.fn } })
              .logger,
            'error'
          );

          let thrown;
          try {
            await accountService.updateNonSensitivePropertiesById(
              mockAccountId,
              mockUpdateAccountDto as IUpdateAccountNonSensitivePropertiesDto
            );
          } catch (error) {
            thrown = error;
          }

          expect(thrown).toBeInstanceOf(ValidationError);
          expect((thrown as ValidationError).context).toEqual(
            contexts.ACCOUNT_UPDATE_NON_SENSITIVE_PROPERTIES_BY_ID
          );

          expect(loggerSpyInfo).toHaveBeenCalledTimes(1);
          expect(loggerSpyInfo).toHaveBeenCalledWith(
            `updateNonSensitivePropertiesById: ${mockAccountId}`
          );
          expect(loggerSpyError).toHaveBeenCalledTimes(1);
        }
      );

      it('should fail by not sending a valid account id (uuid)', async () => {
        const faultyAccountId = 'thisshouldbeauuid';
        const expectedValidationError = {
          details: {
            input: { id: faultyAccountId },
            errors: { id: 'field value is invalid' },
          },
          context: contexts.ACCOUNT_UPDATE_NON_SENSITIVE_PROPERTIES_BY_ID,
        };

        const accountService = new AccountService(mockAccountRepository);

        const loggerSpyInfo = jest.spyOn(
          (accountService as unknown as { logger: { info: typeof jest.fn } })
            .logger,
          'info'
        );
        const loggerSpyError = jest.spyOn(
          (accountService as unknown as { logger: { error: typeof jest.fn } })
            .logger,
          'error'
        );

        let thrown;

        try {
          await accountService.updateNonSensitivePropertiesById(
            faultyAccountId,
            {} as IUpdateAccountNonSensitivePropertiesDto
          );
        } catch (error) {
          thrown = error;
        }

        expect(thrown).toBeInstanceOf(ValidationError);
        expect((thrown as ValidationError).details).toEqual(
          expectedValidationError.details
        );
        expect((thrown as ValidationError).context).toEqual(
          expectedValidationError.context
        );

        expect(loggerSpyInfo).toHaveBeenCalledTimes(1);
        expect(loggerSpyInfo).toHaveBeenCalledWith(
          `updateNonSensitivePropertiesById: ${faultyAccountId}`
        );
        expect(loggerSpyError).toHaveBeenCalledTimes(1);
      });
    });

    describe('updateEmailById', () => {
      it('should update the account email by id', async () => {
        const mockAccountId = faker.string.uuid();
        const mockUpdateAccountDto: IUpdateAccountEmailDto = {
          email: faker.internet.email(),
        };
        const mockUpdateAccountResult = true;

        mockAccountRepository.updateById.mockResolvedValue(
          mockUpdateAccountResult
        );

        const accountService = new AccountService(
          mockAccountRepository as unknown as IAccountRepository
        );

        const loggerSpyInfo = jest.spyOn(
          (accountService as unknown as { logger: { info: typeof jest.fn } })
            .logger,
          'info'
        );
        const loggerSpyError = jest.spyOn(
          (accountService as unknown as { logger: { error: typeof jest.fn } })
            .logger,
          'error'
        );

        const result = await accountService.updateEmailById(
          mockAccountId,
          mockUpdateAccountDto
        );

        expect(result).toEqual(mockUpdateAccountResult);

        expect(loggerSpyInfo).toHaveBeenCalledTimes(1);
        expect(loggerSpyInfo).toHaveBeenCalledWith(
          `updateEmailById: ${mockAccountId}`
        );
        expect(loggerSpyError).toHaveBeenCalledTimes(0);
      });

      it.each([
        [
          {
            email: 'this-is-not-a-email',
          },
        ],
        [{}],
        [3],
      ])(
        'should fail to update by passing an invalid value as email',
        async (dto) => {
          const mockAccountId = faker.string.uuid();
          const mockUpdateAccountDto: IUpdateAccountEmailDto =
            dto as IUpdateAccountEmailDto;
          const mockValidationErrorContents = {
            details: {
              input: { ...mockUpdateAccountDto },
            },
            context: contexts.ACCOUNT_UPDATE_EMAIL_BY_ID,
          };
          const mockUpdateAccountResult = true;

          mockAccountRepository.updateById.mockResolvedValue(
            mockUpdateAccountResult
          );

          const accountService = new AccountService(
            mockAccountRepository as unknown as IAccountRepository
          );

          const loggerSpyInfo = jest.spyOn(
            (accountService as unknown as { logger: { info: typeof jest.fn } })
              .logger,
            'info'
          );
          const loggerSpyError = jest.spyOn(
            (accountService as unknown as { logger: { error: typeof jest.fn } })
              .logger,
            'error'
          );

          let thrown;
          try {
            await accountService.updateEmailById(
              mockAccountId,
              mockUpdateAccountDto
            );
          } catch (error) {
            thrown = error;
          }

          expect(thrown).toBeInstanceOf(ValidationError);
          expect((thrown as ValidationError).details).toHaveProperty(
            'input',
            mockValidationErrorContents.details.input
          );
          expect((thrown as ValidationError).details).toHaveProperty('errors');
          expect((thrown as ValidationError).context).toEqual(
            mockValidationErrorContents.context
          );

          expect(loggerSpyInfo).toHaveBeenCalledTimes(1);
          expect(loggerSpyInfo).toHaveBeenCalledWith(
            `updateEmailById: ${mockAccountId}`
          );
          expect(loggerSpyError).toHaveBeenCalledTimes(1);
        }
      );

      it('should fail to update by not sending a valid account id (uuid)', async () => {
        const faultyAccountId = 'thisshouldbeauuid';
        const expectedValidationError = {
          details: {
            input: { id: faultyAccountId },
            errors: { id: 'field value is invalid' },
          },
          context: contexts.ACCOUNT_UPDATE_EMAIL_BY_ID,
        };

        const accountService = new AccountService(mockAccountRepository);

        const loggerSpyInfo = jest.spyOn(
          (accountService as unknown as { logger: { info: typeof jest.fn } })
            .logger,
          'info'
        );
        const loggerSpyError = jest.spyOn(
          (accountService as unknown as { logger: { error: typeof jest.fn } })
            .logger,
          'error'
        );

        let thrown;

        try {
          await accountService.updateEmailById(
            faultyAccountId,
            {} as IUpdateAccountEmailDto
          );
        } catch (error) {
          thrown = error;
        }

        expect(thrown).toBeInstanceOf(ValidationError);
        expect((thrown as ValidationError).details).toEqual(
          expectedValidationError.details
        );
        expect((thrown as ValidationError).context).toEqual(
          expectedValidationError.context
        );

        expect(loggerSpyInfo).toHaveBeenCalledTimes(1);
        expect(loggerSpyInfo).toHaveBeenCalledWith(
          `updateEmailById: ${faultyAccountId}`
        );
        expect(loggerSpyError).toHaveBeenCalledTimes(1);
      });
    });

    describe('updateUsernameById', () => {
      it('should update the account email by id', async () => {
        const mockAccountId = faker.string.uuid();
        const mockUpdateAccountDto: IUpdateAccountUsernameDto = {
          username: faker.internet.username(),
        };
        const mockUpdateAccountResult = true;

        mockAccountRepository.updateById.mockResolvedValue(
          mockUpdateAccountResult
        );

        const accountService = new AccountService(
          mockAccountRepository as unknown as IAccountRepository
        );

        const loggerSpyInfo = jest.spyOn(
          (accountService as unknown as { logger: { info: typeof jest.fn } })
            .logger,
          'info'
        );
        const loggerSpyError = jest.spyOn(
          (accountService as unknown as { logger: { error: typeof jest.fn } })
            .logger,
          'error'
        );

        const result = await accountService.updateUsernameById(
          mockAccountId,
          mockUpdateAccountDto
        );

        expect(result).toEqual(mockUpdateAccountResult);

        expect(loggerSpyInfo).toHaveBeenCalledTimes(1);
        expect(loggerSpyInfo).toHaveBeenCalledWith(
          `updateUsernameById: ${mockAccountId}`
        );
        expect(loggerSpyError).toHaveBeenCalledTimes(0);
      });

      it.each([
        [
          {
            username: 'this-is-not-a-username',
          },
        ],
        [{}],
        [3],
      ])(
        'should fail to update by passing an invalid value as username',
        async (dto) => {
          const mockAccountId = faker.string.uuid();
          const mockUpdateAccountDto: IUpdateAccountUsernameDto =
            dto as IUpdateAccountUsernameDto;
          const mockValidationErrorContents = {
            details: {
              input: { ...mockUpdateAccountDto },
            },
            context: contexts.ACCOUNT_UPDATE_USERNAME_BY_ID,
          };
          const mockUpdateAccountResult = true;

          mockAccountRepository.updateById.mockResolvedValue(
            mockUpdateAccountResult
          );

          const accountService = new AccountService(
            mockAccountRepository as unknown as IAccountRepository
          );

          const loggerSpyInfo = jest.spyOn(
            (accountService as unknown as { logger: { info: typeof jest.fn } })
              .logger,
            'info'
          );
          const loggerSpyError = jest.spyOn(
            (accountService as unknown as { logger: { error: typeof jest.fn } })
              .logger,
            'error'
          );

          let thrown;
          try {
            await accountService.updateUsernameById(
              mockAccountId,
              mockUpdateAccountDto
            );
          } catch (error) {
            thrown = error;
          }

          expect(thrown).toBeInstanceOf(ValidationError);
          expect((thrown as ValidationError).details).toHaveProperty(
            'input',
            mockValidationErrorContents.details.input
          );
          expect((thrown as ValidationError).details).toHaveProperty('errors');
          expect((thrown as ValidationError).context).toEqual(
            mockValidationErrorContents.context
          );

          expect(loggerSpyInfo).toHaveBeenCalledTimes(1);
          expect(loggerSpyInfo).toHaveBeenCalledWith(
            `updateUsernameById: ${mockAccountId}`
          );
          expect(loggerSpyError).toHaveBeenCalledTimes(1);
        }
      );

      it('should fail to update by not sending a valid account id (uuid)', async () => {
        const faultyAccountId = 'thisshouldbeauuid';
        const expectedValidationError = {
          details: {
            input: { id: faultyAccountId },
            errors: { id: 'field value is invalid' },
          },
          context: contexts.ACCOUNT_UPDATE_USERNAME_BY_ID,
        };

        const accountService = new AccountService(mockAccountRepository);

        const loggerSpyInfo = jest.spyOn(
          (accountService as unknown as { logger: { info: typeof jest.fn } })
            .logger,
          'info'
        );
        const loggerSpyError = jest.spyOn(
          (accountService as unknown as { logger: { error: typeof jest.fn } })
            .logger,
          'error'
        );

        let thrown;

        try {
          await accountService.updateUsernameById(
            faultyAccountId,
            {} as IUpdateAccountUsernameDto
          );
        } catch (error) {
          thrown = error;
        }

        expect(thrown).toBeInstanceOf(ValidationError);
        expect((thrown as ValidationError).details).toEqual(
          expectedValidationError.details
        );
        expect((thrown as ValidationError).context).toEqual(
          expectedValidationError.context
        );

        expect(loggerSpyInfo).toHaveBeenCalledTimes(1);
        expect(loggerSpyInfo).toHaveBeenCalledWith(
          `updateUsernameById: ${faultyAccountId}`
        );
        expect(loggerSpyError).toHaveBeenCalledTimes(1);
      });
    });

    describe('updatePhoneById', () => {
      it('should update the account phone by id', async () => {
        const mockAccountId = faker.string.uuid();
        const mockUpdateAccountDto: IUpdateAccountPhoneDto = {
          phone: faker.phone.number({ style: 'international' }),
        };
        const mockUpdateAccountResult = true;

        mockAccountRepository.updateById.mockResolvedValue(
          mockUpdateAccountResult
        );

        const accountService = new AccountService(
          mockAccountRepository as unknown as IAccountRepository
        );

        const loggerSpyInfo = jest.spyOn(
          (accountService as unknown as { logger: { info: typeof jest.fn } })
            .logger,
          'info'
        );
        const loggerSpyError = jest.spyOn(
          (accountService as unknown as { logger: { error: typeof jest.fn } })
            .logger,
          'error'
        );

        const result = await accountService.updatePhoneById(
          mockAccountId,
          mockUpdateAccountDto
        );

        expect(result).toEqual(mockUpdateAccountResult);

        expect(loggerSpyInfo).toHaveBeenCalledTimes(1);
        expect(loggerSpyInfo).toHaveBeenCalledWith(
          `updatePhoneById: ${mockAccountId}`
        );
        expect(loggerSpyError).toHaveBeenCalledTimes(0);
      });

      it.each([
        [
          {
            phone: 'this-is-not-a-username',
          },
        ],
        [{}],
        [3],
      ])(
        'should fail to update by passing an invalid value as username',
        async (dto) => {
          const mockAccountId = faker.string.uuid();
          const mockUpdateAccountDto: IUpdateAccountPhoneDto =
            dto as IUpdateAccountPhoneDto;
          const mockValidationErrorContents = {
            details: {
              input: { ...mockUpdateAccountDto },
            },
            context: contexts.ACCOUNT_UPDATE_PHONE_BY_ID,
          };
          const mockUpdateAccountResult = true;

          mockAccountRepository.updateById.mockResolvedValue(
            mockUpdateAccountResult
          );

          const accountService = new AccountService(
            mockAccountRepository as unknown as IAccountRepository
          );

          const loggerSpyInfo = jest.spyOn(
            (accountService as unknown as { logger: { info: typeof jest.fn } })
              .logger,
            'info'
          );
          const loggerSpyError = jest.spyOn(
            (accountService as unknown as { logger: { error: typeof jest.fn } })
              .logger,
            'error'
          );

          let thrown;
          try {
            await accountService.updatePhoneById(
              mockAccountId,
              mockUpdateAccountDto
            );
          } catch (error) {
            thrown = error;
          }

          expect(thrown).toBeInstanceOf(ValidationError);
          expect((thrown as ValidationError).details).toHaveProperty(
            'input',
            mockValidationErrorContents.details.input
          );
          expect((thrown as ValidationError).details).toHaveProperty('errors');
          expect((thrown as ValidationError).context).toEqual(
            mockValidationErrorContents.context
          );

          expect(loggerSpyInfo).toHaveBeenCalledTimes(1);
          expect(loggerSpyInfo).toHaveBeenCalledWith(
            `updatePhoneById: ${mockAccountId}`
          );
          expect(loggerSpyError).toHaveBeenCalledTimes(1);
        }
      );

      it('should fail to update by not sending a valid account id (uuid)', async () => {
        const faultyAccountId = 'thisshouldbeauuid';
        const expectedValidationError = {
          details: {
            input: { id: faultyAccountId },
            errors: { id: 'field value is invalid' },
          },
          context: contexts.ACCOUNT_UPDATE_PHONE_BY_ID,
        };

        const accountService = new AccountService(mockAccountRepository);

        const loggerSpyInfo = jest.spyOn(
          (accountService as unknown as { logger: { info: typeof jest.fn } })
            .logger,
          'info'
        );
        const loggerSpyError = jest.spyOn(
          (accountService as unknown as { logger: { error: typeof jest.fn } })
            .logger,
          'error'
        );

        let thrown;

        try {
          await accountService.updatePhoneById(
            faultyAccountId,
            {} as IUpdateAccountPhoneDto
          );
        } catch (error) {
          thrown = error;
        }

        expect(thrown).toBeInstanceOf(ValidationError);
        expect((thrown as ValidationError).details).toEqual(
          expectedValidationError.details
        );
        expect((thrown as ValidationError).context).toEqual(
          expectedValidationError.context
        );

        expect(loggerSpyInfo).toHaveBeenCalledTimes(1);
        expect(loggerSpyInfo).toHaveBeenCalledWith(
          `updatePhoneById: ${faultyAccountId}`
        );
        expect(loggerSpyError).toHaveBeenCalledTimes(1);
      });
    });

    describe('verifyPhoneById', () => {
      it.todo('should mark account phone as verified by account id');
      it.todo('should fail to update by not sending a valid account id (uuid)');
    });

    describe('verifyEmailId', () => {
      it.todo('should mark account email as verified by account id');
      it.todo('should fail to update by not sending a valid account id (uuid)');
    });
  });
});
