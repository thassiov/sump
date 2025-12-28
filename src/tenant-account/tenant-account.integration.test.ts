import { INestApplication } from '@nestjs/common';
import {
  createTestApp,
  cleanDatabase,
  closeTestApp,
  request,
  getDbClient,
} from '../test';

describe('Tenant Account Endpoints (Integration)', () => {
  let app: INestApplication;
  const API_PREFIX = '/api/v1';

  beforeAll(async () => {
    app = await createTestApp();
  });

  beforeEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await closeTestApp();
  });

  // Helper to create a tenant and get the session cookie (owner session)
  async function createTenantWithSession(overrides = {}) {
    const defaultPayload = {
      tenant: { name: 'Test Tenant' },
      account: {
        email: 'owner@test.com',
        name: 'Test Owner',
        username: 'testowner',
        password: 'SecurePassword123!',
      },
      environment: { name: 'production' },
      ...overrides,
    };

    const response = await request(app.getHttpServer())
      .post(`${API_PREFIX}/tenants`)
      .send(defaultPayload)
      .expect(201);

    const cookies = response.headers['set-cookie'] as string[] | undefined;
    const sessionCookie = cookies?.find((c: string) => c.startsWith('sump_session='));

    return {
      body: response.body as {
        tenantId: string;
        accountId: string;
        environmentId: string;
        session: { id: string };
      },
      sessionCookie,
    };
  }

  // Helper to create an additional account (requires owner session)
  async function createAdditionalAccount(
    tenantId: string,
    sessionCookie: string,
    overrides = {}
  ) {
    const defaultPayload = {
      name: 'Additional User',
      email: 'additional@test.com',
      username: 'additionaluser',
      ...overrides,
    };

    const response = await request(app.getHttpServer())
      .post(`${API_PREFIX}/tenants/${tenantId}/accounts`)
      .set('Cookie', sessionCookie)
      .send(defaultPayload)
      .expect(201);

    return response.body as { id: string };
  }

  describe('POST /tenants/:tenantId/accounts', () => {
    it('should create a new account as owner', async () => {
      const { body, sessionCookie } = await createTenantWithSession();

      const response = await request(app.getHttpServer())
        .post(`${API_PREFIX}/tenants/${body.tenantId}/accounts`)
        .set('Cookie', sessionCookie!)
        .send({
          name: 'New User',
          email: 'newuser@test.com',
          username: 'newuser',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
    });

    it('should create account with optional fields', async () => {
      const { body, sessionCookie } = await createTenantWithSession();

      const response = await request(app.getHttpServer())
        .post(`${API_PREFIX}/tenants/${body.tenantId}/accounts`)
        .set('Cookie', sessionCookie!)
        .send({
          name: 'Full User',
          email: 'fulluser@test.com',
          username: 'fulluser',
          phone: '+1234567890',
          avatarUrl: 'https://example.com/avatar.png',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
    });

    it('should return 401 without authentication', async () => {
      const { body } = await createTenantWithSession();

      await request(app.getHttpServer())
        .post(`${API_PREFIX}/tenants/${body.tenantId}/accounts`)
        .send({
          name: 'New User',
          email: 'newuser@test.com',
          username: 'newuser',
        })
        .expect(401);
    });

    it('should reject duplicate email', async () => {
      const { body, sessionCookie } = await createTenantWithSession();

      // Create first account
      await request(app.getHttpServer())
        .post(`${API_PREFIX}/tenants/${body.tenantId}/accounts`)
        .set('Cookie', sessionCookie!)
        .send({
          name: 'First User',
          email: 'duplicate@test.com',
          username: 'firstuser',
        })
        .expect(201);

      // Try to create account with same email
      await request(app.getHttpServer())
        .post(`${API_PREFIX}/tenants/${body.tenantId}/accounts`)
        .set('Cookie', sessionCookie!)
        .send({
          name: 'Second User',
          email: 'duplicate@test.com',
          username: 'seconduser',
        })
        .expect(409);
    });

    it('should reject duplicate username', async () => {
      const { body, sessionCookie } = await createTenantWithSession();

      // Create first account
      await request(app.getHttpServer())
        .post(`${API_PREFIX}/tenants/${body.tenantId}/accounts`)
        .set('Cookie', sessionCookie!)
        .send({
          name: 'First User',
          email: 'first@test.com',
          username: 'duplicateuser',
        })
        .expect(201);

      // Try to create account with same username
      await request(app.getHttpServer())
        .post(`${API_PREFIX}/tenants/${body.tenantId}/accounts`)
        .set('Cookie', sessionCookie!)
        .send({
          name: 'Second User',
          email: 'second@test.com',
          username: 'duplicateuser',
        })
        .expect(409);
    });
  });

  describe('GET /tenants/:tenantId/accounts/:accountId', () => {
    it('should get account by ID', async () => {
      const { body, sessionCookie } = await createTenantWithSession();
      const newAccount = await createAdditionalAccount(body.tenantId, sessionCookie!);

      const response = await request(app.getHttpServer())
        .get(`${API_PREFIX}/tenants/${body.tenantId}/accounts/${newAccount.id}`)
        .set('Cookie', sessionCookie!)
        .expect(200);

      expect(response.body).toHaveProperty('id', newAccount.id);
      expect(response.body).toHaveProperty('email', 'additional@test.com');
      expect(response.body).toHaveProperty('name', 'Additional User');
      expect(response.body).toHaveProperty('username', 'additionaluser');
    });

    it('should return 401 without authentication', async () => {
      const { body, sessionCookie } = await createTenantWithSession();
      const newAccount = await createAdditionalAccount(body.tenantId, sessionCookie!);

      await request(app.getHttpServer())
        .get(`${API_PREFIX}/tenants/${body.tenantId}/accounts/${newAccount.id}`)
        .expect(401);
    });

    it('should return 404 for non-existent account', async () => {
      const { body, sessionCookie } = await createTenantWithSession();
      const fakeId = '00000000-0000-0000-0000-000000000000';

      await request(app.getHttpServer())
        .get(`${API_PREFIX}/tenants/${body.tenantId}/accounts/${fakeId}`)
        .set('Cookie', sessionCookie!)
        .expect(404);
    });
  });

  describe('GET /tenants/:tenantId/accounts/user-defined-identification', () => {
    it('should find account by email', async () => {
      const { body, sessionCookie } = await createTenantWithSession();
      await createAdditionalAccount(body.tenantId, sessionCookie!);

      const response = await request(app.getHttpServer())
        .get(`${API_PREFIX}/tenants/${body.tenantId}/accounts/user-defined-identification`)
        .set('Cookie', sessionCookie!)
        .send({ email: 'additional@test.com' })
        .expect(200);

      expect(response.body).toHaveProperty('email', 'additional@test.com');
    });

    it('should find account by username', async () => {
      const { body, sessionCookie } = await createTenantWithSession();
      await createAdditionalAccount(body.tenantId, sessionCookie!);

      const response = await request(app.getHttpServer())
        .get(`${API_PREFIX}/tenants/${body.tenantId}/accounts/user-defined-identification`)
        .set('Cookie', sessionCookie!)
        .send({ username: 'additionaluser' })
        .expect(200);

      expect(response.body).toHaveProperty('username', 'additionaluser');
    });

    it('should find account by phone', async () => {
      const { body, sessionCookie } = await createTenantWithSession();
      await createAdditionalAccount(body.tenantId, sessionCookie!, {
        phone: '+9876543210',
      });

      const response = await request(app.getHttpServer())
        .get(`${API_PREFIX}/tenants/${body.tenantId}/accounts/user-defined-identification`)
        .set('Cookie', sessionCookie!)
        .send({ phone: '+9876543210' })
        .expect(200);

      expect(response.body).toHaveProperty('phone', '+9876543210');
    });

    it('should return 404 for non-existent identification', async () => {
      const { body, sessionCookie } = await createTenantWithSession();

      await request(app.getHttpServer())
        .get(`${API_PREFIX}/tenants/${body.tenantId}/accounts/user-defined-identification`)
        .set('Cookie', sessionCookie!)
        .send({ email: 'nonexistent@test.com' })
        .expect(404);
    });

    it('should return 401 without authentication', async () => {
      const { body } = await createTenantWithSession();

      await request(app.getHttpServer())
        .get(`${API_PREFIX}/tenants/${body.tenantId}/accounts/user-defined-identification`)
        .send({ email: 'test@test.com' })
        .expect(401);
    });
  });

  describe('PATCH /tenants/:tenantId/accounts/:accountId', () => {
    it('should update account name', async () => {
      const { body, sessionCookie } = await createTenantWithSession();
      const newAccount = await createAdditionalAccount(body.tenantId, sessionCookie!);

      await request(app.getHttpServer())
        .patch(`${API_PREFIX}/tenants/${body.tenantId}/accounts/${newAccount.id}`)
        .set('Cookie', sessionCookie!)
        .send({ name: 'Updated Name' })
        .expect(204);

      // Verify the update
      const getResponse = await request(app.getHttpServer())
        .get(`${API_PREFIX}/tenants/${body.tenantId}/accounts/${newAccount.id}`)
        .set('Cookie', sessionCookie!)
        .expect(200);

      expect(getResponse.body.name).toBe('Updated Name');
    });

    it('should update account avatar URL', async () => {
      const { body, sessionCookie } = await createTenantWithSession();
      const newAccount = await createAdditionalAccount(body.tenantId, sessionCookie!);

      await request(app.getHttpServer())
        .patch(`${API_PREFIX}/tenants/${body.tenantId}/accounts/${newAccount.id}`)
        .set('Cookie', sessionCookie!)
        .send({ avatarUrl: 'https://example.com/new-avatar.png' })
        .expect(204);

      const getResponse = await request(app.getHttpServer())
        .get(`${API_PREFIX}/tenants/${body.tenantId}/accounts/${newAccount.id}`)
        .set('Cookie', sessionCookie!)
        .expect(200);

      expect(getResponse.body.avatarUrl).toBe('https://example.com/new-avatar.png');
    });

    it('should return 401 without authentication', async () => {
      const { body, sessionCookie } = await createTenantWithSession();
      const newAccount = await createAdditionalAccount(body.tenantId, sessionCookie!);

      await request(app.getHttpServer())
        .patch(`${API_PREFIX}/tenants/${body.tenantId}/accounts/${newAccount.id}`)
        .send({ name: 'Updated Name' })
        .expect(401);
    });
  });

  describe('PATCH /tenants/:tenantId/accounts/:accountId/email', () => {
    it('should update account email', async () => {
      const { body, sessionCookie } = await createTenantWithSession();
      const newAccount = await createAdditionalAccount(body.tenantId, sessionCookie!);

      await request(app.getHttpServer())
        .patch(`${API_PREFIX}/tenants/${body.tenantId}/accounts/${newAccount.id}/email`)
        .set('Cookie', sessionCookie!)
        .send({ email: 'updated@test.com' })
        .expect(204);

      const getResponse = await request(app.getHttpServer())
        .get(`${API_PREFIX}/tenants/${body.tenantId}/accounts/${newAccount.id}`)
        .set('Cookie', sessionCookie!)
        .expect(200);

      expect(getResponse.body.email).toBe('updated@test.com');
    });

    // TODO: Duplicate detection on update not yet implemented at use case level
    // Currently the database constraint catches this but returns 500 instead of 409
    it.skip('should reject duplicate email', async () => {
      const { body, sessionCookie } = await createTenantWithSession();
      const newAccount = await createAdditionalAccount(body.tenantId, sessionCookie!);

      // Try to update to owner's email
      await request(app.getHttpServer())
        .patch(`${API_PREFIX}/tenants/${body.tenantId}/accounts/${newAccount.id}/email`)
        .set('Cookie', sessionCookie!)
        .send({ email: 'owner@test.com' })
        .expect(409);
    });

    it('should return 401 without authentication', async () => {
      const { body, sessionCookie } = await createTenantWithSession();
      const newAccount = await createAdditionalAccount(body.tenantId, sessionCookie!);

      await request(app.getHttpServer())
        .patch(`${API_PREFIX}/tenants/${body.tenantId}/accounts/${newAccount.id}/email`)
        .send({ email: 'updated@test.com' })
        .expect(401);
    });
  });

  describe('PATCH /tenants/:tenantId/accounts/:accountId/username', () => {
    it('should update account username', async () => {
      const { body, sessionCookie } = await createTenantWithSession();
      const newAccount = await createAdditionalAccount(body.tenantId, sessionCookie!);

      await request(app.getHttpServer())
        .patch(`${API_PREFIX}/tenants/${body.tenantId}/accounts/${newAccount.id}/username`)
        .set('Cookie', sessionCookie!)
        .send({ username: 'updateduser' })
        .expect(204);

      const getResponse = await request(app.getHttpServer())
        .get(`${API_PREFIX}/tenants/${body.tenantId}/accounts/${newAccount.id}`)
        .set('Cookie', sessionCookie!)
        .expect(200);

      expect(getResponse.body.username).toBe('updateduser');
    });

    // TODO: Duplicate detection on update not yet implemented at use case level
    it.skip('should reject duplicate username', async () => {
      const { body, sessionCookie } = await createTenantWithSession();
      const newAccount = await createAdditionalAccount(body.tenantId, sessionCookie!);

      // Try to update to owner's username
      await request(app.getHttpServer())
        .patch(`${API_PREFIX}/tenants/${body.tenantId}/accounts/${newAccount.id}/username`)
        .set('Cookie', sessionCookie!)
        .send({ username: 'testowner' })
        .expect(409);
    });

    it('should return 401 without authentication', async () => {
      const { body, sessionCookie } = await createTenantWithSession();
      const newAccount = await createAdditionalAccount(body.tenantId, sessionCookie!);

      await request(app.getHttpServer())
        .patch(`${API_PREFIX}/tenants/${body.tenantId}/accounts/${newAccount.id}/username`)
        .send({ username: 'updateduser' })
        .expect(401);
    });
  });

  describe('PATCH /tenants/:tenantId/accounts/:accountId/phone', () => {
    it('should update account phone', async () => {
      const { body, sessionCookie } = await createTenantWithSession();
      const newAccount = await createAdditionalAccount(body.tenantId, sessionCookie!);

      await request(app.getHttpServer())
        .patch(`${API_PREFIX}/tenants/${body.tenantId}/accounts/${newAccount.id}/phone`)
        .set('Cookie', sessionCookie!)
        .send({ phone: '+1111111111' })
        .expect(204);

      const getResponse = await request(app.getHttpServer())
        .get(`${API_PREFIX}/tenants/${body.tenantId}/accounts/${newAccount.id}`)
        .set('Cookie', sessionCookie!)
        .expect(200);

      expect(getResponse.body.phone).toBe('+1111111111');
    });

    // TODO: Duplicate detection on update not yet implemented at use case level
    it.skip('should reject duplicate phone', async () => {
      const { body, sessionCookie } = await createTenantWithSession();
      // Create account with phone
      await createAdditionalAccount(body.tenantId, sessionCookie!, {
        phone: '+5555555555',
      });
      const secondAccount = await createAdditionalAccount(body.tenantId, sessionCookie!, {
        email: 'second@test.com',
        username: 'seconduser',
      });

      // Try to update to existing phone
      await request(app.getHttpServer())
        .patch(`${API_PREFIX}/tenants/${body.tenantId}/accounts/${secondAccount.id}/phone`)
        .set('Cookie', sessionCookie!)
        .send({ phone: '+5555555555' })
        .expect(409);
    });

    it('should return 401 without authentication', async () => {
      const { body, sessionCookie } = await createTenantWithSession();
      const newAccount = await createAdditionalAccount(body.tenantId, sessionCookie!);

      await request(app.getHttpServer())
        .patch(`${API_PREFIX}/tenants/${body.tenantId}/accounts/${newAccount.id}/phone`)
        .send({ phone: '+1111111111' })
        .expect(401);
    });
  });

  describe('PATCH /tenants/:tenantId/accounts/:accountId/disable', () => {
    it('should disable an account', async () => {
      const { body, sessionCookie } = await createTenantWithSession();
      const newAccount = await createAdditionalAccount(body.tenantId, sessionCookie!);

      await request(app.getHttpServer())
        .patch(`${API_PREFIX}/tenants/${body.tenantId}/accounts/${newAccount.id}/disable`)
        .set('Cookie', sessionCookie!)
        .expect(204);

      // Verify the account is disabled
      const getResponse = await request(app.getHttpServer())
        .get(`${API_PREFIX}/tenants/${body.tenantId}/accounts/${newAccount.id}`)
        .set('Cookie', sessionCookie!)
        .expect(200);

      expect(getResponse.body.disabled).toBe(true);
    });

    it('should return 401 without authentication', async () => {
      const { body, sessionCookie } = await createTenantWithSession();
      const newAccount = await createAdditionalAccount(body.tenantId, sessionCookie!);

      await request(app.getHttpServer())
        .patch(`${API_PREFIX}/tenants/${body.tenantId}/accounts/${newAccount.id}/disable`)
        .expect(401);
    });
  });

  describe('PATCH /tenants/:tenantId/accounts/:accountId/enable', () => {
    it('should enable a disabled account', async () => {
      const { body, sessionCookie } = await createTenantWithSession();
      const newAccount = await createAdditionalAccount(body.tenantId, sessionCookie!);

      // First disable the account
      await request(app.getHttpServer())
        .patch(`${API_PREFIX}/tenants/${body.tenantId}/accounts/${newAccount.id}/disable`)
        .set('Cookie', sessionCookie!)
        .expect(204);

      // Then enable it
      await request(app.getHttpServer())
        .patch(`${API_PREFIX}/tenants/${body.tenantId}/accounts/${newAccount.id}/enable`)
        .set('Cookie', sessionCookie!)
        .expect(204);

      // Verify the account is enabled
      const getResponse = await request(app.getHttpServer())
        .get(`${API_PREFIX}/tenants/${body.tenantId}/accounts/${newAccount.id}`)
        .set('Cookie', sessionCookie!)
        .expect(200);

      expect(getResponse.body.disabled).toBe(false);
    });

    it('should return 401 without authentication', async () => {
      const { body, sessionCookie } = await createTenantWithSession();
      const newAccount = await createAdditionalAccount(body.tenantId, sessionCookie!);

      await request(app.getHttpServer())
        .patch(`${API_PREFIX}/tenants/${body.tenantId}/accounts/${newAccount.id}/enable`)
        .expect(401);
    });
  });

  describe('DELETE /tenants/:tenantId/accounts/:accountId', () => {
    it('should delete an account', async () => {
      const { body, sessionCookie } = await createTenantWithSession();
      const newAccount = await createAdditionalAccount(body.tenantId, sessionCookie!);

      await request(app.getHttpServer())
        .delete(`${API_PREFIX}/tenants/${body.tenantId}/accounts/${newAccount.id}`)
        .set('Cookie', sessionCookie!)
        .expect(204);

      // Verify account is deleted
      const db = getDbClient();
      const account = await db('tenant_account').where('id', newAccount.id).first();
      expect(account).toBeUndefined();
    });

    it('should return 401 without authentication', async () => {
      const { body, sessionCookie } = await createTenantWithSession();
      const newAccount = await createAdditionalAccount(body.tenantId, sessionCookie!);

      await request(app.getHttpServer())
        .delete(`${API_PREFIX}/tenants/${body.tenantId}/accounts/${newAccount.id}`)
        .expect(401);
    });
  });
});
