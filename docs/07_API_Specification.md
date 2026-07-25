# 07_API_Specification.md

## API Overview

**Base URL:** `https://api.cerius.app/v1`

**Protocol:** REST over HTTPS (TLS 1.3)

**Version:** 1.0.0

**Response Format:** JSON

**Authentication:** JWT (Bearer token in Authorization header)

**Rate Limiting:** Per-user + global limits

---

## Authentication

### JWT Token Format

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Token Payload:**
```json
{
  "sub": "user_id",
  "email": "user@example.com",
  "iat": 1705353000,
  "exp": 1705356600,
  "type": "access"
}
```

**Token Expiry:**
- Access token: 10 minutes
- Refresh token: 7 days (httpOnly cookie)

---

## Standard Response Format

### Success Response

```json
{
  "success": true,
  "data": {...},
  "meta": {
    "timestamp": "2025-01-20T10:30:00Z",
    "version": "1.0.0"
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "INVALID_EMAIL",
    "message": "Email format is invalid",
    "details": {
      "field": "email",
      "reason": "not_a_valid_email"
    }
  },
  "meta": {
    "timestamp": "2025-01-20T10:30:00Z",
    "version": "1.0.0"
  }
}
```

### Common Error Codes

| Code | Status | Meaning |
|------|--------|---------|
| INVALID_REQUEST | 400 | Request validation failed |
| INVALID_EMAIL | 400 | Email format invalid |
| WEAK_PASSWORD | 400 | Password doesn't meet requirements |
| UNAUTHORIZED | 401 | No valid token provided |
| TOKEN_EXPIRED | 401 | Token expired, use refresh endpoint |
| FORBIDDEN | 403 | User doesn't have permission |
| NOT_FOUND | 404 | Resource not found |
| CONFLICT | 409 | Resource already exists (e.g., email) |
| RATE_LIMIT_EXCEEDED | 429 | Too many requests |
| INTERNAL_ERROR | 500 | Server error |
| SERVICE_UNAVAILABLE | 503 | Service temporarily down |

---

## Authentication Endpoints

### POST /auth/signup

**Create a new user account**

**Request:**
```json
{
  "email": "alex@example.com",
  "password": "SecurePass123"
}
```

**Validation:**
- Email: valid format, unique
- Password: 8+ chars, uppercase, lowercase, number

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "alex@example.com",
      "name": null,
      "createdAt": "2025-01-15T10:30:00Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": 600
    }
  }
}
```

**Error Responses:**
```json
// Email invalid
{ "success": false, "error": { "code": "INVALID_EMAIL" } }

// Password weak
{ "success": false, "error": { "code": "WEAK_PASSWORD" } }

// Email already exists
{ "success": false, "error": { "code": "CONFLICT", "message": "Email already registered" } }
```

---

### POST /auth/login

**Authenticate and get access token**

**Request:**
```json
{
  "email": "alex@example.com",
  "password": "SecurePass123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "alex@example.com",
      "name": "Alex Johnson"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": 600
    }
  }
}
```

**Error Responses:**
```json
// Wrong credentials
{ "success": false, "error": { "code": "UNAUTHORIZED", "message": "Invalid email or password" } }

// Account locked (too many failed attempts)
{ "success": false, "error": { "code": "FORBIDDEN", "message": "Account locked for 15 minutes" } }
```

**Rate Limiting:** 10 attempts per hour

---

### POST /auth/google

**Authenticate via Google OAuth**

**Request:**
```json
{
  "idToken": "google_id_token_from_oauth_flow"
}
```

**Response (200 OK / 201 Created):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "alex@example.com",
      "name": "Alex Johnson",
      "avatar": "https://lh3.googleusercontent.com/..."
    },
    "tokens": {
      "accessToken": "...",
      "expiresIn": 600
    },
    "isNewUser": true
  }
}
```

---

### POST /auth/refresh

**Refresh access token using refresh token**

**Request:**
```json
{
  "refreshToken": "refresh_token_from_cookie_or_storage"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "accessToken": "new_jwt_token",
    "expiresIn": 600
  }
}
```

**Error Response:**
```json
// Refresh token expired or invalid
{ "success": false, "error": { "code": "UNAUTHORIZED", "message": "Invalid refresh token" } }
```

---

### POST /auth/forgot-password

**Request password reset email**

**Request:**
```json
{
  "email": "alex@example.com"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Password reset email sent. Link valid for 24 hours."
  }
}
```

