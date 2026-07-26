import type { GroceryCategory } from '../enums/index.js';

export interface GroceryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: GroceryCategory;
  isChecked: boolean;
  mealIds: string[];
  addedAt: Date;
  estimatedPrice?: number;
}

/** A share grant for a grocery list (docs/07 POST /groceries/:id/share). */
export interface GroceryShare {
  email: string;
  token: string;
  expiresAt: Date;
}

export interface GroceryList {
  id: string;
  userId: string;
  weekStart: Date;
  items: GroceryItem[];
  totalItems: number;
  checkedItems: number;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
  sharedWith?: GroceryShare[];
}

export type CreateGroceryItemRequest = Omit<GroceryItem, 'id' | 'addedAt'>;
export type UpdateGroceryItemRequest = Partial<Omit<GroceryItem, 'id' | 'addedAt'>>;

export interface AggregateGroceriesRequest {
  mealPlanId: string;
}
