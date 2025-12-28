import { ModuleMetadata } from '@nestjs/common';
import { SumpAuthConfig } from './auth-config.schema';

/**
 * Options for async configuration of SumpAuthModule
 */
interface SumpAuthAsyncConfig extends Pick<ModuleMetadata, 'imports'> {
  /**
   * Dependencies to inject into the factory function
   */
  inject?: any[];

  /**
   * Factory function that returns the auth configuration
   * Can be async to support loading from external sources (Vault, etc.)
   */
  useFactory: (...args: any[]) => Promise<SumpAuthConfig> | SumpAuthConfig;
}

/**
 * Injection token for auth configuration
 */
const AUTH_CONFIG = 'SUMP_AUTH_CONFIG';

export { AUTH_CONFIG };
export type { SumpAuthAsyncConfig };
