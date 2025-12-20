import { setupLogger } from '../logger';
import { SumpConfig, sumpConfigSchema } from '../types';
import { parseCliFlags } from '../utils/cli-args-reader';
import { formatZodError } from '../utils/formatters';
import { readJsonFile } from '../utils/fs-operations';

const repository = {
  tenantAccount: {
    tableName: 'tenant_account',
  },
  tenant: {
    tableName: 'tenant',
  },
  environment: {
    tableName: 'environment',
  },
  environmentAccount: {
    tableName: 'environment_account',
  },
};

// @NOTE: this needs a better name because it is confusing to have it when
//  we already have the internalConfigs
async function configLoader(sumpConfig?: object): Promise<SumpConfig> {
  const logger = setupLogger('config-loader');
  const argsFromCli = parseCliFlags(process.argv);
  let config;

  if (sumpConfig) {
    // NOTE: i believe this deserves a better message...
    logger.info('Reading config provided as function argument');
    config = sumpConfig;
  } else if (
    argsFromCli['config'] &&
    typeof argsFromCli['config'] == 'string'
  ) {
    logger.info('Reading config from config file');
    config = await readJsonFile(argsFromCli['config']);
  } else {
    logger.error('No config provided. Exiting...');
    process.exit(1);
  }

  const validationResult = sumpConfigSchema.safeParse(config);

  if (!validationResult.success) {
    const errors = formatZodError(validationResult.error.issues);
    logger.error('The provided config contain errors', errors);
    process.exit(1);
  }

  return config as SumpConfig;
}

const internalConfigs = {
  repository,
};

export { configLoader, internalConfigs };
