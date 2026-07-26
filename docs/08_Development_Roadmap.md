# 08_Development_Roadmap.md

## 30-Day MVP Development Timeline

**Goal:** Launch production-ready MVP on Google Play by Day 30

**Team Assumption:** 1 full-time engineer (can be scaled with more team members)

> ⚠️ **TIMELINE HONESTY (design review):** 176 planned hours across ~22 working days leaves near-zero slack. Two external waits are outside our control: Google Play review (24-48h, can reject) and Play Billing/RevenueCat sandbox quirks. Treat Day 30 as the *public launch stretch goal*; Day 30 on the **internal testing track** is the committed goal, with public launch Day 32-37 acceptable. AI assistance (Claude Code) is the main lever that makes even this plausible — but testing hours (Days 19-20) must never be the thing that gets cut.

**Cadence:** 5-day work weeks (Mon-Fri)

---

## Overview Timeline

```
Week 1: Foundation & Setup
├─ Days 1-3: Project setup, CI/CD, database design
├─ Days 4-5: Authentication backend, Login/Signup API
│
Week 2: Core Backend & Frontend Foundation
├─ Days 6-10: Profile API, Meal plan generation setup, React UI scaffold
│
Week 3: Integration & UI
├─ Days 11-15: Meal plan generation (AI), Grocery list API, UI components
│
Week 4: Polish, Testing & Launch
├─ Days 16-20: Subscription integration, notifications, testing
├─ Days 21-30: QA, Play Store setup, pre-launch, launch & monitoring
```

---

## Week 1: Foundation & Setup (Days 1-5)

### Goal
**Set up all infrastructure, CI/CD, and authentication foundation**

### Day 1-2: Project Setup & Infrastructure (2 days, 16 hours)

**Tasks:**
- [ ] Initialize Node.js backend repository
  - ESLint, Prettier, TypeScript config
  - Express project structure
  - Environment variable setup
  - Logging (Winston)
  - MongoDB connection pooling

- [ ] Initialize React + Capacitor frontend
  - Vite build configuration
  - TailwindCSS + Material 3 theming
  - Redux Toolkit + RTK Query setup
  - ESLint, Prettier, TypeScript

- [ ] Set up CI/CD pipeline (GitHub Actions)
  - Backend: test → build → lint
  - Frontend: test → build → bundle APK
  - Automated Play Store deployment

- [ ] Database setup
  - MongoDB Atlas cluster (M0 free tier)
  - Collections + indexes created
  - Backup configured

- [ ] Firebase setup
  - Project created in Firebase Console
  - Authentication enabled (Email + Google)
  - Cloud Messaging (FCM) configured
  - Crashlytics enabled
  - Analytics enabled

**Deliverables:**
- GitHub repos configured (backend + frontend)
- CI/CD pipelines running
- Local dev environment works
- Database ready for schema

**Effort:** 16 hours

**Risk:** Firebase Google auth setup can be complex; start early

---

### Day 3: Authentication Backend (1 day, 8 hours)

**Tasks:**
- [ ] User model + database schema
  - Create `users` collection in MongoDB
  - Validate schema

- [ ] Authentication routes
  - POST /auth/signup (email/password validation)
  - POST /auth/login (credential verification)
  - POST /auth/refresh (JWT refresh)
  - Error handling + validation middleware

- [ ] Password hashing
  - Implement bcrypt (12 rounds)
  - Test password validation

- [ ] JWT token generation/verification
  - Access token (10 min expiry)
  - Refresh token (7-day expiry)
  - Token validation middleware

- [ ] Firebase Auth integration (backend)
  - Setup Firebase Admin SDK
  - Google OAuth callback handler

- [ ] Error handling
  - Global error handler middleware
  - Validation error responses
  - Rate limiting (10 login attempts/hour)

**Deliverables:**
- POST /auth/signup working (email/password)
- POST /auth/login working
- POST /auth/refresh working
- Tokens issued and validated
- Error responses standardized

