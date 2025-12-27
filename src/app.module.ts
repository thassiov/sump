import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { randomUUID } from 'crypto';
import { DatabaseModule } from './common/database/database.module';
import { HealthModule } from './health/health.module';
import { TenantModule } from './tenant/tenant.module';
import { TenantAccountModule } from './tenant-account/tenant-account.module';
import { EnvironmentModule } from './environment/environment.module';
import { EnvironmentAccountModule } from './environment-account/environment-account.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule.forRoot({
      pinoHttp:
        process.env['NODE_ENV'] !== 'production'
          ? {
              genReqId: (req) => {
                const requestId = req.headers['x-request-id'];
                return (Array.isArray(requestId) ? requestId[0] : requestId) ?? randomUUID();
              },
              transport: { target: 'pino-pretty' },
            }
          : {
              genReqId: (req) => {
                const requestId = req.headers['x-request-id'];
                return (Array.isArray(requestId) ? requestId[0] : requestId) ?? randomUUID();
              },
            },
    }),
    DatabaseModule,
    HealthModule,
    TenantModule,
    TenantAccountModule,
    EnvironmentModule,
    EnvironmentAccountModule,
  ],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class AppModule {}
