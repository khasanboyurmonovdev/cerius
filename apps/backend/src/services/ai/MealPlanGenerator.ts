import type { MealPlan, Profile } from '@xeriusfit/shared';

/**
 * Provider-agnostic contract for meal plan generation (D2).
 *
 * Route handlers and services MUST depend on this interface only — never on a
 * vendor SDK directly — so the Day 11 Gemini/OpenAI bake-off is a one-file swap.
 */
export interface MealPlanGenerator {
  /** Identifies the concrete provider, for logging and analytics. */
  readonly providerName: string;

  generate(request: MealPlanGenerationRequest): Promise<MealPlan>;
}

export interface MealPlanGenerationRequest {
  /** Dietary profile the plan must respect (restrictions, allergies, macros). */
  profile: Profile;
  /** Monday of the target week, at 00:00 UTC. */
  weekStart: Date;
  /** Number of consecutive weeks to generate (1 free, 2-4 premium). */
  weeks: number;
}

/** Thrown when a provider is selected but its implementation is not ready. */
export class MealPlanGeneratorNotImplementedError extends Error {
  constructor(providerName: string) {
    super(
      `MealPlanGenerator "${providerName}" is not implemented yet. ` +
        `Provider selection is pending the Day 11 bake-off (docs/09_DECISIONS.md, D2).`,
    );
    this.name = 'MealPlanGeneratorNotImplementedError';
  }
}