**Tests:**
- [x] Valid signup creates user
- [x] Duplicate email rejected
- [x] Weak password rejected
- [x] Login with valid credentials
- [x] Login with invalid credentials fails
- [x] Token refresh works
- [x] Expired token requires refresh

**Effort:** 8 hours

**Risk:** Bcrypt is CPU-intensive; test performance

---

### Day 4-5: Login & Signup UI + Integration (2 days, 16 hours)

**Tasks:**
- [ ] React components (Login/Signup screens)
  - Login screen: email, password, remember me
  - Signup screen: email, password (confirm), terms
  - Forgot password screen (email field)
  - Loading states, error messages

- [ ] Forms & validation
  - Email format validation (client-side)
  - Password strength meter
  - Real-time error display
  - Disabled submit button until valid

- [ ] Redux auth slice
  - State: isLoading, user, token, error
  - Actions: signup, login, logout, refreshToken
  - Selectors: isAuthenticated, user, token

- [ ] RTK Query API integration
  - Configure base URL, headers
  - Setup JWT interceptor (auto-add to requests)
  - Error interceptor (auto-refresh on 401)
  - Retry logic

- [ ] Navigation flows
  - Unauthenticated → login/signup screens
  - Authenticated → home screen (with redirect after signup)
  - Logout → back to login

- [ ] Local storage persistence
  - Save JWT token securely
  - Persist auth state
  - Auto-restore session on app start

- [ ] Testing
  - Unit tests for Redux slices
  - Component tests for Login/Signup
  - Integration test: full signup flow

**Deliverables:**
- Login screen functional
- Signup screen functional
- Forgot password flow (email only, backend sends link)
- Tokens persisted + auto-refreshed
- Error messages clear
- App navigation works post-auth

**Tests:**
- [x] Can sign up with valid email/password
- [x] Email validation works
- [x] Weak password rejected
- [x] Can login with valid credentials
- [x] Login with wrong password fails
- [x] Session persists after app restart
- [x] Logout clears session
- [x] 401 triggers auto-refresh

**Effort:** 16 hours

**Cumulative Week 1:** 40 hours

---

## Week 2: Core Backend & Frontend Foundation (Days 6-10)

### Goal
**Complete profile management, meal plan API foundation, and React UI scaffold**

### Day 6: Profile Backend API (1 day, 8 hours)

**Tasks:**
- [ ] Profile data model
  - Create `profiles` collection
  - Schema with validation

- [ ] Profile endpoints
  - GET /profiles (fetch current user)
  - POST /profiles (create new profile)
  - PUT /profiles (update existing)
  - DELETE /profiles (soft delete)

- [ ] Profile validation
  - Zod schema for all fields
  - Calorie target range (1200-3500)
  - Restrictions enum validation
  - Allergies enum validation

- [ ] Database indexing
  - Index on userId (1:1 relationship)
  - Test query performance

- [ ] Error handling
  - Profile not found
  - Profile already exists
  - Validation failures

**Deliverables:**
- GET /profiles working
- POST /profiles working
- PUT /profiles working
- Full validation
- Database indexed

**Tests:**
- [x] Can create profile
- [x] Can fetch profile
- [x] Can update profile
- [x] Duplicate profile rejected
- [x] Invalid goal rejected
- [x] Invalid allergy rejected

**Effort:** 8 hours

---

### Day 7: Onboarding UI (1 day, 8 hours)

**Tasks:**
- [ ] Onboarding flow screens
  - Step 1: Goal selection (radio buttons)
  - Step 2: Restrictions (checkboxes)
  - Step 3: Allergies (checkboxes)
  - Step 4: Disliked foods (text input)
  - Step 5: Calorie target (slider)
  - Step 6: Meals per day (checkboxes)
  - Progress indicator

- [ ] Onboarding state management
  - Redux slice for onboarding
  - Save step state on transition
  - Handle "skip" / "go back"

- [ ] Form submission
  - Collect all data
  - POST /profiles API call
  - Handle errors
  - Redirect to home on success

- [ ] UX polish
  - Smooth transitions between steps
  - Pre-fill defaults
  - Clear descriptions for each field

