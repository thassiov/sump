import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import knex, { Knex } from 'knex';
import knexStringcase from 'knex-stringcase';
import path from 'path';

export const DATABASE_CLIENT = 'DATABASE_CLIENT';

@Global()
@Module({
  providers: [
    {
      provide: DATABASE_CLIENT,
      inject: [ConfigService],
      useFactory: (configService: ConfigService): Knex => {
        const migrationsDir = path.resolve(
          __dirname,
          '../../infra/database/postgres/migrations'
        );

        const opts = {
          ...knexStringcase(),
          client: 'pg',
          migrations: {
            directory: migrationsDir,
            tableName: 'migrations',
            extension: 'ts',
          },
          connection: {
            host: configService.getOrThrow<string>('DB_HOST'),
            port: configService.getOrThrow<string>('DB_PORT'),
            user: configService.getOrThrow<string>('DB_USER'),
            password: configService.getOrThrow<string>('DB_PASSWORD'),
            database: configService.getOrThrow<string>('DB_NAME'),
          },
        };

        return knex(opts as Knex.Config);
      },
    },
  ],
  exports: [DATABASE_CLIENT],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class DatabaseModule {}
