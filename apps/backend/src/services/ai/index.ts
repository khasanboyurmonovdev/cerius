import { config } from '../../config/index.js';

import { GeminiMealPlanGenerator } from './GeminiMealPlanGenerator.js';
import {
  MealPlanGeneratorNotImplementedError,
  type MealPlanGenerator,
} from './MealPlanGenerator.js';

/**
 * Provider-selection wiring (D2). Gemini is the configured default; the OpenAI
 * arm is reserved for the Day 11 bake-off and has no implementation yet.
 */
export const createMealPlanGenerator = (): MealPlanGenerator => {
  switch (config.ai.provider) {
    case 'gemini':
      return new GeminiMealPlanGenerator({
        apiKey: config.ai.apiKey,
        model: config.ai.model,
      });
    case 'openai':
      throw new MealPlanGeneratorNotImplementedError('openai');
    default:
      throw new Error(`Unknown AI provider: ${String(config.ai.provider)}`);
  }
};

export { GeminiMealPlanGenerator, MealPlanGeneratorNotImplementedError };
export type {
  MealPlanGenerator,
  MealPlanGenerationRequest,
} from './MealPlanGenerator.js';
