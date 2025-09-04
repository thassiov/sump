import { faker } from '@faker-js/faker';
import { contexts } from '../../lib/contexts';
import { UnexpectedError, ValidationError } from '../../lib/errors';
import { TenantEnvironmentAccountService } from './tenant-environment-account.service';
import {
  ICreateTenantEnvironmentAccountDto,
  ICreateTenantEnvironmentAccountNoInternalPropertiesDto,
  IGetTenantEnvironmentAccountDto,
  ITenantEnvironmentAccountCustomPropertiesOperationDtoSchema,
  IUpdateTenantEnvironmentAccountEmailDto,
  IUpdateTenantEnvironmentAccountNonSensitivePropertiesDto,
  IUpdateTenantEnvironmentAccountPhoneDto,
  IUpdateTenantEnvironmentAccountUsernameDto,
} from './types/dto.type';
import { ITenantEnvironmentAccountRepository } from './types/repository.type';

describe('TenantEnvironmentAccount Service', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  const mockTenantEnvironmentAccountRepository = {
    create: jest.fn(),
    getById: jest.fn(),
    deleteById: jest.fn(),
    updateById: jest.fn(),
    setCustomPropertyById: jest.fn(),
    deleteCustomPropertyById: jest.fn(),
  };

  describe('create', () => {
    it('should fail to create a new account due to invalid tenantEnvironmentId format', async () => {
      const tenantEnvironmentIdWithInvalidFormat = 'this-is-not-a-uuid';
      const mockThrownError = {
        details: {
          input: { tenantEnvironmentId: tenantEnvironmentIdWithInvalidFormat },
          errors: { tenantEnvironmentId: 'field value is invalid' },
        },
        context: contexts.TENANT_ENVIRONMENT_ACCOUNT_CREATE,
      };

      const mockTenantEnvironmentAccountRepository =
        {} as ITenantEnvironmentAccountRepository;

      const tenantEnvironmentAccountService =
        new TenantEnvironmentAccountService(
          mockTenantEnvironmentAccountRepository
        );

      const loggerSpyInfo = jest.spyOn(
        (
          tenantEnvironmentAccountService as unknown as {
            logger: { info: typeof jest.fn };
          }
        ).logger,
        'info'
      );
      const loggerSpyError = jest.spyOn(
        (
          tenantEnvironmentAccountService as unknown as {
            logger: { error: typeof jest.fn };
          }
        ).logger,
        'error'
      );

      let thrown;

      try {
        await tenantEnvironmentAccountService.create(
          tenantEnvironmentIdWithInvalidFormat,
          {} as unknown as ICreateTenantEnvironmentAccountNoInternalPropertiesDto
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
        `create tenant environment account in environment ${tenantEnvironmentIdWithInvalidFormat}`
      );
      expect(loggerSpyError).toHaveBeenCalledTimes(1);
      expect(loggerSpyError).toHaveBeenCalledWith(thrown);
    });

    it.each([
      [{}],
      [true],
      [10],
      [{ email: '', fullName: '' }],
      [{ email: undefined, fullName: undefined }],
      [{ email: 2, fullName: 3 }],
    ])(
      'should fail to create a new account due to validation error (%p)',
      async (mockTenantEnvironmentAccountInfo) => {
        const mockTenantEnvironmentId = faker.string.uuid();
        const tenantEnvironmentAccountService =
          new TenantEnvironmentAccountService(
            mockTenantEnvironmentAccountRepository
          );

        const loggerSpyInfo = jest.spyOn(
          (
            tenantEnvironmentAccountService as unknown as {
              logger: { info: typeof jest.fn };
            }
          ).logger,
          'info'
        );
        const loggerSpyError = jest.spyOn(
          (
            tenantEnvironmentAccountService as unknown as {
              logger: { error: typeof jest.fn };
            }
          ).logger,
          'error'
        );

        await expect(
          tenantEnvironmentAccountService.create(
            mockTenantEnvironmentId,
            mockTenantEnvironmentAccountInfo as ICreateTenantEnvironmentAccountDto
          )
        ).rejects.toThrow(ValidationError);

        expect(loggerSpyInfo).toHaveBeenCalledTimes(1);
        expect(loggerSpyInfo).toHaveBeenCalledWith(
          `create tenant environment account in environment ${mockTenantEnvironmentId}`
        );
        expect(loggerSpyError).toHaveBeenCalledTimes(1);
      }
    );

    it('should fail to create a new account due to repository error', async () => {
      const mockThrownError = new UnexpectedError({
        details: { message: 'repository-failure' },
      });
      mockTenantEnvironmentAccountRepository.create.mockRejectedValueOnce(
        mockThrownError
      );

      const mockTenantEnvironmentId = faker.string.uuid();

      const mockTenantEnvironmentAccount = {
        email: faker.internet.email(),
        phone: faker.phone.number({ style: 'international' }),
        name: faker.person.fullName(),
        username: faker.internet.username(),
        avatarUrl: faker.image.url(),
        customProperties: {},
      };

      const tenantEnvironmentAccountService =
        new TenantEnvironmentAccountService(
          mockTenantEnvironmentAccountRepository
        );

      const loggerSpyInfo = jest.spyOn(
        (
          tenantEnvironmentAccountService as unknown as {
            logger: { info: typeof jest.fn };
          }
        ).logger,
        'info'
      );
      const loggerSpyError = jest.spyOn(
        (
          tenantEnvironmentAccountService as unknown as {
            logger: { error: typeof jest.fn };
          }
        ).logger,
        'error'
      );

      let thrown;

      try {
        await tenantEnvironmentAccountService.create(
          mockTenantEnvironmentId,
          mockTenantEnvironmentAccount
        );
      } catch (error) {
        thrown = error;
      }

      expect(thrown).toBeInstanceOf(UnexpectedError);
      expect((thrown as UnexpectedError).details).toEqual(
        mockThrownError.details
      );

      expect(loggerSpyInfo).toHaveBeenCalledTimes(1);
      expect(loggerSpyInfo).toHaveBeenCalledWith(
        `create tenant environment account in environment ${mockTenantEnvironmentId}`
      );
      expect(loggerSpyError).toHaveBeenCalledTimes(1);
    });

    it('should create a new account', async () => {
      const mockTenantEnvironmentId = faker.string.uuid();
      const mockTenantEnvironmentAccount = {
        email: faker.internet.email(),
        phone: faker.phone.number({ style: 'international' }),
        name: faker.person.fullName(),
        username: faker.internet.username(),
        avatarUrl: faker.image.url(),
        customProperties: {},
      };

      const mockTenantEnvironmentAccountId = faker.string.uuid();

      mockTenantEnvironmentAccountRepository.create.mockResolvedValueOnce(
        mockTenantEnvironmentAccountId
      );

      const tenantEnvironmentAccountService =
        new TenantEnvironmentAccountService(
          mockTenantEnvironmentAccountRepository
        );

      const loggerSpyInfo = jest.spyOn(
        (
          tenantEnvironmentAccountService as unknown as {
            logger: { info: typeof jest.fn };
          }
        ).logger,
        'info'
      );
      const loggerSpyError = jest.spyOn(
        (
          tenantEnvironmentAccountService as unknown as {
            logger: { error: typeof jest.fn };
          }
        ).logger,
        'error'
      );

      const result = await tenantEnvironmentAccountService.create(
        mockTenantEnvironmentId,
        mockTenantEnvironmentAccount
      );

      expect(result).toEqual(mockTenantEnvironmentAccountId);

      expect(loggerSpyInfo).toHaveBeenCalledTimes(2);
      expect(loggerSpyInfo).toHaveBeenNthCalledWith(
        1,
        `create tenant environment account in environment ${mockTenantEnvironmentId}`
      );
      expect(loggerSpyInfo).toHaveBeenNthCalledWith(
        2,
        `new tenant environment account created: ${mockTenantEnvironmentAccountId}`
      );
      expect(loggerSpyError).not.toHaveBeenCalled();
    });
  });

  describe('getById', () => {
    it('should retrieve a tenant environment account', async () => {
      const mockTenantEnvironmentAccountId = faker.string.uuid();
      const mockTenantEnvironmentAccount: IGetTenantEnvironmentAccountDto = {
        id: mockTenantEnvironmentAccountId,
        tenantEnvironmentId: faker.string.uuid(),
        email: faker.internet.email(),
        phone: faker.phone.number({ style: 'international' }),
        name: faker.person.fullName(),
        username: faker.internet.username(),
        avatarUrl: faker.image.url(),
        customProperties: {},
      };

      mockTenantEnvironmentAccountRepository.getById.mockResolvedValue(
        mockTenantEnvironmentAccount
      );

      const tenantEnvironmentAccountService =
        new TenantEnvironmentAccountService(
          mockTenantEnvironmentAccountRepository as unknown as ITenantEnvironmentAccountRepository
        );

      const loggerSpyInfo = jest.spyOn(
        (
          tenantEnvironmentAccountService as unknown as {
            logger: { info: typeof jest.fn };
          }
        ).logger,
        'info'
      );
      const loggerSpyError = jest.spyOn(
        (
          tenantEnvironmentAccountService as unknown as {
            logger: { error: typeof jest.fn };
          }
        ).logger,
        'error'
      );

      const result = await tenantEnvironmentAccountService.getById(
        mockTenantEnvironmentAccount.id
      );

      expect(result).toEqual(mockTenantEnvironmentAccount);

      expect(loggerSpyInfo).toHaveBeenCalledTimes(1);
      expect(loggerSpyInfo).toHaveBeenCalledWith(
        `getById: ${mockTenantEnvironmentAccount.id}`
      );
      expect(loggerSpyError).toHaveBeenCalledTimes(0);
    });

    it('should return undefined when the tenant environment account was not found', async () => {
      const mockTenantEnvironmentAccountId = faker.string.uuid();
      const mockTenantEnvironmentAccount = undefined;

      mockTenantEnvironmentAccountRepository.getById.mockResolvedValue(
        mockTenantEnvironmentAccount
      );

      const tenantEnvironmentAccountService =
        new TenantEnvironmentAccountService(
          mockTenantEnvironmentAccountRepository as unknown as ITenantEnvironmentAccountRepository
        );

      const loggerSpyInfo = jest.spyOn(
        (
          tenantEnvironmentAccountService as unknown as {
            logger: { info: typeof jest.fn };
          }
        ).logger,
        'info'
      );
      const loggerSpyError = jest.spyOn(
        (
          tenantEnvironmentAccountService as unknown as {
            logger: { error: typeof jest.fn };
          }
        ).logger,
        'error'
      );

      const result = await tenantEnvironmentAccountService.getById(
        mockTenantEnvironmentAccountId
      );

      expect(result).toEqual(mockTenantEnvironmentAccount);

      expect(loggerSpyInfo).toHaveBeenCalledTimes(1);
      expect(loggerSpyInfo).toHaveBeenCalledWith(
        `getById: ${mockTenantEnvironmentAccountId}`
      );
      expect(loggerSpyError).toHaveBeenCalledTimes(0);
    });

    it('should fail by not sending a valid tenant environment account id (uuid)', async () => {
      const faultyTenantEnvironmentAccountId = 'thisshouldbeauuid';
      const expectedValidationError = {
        details: {
          input: { id: faultyTenantEnvironmentAccountId },
          errors: { id: 'field value is invalid' },
        },
        context: contexts.TENANT_ENVIRONMENT_ACCOUNT_GET_BY_ID,
      };

      const tenantEnvironmentAccountService =
        new TenantEnvironmentAccountService(
          mockTenantEnvironmentAccountRepository as unknown as ITenantEnvironmentAccountRepository
        );

      const loggerSpyInfo = jest.spyOn(
        (
          tenantEnvironmentAccountService as unknown as {
            logger: { info: typeof jest.fn };
          }
        ).logger,
        'info'
      );
      const loggerSpyError = jest.spyOn(
        (
          tenantEnvironmentAccountService as unknown as {
            logger: { error: typeof jest.fn };
          }
        ).logger,
        'error'
      );

      let thrown;

      try {
        await tenantEnvironmentAccountService.getById(
          faultyTenantEnvironmentAccountId
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
        `getById: ${faultyTenantEnvironmentAccountId}`
      );
      expect(loggerSpyError).toHaveBeenCalledTimes(1);
    });
  });

  describe('deleteById', () => {
    it('should delete a tenant environment account', async () => {
      const mockTenantEnvironmentAccountId = faker.string.uuid();
      const mockResult = true;

      mockTenantEnvironmentAccountRepository.deleteById.mockResolvedValue(
        mockResult
      );

      const tenantEnvironmentAccountService =
        new TenantEnvironmentAccountService(
          mockTenantEnvironmentAccountRepository as unknown as ITenantEnvironmentAccountRepository
        );

      const loggerSpyInfo = jest.spyOn(
        (
          tenantEnvironmentAccountService as unknown as {
            logger: { info: typeof jest.fn };
          }
        ).logger,
        'info'
      );
      const loggerSpyError = jest.spyOn(
        (
          tenantEnvironmentAccountService as unknown as {
            logger: { error: typeof jest.fn };
          }
        ).logger,
        'error'
      );

      const result = await tenantEnvironmentAccountService.deleteById(
        mockTenantEnvironmentAccountId
      );

      expect(result).toBe(mockResult);
      expect(loggerSpyInfo).toHaveBeenCalledTimes(1);
      expect(loggerSpyInfo).toHaveBeenCalledWith(
        `deleteById: ${mockTenantEnvironmentAccountId}`
      );
      expect(loggerSpyError).toHaveBeenCalledTimes(0);
    });

    it('should fail by not sending a valid tenant environment account id (uuid)', async () => {
      const faultyTenantEnvironmentAccountId = 'thisshouldbeauuid';
      const expectedValidationError = {
        details: {
          input: { id: faultyTenantEnvironmentAccountId },
          errors: { id: 'field value is invalid' },
        },
        context: contexts.TENANT_ENVIRONMENT_ACCOUNT_DELETE_BY_ID,
      };

      const tenantEnvironmentAccountService =
        new TenantEnvironmentAccountService(
          mockTenantEnvironmentAccountRepository as unknown as ITenantEnvironmentAccountRepository
        );

      const loggerSpyInfo = jest.spyOn(
        (
          tenantEnvironmentAccountService as unknown as {
            logger: { info: typeof jest.fn };
          }
        ).logger,
        'info'
      );
      const loggerSpyError = jest.spyOn(
        (
          tenantEnvironmentAccountService as unknown as {
            logger: { error: typeof jest.fn };
          }
        ).logger,
        'error'
      );

      let thrown;

      try {
        await tenantEnvironmentAccountService.deleteById(
          faultyTenantEnvironmentAccountId
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
        `deleteById: ${faultyTenantEnvironmentAccountId}`
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
        'should update a tenant environment account _non sensitive properties_ by id (%p)',
        async (dto) => {
          const mockTenantEnvironmentAccountId = faker.string.uuid();
          const mockUpdateTenantEnvironmentAccountDto = dto;
          const mockUpdateTenantEnvironmentAccountResult = true;

          mockTenantEnvironmentAccountRepository.updateById.mockResolvedValue(
            mockUpdateTenantEnvironmentAccountResult
          );

          const tenantEnvironmentAccountService =
            new TenantEnvironmentAccountService(
              mockTenantEnvironmentAccountRepository as unknown as ITenantEnvironmentAccountRepository
            );

          const loggerSpyInfo = jest.spyOn(
            (
              tenantEnvironmentAccountService as unknown as {
                logger: { info: typeof jest.fn };
              }
            ).logger,
            'info'
          );
          const loggerSpyError = jest.spyOn(
            (
              tenantEnvironmentAccountService as unknown as {
                logger: { error: typeof jest.fn };
              }
            ).logger,
            'error'
          );

          const result =
            await tenantEnvironmentAccountService.updateNonSensitivePropertiesById(
              mockTenantEnvironmentAccountId,
              mockUpdateTenantEnvironmentAccountDto as IUpdateTenantEnvironmentAccountNonSensitivePropertiesDto
            );

          expect(result).toEqual(mockUpdateTenantEnvironmentAccountResult);

          expect(loggerSpyInfo).toHaveBeenCalledTimes(1);
          expect(loggerSpyInfo).toHaveBeenCalledWith(
            `updateNonSensitivePropertiesById: ${mockTenantEnvironmentAccountId}`
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
        'should fail update a tenant environment account _non sensitive properties_ by sending empty values (%p)',
        async (dto) => {
          const mockTenantEnvironmentAccountId = faker.string.uuid();
          const mockUpdateTenantEnvironmentAccountDto = dto;
          const mockUpdateTenantEnvironmentAccountResult = true;

          mockTenantEnvironmentAccountRepository.updateById.mockResolvedValue(
            mockUpdateTenantEnvironmentAccountResult
          );

          const tenantEnvironmentAccountService =
            new TenantEnvironmentAccountService(
              mockTenantEnvironmentAccountRepository as unknown as ITenantEnvironmentAccountRepository
            );

          const loggerSpyInfo = jest.spyOn(
            (
              tenantEnvironmentAccountService as unknown as {
                logger: { info: typeof jest.fn };
              }
            ).logger,
            'info'
          );
          const loggerSpyError = jest.spyOn(
            (
              tenantEnvironmentAccountService as unknown as {
                logger: { error: typeof jest.fn };
              }
            ).logger,
            'error'
          );

          let thrown;
          try {
            await tenantEnvironmentAccountService.updateNonSensitivePropertiesById(
              mockTenantEnvironmentAccountId,
              mockUpdateTenantEnvironmentAccountDto as IUpdateTenantEnvironmentAccountNonSensitivePropertiesDto
            );
          } catch (error) {
            thrown = error;
          }

          expect(thrown).toBeInstanceOf(ValidationError);
          expect((thrown as ValidationError).context).toEqual(
            contexts.TENANT_ENVIRONMENT_ACCOUNT_UPDATE_NON_SENSITIVE_PROPERTIES_BY_ID
          );

          expect(loggerSpyInfo).toHaveBeenCalledTimes(1);
          expect(loggerSpyInfo).toHaveBeenCalledWith(
            `updateNonSensitivePropertiesById: ${mockTenantEnvironmentAccountId}`
          );
          expect(loggerSpyError).toHaveBeenCalledTimes(1);
        }
      );

      it('should fail by not sending a valid tenant environment account id (uuid)', async () => {
        const faultyTenantEnvironmentAccountId = 'thisshouldbeauuid';
        const expectedValidationError = {
          details: {
            input: { id: faultyTenantEnvironmentAccountId },
            errors: { id: 'field value is invalid' },
          },
          context:
            contexts.TENANT_ENVIRONMENT_ACCOUNT_UPDATE_NON_SENSITIVE_PROPERTIES_BY_ID,
        };

        const tenantEnvironmentAccountService =
          new TenantEnvironmentAccountService(
            mockTenantEnvironmentAccountRepository as unknown as ITenantEnvironmentAccountRepository
          );

        const loggerSpyInfo = jest.spyOn(
          (
            tenantEnvironmentAccountService as unknown as {
              logger: { info: typeof jest.fn };
            }
          ).logger,
          'info'
        );
        const loggerSpyError = jest.spyOn(
          (
            tenantEnvironmentAccountService as unknown as {
              logger: { error: typeof jest.fn };
            }
          ).logger,
          'error'
        );

        let thrown;
        try {
          await tenantEnvironmentAccountService.updateNonSensitivePropertiesById(
            faultyTenantEnvironmentAccountId,
            {} as IUpdateTenantEnvironmentAccountNonSensitivePropertiesDto
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
          `updateNonSensitivePropertiesById: ${faultyTenantEnvironmentAccountId}`
        );
        expect(loggerSpyError).toHaveBeenCalledTimes(1);
      });
    });

    describe('updateEmailById', () => {
      it('should update the tenant environment account email by id', async () => {
        const mockTenantEnvironmentAccountId = faker.string.uuid();
        const mockUpdateTenantEnvironmentAccountDto: IUpdateTenantEnvironmentAccountEmailDto =
          {
            email: faker.internet.email(),
          };
        const mockUpdateTenantEnvironmentAccountResult = true;

        mockTenantEnvironmentAccountRepository.updateById.mockResolvedValue(
          mockUpdateTenantEnvironmentAccountResult
        );

        const accountService = new TenantEnvironmentAccountService(
          mockTenantEnvironmentAccountRepository as unknown as ITenantEnvironmentAccountRepository
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
          mockTenantEnvironmentAccountId,
          mockUpdateTenantEnvironmentAccountDto
        );

        expect(result).toEqual(mockUpdateTenantEnvironmentAccountResult);

        expect(loggerSpyInfo).toHaveBeenCalledTimes(1);
        expect(loggerSpyInfo).toHaveBeenCalledWith(
          `updateEmailById: ${mockTenantEnvironmentAccountId}`
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
        'should fail to update by passing an invalid value as email (%p)',
        async (dto) => {
          const mockTenantEnvironmentAccountId = faker.string.uuid();
          const mockUpdateTenantEnvironmentAccountDto: IUpdateTenantEnvironmentAccountEmailDto =
            dto as IUpdateTenantEnvironmentAccountEmailDto;
          const mockValidationErrorContents = {
            details: {
              input: { ...mockUpdateTenantEnvironmentAccountDto },
            },
            context: contexts.TENANT_ENVIRONMENT_ACCOUNT_UPDATE_EMAIL_BY_ID,
          };
          const mockUpdateTenantEnvironmentAccountResult = true;

          mockTenantEnvironmentAccountRepository.updateById.mockResolvedValue(
            mockUpdateTenantEnvironmentAccountResult
          );

          const accountService = new TenantEnvironmentAccountService(
            mockTenantEnvironmentAccountRepository as unknown as ITenantEnvironmentAccountRepository
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
              mockTenantEnvironmentAccountId,
              mockUpdateTenantEnvironmentAccountDto
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
            `updateEmailById: ${mockTenantEnvironmentAccountId}`
          );
          expect(loggerSpyError).toHaveBeenCalledTimes(1);
        }
      );

      it('should fail to update by not sending a valid tenant environment account id (uuid)', async () => {
        const faultyTenantEnvironmentAccountId = 'thisshouldbeauuid';
        const expectedValidationError = {
          details: {
            input: { id: faultyTenantEnvironmentAccountId },
            errors: { id: 'field value is invalid' },
          },
          context: contexts.TENANT_ENVIRONMENT_ACCOUNT_UPDATE_EMAIL_BY_ID,
        };

        const accountService = new TenantEnvironmentAccountService(
          mockTenantEnvironmentAccountRepository
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
            faultyTenantEnvironmentAccountId,
            {} as IUpdateTenantEnvironmentAccountEmailDto
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
          `updateEmailById: ${faultyTenantEnvironmentAccountId}`
        );
        expect(loggerSpyError).toHaveBeenCalledTimes(1);
      });
    });

    describe('updateUsernameById', () => {
      it('should update the tenant environment account email by id', async () => {
        const mockTenantEnvironmentAccountId = faker.string.uuid();
        const mockUpdateTenantEnvironmentAccountDto: IUpdateTenantEnvironmentAccountUsernameDto =
          {
            username: faker.internet.username(),
          };
        const mockUpdateTenantEnvironmentAccountResult = true;

        mockTenantEnvironmentAccountRepository.updateById.mockResolvedValue(
          mockUpdateTenantEnvironmentAccountResult
        );

        const accountService = new TenantEnvironmentAccountService(
          mockTenantEnvironmentAccountRepository as unknown as ITenantEnvironmentAccountRepository
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
          mockTenantEnvironmentAccountId,
          mockUpdateTenantEnvironmentAccountDto
        );

        expect(result).toEqual(mockUpdateTenantEnvironmentAccountResult);

        expect(loggerSpyInfo).toHaveBeenCalledTimes(1);
        expect(loggerSpyInfo).toHaveBeenCalledWith(
          `updateUsernameById: ${mockTenantEnvironmentAccountId}`
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
        'should fail to update by passing an invalid value as username (%p)',
        async (dto) => {
          const mockTenantEnvironmentAccountId = faker.string.uuid();
          const mockUpdateTenantEnvironmentAccountDto: IUpdateTenantEnvironmentAccountUsernameDto =
            dto as IUpdateTenantEnvironmentAccountUsernameDto;
          const mockValidationErrorContents = {
            details: {
              input: { ...mockUpdateTenantEnvironmentAccountDto },
            },
            context: contexts.TENANT_ENVIRONMENT_ACCOUNT_UPDATE_USERNAME_BY_ID,
          };
          const mockUpdateTenantEnvironmentAccountResult = true;

          mockTenantEnvironmentAccountRepository.updateById.mockResolvedValue(
            mockUpdateTenantEnvironmentAccountResult
          );

          const accountService = new TenantEnvironmentAccountService(
            mockTenantEnvironmentAccountRepository as unknown as ITenantEnvironmentAccountRepository
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
              mockTenantEnvironmentAccountId,
              mockUpdateTenantEnvironmentAccountDto
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
            `updateUsernameById: ${mockTenantEnvironmentAccountId}`
          );
          expect(loggerSpyError).toHaveBeenCalledTimes(1);
        }
      );

      it('should fail to update by not sending a valid tenant environment account id (uuid)', async () => {
        const faultyTenantEnvironmentAccountId = 'thisshouldbeauuid';
        const expectedValidationError = {
          details: {
            input: { id: faultyTenantEnvironmentAccountId },
            errors: { id: 'field value is invalid' },
          },
          context: contexts.TENANT_ENVIRONMENT_ACCOUNT_UPDATE_USERNAME_BY_ID,
        };

        const accountService = new TenantEnvironmentAccountService(
          mockTenantEnvironmentAccountRepository
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
            faultyTenantEnvironmentAccountId,
            {} as IUpdateTenantEnvironmentAccountUsernameDto
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
          `updateUsernameById: ${faultyTenantEnvironmentAccountId}`
        );
        expect(loggerSpyError).toHaveBeenCalledTimes(1);
      });
    });

    describe('updatePhoneById', () => {
      it('should update the tenant environment account phone by id', async () => {
        const mockTenantEnvironmentAccountId = faker.string.uuid();
        const mockUpdateTenantEnvironmentAccountDto: IUpdateTenantEnvironmentAccountPhoneDto =
          {
            phone: faker.phone.number({ style: 'international' }),
          };
        const mockUpdateTenantEnvironmentAccountResult = true;

        mockTenantEnvironmentAccountRepository.updateById.mockResolvedValue(
          mockUpdateTenantEnvironmentAccountResult
        );

        const accountService = new TenantEnvironmentAccountService(
          mockTenantEnvironmentAccountRepository as unknown as ITenantEnvironmentAccountRepository
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
          mockTenantEnvironmentAccountId,
          mockUpdateTenantEnvironmentAccountDto
        );

        expect(result).toEqual(mockUpdateTenantEnvironmentAccountResult);

        expect(loggerSpyInfo).toHaveBeenCalledTimes(1);
        expect(loggerSpyInfo).toHaveBeenCalledWith(
          `updatePhoneById: ${mockTenantEnvironmentAccountId}`
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
        'should fail to update by passing an invalid value as username (%p)',
        async (dto) => {
          const mockTenantEnvironmentAccountId = faker.string.uuid();
          const mockUpdateTenantEnvironmentAccountDto: IUpdateTenantEnvironmentAccountPhoneDto =
            dto as IUpdateTenantEnvironmentAccountPhoneDto;
          const mockValidationErrorContents = {
            details: {
              input: { ...mockUpdateTenantEnvironmentAccountDto },
            },
            context: contexts.TENANT_ENVIRONMENT_ACCOUNT_UPDATE_PHONE_BY_ID,
          };
          const mockUpdateTenantEnvironmentAccountResult = true;

          mockTenantEnvironmentAccountRepository.updateById.mockResolvedValue(
            mockUpdateTenantEnvironmentAccountResult
          );

          const accountService = new TenantEnvironmentAccountService(
            mockTenantEnvironmentAccountRepository as unknown as ITenantEnvironmentAccountRepository
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
              mockTenantEnvironmentAccountId,
              mockUpdateTenantEnvironmentAccountDto
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
            `updatePhoneById: ${mockTenantEnvironmentAccountId}`
          );
          expect(loggerSpyError).toHaveBeenCalledTimes(1);
        }
      );

      it('should fail to update by not sending a valid account id (uuid)', async () => {
        const faultyTenantEnvironmentAccountId = 'thisshouldbeauuid';
        const expectedValidationError = {
          details: {
            input: { id: faultyTenantEnvironmentAccountId },
            errors: { id: 'field value is invalid' },
          },
          context: contexts.TENANT_ENVIRONMENT_ACCOUNT_UPDATE_PHONE_BY_ID,
        };

        const accountService = new TenantEnvironmentAccountService(
          mockTenantEnvironmentAccountRepository
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
            faultyTenantEnvironmentAccountId,
            {} as IUpdateTenantEnvironmentAccountPhoneDto
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
          `updatePhoneById: ${faultyTenantEnvironmentAccountId}`
        );
        expect(loggerSpyError).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('customProperties', () => {
    describe('setCustomPropertyById', () => {
      it.each([
        [
          {
            customProperty1: faker.lorem.sentence(),
          },
        ],
        [
          {
            customProperty1: faker.number.int(),
          },
        ],
        [
          {
            customProperty1: true,
          },
        ],
        [
          {
            customProperty1: false,
          },
        ],
        [
          {
            customProperty1: [],
          },
        ],
        [
          {
            customProperty1: ['one', 2, 0x0003, false],
          },
        ],
        [
          {
            customProperty1: {
              sub1: true,
              sub2: 'false',
              sub3: { sub1: [1, 2, 3], sub2: new Date().toDateString() },
            },
          },
        ],
      ])('should set a custom property by id (%p)', async (dto) => {
        const mockTenantEnvironmentId = faker.string.uuid();
        const mockUpdateTenantEnvironmentDto =
          dto as unknown as ITenantEnvironmentAccountCustomPropertiesOperationDtoSchema;

        const mockUpdateTenantEnvironmentResult = true;

        mockTenantEnvironmentAccountRepository.setCustomPropertyById.mockResolvedValue(
          mockUpdateTenantEnvironmentResult
        );

        const tenantEnvironmentAccountService =
          new TenantEnvironmentAccountService(
            mockTenantEnvironmentAccountRepository as unknown as ITenantEnvironmentAccountRepository
          );

        const loggerSpyInfo = jest.spyOn(
          (
            tenantEnvironmentAccountService as unknown as {
              logger: { info: typeof jest.fn };
            }
          ).logger,
          'info'
        );
        const loggerSpyError = jest.spyOn(
          (
            tenantEnvironmentAccountService as unknown as {
              logger: { error: typeof jest.fn };
            }
          ).logger,
          'error'
        );

        const result =
          await tenantEnvironmentAccountService.setCustomPropertyById(
            mockTenantEnvironmentId,
            mockUpdateTenantEnvironmentDto
          );

        expect(result).toEqual(mockUpdateTenantEnvironmentResult);
        expect(loggerSpyInfo).toHaveBeenCalledTimes(1);
        expect(loggerSpyInfo).toHaveBeenCalledWith(
          `setCustomPropertyById: ${mockTenantEnvironmentId}`
        );
        expect(loggerSpyError).toHaveBeenCalledTimes(0);
      });

      it.each([
        [
          {
            customProperty1: undefined,
          },
        ],
        [
          {
            customProperty1: [undefined],
          },
        ],
        [
          {
            customProperty1: {
              sub1: true,
              sub2: 'false',
              sub3: { sub1: [1, 2, 3], sub2: undefined },
            },
          },
        ],
      ])(
        'should fail by trting to set invalid (undefined) property values (%p)',
        async (dto) => {
          const mockTenantEnvironmentAccountId = faker.string.uuid();
          const mockUpdateTenantEnvironmentAccountDto =
            dto as unknown as ITenantEnvironmentAccountCustomPropertiesOperationDtoSchema;
          const expectedValidationError = {
            details: {
              input: { ...mockUpdateTenantEnvironmentAccountDto },
              errors: { customProperties: 'field value is invalid' },
            },
            context:
              contexts.TENANT_ENVIRONMENT_ACCOUNT_SET_CUSTOM_PROPERTY_BY_ID,
          };

          const mockUpdateTenantEnvironmentAccountResult = true;

          mockTenantEnvironmentAccountRepository.updateById.mockResolvedValue(
            mockUpdateTenantEnvironmentAccountResult
          );

          const tenantEnvironmentAccountService =
            new TenantEnvironmentAccountService(
              mockTenantEnvironmentAccountRepository as unknown as ITenantEnvironmentAccountRepository
            );

          const loggerSpyInfo = jest.spyOn(
            (
              tenantEnvironmentAccountService as unknown as {
                logger: { info: typeof jest.fn };
              }
            ).logger,
            'info'
          );
          const loggerSpyError = jest.spyOn(
            (
              tenantEnvironmentAccountService as unknown as {
                logger: { error: typeof jest.fn };
              }
            ).logger,
            'error'
          );

          let thrown;
          try {
            await tenantEnvironmentAccountService.setCustomPropertyById(
              mockTenantEnvironmentAccountId,
              mockUpdateTenantEnvironmentAccountDto
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
            `setCustomPropertyById: ${mockTenantEnvironmentAccountId}`
          );
          expect(loggerSpyError).toHaveBeenCalledTimes(1);
        }
      );

      it('should fail by not sending a valid tenant id (uuid)', async () => {
        const faultyTenantEnvironmentAccountId = 'thisshouldbeauuid';
        const expectedValidationError = {
          details: {
            input: { id: faultyTenantEnvironmentAccountId },
            errors: { id: 'field value is invalid' },
          },
          context:
            contexts.TENANT_ENVIRONMENT_ACCOUNT_SET_CUSTOM_PROPERTY_BY_ID,
        };

        const tenantEnvironmentAccountService =
          new TenantEnvironmentAccountService(
            mockTenantEnvironmentAccountRepository
          );

        const loggerSpyInfo = jest.spyOn(
          (
            tenantEnvironmentAccountService as unknown as {
              logger: { info: typeof jest.fn };
            }
          ).logger,
          'info'
        );
        const loggerSpyError = jest.spyOn(
          (
            tenantEnvironmentAccountService as unknown as {
              logger: { error: typeof jest.fn };
            }
          ).logger,
          'error'
        );

        let thrown;

        try {
          await tenantEnvironmentAccountService.setCustomPropertyById(
            faultyTenantEnvironmentAccountId,
            {} as ITenantEnvironmentAccountCustomPropertiesOperationDtoSchema
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
          `setCustomPropertyById: ${faultyTenantEnvironmentAccountId}`
        );
        expect(loggerSpyError).toHaveBeenCalledTimes(1);
      });
    });

    describe('deleteCustomPropertyById', () => {
      it('should delete a custom property by id', async () => {
        const mockTenantEnvironmentAccountId = faker.string.uuid();
        const customPropertyKey = 'customProperty1';

        const mockUpdateTenantEnvironmentAccountResult = true;

        mockTenantEnvironmentAccountRepository.deleteCustomPropertyById.mockResolvedValue(
          mockUpdateTenantEnvironmentAccountResult
        );

        const tenantEnvironmentAccountService =
          new TenantEnvironmentAccountService(
            mockTenantEnvironmentAccountRepository as unknown as ITenantEnvironmentAccountRepository
          );

        const loggerSpyInfo = jest.spyOn(
          (
            tenantEnvironmentAccountService as unknown as {
              logger: { info: typeof jest.fn };
            }
          ).logger,
          'info'
        );
        const loggerSpyError = jest.spyOn(
          (
            tenantEnvironmentAccountService as unknown as {
              logger: { error: typeof jest.fn };
            }
          ).logger,
          'error'
        );

        const result =
          await tenantEnvironmentAccountService.deleteCustomPropertyById(
            mockTenantEnvironmentAccountId,
            customPropertyKey
          );

        expect(result).toEqual(mockUpdateTenantEnvironmentAccountResult);
        expect(loggerSpyInfo).toHaveBeenCalledTimes(1);
        expect(loggerSpyInfo).toHaveBeenCalledWith(
          `deleteCustomPropertyById: ${mockTenantEnvironmentAccountId}`
        );
        expect(loggerSpyError).toHaveBeenCalledTimes(0);
      });

      it.each([[''], [true], [3], [{}], [0x032], [undefined]])(
        'should fail by not sending a valid custom property key (%p)',
        async (dto) => {
          const faultyTenantEnvironmentAccountId = 'thisshouldbeauuid';
          const customPropertyKey = dto as unknown as string;
          const expectedValidationError = {
            details: {
              input: { id: faultyTenantEnvironmentAccountId },
              errors: { id: 'field value is invalid' },
            },
            context:
              contexts.TENANT_ENVIRONMENT_ACCOUNT_DELETE_CUSTOM_PROPERTY_BY_ID,
          };

          const tenantEnvironmentAccountService =
            new TenantEnvironmentAccountService(
              mockTenantEnvironmentAccountRepository
            );

          const loggerSpyInfo = jest.spyOn(
            (
              tenantEnvironmentAccountService as unknown as {
                logger: { info: typeof jest.fn };
              }
            ).logger,
            'info'
          );
          const loggerSpyError = jest.spyOn(
            (
              tenantEnvironmentAccountService as unknown as {
                logger: { error: typeof jest.fn };
              }
            ).logger,
            'error'
          );

          let thrown;

          try {
            await tenantEnvironmentAccountService.deleteCustomPropertyById(
              faultyTenantEnvironmentAccountId,
              customPropertyKey
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
            `deleteCustomPropertyById: ${faultyTenantEnvironmentAccountId}`
          );
          expect(loggerSpyError).toHaveBeenCalledTimes(1);
        }
      );

      it('should fail by not sending a valid tenant environment account id (uuid)', async () => {
        const faultyTenantEnvironmentAccountId = 'thisshouldbeauuid';
        const customPropertyKey = 'customProperty1';
        const expectedValidationError = {
          details: {
            input: { id: faultyTenantEnvironmentAccountId },
            errors: { id: 'field value is invalid' },
          },
          context:
            contexts.TENANT_ENVIRONMENT_ACCOUNT_DELETE_CUSTOM_PROPERTY_BY_ID,
        };

        const tenantEnvironmentAccountService =
          new TenantEnvironmentAccountService(
            mockTenantEnvironmentAccountRepository
          );

        const loggerSpyInfo = jest.spyOn(
          (
            tenantEnvironmentAccountService as unknown as {
              logger: { info: typeof jest.fn };
            }
          ).logger,
          'info'
        );
        const loggerSpyError = jest.spyOn(
          (
            tenantEnvironmentAccountService as unknown as {
              logger: { error: typeof jest.fn };
            }
          ).logger,
          'error'
        );

        let thrown;

        try {
          await tenantEnvironmentAccountService.deleteCustomPropertyById(
            faultyTenantEnvironmentAccountId,
            customPropertyKey
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
          `deleteCustomPropertyById: ${faultyTenantEnvironmentAccountId}`
        );
        expect(loggerSpyError).toHaveBeenCalledTimes(1);
      });
    });
  });
});
