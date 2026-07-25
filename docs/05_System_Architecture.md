# 05_System_Architecture.md

## Table of Contents

1. [High-Level Architecture Diagram](#high-level-architecture-diagram)
2. [Architecture Overview](#architecture-overview)
3. [Frontend Architecture](#frontend-architecture)
4. [Backend Architecture](#backend-architecture)
5. [Android/Mobile Architecture](#androidmobile-architecture)
6. [Authentication & Security](#authentication--security)
7. [AI Integration](#ai-integration)
8. [Payments & Billing](#payments--billing)
9. [Notifications](#notifications)
10. [Data Storage](#data-storage)
11. [Analytics & Monitoring](#analytics--monitoring)
12. [Deployment & Infrastructure](#deployment--infrastructure)
13. [Scalability & Performance](#scalability--performance)

---

## High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                       CERIUS SYSTEM ARCHITECTURE                    │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER (Android)                      │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  React + TypeScript + Capacitor                             │   │
│  │  ├─ Redux Toolkit (State Management)                        │   │
│  │  ├─ RTK Query (Data Fetching & Caching)                     │   │
│  │  ├─ Material 3 UI Components                                │   │
│  │  └─ Offline Storage (SQLite via Capacitor)                  │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Firebase Client SDK                                        │   │
│  │  ├─ Authentication (Email/Google)                           │   │
│  │  ├─ Cloud Messaging (Push Notifications)                    │   │
│  │  ├─ Crashlytics (Error Reporting)                           │   │
│  │  └─ Analytics (Event Tracking)                              │   │
│  └─────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────┘
                                │
                    ┌───────────┼───────────┐
                    │                       │
              [HTTPS - TLS 1.3]             │
                    │                       │
                    ▼                       ▼

┌──────────────────────────────────────────────────────────────────────┐
│                      API GATEWAY / BACKEND                            │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Node.js + Express (REST API)                               │   │
│  │  ├─ Auth Routes (signup, login, refresh)                    │   │
│  │  ├─ Profile Routes (CRUD operations)                        │   │
│  │  ├─ Meal Plan Routes (generate, fetch, list)                │   │
│  │  ├─ Grocery Routes (CRUD, aggregation)                      │   │
│  │  ├─ Subscription Routes (verify license, sync)              │   │
│  │  └─ Health/Status Routes                                    │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Middleware & Cross-Cutting Concerns                         │   │
│  │  ├─ JWT Authentication                                       │   │
│  │  ├─ Rate Limiting                                            │   │
│  │  ├─ CORS Handling                                            │   │
│  │  ├─ Request Validation (Joi/Zod)                             │   │
│  │  ├─ Error Handling                                           │   │
│  │  ├─ Logging (Winston)                                        │   │
│  │  └─ Compression (Gzip)                                       │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Service Layer (Business Logic)                              │   │
│  │  ├─ AuthService (signup, login, token refresh)              │   │
│  │  ├─ ProfileService (CRUD, preferences)                      │   │
│  │  ├─ MealPlanService (generate, list, manage)                │   │
│  │  ├─ GroceryService (aggregate, manage lists)                │   │
│  │  └─ SubscriptionService (verify, sync with Google Play)     │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Integration Layer                                           │   │
│  │  ├─ OpenAI API (meal plan generation)                        │   │
│  │  ├─ Google Play Billing API                                  │   │
│  │  ├─ Firebase Admin SDK                                       │   │
│  │  └─ Recipe API (Spoonacular/Edamam - optional)              │   │
│  └─────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────┘
                    │                       │
        ┌───────────┼───────────┬───────────┼────────────┐
        │           │           │           │            │
   [MongoDB]  [OpenAI]  [Google Play] [Firebase]   [Email]
        │           │           │           │            │
        ▼           ▼           ▼           ▼            ▼

┌──────────────────────────────────────────────────────────────────────┐
│                       EXTERNAL SERVICES                               │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │ MongoDB      │  │   OpenAI     │  │  Google Play │              │
│  │ Atlas        │  │   API (GPT)  │  │   Billing    │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │  Cloudinary  │  │   SendGrid   │  │   Firebase   │              │
│  │  (Images)    │  │   (Email)    │  │     FCM      │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Architecture Overview

### Design Principles

1. **Separation of Concerns**
   - Frontend: UI/UX logic, state management, offline support
   - Backend: Business logic, data validation, external integrations
   - Database: Data persistence, relationships, indexing

2. **Scalability**
   - Stateless backend (can scale horizontally)
   - Database handles concurrency (MongoDB Atlas)
   - CDN for static assets (Cloudinary for images)
   - Caching strategy (client + server)

3. **Reliability**
   - Error handling at every layer
   - Retry mechanisms for external APIs
   - Health checks and monitoring
   - Graceful degradation

4. **Security**
   - JWT authentication
   - Encrypted communication (HTTPS)
   - Input validation
   - Rate limiting
   - Secure secret management

5. **Maintainability**
   - TypeScript for type safety
   - Modular code structure
   - Clear API contracts
   - Comprehensive logging
   - Automated testing

### Technology Rationale

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | React + TypeScript | Type safety, component reusability, large ecosystem |
| Mobile | Capacitor | Web code → native Android, faster iteration, single codebase |
| Backend | Node.js + Express | JavaScript/TypeScript everywhere, fast development, large ecosystem |
| Database | MongoDB Atlas (only) | Flexible schema, scalable, managed; Firebase used for Auth/FCM/Analytics only — NOT as a datastore (D3, D8) |
| Auth | Firebase Auth | Pre-built OAuth, secure token management, multi-factor auth ready |
| AI | OpenAI API | Best-in-class GPT models, structured output, cost-effective for MVP |
| Payments | Google Play Billing | Required for Android, handles PCI compliance, no custom billing needed |
| Notifications | Firebase FCM | Built into Firebase, reliable delivery, easy to implement |
| Hosting | Railway | Simple deployment, MongoDB Atlas integration, auto-scaling |

---

## Frontend Architecture

### State Management (Redux Toolkit + RTK Query)

**Redux Slices:**
```
store/
├── auth/
│   ├── authSlice.ts (state: token, user, isLoading, error)
│   ├── authMiddleware.ts (persist token, handle refresh)
│   └── authSelectors.ts (isAuthenticated, user, token)
├── profile/
│   ├── profileSlice.ts (state: goals, restrictions, allergies, etc.)
│   └── profileSelectors.ts
├── mealPlans/
│   ├── mealPlanSlice.ts (state: currentPlan, weekOffset, isLoading)
│   └── mealPlanSelectors.ts
├── groceries/
│   ├── grocerySlice.ts (state: items, checked, categories)
│   └── grocerySelectors.ts
├── subscription/
│   ├── subscriptionSlice.ts (state: isPremium, renewalDate, status)
│   └── subscriptionSelectors.ts
└── ui/
    ├── uiSlice.ts (state: isDarkMode, notification, modal)
    └── uiSelectors.ts
```

**RTK Query (API Calls):**
```
services/
├── ceriiusApi.ts (base configuration)
│   ├── /auth/signup (POST)
│   ├── /auth/login (POST)
│   ├── /auth/refresh (POST)
│   ├── /profile (GET, PUT)
│   ├── /mealplans (GET, POST, PUT)
│   ├── /groceries (GET, POST, PUT, DELETE)
│   └── /subscription (GET, POST)
```

**Key Features:**
- Automatic caching of API responses
- Invalidation on mutations
- Automatic refetch on focus
- Optimistic updates for offline UX
- Built-in retry logic

### Component Architecture

```
src/
├── components/
│   ├── shared/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── ErrorBoundary.tsx
│   │   └── ... (reusable components)
│   ├── auth/
│   │   ├── LoginScreen.tsx
│   │   ├── SignupScreen.tsx
│   │   └── ForgotPasswordScreen.tsx
│   ├── onboarding/
│   │   ├── OnboardingFlow.tsx
│   │   ├── GoalStep.tsx
│   │   ├── RestrictionsStep.tsx
│   │   └── ... (other steps)
│   ├── home/
│   │   ├── HomeScreen.tsx
│   │   ├── MealPlanCalendar.tsx
│   │   ├── DayCard.tsx
│   │   └── MealDetail.tsx
│   ├── groceries/
│   │   ├── GroceryListScreen.tsx
│   │   ├── GroceryItem.tsx
│   │   └── CategoryHeader.tsx
│   ├── settings/
│   │   ├── SettingsScreen.tsx
│   │   ├── AccountSection.tsx
│   │   ├── SubscriptionSection.tsx
│   │   └── PreferencesSection.tsx
│   └── subscription/
│       ├── SubscriptionModal.tsx
│       └── SubscriptionManager.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useMealPlans.ts
│   ├── useGroceries.ts
│   ├── useOffline.ts
│   ├── useNotifications.ts
│   └── ... (custom hooks)
├── services/
│   ├── api.ts (RTK Query setup)
│   ├── storage.ts (localStorage + Capacitor storage)
│   ├── notifications.ts (Firebase FCM)
│   ├── analytics.ts (Firebase Analytics)
│   └── ... (other services)
├── utils/
│   ├── validation.ts
│   ├── formatting.ts
│   ├── constants.ts
│   └── ... (utilities)
├── styles/
│   ├── globals.css (Tailwind base)
│   ├── theme.ts (Material 3 theme)
│   └── ... (theme files)
└── App.tsx
```

### Offline Support Strategy

**Offline-First Layers:**
1. **Network Detection:** `useOnline()` hook checks connectivity
2. **Local Cache:** RTK Query caches all API responses
3. **SQLite Persistence:** Capacitor Storage for critical data
   - Current meal plan
   - Grocery list state
   - User preferences
   - Auth tokens

**Sync Strategy on Reconnect:**
```typescript
// When user goes offline:
// 1. All mutations queued in Redux
// 2. Display banner: "You're offline"
// 3. Disable network-dependent features

// When reconnected:
// 1. Flush queued mutations
// 2. Refresh critical data (profile, mealplan)
// 3. Remove offline banner
// 4. Show sync confirmation toast
```

---

## Backend Architecture

### API Structure

**Base URL:** `https://api.cerius.app/v1`

**Endpoints by Domain:**

```
AUTH
├── POST /auth/signup (email, password)
├── POST /auth/login (email, password)
├── POST /auth/refresh (refreshToken)
├── POST /auth/forgot-password (email)
├── POST /auth/reset-password (token, password)
└── POST /auth/logout (optional, client clears token)

PROFILE
├── GET /profile (authenticated)
├── PUT /profile (goals, restrictions, etc.)
├── DELETE /profile (account deletion)
└── GET /profile/me (current user info)

MEAL PLANS
├── POST /mealplans/generate (create new plan)
├── GET /mealplans (list user's plans)
├── GET /mealplans/:id (fetch specific plan)
├── PUT /mealplans/:id (update preferences)
├── DELETE /mealplans/:id (archive plan)
└── GET /mealplans/:id/recipes (meals in plan)

RECIPES
├── GET /recipes/:id (fetch recipe details)
├── GET /recipes/:id/nutrition (macro info)
└── POST /recipes/batch (fetch multiple recipes)

GROCERIES
├── GET /groceries (current week's list)
├── POST /groceries/aggregate (generate from plan)
├── PUT /groceries/:id (update item)
├── DELETE /groceries/:id (remove item)
└── POST /groceries/share (create share token)

SUBSCRIPTION
├── POST /subscription/verify (verify Google Play license)
├── GET /subscription/status (current subscription)
├── POST /subscription/webhook (Google Play updates)
└── POST /subscription/restore (restore purchases)

HEALTH
├── GET /health (service status)
└── GET /metrics (internal monitoring)
```

### Service Layer

**AuthService:**
```typescript
// Handles:
- Email/password signup with validation
- Email/password login with token generation
- Google OAuth callback and user creation
- JWT token refresh (10-min expiry, 7-day refresh)
- Password reset email flow
- Account deletion (soft delete, async purge)
```

**ProfileService:**
```typescript
// Handles:
- Profile creation and updates
- Validation of dietary restrictions
- Allergy list management
- Disliked foods management
- Calorie target calculation
- Profile cache invalidation on change
```

**MealPlanService:**
```typescript
// Handles:
- AI meal plan generation (via OpenAI)
- Plan caching to reduce API calls
- Generation frequency limiting (free tier)
- Plan aggregation for batch requests
- Plan history tracking
- Fallback to recipe DB if AI fails
```

**GroceryService:**
```typescript
// Handles:
- Ingredient aggregation from meal plan
- Quantity summing (e.g., "2 cups flour" + "1 cup flour")
- Categorization by type
- Deduplication
- Checkout state management
- Share link generation
```

**SubscriptionService:**
```typescript
// Handles:
- Google Play license verification
- Subscription status caching (5-min TTL)
- Premium feature gating
- Subscription sync on app launch
- Webhook handling for cancellations
- Churn tracking and alerts
```

### Error Handling Strategy

**Global Error Handler:**
```typescript
// Express middleware catches all errors
app.use((err, req, res, next) => {
  // 1. Log error to Winston + Sentry
  // 2. Classify error type
  //    - Validation error → 400
  //    - Auth error → 401
  //    - Permission error → 403
  //    - Not found → 404
  //    - Rate limit → 429
  //    - Server error → 500
  // 3. Send sanitized response to client
  // 4. Alert monitoring if critical
})

// Errors include:
- Request validation failure (Joi schema)
- Authentication/authorization failures
- Database write failures
- External API timeouts (OpenAI, Google Play)
- File upload failures
- Subscription verification failures
```

**Client Handling:**
```typescript
// RTK Query automatically:
- Retries failed requests (exponential backoff)
- Shows error toast to user
- Allows manual retry
- Logs errors to Crashlytics

// For specific errors:
- Network: "Check your internet connection"
- Auth: "Session expired, please log in"
- API: "Something went wrong, try again"
- Limit: "You've hit your limit, try again later"
```

### Rate Limiting

**Strategy:**
```
- Global: 1000 req/min per IP
- Per-user: 100 req/min (authenticated)
- Per-endpoint:
  - /mealplans/generate: 1 req/week (free), unlimited (premium)
  - /auth/login: 10 attempts/hour
  - /auth/forgot-password: 3 attempts/hour
```

**Implementation:** Redis-backed rate limiter (express-rate-limit)

---

## Android/Mobile Architecture

### Capacitor Integration

**Why Capacitor:**
- Single React codebase → Android APK
- Access to native Android APIs (permissions, storage, notifications)
- Faster development cycle than native Kotlin/Java
- Can integrate with existing Android SDKs if needed

**Key Capacitor Plugins Used:**
```
├── @capacitor/core (base plugin system)
├── @capacitor/storage (local data persistence)
├── @capacitor/filesystem (file access)
├── @capacitor/push-notifications (Firebase integration)
├── @capacitor/keyboard (keyboard management)
├── @capacitor/app (app lifecycle)
└── @capacitor/share (share functionality)
```

### Android Manifest Permissions

```xml
<!-- Network -->
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

<!-- Notifications -->
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />

<!-- Storage -->
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
```

### App Lifecycle

```typescript
import { App } from '@capacitor/app'

// Handle app pause/resume
App.addListener('pause', () => {
  // Save local state
  // Pause non-critical operations
})

App.addListener('resume', () => {
  // Refresh subscriptions
  // Sync data if online
  // Refresh UI
})

// Handle back button
App.addListener('backButton', () => {
  // Custom back navigation
  // Can prevent default (exit) if needed
})
```

### Build Configuration

**Capacitor Configuration (`capacitor.json`):**
```json
{
  "appId": "app.cerius.android",
  "appName": "Cerius",
  "webDir": "dist",
  "bundledWebRuntime": false,
  "plugins": {
    "FirebaseAuthentication": {},
    "FirebaseMessaging": {
      "senderId": "YOUR_FCM_SENDER_ID"
    }
  },
  "server": {
    "androidScheme": "https"
  }
}
```

**Android Build (`android/app/build.gradle`):**
```gradle
android {
  compileSdkVersion 35
  defaultConfig {
    minSdkVersion 24  // Android 7.0+
    targetSdkVersion 35  // Google Play requires target API 35 for new apps (as of Aug 2025)
    versionCode = System.getenv("GITHUB_RUN_NUMBER").toInteger() ?: 1
    versionName = "1.0.0"
  }
  
  signingConfigs {
    release {
      storeFile file(System.getenv('ANDROID_KEYSTORE_PATH') ?: 'debug.keystore')
      storePassword System.getenv('ANDROID_KEYSTORE_PASSWORD') ?: ''
      keyAlias System.getenv('ANDROID_KEY_ALIAS') ?: 'key0'
      keyPassword System.getenv('ANDROID_KEY_PASSWORD') ?: ''
    }
  }
}
```

---

## Authentication & Security

### JWT-Based Authentication Flow

**Sign-Up:**
```
1. User enters email + password
2. Client → POST /auth/signup (email, password)
3. Server validates:
   - Email format
   - Email uniqueness (no duplicate)
   - Password strength (8+ chars, mixed case, number)
4. Server creates user in Firebase:
   - Hash password (bcrypt, 12 rounds)
   - Store user doc in MongoDB (users collection)
5. Server generates tokens:
   - Access token (JWT, 10 min expiry)
   - Refresh token (JWT, 7-day expiry, stored in httpOnly cookie)
6. Return tokens + user object to client
7. Client stores access token in secure storage
8. Client auto-refreshes on expiry
```

**Login:**
```
1. User enters email + password
2. Client → POST /auth/login (email, password)
3. Server validates credentials:
   - Find user by email
   - Compare password hash
   - If fail, increment failed attempts
   - After 5 fails, lock account for 15 min
4. On success:
   - Clear failed attempts counter
   - Generate tokens (same as signup)
   - Return to client
5. Client stores tokens
```

**Token Refresh:**
```
1. Access token expires (10 min)
2. RTK Query intercepts 401 response
3. Client → POST /auth/refresh (with refresh token)
4. Server validates refresh token
5. If valid:
   - Generate new access token
   - Return to client
   - Client retries original request
6. If invalid:
   - Clear user session
   - Redirect to login
```

**Logout:**
```
1. User taps logout
2. Client deletes access token from storage
3. Client clears Redux state
4. Client navigates to login
5. Optional: POST /auth/logout to backend (for audit log)
```

### Secure Token Storage

**Android/Capacitor:**

> ⚠️ **CORRECTION (design review):** `@capacitor/storage` is deprecated (now `@capacitor/preferences`) and stores values in **plaintext SharedPreferences — it is NOT encrypted**. Auth tokens must use a Keystore-backed plugin.

```typescript
// TOKENS → capacitor-secure-storage-plugin (Android Keystore-backed)
import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin'

await SecureStoragePlugin.set({ key: 'authToken', value: token })
const { value } = await SecureStoragePlugin.get({ key: 'authToken' })
await SecureStoragePlugin.remove({ key: 'authToken' })

// NON-SENSITIVE data (theme, cached meal plan, UI prefs) → @capacitor/preferences
import { Preferences } from '@capacitor/preferences'
await Preferences.set({ key: 'theme', value: 'dark' })
```

**Rule of thumb:** JWT access/refresh tokens → secure storage only. Everything else (cached plans, grocery check-state, settings) → Preferences. Never store tokens, passwords, or API keys in Preferences.

### API Security

**HTTPS Enforcement:**
- All traffic TLS 1.3
- HSTS header: `max-age=31536000` (1 year)
- Certificate pinning in production (optional, advanced)

**CORS Configuration:**
```typescript
app.use(cors({
  origin: [
    'capacitor://localhost',  // Android dev
    'https://app.cerius.app',  // Production (if web version)
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))
```

**Input Validation:**
```typescript
// All inputs validated via Zod schema
const signupSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/),
})

// Returns error if invalid
const result = signupSchema.safeParse(req.body)
if (!result.success) {
  return res.status(400).json({ error: result.error.errors })
}
```

**Authorization:**
```typescript
// JWT middleware verifies token and extracts user
const authenticatedRoute = [
  verifyJWT,  // Middleware
  (req, res) => {
    // req.user now contains decoded JWT
    const userId = req.user.id
    // Only allow access to own data
  }
]
```

### Password Security

**Requirements:**
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- Can include special characters (optional)

**Storage:**
```typescript
import bcrypt from 'bcrypt'

// Sign up
const hashedPassword = await bcrypt.hash(password, 12)
// Store hashedPassword in database

// Login
const isValid = await bcrypt.compare(password, storedHash)
```

---

## AI Integration

### OpenAI API Integration

**Architecture:**
```
Client Request
    ↓
Backend: /mealplans/generate endpoint
    ↓
OpenAI API (GPT-4 or GPT-3.5-turbo)
    ↓
Response parsed & validated
    ↓
Store in MongoDB + Cache
    ↓
Return to client
```

**Prompt Engineering:**

```typescript
const buildMealPlanPrompt = (profile: UserProfile): string => {
  return `
You are a professional meal planner. Generate a 7-day personalized meal plan.

USER PROFILE:
- Goal: ${profile.goal}
- Dietary Restrictions: ${profile.restrictions.join(', ')}
- Allergies: ${profile.allergies.join(', ')}
- Disliked Foods: ${profile.dislikedFoods.join(', ')}
- Daily Calorie Target: ${profile.calorieTarget}
- Meals per Day: ${profile.mealsPerDay.join(', ')}

REQUIREMENTS:
1. Generate exactly 7 days (Monday-Sunday)
2. Each day: breakfast, lunch, dinner, and optional snacks
3. NEVER include allergic items
4. NEVER include disliked foods
5. RESPECT dietary restrictions (no meat if vegetarian)
6. Vary meals (no meal repeats within the week)
7. Keep meals simple (cookable in 45 min or less)
8. Provide estimated macros (calories, protein, carbs, fat)

RESPONSE FORMAT (strict JSON):
{
  "days": [
    {
      "date": "Monday",
      "meals": [
        {
          "type": "breakfast",
          "name": "Avocado Toast",
          "ingredients": ["2 slices bread", "1 avocado", "sea salt", "olive oil"],
          "instructions": "Toast bread, mash avocado, spread, drizzle oil",
          "cookingTime": 5,
          "servings": 1,
          "macros": {
            "calories": 350,
            "protein": 12,
            "carbs": 45,
            "fat": 15,
            "fiber": 5
          }
        },
        // ... lunch, dinner, snacks
      ]
    },
    // ... other days
  ]
}

CRITICAL: Return ONLY valid JSON, no markdown, no explanations.
  `
}
```

**API Call & Error Handling:**

```typescript
async function generateMealPlan(profile: UserProfile) {
  const prompt = buildMealPlanPrompt(profile)
  
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',  // or gpt-3.5-turbo for cost savings
      messages: [
        { role: 'system', content: 'You are a meal planning assistant.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,  // Some randomness for variety
      max_tokens: 4000,
      timeout: 30000,  // 30 second timeout
    })
    
    const content = response.choices[0].message.content
    const plan = JSON.parse(content)
    
    // Validate plan structure
    validateMealPlan(plan)
    
    // Store in MongoDB (mealPlans collection)
    await storeMealPlan(userId, plan)
    
    return plan
    
  } catch (error) {
    if (error instanceof OpenAIError) {
      logger.error('OpenAI API error', { error, profile })
      // Try fallback: use recipe database
      return generateFallbackPlan(profile)
    }
    throw error
  }
}
```

**Cost Optimization:**

```typescript
// Strategy 1: Use GPT-3.5-turbo instead of GPT-4
// - 3.5-turbo: $0.0005 per 1K input tokens
// - GPT-4: $0.03 per 1K input tokens
// - For meal plans, 3.5-turbo works 90% of time
// Estimated cost: $0.005-0.01 per plan generation

// Strategy 2: Caching
// - Cache by user profile hash
// - Reuse plans if profile unchanged
// - Reduces API calls by ~30%

// Strategy 3: Fallback to Recipe DB
// - If OpenAI fails/expensive, use rule-based generation
// - Combine recipes from curated DB
// - Quality lower but covers costs

// Monthly projections:
// - 5,000 users generating 1 plan/week = 5,000 plans/week
// - 5,000 × $0.01 × 4.3 weeks = $215/month
// - Acceptable for MVP
```

### Caching Strategy

```typescript
// Redis cache for meal plans
const cacheKey = `plan:${userId}:${profileHash}:${weekOffset}`

// Check cache first
const cached = await redis.get(cacheKey)
if (cached) {
  return cached  // 90% of requests hit cache
}

// If miss, generate
const plan = await generateMealPlan(profile)

// Cache for 7 days
await redis.set(cacheKey, plan, 'EX', 7 * 24 * 60 * 60)

return plan
```

---

## Payments & Billing

### Google Play Billing Integration

**Architecture:**
```
App (Capacitor)
    ↓
Google Play Billing Library
    ↓
Google Play Console (subscription management)
    ↓
Backend (verify purchases)
    ↓
Firebase (store license)
```

**SKU Configuration (Google Play Console):**
```
Subscription SKU: "cerius_premium_monthly"
- Price: $5.99
- Renewal: Monthly
- Trial: 7 days (optional)
- Billing cycle: Standard
- Grace period: 3 days
- Restore: Allow renewal after cancellation

Subscription SKU: "cerius_premium_annual"
- Price: $49.99
- Renewal: Yearly
- Trial: 7 days (optional)
```

**Purchase Flow:**

> ⚠️ **CORRECTION (design review):** `@capacitor-community/in-app-purchases` does not exist as previously specified. Real options for Capacitor + Play Billing:
>
> | Option | Effort | Cost | Verdict |
> |---|---|---|---|
> | **RevenueCat** (`@revenuecat/purchases-capacitor`) | ~1 day | Free to $2.5K MTR, then 1% | ✅ **RECOMMENDED** — handles receipt validation, renewal webhooks, cross-platform entitlements, and grace periods so we don't build a Play Developer API verification pipeline |
> | `cordova-plugin-purchase` (v13+) | ~3-4 days | Free | Works, but we own receipt verification, Pub/Sub webhook handling, and every edge case (grace, pause, resub) |
>
> RevenueCat saves ~2 days of the roadmap's 16 hours budgeted for billing and eliminates the highest-risk custom backend code. The 1% fee only applies after $2.5K monthly tracked revenue — by which point it's trivially worth it.

```typescript
// RevenueCat approach (recommended)
import { Purchases, LOG_LEVEL } from '@revenuecat/purchases-capacitor'

// 1. Configure once at app start
await Purchases.configure({ apiKey: 'goog_xxx' })
await Purchases.logIn({ appUserID: userId })  // ties purchases to our user

// 2. Fetch offerings (configured in RevenueCat dashboard, mapped to Play SKUs)
const offerings = await Purchases.getOfferings()
const monthly = offerings.current?.monthly

// 3. Purchase
const { customerInfo } = await Purchases.purchasePackage({ aPackage: monthly })

// 4. Check entitlement — no manual receipt verification needed
const isPremium = customerInfo.entitlements.active['premium'] !== undefined

// 5. Backend stays in sync via RevenueCat webhooks → POST /subscriptions/webhook
//    (RENEWAL, CANCELLATION, EXPIRATION, BILLING_ISSUE events)
//    Backend updates MongoDB subscriptions collection from webhook payloads
```

**Server-Side Verification:**

```typescript
async function verifyGooglePlayReceipt(receipt: string, userId: string) {
  // Use Google Play Billing Library (Node.js)
  const androidPublisher = google.androidpublisher('v3')
  
  const result = await androidPublisher.purchases.subscriptions.get({
    auth: googleAuthClient,
    packageName: 'app.cerius.android',
    subscriptionId: 'cerius_premium_monthly',
    token: receipt
  })
  
  const purchase = result.data
  
  // Validate
  if (purchase.purchaseState === 'Purchased') {
    // Update subscription in MongoDB
    await updateSubscription(userId, {
      isPremium: true,
      expiresAt: new Date(purchase.expiryTimeMillis),
      subscriptionId: purchase.orderId,
    })
    return true
  }
  
  return false
}
```

**Renewal Tracking:**

```typescript
// Webhook: Google Play sends purchase state changes
app.post('/api/subscription/webhook', async (req, res) => {
  const message = req.body.message
  
  if (message.data) {
    const notification = JSON.parse(
      Buffer.from(message.data, 'base64').toString()
    )
    
    // Handle renewal
    if (notification.eventType === 'SUBSCRIPTION_RENEWED') {
      const userId = notification.userId
      const expiresAt = new Date(notification.expiryTimeMillis)
      
      await updateSubscription(userId, {
        isPremium: true,
        expiresAt,
      })
      
      // Send email: renewal confirmation
      await sendEmail(userId, 'Subscription Renewed', ...)
    }
    
    // Handle cancellation
    if (notification.eventType === 'SUBSCRIPTION_CANCELED') {
      const userId = notification.userId
      
      await updateSubscription(userId, {
        isPremium: false,
        cancelledAt: new Date(),
      })
      
      // Send email: sad to see you go
      await sendEmail(userId, 'Subscription Cancelled', ...)
    }
  }
  
  res.status(200).json({ success: true })
})
```

---

## Notifications

### Push Notification Strategy

**Technology:** Firebase Cloud Messaging (FCM) + Capacitor

**Push Topics:**
```
- weekly-reminder: "Ready to plan next week's meals?"
- subscription-prompt: "Unlock unlimited plans"
- reengagement: "We miss you! See what's new"
- feature-update: "New feature: batch meal planning"
```

**Notification Configuration:**

```typescript
// Request permission on app launch (iOS) or onboarding (Android)
import { PushNotifications } from '@capacitor/push-notifications'

export async function setupPushNotifications() {
  // Request permission (required on iOS)
  const permission = await PushNotifications.requestPermissions()
  
  if (permission.receive === 'granted') {
    // Register for push
    await PushNotifications.register()
  }
  
  // Listen for incoming notifications
  PushNotifications.addListener('pushNotificationReceived', (notification) => {
    console.log('Notification received:', notification)
    // Handle foreground notification (show banner)
  })
  
  PushNotifications.addListener(
    'pushNotificationActionPerformed',
    (notification) => {
      // User tapped notification (background)
      // Navigate to relevant screen
      navigateToMealPlans()
    }
  )
}
```

**Scheduled Notifications (Weekly Reminder):**

```typescript
// Backend: Cloud Functions or cron job
async function sendWeeklyReminders() {
  // Get all users with notifications enabled
  const users = await db.collection('users')
    .where('notifications.enabled', '==', true)
    .get()
  
  for (const user of users.docs) {
    const { notificationTime } = user.data().notifications
    
    // Check if it's the right time (using user's timezone)
    if (isTimeToSend(notificationTime)) {
      await sendNotification(user.id, {
        title: 'Ready to Plan?',
        body: 'Ready to plan next week\'s meals?',
        data: {
          action: 'open_meal_planner',
          deeplink: 'cerius://mealplans'
        }
      })
    }
  }
}

// Firebase Messaging
admin.messaging().sendMulticast({
  tokens: [userFCMToken],
  notification: {
    title: 'Ready to Plan?',
    body: 'Ready to plan next week\'s meals?'
  },
  data: {
    action: 'open_meal_planner'
  },
  android: {
    priority: 'high',
    notification: {
      sound: 'default',
      clickAction: 'FLUTTER_NOTIFICATION_CLICK'
    }
  }
})
```

---

## Data Storage

### MongoDB Document Structure

> ⚠️ **CORRECTION (design review):** The single source of truth for all persistent data is **MongoDB Atlas** (see 06_Database_Design.md and Decision D3/D8). Firestore is **not** used as a datastore in the MVP — Firebase provides Auth, FCM, Analytics, and Crashlytics only. The structure below mirrors 06_Database_Design.md.

**Collections & Documents:**

```
mongodb (cerius-production)/
├── users/{userId}
│   ├── email: string
│   ├── name: string
│   ├── createdAt: timestamp
│   ├── updatedAt: timestamp
│   └── subscription: {
│       isPremium: boolean
│       renewalDate: timestamp
│       subscriptionId: string
│       cancellationDate: timestamp
│     }
│
├── profiles/{userId}
│   ├── userId: string
│   ├── goal: "weight_loss" | "maintenance" | "muscle_gain"
│   ├── restrictions: string[]
│   ├── allergies: string[]
│   ├── dislikedFoods: string[]
│   ├── calorieTarget: number
│   ├── mealsPerDay: string[]
│   ├── updatedAt: timestamp
│   └── preferences: {
│       isDarkMode: boolean
│       notificationsEnabled: boolean
│       notificationTime: string  // "19:00"
│     }
│
├── mealPlans/{planId}
│   ├── userId: string
│   ├── weekStart: timestamp  // Monday of week
│   ├── weekEnd: timestamp
│   ├── days: {
│       monday: {
│         meals: [
│           {
│             type: "breakfast",
│             name: string,
│             ingredients: [...],
│             instructions: string,
│             cookingTime: number,
│             servings: number,
│             macros: { calories, protein, carbs, fat, fiber }
│           },
│           // ... lunch, dinner, snacks
│         ]
│       },
│       // ... tue-sun
│     }
│   ├── createdAt: timestamp
│   └── expiresAt: timestamp  // 30 days
│
├── groceries/{userId}
│   ├── weekStart: timestamp
│   ├── items: [
│       {
│         id: string,
│         name: string,
│         quantity: number,
│         unit: string,
│         category: string,
│         isChecked: boolean,
│         mealIds: string[]  // which meals include this item
│       },
│       // ... more items
│     ]
│   ├── lastUpdated: timestamp
│   └── sharedWith: [{ email, token, expiresAt }]
│
├── mealPlanCache/{userId}/{planHash}
│   ├── plan: {...}  // cached API response
│   ├── createdAt: timestamp
│   └── expiresAt: timestamp  // 7 days
│
└── auditLogs/{logId}
    ├── userId: string
    ├── action: string  // "login", "plan_generated", "subscription_purchased"
    ├── metadata: object
    └── createdAt: timestamp
```

### Indexing Strategy

**Composite Indexes (for queries):**

```
// Query: Get user's meal plans for week
Collection: mealPlans
Filters: userId, weekStart >= X

// Query: Get all users expiring soon
Collection: users
Filters: subscription.isPremium, subscription.renewalDate < X
```

**Single Field Indexes:**
```
- users.email (for login lookups)
- users.createdAt (for analytics)
- mealPlans.userId, weekStart
- groceries.userId, weekStart
- auditLogs.userId, createdAt
```

---

## Analytics & Monitoring

### Analytics Events (Firebase Analytics)

**Funnel Events:**
```
1. app_open
2. sign_up
   - sign_up_method: "email" | "google"
3. profile_completed
4. plan_generated (1st time)
   - generation_time: number (ms)
   - plan_quality_score: number (0-100, calculated)
5. recipe_viewed
6. grocery_list_viewed
7. subscription_prompted
8. subscription_started
   - subscription_type: "trial" | "paid"
   - plan_type: "monthly" | "annual"
9. subscription_cancelled
10. premium_feature_used
```

**Engagement Events:**
```
- plan_regenerated
- grocery_item_checked
- grocery_list_shared
- settings_changed
- notifications_toggled
- app_crash (automatic via Crashlytics)
```

**Funnel Analysis:**
```
Install → Signup → Profile → 1st Plan → Subscribe
100%      60%      40%      35%          5-8%
```

### Crash Reporting (Firebase Crashlytics)

**Automatic Collection:**
- Crashes on app launch
- ANRs (Application Not Responding)
- Exceptions in main thread

**Custom Logging:**
```typescript
import { FirebaseCrashlytics } from '@capacitor-firebase/crashlytics'

// Set user ID for crash analysis
await FirebaseCrashlytics.setUserId({
  userId: user.id
})

// Set custom key-value pairs
await FirebaseCrashlytics.setCustomKey({
  key: 'subscription_status',
  value: isPremium ? 'premium' : 'free'
})

// Log non-fatal exceptions
try {
  await generateMealPlan(profile)
} catch (error) {
  await FirebaseCrashlytics.recordException({
    message: 'Meal plan generation failed',
    code: error.code
  })
}
```

### Performance Monitoring

**Key Metrics:**
```
- App Launch Time: target <2 seconds
- Meal Plan Generation: target <5 seconds
- Recipe Detail Load: target <1 second
- Grocery List Load: target <500ms
- Network latency: target <200ms p95
```

**Implementation (Firebase Performance):**
```typescript
import { Performance } from '@capacitor-firebase/performance'

// Trace custom operation
const trace = await Performance.startTrace({
  name: 'meal_plan_generation'
})

await generateMealPlan(profile)

await Performance.stopTrace({ traceName: 'meal_plan_generation' })
```

---

## Deployment & Infrastructure

### Hosting Architecture

**Frontend (React + Capacitor):**
- Built as Android APK in CI/CD
- Distributed via Google Play Store
- Web version (future) hosted on Vercel or Netlify

**Backend (Node.js + Express):**
- Deployed on Railway.app
- Auto-scaling based on CPU/memory
- Integrated MongoDB Atlas database
- Automatic SSL certificates

**Database (MongoDB):**
- MongoDB Atlas (cloud-hosted)
- M0 free tier (MVP), upgrade to M10 at scale
- Automated backups (7-day retention)
- Replica set for high availability

### CI/CD Pipeline

**GitHub Actions Workflow:**

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test
      - run: npm run lint

  build-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci --prefix backend
      - run: npm run build --prefix backend
      - name: Deploy to Railway
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
        run: railway up

  build-android:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-java@v3
        with:
          java-version: '17'
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - run: npx cap sync android
      - run: cd android && ./gradlew bundleRelease
      - name: Sign APK
        env:
          ANDROID_KEYSTORE: ${{ secrets.ANDROID_KEYSTORE }}
          ANDROID_KEYSTORE_PASSWORD: ${{ secrets.ANDROID_KEYSTORE_PASSWORD }}
        run: ./scripts/sign-apk.sh
      - name: Upload to Play Store
        uses: r0adkll/upload-google-play@v1
        with:
          serviceAccountJsonPlainText: ${{ secrets.PLAY_STORE_SERVICE_ACCOUNT }}
          packageName: app.cerius.android
          releaseFiles: 'android/app/build/outputs/bundle/release/**/*.aab'
          track: internal  # Beta testing first
```

### Environment Variables

**Backend (.env.production):**
```
DATABASE_URL=mongodb+srv://user:password@cluster.mongodb.net/cerius
JWT_SECRET=<long-random-string>
OPENAI_API_KEY=<openai-key>
GOOGLE_PLAY_CREDENTIALS=<json-encoded>
SENDGRID_API_KEY=<sendgrid-key>
FIREBASE_ADMIN_SDK_KEY=<firebase-key>
SENTRY_DSN=<sentry-endpoint>
NODE_ENV=production
PORT=3000
```

**Frontend (capacitor.json + .env):**
```
VITE_API_BASE_URL=https://api.cerius.app/v1
VITE_FIREBASE_CONFIG={...}
VITE_OPENAI_ORG_ID=<org-id>
```

---

## Scalability & Performance

### Horizontal Scaling

**Backend Statelessness:**
```
- No session stored on server
- All state in JWT token or database
- Can spin up multiple Node.js instances
- Load balancer distributes requests (automatic on Railway)
```

**Database Scaling:**
```
- MongoDB Atlas auto-scaling
- Sharding by userId at scale
- Connection pooling (MongoDB handles)
- Read replicas for analytics queries
```

**Caching Layer:**
```
- Redis for:
  - Session tokens (temporarily)
  - Meal plan cache (7-day TTL)
  - Rate limit counters
  - Subscription license cache (5-min)
- Client-side: RTK Query caching
```

### Performance Optimization

**Backend:**
- Gzip compression on all responses
- Database query optimization (indexes)
- Connection pooling
- Request/response validation to fail fast

**Frontend:**
- Code splitting by route
- Lazy loading images via Cloudinary
- Service worker for offline caching
- Local SQLite for critical data

**API:**
- Pagination for list endpoints (default: 50 items/page)
- Only return necessary fields (GraphQL-like field selection in future)
- Batch endpoints for multi-resource queries

### Monitoring & Alerting

**Uptime Monitoring:**
```
- Pingdom/UptimeRobot: checks /health endpoint every minute
- Alerts if > 5 min downtime
- Page notification to on-call engineer
```

**Performance Monitoring:**
```
- Datadog or New Relic for server metrics
- Alert if:
  - Response time > 1s (p95)
  - Error rate > 1%
  - CPU > 80%
  - Memory > 85%
```

**Log Aggregation:**
```
- Winston (backend) → ELK Stack or Datadog
- Capacitor logs → Firebase Crashlytics
- SQL queries logged for slow query analysis
```

**Dashboards:**
```
- Real-time API metrics (requests, latency, errors)
- User analytics (DAU, signups, subscriptions)
- Infrastructure health (CPU, memory, database)
- Business metrics (MRR, churn, retention)
```

---

## Architecture Decision Summary

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Frontend | React + Capacitor | Type safety, fast iteration, single codebase for Android |
| Backend | Node.js + Express | JavaScript everywhere, fast to develop, good for I/O |
| Database | MongoDB Atlas (only) | Flexible schema, managed, low ops; Firestore deferred (D8) |
| Authentication | Firebase Auth + JWT | Secure, pre-built OAuth, manageable tokens |
| AI | OpenAI API | Best quality, cost-effective, structured output |
| Payments | Google Play Billing | Required for Android, handles PCI, no custom billing |
| Notifications | Firebase FCM | Built into Firebase, reliable, easy to scale |
| Hosting | Railway + Atlas | Simple deployment, auto-scaling, integrated databases |
| State Management | Redux + RTK Query | Predictable, testable, excellent caching |
| Error Handling | Firebase Crashlytics | Automatic crash reporting, good for mobile |
| Analytics | Firebase Analytics | Free tier sufficient for MVP, good for funnels |
| Testing | Vitest + Testing Library | Fast, modern, good for React components |

