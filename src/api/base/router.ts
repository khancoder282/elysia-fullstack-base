import type { Root } from './_root';

import Elysia, { type ElysiaConfig } from 'elysia';

export function Router(value?: ElysiaConfig<string>) {
  return new Elysia(value) as Root;
}