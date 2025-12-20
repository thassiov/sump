# NestJS Migration Sketch for Sump

## Proposed Directory Structure

```
src/
├── main.ts                          # NestJS bootstrap
├── app.module.ts                    # Root module
├── common/                          # Shared (replaces lib/)
│   ├── common.module.ts
│   ├── config/
│   │   ├── config.module.ts
│   │   ├── config.service.ts        # Wraps @nestjs/config
│   │   └── config.schema.ts         # Keep your Zod schema
│   ├── database/
│   │   ├── database.module.ts
│   │   └── database.provider.ts     # Knex client provider
│   ├── errors/
│   │   ├── base-custom-error.ts     # Keep existing
│   │   ├── validation.error.ts
│   │   ├── not-found.error.ts
│   │   ├── conflict.error.ts
│   │   └── ...                      # Keep all existing errors
│   ├── filters/
│   │   └── http-exception.filter.ts # Global exception filter
│   ├── logger/
│   │   ├── logger.module.ts
│   │   └── logger.service.ts        # Wraps Pino
│   └── contexts/
│       └── index.ts                 # Keep existing contexts
│
├── tenant/
│   ├── tenant.module.ts
│   ├── tenant.controller.ts         # Replaces endpoint factory
│   ├── tenant.use-case.ts           # Keep existing logic
│   ├── tenant.service.ts            # Keep existing
│   ├── tenant.repository.ts         # Keep existing
│   └── dto/
│       ├── create-tenant.dto.ts
│       └── update-tenant.dto.ts
│
├── account/
│   ├── account.module.ts
│   ├── account.controller.ts
│   ├── account.use-case.ts
│   ├── account.service.ts
│   ├── account.repository.ts
│   └── dto/
│       └── ...
│
├── tenant-environment/
│   ├── tenant-environment.module.ts
│   ├── tenant-environment.controller.ts
│   ├── tenant-environment.use-case.ts
│   ├── tenant-environment.service.ts
│   ├── tenant-environment.repository.ts
│   └── dto/
│       └── ...
│
└── tenant-environment-account/
    ├── tenant-environment-account.module.ts
    ├── tenant-environment-account.controller.ts
    ├── tenant-environment-account.use-case.ts
    ├── tenant-environment-account.service.ts
    ├── tenant-environment-account.repository.ts
    └── dto/
        └── ...
```

---

## Key File Examples

### main.ts (replaces src/index.ts)

```typescript
import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // Use Pino logger
  app.useLogger(app.get(Logger));

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global prefix for API versioning
  app.setGlobalPrefix('v1');

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Sump API')
    .setDescription('Simple User Management Platform')
    .setVersion('0.1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```

### app.module.ts

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { CommonModule } from './common/common.module';
import { TenantModule } from './tenant/tenant.module';
import { AccountModule } from './account/account.module';
import { TenantEnvironmentModule } from './tenant-environment/tenant-environment.module';
import { TenantEnvironmentAccountModule } from './tenant-environment-account/tenant-environment-account.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule.forRoot({
      pinoHttp: {
        genReqId: (req) => req.headers['x-request-id'] ?? randomUUID(),
        transport: process.env.NODE_ENV !== 'production'
          ? { target: 'pino-pretty' }
          : undefined,
      },
    }),
    CommonModule,
    TenantModule,
    AccountModule,
    TenantEnvironmentModule,
    TenantEnvironmentAccountModule,
  ],
})
export class AppModule {}
```

### common/database/database.module.ts

```typescript
import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import knex, { Knex } from 'knex';
import knexStringcase from 'knex-stringcase';

export const DATABASE_CLIENT = 'DATABASE_CLIENT';

@Global()
@Module({
  providers: [
    {
      provide: DATABASE_CLIENT,
      inject: [ConfigService],
      useFactory: (configService: ConfigService): Knex => {
        const config = {
          client: 'pg',
          connection: {
            host: configService.get('DB_HOST'),
            port: configService.get('DB_PORT'),
            user: configService.get('DB_USER'),
            password: configService.get('DB_PASSWORD'),
            database: configService.get('DB_NAME'),
          },
          pool: { min: 2, max: 10 },
        };
        return knex(knexStringcase(config));
      },
    },
  ],
  exports: [DATABASE_CLIENT],
})
export class DatabaseModule {}
```

### common/filters/http-exception.filter.ts

```typescript
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import {
  ValidationError,
  NotFoundError,
  ConflictError,
  PermissionError,
} from '../errors';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let body: object = { message: 'Internal server error' };

    if (exception instanceof ValidationError) {
      status = HttpStatus.BAD_REQUEST;
      body = {
        message: 'Validation failed',
        errors: exception.details?.errors,
      };
    } else if (exception instanceof NotFoundError) {
      status = HttpStatus.NOT_FOUND;
      body = {
        message: 'Resource not found',
        context: exception.context,
      };
    } else if (exception instanceof ConflictError) {
      status = HttpStatus.CONFLICT;
      body = {
        message: 'Conflict',
        errors: exception.details?.errors,
      };
    } else if (exception instanceof PermissionError) {
      status = HttpStatus.FORBIDDEN;
      body = { message: 'Permission denied' };
    }

    response.status(status).json(body);
  }
}
```

### tenant/tenant.module.ts

```typescript
import { Module } from '@nestjs/common';
import { TenantController } from './tenant.controller';
import { TenantUseCase } from './tenant.use-case';
import { TenantService } from './tenant.service';
import { TenantRepository } from './tenant.repository';
import { AccountModule } from '../account/account.module';
import { TenantEnvironmentModule } from '../tenant-environment/tenant-environment.module';

