# Skincare Calendar App - Roadmap to App Store

## Current State

**Version:** 1.0.0
**Stack:** Expo 54, React Native 0.81, Tamagui, TypeScript
**Status:** Core features complete, needs polish for production release

### What Works

- 14-day calendar with routine tracking (morning/evening)
- Product shelf with expiration tracking (PAO calculation)
- Add product flow with frequency options (daily, specific days, interval)
- Theme switching (light/dark/auto)
- Cross-platform support (iOS, Android, Web)
- Playwright E2E tests (11 passing, web)

### What's Missing

- Subscriptions (RevenueCat removed — re-add if monetizing)
- Settings screen incomplete
- App Store metadata missing

---

## TODO — cleanup po migracji z Rork (2026-05-31)

Rork i RevenueCat usunięte; appka startuje na czystym Expo (`bun start` / `bun start-web`).
Zostały artefakty i drobiazgi:

- [ ] Rebranding identyfikatorów na cera.love (świadomie nieruszane — wpływa na podpisywanie/store/deep linki):
  - [ ] `app.json` `scheme: "rork-app"`
  - [ ] `app.json` `ios.bundleIdentifier: app.rork.kalendarz-kosmetykow-twarz`
  - [ ] `app.json` `android.package: app.rork.kalendarz_kosmetykow_twarz`
  - [ ] android market URL w `app/(tabs)/settings/index.tsx` (`market://details?id=app.rork...`) — musi pasować do `android.package`
  - [ ] `README.md` — cała dokumentacja Rorka
- [ ] Hostować strony privacy/terms pod `cera.love/privacy` i `cera.love/terms` (już linkowane w ustawieniach)
- [ ] `bun test` nie działa (Bun próbuje sam uruchamiać pliki Playwrighta) — naprawić skrypt `test` lub udokumentować `bunx playwright test`
- [ ] Deprecated `ImagePicker.MediaTypeOptions` → `ImagePicker.MediaType` (warn przy starcie)

---

## Phase 1: App Store Requirements

### 1.1 Settings Screen Completion

**File:** `app/(tabs)/settings/index.tsx`

- [ ] Add Privacy Policy link (required by App Store)
- [ ] Add Terms of Service link
- [ ] Add Support/Contact option (email or form)
- [ ] Add "Rate the App" button
- [ ] Add data export functionality (JSON export of products/routines)
- [ ] Add data import functionality
- [ ] Add "Delete All Data" with confirmation

### 1.2 Legal Documents

- [ ] Create Privacy Policy (can use generator, then host on website)
- [ ] Create Terms of Service
- [ ] Host documents at rork.com or similar

### 1.3 App Store Metadata

**File:** `app.json`

```json
{
  "expo": {
    "ios": {
      "buildNumber": "1",
      "infoPlist": {
        "ITSAppUsesNonExemptEncryption": false
      }
    },
    "android": {
      "versionCode": 1
    }
  }
}
```

- [ ] Add privacy policy URL
- [ ] Add support URL
- [ ] Set minimum iOS version (recommend 15.0+)
- [ ] Prepare App Store Connect metadata:
  - App name (localized)
  - Subtitle
  - Description (4000 chars)
  - Keywords
  - Screenshots (6.7", 6.5", 5.5" for iPhone; 12.9" for iPad)
  - App preview video (optional)

---

## Phase 2: RevenueCat & Subscriptions

### 2.1 Environment Setup

**File:** `.env` (create from `.env.example`)

```
EXPO_PUBLIC_REVENUECAT_IOS_API_KEY=appl_xxxxx
EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY=goog_xxxxx
```

- [ ] Create RevenueCat project at app.revenuecat.com
- [ ] Configure iOS app in App Store Connect
- [ ] Create subscription product in App Store Connect
- [ ] Link product to RevenueCat offering
- [ ] Add API keys to environment

### 2.2 EAS Build Setup

```bash
# Install EAS CLI
bun add -g eas-cli

# Configure project
eas build:configure

# Create development build for testing IAP
eas build --profile development --platform ios
```

- [ ] Create `eas.json` configuration
- [ ] Set up development build profile
- [ ] Set up production build profile
- [ ] Test subscription purchase flow on device
- [ ] Test restore purchases
- [ ] Test subscription cancellation

### 2.3 Subscription Management UI

**File:** `app/(tabs)/settings/subscription.tsx` (new)

- [ ] Show current subscription status
- [ ] Show renewal date
- [ ] Link to App Store subscription management
- [ ] Handle grace period states
- [ ] Handle billing retry states

### 2.4 Paywall Improvements

**File:** `app/paywall.tsx`

- [ ] Add trial period indication (if applicable)
- [ ] Add price per month/year breakdown
- [ ] Improve loading states
- [ ] Add proper error messages (network, cancelled, etc.)
- [ ] Translate to English (currently has Polish text)

---

## Phase 3: Testing

### 3.1 Playwright E2E Tests (Web)

```bash
# Install
bun add -d @playwright/test

# Create config
bunx playwright install
```

**File:** `playwright.config.ts`

