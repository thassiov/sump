import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { randomUUID } from 'crypto';
import { DatabaseModule } from './common/database/database.module';
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
              genReqId: (req) =>
                (req.headers['x-request-id'] as string) ?? randomUUID(),
              transport: { target: 'pino-pretty' },
            }
          : {
              genReqId: (req) =>
                (req.headers['x-request-id'] as string) ?? randomUUID(),
            },
    }),
    DatabaseModule,
    TenantModule,
    TenantAccountModule,
    EnvironmentModule,
    EnvironmentAccountModule,
  ],
})
export class AppModule {}
