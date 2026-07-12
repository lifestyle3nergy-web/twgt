import pino from 'pino';
import { env } from './env';

const transport = env.LOG_FORMAT === 'pretty'
  ? pino.transport({
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
    })
  : undefined;

export const logger = pino(
  {
    level: env.LOG_LEVEL,
    transport: env.NODE_ENV === 'development' ? transport : undefined,
  },
  env.NODE_ENV === 'development' ? undefined : pino.destination()
);
