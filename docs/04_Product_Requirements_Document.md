# 04_Product_Requirements_Document.md

## Table of Contents

1. [User Stories](#user-stories)
2. [Core User Flows](#core-user-flows)
3. [Screen Specifications](#screen-specifications)
4. [Navigation Architecture](#navigation-architecture)
5. [Subscription & Billing](#subscription--billing)
6. [Onboarding](#onboarding)
7. [Empty States](#empty-states)
8. [Error States](#error-states)
9. [Edge Cases](#edge-cases)
10. [Acceptance Criteria](#acceptance-criteria)

---

## Canonical Free-Tier & Paywall Rules (single source of truth)

> ⚠️ **CORRECTION (design review):** Earlier drafts mixed "1 plan/week" and "after 3 generations" as the free limit. The canonical rules are below; every other mention in this document defers to this section.

1. **Free tier limit:** 1 successful plan generation per rolling 7 days (tracked by `lastGenerationAt` timestamp per user).
2. **HARD paywall:** When a locked free user taps "Generate", show the subscription modal with the countdown ("Available again in 4d 12h"). Dismissing returns them to their existing plan — generation stays blocked until the timer expires or they subscribe.
3. **SOFT upsell prompt:** Shown after the user's **3rd cumulative successful generation** (≈ week 3 of usage — they've now experienced the value three times). Fully dismissible via "Remind Later". Re-shown at most once per subsequent generation, and never more than once per 7 days.
4. **Premium:** unlimited generations; neither modal ever shown.

Rationale: the hard limit protects AI API costs; the soft prompt converts at the moment of demonstrated habit, not before value is proven.

---

## User Stories

### Authentication & Onboarding

**US-001:** Email Sign-up
```
As a new user,
I want to sign up with my email,
So that I can create an account without needing social logins.

Acceptance Criteria:
- User can enter email and password
- Password validation: min 8 chars, 1 upper, 1 lower, 1 number
- Duplicate email shows error: "Email already exists"
- Confirmation email sent (optional for MVP; accept as "verified" if we skip)
- Account created and auto-logged in
- Redirects to profile setup (onboarding)
```

**US-002:** Google OAuth Sign-up
```
As a new user,
I want to sign up with Google,
So that I can quickly create an account without remembering passwords.

Acceptance Criteria:
- "Sign up with Google" button available
- OAuth flow opens Google consent screen
- On successful auth, user account created with email from Google
- Profile setup flow initiated
- Handles case where user already has Google account
```

**US-003:** Forgotten Password
```
As a user who forgot my password,
I want to reset it via email,
So that I can regain access to my account.

Acceptance Criteria:
- "Forgot password?" link on login screen
- User enters email
- Confirmation: "Check your email"
- Email contains reset link (valid for 24 hours)
- Reset link opens password change form
- New password validated (same rules as sign-up)
- Redirects to login on success
```

**US-004:** Remember Me / Session Persistence
```
As a returning user,
I want to stay logged in,
So that I don't need to re-authenticate every time.

Acceptance Criteria:
- JWT token stored in secure storage (encrypted)
- Token refreshed automatically when expired
- "Logout" button clears token and redirects to login
- Token persists across app restarts
- Token cleared on uninstall
```

### Profile Setup & Preferences

**US-005:** Initial Profile Setup
```
As a new user,
I want to set my dietary goals and restrictions,
So that meal plans are personalized to my needs.

Acceptance Criteria:
- Multi-step onboarding form (can skip later)
- Fields:
  * Primary Goal: [Weight Loss / Maintenance / Muscle Gain]
  * Dietary Restrictions: [Vegetarian / Vegan / Gluten-Free / Keto / None]
  * Allergies: [Multi-select: Peanuts, Tree Nuts, Dairy, Shellfish, etc.]
  * Disliked Foods: [Text input, comma-separated list]
  * Caloric Target: [1200-3500 range, slider or input]
  * Meals per Day: [Breakfast + Lunch + Dinner / Include Snacks]
- Save button creates profile
- Validation on caloric target (reasonable range)
- Redirects to meal plan generation on completion
```

**US-006:** Edit Profile Preferences
```
As a user,
I want to update my profile settings,
So that I can keep my preferences current.

Acceptance Criteria:
- Settings/Profile screen accessible from main menu
- Same fields as US-005
- "Save Changes" button
- Confirmation toast: "Profile updated"
- Changes take effect on next plan generation
- Can delete profile (with confirmation)
```

### Meal Plan Generation

**US-007:** Generate Weekly Meal Plan
```
As a user,
I want to generate a personalized meal plan,
So that I have a week of meals planned.

Acceptance Criteria:
- "Generate Plan" button on home screen
- Loading state: spinner + "Creating your meal plan..."
- Generation takes <5 seconds
- Shows 7-day plan (Mon-Sun)
- Each day shows: Breakfast, Lunch, Dinner (± Snacks if selected)
- Each meal shows: Name, image, macros (cal/protein/carbs/fat), cooking time
- Plan includes only dishes matching user preferences
- Plan avoids repeating meals within same week
- Plan respects dietary restrictions (no meat for vegetarians, etc.)
- Error handling: If API fails, show "Try Again" button + fallback plan option
```

**US-008:** Regenerate Plan (Free Tier Limit)
```
As a free user,
I want to regenerate my meal plan,
But only once per week,
So I don't abuse the service.

Acceptance Criteria:
- Free tier: "Generate" button disabled after 1 generation/week
- Shows timer: "Next generation available in X days"
- Premium users: "Unlimited regenerations"
- Tracking timestamp of last generation in backend
- Bypass timer only after subscription purchase
- Clear messaging about free tier limits
```

**US-009:** Batch Plan Generation (Premium)
```
As a premium user,
I want to generate 2-4 weeks of meal plans,
So I can meal prep in advance.

Acceptance Criteria:
- Premium feature: "Generate 2-4 weeks" option
- Users select number of weeks: [2 / 3 / 4]
- Loading takes <10 seconds
- Returns 14-28 days of plans
- No meal repeats across weeks
- Respects same dietary constraints as weekly plan
```

### Meal Plan Viewing

**US-010:** View Weekly Plan in Calendar
```
As a user,
I want to see my meal plan in a calendar view,
So I can quickly scan the week.

Acceptance Criteria:
- Home screen shows 7-day calendar (Mon-Sun)
- Each day card shows:
  * Date (e.g., "Monday, Jan 15")
  * Breakfast meal name (preview)
  * Lunch meal name (preview)
  * Dinner meal name (preview)
  * Tap anywhere on day to expand
- Scroll horizontally to move between weeks
- Current day highlighted with blue border
- Color-coded meals (breakfast=yellow, lunch=green, dinner=red)
```

**US-011:** View Meal Details
```
As a user,
I want to see full recipe details for a meal,
So I know how to cook it.

Acceptance Criteria:
- Tapping meal opens detail screen:
  * Full meal name
  * High-quality image
  * Cooking time (e.g., "30 min")
  * Servings (e.g., "2 servings")
  * Macros breakdown: calories, protein, carbs, fat, fiber
  * Ingredients list (with quantities)
  * Step-by-step cooking instructions
  * "Add to Groceries" button (auto-adds to that week's list)
  * Share button (optional for MVP)
  * Back button or swipe to return
```

**US-012:** Scroll Through Multiple Recipes
```
As a user,
I want to easily navigate between meal details,
So I can review multiple options without returning to calendar.

Acceptance Criteria:
- From detail screen, can swipe left/right to move between meals
- Shows which meal you're viewing (e.g., "Monday Lunch")
- Swipe animation is smooth
- Back button available to return to calendar
```

### Grocery List Management

**US-013:** Auto-Generated Grocery List
```
As a user,
I want an auto-generated grocery list,
So I don't have to manually compile it.

Acceptance Criteria:
- "Groceries" tab shows list from current week's plan
- Ingredients auto-aggregated (e.g., "2 cups flour" + "1 cup flour" = "3 cups flour")
- Grouped by category:
  * Produce
  * Meat & Seafood
  * Dairy & Eggs
  * Pantry/Dry Goods
  * Frozen
  * Other
- Each item shows quantity and unit (e.g., "2 lbs chicken")
- No duplicates (same item never appears twice)
```

**US-014:** Manage Grocery List
```
As a user,
I want to interact with the grocery list,
So I can track my shopping.

Acceptance Criteria:
- Checkbox next to each item (mark as "purchased")
- Swipe to delete item (undo available)
- Edit quantity: tap item → edit qty → save
- "Clear Completed" button removes all checked items
- "Select All" checkbox
- Counts: "12/18 items" progress bar
- Persists across sessions
```

**US-015:** Share Grocery List
```
As a user,
I want to share my grocery list,
So I can send it to family or import into notes.

Acceptance Criteria:
- "Share" button on grocery list screen
- Share options: SMS, Email, Copy to Clipboard, Save as PDF
- Format is readable and organized by category
- Includes header: "xeriusFit Grocery List - Week of Jan 15"
- Recipients can view but can't edit
```

**US-016:** Multi-Week Grocery List (Premium)
```
As a premium user,
I want to view aggregated groceries for 2-4 weeks,
So I can do bulk shopping.

Acceptance Criteria:
- Premium feature
- If user has 2+ weeks of plans, show "View 2 Weeks" button
- Multi-week list aggregates and sums quantities
- Same grouping and editing as single-week list
- Prevents buying duplicates across weeks
```

### Subscription & Payments

**US-017:** Subscription Prompt
```
As a free user,
I want to be offered a subscription,
So I can unlock unlimited features.

Acceptance Criteria:
- Soft upsell prompt per Canonical Free-Tier Rules (after 3rd cumulative generation, ≤1x/7 days):
  * "Unlock Unlimited Plans"
  * Features list: "Unlimited regenerations, batch plans, premium recipes"
  * "Try Free for 7 Days" button
  * "Subscribe Now" button
  * "Remind Later" button (re-shown per Canonical Free-Tier Rules — max 1x per 7 days)
- Not intrusive; dismissible
- Appears on home screen, not during content viewing
```

**US-018:** Purchase Subscription
```
As a user,
I want to purchase a subscription,
So I can access premium features.

Acceptance Criteria:
- Tapping "Subscribe" or "Try Free" opens Google Play Billing sheet
- Billing screen shows:
  * Price: $5.99/month or $49.99/year
  * Auto-renewal disclosure: "Renews automatically"
  * Cancel anytime: "You can cancel anytime in Play Store settings"
  * Terms of service link
  * Privacy policy link
- "Confirm" button initiates Google Play purchase flow
- If 7-day trial: "Start Free Trial" button shown
- Purchase confirmation: "Welcome to Premium!"
- Premium features now enabled
- Subscription manager accessible in Settings
```

**US-019:** Manage Subscription
```
As a premium user,
I want to manage my subscription,
So I can view renewal date or cancel.

Acceptance Criteria:
- Settings → Subscription section shows:
  * Subscription status: "Active"
  * Renewal date: "Renews on Feb 15, 2026"
  * Price: "$5.99/month"
  * Billing method (last 4 digits of card)
  * "Manage Subscription" button (opens Google Play app)
- "Cancel Subscription" button takes to Play Store (Google's flow)
- Clear: "Cancellations effective immediately"
- Cancel confirmation screen shows until renewal date
```

**US-020:** Restore Purchase (Multi-Device)
```
As a premium user on a new device,
I want my subscription to carry over,
So I don't lose access.

Acceptance Criteria:
- On login with different device, check Google Play license
- If active subscription, auto-enable premium features
- "Restore Purchases" button in Settings as fallback
- Clear messaging: "Premium features active on this device"
- No duplicate charges
```

### Notifications

**US-021:** Weekly Reminder
```
As a user,
I want a weekly reminder to plan,
So I don't forget.

Acceptance Criteria:
- Default: Sunday 7 PM notification
- Notification text: "Ready to plan next week's meals?"
- Tap opens app to home screen (ready to generate)
- Customizable time in Settings
- Can be disabled in Settings
- Sent via Firebase Cloud Messaging
- Only sent if opted in (ask on onboarding)
```

**US-022:** Notification Opt-In/Out
```
As a user,
I want to control notifications,
So I'm not spammed.

Acceptance Criteria:
- On onboarding: "Enable notifications?" toggle
- Settings → Notifications:
  * "Weekly Reminders" toggle
  * "Time to notify" picker
- Backend tracks preference
- Respects system-level notification settings
- Never send without permission
```

### Settings & Account

**US-023:** Settings Screen
```
As a user,
I want to access settings,
So I can manage my account and preferences.

Acceptance Criteria:
- Accessible from home screen (gear icon or menu)
- Sections:
  * Account: Name, Email, Logout
  * Subscription: Status, billing, cancel
  * Preferences: Notifications, dark mode, caloric target
  * About: App version, privacy policy, terms, feedback
  * Delete Account: (with confirmation)
- All changes save immediately
```

**US-024:** Dark Mode
```
As a user,
I want to use dark mode,
So I can use the app in low light.

Acceptance Criteria:
- Settings → Appearance → "Dark Mode" toggle
- Applies to entire app immediately
- Follows Material 3 dark theme
- Persists across sessions
- Toggle: System / Light / Dark
```

### Analytics (Internal)

**US-025:** Track User Behavior
```
As the product team,
We want to track user actions,
So we can optimize the app.

Acceptance Criteria:
- Firebase Analytics tracks:
  * app_open
  * sign_up (email vs google)
  * profile_completed
  * plan_generated
  * subscription_started
  * subscription_cancelled
  * feature_used (e.g., "grocery_list_shared")
- Crash reporting enabled (Firebase Crashlytics)
- No personally identifiable data in events
- Can filter by cohort in Firebase console
```

---

## Core User Flows

### Flow 1: New User → First Meal Plan (Happy Path)

```
1. Install app
2. See splash/onboarding screen
3. Tap "Sign Up with Email"
   → Email field, Password field
   → "Sign Up" button
4. Enter email (e.g., alex@example.com)
5. Enter password (validated on input)
6. Tap "Sign Up"
   → Account created
   → JWT token stored
7. Redirect to Profile Setup
8. Enter:
   - Goal: Weight Loss
   - Restriction: Vegetarian
   - Allergies: Dairy
   - Disliked foods: "Brussels sprouts, mushrooms"
   - Caloric target: 2000
   - Meals: Breakfast, Lunch, Dinner
9. Tap "Complete Setup"
10. Redirect to Home Screen
11. Show: "Let's create your first meal plan!"
12. Tap "Generate Plan"
    → Loading spinner (2-5 sec)
    → AI generates plan
13. Display 7-day plan:
    - Monday: Avocado toast, Greek salad, Pasta primavera
    - Tuesday: Oatmeal, Quinoa bowl, Stir-fry tofu
    - ... etc
14. User taps "Monday" to see details
15. View meal detail: "Avocado Toast"
    - Ingredients list
    - Instructions
    - 350 cal, 12g protein, 45g carbs, 15g fat
16. Tap "Add to Groceries"
    → Item added to grocery list
17. User returns to calendar
18. Taps "Groceries" tab
19. Views list: "Avocado (2), Bread (1 loaf), ..."
20. Checks off items as purchased
21. After 3 plan generations, see:
    "Unlock Unlimited Plans" modal
22. Tap "Try Free 7 Days"
    → Google Play Billing opens
    → Confirms purchase
23. "Welcome to Premium!"
24. Can now generate unlimited plans

Key Moments:
- First meal plan under 10 seconds (< 5 ideal)
- Recipe detail clearly shows how to cook
- Grocery list auto-built and organized
- Subscription prompt not pushy but visible
```

### Flow 2: Returning User → Weekly Planning

```
1. Open app
2. Logged in (session persisted)
3. Home screen shows current week's plan (cached)
4. Notification at 7 PM Sunday: "Ready to plan next week?"
5. Tap notification
   → Opens home screen
6. Current plan shows "Week of Jan 15"
7. Button: "Generate Next Week"
8. Tap button
   → Loading...
   → New plan generated
9. Calendar swaps to show "Week of Jan 22"
10. User reviews Monday:
    - All new meals (not repeats from last week)
    - Respects preferences
11. Taps "Groceries" tab
12. Shows aggregated list for all planned meals
13. Can swipe right to view "Previous Week" if needed
14. Checks off groceries
15. Shares list to wife via SMS
16. Life continues; xeriusFit is done

Key Moments:
- Second-week experience frictionless
- Plan generation still fast
- Grocery list auto-aggregated
- Sharing makes xeriusFit useful for household
```

### Flow 3: Premium User → Batch Planning

```
1. Premium user navigates to home
2. Current week visible
3. Button: "Plan Ahead"
4. Tap button
   → Modal: "How many weeks? [2 / 3 / 4]"
5. Select "3 weeks"
6. Tap "Generate"
   → Loading... (5-10 sec)
   → 21-day plan generated
7. Calendar now shows 3 weeks:
   - Week 1 (current)
   - Week 2
   - Week 3
8. Tap "Groceries" tab
   → Aggregated list for all 3 weeks
   → Shows quantities: "8 lbs chicken, 4 cups rice, ..."
9. User can review and adjust quantities
10. Shares complete list to grocery delivery service
11. Has 3 weeks of stress-free meals

Key Moments:
- Premium feature adds real value
- Batch planning saves hours
- Sharing integration useful
- Clear upsell story
```

---

## Screen Specifications

### 1. Login Screen

**Layout:**
```
┌─────────────────────────┐
│                         │
│    XERIUSFIT Logo          │  (top, centered, 60px)
│    (Meal + AI icon)     │
│                         │
│  "Your AI Meal Planner" │  (tagline, gray, 14px)
│                         │
├─────────────────────────┤
│                         │
│ Email [____________]    │  (text field, error state shown)
│                         │
│ Password [____________] │  (password field, show/hide toggle)
│                         │
│ [ ] Remember me         │  (checkbox, light gray)
│                         │
│ [LOGIN BUTTON (blue)]   │  (48px height, full width - 32px margin)
│                         │
├─────────────────────────┤
│                         │
│ [Sign up with Google]   │  (secondary button, border + icon)
│                         │
│ [Create New Account]    │  (text link, blue, 14px)
│                         │
│ [Forgot Password?]      │  (text link, gray, 14px)
│                         │
└─────────────────────────┘
```

**Interactions:**
- Email field: validate on blur (email format)
- Password field: 6+ chars minimum
- Login button: disabled until both fields valid
- Error states: inline below field, red text
- Loading: button shows spinner, disabled
- Success: JWT stored, navigate to home

**Dark Mode:** Adjust text/background contrast per Material 3

---

### 2. Onboarding / Profile Setup (Multi-Step)

**Step 1: Goal Selection**
```
┌─────────────────────────┐
│ Step 1 of 5             │
│ [Close X]               │
├─────────────────────────┤
│                         │
│ What's Your Goal?       │  (headline)
│                         │
│ ( ) Weight Loss         │  (radio button + icon)
│ ( ) Maintenance         │
│ (●) Muscle Gain         │  (pre-selected for gym-goer persona)
│                         │
│ (Description of impact) │
│ "We'll optimize meals   │
│  for protein and calorie│
│  intake."               │
│                         │
│      [NEXT BUTTON]      │  (enabled after selection)
│                         │
└─────────────────────────┘
```

**Step 2: Dietary Restrictions**
```
┌─────────────────────────┐
│ Step 2 of 5             │
│ [Close X]               │
├─────────────────────────┤
│                         │
│ Dietary Restrictions?   │
│ (Select all that apply) │
│                         │
│ ☐ Vegetarian            │  (checkbox)
│ ☐ Vegan                 │
│ ☐ Gluten-Free           │
│ ☐ Keto                  │
│ ☐ Paleo                 │
│ ☐ Dairy-Free            │
│ ☐ None                  │  (mutually exclusive)
│                         │
│ [BACK]  [NEXT]          │
│                         │
└─────────────────────────┘
```

**Step 3: Allergies**
```
┌─────────────────────────┐
│ Step 3 of 5             │
├─────────────────────────┤
│                         │
│ Allergies?              │
│ (Select any that apply) │
│                         │
│ ☐ Peanuts               │  (checkbox)
│ ☐ Tree Nuts             │
│ ☐ Shellfish             │
│ ☐ Fish                  │
│ ☐ Dairy                 │
│ ☐ Eggs                  │
│ ☐ Soy                   │
│ ☐ Wheat                 │
│                         │
│ [BACK]  [NEXT]          │
│                         │
└─────────────────────────┘
```

**Step 4: Disliked Foods & Target**
```
┌─────────────────────────┐
│ Step 4 of 5             │
├─────────────────────────┤
│ Disliked Foods?         │
│ [________________]      │  (text field)
│ Comma-separated         │  (hint)
│                         │
│ Daily Calorie Target?   │
│                         │
│ [1200] ———●——— [3500]  │  (slider, input shows current value)
│  ▼  2000  ▲            │
│                         │
│ (Estimated BMR: 1800)   │  (reference info, gray)
│                         │
│ [BACK]  [NEXT]          │
│                         │
└─────────────────────────┘
```

**Step 5: Meals Per Day & Summary**
```
┌─────────────────────────┐
│ Step 5 of 5             │
├─────────────────────────┤
│ Meals Per Day?          │
│                         │
│ ☐ Breakfast             │
│ ☐ Lunch                 │
│ ☐ Dinner                │
│ ☐ Snacks                │
│                         │
│ (All checked by default)│
│                         │
│ Summary:                │
│ Goal: Weight Loss       │
│ Vegetarian: Yes         │
│ Allergies: Dairy        │
│ Target: 2000 cal        │
│                         │
│ [BACK]  [COMPLETE]      │
│                         │
└─────────────────────────┘
```

**Interactions:**
- Multi-step form saves state locally (not persisted until "Complete")
- Can go back to any step
- "Close" cancels (confirm dialog)
- "Complete" sends POST /profile/setup with all data
- On completion, redirect to home with generated plan

---

### 3. Home Screen - Meal Plan Calendar

```
┌─────────────────────────┐
│ ☰   xeriusFit   ⚙️          │  (top nav: menu, title, settings)
├─────────────────────────┤
│                         │
│ Week of Jan 15          │  (header, date range)
│                         │
│ [< Previous] [> Next]   │  (week navigation)
│                         │
├─────────────────────────┤
│ Mon, Jan 15             │
│ ┌─────────────────────┐ │
│ │ 🥒 Avocado Toast    │ │  (breakfast, yellow bg)
│ │ 🥗 Greek Salad      │ │  (lunch, green bg)
│ │ 🍝 Pasta Primavera  │ │  (dinner, red bg)
│ └─────────────────────┘ │  (tap to expand)
│                         │
│ Tue, Jan 16             │
│ ┌─────────────────────┐ │
│ │ 🥣 Oatmeal          │ │
│ │ 🍚 Quinoa Bowl      │ │
│ │ 🍜 Stir-fry Tofu    │ │
│ └─────────────────────┘ │
│                         │
│ (... Wed, Thu, Fri, Sat, Sun)
│                         │
├─────────────────────────┤
│ [GENERATE NEW PLAN]     │  (prominent CTA)
│ or                      │
│ "Next generation: 5d 2h"│  (if free tier used)
│                         │
│ ┌─ Tabs ─┐              │
│ │ Home   │ Groceries │  │
│ └─ Home ─┘              │
│                         │
└─────────────────────────┘
```

**Interactions:**
- Tap day card → expands to show full day, then can tap individual meal
- Swipe left/right to move between weeks (smooth animation)
- "Generate New Plan" button opens loading state → generates plan
- Tabs switch between home and groceries

---

### 4. Meal Detail Screen

```
┌─────────────────────────┐
│ [< Back]  Monday Lunch  │
├─────────────────────────┤
│                         │
│    [High-res image]     │  (full width, 200px height)
│    Greek Salad          │  (title overlay)
│                         │
├─────────────────────────┤
│ 30 min cook time        │
│ 2 servings              │
│                         │
│ Macros (Serving):       │
│ ─────────────────       │
│ 350 cal                 │
│ Protein: 12g            │
│ Carbs: 45g              │
│ Fat: 15g                │
│ Fiber: 5g               │
│                         │
├─────────────────────────┤
│ INGREDIENTS             │
│ ✓ 2 cups spinach        │  (checkbox, checked if in grocery list)
│ ✓ 1 cup tomatoes        │
│ ○ 1/2 cup feta          │  (unchecked if allergy)
│ ✓ 2 tbsp olive oil       │
│ ...                     │
│                         │
│ [ADD ALL TO GROCERIES]  │
│                         │
├─────────────────────────┤
│ INSTRUCTIONS            │
│                         │
│ 1. Chop all vegetables  │
│ 2. Mix in large bowl    │
│ 3. Add dressing         │
│ 4. Toss and serve       │
│                         │
├─────────────────────────┤
│ [SHARE] [SAVE]          │  (actions: optional for MVP)
│                         │
│ [< Back Meal] [Next Meal >]  (swipe navigation)
│                         │
└─────────────────────────┘
```

**Interactions:**
- Back button returns to calendar
- Tap ingredient → can add/remove from grocery list
- "Add All to Groceries" adds entire meal's ingredients
- Swipe left/right to move between meals
- Smooth animations on scroll

---

### 5. Grocery List Screen

```
┌─────────────────────────┐
│ Groceries               │
│ Week of Jan 15          │
├─────────────────────────┤
│                         │
│ 12 / 18 items           │  (progress indicator)
│ ─────────────────       │  (progress bar)
│                         │
│ [SHARE LIST] [CLEAR ✓]  │  (actions)
│                         │
├─ PRODUCE ─────────────┤
│ ☑ Avocado (2)           │  (checkbox, icon, qty)
│ ☑ Spinach (1 bag)       │
│ ○ Tomatoes (4)          │
│ ○ Bell Peppers (3)      │
│                         │
├─ MEAT & SEAFOOD ──────┤
│ ○ Chicken Breast (2 lbs)│
│ ○ Ground Turkey (1 lb)  │
│                         │
├─ DAIRY & EGGS ────────┤
│ ☑ Greek Yogurt (1 cup) │
│ ○ Eggs (1 dozen)       │
│                         │
├─ PANTRY ──────────────┤
│ ☑ Rice (2 cups cooked) │
│ ○ Pasta (1 box)        │
│ ○ Olive Oil            │
│                         │
│                         │
│ [Edit] [Delete >]       │  (swipe actions on item)
│                         │
└─────────────────────────┘
```

**Interactions:**
- Tap checkbox to mark as purchased
- Swipe item left to delete (undo available)
- Tap item to edit quantity
- "Clear ✓" removes all checked items
- "Share List" opens share sheet
- Persists across sessions

---

### 6. Subscription Modal

```
┌─────────────────────────┐
│                         │
│  UNLOCK UNLIMITED       │
│  MEAL PLANS             │
│                         │
│  ✓ Unlimited plans      │
│  ✓ Batch 4-week plans   │
│  ✓ Premium recipes      │
│  ✓ No ads               │
│                         │
│  Try FREE for 7 days    │
│  Then $5.99/month       │
│                         │
│  [TRY FREE 7 DAYS]      │  (primary CTA)
│  [SUBSCRIBE NOW]        │  (secondary)
│  [REMIND ME LATER]      │  (tertiary, text link)
│                         │
│  Cancel anytime.        │  (fine print)
│  Privacy Policy         │  (link)
│                         │
└─────────────────────────┘
```

**Interactions:**
- "Try Free" initiates Google Play Billing with trial
- "Subscribe" goes directly to paid
- "Remind Me Later" dismisses (shows again in 3 generations)
- Privacy/Terms links open web views

---

### 7. Settings Screen

```
┌─────────────────────────┐
│ Settings                │
├─────────────────────────┤
│                         │
│ ACCOUNT                 │
│ ┌─────────────────────┐ │
│ │ Name: Alex Johnson  │ │  (editable)
│ │ Email: alex@ex.com  │ │  (not editable)
│ │ [LOGOUT]            │ │
│ └─────────────────────┘ │
│                         │
│ SUBSCRIPTION            │
│ ┌─────────────────────┐ │
│ │ Status: Premium     │ │
│ │ Renews: Feb 15      │ │
│ │ $5.99/month         │ │
│ │ [MANAGE]            │ │  (opens Play Store)
│ │ [CANCEL]            │ │
│ └─────────────────────┘ │
│                         │
│ PREFERENCES             │
│ ┌─────────────────────┐ │
│ │ Notifications       │ │
│ │ [Toggle]            │ │
│ │ Remind at 7:00 PM   │ │  (time picker)
│ │                     │ │
│ │ Appearance          │ │
│ │ [System / Light / Dark] │  (radio)
│ │                     │ │
│ │ Calorie Target      │ │
│ │ [2000]              │ │  (editable)
│ └─────────────────────┘ │
│                         │
│ ABOUT                   │
│ ┌─────────────────────┐ │
│ │ App Version: 1.0.0  │ │
│ │ [Privacy Policy]    │ │
│ │ [Terms of Service]  │ │
│ │ [Send Feedback]     │ │
│ │ [Rate on Play Store]│ │
│ │ [Delete Account]    │ │  (danger zone)
│ └─────────────────────┘ │
│                         │
└─────────────────────────┘
```

**Interactions:**
- All settings save immediately (no "Save" button)
- "Manage" subscription opens Google Play app
- "Delete Account" shows confirmation dialog
- "Send Feedback" opens email client
- All state persists across sessions

---

## Navigation Architecture

```
LOGIN FLOW:
  ├─ Login Screen
  │  ├─ Sign In (email/password)
  │  ├─ Sign Up (email/password)
  │  ├─ Google OAuth
  │  └─ Forgot Password
  │
  └─→ Onboarding (if new user)
      └─→ Home

HOME FLOW:
  ├─ Home (Meal Plan Calendar)
  │  ├─ Generate Plan
  │  ├─ Tap Day → Expand
  │  └─ Tap Meal → Meal Detail
  │
  ├─ Groceries (Tab)
  │  ├─ View List
  │  ├─ Manage Items
  │  └─ Share
  │
  ├─ Settings (Gear icon)
  │  ├─ Account
  │  ├─ Subscription
  │  ├─ Preferences
  │  └─ About
  │
  └─ Meal Detail (Modal or Stack)
     └─ View Recipe
        ├─ Swipe between meals
        └─ Add to Groceries

SUBSCRIPTION FLOW:
  ├─ Subscription Prompt (Modal)
  │  ├─ Try Free 7 Days → Google Play Billing
  │  ├─ Subscribe Now → Google Play Billing
  │  └─ Manage Subscription → Play Store App

SETTINGS FLOW:
  └─ Settings Screen
     ├─ Account
     │  ├─ Edit Name
     │  ├─ Logout
     │  └─ Delete Account (confirmation)
     │
     ├─ Subscription
     │  ├─ View Status
     │  ├─ Manage (→ Play Store)
     │  └─ Cancel (→ Play Store)
     │
     ├─ Preferences
     │  ├─ Notifications
     │  ├─ Appearance
     │  └─ Calorie Target
     │
     └─ About
        ├─ Privacy Policy (web view)
        ├─ Terms (web view)
        ├─ Send Feedback (email)
        └─ Rate App (Play Store)
```

---

## Subscription & Billing

### Billing Flow

1. **Trigger Points:** (a) HARD — locked free user attempts generation; (b) SOFT — after 3rd cumulative generation (see Canonical Free-Tier Rules)
2. **UI:** Modal with feature list and pricing
3. **Options:**
   - "Try Free 7 Days" (with trial)
   - "Subscribe Now" ($5.99/month)
   - Annual option ($49.99/year, billed once)
4. **Payment:** Google Play Billing (user's saved payment method)
5. **Confirmation:** On success, grant premium features, show "Welcome to Premium!" toast

### Trial Terms

- **Duration:** 7 days free
- **Messaging:** "Free trial. Cancellable anytime in Play Store settings."
- **Auto-renewal:** After 7 days, charge $5.99 (unless cancelled)
- **Cancellation:** User must cancel in Play Store (not in-app, per Google policy)

### Subscription Management

**User Can:**
- View subscription status in Settings
- See renewal date
- See billing method
- Tap "Manage Subscription" → opens Play Store app
- Cancel via Play Store (Google's responsibility)

**Backend Must:**
- Verify subscription license on each app open (Google Play Billing Library)
- Handle subscription state changes (purchase, cancel, renewal failure)
- Track premium user's subscription end date
- Grant/revoke premium features based on license

### Revenue Projections

**Pricing Model:**
- Monthly: $5.99/month
- Annual: $49.99/year (equivalent to $4.17/month)
- Apple's 30% cut: xeriusFit net = $4.19/month or $34.99/year

**Scenarios (assuming $5.99 ARPU):**
- Conservative: 1,000 subs × $5.99 × 12 = $71,880 ARR
- Realistic: 7,500 subs × $5.99 × 12 = $539,100 ARR
- Optimistic: 24,000 subs × $5.99 × 12 = $1,725,120 ARR

**Monetization Assumptions:**
- Free-to-paid conversion: 5-8% of active users
- Trial-to-paid: 20-30% of trial starts
- Churn rate: <8% monthly

---

## Onboarding

### Step 1: Authentication (1-2 min)

**Goals:**
- Create account without friction
- Capture email for notifications

**Screens:**
1. Welcome screen (splash)
2. Email signup or Google OAuth
3. Password setup (if email)
4. Account created → proceed

**Metrics to Track:**
- % who sign up with email vs Google
- Abandonment rate at this step

### Step 2: Profile Setup (2-3 min)

**Goals:**
- Capture dietary preferences
- Enable personalization
- Show value immediately after

**Screens:**
1. Goal (Weight Loss / Maintenance / Muscle Gain)
2. Restrictions (Vegetarian / Vegan / Gluten-Free / etc.)
3. Allergies (Peanuts / Dairy / Shellfish / etc.)
4. Disliked foods (free text)
5. Caloric target (slider)
6. Meals per day (breakfast, lunch, dinner, snacks)

**UX Best Practices:**
- Multi-step form (not all at once)
- Progress indicator ("Step 1 of 6")
- Can skip any field (except goal)
- Clear skip option for later
- Pre-fill with sensible defaults

**Metrics to Track:**
- Step-by-step abandonment
- % who complete full onboarding
- Time spent on each step
- Most common goal/restriction selections

### Step 3: First Meal Plan (1-2 min)

**Goals:**
- Deliver immediate value
- Show that AI works
- Hook user with beautiful recipe suggestions

**Screens:**
1. "Let's create your first meal plan!" (loading state)
2. 7-day plan calendar (animated in)
3. Prompt to tap a meal for details
4. If user taps meal: show recipe detail
5. CTA: "Add to Groceries" or "Review Grocery List"

**UX Best Practices:**
- Loading state with progress indicator
- Plan delivery under 5 seconds (must be fast)
- Auto-suggest tapping first meal
- Show immediate grocery list aggregation
- Celebrate completion ("Great! Your week is planned")

**Metrics to Track:**
- Time to first plan generation
- % who view at least 1 recipe
- % who tap "Add to Groceries"
- % who add at least 3 meals to grocery list

### Step 4: Subscription Prompt (1 min, optional)

**Goals:**
- Introduce premium tier
- Create pathway to revenue
- Don't be intrusive

**Trigger:** Per Canonical Free-Tier Rules — soft prompt after 3rd cumulative generation; hard paywall on any locked generation attempt

**Screen:**
- Modal: "Unlock Unlimited Plans"
- Features + pricing
- "Try Free 7 Days" / "Subscribe Now" / "Remind Later"

**UX Best Practices:**
- Modal is dismissible
- No shame in free tier
- Clear value proposition
- Easy cancel path
- Soft prompt re-shown max once per 7 days (not annoying); hard paywall only on locked generation attempts

**Metrics to Track:**
- % who see modal
- % who tap "Try Free"
- % who tap "Subscribe Now"
- % who dismiss

### Post-Onboarding

**Aha Moment:** User completes plan + adds groceries
**Habit Loop:** Weekly reminder → Generate plan → View recipes → Share groceries
**Retention Hook:** Variety (AI generates different meals) + convenience (auto-grocery list)

---

## Empty States

**1. No Meal Plan Yet**
```
┌─────────────────────────┐
│                         │
│      🍽️ (empty icon)    │
│                         │
│ No meal plan yet        │
│                         │
│ [GENERATE YOUR FIRST]   │
│                         │
└─────────────────────────┘
```

**2. No Grocery Items**
```
┌─────────────────────────┐
│                         │
│   🛒 (empty cart icon)  │
│                         │
│ Your grocery list       │
│ is empty                │
│                         │
│ Generate a meal plan    │
│ to add groceries        │
│                         │
│ [GENERATE PLAN]         │
│                         │
└─────────────────────────┘
```

**3. No Saved Recipes (Future Feature)**
```
┌─────────────────────────┐
│                         │
│    ❤️ (empty heart)     │
│                         │
│ No saved recipes        │
│                         │
│ Tap the heart on        │
│ any recipe to save it   │
│                         │
│ [BROWSE RECIPES]        │
│                         │
└─────────────────────────┘
```

**4. No Previous Plans (When Browsing History)**
```
┌─────────────────────────┐
│                         │
│     📅 (empty date)     │
│                         │
│ No previous plans       │
│                         │
│ Your history starts     │
│ with your current plan  │
│                         │
└─────────────────────────┘
```

---

## Error States

### 1. Network Error
```
┌─────────────────────────┐
│                         │
│    ⚠️ Connection Lost   │
│                         │
│ Couldn't reach xeriusFit   │
│ Check your internet     │
│ connection              │
│                         │
│ [RETRY]  [OFFLINE MODE] │
│                         │
└─────────────────────────┘
```

### 2. AI Generation Failed
```
┌─────────────────────────┐
│                         │
│  Oops! Meal plan failed │
│                         │
│ Something went wrong    │
│ while creating your     │
│ plan. Try again!        │
│                         │
│ [TRY AGAIN]             │
│                         │
│ Still having issues?    │
│ [CONTACT SUPPORT]       │
│                         │
└─────────────────────────┘
```
- **Retry button:** Attempt plan generation again
- **Contact support:** Opens email compose

### 3. Payment Failed
```
┌─────────────────────────┐
│                         │
│   ❌ Payment Failed     │
│                         │
│ Your payment couldn't   │
│ be processed. Try       │
│ another card or method. │
│                         │
│ [RETRY]  [CANCEL]       │
│                         │
└─────────────────────────┘
```

### 4. Subscription Expired
```
┌─────────────────────────┐
│                         │
│   Premium Expired       │
│                         │
│ Your subscription       │
│ ended on Feb 15         │
│                         │
│ Premium features are    │
│ now limited             │
│                         │
│ [RESUBSCRIBE]           │
│                         │
└─────────────────────────┘
```
- Returns user to freemium tier
- Shows remaining free generations

### 5. API Rate Limit (Internal)
```
[Logged server-side, not shown to user]

On client:
- Silently retry with exponential backoff
- After 3 failures, show: "Meal plan unavailable, try again later"
- Don't blame user, maintain trust
```

### 6. Invalid Input
```
[Inline validation]

Email field:
- Invalid email format → "Please enter a valid email"

Password field:
- Too short → "Password must be 8+ characters"

Calorie target:
- Out of range → "Target must be between 1200-3500"

Disliked foods:
- Empty → No error, optional
- Over 100 chars per item → "Item too long, keep under 100 chars"
```

---

## Edge Cases

### 1. User Completes Profile → Closes App → Returns

**Scenario:** User finishes profile setup, closes app before seeing home screen

**Expected Behavior:**
- On re-open, check if profile exists
- If complete, show home screen (no re-prompt for setup)
- If incomplete, show onboarding resume (at last step)

**Implementation:** Store profile completion status in Firebase

---

### 2. User Changes Dietary Restriction After Plan Generated

**Scenario:** User sets profile to Vegetarian, generates plan, then updates to include meat

**Expected Behavior:**
- Updated preference saved immediately
- Show prompt: "Would you like to regenerate this week's plan with your new preferences?"
- If yes: call regenerate endpoint
- If no: keep current plan, apply new rules to next generation

**Implementation:** Check profile edit timestamp vs plan generation timestamp

---

### 3. Free User Hits Weekly Limit, Sees Hard Paywall

**Scenario:** Free user already generated this week's plan, taps "Generate" again → sees hard paywall

**Expected Behavior:**
- Clear message: "You've reached your free plan limit (1 per week)"
- Show next available generation time: "Available again in 4 days, 12 hours"
- Paywall modal with upgrade option
- Option to view/edit existing plan instead

**Implementation:** Track generation count & timestamp in Firebase

---

### 4. User Dismisses Trial/Subscription Prompt Multiple Times

**Scenario:** User taps "Remind Later" 5 times; does it keep showing?

**Expected Behavior:**
- Soft prompt: max once per 7 days regardless of dismissals (see Canonical Free-Tier Rules)
- Hard paywall: always shown when a locked free user attempts generation — dismissing it returns to the existing plan, it does not unlock generation

**Implementation:** Track dismissal count + timestamp per week

---

### 5. Offline Mode - User Opens App Without Internet

**Scenario:** User opens app while on airplane/no internet

**Expected Behavior:**
- Show cached meal plan (if exists)
- Show cached recipe details
- Disable "Generate New Plan" button
- Show banner: "You're offline. Some features unavailable."
- When network returns, button re-enables
- Sync any offline changes (e.g., checked groceries)

**Implementation:** Service Worker + local caching strategy

---

### 6. User Cancels Subscription → Tries to Generate Unlimited Plans

**Scenario:** User had Premium, cancels, now on Free tier

**Expected Behavior:**
- Subscription verification on app start
- Check Google Play License
- If cancelled, downgrade to Free tier
- Limit generations back to 1/week
- Clear messaging: "Your Premium membership ended"
- Option to resubscribe

**Implementation:** Query Google Play Billing on each auth refresh

---

### 7. Duplicate Meals Across Weeks (Premium User)

**Scenario:** Premium user generates 4-week plan; same meal appears in week 1 and week 3

**Expected Behavior:**
- AI should avoid repeating any meal within 2 weeks
- If unavoidable (user has too many restrictions), note in app: "Some meals repeat due to your dietary restrictions"
- Never repeat within same week
- Transparency > surprise

**Implementation:** Track all generated meals per user; pass to AI prompt as "avoid these meals"

---

### 8. Grocery List Sync Across Devices

**Scenario:** User checks off groceries on Android phone, then opens app on tablet

**Expected Behavior:**
- Grocery list state synced via Firebase Firestore
- Checked items marked on both devices in real-time
- Last update wins if conflict

**Implementation:** Firestore real-time listeners on grocery list document

---

### 9. Very Long Meal Name / Recipe Title

**Scenario:** AI generates meal name that's 100+ characters

**Expected Behavior:**
- Truncate with ellipsis in calendar view: "Grilled Salmon with Lemon Butter and..."
- Show full name in detail view
- No layout breaking

**Implementation:** CSS text truncation + responsive design

---

### 10. User Deletes Account → Attempts Re-login

**Scenario:** User deletes account, then tries to log in with same email

**Expected Behavior:**
- Show error: "Account not found"
- Option to create new account with same email
- No reference to deleted account (privacy)
- All data purged within 30 days (GDPR)

**Implementation:** Soft delete with async purge job

---

## Acceptance Criteria

### Authentication

- [ ] User can sign up with email and password
- [ ] Email validation enforced (format + uniqueness)
- [ ] Password meets security requirements (8+ chars, mixed case, number)
- [ ] User can sign up with Google OAuth
- [ ] Google OAuth creates account and retrieves email
- [ ] Forgot password flow sends reset email
- [ ] Reset link valid for 24 hours
- [ ] JWT token persisted and refreshed automatically
- [ ] Logout clears token
- [ ] Re-opening app without logout keeps session active

### Onboarding

- [ ] Onboarding form has 6 steps (goal, restrictions, allergies, dislikes, calories, meals)
- [ ] Each step can be skipped (except goal)
- [ ] Progress indicator shows "Step X of 6"
- [ ] Can navigate back to previous steps
- [ ] All data saved on completion
- [ ] Profile completion redirects to home screen
- [ ] Edit profile screen shows saved preferences

### Meal Plan Generation

- [ ] "Generate Plan" button visible on home
- [ ] Generates plan in <5 seconds (target: <3 sec)
- [ ] Shows loading state with spinner
- [ ] Plan contains 7 days (Mon-Sun)
- [ ] Each day has breakfast, lunch, dinner
- [ ] Snacks included only if selected in profile
- [ ] No meals repeat within single week
- [ ] Plan respects dietary restrictions (no meat if vegetarian)
- [ ] Plan respects allergies (no dairy if allergic)
- [ ] Plan respects disliked foods (none appear)
- [ ] Each meal shows: name, image, cooking time, macros
- [ ] Error handling shows retry button
- [ ] Free tier: can generate 1x/week (tracked via timestamp)
- [ ] Free tier: shows timer until next generation available
- [ ] Premium tier: unlimited generations

### Meal Details

- [ ] Tapping meal opens detail screen
- [ ] Detail shows: name, image, cooking time, servings, macros, ingredients, instructions
- [ ] Ingredient quantities shown (e.g., "2 cups flour")
- [ ] Instructions numbered and clear
- [ ] "Add to Groceries" button adds all ingredients
- [ ] Swiping left/right navigates between meals
- [ ] Back button returns to calendar

### Grocery List

- [ ] Grocery list auto-generated from weekly plan
- [ ] Ingredients aggregated (no duplicates)
- [ ] Grouped by category (produce, meat, dairy, pantry, frozen)
- [ ] Shows quantity + unit (e.g., "2 lbs chicken")
- [ ] Checkboxes toggle item purchased status
- [ ] "Clear Completed" removes checked items
- [ ] "Select All" toggles all items
- [ ] Progress bar shows "X/Y items"
- [ ] Swipe to delete item (undo available)
- [ ] "Share" button exports list (SMS, email, copy, PDF)
- [ ] List persists across sessions

### Subscription

- [ ] Free user sees soft upsell after 3rd cumulative generation; hard paywall on locked generation attempts (per Canonical Free-Tier Rules)
- [ ] Prompt shows features list and pricing
- [ ] "Try Free 7 Days" opens Google Play Billing with trial
- [ ] "Subscribe Now" opens Google Play Billing without trial
- [ ] Annual option available ($49.99/year vs $5.99/month)
- [ ] Prompt dismissible ("Remind Later")
- [ ] Subscription status visible in Settings
- [ ] Shows renewal date and billing amount
- [ ] "Manage Subscription" opens Play Store
- [ ] Subscription verified on app launch (checks Google Play license)
- [ ] Premium features enabled on successful purchase
- [ ] Features disabled if subscription cancelled
- [ ] Trial cancellable via Play Store (not in-app)

### Settings

- [ ] Settings screen accessible from home
- [ ] Shows account name and email
- [ ] Edit name function works
- [ ] Logout button available
- [ ] Subscription status shown
- [ ] Notification toggle works
- [ ] Notification time picker sets custom time
- [ ] Dark mode toggle applies to entire app
- [ ] All changes persist across sessions
- [ ] Privacy policy and terms accessible
- [ ] Send feedback opens email
- [ ] Rate app opens Play Store
- [ ] Delete account available (with confirmation)

### Notifications

- [ ] Push notification permission requested on onboarding
- [ ] Weekly reminder sent (default: Sunday 7 PM)
- [ ] Notification can be customized (time)
- [ ] Notification tapped opens app to home
- [ ] Notifications can be disabled
- [ ] Respects system-level notification settings

### Analytics & Monitoring

- [ ] Firebase Analytics integrated
- [ ] Key events tracked: app_open, sign_up, plan_generated, subscription_started
- [ ] Firebase Crashlytics enabled
- [ ] Crash reporting automatic (no manual intervention)
- [ ] User cohort analysis possible in Firebase console

### Quality & Performance

- [ ] App launches in <2 seconds
- [ ] Meal plan generation <5 seconds
- [ ] No crashes on any user flow
- [ ] Crash rate <0.1% (Firebase Crashlytics)
- [ ] All network calls have 30-second timeout
- [ ] Offline mode works (cached data viewable)
- [ ] Dark mode smooth transition
- [ ] Animations smooth (60 FPS)
- [ ] Text readable on all screen sizes
- [ ] Keyboard accessible (proper focus management)

### Privacy & Legal

- [ ] Privacy policy accessible in Settings
- [ ] GDPR-compliant (user can request data deletion)
- [ ] Health disclaimer shown in onboarding
- [ ] No health data collected beyond preferences
- [ ] User data encrypted in transit (HTTPS)
- [ ] User data encrypted at rest (Firebase encryption)
- [ ] No user data shared with third parties
- [ ] Clear messaging: "We don't sell your data"

### Google Play Compliance

- [ ] App follows Material 3 design guidelines
- [ ] Back button works (doesn't force-close)
- [ ] No unauthorized permissions requested
- [ ] Subscription terms clear before purchase
- [ ] Cancellation easy (via Play Store, not hidden)
- [ ] In-app purchase uses Google Play Billing only
- [ ] No payment processing outside Google Play
- [ ] App passes Play Protect scan (no malware)

