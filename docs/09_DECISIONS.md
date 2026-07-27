# 09_DECISIONS.md

## Decision Log for xeriusFit

This document records all major architectural, engineering, and product decisions made during the MVP design phase. Each decision includes the rationale, alternatives considered, trade-offs, and date for future review.

---

## D1: React + Capacitor for Android (vs. Native Kotlin)

**Date:** 2025-01-14  
**Status:** ✅ APPROVED  
**Stakeholders:** CTO, Tech Lead

### Decision

Use React + TypeScript + Capacitor for Android development instead of native Kotlin/Java.

### Rationale

1. **Speed to Market:** React + Capacitor can go from zero to launch in 30 days; native Kotlin requires more boilerplate
2. **Code Reuse:** Single codebase for web (future) and mobile
3. **Developer Familiarity:** Team knows JavaScript/React better than Kotlin
4. **Ecosystem:** Capacitor integrates seamlessly with Firebase and common plugins
5. **PWA Path:** Easy to add web version later using same codebase

### Alternatives Considered

| Option | Pros | Cons | Viability |
|--------|------|------|-----------|
| **React + Capacitor** | Fast build, reusable code, rich ecosystem | Smaller native performance surface | ✅ CHOSEN |
| Native Kotlin | Best performance, native feel, full platform access | Slow dev, requires two codebases, team learning curve | ❌ Too slow |
| Flutter | Good performance, multiplatform, growing ecosystem | New language (Dart), no team experience | ⚠️ Possible backup |
| React Native (Expo) | Similar to Capacitor, managed build | Flaky ecosystem, harder integrations | ❌ Worse than Capacitor |

### Trade-offs

**Gain:** Fast development, reusable code  
**Lose:** Potential small performance penalty (acceptable for meal planning app, not a real-time game)

### Performance Expectations

- App launch: <2 seconds (achievable with Capacitor)
- Meal plan generation: 2-5 seconds (limited by OpenAI, not Capacitor)
- Scroll performance: 60 FPS (React/Capacitor capable)
- Memory: ~150 MB typical use (acceptable for modern Android)

### Future Review

**When to Reconsider:**
- If performance becomes bottleneck (user complaints about slowness)
- If we need advanced native features (camera, AR, complex animations)
- If team size allows native specialists

**Success Metrics:**
- App runs smoothly on Android API 24+ (target API 34)
- Crash rate < 0.1%
- User feedback positive on performance

---

## D2: Cloud LLM API for Meal Plan Generation (vs. Local LLM)

**Date:** 2025-01-14 — **Amended 2026-07-26 (design review, Fable 5)**  
**Status:** ✅ APPROVED — provider selection reopened, resolve by Day 11  
**Stakeholders:** CTO, Product Lead

> ⚠️ **AMENDMENT:** The original decision named "GPT-4 / GPT-3.5-turbo" — both are outdated model tiers. The *cloud-API-over-local-LLM* decision stands; the *provider* is now a Day 11 bake-off between two candidates:
>
> | Candidate | Why it's in the running |
> |---|---|
> | **Google Gemini Flash** (e.g., gemini-2.x-flash) | Founder already integrates Gemini in Hisobly (zero API learning curve); cheapest structured-JSON output at this quality tier; native JSON schema mode; generous free tier for dev/testing |
> | **OpenAI small tier** (gpt-4o-mini class) | Strong structured output, mature Node SDK, well-documented meal-planning prompt patterns |
>
> **Bake-off protocol (half a day, Day 11 morning):** run the same 10 test profiles (vegetarian+dairy allergy, keto, high restrictions, etc.) through both, score on: restriction compliance (must be 100%), meal variety, macro plausibility, JSON validity rate, latency, cost per plan. Pick the winner; the abstraction layer below makes the choice cheap to reverse.
>
> **Architectural requirement (new):** wrap the provider behind a single `MealPlanGenerator` service interface so swapping providers is a one-file change. Never call the vendor SDK directly from route handlers.

### Decision

Use a hosted LLM API (Gemini Flash or OpenAI small-tier — bake-off Day 11) for AI meal plan generation instead of running a local LLM.

### Rationale

1. **Quality:** OpenAI models produce better, more consistent meal plans than open-source alternatives
2. **Cost:** $0.01-0.03 per plan generation is acceptable for MVP; variable cost scales with revenue
3. **Speed:** API calls are fast (<5 seconds); local LLM would require GPU infrastructure
4. **Maintenance:** No model training, fine-tuning, or infrastructure management needed
5. **Reliability:** OpenAI handles uptime, scaling, and updates

### Alternatives Considered

| Option | Pros | Cons | Viability |
|--------|------|------|-----------|
| **OpenAI API (Cloud)** | Best quality, low operational cost, reliable | API costs scale, dependent on external service | ✅ CHOSEN |
| Local LLM (Llama 2) | No API costs, full control, privacy | Poor meal quality, needs GPU server, management overhead | ❌ Quality risk |
| Hugging Face API | Open-source, cheaper than OpenAI | Lower quality, less reliable, no support | ⚠️ Possible future |
| Fine-tuned LLM | Custom model, potentially better quality | Requires training data, expensive infrastructure, long development | ❌ Too slow |

### Cost Analysis

**Projected API Costs:**

