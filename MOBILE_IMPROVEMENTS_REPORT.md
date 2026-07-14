# Mobile Improvements Report

Audit of the Expo app (SDK 54, expo-router 6, Tamagui) against the
vercel-react-native-skills rules (rule names cited inline) plus general
correctness. Files reviewed:
all of `app/`, `components/`, `context/`, `constants/`, `app.json`,
`package.json`.

Numbering matches the original audit; resolved entries have been removed as
their fixes landed. See the linked GitHub issues for what shipped.

## Critical — fix before shipping

### 4. `Alert.alert` is a no-op on web (issue #14)

`app/(tabs)/settings/index.tsx:127-147` — the delete-all-data confirmation and
the rate-app fallback use `Alert.alert`, which does nothing on react-native-web.
On web the delete flow is unreachable (currently masked because it's gated
behind `isDeveloper`, but it's a landmine). Use `window.confirm` on web or a
small in-app confirm. (The shelf trash-icon delete already uses this pattern;
settings still doesn't.)

## High — performance & native patterns (skill rules)

### 7. JS tab bar with hardcoded heights (issue #17)

`app/(tabs)/_layout.tsx:9-19` hardcodes tab bar height (88/70/60) and bottom
padding per platform — wrong on iPhone SE (no home indicator), wrong on
Android devices with gesture nav. Two options:

- Preferred (`navigation-native-navigators`): expo-router 6 ships
  `NativeTabs` (`expo-router/unstable-native-tabs`) — real UITabBar/Material
  tabs, correct insets for free, deletes both helper functions.
- Minimal: keep JS `Tabs` but drop the hardcoded numbers; react-navigation
  already handles safe-area bottom insets when you don't override `height`.

### 8. 340 lines of hand-rolled date picker (issue #18)

`app/add-product.tsx:768-956` — two RN `Modal`s containing a hand-built
calendar grid (`renderCalendarGrid`, header, month chevrons) duplicated for
start/end date. Violates `ui-native-modals` and the platform-first principle:
`@react-native-community/datetimepicker` (or `presentation: 'formSheet'` route

- native picker) gives localized, accessible date selection and deletes
  ~300 lines. Bonus bug: the backdrop `Pressable` has `onPress={() => {}}`
  (`add-product.tsx:775`), so tapping outside the sheet does nothing — users
  expect backdrop-tap to dismiss.

### 9. Accessibility: icon-only buttons are invisible to screen readers (issue #19)

Nearly every touchable is a Tamagui `YStack`/`XStack` with `onPress` and no
`accessibilityRole`/`accessibilityLabel`: the calendar button
(`index.tsx:177`), add button (`shelf.tsx:383`), trash (`shelf.tsx:258`),
close X (`add-product.tsx:281`, `calendar.tsx:100`), month chevrons, day
cells, the settings toggle. VoiceOver/TalkBack users cannot operate the app.

- Add `accessibilityRole="button"` + label to every icon-only pressable
  (`role="checkbox"` + `accessibilityState={{checked}}` for routine items).
- Most touchables also lack `pressStyle` feedback and `hitSlop` (trash icon
  has hitSlop; chevrons and day cells don't).

### 10. Hand-rolled switch → native `Switch` (issue #20)

`app/(tabs)/settings/index.tsx:257-279` builds a toggle from two YStacks —
no animation, no accessibility, ~25 lines. React Native's `Switch` is one
element, animated, accessible, themed via `trackColor`/`thumbColor`.

## Medium

### 13. Unused native modules bloat the binary and app review (issue #22)

`package.json` ships modules with zero imports in `app/`, `components/`,
`context/`, `constants/`: `expo-location` (adds location APIs to the binary —
App Store reviewers ask questions), `expo-blur`, `expo-linear-gradient`,
`expo-haptics`, `expo-symbols`, `expo-constants`, `react-native-worklets`,
`zustand`, `@ungap/structured-clone`, `@stardazed/streams-text-encoding`.
Remove what's not planned for immediate use — each expo module is native code
compiled into every build.

Also `app.json:66-70`: `READ_EXTERNAL_STORAGE`/`WRITE_EXTERNAL_STORAGE` are
unnecessary for the image picker on modern Android and trigger Play Store
review friction. Drop them.

### 14. Stale "today" after midnight (issue #23)

`app/(tabs)/index.tsx:29-33` memoizes the 14-day strip with `[]` deps and
compares against `new Date()` in render. An app resumed the next morning
shows yesterday's window until remount. Recompute when the screen focuses
(`useFocusEffect` or key by `format(new Date(), 'yyyy-MM-dd')`).

Related UX: the strip renders 14 days starting 7 days back with no initial
scroll offset — "today" starts half off-screen. Scroll to it on mount
(`contentOffset` or `scrollTo`).

### 15. `Math.random()` product IDs — partial (issue #24)

Deprecated `substr` replaced with `slice`. `Crypto.randomUUID()` (expo-crypto)
swap intentionally deferred — collision risk is negligible for a single-user
local store; revisit if/when syncing to Convex.

## Low

- **Toggle-completion race** — `context/routine.tsx:53`: mutations
  read-modify-write the whole history object; two fast taps can drop one
  write. Fine for a single-user local app; revisit when syncing to Convex.
- **FlatList is fine** — shelf lists are small; `FlashList`
  (`list-performance-virtualize`) only becomes relevant if a product catalog
  view appears.

## Already good

- `expo-image` used for all images (`ui-expo-image`) ✓
- `Intl.DateTimeFormat` instances hoisted/memoized per locale in
  `context/intl.tsx` (`js-hoist-intl`) ✓
- Native stack via expo-router `Stack`; modals use native `presentation:
"modal"` ✓
- Conditional rendering uses boolean comparisons, not raw falsy `&&` ✓
- Splash screen held until locale loads; theme/intl context values memoized ✓
- New Architecture enabled, typed routes on ✓

## Suggested order

1. #9 accessibility pass — mechanical, high user impact
2. #8 native date picker — biggest line-count win (-300 LOC)
3. #13 dependency prune + app.json permissions — before store submission
4. #4 settings web-confirm + #14 stale "today" — small correctness fixes
