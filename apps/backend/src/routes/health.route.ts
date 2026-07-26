import { Router } from 'express';

import { config } from '../config/index.js';

/**
 * The only real route in the skeleton: proves the server boots and responds.
 * Response uses the standard envelope from docs/07.
 */
export const healthRouter: Router = Router();

healthRouter.get('/', (_req, res) => {
  res.status(200).json({
    success: true,
    data: { status: 'ok' },
    meta: {
      timestamp: new Date().toISOString(),
      version: config.api.version,
    },
  });
});