```typescript
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  webServer: {
    command: "bun start-web",
    port: 8081,
    reuseExistingServer: !process.env.CI,
  },
  use: {
    baseURL: "http://localhost:8081",
  },
});
```

**Test Files to Create:**

- [ ] `e2e/routine.spec.ts` - Calendar navigation, marking products complete
- [ ] `e2e/shelf.spec.ts` - View products, delete product
- [ ] `e2e/add-product.spec.ts` - Full add product flow
- [ ] `e2e/settings.spec.ts` - Theme switching, navigation
- [ ] `e2e/navigation.spec.ts` - Tab navigation, modal flows

**Priority Test Cases:**

```typescript
// e2e/routine.spec.ts
test("can navigate between days", async ({ page }) => {
  await page.goto("/");
  // Select a different day
  // Verify day is selected
});

test("can mark product as complete", async ({ page }) => {
  // Add a product first
  // Navigate to routine
  // Click checkbox
  // Verify completion state
});
```

### 3.2 Unit Tests with Vitest

```bash
bun add -d vitest @testing-library/react-native
```

**Test Files to Create:**

- [ ] `src/__tests__/frequency.test.ts` - Frequency calculation logic
- [ ] `src/__tests__/expiration.test.ts` - PAO/expiration calculations
- [ ] `src/__tests__/routine.test.ts` - Routine state logic

### 3.3 Add Test Scripts

**File:** `package.json`

```json
{
  "scripts": {
    "test": "vitest",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

---

## Phase 4: Production Hardening

### 4.1 Error Tracking

```bash
bun add @sentry/react-native
```

- [ ] Create Sentry project
- [ ] Configure Sentry in root layout
- [ ] Add source maps upload to EAS build

### 4.2 Analytics

```bash
bun add expo-analytics-amplitude
# or
bun add @react-native-firebase/analytics
```

- [ ] Track key events:
  - `product_added`
  - `product_completed`
  - `routine_streak` (days in a row)
  - `subscription_started`
  - `subscription_cancelled`

### 4.3 Performance

- [ ] Add React Native Performance monitoring
- [ ] Optimize image loading (use expo-image with caching)
- [ ] Lazy load settings screen
- [ ] Profile and fix any render loops

### 4.4 Offline Support

- [ ] Verify app works fully offline
- [ ] Add network status indicator (optional)
- [ ] Queue RevenueCat operations for retry

---

## Phase 5: Polish & Launch

### 5.1 UX Improvements

- [ ] Add onboarding flow for new users
- [ ] Add empty state animations
- [ ] Add haptic feedback on interactions
- [ ] Add pull-to-refresh on shelf
- [ ] Add streak counter on routine screen
- [ ] Add weekly/monthly insights

### 5.2 Accessibility

- [ ] Audit with VoiceOver (iOS) and TalkBack (Android)
- [ ] Ensure all interactive elements have labels
- [ ] Test with larger text sizes
- [ ] Verify color contrast ratios

### 5.3 Localization

Current app has Polish text in places. Decide:

- [ ] Polish-only launch
- [ ] English + Polish launch
- [ ] Extract all strings to i18n system

### 5.4 App Store Submission

- [ ] Create App Store Connect listing
- [ ] Upload screenshots
- [ ] Submit for review
- [ ] Prepare for potential rejection feedback
- [ ] Plan soft launch / TestFlight beta

---

## Implementation Order

| Priority | Task                          | Effort | Blocking           |
| -------- | ----------------------------- | ------ | ------------------ |
| P0       | Settings: Privacy Policy link | 1h     | App Store          |
| P0       | Create & host Privacy Policy  | 2h     | App Store          |
| P0       | EAS build configuration       | 2h     | RevenueCat testing |
| P1       | RevenueCat API keys setup     | 1h     | Subscriptions      |
| P1       | Test subscription flow        | 2h     | Launch             |
| P1       | Playwright test setup         | 2h     | CI/CD              |
| P1       | Core E2E tests (5 files)      | 4h     | Quality            |
| P2       | Settings completion           | 4h     | Polish             |
| P2       | Subscription management UI    | 3h     | Polish             |
| P2       | Sentry integration            | 2h     | Production         |
| P3       | Analytics integration         | 2h     | Growth             |
| P3       | Onboarding flow               | 4h     | Conversion         |
| P3       | Accessibility audit           | 3h     | Quality            |

---

## Commands Reference

```bash
# Development
bun start-web          # Web dev server
bun start              # Mobile dev server (Expo Go)
bun run typecheck      # TypeScript check
bun run lint           # ESLint

# Testing (after setup)
bun test               # Unit tests
bun test:e2e           # Playwright E2E
bun test:e2e:ui        # Playwright UI mode

# Building
eas build --profile development --platform ios    # Dev build
eas build --profile production --platform ios     # Prod build
eas submit --platform ios                         # Submit to App Store
```

---

## Notes

- App uses local-first architecture (AsyncStorage) - no backend sync
- RevenueCat is only subscription/backend dependency
- Web version won't support subscriptions (by design)
- Consider adding iCloud sync for premium users in future
