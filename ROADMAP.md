# SUMP Roadmap

This document tracks planned features, improvements, and technical debt for the project.

## Legend

- [ ] Not started
- [x] Completed
- [~] In progress

---

## 1. Testing

### 1.1 Integration Tests
- [ ] Tenant endpoints (create, get, update, delete, custom properties)
- [ ] Tenant Account endpoints (create, get, update, delete, sensitive fields)
- [ ] Environment endpoints (create, get, update, delete, custom properties)
- [ ] Environment Account endpoints (create, get, update, delete, sensitive fields, custom properties)
- [ ] Full scenario tests (tenant creation with account and environment)
- [ ] Error handling and edge cases

### 1.2 Unit Tests
- [x] Repositories (TenantRepository, TenantAccountRepository, EnvironmentRepository, EnvironmentAccountRepository)
- [x] Services (TenantService, TenantAccountService, EnvironmentService, EnvironmentAccountService)
- [x] Use Cases (TenantUseCase, TenantAccountUseCase, EnvironmentUseCase, EnvironmentAccountUseCase)
- [x] Custom error classes
- [x] Validators and DTOs (Zod schemas for all entities)

---

## 2. API Request Scripts

### 2.1 Individual Endpoint Scripts
- [x] Tenant CRUD operations
- [x] Tenant Account CRUD operations
- [x] Environment CRUD operations
- [x] Environment Account CRUD operations

### 2.2 Scenario Scripts (End-to-End Flows)
- [ ] Create tenant with owner account and default environment
- [ ] Create tenant, add environment, add users to environment
- [ ] Full user lifecycle (create, update fields, update sensitive fields, delete)
- [ ] Custom properties management flow

### 2.3 Format Options
- [x] curl scripts (shell)
- [x] Hurl files (for CI/CD integration)
- [ ] Postman/Bruno collection (for GUI-based testing)

---

## 3. Documentation

### 3.1 Code Documentation
- [ ] Document all repository classes and methods
- [ ] Document all service classes and methods
- [ ] Document all use case classes and methods
- [ ] Document controllers/endpoints
- [ ] Document DTOs and type definitions
- [ ] Document custom error classes

### 3.2 API Documentation
- [ ] Update OpenAPI specification (openapi.yaml)
- [ ] Add request/response examples
- [ ] Document error responses

### 3.3 Project Documentation
- [ ] Architecture overview
- [ ] Database schema documentation
- [ ] Development setup guide
- [ ] Deployment guide
- [ ] Update README.md with accurate usage modes (standalone vs SDK)

---

## 4. Authentication & Authorization

Custom authentication using bcrypt for password hashing and signed cookies for sessions.

### 4.1 Tenant Authentication
- [x] Password hashing (bcrypt)
- [x] Session management (signed cookies)
- [x] Tenant admin login (`POST /auth/tenants/:tenantId/login`)
- [x] Tenant admin signup (via `POST /tenants` - creates owner account)
- [x] Tenant admin logout (`POST /auth/tenants/:tenantId/logout`)
- [x] Session validation (`GET /auth/tenants/:tenantId/session`)
- [x] List sessions (`GET /auth/tenants/:tenantId/sessions`)
- [x] Logout all sessions (`POST /auth/tenants/:tenantId/logout-all`)
- [~] Tenant password reset flow (in progress)

### 4.2 Environment Authentication
- [x] Environment user login (`POST /auth/environments/:envId/login`)
- [x] Environment user signup (`POST /auth/environments/:envId/signup`)
- [x] Environment user logout (`POST /auth/environments/:envId/logout`)
- [x] Session validation (`GET /auth/environments/:envId/session`)
- [x] List sessions (`GET /auth/environments/:envId/sessions`)
- [x] Logout all sessions (`POST /auth/environments/:envId/logout-all`)
- [~] Environment password reset flow (in progress)

### 4.3 Authorization (RBAC)
- [x] Role-based access control (owner, admin, user)
- [x] AuthGuard - validates session, attaches account to request
- [x] RolesGuard - checks roles against route requirements
- [x] @RequireRoles decorator for route protection
- [x] @TenantResource / @EnvironmentResource context decorators
- [x] @SelfOnly / @AllowOwner for self-service endpoints
- [x] @CurrentSession / @CurrentAccount parameter decorators
- [x] Account disable/enable functionality

