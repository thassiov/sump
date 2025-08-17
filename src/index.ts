import { configLoader } from './lib/config';
import { setupLogger } from './lib/logger/logger';

const logger = setupLogger('sump-bootstrap');

async function bootstrap(sumpConfig?: object) {
  logger.info('Starting bootstrap process');
  const config = await configLoader(sumpConfig);

  console.log(config);
}

(async () => {
  await bootstrap();
})().catch(logger.error);