**Note:** Always returns success (privacy - don't reveal if email exists)

---

### POST /auth/reset-password

**Reset password with token from email**

**Request:**
```json
{
  "token": "reset_token_from_email",
  "password": "NewSecurePass456"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Password reset successfully. Please log in."
  }
}
```

**Error Responses:**
```json
// Token expired
{ "success": false, "error": { "code": "UNAUTHORIZED", "message": "Reset token expired" } }

// Invalid token
{ "success": false, "error": { "code": "UNAUTHORIZED", "message": "Invalid reset token" } }
```

---

### POST /auth/logout

**Clear session (optional, client mainly clears token)**

**Request:** Empty body

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  }
}
```

---

## Profile Endpoints

### GET /profiles

**Fetch current user's profile**

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439012",
    "userId": "507f1f77bcf86cd799439011",
    "goal": "weight_loss",
    "restrictions": ["vegetarian"],
    "allergies": ["dairy"],
    "dislikedFoods": ["mushrooms"],
    "calorieTarget": 2000,
    "mealsPerDay": ["breakfast", "lunch", "dinner"],
    "preferences": {
      "isDarkMode": true,
      "notificationsEnabled": true,
      "notificationTime": "19:00"
    },
    "createdAt": "2025-01-15T10:35:00Z",
    "updatedAt": "2025-01-20T14:45:00Z"
  }
}
```

**Error Response:**
```json
// Profile doesn't exist (user needs onboarding)
{ "success": false, "error": { "code": "NOT_FOUND", "message": "Profile not found" } }
```

---

### POST /profiles

**Create new profile (onboarding)**

**Request:**
```json
{
  "goal": "weight_loss",
  "restrictions": ["vegetarian"],
  "allergies": ["dairy"],
  "dislikedFoods": ["mushrooms"],
  "calorieTarget": 2000,
  "mealsPerDay": ["breakfast", "lunch", "dinner"]
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439012",
    "userId": "507f1f77bcf86cd799439011",
    "goal": "weight_loss",
    // ... full profile
  }
}
```

**Error Response:**
```json
// Profile already exists
{ "success": false, "error": { "code": "CONFLICT", "message": "Profile already exists" } }
```

---

### PUT /profiles

**Update existing profile**

**Request:**
```json
{
  "goal": "maintenance",
  "calorieTarget": 2200,
  "restrictions": ["vegetarian", "gluten_free"]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    // Updated profile
  }
}
```

---

### PUT /profiles/preferences

**Update only preferences (dark mode, notifications, etc.)**

**Request:**
```json
{
  "isDarkMode": false,
  "notificationsEnabled": true,
  "notificationTime": "20:00"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "preferences": {
      "isDarkMode": false,
      "notificationsEnabled": true,
      "notificationTime": "20:00"
    }
  }
}
```

---

### DELETE /profiles

**Delete profile and all user data**

**Query Parameters:**
```
?confirm=true
```

**Request:** Empty body

**Response (204 No Content)**

**Error Response:**
```json
// Missing confirmation
{ "success": false, "error": { "code": "INVALID_REQUEST", "message": "Confirm deletion with ?confirm=true" } }
```

---

## Meal Plan Endpoints

### POST /mealplans/generate

**Generate a new meal plan**

**Request:**
```json
{
  "weeks": 1
}
```

**Query Parameters:**
- `weeks`: 1-4 (default: 1, premium can do 2-4)

**Response (201 Created, may take 2-5 seconds):**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439013",
    "userId": "507f1f77bcf86cd799439011",
    "weekStart": "2025-01-20T00:00:00Z",
    "weekEnd": "2025-01-26T23:59:59Z",
    "days": {
      "monday": {
        "meals": [
          {
            "id": "meal_1",
            "type": "breakfast",
            "name": "Avocado Toast",
            "ingredients": [
              { "name": "bread", "quantity": 2, "unit": "slices" },
              { "name": "avocado", "quantity": 1, "unit": "whole" }
            ],
            "instructions": "Toast bread. Mash avocado. Spread on toast.",
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
            "source": "ai_generated"
          },
          // ... lunch, dinner, snacks
        ]
      },
      // ... tue-sun
    },
    "createdAt": "2025-01-20T10:35:00Z"
  }
}
```

**Error Responses:**
```json
// Free tier limit reached
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Free users can generate 1 plan per week",
    "meta": {
      "nextAvailableAt": "2025-01-27T10:35:00Z"
    }
  }
}