```
Monthly:
- 5,000 users × 1 plan/week × 4.3 weeks = 21,500 plans/month
- At $0.01/plan = $215/month (GPT-3.5-turbo, cheap tier)
- At $0.03/plan = $645/month (GPT-4, higher quality)

Acceptable as % of revenue:
- Revenue: 5,000 subs × $5.99 = $29,950/month
- API cost at 2%: $599 ✅ Reasonable
```

### Trade-offs

**Gain:** High-quality meals, fast launch, low management overhead  
**Lose:** Recurring API costs (but variable, scales with revenue), dependent on external service

### Fallback Strategy

If OpenAI API is down or too expensive:
1. Use GPT-3.5-turbo instead of GPT-4 (10x cheaper)
2. Increase caching (reuse plans if profile unchanged)
3. Fallback to rule-based generation (recipe database + simple rules)
4. Consider Hugging Face or local LLM as secondary

### Future Review

**When to Reconsider:**
- If API costs exceed 5% of revenue
- If OpenAI introduces pricing that makes alternative more viable
- If user feedback indicates meal quality is unsatisfactory

**Success Metrics:**
- Generation time < 5 seconds
- 90%+ of generated plans rated "good" by users
- API cost < 3% of revenue
- Uptime > 99.5%

---

## D3: MongoDB + Firestore (vs. PostgreSQL)

**Date:** 2025-01-14  
**Status:** ✅ APPROVED  
**Stakeholders:** CTO, DevOps

### Decision

Use MongoDB (via MongoDB Atlas) for persistent data storage, with optional Firestore for real-time features.

### Rationale

1. **Schema Flexibility:** User profiles have varying dietary needs; MongoDB's flexible schema handles this well
2. **Scalability:** Horizontal scaling via sharding is built-in; PostgreSQL requires more infrastructure planning
3. **Managed Service:** MongoDB Atlas is fully managed (backups, patches, scaling)
4. **Cost:** Free tier sufficient for MVP; scales predictably with usage
5. **JSON-Native:** Matches JavaScript/Node.js data structures naturally
6. **Future Web:** Easy to add web version with same database

### Alternatives Considered

| Option | Pros | Cons | Viability |
|--------|------|------|-----------|
| **MongoDB** | Flexible schema, scalable, managed, cost-effective | Less mature ecosystem, potential performance issues at scale | ✅ CHOSEN |
| PostgreSQL | Mature, ACID transactions, excellent performance | Fixed schema (need migrations), vertical scaling, operational overhead | ⚠️ Possible later |
| Firestore (Firebase) | Real-time sync, built-in authentication, serverless | Limited query flexibility, expensive at scale, vendor lock-in | ⚠️ Hybrid approach |
| DynamoDB | Serverless, scales automatically, low operational overhead | Expensive per-request pricing, complex pricing model | ❌ Expensive |
| Cassandra | Highly scalable, distributed | Overkill for MVP, requires expertise, high operational cost | ❌ Too complex |

### Architecture Decision

**Primary:** MongoDB Atlas (core data)  
**Secondary (Future):** Firestore for real-time features if needed  
**Rationale:** Keep it simple for MVP; add complexity only if needed

### Migration Path

If we outgrow MongoDB (unlikely in first year):
- MongoDB has good export tools
- PostgreSQL can import from MongoDB
- No lock-in; can migrate if needed

### Trade-offs

**Gain:** Flexible schema, fast development, scalability  
**Lose:** Less ACID guarantees than PostgreSQL (but acceptable for this app)

### Future Review

**When to Consider PostgreSQL:**
- If we need complex transactions (e.g., inventory management)
- If performance becomes an issue (unlikely)
- If team becomes more comfortable with SQL

**Success Metrics:**
- Query response time < 100ms (p95)
- Uptime > 99.9%
- Cost per user < $0.01/month

---

## D4: Freemium Subscription Model (vs. Paid-Only)

**Date:** 2025-01-14  
**Status:** ✅ APPROVED  
**Stakeholders:** Product Lead, Business

### Decision

Use freemium subscription model: free tier with limited meal plans (1/week), premium tier ($5.99/month) for unlimited plans.

### Rationale

1. **Virality:** Free tier drives user acquisition (10x more users than paid-only)
2. **Conversion:** Users try free, then upgrade when they hit limit (natural funnel)
3. **Competitive:** Mealime ($2.99), Lifesum ($5-10) use freemium; proven model
4. **Revenue:** 5% conversion on free users generates same revenue as 50% of smaller user base
5. **Retention:** Free users becoming paid users are stickier (invested more time)

### Alternatives Considered

| Option | Pros | Cons | Viability |
|--------|------|------|-----------|
| **Freemium** | High acquisition, natural conversion, proven | Complexity (feature gating), support burden | ✅ CHOSEN |
| Paid-Only ($4.99) | Simpler, higher ARPU, less support burden | Lower acquisition (1% vs 10%), smaller revenue | ❌ Lower revenue |
| Free with Ads | High engagement, clear monetization | Bad UX, users hate ads, hard to pivot to subscription | ❌ Bad UX |
| Hybrid (Free + Ads + Premium) | Maximum revenue potential | Too complex for MVP, ads degrade experience | ❌ Over-engineered |

### Pricing Decision

**Free Tier:**
- 1 meal plan per week
- View recipes from plan
- Basic grocery list
- No premium recipes

