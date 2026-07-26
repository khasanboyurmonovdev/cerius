import type { ErrorRequestHandler, RequestHandler } from 'express';

import { config } from '../config/index.js';

/** Error envelope shape defined in docs/07. */
interface ErrorBody {
  success: false;
  error: {
    code: string;
    message: string;
  };
  meta: {
    timestamp: string;
    version: string;
  };
}

const buildErrorBody = (code: string, message: string): ErrorBody => ({
  success: false,
  error: { code, message },
  meta: {
    timestamp: new Date().toISOString(),
    version: config.api.version,
  },
});

/** Catch-all for unmatched paths — must be registered after all routes. */
export const notFoundHandler: RequestHandler = (_req, res) => {
  res.status(404).json(buildErrorBody('NOT_FOUND', 'Resource not found'));
};

/**
 * Global error handler shell. Error classification (validation -> 400,
 * auth -> 401, etc.) and logging get filled in when feature code lands.
 */
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const message =
    !config.isProduction && err instanceof Error ? err.message : 'Something went wrong';

  res.status(500).json(buildErrorBody('INTERNAL_ERROR', message));
};
