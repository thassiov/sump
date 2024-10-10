import pino from 'pino';

const serverLogger = pino();

export const logger = {
  info: (...args: unknown[]) => {
    serverLogger.info(args);
  },
  debug: (...args: unknown[]) => {
    serverLogger.debug(args);
  },
  warn: (...args: unknown[]) => {
    serverLogger.warn(args);
  },
  error: (...args: unknown[]) => {
    serverLogger.error(args);
  },
};