**Premium Tier:**
- Unlimited meal plans
- Advanced dietary filters (macros, specialty diets)
- Batch meal planning (2-4 weeks)
- Recipe preferences (save favorites)
- Premium recipe sources
- Priority support

**Price Point:** $5.99/month (or $49.99/year)  
**Rationale:** Competitive with Mealime ($2.99); premium features justify price vs. Mealime

### Revenue Model

```
Scenario 1 (Conservative):
- 50K downloads, 2% free-to-paid = 1,000 subs
- Revenue: 1,000 × $5.99 × 12 = $71,880/year

Scenario 2 (Realistic):
- 150K downloads, 5% free-to-paid = 7,500 subs
- Revenue: 7,500 × $5.99 × 12 = $539,100/year

Scenario 3 (Optimistic):
- 300K downloads, 8% free-to-paid = 24,000 subs
- Revenue: 24,000 × $5.99 × 12 = $1.725M/year
```

### Trade-offs

**Gain:** High acquisition, proven revenue model, sustainable growth  
**Lose:** Feature gating complexity, support load (but manageable)

### Churn Management

Target churn rate: < 8% per month

**Retention levers:**
- Weekly engagement loop (plan generation)
- Notification reminders
- Streak/gamification features (future)
- Recipe variety (different meals each week)
- Community features (future)

### Future Review

**When to Reconsider:**
- If conversion rate drops below 2% (product not compelling)
- If churn exceeds 15% (users leaving after trial)
- If revenue stalls (need different monetization)

**Success Metrics:**
- Free-to-paid conversion: 5-8%
- Trial-to-paid conversion: 20-30%
- Churn rate: < 8%/month
- LTV:CAC ratio: > 3:1

---

## D5: 30-Day MVP Timeline (vs. 60-90 Days)

**Date:** 2025-01-14  
**Status:** ✅ APPROVED (with caveats)  
**Stakeholders:** CTO, CEO

### Decision

Launch MVP in 30 days instead of 60-90 days (industry standard).

### Rationale

1. **Market Timing:** AI boom is happening now; faster to market = better positioning
2. **Funding:** MVP results attract investors for Series A
3. **Learning:** Validate with real users within weeks, not months
4. **Momentum:** Team morale high; extended timeline risks scope creep

### Aggressive Scope Cuts for 30-Day Target

**In MVP (Must Have):**
- Authentication (email + Google)
- Meal plan generation (AI)
- Grocery list (auto-aggregated)
- Subscription (Google Play Billing)
- Basic notifications (weekly reminder)

**Post-MVP (Phase 2):**
- Recipe ratings/feedback
- Favorite recipes
- Social sharing
- Advanced notifications
- Macro tracking
- Progress analytics

### Alternatives Considered

| Timeline | Pros | Cons | Viability |
|----------|------|------|-----------|
| **30 Days** | Fast market entry, MVP learning, momentum | Aggressive, tight margin, high stress | ✅ CHOSEN (high risk) |
| 60 Days | More features, less stress, easier execution | Slower market entry, competitors catch up | ⚠️ Safer option |
| 90 Days | Full feature set, comprehensive, low risk | Too slow, competitive disadvantage, team fatigue | ❌ Too slow |

### Risk Mitigation

**Critical Path:**
- Authentication working by Day 5
- AI meal plan generation working by Day 15
- Everything testable by Day 20
- Launch by Day 30

**If Behind Schedule:**
- Cut animations (keep functional UI)
- Cut dark mode (light mode only)
- Cut localization (English only)
- Skip post-launch feature (defer to v1.1)

**Don't Cut:**
- Core flows (sign up, meal plan, groceries, subscribe)
- Testing
- Google Play submission

### Contingency Plans

**If can't launch Day 30:**
- Soft launch (internal testing track only)
- Launch Day 35-40 to Open Testing
- Open to public Day 45-50 if quality excellent

### Trade-offs

**Gain:** Fast market entry, MVP validation, team momentum  
**Lose:** Polish, some features deferred, higher stress

### Future Review

**Success Criteria (MVP Launched):**
- App live on Play Store
- 500+ installs (first week)
- 100+ active users (first 2 weeks)
- No critical crashes (Crashlytics < 0.5%)
- Positive user feedback

**When to Reconsider:**
- If technical risk too high (AI not working by Day 13)
- If team struggling (adjust timeline, reduce scope)
- If market dynamics change (competitors launch similar app)

---

## D6: JWT Tokens (vs. Session-Based Authentication)

**Date:** 2025-01-14  
**Status:** ✅ APPROVED  
**Stakeholders:** Security Lead, Backend Lead

### Decision

Use stateless JWT tokens for authentication instead of server-side sessions.

### Rationale

1. **Scalability:** Stateless design scales horizontally (no session store bottleneck)
2. **Mobile-Friendly:** JWT works naturally with mobile apps
3. **Decoupling:** Backend can scale independently; no shared session store needed
4. **Simplicity:** No session DB to manage, backup, replicate
5. **Standard:** Industry standard for mobile/API auth

### JWT Structure

**Access Token (10 minutes):**
```json
{
  "sub": "user_id",
  "email": "user@example.com",
  "type": "access",
  "iat": 1705353000,
  "exp": 1705353600
}
```

**Refresh Token (7 days):**
```json
{
  "sub": "user_id",
  "type": "refresh",
  "iat": 1705353000,
  "exp": 1705958400
}
```

### Alternatives Considered