@Module({
  imports: [
    AccountModule,           // For AccountService dependency
    TenantEnvironmentModule, // For TenantEnvironmentService dependency
  ],
  controllers: [TenantController],
  providers: [
    TenantUseCase,
    TenantService,
    TenantRepository,
  ],
  exports: [TenantService], // Export for other modules if needed
})
export class TenantModule {}
```

### tenant/tenant.controller.ts

```typescript
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TenantUseCase } from './tenant.use-case';
import { CreateNewTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';

@ApiTags('Tenants')
@Controller('tenants')
export class TenantController {
  constructor(private readonly tenantUseCase: TenantUseCase) {}

  @Post()
  @ApiOperation({ summary: 'Create a new tenant with initial account and environment' })
  @ApiResponse({ status: 201, description: 'Tenant created successfully' })
  async createTenant(@Body() dto: CreateNewTenantDto) {
    return this.tenantUseCase.createNewTenant(dto);
  }

  @Get(':tenantId')
  @ApiOperation({ summary: 'Get tenant by ID' })
  @ApiResponse({ status: 200, description: 'Tenant found' })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  async getTenantById(@Param('tenantId') tenantId: string) {
    return this.tenantUseCase.getTenantById(tenantId);
  }

  @Delete(':tenantId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete tenant by ID' })
  async deleteTenantById(@Param('tenantId') tenantId: string) {
    return this.tenantUseCase.deleteTenantById(tenantId);
  }

  @Patch(':tenantId')
  @ApiOperation({ summary: 'Update tenant non-sensitive properties' })
  async updateTenant(
    @Param('tenantId') tenantId: string,
    @Body() dto: UpdateTenantDto,
  ) {
    return this.tenantUseCase.updateNonSensitivePropertiesByIdUseCase(tenantId, dto);
  }

  @Get(':tenantId/accounts')
  @ApiOperation({ summary: 'Get all accounts for a tenant' })
  async getAccountsByTenantId(@Param('tenantId') tenantId: string) {
    return this.tenantUseCase.getAccountsByTenantId(tenantId);
  }

  @Patch(':tenantId/custom-property')
  @ApiOperation({ summary: 'Set custom property on tenant' })
  async setCustomProperty(
    @Param('tenantId') tenantId: string,
    @Body() customProperty: Record<string, unknown>,
  ) {
    return this.tenantUseCase.setCustomPropertyByTenantIdUseCase(tenantId, customProperty);
  }

  @Delete(':tenantId/custom-property')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete custom property from tenant' })
  async deleteCustomProperty(
    @Param('tenantId') tenantId: string,
    @Body('customProperty') customPropertyKey: string,
  ) {
    return this.tenantUseCase.deleteCustomPropertyByTenantIdUseCase(tenantId, customPropertyKey);
  }
}
```

### tenant/tenant.repository.ts (minimal changes)

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { Knex } from 'knex';
import { DATABASE_CLIENT } from '../common/database/database.module';
// ... rest of imports stay the same

@Injectable()  // <-- Add this decorator
export class TenantRepository {
  private readonly tableName = 'tenant';

  constructor(
    @Inject(DATABASE_CLIENT) private readonly dbClient: Knex,  // <-- Change this
  ) {}

  // ... ALL existing methods stay EXACTLY the same
  // No changes to business logic needed
}
```

### tenant/tenant.service.ts (minimal changes)

```typescript
import { Injectable } from '@nestjs/common';
// ... rest of imports stay the same

@Injectable()  // <-- Add this decorator
export class TenantService {
  constructor(
    private readonly tenantRepository: TenantRepository,  // <-- NestJS injects automatically
  ) {}

  // ... ALL existing methods stay EXACTLY the same
}
```

### tenant/tenant.use-case.ts (minimal changes)

```typescript
import { Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
// ... rest of imports

@Injectable()  // <-- Add this decorator
export class TenantUseCase {
  constructor(
    @InjectPinoLogger(TenantUseCase.name)
    private readonly logger: PinoLogger,
    private readonly tenantService: TenantService,
    private readonly accountService: AccountService,
    private readonly tenantEnvironmentService: TenantEnvironmentService,
  ) {}

  // ... ALL existing methods stay EXACTLY the same
  // Just replace this.logger calls if using nestjs-pino
}
```

