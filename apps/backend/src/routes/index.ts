import { Router } from 'express';

/**
 * Versioned API router (/v1 per D12). Feature routers — auth, profiles,
 * mealplans, groceries, subscriptions — mount here as they are built.
 */
export const apiRouter: Router = Router();

export { healthRouter } from './health.route.js';