| Option | Pros | Cons | Viability |
|--------|------|------|-----------|
| **JWT (Stateless)** | Scalable, mobile-friendly, standard | Less control over sessions, token blacklist complexity | ✅ CHOSEN |
| Session Cookies | Simpler for web, built-in security | Not mobile-friendly, server-side state bottleneck | ⚠️ Better for web |
| OAuth 2.0 | Industry standard, delegated auth | Complexity, requires auth server setup | ⚠️ Overkill for MVP |
| Custom Token | Full control, flexibility | Reinventing the wheel, security risks | ❌ Not recommended |

### Security Measures

1. **Token Expiry:** Short-lived access tokens (10 min)
2. **Refresh Rotation:** Refresh token rotated on use
3. **HTTPS Only:** Tokens only transmitted over HTTPS
4. **Secure Storage:** Tokens stored in Capacitor secure storage (encrypted on Android)
5. **No Sensitive Data:** Tokens don't contain passwords or sensitive info
6. **CORS Protection:** CORS headers prevent cross-origin token theft
7. **Rate Limiting:** Rate-limit login attempts to prevent brute force

### Token Lifecycle

```
1. User logs in
   → Server validates credentials
   → Issues access + refresh tokens

2. Access token expires (10 min)
   → Client uses refresh token to get new access token
   → Continue using app

3. Refresh token expires (7 days)
   → Redirect to login
   → User logs in again

4. User logs out
   → Client deletes tokens
   → App returns to login
```

### Logout Handling

