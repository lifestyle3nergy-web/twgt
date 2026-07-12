import { PrismaClient } from '@prisma/client';
import { logger } from '@config';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: [
      { emit: 'event', level: 'query' },
      { emit: 'event', level: 'error' },
      { emit: 'event', level: 'warn' },
    ],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Log database queries in development
if (process.env.NODE_ENV === 'development') {
  prisma.$on('query', (e: any) => {
    logger.debug({ query: e.query, params: e.params, duration: e.duration }, 'Database Query');
  });
}

// Log database errors
prisma.$on('error', (e: any) => {
  logger.error({ error: e.message }, 'Database Error');
});