---

## Validation Options

### Option A: Keep Zod (using nestjs-zod)

```typescript
// dto/create-tenant.dto.ts
import { createZodDto } from 'nestjs-zod';
import { createNewTenantUseCaseDtoSchema } from './schemas';

export class CreateNewTenantDto extends createZodDto(createNewTenantUseCaseDtoSchema) {}
```

```typescript
// main.ts - add validation pipe
import { ZodValidationPipe } from 'nestjs-zod';
app.useGlobalPipes(new ZodValidationPipe());
```

### Option B: Migrate to class-validator

```typescript
// dto/create-tenant.dto.ts
import { IsString, IsOptional, ValidateNested, IsEmail } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class TenantDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  customProperties?: Record<string, unknown>;
}

class AccountDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  // ... etc
}

export class CreateNewTenantDto {
  @ApiProperty()
  @ValidateNested()
  @Type(() => TenantDto)
  tenant: TenantDto;

  @ApiProperty()
  @ValidateNested()
  @Type(() => AccountDto)
  account: AccountDto;

  @ApiProperty({ required: false })
  @ValidateNested()
  @IsOptional()
  @Type(() => EnvironmentDto)
  environment?: EnvironmentDto;
}
```

---

## New Dependencies

```json
{
  "dependencies": {
    "@nestjs/common": "^10.x",
    "@nestjs/core": "^10.x",
    "@nestjs/platform-express": "^10.x",
    "@nestjs/config": "^3.x",
    "@nestjs/swagger": "^7.x",
    "nestjs-pino": "^4.x",
    "nestjs-zod": "^3.x",
    "class-transformer": "^0.5.x",
    "class-validator": "^0.14.x",
    "reflect-metadata": "^0.2.x",
    "rxjs": "^7.x"
  }
}
```

Remove (replaced by NestJS equivalents):
- `express` (bundled in @nestjs/platform-express)
- `swagger-ui-express` (replaced by @nestjs/swagger)

Keep:
- `knex`, `pg`, `knex-stringcase` (database layer)
- `pino` (via nestjs-pino)
- `zod` (if using nestjs-zod)
- `helmet` (still works with NestJS)

---

## Migration Checklist

### Phase 1: Setup (Day 1)
- [ ] Install NestJS dependencies
- [ ] Create `main.ts` and `app.module.ts`
- [ ] Set up `DatabaseModule` with Knex provider
- [ ] Set up `LoggerModule` with Pino
- [ ] Create `HttpExceptionFilter`
- [ ] Verify app starts

### Phase 2: Migrate Domain Modules (Day 2-3)
- [ ] **TenantModule**
  - [ ] Add `@Injectable()` to Repository, Service, UseCase
  - [ ] Create `tenant.module.ts`
  - [ ] Create `tenant.controller.ts`
  - [ ] Test endpoints work
- [ ] **AccountModule** (same steps)
- [ ] **TenantEnvironmentModule** (same steps)
- [ ] **TenantEnvironmentAccountModule** (same steps)

### Phase 3: Polish (Day 4)
- [ ] Set up Swagger decorators on all endpoints
- [ ] Configure validation pipes (Zod or class-validator)
- [ ] Add health check endpoint (`@nestjs/terminus`)
- [ ] Test all endpoints against existing OpenAPI spec
- [ ] Update Docker configuration if needed

### Phase 4: Cleanup
- [ ] Remove old Express setup files
- [ ] Remove endpoint factory files
- [ ] Remove manual bootstrap wiring from old `index.ts`
- [ ] Update npm scripts
- [ ] Update README

---

## What You Get for Free with NestJS

1. **Authentication** - `@nestjs/passport` with guards
2. **Rate Limiting** - `@nestjs/throttler`
3. **Health Checks** - `@nestjs/terminus`
4. **Caching** - `@nestjs/cache-manager`
5. **Swagger** - Auto-generated from decorators
6. **Validation** - Global pipes with class-validator or Zod
7. **Testing** - `@nestjs/testing` with easy mocking

---

## Risk Assessment

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Knex doesn't play well with NestJS | Low | Knex works fine as a custom provider |
| Zod validation conflicts | Low | nestjs-zod is mature and well-supported |
| Breaking existing API contracts | Medium | Test against existing OpenAPI spec |
| Learning curve for decorators | Low | Your architecture is already similar |

---

## Summary

The migration is mostly mechanical:
1. Add `@Injectable()` to ~16 classes
2. Create ~5 module files
3. Convert 4 endpoint factories to controllers
4. Replace bootstrap with NestJS main.ts

**Business logic stays 95% unchanged.** The main work is rewiring how dependencies connect.