### 4.4 OpenID Connect (OIDC) - Deferred
- [ ] OIDC Provider implementation (sump as identity provider)
- [ ] Authorization endpoint
- [ ] Token endpoint
- [ ] UserInfo endpoint
- [ ] JWKS endpoint
- [ ] Discovery endpoint (`.well-known/openid-configuration`)
- [ ] Support for authorization code flow
- [ ] Support for PKCE
- [ ] Client application registration and management
- [ ] Scope and claims configuration per environment

### 4.5 Social/External Providers (OAuth) - Deferred
- [ ] Google OAuth
- [ ] GitHub OAuth
- [ ] Other providers as needed

---

## 5. Frontend (Admin Dashboard)

A simple admin dashboard built with shadcn/ui for managing tenants and environments.

### 5.1 Core Features
- [ ] Project setup (React/Next.js + shadcn/ui)
- [ ] Authentication UI (login, signup, password reset)
- [ ] Dashboard layout and navigation

### 5.2 Tenant Management
- [ ] List tenants
- [ ] Create tenant
- [ ] View/edit tenant details
- [ ] Manage tenant custom properties
- [ ] Delete tenant

### 5.3 Tenant Account Management
- [ ] List tenant accounts
- [ ] Create tenant account
- [ ] View/edit account details
- [ ] Manage account roles
- [ ] Delete account

### 5.4 Environment Management
- [ ] List environments per tenant
- [ ] Create environment
- [ ] View/edit environment details
- [ ] Manage environment custom properties
- [ ] Delete environment

### 5.5 Environment Account Management
- [ ] List accounts per environment
- [ ] Create environment account
- [ ] View/edit account details
- [ ] Manage account custom properties
- [ ] Delete account

### 5.6 OIDC Client Management
- [ ] List registered OAuth/OIDC clients
- [ ] Register new client application
- [ ] View/edit client settings (redirect URIs, scopes, etc.)
- [ ] Regenerate client secrets
- [ ] Delete client

---

## 6. Distribution Modes

SUMP should support two usage modes:

### 6.1 Standalone Server Mode
Run as an independent service that applications connect to via REST API.

- [ ] CLI for starting the server (`sump serve` or `sump -c config.json`)
- [ ] Docker image with all dependencies
- [ ] Configuration via environment variables and/or config file
- [ ] Database connection management
- [ ] Graceful shutdown handling

### 6.2 SDK/Library Mode
Import and use programmatically within other Node.js applications.

```typescript
import { Sump } from 'sump';

const sump = new Sump({ database: { ... } });

// Use services directly
const tenant = await sump.tenants.create({ name: 'My Tenant', ... });
const account = await sump.accounts.create({ tenantId: tenant.id, ... });
```

- [ ] Clean public API surface
- [ ] Export core services for direct usage
- [ ] TypeScript types for all public interfaces
- [ ] Configuration options for embedded usage
- [ ] Optional: middleware/plugin system for framework integration (Express, Fastify, NestJS)

---

## 7. Pending Features (Legacy)

### 7.1 Tenant Account Endpoints
- [ ] Update role (with owner check - prevent removing last owner)

### 7.2 Environment Endpoints
- [ ] List accounts by tenant environment ID

### 7.3 Environment Account Endpoints
- [ ] List accounts by tenant environment ID (support for environment)

---

## 8. Technical Improvements

### 8.1 Code Quality
- [x] Fix all linting errors
- [x] Remove legacy bootstrap code (old index.ts with manual DI)
- [x] Remove legacy Express endpoint files (migrate fully to NestJS controllers)
- [ ] Clean up unused code and dependencies

### 8.2 Infrastructure
- [x] Add health check endpoint
- [ ] Add metrics/observability
- [ ] Database migrations versioning strategy
- [ ] CI/CD pipeline setup

---

## Notes

- Priority should be given to testing before adding new features
- Authentication (better-auth) integration should come after core CRUD is stable and tested
- Frontend development can happen in parallel with backend auth work
- The SDK mode requires careful API design to ensure clean separation of concerns
