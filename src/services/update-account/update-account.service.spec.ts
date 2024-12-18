import { randomUUID } from 'crypto';
import { contexts } from '../../lib/contexts';
import { RepositoryOperationError } from '../../lib/errors';
import { ServiceOperationError } from '../../lib/errors/service-operation.error';
import { logger } from '../../lib/logger';
import { IUpdateAccountRepository } from '../../repositories/update-account/types';
import { UpdateAccountService } from './update-account.service';

describe('[SERVICE] update account', () => {
  let mockUpdateAccountRepository: IUpdateAccountRepository;
  let validMockId: string;

  beforeAll(() => {
    mockUpdateAccountRepository = {
      updateUnprotectedFields: jest.fn(),
      updateProtectedFields: jest.fn(),
    };

    logger.error = jest.fn();

    validMockId = randomUUID();
  });

  beforeEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  describe('updating unprotected fields', () => {
    it.each([
      [{ handle: 'newhandle' }],
      [{ handle: 'newhandle', phone: '+5555999998888' }],
      [
        {
          handle: 'newhandle',
          phone: '+5555999998888',
          email: 'someemail@somecompany.com',
        },
      ],
    ])('should update an account information (%p)', async (mockPayload) => {
      (
        mockUpdateAccountRepository.updateUnprotectedFields as jest.Mock
      ).mockResolvedValueOnce(true);
      const instance = new UpdateAccountService(mockUpdateAccountRepository);

      const result = await instance.updateUnprotectedFields(
        validMockId,
        mockPayload
      );

      expect(result).toBe(true);
    });

    it('should fail to update due to invalid account id', async () => {
      const invalidAccountId = 'invalidAccountId';
      const mockPayload = {};

      const instance = new UpdateAccountService(mockUpdateAccountRepository);

      let thrown;
      try {
        await instance.updateUnprotectedFields(invalidAccountId, mockPayload);
      } catch (error) {
        thrown = error;
      }

      expect(thrown).toBeInstanceOf(ServiceOperationError);
      expect(thrown).toHaveProperty(
        'context',
        contexts.UPDATE_ACCOUNT_UNPROTECTED_FIELDS
      );
      expect(thrown).toHaveProperty('details.input.id', invalidAccountId);
      expect(thrown).toHaveProperty('details.input.payload', mockPayload);
      expect(thrown).toHaveProperty('details.type', 'validation');
      expect(thrown).toHaveProperty(
        'details.errors',
        'The provided account id is not valid'
      );
      expect(logger.error).toHaveBeenCalledTimes(1);
      expect(logger.error).toHaveBeenCalledWith(thrown);
    });

    it.each([
      [{ handle: 'nw' }],
      [{ handle: 'newhandle', phone: '+5999998888' }],
      [
        {
          handle: 'newhandle',
          phone: '+5555999998888',
          email: 'someemail@somecompany',
        },
      ],
    ])(
      'should fail to update due to invalid payload (%p)',
      async (mockPayload) => {
        const instance = new UpdateAccountService(mockUpdateAccountRepository);

        let thrown;
        try {
          await instance.updateUnprotectedFields(validMockId, mockPayload);
        } catch (error) {
          thrown = error;
        }

        expect(thrown).toBeInstanceOf(ServiceOperationError);
        expect(thrown).toHaveProperty(
          'context',
          contexts.UPDATE_ACCOUNT_UNPROTECTED_FIELDS
        );
        expect(thrown).toHaveProperty('details.input.id', validMockId);
        expect(thrown).toHaveProperty('details.input.payload', mockPayload);
        expect(thrown).toHaveProperty('details.type', 'validation');
        expect(thrown).toHaveProperty(
          'details.errors',
          'The provided payload is not valid'
        );
        expect(logger.error).toHaveBeenCalledTimes(1);
        expect(logger.error).toHaveBeenCalledWith(thrown);
      }
    );

    it('should fail to update due to account not existing', async () => {
      const mockPayload = { handle: 'newhandle' };
      const mockRepositoryError = new RepositoryOperationError({
        cause: new Error('account does not exist'),
        context: contexts.UPDATE_ACCOUNT_UNPROTECTED_FIELDS,
        details: {
          input: { id: validMockId, payload: mockPayload },
        },
      });

      (
        mockUpdateAccountRepository.updateUnprotectedFields as jest.Mock
      ).mockRejectedValueOnce(mockRepositoryError);
      const instance = new UpdateAccountService(mockUpdateAccountRepository);

      await expect(() =>
        instance.updateUnprotectedFields(validMockId, mockPayload)
      ).rejects.toThrow('account does not exist');
    });
  });

  describe('updating protected fields', () => {
    it.todo('should update an account information');
    it.todo('should fail to update due to account not existing');
    it.todo('should fail to update downstream failure (repository)');
  });
});
