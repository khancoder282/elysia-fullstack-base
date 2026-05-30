import Elysia from 'elysia';
import { logger } from 'elysia-logger';

export default new Elysia().use(logger()).as('global');
