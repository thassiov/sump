import { faker } from '@faker-js/faker';
import { Knex } from 'knex';
import { IInsertReturningId } from '../../infra/database/postgres/types';
import { contexts } from '../../lib/contexts';
import {
  NotExpectedError,
  NotFoundError,
  UnexpectedError,
} from '../../lib/errors';
import { TenantEnvironmentAccountRepository } from './tenant-environment-account.repository';
import {
  ICreateTenantEnvironmentAccountDto,
  IGetTenantEnvironmentAccountDto,
  IUpdateTenantEnvironmentAccountAllowedDtos,
} from './types/dto.type';

describe('tenant-environment-account.repository', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  describe('create', () => {
    it('creates a new tenant environment account', async () => {
      const mockTenantEnvironmentAccountId = 'id';
      const mockDbResponse: IInsertReturningId = [
        { id: mockTenantEnvironmentAccountId },
      ];
      const mockCreateTenantEnvironmentAccountDto = {
        email: faker.internet.email(),
        phone: faker.phone.number({ style: 'international' }),
        name: faker.person.fullName(),
        username: faker.internet.username(),
        avatarUrl: faker.image.url(),
        customProperties: {},
      } as ICreateTenantEnvironmentAccountDto;

      const mockSendInsert = jest
        .spyOn(
          TenantEnvironmentAccountRepository.prototype as unknown as {
            sendInsertReturningIdQuery: () => Promise<IInsertReturningId>;
          },
          'sendInsertReturningIdQuery'
        )
        .mockResolvedValueOnce(mockDbResponse);

      const instance = new TenantEnvironmentAccountRepository(
        {} as unknown as Knex
      );

      const result = await instance.create(
        mockCreateTenantEnvironmentAccountDto
      );
      expect(result).toBe(mockTenantEnvironmentAccountId);
      expect(mockSendInsert).toHaveBeenCalledTimes(1);
      expect(mockSendInsert).toHaveBeenCalledWith(
        mockCreateTenantEnvironmentAccountDto,
        undefined
      );
    });

    it('fails to create a new tenant environment account by receiving an empty response from the database', async () => {
      const mockDbResponse: IInsertReturningId = [];
      const mockCreateTenantEnvironmentAccountDto = {
        email: faker.internet.email(),
        phone: faker.phone.number({ style: 'international' }),
        name: faker.person.fullName(),
        username: faker.internet.username(),
        avatarUrl: faker.image.url(),
        customProperties: {},
      } as ICreateTenantEnvironmentAccountDto;

      const mockThrownError = new NotExpectedError({
        context: contexts.TENANT_ENVIRONMENT_ACCOUNT_CREATE,
        details: {
          input: {
            ...mockCreateTenantEnvironmentAccountDto,
          },
          output: undefined,
          message: 'database insert operation did not return an id',
        },
      });

      const mockSendInsert = jest
        .spyOn(
          TenantEnvironmentAccountRepository.prototype as unknown as {
            sendInsertReturningIdQuery: () => Promise<IInsertReturningId>;
          },
          'sendInsertReturningIdQuery'
        )
        .mockResolvedValueOnce(mockDbResponse);

      const instance = new TenantEnvironmentAccountRepository(
        {} as unknown as Knex
      );

      let thrown;
      try {
        await instance.create(mockCreateTenantEnvironmentAccountDto);
      } catch (error) {
        thrown = error;
      }

      expect(thrown).toBeInstanceOf(NotExpectedError);
      expect((thrown as NotExpectedError).cause).not.toBeDefined();
      expect((thrown as NotExpectedError).context).toEqual(
        mockThrownError.context
      );
      expect((thrown as NotExpectedError).details).toEqual(
        mockThrownError.details
      );
      expect(mockSendInsert).toHaveBeenCalledTimes(1);
      expect(mockSendInsert).toHaveBeenCalledWith(
        mockCreateTenantEnvironmentAccountDto,
        undefined
      );
    });

    it('fails to create a new tenant environment account by a error thrown by the database', async () => {
      const mockCreateTenantEnvironmentAccountDto = {
        email: faker.internet.email(),
        phone: faker.phone.number({ style: 'international' }),
        name: faker.person.fullName(),
        username: faker.internet.username(),
        avatarUrl: faker.image.url(),
        customProperties: {},
      } as ICreateTenantEnvironmentAccountDto;

      const mockThrownError = new Error('some-other-error');
      const repositoryError = new UnexpectedError({
        cause: mockThrownError,
        context: contexts.TENANT_ENVIRONMENT_ACCOUNT_CREATE,
        details: {
          input: {
            ...mockCreateTenantEnvironmentAccountDto,
          },
        },
      });

      const mockSendInsert = jest
        .spyOn(
          TenantEnvironmentAccountRepository.prototype as unknown as {
            sendInsertReturningIdQuery: () => Promise<IInsertReturningId>;
          },
          'sendInsertReturningIdQuery'
        )
        .mockRejectedValueOnce(mockThrownError);

      const instance = new TenantEnvironmentAccountRepository(
        {} as unknown as Knex
      );

      let thrown;
      try {
        await instance.create(mockCreateTenantEnvironmentAccountDto);
      } catch (error) {
        thrown = error;
      }

      expect(thrown).toBeInstanceOf(UnexpectedError);
      expect((thrown as UnexpectedError).cause).toEqual(mockThrownError);
      expect((thrown as UnexpectedError).context).toEqual(
        repositoryError.context
      );
      expect((thrown as UnexpectedError).details).toEqual(
        repositoryError.details
      );
      expect(mockSendInsert).toHaveBeenCalledTimes(1);
      expect(mockSendInsert).toHaveBeenCalledWith(
        mockCreateTenantEnvironmentAccountDto,
        undefined
      );
    });
  });

  describe('getById', () => {
    it('gets an account by its id', async () => {
      const mockTenantEnvironmentAccountId = faker.string.uuid();
      const mockDbResponse: IGetTenantEnvironmentAccountDto = {
        id: mockTenantEnvironmentAccountId,
        tenantEnvironmentId: faker.string.uuid(),
        email: faker.internet.email(),
        phone: faker.phone.number({ style: 'international' }),
        name: faker.person.fullName(),
        username: faker.internet.username(),
        avatarUrl: faker.image.url(),
        customProperties: {},
      };

      const mockSendQuery = jest
        .spyOn(
          TenantEnvironmentAccountRepository.prototype as unknown as {
            sendFindByIdQuery: () => Promise<
              IGetTenantEnvironmentAccountDto | undefined
            >;
          },
          'sendFindByIdQuery'
        )
        .mockResolvedValueOnce(mockDbResponse);

      const instance = new TenantEnvironmentAccountRepository(
        {} as unknown as Knex
      );

      const result = await instance.getById(mockTenantEnvironmentAccountId);
      expect(result).toBe(mockDbResponse);
      expect(mockSendQuery).toHaveBeenCalledTimes(1);
      expect(mockSendQuery).toHaveBeenCalledWith(
        mockTenantEnvironmentAccountId
      );
    });

    it('gets an empty response as the tenant environment account does not exist', async () => {
      const mockTenantEnvironmentAccountId = faker.string.uuid();
      const mockDbResponse = undefined;

      const mockSendQuery = jest
        .spyOn(
          TenantEnvironmentAccountRepository.prototype as unknown as {
            sendFindByIdQuery: () => Promise<
              IGetTenantEnvironmentAccountDto | undefined
            >;
          },
          'sendFindByIdQuery'
        )
        .mockResolvedValueOnce(mockDbResponse);

      const instance = new TenantEnvironmentAccountRepository(
        {} as unknown as Knex
      );

      const result = await instance.getById(mockTenantEnvironmentAccountId);
      expect(result).toBe(mockDbResponse);
      expect(mockSendQuery).toHaveBeenCalledTimes(1);
      expect(mockSendQuery).toHaveBeenCalledWith(
        mockTenantEnvironmentAccountId
      );
    });

    it('fails to get an account by a error thrown by the database', async () => {
      const mockTenantEnvironmentAccountId = faker.string.uuid();

      const mockThrownError = new Error('some-error');
      const repositoryError = new UnexpectedError({
        cause: mockThrownError,
        context: contexts.TENANT_ENVIRONMENT_ACCOUNT_GET_BY_ID,
        details: {
          input: {
            id: mockTenantEnvironmentAccountId,
          },
        },
      });

      const mockSendQuery = jest
        .spyOn(
          TenantEnvironmentAccountRepository.prototype as unknown as {
            sendFindByIdQuery: () => Promise<
              IGetTenantEnvironmentAccountDto | undefined
            >;
          },
          'sendFindByIdQuery'
        )
        .mockRejectedValueOnce(mockThrownError);

      const instance = new TenantEnvironmentAccountRepository(
        {} as unknown as Knex
      );

      let thrown;
      try {
        await instance.getById(mockTenantEnvironmentAccountId);
      } catch (error) {
        thrown = error;
      }

      expect(thrown).toBeInstanceOf(UnexpectedError);
      expect((thrown as UnexpectedError).cause).toEqual(mockThrownError);
      expect((thrown as UnexpectedError).context).toEqual(
        repositoryError.context
      );
      expect((thrown as UnexpectedError).details).toEqual(
        repositoryError.details
      );
      expect(mockSendQuery).toHaveBeenCalledTimes(1);
      expect(mockSendQuery).toHaveBeenCalledWith(
        mockTenantEnvironmentAccountId
      );
    });
  });

  describe('updateById', () => {
    it('updates a tenant environment account by its id', async () => {
      const mockTenantEnvironmentAccountId = faker.string.uuid();
      const mockDbResponse = 1;
      const mockRepositoryResponse = true;

      const mockUpdateTenantEnvironmentAccountDto = {
        name: faker.person.fullName(),
      } as IUpdateTenantEnvironmentAccountAllowedDtos;

      const mockSendUpdate = jest
        .spyOn(
          TenantEnvironmentAccountRepository.prototype as unknown as {
            sendUpdateByIdQuery: () => Promise<number>;
          },
          'sendUpdateByIdQuery'
        )
        .mockResolvedValueOnce(mockDbResponse);

      const instance = new TenantEnvironmentAccountRepository(
        {} as unknown as Knex
      );

      const result = await instance.updateById(
        mockTenantEnvironmentAccountId,
        mockUpdateTenantEnvironmentAccountDto
      );
      expect(result).toBe(mockRepositoryResponse);
      expect(mockSendUpdate).toHaveBeenCalledTimes(1);
      expect(mockSendUpdate).toHaveBeenCalledWith(
        mockTenantEnvironmentAccountId,
        mockUpdateTenantEnvironmentAccountDto
      );
    });

    it('fails to update an account by receiving an empty response from the database (account does not exist)', async () => {
      const mockTenantEnvironmentAccountId = faker.string.uuid();
      const mockDbResponse = 0;

      const mockUpdateTenantEnvironmentAccountDto = {
        name: faker.person.fullName(),
      } as IUpdateTenantEnvironmentAccountAllowedDtos;

      const mockThrownError = new NotFoundError({
        context: contexts.TENANT_ENVIRONMENT_ACCOUNT_UPDATE_BY_ID,
        details: {
          input: {
            id: mockTenantEnvironmentAccountId,
            ...mockUpdateTenantEnvironmentAccountDto,
          },
        },
      });

      const mockSendUpdate = jest
        .spyOn(
          TenantEnvironmentAccountRepository.prototype as unknown as {
            sendUpdateByIdQuery: () => Promise<number>;
          },
          'sendUpdateByIdQuery'
        )
        .mockResolvedValueOnce(mockDbResponse);

      const instance = new TenantEnvironmentAccountRepository(
        {} as unknown as Knex
      );

      let thrown;
      try {
        await instance.updateById(
          mockTenantEnvironmentAccountId,
          mockUpdateTenantEnvironmentAccountDto
        );
      } catch (error) {
        thrown = error;
      }

      expect(thrown).toBeInstanceOf(NotFoundError);
      expect((thrown as NotFoundError).context).toEqual(
        mockThrownError.context
      );
      expect((thrown as NotFoundError).details).toEqual(
        mockThrownError.details
      );
      expect(mockSendUpdate).toHaveBeenCalledTimes(1);
      expect(mockSendUpdate).toHaveBeenCalledWith(
        mockTenantEnvironmentAccountId,
        mockUpdateTenantEnvironmentAccountDto
      );
    });

    it('fails to update an account by a error thrown by the database', async () => {
      const mockTenantEnvironmentAccountId = faker.string.uuid();
      const mockUpdateTenantEnvironmentAccountDto = {
        name: faker.person.fullName(),
      } as IUpdateTenantEnvironmentAccountAllowedDtos;

      const mockThrownError = new Error('some-error');
      const repositoryError = new UnexpectedError({
        cause: mockThrownError,
        context: contexts.TENANT_ENVIRONMENT_ACCOUNT_UPDATE_BY_ID,
        details: {
          input: {
            id: mockTenantEnvironmentAccountId,
            ...mockUpdateTenantEnvironmentAccountDto,
          },
        },
      });

      const mockSendUpdate = jest
        .spyOn(
          TenantEnvironmentAccountRepository.prototype as unknown as {
            sendUpdateByIdQuery: () => Promise<number>;
          },
          'sendUpdateByIdQuery'
        )
        .mockRejectedValueOnce(mockThrownError);

      const instance = new TenantEnvironmentAccountRepository(
        {} as unknown as Knex
      );

      let thrown;
      try {
        await instance.updateById(
          mockTenantEnvironmentAccountId,
          mockUpdateTenantEnvironmentAccountDto
        );
      } catch (error) {
        thrown = error;
      }

      expect(thrown).toBeInstanceOf(UnexpectedError);
      expect((thrown as UnexpectedError).cause).toEqual(mockThrownError);
      expect((thrown as UnexpectedError).context).toEqual(
        repositoryError.context
      );
      expect((thrown as UnexpectedError).details).toEqual(
        repositoryError.details
      );
      expect(mockSendUpdate).toHaveBeenCalledTimes(1);
      expect(mockSendUpdate).toHaveBeenCalledWith(
        mockTenantEnvironmentAccountId,
        mockUpdateTenantEnvironmentAccountDto
      );
    });
  });

  describe('deleteById', () => {
    it('deletes a tenant environment account by its id', async () => {
      const mockTenantEnvironmentAccountId = faker.string.uuid();
      const mockDbResponse = 1;
      const mockRepositoryResponse = true;

      const mockSendQuery = jest
        .spyOn(
          TenantEnvironmentAccountRepository.prototype as unknown as {
            sendDeleteByIdQuery: () => Promise<number>;
          },
          'sendDeleteByIdQuery'
        )
        .mockResolvedValueOnce(mockDbResponse);

      const instance = new TenantEnvironmentAccountRepository(
        {} as unknown as Knex
      );

      const result = await instance.deleteById(mockTenantEnvironmentAccountId);
      expect(result).toBe(mockRepositoryResponse);
      expect(mockSendQuery).toHaveBeenCalledTimes(1);
      expect(mockSendQuery).toHaveBeenCalledWith(
        mockTenantEnvironmentAccountId
      );
    });

    it('fails to delete an account by receiving an empty response from the database (account does not exist)', async () => {
      const mockTenantEnvironmentAccountId = faker.string.uuid();
      const mockDbResponse = 0;

      const mockThrownError = new NotFoundError({
        context: contexts.TENANT_ENVIRONMENT_ACCOUNT_DELETE_BY_ID,
        details: {
          input: {
            id: mockTenantEnvironmentAccountId,
          },
        },
      });

      const mockSendQuery = jest
        .spyOn(
          TenantEnvironmentAccountRepository.prototype as unknown as {
            sendDeleteByIdQuery: () => Promise<number>;
          },
          'sendDeleteByIdQuery'
        )
        .mockResolvedValueOnce(mockDbResponse);

      const instance = new TenantEnvironmentAccountRepository(
        {} as unknown as Knex
      );

      let thrown;
      try {
        await instance.deleteById(mockTenantEnvironmentAccountId);
      } catch (error) {
        thrown = error;
      }

      expect(thrown).toBeInstanceOf(NotFoundError);
      expect((thrown as NotFoundError).context).toEqual(
        mockThrownError.context
      );
      expect((thrown as NotFoundError).details).toEqual(
        mockThrownError.details
      );

      expect(mockSendQuery).toHaveBeenCalledTimes(1);
      expect(mockSendQuery).toHaveBeenCalledWith(
        mockTenantEnvironmentAccountId
      );
    });

    it('fails to delete an account by a error thrown by the database', async () => {
      const mockTenantEnvironmentAccountId = faker.string.uuid();

      const mockThrownError = new Error('some-error');
      const repositoryError = new UnexpectedError({
        cause: mockThrownError,
        context: contexts.TENANT_ENVIRONMENT_ACCOUNT_DELETE_BY_ID,
        details: {
          input: {
            id: mockTenantEnvironmentAccountId,
          },
        },
      });

      const mockSendQuery = jest
        .spyOn(
          TenantEnvironmentAccountRepository.prototype as unknown as {
            sendDeleteByIdQuery: () => Promise<number>;
          },
          'sendDeleteByIdQuery'
        )
        .mockRejectedValueOnce(mockThrownError);

      const instance = new TenantEnvironmentAccountRepository(
        {} as unknown as Knex
      );

      let thrown;
      try {
        await instance.deleteById(mockTenantEnvironmentAccountId);
      } catch (error) {
        thrown = error;
      }

      expect(thrown).toBeInstanceOf(UnexpectedError);
      expect((thrown as UnexpectedError).cause).toEqual(mockThrownError);
      expect((thrown as UnexpectedError).context).toEqual(
        repositoryError.context
      );
      expect((thrown as UnexpectedError).details).toEqual(
        repositoryError.details
      );
      expect(mockSendQuery).toHaveBeenCalledTimes(1);
      expect(mockSendQuery).toHaveBeenCalledWith(
        mockTenantEnvironmentAccountId
      );
    });
  });

  describe('customProperties', () => {
    describe('setCustomPropertyById', () => {
      it('should set a custom property by the tenant environment account id', async () => {
        const mockTenantEnvironmentAccountId = faker.string.uuid();
        const mockRepositoryResponse = true;

        const mockCustomProperty = {
          customProperty1: faker.lorem.paragraph(),
        };

        const sendSetJsonDataOnPathById = jest
          .spyOn(
            TenantEnvironmentAccountRepository.prototype as unknown as {
              sendSetJsonDataOnPathById: () => Promise<void>;
            },
            'sendSetJsonDataOnPathById'
          )
          .mockResolvedValueOnce();

        const instance = new TenantEnvironmentAccountRepository(
          {} as unknown as Knex
        );

        const result = await instance.setCustomPropertyById(
          mockTenantEnvironmentAccountId,
          mockCustomProperty
        );
        expect(result).toBe(mockRepositoryResponse);
        expect(sendSetJsonDataOnPathById).toHaveBeenCalledTimes(1);
        expect(sendSetJsonDataOnPathById).toHaveBeenCalledWith(
          mockTenantEnvironmentAccountId,
          mockCustomProperty
        );
      });

      it('should fail to set the property by a error thrown by the database', async () => {
        const mockTenantEnvironmentAccountId = faker.string.uuid();
        const mockCustomProperty = {
          customProperty1: faker.lorem.paragraph(),
        };

        const mockThrownError = new Error('some-error');
        const repositoryError = new UnexpectedError({
          cause: mockThrownError,
          context:
            contexts.TENANT_ENVIRONMENT_ACCOUNT_SET_CUSTOM_PROPERTY_BY_ID,
          details: {
            input: {
              id: mockTenantEnvironmentAccountId,
              ...mockCustomProperty,
            },
          },
        });

        const sendSetJsonDataOnPathById = jest
          .spyOn(
            TenantEnvironmentAccountRepository.prototype as unknown as {
              sendSetJsonDataOnPathById: () => Promise<void>;
            },
            'sendSetJsonDataOnPathById'
          )
          .mockRejectedValueOnce(mockThrownError);

        const instance = new TenantEnvironmentAccountRepository(
          {} as unknown as Knex
        );

        let thrown;
        try {
          await instance.setCustomPropertyById(
            mockTenantEnvironmentAccountId,
            mockCustomProperty
          );
        } catch (error) {
          thrown = error;
        }

        expect(thrown).toBeInstanceOf(UnexpectedError);
        expect((thrown as UnexpectedError).cause).toEqual(mockThrownError);
        expect((thrown as UnexpectedError).context).toEqual(
          repositoryError.context
        );
        expect((thrown as UnexpectedError).details).toEqual(
          repositoryError.details
        );
        expect(sendSetJsonDataOnPathById).toHaveBeenCalledTimes(1);
        expect(sendSetJsonDataOnPathById).toHaveBeenCalledWith(
          mockTenantEnvironmentAccountId,
          mockCustomProperty
        );
      });
    });

    describe('deleteCustomPropertyById', () => {
      it('should delete a custom property by the tenant environment account id', async () => {
        const mockTenantEnvironmentAccountId = faker.string.uuid();
        const mockRepositoryResponse = true;

        const mockCustomPropertyKey = 'customProperty1';

        const mockSendDeleteJsonDataOnPathById = jest
          .spyOn(
            TenantEnvironmentAccountRepository.prototype as unknown as {
              sendDeleteJsonDataOnPathById: () => Promise<void>;
            },
            'sendDeleteJsonDataOnPathById'
          )
          .mockResolvedValueOnce();

        const instance = new TenantEnvironmentAccountRepository(
          {} as unknown as Knex
        );

        const result = await instance.deleteCustomPropertyById(
          mockTenantEnvironmentAccountId,
          mockCustomPropertyKey
        );
        expect(result).toBe(mockRepositoryResponse);
        expect(mockSendDeleteJsonDataOnPathById).toHaveBeenCalledTimes(1);
        expect(mockSendDeleteJsonDataOnPathById).toHaveBeenCalledWith(
          mockTenantEnvironmentAccountId,
          mockCustomPropertyKey
        );
      });

      it('should fail to delete the property by a error thrown by the database', async () => {
        const mockTenantEnvironmentAccountId = faker.string.uuid();
        const mockCustomPropertyKey = 'customProperty1';

        const mockThrownError = new Error('some-error');
        const repositoryError = new UnexpectedError({
          cause: mockThrownError,
          context:
            contexts.TENANT_ENVIRONMENT_ACCOUNT_DELETE_CUSTOM_PROPERTY_BY_ID,
          details: {
            input: {
              id: mockTenantEnvironmentAccountId,
              customPropertyKey: mockCustomPropertyKey,
            },
          },
        });

        const mockSendDeleteJsonDataOnPathById = jest
          .spyOn(
            TenantEnvironmentAccountRepository.prototype as unknown as {
              sendDeleteJsonDataOnPathById: () => Promise<void>;
            },
            'sendDeleteJsonDataOnPathById'
          )
          .mockRejectedValueOnce(mockThrownError);

        const instance = new TenantEnvironmentAccountRepository(
          {} as unknown as Knex
        );

        let thrown;
        try {
          await instance.deleteCustomPropertyById(
            mockTenantEnvironmentAccountId,
            mockCustomPropertyKey
          );
        } catch (error) {
          thrown = error;
        }

        expect(thrown).toBeInstanceOf(UnexpectedError);
        expect((thrown as UnexpectedError).cause).toEqual(mockThrownError);
        expect((thrown as UnexpectedError).context).toEqual(
          repositoryError.context
        );
        expect((thrown as UnexpectedError).details).toEqual(
          repositoryError.details
        );
        expect(mockSendDeleteJsonDataOnPathById).toHaveBeenCalledTimes(1);
        expect(mockSendDeleteJsonDataOnPathById).toHaveBeenCalledWith(
          mockTenantEnvironmentAccountId,
          mockCustomPropertyKey
        );
      });
    });
  });
});