**Deliverables:**
- Full onboarding flow works
- Redux state persisted
- POST to /profiles successful
- Redirect to home

**Tests:**
- [x] Can step through onboarding
- [x] Can go back to previous step
- [x] Validation on submit
- [x] API call succeeds
- [x] Redirects to home

**Effort:** 8 hours

---

### Day 8: Meal Plan API Foundation (1 day, 8 hours)

**Tasks:**
- [ ] Meal plan data model
  - `mealPlans` collection schema
  - Nested meal structure
  - Recipe fields (ingredients, instructions, macros)

- [ ] Meal plan endpoints (skeleton)
  - POST /mealplans/generate (skeleton, not implemented yet)
  - GET /mealplans (list user's plans)
  - GET /mealplans/:id (fetch single plan)
  - PUT /mealplans/:id (update notes, etc.)
  - DELETE /mealplans/:id

- [ ] Database setup
  - Indexes on userId, weekStart

- [ ] Mock data
  - Create sample meal plan for testing UI later

**Deliverables:**
- Meal plan endpoints structure
- Database schema finalized
- Mock endpoint responses

**Tests:**
- [x] Can fetch meal plans
- [x] Can fetch single plan
- [x] Can delete plan

**Effort:** 8 hours

---

### Day 9: Home Screen & Meal Plan UI (1 day, 8 hours)

**Tasks:**
- [ ] Home screen layout
  - Top navigation (hamburger, title, settings)
  - Week selector (< Monday, Jan 15 >)
  - Meal plan calendar (7 days)
  - Tab bar (Home, Groceries)

- [ ] Meal plan calendar component
  - Day cards showing 3 meals
  - Color-coded by meal type
  - Tap to expand day
  - Swipe to next/previous week

- [ ] Meal detail view (modal or slide-over)
  - Full recipe display
  - Ingredients list
  - Instructions
  - Macros breakdown
  - "Add to Groceries" button

- [ ] Navigation integration
  - Redux state for current week
  - Week offset calculations
  - Persist selected week

**Deliverables:**
- Home screen displays week
- Can swipe between weeks
- Can tap meal to see details
- Detail view shows recipe
- Tab navigation works

**Tests:**
- [x] Can navigate between weeks
- [x] Can tap meal to see detail
- [x] Meal detail shows all info
- [x] Tab switches screens

**Effort:** 8 hours

---

### Day 10: Grocery List API & UI Foundation (1 day, 8 hours)

**Tasks:**
- [ ] Grocery list data model
  - `groceries` collection
  - Items with category, quantity, unit
  - Checked state

- [ ] Grocery endpoints (skeleton)
  - GET /groceries (fetch list)
  - POST /groceries/aggregate (create from plan)
  - PUT /groceries/:itemId (update item)
  - DELETE /groceries/:itemId

- [ ] Grocery UI screen
  - Items list grouped by category
  - Checkboxes to mark purchased
  - Item count progress
  - "Add to Groceries" button (grayed out until plan generated)

- [ ] Mock data
  - Sample grocery list for testing

**Deliverables:**
- Grocery list screen structure
- Endpoints defined
- Database schema ready

**Tests:**
- [x] Can fetch grocery list
- [x] Can mark item as purchased
- [x] Can delete item

**Effort:** 8 hours

**Cumulative Week 2:** 40 hours

---

## Week 3: Integration & AI (Days 11-15)

### Goal
**Implement AI meal plan generation, full grocery list aggregation, and complete core UI**

### Day 11-12: AI Meal Plan Generation (2 days, 16 hours)

**Tasks:**
- [ ] **AI provider bake-off (Day 11 AM, ~4 hrs — per amended D2):**
  - Run 10 test profiles through Gemini Flash AND gpt-4o-mini class
  - Score: restriction compliance (must be 100%), variety, macro plausibility, JSON validity, latency, cost/plan
  - Pick winner; record result in 09_DECISIONS.md
- [ ] LLM integration setup (behind `MealPlanGenerator` interface — one-file provider swap)
  - API key management (environment variables, server-side only)
  - Error handling + retry logic
  - Cost tracking (log API calls)

- [ ] Prompt engineering
  - Build dynamic prompt based on user profile
  - Test with multiple profiles
  - Validate JSON response parsing
  - Iterate on meal quality

- [ ] Meal plan generation endpoint
  - POST /mealplans/generate
  - Call OpenAI API
  - Parse response into meal plan schema
  - Save to database
  - Return to client

- [ ] Caching strategy
  - Cache meal plan by profile hash
  - 7-day TTL
  - Redis integration (optional for MVP, or in-memory)

- [ ] Error handling
  - OpenAI timeout → fallback to recipe database
  - Invalid JSON → retry with cleaner prompt
  - User-facing error message: "Try again in a moment"

- [ ] Testing
  - Test with different profiles (vegetarian, allergies, etc.)
  - Verify meals don't repeat
  - Check macro accuracy
  - Performance test (target: <5 sec)

**Deliverables:**
- POST /mealplans/generate fully functional
- Meals personalized to profile
- No repeats within week
- < 5 second generation time
- Graceful error handling

**Tests:**
- [x] Can generate meal plan
- [x] Plan respects vegetarian restriction
- [x] Plan avoids allergic items
- [x] Plan avoids disliked foods
- [x] No meal repeats
- [x] Generation takes <5 sec
- [x] OpenAI timeout handled
- [x] JSON parse errors handled

**Effort:** 16 hours

**Note:** This is the riskiest/most complex part. Allocate extra time if needed.

---

### Day 13: Free Tier Limiting & Subscription Gating (1 day, 8 hours)

**Tasks:**
- [ ] Free tier logic
  - Track last generation timestamp
  - Enforce 1 generation per week for free users
  - Calculate next available generation time

- [ ] Subscription check
  - Verify user subscription status (check with Google Play)
  - Cache subscription for 5 minutes
  - Premium users: unlimited generations

- [ ] Subscription prompt (UI)
  - Show modal after 3 free generations
  - "Unlock Unlimited Plans" messaging
  - Features list
  - "Try Free 7 Days" button
  - Dismiss option

- [ ] Error handling
  - Rate limit message clear
  - Show next available time

**Deliverables:**
- Free tier limit enforced
- Subscription checked on generation
- Modal shown at right time
- Premium users can generate unlimited

**Tests:**
- [x] Free user can generate 1x/week
- [x] 2nd generation blocked
- [x] Timer shows when available
- [x] Premium user can generate unlimited
- [x] Modal shown after 3 generations

**Effort:** 8 hours

---

### Day 14: Grocery List Aggregation (1 day, 8 hours)

**Tasks:**
- [ ] Ingredient aggregation logic
  - Parse ingredients from meal plan
  - Sum quantities (e.g., 2 cups flour + 1 cup flour = 3 cups flour)
  - Remove duplicates
  - Handle unit conversions (optional for MVP)

- [ ] POST /groceries/aggregate endpoint
  - Accept mealPlanId
  - Aggregate all ingredients
  - Categorize (produce, meat, dairy, etc.)
  - Save to database
  - Return aggregated list

- [ ] Grocery list UI completion
  - "Create Grocery List" button on home
  - Displays aggregated items
  - Edit quantities
  - Check off items
  - Share button

- [ ] Data sync
  - Update list when meal plan changes
  - Persist check state

**Deliverables:**
- Grocery list auto-generated from plan
- Items aggregated (no duplicates)
- Quantities correct
- UI fully functional

**Tests:**
- [x] Ingredients aggregated correctly
- [x] Duplicates removed
- [x] Quantities summed
- [x] Categories correct
- [x] Can mark items purchased
- [x] Check state persists

**Effort:** 8 hours

---

### Day 15: Settings & Notifications Foundation (1 day, 8 hours)

**Tasks:**
- [ ] Settings screen UI
  - Account section (name, email, logout)
  - Subscription section (status, manage)
  - Preferences (dark mode, notifications)
  - About (version, privacy, terms)

- [ ] Dark mode implementation
  - TailwindCSS dark mode
  - Toggle in settings
  - Redux state
  - Persist to localStorage

- [ ] Notification preferences
  - Toggle notifications on/off
  - Time picker (Sunday 7 PM default)
  - Save to profile

- [ ] Settings backend
  - Endpoint to update preferences
  - Validation

- [ ] Navigation
  - Settings accessible from home (gear icon)
  - Back navigation
  - All settings save immediately

**Deliverables:**
- Settings screen fully functional
- Dark mode works
- Notification preferences saved
- Account logout works

**Tests:**
- [x] Can toggle dark mode
- [x] Dark mode persists
- [x] Can change notification time
- [x] Can toggle notifications
- [x] Can logout
- [x] Settings save to database

**Effort:** 8 hours

**Cumulative Week 3:** 40 hours

---

## Week 4: Polish, Testing & Launch (Days 16-30)

### Goal
**Implement subscriptions, thorough testing, and launch on Google Play**

### Day 16-17: Google Play Billing via RevenueCat (2 days, 16 hours)

> ⚠️ **AMENDED (design review):** integration layer is RevenueCat (`@revenuecat/purchases-capacitor`), per amended D7. This replaces custom receipt verification and Play Pub/Sub handling. Realistic saving: ~4-6 hrs, which becomes buffer.

**Tasks:**
- [ ] RevenueCat + Play Billing setup
  - Create RevenueCat project; link Play Console via service account
  - Configure subscription SKUs in Play Console; map to RevenueCat offerings + 'premium' entitlement
  - Install @revenuecat/purchases-capacitor; configure at app start with logIn(userId)
  - Test purchase in sandbox mode (license tester account)

- [ ] Subscription purchase flow
  - "Subscribe" button in app
  - Trigger Google Play Billing sheet
  - Handle purchase result
  - Verify receipt on backend

- [ ] Backend subscription sync (via RevenueCat webhooks — no manual receipt validation)
  - POST /subscriptions/webhook endpoint (verify RevenueCat auth header)
  - Handle INITIAL_PURCHASE, RENEWAL, CANCELLATION, EXPIRATION, BILLING_ISSUE
  - Update MongoDB subscriptions collection; set premium flag on user
  - Client-side: check entitlements.active['premium'] on app start

- [ ] Subscription management screen
  - Show current subscription status
  - Show renewal date
  - Show billing amount
  - "Manage Subscription" link to Play Store
  - "Cancel Subscription" link to Play Store

- [ ] Testing
  - Test sandbox purchases
  - Test subscription status verification
  - Test premium features enable/disable
  - Test subscription cancellation (simulate via backend)

**Deliverables:**
- Subscription purchase working
- Subscriptions verified
- Premium features gated
- Subscription management screen

**Tests:**
- [x] Can initiate purchase
- [x] Can verify purchase receipt
- [x] Premium features enabled after purchase
- [x] Can view subscription status
- [x] Cancellation via Play Store works

**Effort:** 16 hours

---

### Day 18: Firebase Cloud Messaging Setup (1 day, 8 hours)

**Tasks:**
- [ ] FCM configuration
  - Firebase project setup (already done Week 1)
  - Add Capacitor Push Notifications plugin

- [ ] Notification request permission
  - Ask user permission on onboarding or app launch
  - Handle permission denial gracefully

- [ ] Weekly reminder notification
  - Cloud Function (cron) to send weekly reminder
  - Send Sunday 7 PM (user's timezone if possible, or UTC)
  - Notification text: "Ready to plan next week's meals?"
  - Deep link to meal plan generation

- [ ] Notification handling (app side)
  - Foreground: show banner
  - Background: navigate to home screen
  - Tap: open app

- [ ] Testing
  - Test permission flow
  - Send test notification manually
  - Verify deep linking works

**Deliverables:**
- Notifications permission working
- Can send test notifications
- Weekly reminder set up
- Deep links work

**Tests:**
- [x] Can request permission
- [x] Can send notification
- [x] Tap notification opens app
- [x] Notification shows correct message

**Effort:** 8 hours

---

### Day 19: Analytics & Error Tracking (1 day, 8 hours)

**Tasks:**
- [ ] Firebase Analytics integration
  - Track key events:
    * app_open
    * sign_up
    * profile_created
    * plan_generated
    * recipe_viewed
    * subscription_started
  - Custom event properties (source, type, etc.)

- [ ] Firebase Crashlytics
  - Automatic crash collection
  - Custom logging for errors
  - Set user ID for crash attribution

- [ ] Error logging
  - Backend: Winston logs to Datadog or CloudWatch
  - Frontend: Sentry or Firebase error reporting

- [ ] Testing
  - Log test events in Firebase console
  - Simulate crash and verify Crashlytics catches it
  - Check Analytics dashboard

**Deliverables:**
- Analytics events tracked
- Crashes reported
- Error logs accessible

**Tests:**
- [x] Events appear in Firebase console
- [x] Crashes captured and reported
- [x] Custom properties logged

**Effort:** 8 hours

---

### Day 20: QA Testing & Bug Fixes (1 day, 8 hours)

**Tasks:**
- [ ] Full user flow testing
  - Sign up → Profile → Plan → Groceries → Subscribe
  - Test on actual Android device (not just emulator)
  - Test on multiple Android versions (API 24+)

- [ ] Edge case testing
  - Network failure scenarios
  - Offline mode (cached data)
  - Session timeout + refresh
  - Rate limit behavior

- [ ] UI/UX testing
  - Responsive layout on different screen sizes
  - Dark mode appearance
  - Animations smooth (no jank)
  - Accessibility (keyboard nav, contrast)

- [ ] Performance testing
  - App launch time < 2 sec
  - Meal plan generation < 5 sec
  - List scrolling smooth (60 FPS)
  - Memory usage reasonable

- [ ] Bug tracking & fixing
  - Log all bugs found
  - Prioritize critical (crashes) → high (broken features) → medium (UX) → low (polish)
  - Fix critical + high priority bugs
  - Note low priority bugs for post-launch

**Deliverables:**
- All critical bugs fixed
- Full user flows tested
- Performance acceptable

**Tests:**
- [x] Full signup → subscription flow works
- [x] App doesn't crash
- [x] Performance targets met
- [x] Offline mode works (cached data)
- [x] Responsive on different screen sizes

**Effort:** 8 hours

**Cumulative Days 16-20:** 40 hours

---

### Day 21-22: Google Play Store Setup & Submission (2 days, 16 hours)

**Tasks:**
- [ ] Google Play Console setup
  - Developer account created ($ fee if not already)
  - App listed in Play Console

- [ ] App signing
  - Generate app signing key
  - Sign APK/AAB with release key
  - Upload keystore to secure location

- [ ] Play Store listing
  - App title: "xeriusFit - AI Meal Planner"
  - Short description (80 chars)
  - Full description (with screenshots)
  - App icon (512x512 PNG)
  - Feature graphics (1024x500)
  - Screenshots (up to 8, for phones)
  - Video (optional, can skip for MVP)

- [ ] Store listing localization
  - English (required)
  - Spanish, French, German (optional, can add later)

- [ ] Store listing content
  - Privacy policy URL
  - Terms of service URL
  - Contact email
  - Content rating (run through questionnaire)

- [ ] Release notes
  - Version 1.0.0
  - Key features listed

- [ ] Subscription configuration
  - Subscribe SKUs configured
  - Pricing set ($5.99/month, $49.99/year)
  - Trial period (7 days)
  - Renewal terms clear

- [ ] App review checklist
  - No fake/purchased reviews
  - No misleading claims
  - Privacy policy accurate
  - Health disclaimers present
  - No unauthorized permissions

- [ ] Internal testing
  - Upload to Google Play internal testing track
  - Test on multiple devices
  - Verify subscription in sandbox

**Deliverables:**
- Play Console listing complete
- App signed + ready for release
- Screenshots uploaded
- All required fields filled
- Subscription configured
- Ready for review

**Effort:** 16 hours

---

### Day 23: Pre-Launch Preparation (1 day, 8 hours)

**Tasks:**
- [ ] Health & safety compliance
  - Verify privacy policy is GDPR-compliant
  - Add dietary advice disclaimer in app
  - No medical claims (it's meal planning, not medical advice)

- [ ] Legal review (self-review)
  - Privacy policy: data collection, retention, deletion
  - Terms of service: subscription, cancellation
  - Disclaimers: not medical advice, verify allergies

- [ ] Final testing
  - Test all subscription flows (trial, paid, cancellation)
  - Test all notifications work
  - Test profile changes update meal plans
  - Test offline functionality
  - Verify app doesn't crash on 10+ minute inactivity

- [ ] Performance verification
  - Check app size (<100 MB)
  - Verify network calls aren't excessive
  - Check battery usage reasonable

- [ ] ASO (App Store Optimization) prep
  - Keywords: "meal planner", "AI diet", "grocery list", "healthy recipes"
  - App title includes main keyword
  - Description includes keywords naturally

- [ ] Marketing collateral prep
  - Screenshots styled nicely
  - Description compelling
  - Email to beta testers (if any)
  - Social media drafts (optional for MVP)

**Deliverables:**
- App ready for Play Store review
- Legal/compliance checked
- Performance verified
- ASO keywords identified

**Effort:** 8 hours

---

### Day 24: Play Store Review & Approval (1 day, flexible)

**Tasks:**
- [ ] Submit app to Google Play Review
  - Choose beta/internal testing first (safer)
  - Or go straight to production release

- [ ] Monitor review status
  - Google Play review typically 24-48 hours
  - Check Play Console daily for feedback
  - If rejected, address issues + resubmit

- [ ] Prepare for approval
  - Have update ready if needed
  - Monitor crash reports (Crashlytics)
  - Have support email ready

**Deliverables:**
- App submitted for review
- Monitoring dashboard set up

**Effort:** Flexible (waiting for review)

---

### Day 25-30: Launch & Optimization (6 days, 32 hours)

**Day 25: App Goes Live**

- [ ] App appears in Google Play Store
- [ ] Activate paid user acquisition campaigns (day 25, if approved)
  - Google UAC ($500-1000 budget)
  - Facebook/Instagram ads ($500-1000 budget)
  
- [ ] Send email to beta testers (download + rate)

- [ ] Monitor metrics (Day 1)
  - Installs
  - Crashes (Crashlytics)
  - Sign-up conversion
  - Payment conversions

**Day 26-30: Optimize & Iterate**

- [ ] Daily monitoring
  - Installs/day
  - Conversion rates
  - Churn rate
  - Crash trends
  - Revenue

- [ ] Quick fixes if needed
  - Crash hotfixes (deploy ASAP)
  - UI/UX improvements based on analytics
  - Performance optimizations

- [ ] Early cohort analysis
  - Who's converting to paid?
  - Where are users coming from?
  - What's the drop-off point?

- [ ] Engagement improvements
  - Tweak notification messaging
  - Add early retention hooks (streaks, badges)
  - Monitor feature usage

- [ ] Post-launch support
  - Respond to user reviews
  - Address common issues
  - Collect feedback for v1.1

**Deliverables:**
- App live on Google Play
- User acquisition campaigns running
- Metrics dashboard live
- Support process in place
- Initial user cohort analyzed

**Effort:** 32 hours (monitoring, optimization, support)

**Cumulative Days 21-30:** 56 hours

**Total 30-Day Effort:** 40 + 40 + 40 + 56 = **176 hours (approximately 4.4 weeks of full-time dev)**

---

## Risk Mitigation & Contingency

### Critical Path Items (Don't Skip)

1. **AI Meal Plan Generation** - If this doesn't work, app has no value
   - **Mitigation:** Start Day 11; test heavily
   - **Contingency:** Fallback to rule-based generation (recipe DB) if AI fails

2. **Google Play Billing** - Required for subscriptions
   - **Mitigation:** Test early in sandbox
   - **Contingency:** Manual subscription verification (not ideal)

3. **Authentication** - Without this, no multi-user system
   - **Mitigation:** Complete by Day 5
   - **Contingency:** None; must be done

### High-Risk, High-Reward Items

1. **AI Meal Quality** - Makes or breaks user satisfaction
   - **Risk:** Repetitive meals, poor recipes, wrong macros
   - **Mitigation:** Extensive prompt testing, user beta feedback
   - **Timeline:** Days 11-12 + Days 19-20 (QA)

2. **Google Play Review** - Can reject app for policy violations
   - **Risk:** Delayed launch, iteration needed
   - **Mitigation:** Careful review of Play Store policies; submit to internal testing first
   - **Timeline:** Submit Day 24, live ideally by Day 27

### What Can Be Cut If Behind

**If running 1-2 days behind:**
- Cut: Animated transitions (but keep functional)
- Cut: Polish on edge cases (fix critical bugs only)
- Cut: Localization (English only for launch)
- Keep: Core flows (sign up, plan, groceries, subscribe)

**If running 3+ days behind:**
- Cut: Notifications (can add Day 1 post-launch)
- Cut: Dark mode (light mode only)
- Cut: Premium feature limits (give all users full access for launch, monetize later)
- Keep: Everything else

**Do NOT cut:**
- Authentication
- AI meal plan generation
- Grocery list
- Basic UI
- Google Play submission process
- Testing & bug fixes

---

## Success Criteria for Launch

### Minimum Viable Criteria

- [ ] App installs without crashing
- [ ] User can sign up and log in
- [ ] User can complete onboarding
- [ ] User can generate meal plan in <10 seconds
- [ ] User can view meals and groceries
- [ ] Subscription purchase flow works
- [ ] No unhandled crashes (Crashlytics < 0.5%)
- [ ] App passes Google Play review

### Ideal Launch Criteria

- [ ] Installs: 500+ (first week)
- [ ] Signup conversion: > 40% of installs
- [ ] Trial-to-paid conversion: > 15% of signups
- [ ] Paid users: 20+
- [ ] MRR: $100+
- [ ] Crash rate: 0%
- [ ] Average rating: 4.0+ (if rated)
- [ ] AI generation time: < 5 sec
- [ ] No critical bugs reported

### Post-Launch (First Month)

- [ ] Iterate on early user feedback
- [ ] Monitor churn rate (target: < 8%/month)
- [ ] Push notifications for retention
- [ ] Analyze cohort data
- [ ] Plan v1.1 features based on data

---

## Deployment Checklist (Go/No-Go)

**Day 24 (Before Submitting to Play Store):**

- [ ] All authentication flows tested
- [ ] Meal plan generation < 5 seconds
- [ ] All groceries aggregating correctly
- [ ] Subscription purchase works end-to-end
- [ ] Dark mode works (optional but nice)
- [ ] Notifications permission working
- [ ] App doesn't crash on any happy path
- [ ] Crash rate < 0.5%
- [ ] Performance: launch < 2 sec, meal gen < 5 sec
- [ ] Privacy policy finalized & linked
- [ ] Health disclaimer in app
- [ ] All Play Store listing fields complete
- [ ] Screenshots final & professional
- [ ] App icon & graphics done
- [ ] Version number set to 1.0.0

**Go:** All checked  
**No-Go:** Any unchecked (fix + re-check before submit)

---

## Post-Launch First Week Monitoring

**Metrics to Track Hourly:**
- App installs/hour
- Signup rate
- Crash rate
- Error rate

**Metrics to Track Daily:**
- Total installs
- Conversion to paid
- DAU (Daily Active Users)
- Average session length
- Churn rate

**Daily Standup Items:**
- Any critical crashes?
- Negative review trends?
- User feedback themes?
- Revenue tracking

**Quick Fixes (Deploy in < 2 hours):**
- Crash hotfixes
- API error responses
- Rate limit issues
- Notification problems

**Slow Fixes (Deploy in < 24 hours):**
- UI bugs
- Performance improvements
- Feature adjustments
- Copy/messaging updates

