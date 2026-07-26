import type { DietaryRestriction, Allergy, MealType, CookingSkill } from '../enums/index.js';

export interface Profile {
  id: string;
  userId: string;
  goal: 'weight_loss' | 'maintenance' | 'muscle_gain';
  restrictions: DietaryRestriction[];
  allergies: Allergy[];
  dislikedFoods: string[];
  calorieTarget: number;
  mealsPerDay: MealType[];
  cuisinePreferences?: string[];
  cookingSkill?: CookingSkill;
  preferences: ProfilePreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProfilePreferences {
  isDarkMode: boolean;
  notificationsEnabled: boolean;
  notificationTime: string;
  language?: string;
}

export type CreateProfileRequest = Omit<Profile, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;
export type UpdateProfileRequest = Partial<Omit<Profile, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>;
