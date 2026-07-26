export enum DietaryRestriction {
  Vegetarian = 'vegetarian',
  Vegan = 'vegan',
  GlutenFree = 'gluten_free',
  Keto = 'keto',
  Paleo = 'paleo',
  DairyFree = 'dairy_free',
  Pescatarian = 'pescatarian',
}

export enum Allergy {
  Peanuts = 'peanuts',
  TreeNuts = 'tree_nuts',
  Shellfish = 'shellfish',
  Fish = 'fish',
  Dairy = 'dairy',
  Eggs = 'eggs',
  Soy = 'soy',
  Wheat = 'wheat',
  Sesame = 'sesame',
}

export enum MealType {
  Breakfast = 'breakfast',
  Lunch = 'lunch',
  Dinner = 'dinner',
  Snack = 'snack',
}

export enum GroceryCategory {
  Produce = 'produce',
  MeatSeafood = 'meat_seafood',
  DairyEggs = 'dairy_eggs',
  Pantry = 'pantry',
  Frozen = 'frozen',
  Other = 'other',
}

export enum SubscriptionStatus {
  Active = 'active',
  Trial = 'trial',
  Paused = 'paused',
  Cancelled = 'cancelled',
  Expired = 'expired',
}

export enum SubscriptionPlan {
  Monthly = 'monthly',
  Annual = 'annual',
}

export enum CookingSkill {
  Beginner = 'beginner',
  Intermediate = 'intermediate',
  Advanced = 'advanced',
}
