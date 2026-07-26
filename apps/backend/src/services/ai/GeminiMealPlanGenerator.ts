import type { MealPlan } from '@xeriusfit/shared';

import {
  MealPlanGeneratorNotImplementedError,
  type MealPlanGenerationRequest,
  type MealPlanGenerator,
} from './MealPlanGenerator.js';

export interface GeminiMealPlanGeneratorOptions {
  apiKey: string;
  model: string;
}

/**
 * Default provider shell (D2). The @google/genai SDK is installed but
 * deliberately NOT imported or called yet — no client, no prompt, no request.
 * Prompt engineering and the API call land with the meal-plan feature slice.
 */
export class GeminiMealPlanGenerator implements MealPlanGenerator {
  public readonly providerName = 'gemini';

  private readonly apiKey: string;
  private readonly model: string;

  constructor(options: GeminiMealPlanGeneratorOptions) {
    this.apiKey = options.apiKey;
    this.model = options.model;
  }

  public generate(_request: MealPlanGenerationRequest): Promise<MealPlan> {
    throw new MealPlanGeneratorNotImplementedError(this.providerName);
  }

  /** Exposed so config wiring can be asserted without leaking the key. */
  public get isConfigured(): boolean {
    return this.apiKey !== '' && this.model !== '';
  }
}
