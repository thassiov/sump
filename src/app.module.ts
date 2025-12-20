import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { randomUUID } from 'crypto';
import { DatabaseModule } from './common/database/database.module';

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
    // Domain modules will be added here as we migrate them
    // TenantModule,
    // AccountModule,
    // TenantEnvironmentModule,
    // TenantEnvironmentAccountModule,
  ],
})
export class AppModule {}
