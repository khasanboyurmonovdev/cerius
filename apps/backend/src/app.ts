import compression from 'compression';
import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';

import { config } from './config/index.js';
import { errorHandler, notFoundHandler } from './middleware/index.js';
import { apiRouter, healthRouter } from './routes/index.js';

/**
 * Builds the Express application: cross-cutting middleware, the health route,
 * and the (currently empty) versioned API router. No feature routes yet.
 */
export const createApp = (): Express => {
  const app = express();

  app.disable('x-powered-by');

  // Cross-cutting middleware (docs/05)
  app.use(helmet());
  app.use(
    cors({
      origin: [...config.cors.origins],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
    }),
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(compression());

  // Liveness probe — unversioned so uptime monitors survive API version bumps.
  app.use('/health', healthRouter);

  // Versioned API surface (D12). Feature routers mount onto apiRouter.
  app.use(config.api.versionPrefix, apiRouter);

  // Terminal handlers — order matters.
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
