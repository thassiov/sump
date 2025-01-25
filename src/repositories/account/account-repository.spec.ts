describe('[repository] account', () => {
  describe('create', () => {
    it.todo('creates a new account');
    it.todo(
      'fails to create a new account by receiving an empty response from the database'
    );
    it.todo('fails to create a new account by a error thrown by the database');
  });

  describe('getAccountById', () => {
    it.todo('gets an account by its id');
    it.todo('gets an empty response as the account does not exist');
    it.todo('fails to get an account by a error thrown by the database');
  });

  describe('updateAccountById', () => {
    it.todo('updates an account by its id');
    it.todo(
      'fails to update an account by receiving an empty response from the database (account does not exist)'
    );
    it.todo('fails to update an account by a error thrown by the database');
  });

  describe('removeAccountById', () => {
    it.todo('removes an account by its id');
    it.todo(
      'fails to remove an account by receiving an empty response from the database (account does not exist)'
    );
    it.todo('fails to remove an account by a error thrown by the database');
  });
});
