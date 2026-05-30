import { env } from './api/base/env';
import { app } from './api/base/_root';

import('../scripts/auto-import');

app.listen(env.PORT);