// AI generation failed
{
  "success": false,
  "error": {
    "code": "SERVICE_UNAVAILABLE",
    "message": "Meal plan generation temporarily unavailable"
  }
}
```

**Rate Limiting:**
- Free tier: 1 per week
- Premium tier: Unlimited

---

### GET /mealplans

**List user's meal plans**

**Query Parameters:**
```
?limit=5&offset=0&sort=-weekStart
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "plans": [
      {
        "id": "507f1f77bcf86cd799439013",
        "weekStart": "2025-01-20T00:00:00Z",
        "weekEnd": "2025-01-26T23:59:59Z",
        "isActive": true,
        "createdAt": "2025-01-20T10:35:00Z"
      },
      // ... more plans (without full meal details for performance)
    ],
    "pagination": {
      "total": 8,
      "limit": 5,
      "offset": 0,
      "hasMore": true
    }
  }
}
```

---

### GET /mealplans/:id

**Fetch a specific meal plan**

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    // Full meal plan with all details
  }
}
```

**Error Response:**
```json
{ "success": false, "error": { "code": "NOT_FOUND" } }
```

---

### GET /mealplans/:id/recipes

**Get recipes from a meal plan (list view)**

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "recipes": [
      {
        "id": "meal_1",
        "name": "Avocado Toast",
        "type": "breakfast",
        "day": "monday",
        "cookingTime": 5,
        "difficulty": "easy",
        "macros": {
          "calories": 350,
          "protein": 12
        },
        "imageUrl": "https://res.cloudinary.com/..."
      }
      // ... more recipes
    ]
  }
}
```

---

### PUT /mealplans/:id

**Update meal plan (mark favorite recipes, add notes, etc.)**

**Request:**
```json
{
  "notes": "Family loved Monday's pasta",
  "favoriteRecipeIds": ["meal_1", "meal_3"]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    // Updated plan
  }
}
```

---

### DELETE /mealplans/:id

**Delete/archive a meal plan**

**Response (204 No Content)**

---

## Grocery List Endpoints

### GET /groceries

**Get current week's grocery list**

**Query Parameters:**
```
?weekStart=2025-01-20
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439014",
    "userId": "507f1f77bcf86cd799439011",
    "weekStart": "2025-01-20T00:00:00Z",
    "items": [
      {
        "id": "item_1",
        "name": "Avocado",
        "quantity": 2,
        "unit": "whole",
        "category": "produce",
        "isChecked": true,
        "mealIds": ["meal_1"],
        "addedAt": "2025-01-20T10:35:00Z"
      },
      // ... more items
    ],
    "totalItems": 25,
    "checkedItems": 8,
    "categoryGroups": {
      "produce": [...],
      "meat_seafood": [...],
      "dairy_eggs": [...],
      "pantry": [...],
      "frozen": [...],
      "other": [...]
    }
  }
}
```

---

### POST /groceries/aggregate

**Generate grocery list from meal plan**

**Request:**
```json
{
  "mealPlanId": "507f1f77bcf86cd799439013"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    // New grocery list with aggregated items
  }
}
```

---

### PUT /groceries/:itemId

**Update grocery item**

**Request:**
```json
{
  "quantity": 3,
  "isChecked": true
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "item": {
      "id": "item_1",
      "name": "Avocado",
      "quantity": 3,
      "unit": "whole",
      "isChecked": true
    }
  }
}
```

---

### DELETE /groceries/:itemId

**Remove item from grocery list**

**Response (204 No Content)**

---

### POST /groceries/:id/share

**Generate shareable link for grocery list**

**Request:**
```json
{
  "expiresIn": 7,
  "format": "text"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "shareUrl": "https://cerius.app/share/grocery/abc123xyz",
    "shareToken": "abc123xyz",
    "expiresAt": "2025-01-27T10:35:00Z",
    "formats": {
      "text": "Grocery List\n\nPRODUCE\n- Avocado (2)\n- Spinach (1 bag)\n...",
      "markdown": "# Grocery List\n## PRODUCE\n- Avocado (2)\n...",
      "html": "<h1>Grocery List</h1><h2>PRODUCE</h2><ul><li>Avocado (2)</li>..."
    }
  }
}
```

---

### POST /groceries/clear-checked

**Remove all checked items**

**Request:** Empty body

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Cleared 8 checked items",
    "remainingItems": 17
  }
}
```

---

## Subscription Endpoints

### POST /subscriptions/verify

**Verify Google Play subscription license**

**Request:**
```json
{
  "packageName": "app.cerius.android",
  "subscriptionId": "cerius_premium_monthly",
  "purchaseToken": "google_play_purchase_token"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "isPremium": true,
    "subscriptionId": "cerius_premium_monthly",
    "purchaseTime": "2025-01-15T14:30:00Z",
    "expiryTime": "2025-02-15T14:30:00Z",
    "autoRenewing": true,
    "orderId": "GPA.1234-5678-9101112"
  }
}
```

