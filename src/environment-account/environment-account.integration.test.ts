import { INestApplication } from '@nestjs/common';
import {
  createTestApp,
  cleanDatabase,
  closeTestApp,
  request,
  getDbClient,
} from '../test';

describe('Environment Account Endpoints (Integration)', () => {
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

  // Helper to create a tenant with owner session
  async function createTenantWithSession(overrides = {}) {
    const defaultPayload = {
      tenant: { name: 'Test Tenant' },
      account: {
        email: 'owner@test.com',
        name: 'Test Owner',
        username: 'testowner',
        password: 'SecurePassword123!',
      },
      environment: { name: 'default' },
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

  // Helper to create an environment account (self-signup)
  async function createEnvironmentAccount(
    environmentId: string,
    overrides = {}
  ) {
    const defaultPayload = {
      name: 'Test User',
      email: 'user@test.com',
      username: 'testuser',
      phone: '+1234567890',
      ...overrides,
    };

    const response = await request(app.getHttpServer())
      .post(`${API_PREFIX}/environments/${environmentId}/accounts`)
      .send(defaultPayload)
      .expect(201);

    return response.body as { id: string };
  }

  // Helper to sign in as an environment account
  async function signInAsEnvironmentAccount(
    environmentId: string,
    email: string,
    password: string
  ) {
    const response = await request(app.getHttpServer())
      .post(`${API_PREFIX}/auth/environment/signin`)
      .send({ environmentId, email, password })
      .expect(200);

    const cookies = response.headers['set-cookie'] as string[] | undefined;
    const sessionCookie = cookies?.find((c: string) => c.startsWith('sump_session='));

    return { sessionCookie, body: response.body };
  }

  describe('POST /environments/:environmentId/accounts', () => {
    it('should create a new account (self-signup)', async () => {
      const { body } = await createTenantWithSession();

      const response = await request(app.getHttpServer())
        .post(`${API_PREFIX}/environments/${body.environmentId}/accounts`)
        .send({
          name: 'New User',
          email: 'newuser@test.com',
          username: 'newuser',
          phone: '+1555555555',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
    });

    it('should create account with custom properties', async () => {
      const { body } = await createTenantWithSession();

      const response = await request(app.getHttpServer())
        .post(`${API_PREFIX}/environments/${body.environmentId}/accounts`)
        .send({
          name: 'New User',
          email: 'newuser@test.com',
          username: 'newuser',
          phone: '+1555555555',
          customProperties: { plan: 'premium', referral: 'friend123' },
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
    });

    it('should return 400 for invalid email', async () => {
      const { body } = await createTenantWithSession();

      await request(app.getHttpServer())
        .post(`${API_PREFIX}/environments/${body.environmentId}/accounts`)
        .send({
          name: 'New User',
          email: 'invalid-email',
          username: 'newuser',
          phone: '+1555555555',
        })
        .expect(400);
    });

    it('should return 400 for missing required fields', async () => {
      const { body } = await createTenantWithSession();

      await request(app.getHttpServer())
        .post(`${API_PREFIX}/environments/${body.environmentId}/accounts`)
        .send({
          name: 'New User',
        })
        .expect(400);
    });
  });

  describe('GET /environments/:environmentId/accounts/:accountId', () => {
    it.skip('should get account by ID when authenticated', async () => {
      // TODO: Requires environment-level session authentication
      // Tenant sessions don't have access to environment account endpoints
    });

    it('should return 401 without authentication', async () => {
      const { body } = await createTenantWithSession();
      const account = await createEnvironmentAccount(body.environmentId);

      await request(app.getHttpServer())
        .get(`${API_PREFIX}/environments/${body.environmentId}/accounts/${account.id}`)
        .expect(401);
    });

    it('should return 403 for tenant session accessing environment accounts', async () => {
      const { body, sessionCookie } = await createTenantWithSession();
      const fakeId = '00000000-0000-0000-0000-000000000000';

      // Tenant sessions are not authorized to access environment account endpoints
      await request(app.getHttpServer())
        .get(`${API_PREFIX}/environments/${body.environmentId}/accounts/${fakeId}`)
        .set('Cookie', sessionCookie!)
        .expect(403);
    });
  });

  describe('DELETE /environments/:environmentId/accounts/:accountId', () => {
    it.skip('should delete an account', async () => {
      // TODO: Requires environment-level session (account owner) authentication
    });

    it('should return 401 without authentication', async () => {
      const { body } = await createTenantWithSession();
      const account = await createEnvironmentAccount(body.environmentId);

      await request(app.getHttpServer())
        .delete(`${API_PREFIX}/environments/${body.environmentId}/accounts/${account.id}`)
        .expect(401);
    });
  });

  describe('PATCH /environments/:environmentId/accounts/:accountId', () => {
    it.skip('should update account name', async () => {
      // TODO: Requires environment-level session (account owner) authentication
    });

    it.skip('should update avatar URL', async () => {
      // TODO: Requires environment-level session (account owner) authentication
    });

    it('should return 401 without authentication', async () => {
      const { body } = await createTenantWithSession();
      const account = await createEnvironmentAccount(body.environmentId);

      await request(app.getHttpServer())
        .patch(`${API_PREFIX}/environments/${body.environmentId}/accounts/${account.id}`)
        .send({ name: 'Updated Name' })
        .expect(401);
    });
  });

  describe('PATCH /environments/:environmentId/accounts/:accountId/email', () => {
    it.skip('should update account email', async () => {
      // TODO: Requires environment-level session (account owner) authentication
    });

    it('should return 401 without authentication', async () => {
      const { body } = await createTenantWithSession();
      const account = await createEnvironmentAccount(body.environmentId);

      await request(app.getHttpServer())
        .patch(`${API_PREFIX}/environments/${body.environmentId}/accounts/${account.id}/email`)
        .send({ email: 'newemail@test.com' })
        .expect(401);
    });

    it.skip('should return 409 for duplicate email', async () => {
      // TODO: Implement duplicate detection on update
    });
  });

  describe('PATCH /environments/:environmentId/accounts/:accountId/phone', () => {
    it.skip('should update account phone', async () => {
      // TODO: Requires environment-level session (account owner) authentication
    });

    it('should return 401 without authentication', async () => {
      const { body } = await createTenantWithSession();
      const account = await createEnvironmentAccount(body.environmentId);

      await request(app.getHttpServer())
        .patch(`${API_PREFIX}/environments/${body.environmentId}/accounts/${account.id}/phone`)
        .send({ phone: '+1999999999' })
        .expect(401);
    });

    it.skip('should return 409 for duplicate phone', async () => {
      // TODO: Implement duplicate detection on update
    });
  });

  describe('PATCH /environments/:environmentId/accounts/:accountId/username', () => {
    it.skip('should update account username', async () => {
      // TODO: Requires environment-level session (account owner) authentication
    });

    it('should return 401 without authentication', async () => {
      const { body } = await createTenantWithSession();
      const account = await createEnvironmentAccount(body.environmentId);

      await request(app.getHttpServer())
        .patch(`${API_PREFIX}/environments/${body.environmentId}/accounts/${account.id}/username`)
        .send({ username: 'newusername' })
        .expect(401);
    });

    it.skip('should return 409 for duplicate username', async () => {
      // TODO: Implement duplicate detection on update
    });
  });

  describe('PATCH /environments/:environmentId/accounts/:accountId/custom-property', () => {
    it.skip('should set a custom property', async () => {
      // TODO: Requires environment-level session (account owner) authentication
    });

    it('should return 401 without authentication', async () => {
      const { body } = await createTenantWithSession();
      const account = await createEnvironmentAccount(body.environmentId);

      await request(app.getHttpServer())
        .patch(`${API_PREFIX}/environments/${body.environmentId}/accounts/${account.id}/custom-property`)
        .send({ theme: 'dark' })
        .expect(401);
    });
  });

  describe('DELETE /environments/:environmentId/accounts/:accountId/custom-property', () => {
    it.skip('should delete a custom property', async () => {
      // TODO: Requires environment-level session (account owner) authentication
    });

    it('should return 401 without authentication', async () => {
      const { body } = await createTenantWithSession();
      const account = await createEnvironmentAccount(body.environmentId);

      await request(app.getHttpServer())
        .delete(`${API_PREFIX}/environments/${body.environmentId}/accounts/${account.id}/custom-property`)
        .send({ customProperty: 'theme' })
        .expect(401);
    });
  });

  describe('PATCH /environments/:environmentId/accounts/:accountId/disable', () => {
    it.skip('should disable an account', async () => {
      // TODO: Requires environment-level admin/owner session authentication
    });

    it('should return 401 without authentication', async () => {
      const { body } = await createTenantWithSession();
      const account = await createEnvironmentAccount(body.environmentId);

      await request(app.getHttpServer())
        .patch(`${API_PREFIX}/environments/${body.environmentId}/accounts/${account.id}/disable`)
        .expect(401);
    });
  });

  describe('PATCH /environments/:environmentId/accounts/:accountId/enable', () => {
    it.skip('should enable a disabled account', async () => {
      // TODO: Requires environment-level admin/owner session authentication
    });

    it('should return 401 without authentication', async () => {
      const { body } = await createTenantWithSession();
      const account = await createEnvironmentAccount(body.environmentId);

      await request(app.getHttpServer())
        .patch(`${API_PREFIX}/environments/${body.environmentId}/accounts/${account.id}/enable`)
        .expect(401);
    });
  });
});
