import Elysia from 'elysia';
import { Logger } from 'elysia-logger';

const logger = new Logger();

export default new Elysia()
  .onError((ctx) => {
    const { error, set, code } = ctx;
    const err = error as Error & { cause?: { code?: string; detail?: string } };

    if (err.cause?.code === '23505') {
      set.status = 409;
      return err.cause.detail;
    }
    
    if (code === 'UNKNOWN') {
      logger.error(err.message || 'An error occurred', err.stack);
    }
    return undefined;
  })
  .as('global');
