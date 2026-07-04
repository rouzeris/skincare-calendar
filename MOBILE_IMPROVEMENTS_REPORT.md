# Mobile Improvements Report

Audit of the Expo app (SDK 54, expo-router 6, Tamagui) against the
vercel-react-native-skills rules (rule names cited inline) plus general
correctness. Files reviewed:
all of `app/`, `components/`, `context/`, `constants/`, `app.json`,
`package.json`.

## Critical — fix before shipping

### 1. Product images will disappear (data loss)

`app/add-product.tsx:132` stores the ImagePicker result URI directly. That URI
points into the app's **cache directory**, which iOS/Android purge under disk
pressure. Products will silently lose their photos.

Fix: copy the picked file to `FileSystem.documentDirectory` (expo-file-system)
before saving, store that path. Delete the copy in `removeProduct`.

### 2. Interval frequency is time-of-day dependent

`app/(tabs)/index.tsx:49-57` computes `differenceInDays(selectedDate, startDate)`
where `selectedDate` carries the wall-clock time of app launch and `startDate`
is a midnight ISO date. `differenceInDays` truncates, so an every-2-days product
can appear/disappear depending on what hour you open the app.

Fix: `startOfDay()` both dates before diffing (one line each).

### 3. Deprecated ImagePicker API

`app/add-product.tsx:126` uses `ImagePicker.MediaTypeOptions.Images` —
deprecated since SDK 52, scheduled for removal. Replace with
`mediaTypes: ['images']`.

### 4. `Alert.alert` is a no-op on web

