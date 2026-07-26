export interface User {
  id: string;
  email: string;
  name?: string;
  firebaseUid?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  isActive: boolean;
  isDeleted: boolean;
  deletedAt?: Date | null;
}