**Error Response:**
```json
// Subscription not active
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Subscription is not active"
  }
}
```

---

### GET /subscriptions/status

**Get current subscription status**

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "status": "active",
    "plan": "monthly",
    "isPremium": true,
    "renewalDate": "2025-02-15T14:30:00Z",
    "price": 5.99,
    "currency": "USD",
    "startDate": "2025-01-15T14:30:00Z",
    "trialEndDate": "2025-01-22T14:30:00Z",
    "cancelledDate": null
  }
}
```

---

### POST /subscriptions/cancel

**Cancel subscription (placeholder - actual cancellation via Play Store)**

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Please cancel your subscription in Google Play Store settings",
    "link": "https://play.google.com/store/account/subscriptions"
  }
}
```

---

## Health & Status Endpoints

### GET /health

**Service health check**

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2025-01-20T10:35:00Z",
    "services": {
      "database": "ok",
      "cache": "ok",
      "openai": "ok",
      "firebase": "ok"
    }
  }
}
```

---

## Pagination

**List endpoints support pagination:**

```
GET /mealplans?limit=50&offset=0&sort=-createdAt
```

**Parameters:**
- `limit`: Items per page (default: 50, max: 100)
- `offset`: Number of items to skip (default: 0)
- `sort`: Sort field with direction (+/-) (default: -createdAt)

**Response includes:**
```json
{
  "pagination": {
    "total": 250,
    "limit": 50,
    "offset": 0,
    "hasMore": true,
    "page": 1,
    "totalPages": 5
  }
}
```

---

## Rate Limiting

### Global Limits

```
1000 requests per minute per IP address
```

**Headers:**
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 987
X-RateLimit-Reset: 1705356600
```

### Per-User Limits

```
100 requests per minute per authenticated user
```

### Endpoint-Specific Limits

| Endpoint | Limit |
|----------|-------|
| POST /auth/login | 10/hour |
| POST /auth/forgot-password | 3/hour |
| POST /mealplans/generate | 1/week (free), unlimited (premium) |
| POST /subscriptions/verify | 10/day |

**Response when limit exceeded (429):**
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests",
    "meta": {
      "retryAfter": 60
    }
  }
}
```

---

## Versioning

**URL Versioning:**
```
https://api.cerius.app/v1/...
https://api.cerius.app/v2/...
```

**Old versions deprecated after 6 months**

**Clients should send API version in header:**
```
Accept-Version: 1.0.0
```

---

## Webhooks (Future)

**Google Play Subscription Updates:**

```
POST https://api.cerius.app/webhooks/google-play/pubsub

Headers:
X-Goog-MessageId: message-id
X-Goog-Delivery-Attempt: 1

Body:
{
  "message": {
    "data": "base64-encoded-subscription-update"
  }
}
```

**Events:**
- SUBSCRIPTION_PURCHASED
- SUBSCRIPTION_RENEWED
- SUBSCRIPTION_CANCELLED
- SUBSCRIPTION_PAUSED
- SUBSCRIPTION_RESUMED

---

## CORS Configuration

**Allowed Origins:**
```
Origin: capacitor://localhost (development)
Origin: https://app.cerius.app (production web)
```

**Allowed Methods:**
```
GET, POST, PUT, DELETE, OPTIONS
```

**Allowed Headers:**
```
Content-Type, Authorization, Accept, X-Requested-With
```

---

## Error Handling Best Practices

### Always Include Error Codes

```json
{
  "success": false,
  "error": {
    "code": "INVALID_EMAIL",
    "message": "Email address is not valid",
    "details": {
      "field": "email"
    }
  }
}
```

### Provide Actionable Error Messages

✅ Good:
```
"Email must be between 5 and 254 characters"
```

❌ Bad:
```
"Validation failed"
```

### Preserve User Context

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "You've reached your weekly limit",
    "meta": {
      "retryAfter": 86400,
      "resetAt": "2025-01-27T10:35:00Z",
      "limit": 1,
      "current": 1
    }
  }
}
```

---

## API Documentation

**Live Documentation:** https://docs.cerius.app/api

Generated from this spec using Swagger/OpenAPI tools.

---

## Changelog

### v1.0.0 (2025-01-20)
- Initial API release
- All core endpoints (auth, profiles, meal plans, groceries, subscriptions)

### v1.1.0 (Planned)
- Analytics endpoints
- Recipe ratings
- Social sharing

### v2.0.0 (Planned)
- GraphQL support
- WebSocket for real-time updates
- Batch operations

