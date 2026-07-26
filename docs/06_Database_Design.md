# 06_Database_Design.md

## Table of Contents

1. [Database Choice & Rationale](#database-choice--rationale)
2. [Collection Overview](#collection-overview)
3. [Detailed Schemas](#detailed-schemas)
4. [Relationships & References](#relationships--references)
5. [Indexes & Query Patterns](#indexes--query-patterns)
6. [Data Validation](#data-validation)
7. [Security & Encryption](#security--encryption)
8. [Audit Logging](#audit-logging)
9. [Backup & Recovery](#backup--recovery)
10. [Scalability Strategy](#scalability-strategy)

---

## Database Choice & Rationale

### MongoDB vs Alternatives

| Aspect | MongoDB | PostgreSQL | DynamoDB |
|--------|---------|-----------|----------|
| Schema Flexibility | ✓ Flexible/evolving | ✗ Fixed schema | ~ Flexible but limited |
| Real-time Sync | ✓ Firebase integration | ✗ Need custom logic | ✗ Eventual consistency |
| Scalability | ✓ Horizontal scaling | ~ Vertical focus | ✓ But expensive at scale |
| Operational Overhead | ✓ Managed (Atlas) | ~ Self-managed | ✓ Serverless |
| Cost (MVP) | ✓ Free tier available | ✓ Free tier available | ✗ Pay per request |
| JSON-native | ✓ Yes | ✗ Requires mapping | ~ Yes |
| Developer Experience | ✓ Familiar, JavaScript | ✗ SQL, migrations | ~ Learning curve |
| Community | ✓ Large, mature | ✓ Largest | ✓ Growing |

**Decision: MongoDB Atlas (managed cloud MongoDB)**
- Free M0 tier for MVP
- Automatic backups
- Replica sets for HA
- Integrates well with Firebase
- Can migrate to PostgreSQL later if needed (data export easy)

---

## Collection Overview

```
MongoDB Database: "xeriusfit-production"

Collections:
├── users
├── profiles
├── mealPlans
├── recipes (cache)
├── groceries
├── subscriptions
├── auditLogs
└── analytics (optional, for aggregation)
```

---

## Detailed Schemas

### 1. Users Collection

**Purpose:** Store user authentication and account data

```javascript
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: [
        "_id",
        "email",
        "passwordHash",
        "createdAt",
        "updatedAt"
      ],
      additionalProperties: false,
      properties: {
        _id: {
          bsonType: "objectId",
          description: "Unique user ID"
        },
        email: {
          bsonType: "string",
          pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
          description: "User email (unique, case-insensitive)"
        },
        passwordHash: {
          bsonType: "string",
          description: "Bcrypt hashed password (12 rounds)"
        },
        name: {
          bsonType: "string",
          minLength: 1,
          maxLength: 100,
          description: "User full name (optional initially)"
        },
        firebaseUid: {
          bsonType: "string",
          description: "Firebase UID for multi-auth (optional)"
        },
        avatar: {
          bsonType: "string",
          description: "Avatar image URL (Cloudinary)"
        },
        createdAt: {
          bsonType: "date",
          description: "Account creation timestamp"
        },
        updatedAt: {
          bsonType: "date",
          description: "Last update timestamp"
        },
        lastLoginAt: {
          bsonType: ["date", "null"],
          description: "Last login timestamp"
        },
        isActive: {
          bsonType: "bool",
          description: "Account active status"
        },
        isDeleted: {
          bsonType: "bool",
          description: "Soft delete flag"
        },
        deletedAt: {
          bsonType: ["date", "null"],
          description: "When account was deleted"
        }
      }
    }
  }
})

// Example document:
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "email": "alex@example.com",
  "passwordHash": "$2b$12$...", // bcrypt hash
  "name": "Alex Johnson",
  "firebaseUid": "firebase-uid-123",
  "avatar": "https://res.cloudinary.com/...",
  "createdAt": ISODate("2025-01-15T10:30:00Z"),
  "updatedAt": ISODate("2025-01-20T14:45:00Z"),
  "lastLoginAt": ISODate("2025-01-20T14:45:00Z"),
  "isActive": true,
  "isDeleted": false,
  "deletedAt": null
}
```

---

### 2. Profiles Collection

**Purpose:** Store user dietary preferences and settings

```javascript
db.createCollection("profiles", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: [
        "_id",
        "userId",
        "goal",
        "restrictions",
        "createdAt"
      ],
      additionalProperties: false,
      properties: {
        _id: {
          bsonType: "objectId"
        },
        userId: {
          bsonType: "objectId",
          description: "Reference to users._id"
        },
        goal: {
          enum: ["weight_loss", "maintenance", "muscle_gain"],
          description: "Primary dietary goal"
        },
        restrictions: {
          bsonType: "array",
          items: {
            enum: [
              "vegetarian",
              "vegan",
              "gluten_free",
              "keto",
              "paleo",
              "dairy_free",
              "pescatarian"
            ]
          },
          description: "Dietary restrictions"
        },
        allergies: {
          bsonType: "array",
          items: {
            enum: [
              "peanuts",
              "tree_nuts",
              "shellfish",
              "fish",
              "dairy",
              "eggs",
              "soy",
              "wheat",
              "sesame"
            ]
          },
          description: "Food allergies"
        },
        dislikedFoods: {
          bsonType: "array",
          items: {
            bsonType: "string",
            maxLength: 100
          },
          maxItems: 50,
          description: "Foods user wants to avoid"
        },
        calorieTarget: {
          bsonType: "int",
          minimum: 1200,
          maximum: 3500,
          description: "Daily calorie target"
        },
        mealsPerDay: {
          bsonType: "array",
          items: {
            enum: ["breakfast", "lunch", "dinner", "snacks"]
          },
          description: "Which meals to include"
        },
        cuisinePreferences: {
          bsonType: "array",
          items: {
            enum: [
              "italian",
              "asian",
              "mexican",
              "american",
              "indian",
              "mediterranean",
              "thai"
            ]
          },
          description: "Preferred cuisines (future feature)"
        },
        cookingSkill: {
          enum: ["beginner", "intermediate", "advanced"],
          description: "Cooking skill level"
        },
        preferences: {
          bsonType: "object",
          properties: {
            isDarkMode: {
              bsonType: "bool"
            },
            notificationsEnabled: {
              bsonType: "bool"
            },
            notificationTime: {
              bsonType: "string",
              pattern: "^([01]?[0-9]|2[0-3]):[0-5][0-9]$"
            },
            language: {
              bsonType: "string",
              enum: ["en", "es", "fr", "de", "ja", "zh"]
            }
          }
        },
        createdAt: {
          bsonType: "date"
        },
        updatedAt: {
          bsonType: "date"
        }
      }
    }
  }
})

// Example document:
{
  "_id": ObjectId("507f1f77bcf86cd799439012"),
  "userId": ObjectId("507f1f77bcf86cd799439011"),
  "goal": "weight_loss",
  "restrictions": ["vegetarian"],
  "allergies": ["dairy", "shellfish"],
  "dislikedFoods": ["mushrooms", "brussels sprouts"],
  "calorieTarget": 2000,
  "mealsPerDay": ["breakfast", "lunch", "dinner"],
  "cuisinePreferences": ["mediterranean", "asian"],
  "cookingSkill": "intermediate",
  "preferences": {
    "isDarkMode": true,
    "notificationsEnabled": true,
    "notificationTime": "19:00",
    "language": "en"
  },
  "createdAt": ISODate("2025-01-15T10:35:00Z"),
  "updatedAt": ISODate("2025-01-20T14:45:00Z")
}
```

---

### 3. Meal Plans Collection

**Purpose:** Store generated meal plans

```javascript
db.createCollection("mealPlans", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: [
        "_id",
        "userId",
        "weekStart",
        "days",
        "createdAt"
      ],
      properties: {
        _id: {
          bsonType: "objectId"
        },
        userId: {
          bsonType: "objectId",
          description: "Reference to users._id"
        },
        weekStart: {
          bsonType: "date",
          description: "Monday of the week (at 00:00 UTC)"
        },
        weekEnd: {
          bsonType: "date",
          description: "Sunday of the week (at 23:59 UTC)"
        },
        days: {
          bsonType: "object",
          properties: {
            monday: { $ref: "#/definitions/day" },
            tuesday: { $ref: "#/definitions/day" },
            wednesday: { $ref: "#/definitions/day" },
            thursday: { $ref: "#/definitions/day" },
            friday: { $ref: "#/definitions/day" },
            saturday: { $ref: "#/definitions/day" },
            sunday: { $ref: "#/definitions/day" }
          }
        },
        createdAt: {
          bsonType: "date"
        },
        expiresAt: {
          bsonType: "date",
          description: "Plan expires after 30 days"
        },
        isActive: {
          bsonType: "bool",
          description: "Is this the current plan?"
        }
      },
      definitions: {
        day: {
          bsonType: "object",
          properties: {
            meals: {
              bsonType: "array",
              items: {
                bsonType: "object",
                properties: {
                  id: { bsonType: "string" },
                  type: { enum: ["breakfast", "lunch", "dinner", "snack"] },
                  name: { bsonType: "string" },
                  description: { bsonType: "string" },
                  ingredients: {
                    bsonType: "array",
                    items: {
                      bsonType: "object",
                      properties: {
                        name: { bsonType: "string" },
                        quantity: { bsonType: ["double", "int"] },
                        unit: { bsonType: "string" }
                      }
                    }
                  },
                  instructions: { bsonType: "string" },
                  cookingTime: {
                    bsonType: "int",
                    description: "Minutes to cook"
                  },
                  servings: { bsonType: "int" },
                  difficulty: {
                    enum: ["easy", "medium", "hard"]
                  },
                  macros: {
                    bsonType: "object",
                    properties: {
                      calories: { bsonType: "int" },
                      protein: { bsonType: "double" },
                      carbs: { bsonType: "double" },
                      fat: { bsonType: "double" },
                      fiber: { bsonType: "double" }
                    }
                  },
                  imageUrl: {
                    bsonType: ["string", "null"],
                    description: "Cloudinary image URL"
                  },
                  source: {
                    enum: ["ai_generated", "recipe_database"]
                  },
                  rating: {
                    bsonType: ["int", "null"],
                    minimum: 1,
                    maximum: 5
                  }
                }
              }
            }
          }
        }
      }
    }
  }
})

// Example document:
{
  "_id": ObjectId("507f1f77bcf86cd799439013"),
  "userId": ObjectId("507f1f77bcf86cd799439011"),
  "weekStart": ISODate("2025-01-20T00:00:00Z"),
  "weekEnd": ISODate("2025-01-26T23:59:59Z"),
  "days": {
    "monday": {
      "meals": [
        {
          "id": "meal_1",
          "type": "breakfast",
          "name": "Avocado Toast",
          "description": "Whole grain toast topped with mashed avocado",
          "ingredients": [
            {
              "name": "bread",
              "quantity": 2,
              "unit": "slices"
            },
            {
              "name": "avocado",
              "quantity": 1,
              "unit": "whole"
            },
            {
              "name": "sea salt",
              "quantity": 0.25,
              "unit": "tsp"
            }
          ],
          "instructions": "Toast bread. Mash avocado with salt. Spread on toast. Serve.",
          "cookingTime": 5,
          "servings": 1,
          "difficulty": "easy",
          "macros": {
            "calories": 350,
            "protein": 12,
            "carbs": 45,
            "fat": 15,
            "fiber": 5
          },
          "imageUrl": "https://res.cloudinary.com/...",
          "source": "ai_generated",
          "rating": null
        },
        // ... lunch, dinner, snacks
      ]
    },
    // ... tue-sun
  },
  "createdAt": ISODate("2025-01-20T10:30:00Z"),
  "expiresAt": ISODate("2025-02-19T10:30:00Z"),
  "isActive": true
}
```

---

### 4. Groceries Collection

**Purpose:** Store user's grocery lists

```javascript
db.createCollection("groceries", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: [
        "_id",
        "userId",
        "weekStart",
        "items",
        "createdAt"
      ],
      properties: {
        _id: {
          bsonType: "objectId"
        },
        userId: {
          bsonType: "objectId"
        },
        weekStart: {
          bsonType: "date",
          description: "Monday of week this list is for"
        },
        items: {
          bsonType: "array",
          items: {
            bsonType: "object",
            properties: {
              id: { bsonType: "string" },
              name: { bsonType: "string" },
              quantity: { bsonType: ["double", "int"] },
              unit: { bsonType: "string" },
              category: {
                enum: [
                  "produce",
                  "meat_seafood",
                  "dairy_eggs",
                  "pantry",
                  "frozen",
                  "other"
                ]
              },
              isChecked: { bsonType: "bool" },
              mealIds: {
                bsonType: "array",
                items: { bsonType: "string" }
              },
              addedAt: { bsonType: "date" },
              estimatedPrice: {
                bsonType: ["double", "null"]
              }
            }
          }
        },
        totalItems: {
          bsonType: "int",
          description: "Total items in list"
        },
        checkedItems: {
          bsonType: "int",
          description: "Items marked as purchased"
        },
        createdAt: {
          bsonType: "date"
        },
        updatedAt: {
          bsonType: "date"
        },
        expiresAt: {
          bsonType: "date",
          description: "List expires after 30 days"
        }
      }
    }
  }
})

// Example document:
{
  "_id": ObjectId("507f1f77bcf86cd799439014"),
  "userId": ObjectId("507f1f77bcf86cd799439011"),
  "weekStart": ISODate("2025-01-20T00:00:00Z"),
  "items": [
    {
      "id": "item_1",
      "name": "Avocado",
      "quantity": 2,
      "unit": "whole",
      "category": "produce",
      "isChecked": true,
      "mealIds": ["meal_1"],
      "addedAt": ISODate("2025-01-20T10:35:00Z"),
      "estimatedPrice": 3.50
    },
    {
      "id": "item_2",
      "name": "Chicken Breast",
      "quantity": 2,
      "unit": "lbs",
      "category": "meat_seafood",
      "isChecked": false,
      "mealIds": ["meal_2", "meal_5"],
      "addedAt": ISODate("2025-01-20T10:35:00Z"),
      "estimatedPrice": 8.99
    },
    // ... more items
  ],
  "totalItems": 25,
  "checkedItems": 8,
  "createdAt": ISODate("2025-01-20T10:35:00Z"),
  "updatedAt": ISODate("2025-01-21T15:20:00Z"),
  "expiresAt": ISODate("2025-02-19T10:35:00Z")
}
```

---

### 5. Subscriptions Collection

**Purpose:** Track subscription status

```javascript
db.createCollection("subscriptions", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: [
        "_id",
        "userId",
        "status",
        "createdAt"
      ],
      properties: {
        _id: {
          bsonType: "objectId"
        },
        userId: {
          bsonType: "objectId"
        },
        status: {
          enum: [
            "active",
            "trial",
            "paused",
            "cancelled",
            "expired"
          ]
        },
        plan: {
          enum: ["monthly", "annual"]
        },
        price: {
          bsonType: "double",
          description: "Price paid (USD)"
        },
        startDate: {
          bsonType: "date",
          description: "Subscription start date"
        },
        trialStartDate: {
          bsonType: ["date", "null"]
        },
        trialEndDate: {
          bsonType: ["date", "null"]
        },
        renewalDate: {
          bsonType: "date",
          description: "Next renewal/billing date"
        },
        cancellationDate: {
          bsonType: ["date", "null"]
        },
        cancellationReason: {
          bsonType: ["string", "null"],
          enum: [
            "too_expensive",
            "not_using",
            "found_alternative",
            "technical_issues",
            "other"
          ]
        },
        googlePlaySubscriptionId: {
          bsonType: "string",
          description: "Google Play order ID"
        },
        googlePlayToken: {
          bsonType: "string",
          description: "Google Play purchase token"
        },
        autoRenew: {
          bsonType: "bool",
          description: "Auto-renewal enabled?"
        },
        createdAt: {
          bsonType: "date"
        },
        updatedAt: {
          bsonType: "date"
        }
      }
    }
  }
})

// Example document:
{
  "_id": ObjectId("507f1f77bcf86cd799439015"),
  "userId": ObjectId("507f1f77bcf86cd799439011"),
  "status": "active",
  "plan": "monthly",
  "price": 5.99,
  "startDate": ISODate("2025-01-15T14:30:00Z"),
  "trialStartDate": ISODate("2025-01-15T14:30:00Z"),
  "trialEndDate": ISODate("2025-01-22T14:30:00Z"),
  "renewalDate": ISODate("2025-02-15T14:30:00Z"),
  "cancellationDate": null,
  "cancellationReason": null,
  "googlePlaySubscriptionId": "GPA.1234-5678-9101112",
  "googlePlayToken": "google_play_purchase_token",
  "autoRenew": true,
  "createdAt": ISODate("2025-01-15T14:30:00Z"),
  "updatedAt": ISODate("2025-01-15T14:30:00Z")
}
```

---

### 6. Audit Logs Collection

**Purpose:** Track user actions for analytics and debugging

```javascript
db.createCollection("auditLogs", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: [
        "_id",
        "userId",
        "action",
        "createdAt"
      ],
      properties: {
        _id: {
          bsonType: "objectId"
        },
        userId: {
          bsonType: "objectId"
        },
        action: {
          enum: [
            "user_signup",
            "user_login",
            "profile_created",
            "profile_updated",
            "plan_generated",
            "plan_viewed",
            "recipe_viewed",
            "grocery_list_created",
            "grocery_item_added",
            "grocery_item_checked",
            "grocery_list_shared",
            "subscription_started",
            "subscription_renewed",
            "subscription_cancelled",
            "feature_used",
            "logout",
            "account_deleted"
          ]
        },
        resource: {
          bsonType: ["string", "null"],
          description: "Resource affected (mealPlanId, etc.)"
        },
        metadata: {
          bsonType: "object",
          description: "Action-specific data"
        },
        ipAddress: {
          bsonType: "string",
          description: "User's IP"
        },
        userAgent: {
          bsonType: "string",
          description: "Device/browser info"
        },
        statusCode: {
          bsonType: ["int", "null"],
          description: "HTTP status if applicable"
        },
        createdAt: {
          bsonType: "date"
        }
      }
    }
  }
})

// Example documents:
{
  "_id": ObjectId("507f1f77bcf86cd799439016"),
  "userId": ObjectId("507f1f77bcf86cd799439011"),
  "action": "plan_generated",
  "resource": "507f1f77bcf86cd799439013",
  "metadata": {
    "generationTime": 3200,
    "weekStart": "2025-01-20",
    "mealCount": 21
  },
  "ipAddress": "192.168.1.1",
  "userAgent": "Capacitor/Android",
  "statusCode": 200,
  "createdAt": ISODate("2025-01-20T10:35:00Z")
}

{
  "_id": ObjectId("507f1f77bcf86cd799439017"),
  "userId": ObjectId("507f1f77bcf86cd799439011"),
  "action": "subscription_started",
  "resource": null,
  "metadata": {
    "plan": "monthly",
    "price": 5.99,
    "trialLength": 7,
    "source": "free_tier_limit"
  },
  "ipAddress": "192.168.1.1",
  "userAgent": "Capacitor/Android",
  "statusCode": 200,
  "createdAt": ISODate("2025-01-15T14:30:00Z")
}
```

---

## Relationships & References

### Entity Relationship Diagram

```
┌─────────────┐
│   users     │ (1)
├─────────────┤
│ _id (PK)    │
│ email       │
│ name        │
└─────────────┘
      │
      │ (1:1)
      │
┌─────────────────┐
│   profiles      │
├─────────────────┤
│ _id (PK)        │
│ userId (FK)     │
│ goal            │
│ restrictions    │
│ allergies       │
└─────────────────┘

┌─────────────┐
│   users     │ (1)
├─────────────┤
└─────────────┘
      │
      │ (1:M)
      │
┌─────────────────┐
│   mealPlans     │
├─────────────────┤
│ _id (PK)        │
│ userId (FK)     │
│ weekStart       │
│ days            │
└─────────────────┘

┌─────────────┐
│   users     │ (1)
├─────────────┤
└─────────────┘
      │
      │ (1:M)
      │
┌─────────────────┐
│   groceries     │
├─────────────────┤
│ _id (PK)        │
│ userId (FK)     │
│ weekStart       │
│ items           │
└─────────────────┘

┌─────────────┐
│   users     │ (1)
├─────────────┤
└─────────────┘
      │
      │ (1:1 or 1:M)
      │
┌──────────────────┐
│ subscriptions    │
├──────────────────┤
│ _id (PK)         │
│ userId (FK)      │
│ status           │
│ renewalDate      │
└──────────────────┘

┌─────────────┐
│   users     │ (1)
├─────────────┤
└─────────────┘
      │
      │ (1:M)
      │
┌──────────────────┐
│   auditLogs      │
├──────────────────┤
│ _id (PK)         │
│ userId (FK)      │
│ action           │
│ createdAt        │
└──────────────────┘
```

### Foreign Key Strategy

**No explicit foreign key constraints** in MongoDB (flexible, but requires application-level validation)

**Instead:**
- Reference fields use ObjectId (userId, etc.)
- Application validates on write
- Indexes on foreign keys for performance
- Could migrate to transactions if needed

---

## Indexes & Query Patterns

### Index Strategy

**Unique Indexes (enforce uniqueness):**
```javascript
db.users.createIndex({ email: 1 }, { unique: true, sparse: true })
db.subscriptions.createIndex(
  { userId: 1, status: 1 },
  { name: "user_subscription_status" }
)
```

**Single Field Indexes (speed up queries):**
```javascript
// Users
db.users.createIndex({ createdAt: 1 })
db.users.createIndex({ lastLoginAt: 1 })

// Profiles
db.profiles.createIndex({ userId: 1 }, { unique: true })

// Meal Plans
db.mealPlans.createIndex({ userId: 1 })
db.mealPlans.createIndex({ weekStart: 1 })
db.mealPlans.createIndex({ expiresAt: 1 })

// Groceries
db.groceries.createIndex({ userId: 1 })
db.groceries.createIndex({ weekStart: 1 })

// Audit Logs
db.auditLogs.createIndex({ userId: 1 })
db.auditLogs.createIndex({ createdAt: 1 })
db.auditLogs.createIndex({ action: 1 })
```

**Compound Indexes (multi-field queries):**
```javascript
// Find meal plans for user in date range
db.mealPlans.createIndex({
  userId: 1,
  weekStart: 1
}, { name: "user_plans_by_week" })

// Find upcoming subscriptions to renew
db.subscriptions.createIndex({
  status: 1,
  renewalDate: 1
}, { name: "active_subs_by_renewal" })

// Audit trail by user and action
db.auditLogs.createIndex({
  userId: 1,
  action: 1,
  createdAt: -1
}, { name: "user_actions_timeline" })
```

### Query Patterns & Examples

**Pattern 1: Get User Profile**
```javascript
// Query
db.profiles.findOne({ userId: ObjectId("user_id") })

// Index used: { userId: 1 }, unique: true
// Expected: <1ms
```

**Pattern 2: Get Current Week's Meal Plan**
```javascript
// Query
db.mealPlans.findOne({
  userId: ObjectId("user_id"),
  weekStart: ISODate("2025-01-20T00:00:00Z")
})

// Index used: { userId: 1, weekStart: 1 }
// Expected: <1ms
```

**Pattern 3: Get Last 4 Meal Plans (History)**
```javascript
// Query
db.mealPlans.find({
  userId: ObjectId("user_id")
})
.sort({ weekStart: -1 })
.limit(4)

// Index used: { userId: 1, weekStart: -1 }
// Expected: <5ms
```

**Pattern 4: Get Upcoming Subscription Renewals**
```javascript
// Query (run hourly via cron)
db.subscriptions.find({
  status: "active",
  renewalDate: { $lte: ISODate("2025-01-21") }
})

// Index used: { status: 1, renewalDate: 1 }
// Expected: <10ms for millions of docs
```

**Pattern 5: Get User Activity Timeline**
```javascript
// Query
db.auditLogs.find({
  userId: ObjectId("user_id")
})
.sort({ createdAt: -1 })
.limit(50)

// Index used: { userId: 1, createdAt: -1 }
// Expected: <5ms
```

**Pattern 6: Clean Up Expired Plans**
```javascript
// Query (run nightly via cron)
db.mealPlans.deleteMany({
  expiresAt: { $lt: new Date() }
})

// Index used: { expiresAt: 1 }
// Expected: depends on volume, can be parallelized
```

---

## Data Validation

### Schema Validation

**Using Zod (Application Level)**

```typescript
import { z } from 'zod'

// User validation
const userSchema = z.object({
  email: z.string().email().toLowerCase(),
  passwordHash: z.string().min(60), // bcrypt output
  name: z.string().min(1).max(100).optional(),
  firebaseUid: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  isActive: z.boolean().default(true),
  isDeleted: z.boolean().default(false)
})

// Profile validation
const profileSchema = z.object({
  userId: z.string().objectId(),
  goal: z.enum(['weight_loss', 'maintenance', 'muscle_gain']),
  restrictions: z.array(z.enum([
    'vegetarian', 'vegan', 'gluten_free', 'keto', 'paleo', 'dairy_free'
  ])).default([]),
  allergies: z.array(z.enum([
    'peanuts', 'tree_nuts', 'shellfish', 'fish', 'dairy', 'eggs', 'soy', 'wheat'
  ])).default([]),
  dislikedFoods: z.array(z.string().max(100)).max(50).default([]),
  calorieTarget: z.number().int().min(1200).max(3500),
  mealsPerDay: z.array(z.enum(['breakfast', 'lunch', 'dinner', 'snacks']))
})

// Meal validation
const mealSchema = z.object({
  type: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
  name: z.string().min(1).max(200),
  ingredients: z.array(z.object({
    name: z.string(),
    quantity: z.number().positive(),
    unit: z.string()
  })),
  instructions: z.string().min(10),
  cookingTime: z.number().int().positive(),
  servings: z.number().int().positive(),
  macros: z.object({
    calories: z.number().int().positive(),
    protein: z.number().positive(),
    carbs: z.number().positive(),
    fat: z.number().positive()
  })
})
```

### Insert/Update Validation

```typescript
// Before insert
const parsed = userSchema.parse(userData)
const result = await db.users.insertOne(parsed)

// Before update
const updates = profileSchema.parse(updateData)
await db.profiles.updateOne({ userId }, { $set: updates })

// If validation fails
// → Zod throws ZodError
// → Express error handler catches it
// → Returns 400 Bad Request to client
```

---

## Security & Encryption

### Data at Rest

**MongoDB Atlas Encryption:**
- Automatic encryption with AWS KMS
- Keys managed by MongoDB (Enterprise feature)
- For MVP: Standard encryption in transit is sufficient

**Application-Level Encryption (Passwords):**
```typescript
import bcrypt from 'bcrypt'

// Store password
const hashedPassword = await bcrypt.hash(password, 12)

// Verify password
const isValid = await bcrypt.compare(inputPassword, hashedPassword)
```

### Data in Transit

**HTTPS/TLS 1.3:**
- All API traffic encrypted
- Certificate pinning (optional for high-security apps)
- CORS headers to prevent cross-origin abuse

**Database Connection:**
```javascript
// MongoDB Atlas URI with encryption
mongodb+srv://user:password@cluster.mongodb.net/dbname?
  retryWrites=true&
  w=majority&
  tlsAllowInvalidCertificates=false
```

### Access Control

**Database-Level:**
```javascript
// Create read-only role for backups
db.createRole({
  role: "backupReader",
  privileges: [{
    resource: { db: "xeriusfit-production", collection: "" },
    actions: ["find"]
  }],
  roles: []
})

// Create app user (limited permissions)
db.createUser({
  user: "app_user",
  pwd: "complex-password",
  roles: [{ role: "readWrite", db: "xeriusfit-production" }]
})
```

**Application-Level:**
- JWT tokens validate ownership
- Can only access own data
- Server checks `userId` from token matches resource owner

**Example:**
```typescript
// Only fetch own meal plans
router.get('/mealplans', authenticate, async (req, res) => {
  const userId = req.user.id // from JWT token
  
  const plans = await db.mealPlans.find({
    userId: ObjectId(userId)  // Force filter by user
  })
  
  return res.json(plans)
})
```

### PII & Sensitive Data

**What we store:**
- Email (required for auth)
- Password hash (never plaintext)
- Name (optional)
- Dietary preferences (non-sensitive)

**What we DON'T store:**
- Payment card numbers (Google Play handles)
- Health data beyond dietary preferences
- Location data
- Biometric data

**Data Retention:**
```javascript
// Delete user data on account deletion
async function deleteUser(userId) {
  // Soft delete user
  await db.users.updateOne(
    { _id: userId },
    { $set: { isDeleted: true, deletedAt: new Date() } }
  )
  
  // Remove profile
  await db.profiles.deleteOne({ userId })
  
  // Archive meal plans (don't delete, in case needed for support)
  await db.mealPlans.updateMany(
    { userId },
    { $set: { isArchived: true } }
  )
  
  // Remove subscriptions
  await db.subscriptions.deleteOne({ userId })
  
  // Schedule hard delete after 30 days
  scheduleHardDelete(userId, 30)
}
```

---

## Audit Logging

### Events to Log

**Authentication:**
- User sign-up
- User login (success & failure)
- Password reset
- Token refresh
- Logout

**Data Changes:**
- Profile created/updated
- Meal plan generated
- Grocery list modified
- Subscription status changed

**Actions:**
- Plan viewed
- Recipe clicked
- Grocery item added/checked
- Grocery list shared

**System:**
- API errors
- Rate limit exceeded
- Suspicious activity (multiple failed logins, etc.)

### Audit Log Implementation

```typescript
// Create audit log entry
async function createAuditLog(
  userId: string,
  action: string,
  metadata?: object,
  ipAddress?: string
) {
  const log = {
    userId: ObjectId(userId),
    action,
    metadata,
    ipAddress,
    userAgent: getUserAgent(),
    createdAt: new Date()
  }
  
  await db.auditLogs.insertOne(log)
}

// Usage in middleware
app.use((req, res, next) => {
  res.on('finish', () => {
    if (req.user && req.path.includes('/api/')) {
      createAuditLog(
        req.user.id,
        extractAction(req),
        extractMetadata(req, res),
        req.ip
      )
    }
  })
  next()
})
```

### Audit Log Retention

```javascript
// Delete logs older than 2 years (compliance)
db.auditLogs.deleteMany({
  createdAt: { $lt: new Date(Date.now() - 730 * 24 * 60 * 60 * 1000) }
})
```

---

## Backup & Recovery

### Backup Strategy

**MongoDB Atlas Automated Backups:**
- Daily snapshots (free tier)
- 7-day retention (M0), 35-day (paid)
- Point-in-time recovery (PITR) available on paid tiers

**Manual Backups (Production):**
```bash
# Daily backup script
mongodump --uri "mongodb+srv://user:pass@cluster.mongodb.net/xeriusfit-production" \
  --archive=xeriusfit-backup-$(date +%Y%m%d).archive \
  --gzip

# Upload to S3
aws s3 cp xeriusfit-backup-*.archive s3://xeriusfit-backups/
```

### Recovery Procedures

**Full Database Recovery:**
```bash
# Restore from archive
mongorestore --uri "mongodb+srv://user:pass@cluster.mongodb.net/test-db" \
  --archive=xeriusfit-backup-20250120.archive \
  --gzip
```

**Point-in-Time Recovery:**
```javascript
// Via MongoDB Atlas console
// Select snapshot date/time
// Click "Restore to New Cluster"
// Verify data
// Cut over DNS
```

**Partial Recovery (Single Collection):**
```bash
# Restore just one collection
mongorestore --uri "mongodb+srv://..." \
  --archive=backup.archive \
  --gzip \
  --db=xeriusfit-production \
  --collection=users
```

---

## Scalability Strategy

### Scaling Approach

**Phase 1 (MVP): Single Cluster**
- M0 (free) or M2 tier cluster
- Single region (us-east-1)
- No sharding needed
- Can handle ~100K users

**Phase 2 (Growth): Replica Set**
- Upgrade to M10+ tier
- 3-node replica set for HA
- Read replicas in secondary regions
- Can handle ~1M users

**Phase 3 (Scale): Sharding**
- Shard by userId
- Multiple clusters (Americas, Europe, Asia)
- Geographically distributed
- Can handle 10M+ users

### Sharding Strategy (if needed)

```javascript
// Shard key: userId (good distribution)
sh.shardCollection("xeriusfit-production.mealPlans", { userId: 1 })
sh.shardCollection("xeriusfit-production.groceries", { userId: 1 })
sh.shardCollection("xeriusfit-production.auditLogs", { userId: 1 })

// Why userId?
// - Even distribution across shards
// - All user's data collocated
// - Most queries filter by userId
```

### Connection Pooling

```javascript
// Connection pool (managed by driver)
const client = new MongoClient(uri, {
  maxPoolSize: 50,
  minPoolSize: 10,
  maxIdleTimeMS: 45000,
  waitQueueTimeoutMS: 10000
})

// Adaptive sizing based on load
// Driver auto-scales connection pool
```

---

## Summary

| Aspect | Strategy |
|--------|----------|
| Database | MongoDB Atlas (managed) |
| Collections | 7 main + analytics |
| Validation | Zod (application) + JSON Schema (MongoDB) |
| Indexes | Compound indexes for common queries |
| Security | HTTPS, bcrypt passwords, field-level access control |
| Backup | Daily automated (Atlas) + manual uploads (S3) |
| Scalability | Replica sets now, sharding if 10M+ users |
| Retention | 30 days plans, 2 years audit logs, soft-delete users |
| Monitoring | Performance tracking, slow query logs, storage alerts |