**Option 1:** Token blacklist (track revoked tokens)  
**Option 2:** Short expiry (10 min, user won't notice)  

**Decision:** Option 2 for MVP (simpler); can add blacklist if security issue arises

### Trade-offs

**Gain:** Scalability, mobile-friendly, simple implementation  
**Lose:** Less control over session state, token blacklist complexity

### Future Review

**When to Consider Session-Based:**
- If we add real-time features (WebSockets) requiring persistent connections
- If logout needs to be instant (currently acceptable with short expiry)

**Success Metrics:**
- Login takes < 1 second
- Refresh token prevents re-auth for 7 days
- No unauthorized access incidents

---

## D7: Google Play Billing (vs. Custom Payment Processing)

**Date:** 2025-01-14  
**Status:** ✅ APPROVED (Mandatory)  
**Stakeholders:** Legal, Finance, Payments Lead

### Decision

Use Google Play Billing exclusively for subscriptions (no custom payment processing).

### Rationale

1. **Requirement:** Google Play requires using Google Play Billing for Android subscriptions (Policy 3.3)
2. **PCI Compliance:** No need to handle credit cards directly (liability)
3. **Trust:** Users trust Google with payment; reduces churn from payment concerns
4. **Simplicity:** Google handles billing infrastructure, reconciliation, fraud
5. **Tax:** Google handles local tax collection and remittance

### What We Don't Do

- ❌ Direct credit card processing
- ❌ PayPal integration
- ❌ Stripe integration
- ❌ Custom billing system

### What We Do

- ✅ Google Play Billing via **RevenueCat** (`@revenuecat/purchases-capacitor`) — *amended in design review*
- ✅ Sandbox testing
- ✅ Subscription SKU configuration (in Play Console, mapped to RevenueCat offerings)
- ✅ Receipt verification: **delegated to RevenueCat** (no custom Play Developer API verification pipeline for MVP)
- ✅ Renewal/cancellation sync: **RevenueCat webhooks → backend → MongoDB** (replaces direct Play Pub/Sub handling)

> ⚠️ **AMENDMENT (design review):** The plugin originally specified (`@capacitor-community/in-app-purchases`) does not exist in that form. RevenueCat is the chosen implementation layer: free below $2.5K monthly tracked revenue, then 1%. It removes ~2 days of the highest-risk custom billing code (receipt validation, grace periods, resubscription edge cases). Google Play Billing remains the underlying payment rail — this amendment changes the *integration layer only*, so D7's policy rationale is unchanged. Revisit self-hosting verification only if the 1% fee ever exceeds one engineer-week/year of value.

### Revenue Split

**Google's Cut:**
- 15% on subscriptions (unchanged after 3 years)
- 30% on one-time purchases (not applicable for MVP)

**xeriusFit's Revenue:**
- Subscription: $5.99 × 85% = $5.09/month
- ARR with 7,500 subs: 7,500 × $5.09 × 12 = $458,100

### Alternatives Considered

| Option | Pros | Cons | Viability |
|--------|------|------|-----------|
| **Google Play Billing** | Required by policy, simple, secure, no PCI | 15% cut, vendor lock-in | ✅ ONLY OPTION |
| Custom Billing | Cheap (2-3% fee), flexible | Illegal on Google Play, PCI liability, complex | ❌ Not allowed |
| Stripe + Google Play | More control | Violates Google Play policies, complex | ❌ Not allowed |

### Trade-offs

**Gain:** Compliance with Google Play, PCI security, user trust  
**Lose:** 15% revenue cut (but mandatory, so no real alternative)

### Future Review

**Immutable:** Google Play Billing is mandatory for Android subscriptions; no reconsideration possible

---

## D8: Firebase Firestore for Real-Time (vs. Pure MongoDB)

**Date:** 2025-01-14  
**Status:** ⏸️ DEFERRED (Not in MVP, re-evaluate Day 20)  
**Stakeholders:** CTO, Product Lead

### Decision

Defer using Firestore for real-time features. Use MongoDB for MVP; add Firestore only if real-time needs arise post-launch.

### Rationale

1. **MVP Simplicity:** Real-time sync not core MVP feature (meal plans don't need real-time)
2. **Reduced Complexity:** One database (MongoDB) is simpler than two (MongoDB + Firestore)
3. **Cost:** Firestore can get expensive; MongoDB is cheaper for MVP
4. **Risk:** Firestore adds complexity without MVP value

### Possible Real-Time Features (Post-MVP)

- Grocery list synced across devices
- Collaboration (family members see same plan)
- Live notifications
- Real-time recipe updates

### When to Add Firestore

**Triggers for Adding Firestore:**
- User feedback requests family meal planning
- Team members using app together (collaboration feature)
- Real-time sync becomes critical for retention

**Trigger for NOT Adding:**
- If single-user experience works fine
- If syncing on app open is sufficient

### Hybrid Approach (If Added Later)

```
MongoDB: Primary data store
  └─ User profiles
  └─ Meal plans (write-heavy, occasional reads)
  └─ Audit logs

Firestore: Real-time features
  └─ Grocery list (real-time sync across devices)
  └─ User presence (who's editing what)
  └─ Notifications (real-time delivery)
```

### Trade-offs

**MVP (Current):**  
Gain: Simplicity, lower cost  
Lose: No real-time sync

**Post-MVP (Potential):**  
Gain: Real-time collaboration features  
Lose: More infrastructure to maintain

### Future Review

**Re-Evaluate Date:** Day 20 (after user feedback)

**Re-Evaluate Criteria:**
- Do users request family/group meal planning?
- Is single-user sync sufficient?
- Does revenue justify complexity?

---

## D9: Email-Only Onboarding (vs. Phone Verification)

**Date:** 2025-01-14  
**Status:** ✅ APPROVED  
**Stakeholders:** Product Lead, Security

### Decision

Use email-only signup (no phone verification) for faster onboarding. Add optional 2FA later if needed.

### Rationale

1. **Speed:** Email signup is faster than SMS verification
2. **Frictionless:** Lower drop-off in signup flow
3. **Privacy:** Don't collect phone numbers (GDPR consideration)
4. **Simplicity:** Simpler backend logic

### Alternatives Considered

| Option | Pros | Cons | Viability |
|--------|------|------|-----------|
| **Email Only** | Fast, simple, privacy-friendly | Less secure (no 2FA), vulnerable to email takeover | ✅ CHOSEN (MVP) |
| Email + SMS Verification | Higher security, prevents bot accounts | Slower onboarding, cost per SMS, privacy concern | ⚠️ Later addition |
| Email + Email Verification | Balance of security & speed | Still need to click email link | ⚠️ Consider for v1.1 |
| Phone-Only | Common in Asia, high security | Requires SMS infrastructure, slower, privacy risk | ❌ Not for Western audience |

### Email Verification (Future, Optional)

**If we add email verification:**
1. User enters email in signup
2. We send verification email
3. User clicks link to confirm
4. Account activated

**Current approach (no verification):**
1. User enters email + password
2. Account immediately active
3. Risk: Typos in email, but acceptable for MVP

### Security Measures

1. **Password Requirements:** Strong passwords enforced (8+ chars, mixed case, numbers)
2. **Rate Limiting:** 10 login attempts per hour per IP
3. **Future 2FA:** Add Google Authenticator or SMS 2FA in v1.2 if needed
4. **Account Recovery:** Forgot password flow (reset via email)

### Trade-offs

**Gain:** Faster signup, simpler logic, better UX  
**Lose:** Slightly lower security (acceptable for meal planning app, not financial data)

### Future Review

**When to Add Email Verification:**
- If abuse/fake accounts become problem
- If we add payment features with higher security needs
- If GDPR audit requires stricter verification

**When to Add 2FA:**
- If user requests security features
- If compliance requires it
- If we handle more sensitive data

---

## D10: Firebase Analytics (vs. Custom Analytics)

**Date:** 2025-01-14  
**Status:** ✅ APPROVED  
**Stakeholders:** Product Lead, Analytics Lead

### Decision

Use Firebase Analytics for user behavior tracking instead of building custom analytics or using third-party tools.

### Rationale

1. **Integrated:** Already using Firebase for Auth, FCM, Crashlytics
2. **Cost-Free:** No additional cost beyond Firebase
3. **Mobile-Native:** Built for mobile analytics (automatic events)
4. **Quick Setup:** Minimal configuration needed
5. **Good Enough:** Sufficient for MVP decision-making

### What We Track

**Critical Funnel Events:**
1. `app_open` (automatic)
2. `user_signup` (email vs. Google)
3. `profile_created`
4. `plan_generated`
5. `subscription_started`

**Engagement Events:**
1. `recipe_viewed`
2. `grocery_list_viewed`
3. `settings_changed`

**Conversion Events:**
1. `plan_generation` (free users only)
2. `subscription_prompt_shown`
3. `subscription_purchased`

### Firebase Analytics Dashboard

```
Real-Time Users: How many active now
Acquisition: Where do users come from (organic, ads)
Behavior: Which screens visited, flow through funnel
Retention: DAU, WAU, 7-day retention
Monetization: Subscription revenue, trial conversion
```

### Custom Events to Log

```typescript
// Example
Firebase.Analytics.logEvent('plan_generated', {
  generationTime: 3200,  // milliseconds
  weekStart: '2025-01-20',
  mealCount: 21,
  source: 'home_screen'  // or 'subscription_prompt'
})
```

### Alternatives Considered

| Option | Pros | Cons | Viability |
|--------|------|------|-----------|
| **Firebase Analytics** | Free, integrated, mobile-native | Limited customization, Google-dependent | ✅ CHOSEN |
| Amplitude | Powerful cohort analysis, retention focus | Cost ($$), requires custom events | ⚠️ Consider later |
| Mixpanel | Event-based, good dashboards | Cost ($$), more configuration | ⚠️ Consider later |
| Custom (GA4 + Backend) | Full control, flexible | Engineering overhead, maintenance burden | ❌ Too slow for MVP |
| Segment (Data Pipeline) | Centralized tracking, multi-destination | Overkill for MVP, cost | ❌ Over-engineered |

### Migration Path

If we outgrow Firebase:
1. Export Firebase data
2. Implement Amplitude or Mixpanel
3. Backfill historical data

### Trade-offs

**Gain:** Free, integrated, quick setup, sufficient for MVP  
**Lose:** Less powerful than specialized tools, vendor lock-in

### Future Review

**When to Upgrade:**
- When we need cohort retention analysis (monthly churn cohorts)
- When we have 10K+ users and need sophisticated segmentation
- When we want A/B testing platform integration

**Success Metrics:**
- Can identify top conversion bottleneck
- Can track retention curves
- Can segment users by behavior
- Can calculate LTV and CAC

---

## D11: Capacitor Storage vs. SQLite

**Date:** 2025-01-14  
**Status:** ✅ APPROVED  
**Stakeholders:** Backend Lead, Security Lead

### Decision

Use Capacitor Storage (encrypted) for offline data persistence, not SQLite directly.

### Rationale

> ⚠️ **AMENDED (design review, Fable 5):** The original rationale claimed Capacitor Storage "auto-encrypts via Android Keystore." **This is false.** The plugin (now `@capacitor/preferences`) writes plaintext SharedPreferences. Amended decision: tokens → `capacitor-secure-storage-plugin` (Keystore-backed); non-sensitive cache/settings → `@capacitor/preferences`. The rest of this decision stands.

1. **Simplicity:** Key-value storage is sufficient for MVP offline needs
2. **Security:** Sensitive values (JWT tokens) stored via a Keystore-backed secure storage plugin; Preferences used only for non-sensitive data
3. **Speed:** Sufficient performance for meal plan caching
4. **Maintenance:** No database versioning/migrations needed
5. **React Integration:** Easier integration with Redux

### What We Store Locally

```
auth:token → JWT access token (encrypted)
auth:refreshToken → JWT refresh token (encrypted)
profile → Current user profile (for display, not source of truth)
mealplan:current → Current week's meal plan (cache)
groceries:current → Grocery list (cache)
ui:preferences → Dark mode, notifications (settings)
```

### Offline Scenario

```
User opens app without internet:
1. Check network status
2. Load from local cache (Capacitor Storage)
3. Display cached meal plan
4. Show "offline" banner
5. Disable "Generate New Plan" button

When network returns:
1. Sync any local changes
2. Refresh from server
3. Update cache
4. Remove offline banner
```

### Alternatives Considered

| Option | Pros | Cons | Viability |
|--------|------|------|-----------|
| **Capacitor Storage** | Encrypted, simple, React-friendly | Limited to key-value (good enough), smaller storage | ✅ CHOSEN |
| SQLite | Powerful queries, larger storage, relational | Overkill for MVP, versioning complexity, slower setup | ⚠️ Later if needed |
| IndexedDB | Browser-native, large storage | Not ideal for React, different on Capacitor | ❌ Complexity |
| Memory Only | Fastest, simplest | No persistence across app restarts | ❌ Bad UX |

### Migration Path

If we need SQLite later (e.g., for complex offline queries):
1. Implement Capacitor SQLite plugin
2. Migrate data from Capacitor Storage
3. Update React components to query SQLite

### Trade-offs

**Gain:** Simplicity, encryption, fast development  
**Lose:** Limited to key-value (sufficient for MVP)

### Future Review

**When to Consider SQLite:**
- If users need to query/filter offline data (currently don't)
- If offline storage needs exceed 50MB (unlikely)
- If we add advanced offline features (sync conflicts, versioning)

---

## D12: No API Versioning in v1.0 (vs. v1 from Start)

**Date:** 2025-01-14  
**Status:** ✅ APPROVED  
**Stakeholders:** CTO, Backend Lead

### Decision

Use `/v1/` URL prefix from day 1 to enable future versioning without breaking changes.

### Rationale

1. **Future-Proof:** Allows API changes without breaking clients
2. **Mobile-Friendly:** Mobile apps can't force users to upgrade (take weeks)
3. **Backward Compat:** Can maintain v1 while releasing v2
4. **Standard:** Industry standard for API versioning

### API URLs

```
Base: https://api.xeriusfit.app/v1
Auth: POST /v1/auth/signup
Profiles: GET /v1/profiles
Meals: POST /v1/mealplans/generate
```

### Versioning Strategy

**v1 (Current - 2025):**
- Core features: auth, profiles, meal plans, groceries, subscriptions

**v2 (Planned - Late 2025/Early 2026):**
- GraphQL support (alongside REST)
- WebSocket for real-time
- Batch operations
- GraphQL schema for more efficient queries

**Deprecation Policy:**
- v1 supported for 2 years
- v2 released, v1 deprecated for 1 year
- v1 sunset after 3 years total

### Migration Path

Clients can gradually migrate from v1 → v2 over 1-year window

### Alternatives Considered

| Option | Pros | Cons | Viability |
|--------|------|------|-----------|
| **/v1/ from Start** | Future-proof, no breaking changes | Slightly verbose URLs | ✅ CHOSEN |
| No version | Simplest URLs | Can't maintain backward compat, breaks mobile users | ❌ Bad for mobile |
| Query param (?version=1) | Cleaner URLs | Less standard, harder to cache | ⚠️ Not ideal |

### Trade-offs

**Gain:** Future flexibility, mobile-friendly, backward compatibility  
**Lose:** Slightly longer URLs

### Future Review

**When to Increment Version:**
- When breaking changes are necessary
- When new API design (e.g., GraphQL) is ready
- Every 2-3 years (typical API lifetime)

---

## Summary Table

| Decision | Choice | Risk Level | Confidence |
|----------|--------|------------|-----------|
| Frontend Framework | React + Capacitor | Medium | High |
| AI Generation | OpenAI API | Medium | High |
| Database | MongoDB | Low | High |
| Subscription Model | Freemium | Low | High |
| Timeline | 30 Days | High | Medium |
| Authentication | JWT | Low | High |
| Payment | Google Play Billing | Low | Mandatory |
| Real-Time | Deferred | Low | Medium |
| Signup | Email-Only | Low | High |
| Analytics | Firebase | Low | High |
| Storage | Capacitor Storage | Low | High |
| API Versioning | /v1/ | Low | High |

---

## Key Risks & Mitigation

### Top 3 Risks

1. **AI Meal Quality (HIGH):**
   - Risk: Meals are repetitive/low-quality; users uninstall
   - Mitigation: Heavy testing Days 11-12; iterate on prompts; beta user feedback
   - Contingency: Fallback to recipe database

2. **30-Day Timeline (HIGH):**
   - Risk: Can't ship polish/features; app feels unfinished
   - Mitigation: Aggressive scope cuts; daily standup; cut non-critical features
   - Contingency: Soft launch to internal testing; defer public launch 1-2 weeks

3. **Subscription Conversion (MEDIUM):**
   - Risk: Free-to-paid < 2%; not enough revenue
   - Mitigation: Design compelling premium features; test pricing; monitor cohorts
   - Contingency: Lower price to $2.99; add ads to free tier; bundle with other services

### Decision Dependencies

```
Authentication
    ↓
Profile Setup
    ├─→ Meal Plan Generation (AI)
    │   ├─→ Grocery List (aggregation)
    │   ├─→ Subscription Gating
    │   └─→ Free Tier Limiting
    └─→ Notifications (FCM)
        └─→ Retention Levers

Google Play Billing
    └─→ Subscription Management
        ├─→ Revenue Tracking
        └─→ Churn Analysis
```

All core dependencies can be implemented in parallel (9 engineers could work in parallel; 1 engineer does serial).


---

## D13: Project Renamed Cerius → xeriusFit (Local Paths Keep Old Name)

**Date:** 2026-07-27  
**Status:** ✅ APPROVED  
**Stakeholders:** Founder

### Decision

The project is named **xeriusFit**. Canonical spellings:

| Context | Spelling |
|---|---|
| Display name, user-facing strings, `appName` | `xeriusFit` |
| Package names, npm scope, database, URLs | `xeriusfit` (e.g. `@xeriusfit/shared`) |
| Android appId | `app.xeriusfit.android` |
| JS identifiers | `xeriusFitApi` |

Repo folder `C:\dev\cerius`, the git remote, and `C:\dev\secrets\cerius\` stay named `cerius` by design — do not rename. They are local/external paths whose value is that they already exist and resolve; renaming them buys nothing and breaks tooling, checked-out clones, and on-disk secret lookups.

### Not Yet Applied Externally

The MongoDB cluster/database, GitHub repo name, and Google Play Console entries are renamed **in the docs only**. Play Console `packageName` and subscription SKUs (`xeriusfit_premium_monthly`, `xeriusfit_premium_annual`) are **immutable once created** — verify the docs match Play Console before creating those products.

---

## D14: Target/compile SDK 36, minSdk 24 (Amends "target API 35")

**Date:** 2026-07-27  
**Status:** ✅ APPROVED — **supersedes the target API 35 decision**  
**Stakeholders:** Founder, Mobile Lead

### Decision

| Setting | Value |
|---|---|
| `compileSdkVersion` | 36 |
| `targetSdkVersion` | 36 |
| `minSdkVersion` | 24 (Android 7.0+) |

Set in `apps/frontend/android/variables.gradle`, which Capacitor generated at these values already — no override was needed.

### Rationale

1. **Play submission deadline:** Google Play requires **API 36** for new-app submissions starting **2026-08-31**.
2. **Coincides with our launch window:** targeting 35 would mean a forced bump — or a deadline extension request — at the moment of submission, which is the worst possible time to be changing the SDK level.
3. **Cheaper now than later:** adopting 36 up front means behaviour changes surface during development rather than during release.
4. **minSdk 24 unchanged:** still covers ~97% of active devices; no reason to move it.

### Supersedes

This replaces the earlier "targetSdkVersion 34 → 35" call recorded in `docs/00_DESIGN_REVIEW_SUMMARY.md` (row 5) and the sample Gradle block in `docs/05_System_Architecture.md` (~L561-564), both of which still show 35 and are now stale.

### Verification

Checked against Google Play's target API level policy on **2026-07-27**. Re-verify before submission — Play deadlines have moved before.

---

## D15: android/ Is Committed as a Generated-but-Tracked Project

**Date:** 2026-07-27  
**Status:** ✅ APPROVED  
**Stakeholders:** Founder, Mobile Lead

### Decision

`apps/frontend/android/` is **committed** to version control, with two deliberate exceptions that are gitignored:

| File | Why ignored |
|---|---|
| `apps/frontend/android/capacitor.settings.gradle` | Contains a pnpm-store path with the store hash and Capacitor version baked in (`node_modules/.pnpm/@capacitor+android@8.4.2_.../`). Machine- and version-specific; goes stale on any upgrade. |
| `apps/frontend/android/app/capacitor.build.gradle` | Regenerated on every `cap sync`; churns whenever a native plugin is added or removed. |

Both files declare `// DO NOT EDIT THIS FILE! IT IS GENERATED EACH TIME "capacitor update" IS RUN`.

### Consequence — read before "fixing" a broken clone

A fresh clone **will not build with Gradle directly**, because those two files do not exist yet. This is expected, not a bug. The required sequence is:

```bash
pnpm install
pnpm --filter frontend build     # produces apps/frontend/dist
npx cap sync                     # regenerates the two gradle files + copies web assets
```

Only then will `./gradlew assembleDebug` work.

### Do Not "Fix" This Later

The obvious-looking fix — committing the two files so clones build immediately — reintroduces pnpm-store paths into version control and produces recurring spurious diffs and merge conflicts on every sync. The trade was made knowingly: one extra bootstrap step in exchange for a clean, portable history. If this is revisited, revisit it as a decision, not as a cleanup.

### Also Generated and Ignored

`app/src/main/assets/public/` (the copied web build) and `app/src/main/assets/capacitor.config.json` are ignored by Capacitor's own `apps/frontend/android/.gitignore` — likewise regenerated by `cap sync`.

---

## D16: shared Must Build Before Its Consumers (Build-Ordering Is Load-Bearing)

**Date:** 2026-07-27  
**Status:** ✅ APPROVED — patch in place, proper fix deferred  
**Stakeholders:** Founder, Tech Lead

### Decision

`@xeriusfit/shared` must be **built** — emitting `dist/` including the `.d.ts` files — before anything that consumes it. Both root scripts encode this:

| Script | Definition | How ordering is enforced |
|---|---|---|
| `build` | `pnpm -r build` | pnpm sorts the workspace topologically from the `workspace:*` edges, so shared emits `dist/` before frontend and backend compile |
| `typecheck` | `pnpm --filter @xeriusfit/shared build && pnpm -r typecheck` | explicit pre-build, because the fan-out alone is **not** sufficient — see below |

### Why `typecheck` Needs the Explicit Prefix

`shared`'s own typecheck is `tsc --noEmit`. It validates but **emits nothing**. So a bare `pnpm -r typecheck` fans out in the correct order while the first step produces no artifact for the later steps to consume. The apps resolve `@xeriusfit/shared` through the package's `exports` map, which points at `./dist/index.d.ts` — a file that does not exist on a clean checkout.

The consequence is a check that passes for the wrong reason: it succeeds whenever a previous build happens to have left `dist/` behind, and fails on a fresh clone or CI runner with:

```
error TS2307: Cannot find module '@xeriusfit/shared' or its corresponding type declarations.
```

This was live in the repo and went unnoticed through several commits, because every local run had a stale `dist/` present. It surfaced only when `dist/` was deleted **before** running the bar rather than after. CI runs install → typecheck → build, so it would have failed at typecheck, before ever reaching `build`.

**The `&& pnpm -r typecheck` prefix is load-bearing. Do NOT remove it to "simplify" the script or to make it symmetrical with `lint`/`format`.** Removing it silently reintroduces the clean-clone failure.

### Known Proper Fix — Deferred, Tracked as Debt

The correct architectural answer is **TypeScript project references**: the apps would resolve `shared` from source via `references`, and the whole graph would typecheck coherently with no pre-build step, no emitted-artifact dependency, and no ordering prefix.

That is a larger change touching every `tsconfig` in the workspace and deserves its own scoping. **The current prefix is a pragmatic patch, not the destination.** It is recorded here so the debt stays visible rather than buried in a package.json one-liner.

### Fresh-Clone Bootstrap

```bash
pnpm install
pnpm build      # topologically ordered: shared → backend, frontend
```

### Verification

Proven from a genuinely clean state (all three `dist/` directories and the TS `.tsbuildinfo` files deleted), on 2026-07-27:

1. Building either app alone fails with `TS2307`.
2. `pnpm build` from that identical state exits 0.
3. Artifact mtimes confirm shared is written ~4s before backend and ~9s before frontend — ordering, not coincidence.

Related: [[D15]] records the same "generated artifact must exist before the build works" shape on the Android side.
