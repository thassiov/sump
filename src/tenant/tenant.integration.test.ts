import { INestApplication } from '@nestjs/common';
import {
  createTestApp,
  cleanDatabase,
  closeTestApp,
  request,
  getDbClient,
} from '../test';

describe('Tenant Endpoints (Integration)', () => {
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

  // Helper to create a tenant and get the session cookie
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

  describe('POST /tenants', () => {
    it('should create a tenant with owner account and default environment', async () => {
      const payload = {
        tenant: { name: 'My Company' },
        account: {
          email: 'admin@mycompany.com',
          name: 'Admin User',
          username: 'adminuser',
          password: 'SecurePassword123!',
        },
        environment: { name: 'production' },
      };

      const response = await request(app.getHttpServer())
        .post(`${API_PREFIX}/tenants`)
        .send(payload)
        .expect(201);

      expect(response.body).toHaveProperty('tenantId');
      expect(response.body).toHaveProperty('accountId');
      expect(response.body).toHaveProperty('environmentId');
      expect(response.body).toHaveProperty('session');
      expect(response.body.session).toHaveProperty('id');

      // Should set session cookie
      const cookies = response.headers['set-cookie'] as string[] | undefined;
      expect(cookies).toBeDefined();
      expect(cookies?.some((c: string) => c.startsWith('sump_session='))).toBe(true);
    });

    it('should create a tenant with custom properties', async () => {
      const payload = {
        tenant: {
          name: 'Custom Props Tenant',
          customProperties: { plan: 'enterprise', region: 'us-east' },
        },
        account: {
          email: 'owner@custom.com',
          name: 'Owner',
          username: 'customowner',
          password: 'SecurePassword123!',
        },
      };

      const response = await request(app.getHttpServer())
        .post(`${API_PREFIX}/tenants`)
        .send(payload)
        .expect(201);

      expect(response.body).toHaveProperty('tenantId');
    });

    it('should create a default environment when not specified', async () => {
      const payload = {
        tenant: { name: 'No Env Tenant' },
        account: {
          email: 'owner@noenv.com',
          name: 'Owner',
          username: 'noenvowner',
          password: 'SecurePassword123!',
        },
      };

      const response = await request(app.getHttpServer())
        .post(`${API_PREFIX}/tenants`)
        .send(payload)
        .expect(201);

      expect(response.body).toHaveProperty('environmentId');
    });

    // TODO: Password validation not implemented at controller level
    // Currently the password is hashed without checking strength
    it.skip('should reject weak passwords', async () => {
      const payload = {
        tenant: { name: 'Weak Pass Tenant' },
        account: {
          email: 'owner@weak.com',
          name: 'Owner',
          username: 'weakowner',
          password: '123', // Too weak
        },
      };

      await request(app.getHttpServer())
        .post(`${API_PREFIX}/tenants`)
        .send(payload)
        .expect(400);
    });

    it('should reject duplicate email in different tenant creation', async () => {
      const payload1 = {
        tenant: { name: 'Tenant 1' },
        account: {
          email: 'duplicate@test.com',
          name: 'Owner 1',
          username: 'owner1',
          password: 'SecurePassword123!',
        },
      };

      await request(app.getHttpServer())
        .post(`${API_PREFIX}/tenants`)
        .send(payload1)
        .expect(201);

      const payload2 = {
        tenant: { name: 'Tenant 2' },
        account: {
          email: 'duplicate@test.com', // Same email
          name: 'Owner 2',
          username: 'owner2',
          password: 'SecurePassword123!',
        },
      };

      await request(app.getHttpServer())
        .post(`${API_PREFIX}/tenants`)
        .send(payload2)
        .expect(409);
    });

    it('should reject missing required fields', async () => {
      // Missing tenant name
      await request(app.getHttpServer())
        .post(`${API_PREFIX}/tenants`)
        .send({
          tenant: {},
          account: {
            email: 'owner@test.com',
            name: 'Owner',
            username: 'owner',
            password: 'SecurePassword123!',
          },
        })
        .expect(400);

      // Missing account
      await request(app.getHttpServer())
        .post(`${API_PREFIX}/tenants`)
        .send({
          tenant: { name: 'Test' },
        })
        .expect(400);
    });
  });

  describe('GET /tenants/:tenantId', () => {
    it('should get tenant by ID with authentication', async () => {
      const { body, sessionCookie } = await createTenantWithSession();

      const response = await request(app.getHttpServer())
        .get(`${API_PREFIX}/tenants/${body.tenantId}`)
        .set('Cookie', sessionCookie!)
        .expect(200);

      expect(response.body).toHaveProperty('id', body.tenantId);
      expect(response.body).toHaveProperty('name', 'Test Tenant');
      expect(response.body).toHaveProperty('customProperties');
      expect(response.body).toHaveProperty('environments');
      expect(response.body.environments).toHaveLength(1);
      expect(response.body.environments[0]).toHaveProperty('name', 'production');
    });

    it('should return 401 without authentication', async () => {
      const { body } = await createTenantWithSession();

      await request(app.getHttpServer())
        .get(`${API_PREFIX}/tenants/${body.tenantId}`)
        .expect(401);
    });

    it('should return 403 for tenant user does not have access to', async () => {
      const { sessionCookie } = await createTenantWithSession();
      const fakeId = '00000000-0000-0000-0000-000000000000';

      // User session is for a different tenant, so they can't access this one
      // Returns 403 (not 404) to avoid leaking tenant existence
      await request(app.getHttpServer())
        .get(`${API_PREFIX}/tenants/${fakeId}`)
        .set('Cookie', sessionCookie!)
        .expect(403);
    });
  });

  describe('PATCH /tenants/:tenantId', () => {
    it('should update tenant name', async () => {
      const { body, sessionCookie } = await createTenantWithSession();

      await request(app.getHttpServer())
        .patch(`${API_PREFIX}/tenants/${body.tenantId}`)
        .set('Cookie', sessionCookie!)
        .send({ name: 'Updated Tenant Name' })
        .expect(200);

      // Verify the update
      const getResponse = await request(app.getHttpServer())
        .get(`${API_PREFIX}/tenants/${body.tenantId}`)
        .set('Cookie', sessionCookie!)
        .expect(200);

      expect(getResponse.body.name).toBe('Updated Tenant Name');
    });

    it('should return 401 without authentication', async () => {
      const { body } = await createTenantWithSession();

      await request(app.getHttpServer())
        .patch(`${API_PREFIX}/tenants/${body.tenantId}`)
        .send({ name: 'New Name' })
        .expect(401);
    });
  });

  describe('DELETE /tenants/:tenantId', () => {
    it('should delete tenant and cascade to related entities', async () => {
      const { body, sessionCookie } = await createTenantWithSession();

      await request(app.getHttpServer())
        .delete(`${API_PREFIX}/tenants/${body.tenantId}`)
        .set('Cookie', sessionCookie!)
        .expect(204);

      // Verify tenant is deleted - need to create new session since old one is invalid
      const db = getDbClient();
      const tenant = await db('tenant').where('id', body.tenantId).first();
      expect(tenant).toBeUndefined();

      // Verify related entities are also deleted
      const account = await db('tenant_account').where('id', body.accountId).first();
      expect(account).toBeUndefined();

      const environment = await db('environment').where('id', body.environmentId).first();
      expect(environment).toBeUndefined();
    });

    it('should return 401 without authentication', async () => {
      const { body } = await createTenantWithSession();

      await request(app.getHttpServer())
        .delete(`${API_PREFIX}/tenants/${body.tenantId}`)
        .expect(401);
    });
  });

  describe('GET /tenants/:tenantId/accounts', () => {
    it('should list tenant accounts', async () => {
      const { body, sessionCookie } = await createTenantWithSession();

      const response = await request(app.getHttpServer())
        .get(`${API_PREFIX}/tenants/${body.tenantId}/accounts`)
        .set('Cookie', sessionCookie!)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toHaveProperty('id', body.accountId);
      expect(response.body[0]).toHaveProperty('email', 'owner@test.com');
      expect(response.body[0]).toHaveProperty('roles');
    });

    it('should return 401 without authentication', async () => {
      const { body } = await createTenantWithSession();

      await request(app.getHttpServer())
        .get(`${API_PREFIX}/tenants/${body.tenantId}/accounts`)
        .expect(401);
    });
  });

  describe('PATCH /tenants/:tenantId/custom-property', () => {
    it('should set a custom property', async () => {
      const { body, sessionCookie } = await createTenantWithSession();

      await request(app.getHttpServer())
        .patch(`${API_PREFIX}/tenants/${body.tenantId}/custom-property`)
        .set('Cookie', sessionCookie!)
        .send({ plan: 'premium' })
        .expect(200);

      // Verify the property was set
      const getResponse = await request(app.getHttpServer())
        .get(`${API_PREFIX}/tenants/${body.tenantId}`)
        .set('Cookie', sessionCookie!)
        .expect(200);

      expect(getResponse.body.customProperties).toHaveProperty('plan', 'premium');
    });

    it('should update an existing custom property', async () => {
      const { body, sessionCookie } = await createTenantWithSession({
        tenant: {
          name: 'Test Tenant',
          customProperties: { plan: 'basic' },
        },
      });

      await request(app.getHttpServer())
        .patch(`${API_PREFIX}/tenants/${body.tenantId}/custom-property`)
        .set('Cookie', sessionCookie!)
        .send({ plan: 'enterprise' })
        .expect(200);

      const getResponse = await request(app.getHttpServer())
        .get(`${API_PREFIX}/tenants/${body.tenantId}`)
        .set('Cookie', sessionCookie!)
        .expect(200);

      expect(getResponse.body.customProperties).toHaveProperty('plan', 'enterprise');
    });
  });

  describe('DELETE /tenants/:tenantId/custom-property', () => {
    it('should delete a custom property', async () => {
      const { body, sessionCookie } = await createTenantWithSession({
        tenant: {
          name: 'Test Tenant',
          customProperties: { plan: 'basic', region: 'us-east' },
        },
      });

      await request(app.getHttpServer())
        .delete(`${API_PREFIX}/tenants/${body.tenantId}/custom-property`)
        .set('Cookie', sessionCookie!)
        .send({ customProperty: 'plan' })
        .expect(204);

      const getResponse = await request(app.getHttpServer())
        .get(`${API_PREFIX}/tenants/${body.tenantId}`)
        .set('Cookie', sessionCookie!)
        .expect(200);

      expect(getResponse.body.customProperties).not.toHaveProperty('plan');
      expect(getResponse.body.customProperties).toHaveProperty('region', 'us-east');
    });
  });
});
