
import Elysia from 'elysia';

//[start:module-import]
import authRouter from "../module/auth/router";
import systemRouter from "../module/system/router";
//[end:module-import]
//[start:middleware-import]
import authMiddleware from "../middleware/auth.mid";
import docsMiddleware from "../middleware/docs.mid";
import errorMiddleware from "../middleware/error.mid";
import loggerMiddleware from "../middleware/logger.mid";
//[end:middleware-import]

const root = new Elysia()
	//[start:middleware-use]
	.use(authMiddleware)
	.use(docsMiddleware)
	.use(errorMiddleware)
	.use(loggerMiddleware)
	//[end:middleware-use]

export type Root = typeof root;

const app = root.group('/api', (a) => a
	//[start:module-use]
	.group("/auth", (g) => g.use(authRouter))
	.group("/system", (g) => g.use(systemRouter))
	//[end:module-use]
);

export { app, root };
