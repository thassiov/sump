import { DynamicModule, Global, Module, Provider, forwardRef } from '@nestjs/common';
import {
  AUTH_CONFIG,
  SumpAuthAsyncConfig,
  SumpAuthConfig,
  sumpAuthConfigSchema,
} from './config';
import { TenantAuthController, EnvironmentAuthController } from './controllers';
import { AuthGuard, RolesGuard } from './guards';
import { SessionRepository, PasswordResetRepository } from './repositories';
import { AuthService, PasswordService, SessionService, PasswordResetService } from './services';
import { TenantModule } from '../tenant/tenant.module';
import { TenantAccountModule } from '../tenant-account/tenant-account.module';
import { EnvironmentModule } from '../environment/environment.module';
import { EnvironmentAccountModule } from '../environment-account/environment-account.module';

@Global()
@Module({})
export class SumpAuthModule {
  /**
   * Configure the auth module with static configuration
   *
   * @example
   * SumpAuthModule.forRoot({
   *   secret: process.env.AUTH_SECRET,
   *   session: { cookieName: 'my_app_session' },
   * })
   */
  static forRoot(config: SumpAuthConfig): DynamicModule {
    // Validate config with Zod
    const validatedConfig = sumpAuthConfigSchema.parse(config);

    const providers: Provider[] = [
      {
        provide: AUTH_CONFIG,
        useValue: validatedConfig,
      },
      ...this.createCoreProviders(),
    ];

    return {
      module: SumpAuthModule,
      imports: [
        forwardRef(() => TenantModule),
        forwardRef(() => TenantAccountModule),
        forwardRef(() => EnvironmentModule),
        forwardRef(() => EnvironmentAccountModule),
      ],
      controllers: [TenantAuthController, EnvironmentAuthController],
      providers,
      exports: this.getExports(),
    };
  }

  /**
   * Configure the auth module with async configuration
   * Useful for loading secrets from external sources (Vault, ConfigService, etc.)
   *
   * @example
   * SumpAuthModule.forRootAsync({
   *   imports: [ConfigModule],
   *   inject: [ConfigService],
   *   useFactory: (configService: ConfigService) => ({
   *     secret: configService.getOrThrow('AUTH_SECRET'),
   *     session: { cookieName: 'my_app_session' },
   *   }),
   * })
   */
  static forRootAsync(options: SumpAuthAsyncConfig): DynamicModule {
    const asyncConfigProvider: Provider = {
      provide: AUTH_CONFIG,
      inject: options.inject ?? [],
      useFactory: async (...args: any[]) => {
        const config = await options.useFactory(...args);
        return sumpAuthConfigSchema.parse(config);
      },
    };

    const providers: Provider[] = [
      asyncConfigProvider,
      ...this.createCoreProviders(),
    ];

    return {
      module: SumpAuthModule,
      imports: [
        ...(options.imports ?? []),
        forwardRef(() => TenantModule),
        forwardRef(() => TenantAccountModule),
        forwardRef(() => EnvironmentModule),
        forwardRef(() => EnvironmentAccountModule),
      ],
      controllers: [TenantAuthController, EnvironmentAuthController],
      providers,
      exports: this.getExports(),
    };
  }

  /**
   * Create core providers for the auth module
   */
  private static createCoreProviders(): Provider[] {
    return [
      // Repositories
      SessionRepository,
      PasswordResetRepository,

      // Services
      PasswordService,
      SessionService,
      AuthService,
      PasswordResetService,

      // Guards
      AuthGuard,
      RolesGuard,
    ];
  }

  /**
   * Get the list of exports for the module
   */
  private static getExports(): any[] {
    return [
      AUTH_CONFIG,

      // Services
      PasswordService,
      SessionService,
      AuthService,
      PasswordResetService,

      // Guards
      AuthGuard,
      RolesGuard,
    ];
  }
}
