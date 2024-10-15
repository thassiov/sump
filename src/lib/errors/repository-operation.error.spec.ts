import { contexts } from '../contexts';
import { errors } from './application-error.list';
import { BaseCustomError } from './base-custom-error.error';
import { RepositoryOperationError } from './repository-operation.error';

describe('[ERROR] repository-operation', () => {
  it('should create a repository-operation error instance', () => {
    const mockCauseError = new Error('an error');
    const errorOpts = {
      details: {
        someDetail: 'this is the detail',
      },
      cause: mockCauseError,
      context: contexts.ACCOUNT_PROFILE_CREATE,
    };

    const error = new RepositoryOperationError(errorOpts);

    expect(error).toBeInstanceOf(RepositoryOperationError);
    expect(error).toBeInstanceOf(BaseCustomError);
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe(errors.REPOSITORY_OPERATION_ERROR.name);
    expect(error.message).toBe(
      errors.REPOSITORY_OPERATION_ERROR.message + ': an error'
    );
    expect(error.context).toBe(contexts.ACCOUNT_PROFILE_CREATE);
    expect(error.cause).toBe(mockCauseError);
    expect(error.details).toHaveProperty('someDetail', 'this is the detail');
  });
});
