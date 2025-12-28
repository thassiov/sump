import { INestApplication } from '@nestjs/common';
import {
  createTestApp,
  cleanDatabase,
  closeTestApp,
  request,
  getDbClient,
} from '../test';

describe('Environment Endpoints (Integration)', () => {
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

  // Helper to create an additional environment
  async function createAdditionalEnvironment(
    tenantId: string,
    sessionCookie: string,
    overrides = {}
  ) {
    const defaultPayload = {
      name: 'staging',
      ...overrides,
    };

    const response = await request(app.getHttpServer())
      .post(`${API_PREFIX}/tenants/${tenantId}/environments`)
      .set('Cookie', sessionCookie)
      .send(defaultPayload)
      .expect(201);

    return response.body as { id: string };
  }

  describe('POST /tenants/:tenantId/environments', () => {
    it('should create a new environment', async () => {
      const { body, sessionCookie } = await createTenantWithSession();

      const response = await request(app.getHttpServer())
        .post(`${API_PREFIX}/tenants/${body.tenantId}/environments`)
        .set('Cookie', sessionCookie!)
        .send({ name: 'staging' })
        .expect(201);

      expect(response.body).toHaveProperty('id');
    });

    it('should create environment with custom properties', async () => {
      const { body, sessionCookie } = await createTenantWithSession();

      const response = await request(app.getHttpServer())
        .post(`${API_PREFIX}/tenants/${body.tenantId}/environments`)
        .set('Cookie', sessionCookie!)
        .send({
          name: 'production',
          customProperties: { feature_flags: { dark_mode: true }, tier: 'premium' },
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
    });

    it('should return 401 without authentication', async () => {
      const { body } = await createTenantWithSession();

      await request(app.getHttpServer())
        .post(`${API_PREFIX}/tenants/${body.tenantId}/environments`)
        .send({ name: 'staging' })
        .expect(401);
    });

    it('should return 403 for non-existent tenant', async () => {
      const { sessionCookie } = await createTenantWithSession();
      const fakeId = '00000000-0000-0000-0000-000000000000';

      await request(app.getHttpServer())
        .post(`${API_PREFIX}/tenants/${fakeId}/environments`)
        .set('Cookie', sessionCookie!)
        .send({ name: 'staging' })
        .expect(403);
    });
  });

  describe('GET /tenants/:tenantId/environments/:environmentId', () => {
    it('should get environment by ID', async () => {
      const { body, sessionCookie } = await createTenantWithSession();
      const newEnv = await createAdditionalEnvironment(body.tenantId, sessionCookie!);

      const response = await request(app.getHttpServer())
        .get(`${API_PREFIX}/tenants/${body.tenantId}/environments/${newEnv.id}`)
        .set('Cookie', sessionCookie!)
        .expect(200);

      expect(response.body).toHaveProperty('id', newEnv.id);
      expect(response.body).toHaveProperty('name', 'staging');
      expect(response.body).toHaveProperty('customProperties');
    });

    it('should get the default environment created with tenant', async () => {
      const { body, sessionCookie } = await createTenantWithSession();

      const response = await request(app.getHttpServer())
        .get(`${API_PREFIX}/tenants/${body.tenantId}/environments/${body.environmentId}`)
        .set('Cookie', sessionCookie!)
        .expect(200);

      expect(response.body).toHaveProperty('id', body.environmentId);
      expect(response.body).toHaveProperty('name', 'default');
    });

    it('should return 401 without authentication', async () => {
      const { body, sessionCookie } = await createTenantWithSession();
      const newEnv = await createAdditionalEnvironment(body.tenantId, sessionCookie!);

      await request(app.getHttpServer())
        .get(`${API_PREFIX}/tenants/${body.tenantId}/environments/${newEnv.id}`)
        .expect(401);
    });

    it('should return 404 for non-existent environment', async () => {
      const { body, sessionCookie } = await createTenantWithSession();
      const fakeId = '00000000-0000-0000-0000-000000000000';

      await request(app.getHttpServer())
        .get(`${API_PREFIX}/tenants/${body.tenantId}/environments/${fakeId}`)
        .set('Cookie', sessionCookie!)
        .expect(404);
    });
  });

  describe('PATCH /tenants/:tenantId/environments/:environmentId', () => {
    it('should update environment name', async () => {
      const { body, sessionCookie } = await createTenantWithSession();
      const newEnv = await createAdditionalEnvironment(body.tenantId, sessionCookie!);

      await request(app.getHttpServer())
        .patch(`${API_PREFIX}/tenants/${body.tenantId}/environments/${newEnv.id}`)
        .set('Cookie', sessionCookie!)
        .send({ name: 'staging-v2' })
        .expect(200);

      // Verify the update
      const getResponse = await request(app.getHttpServer())
        .get(`${API_PREFIX}/tenants/${body.tenantId}/environments/${newEnv.id}`)
        .set('Cookie', sessionCookie!)
        .expect(200);

      expect(getResponse.body.name).toBe('staging-v2');
    });

    it('should return 401 without authentication', async () => {
      const { body, sessionCookie } = await createTenantWithSession();
      const newEnv = await createAdditionalEnvironment(body.tenantId, sessionCookie!);

      await request(app.getHttpServer())
        .patch(`${API_PREFIX}/tenants/${body.tenantId}/environments/${newEnv.id}`)
        .send({ name: 'updated' })
        .expect(401);
    });
  });

  describe('DELETE /tenants/:tenantId/environments/:environmentId', () => {
    it('should delete an environment', async () => {
      const { body, sessionCookie } = await createTenantWithSession();
      const newEnv = await createAdditionalEnvironment(body.tenantId, sessionCookie!);

      await request(app.getHttpServer())
        .delete(`${API_PREFIX}/tenants/${body.tenantId}/environments/${newEnv.id}`)
        .set('Cookie', sessionCookie!)
        .expect(204);

      // Verify environment is deleted
      const db = getDbClient();
      const environment = await db('environment').where('id', newEnv.id).first();
      expect(environment).toBeUndefined();
    });

    it('should return 401 without authentication', async () => {
      const { body, sessionCookie } = await createTenantWithSession();
      const newEnv = await createAdditionalEnvironment(body.tenantId, sessionCookie!);

      await request(app.getHttpServer())
        .delete(`${API_PREFIX}/tenants/${body.tenantId}/environments/${newEnv.id}`)
        .expect(401);
    });
  });

  describe('PATCH /tenants/:tenantId/environments/:environmentId/custom-property', () => {
    it('should set a custom property', async () => {
      const { body, sessionCookie } = await createTenantWithSession();
      const newEnv = await createAdditionalEnvironment(body.tenantId, sessionCookie!);

      await request(app.getHttpServer())
        .patch(`${API_PREFIX}/tenants/${body.tenantId}/environments/${newEnv.id}/custom-property`)
        .set('Cookie', sessionCookie!)
        .send({ max_users: 100 })
        .expect(200);

      // Verify the property was set
      const getResponse = await request(app.getHttpServer())
        .get(`${API_PREFIX}/tenants/${body.tenantId}/environments/${newEnv.id}`)
        .set('Cookie', sessionCookie!)
        .expect(200);

      expect(getResponse.body.customProperties).toHaveProperty('max_users', 100);
    });

    it('should update an existing custom property', async () => {
      const { body, sessionCookie } = await createTenantWithSession();
      const newEnv = await createAdditionalEnvironment(body.tenantId, sessionCookie!, {
        customProperties: { max_users: 50 },
      });

      await request(app.getHttpServer())
        .patch(`${API_PREFIX}/tenants/${body.tenantId}/environments/${newEnv.id}/custom-property`)
        .set('Cookie', sessionCookie!)
        .send({ max_users: 200 })
        .expect(200);

      const getResponse = await request(app.getHttpServer())
        .get(`${API_PREFIX}/tenants/${body.tenantId}/environments/${newEnv.id}`)
        .set('Cookie', sessionCookie!)
        .expect(200);

      expect(getResponse.body.customProperties).toHaveProperty('max_users', 200);
    });

    it('should return 401 without authentication', async () => {
      const { body, sessionCookie } = await createTenantWithSession();
      const newEnv = await createAdditionalEnvironment(body.tenantId, sessionCookie!);

      await request(app.getHttpServer())
        .patch(`${API_PREFIX}/tenants/${body.tenantId}/environments/${newEnv.id}/custom-property`)
        .send({ max_users: 100 })
        .expect(401);
    });
  });

  describe('DELETE /tenants/:tenantId/environments/:environmentId/custom-property', () => {
    it('should delete a custom property', async () => {
      const { body, sessionCookie } = await createTenantWithSession();
      const newEnv = await createAdditionalEnvironment(body.tenantId, sessionCookie!, {
        customProperties: { max_users: 100, tier: 'premium' },
      });

      await request(app.getHttpServer())
        .delete(`${API_PREFIX}/tenants/${body.tenantId}/environments/${newEnv.id}/custom-property`)
        .set('Cookie', sessionCookie!)
        .send({ customProperty: 'max_users' })
        .expect(204);

      const getResponse = await request(app.getHttpServer())
        .get(`${API_PREFIX}/tenants/${body.tenantId}/environments/${newEnv.id}`)
        .set('Cookie', sessionCookie!)
        .expect(200);

      expect(getResponse.body.customProperties).not.toHaveProperty('max_users');
      expect(getResponse.body.customProperties).toHaveProperty('tier', 'premium');
    });

    it('should return 401 without authentication', async () => {
      const { body, sessionCookie } = await createTenantWithSession();
      const newEnv = await createAdditionalEnvironment(body.tenantId, sessionCookie!);

      await request(app.getHttpServer())
        .delete(`${API_PREFIX}/tenants/${body.tenantId}/environments/${newEnv.id}/custom-property`)
        .send({ customProperty: 'max_users' })
        .expect(401);
    });
  });
});