`app/(tabs)/settings/index.tsx:127-147` — the delete-all-data confirmation and
the rate-app fallback use `Alert.alert`, which does nothing on react-native-web.
On web the delete flow is unreachable (currently masked because it's gated
behind `isDeveloper`, but it's a landmine). Use `window.confirm` on web or a
small in-app confirm.

## High — performance & native patterns (skill rules)

### 5. Shelf list re-does expensive work on every render

`app/(tabs)/shelf.tsx:151-267` violates `list-performance-item-expensive`,
`list-performance-item-memo`, `list-performance-callbacks`:

- `renderItem` is recreated every render and calls `detectIngredients(item.name)`
  (keyword scan over the whole ingredient DB) plus date parsing for expiration —
  per item, per render. Expanding one conflict card recomputes everything.
- Fix: precompute `{ tags, expiration }` per product in a `useMemo` keyed on
  `products`, extract a memoized `ProductRow` component, pass `removeProduct`
  directly (it's already stable from react-query).

### 6. Components defined inside components → remount storms

- `ConflictBanner`, `NoConflictsBadge` in `app/(tabs)/shelf.tsx:269, 338`
- `SettingsRow`, `LanguageRow` in `app/(tabs)/settings/index.tsx:149, 189`

Each render creates a **new component type**, so React unmounts and remounts
those subtrees on every state change (visible as flicker; also resets any
internal state). Hoist them to module scope and pass props, or inline them as
plain JSX.

### 7. JS tab bar with hardcoded heights

`app/(tabs)/_layout.tsx:9-19` hardcodes tab bar height (88/70/60) and bottom
padding per platform — wrong on iPhone SE (no home indicator), wrong on
Android devices with gesture nav. Two options:

- Preferred (`navigation-native-navigators`): expo-router 6 ships
  `NativeTabs` (`expo-router/unstable-native-tabs`) — real UITabBar/Material
  tabs, correct insets for free, deletes both helper functions.
- Minimal: keep JS `Tabs` but drop the hardcoded numbers; react-navigation
  already handles safe-area bottom insets when you don't override `height`.

### 8. 340 lines of hand-rolled date picker

`app/add-product.tsx:768-956` — two RN `Modal`s containing a hand-built
calendar grid (`renderCalendarGrid`, header, month chevrons) duplicated for
start/end date. Violates `ui-native-modals` and the platform-first principle:
`@react-native-community/datetimepicker` (or `presentation: 'formSheet'` route

- native picker) gives localized, accessible date selection and deletes
  ~300 lines. Bonus bug: the backdrop `Pressable` has `onPress={() => {}}`
  (`add-product.tsx:775`), so tapping outside the sheet does nothing — users
  expect backdrop-tap to dismiss.

### 9. Accessibility: icon-only buttons are invisible to screen readers

Nearly every touchable is a Tamagui `YStack`/`XStack` with `onPress` and no
`accessibilityRole`/`accessibilityLabel`: the calendar button
(`index.tsx:177`), add button (`shelf.tsx:383`), trash (`shelf.tsx:258`),
close X (`add-product.tsx:281`, `calendar.tsx:100`), month chevrons, day
cells, the settings toggle. VoiceOver/TalkBack users cannot operate the app.

- Add `accessibilityRole="button"` + label to every icon-only pressable
  (`role="checkbox"` + `accessibilityState={{checked}}` for routine items).
- Most touchables also lack `pressStyle` feedback and `hitSlop` (trash icon
  has hitSlop; chevrons and day cells don't).

### 10. Hand-rolled switch → native `Switch`

`app/(tabs)/settings/index.tsx:257-279` builds a toggle from two YStacks —
no animation, no accessibility, ~25 lines. React Native's `Switch` is one
element, animated, accessible, themed via `trackColor`/`thumbColor`.

## Medium

### 11. Destructive delete with no confirmation

`app/(tabs)/shelf.tsx:258-264` — one tap on the trash icon permanently removes
a product (and strands its ID in routine config — see #12). Add a confirm
step or undo toast.

### 12. Deleting a product leaves orphaned IDs in routines

`context/cosmetics.tsx` `removeProduct` doesn't touch `routine_config`.
Screens defensively `products.find()` and skip missing IDs, but the config
accumulates dead IDs forever and `routineConfig.morning.length > 0` can be
true while nothing renders (empty-looking routine screen without the empty
state). Clean routine config inside remove, or filter by existence for the
`isEmpty` check in `index.tsx:166`.

### 13. Unused native modules bloat the binary and app review

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

### 14. Stale "today" after midnight

`app/(tabs)/index.tsx:29-33` memoizes the 14-day strip with `[]` deps and
compares against `new Date()` in render. An app resumed the next morning
shows yesterday's window until remount. Recompute when the screen focuses
(`useFocusEffect` or key by `format(new Date(), 'yyyy-MM-dd')`).

Related UX: the strip renders 14 days starting 7 days back with no initial
scroll offset — "today" starts half off-screen. Scroll to it on mount
(`contentOffset` or `scrollTo`).

### 15. `Math.random()` product IDs

`app/add-product.tsx:160` — `Math.random().toString(36).substr(2, 9)`
(`substr` is deprecated too). Collisions are unlikely but IDs are the only
key linking three AsyncStorage stores. `Crypto.randomUUID()` from
`expo-crypto` is one line.

## Low

- **ErrorBoundary leak** — `components/ErrorBoundary.tsx:47`: the pulse
  `Animated.loop` is never stopped after `handleReset`, animating forever in
  the background. Keep a ref and `.stop()` it.
- **Suggestion list `key={index}`** — `add-product.tsx:395`; use
  `brand + name`.
- **Settings header inconsistency** — settings tab uses a nested `Stack`
  header (`settings/_layout.tsx`) while other tabs use `PageTitleBar`; pick
  one.
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

1. #1 image persistence (data loss) + #3 deprecated API — small, urgent
2. #2 interval off-by-one — two lines
3. #6 hoisted components + #5 shelf memoization — an afternoon
4. #9 accessibility pass — mechanical, high user impact
5. #8 native date picker — biggest line-count win (-300 LOC)
6. #13 dependency prune + app.json permissions — before store submission
