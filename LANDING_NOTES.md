# Landing notes

Working notes for the cera.love landing redesign. Current implementation: `www/` (Astro 7 + React, PL/UA/EN).

## Feedback on v1 (2026-07-03)

- Hero diptych reads as a dark-mode feature demo ("oh, we have dark mode, nice") instead of the morning/evening ritual story. The split-screen device gimmick foregrounds theming; the product story is routine + care.
- Language switcher should show flags (🇵🇱 🇺🇦 🇬🇧), matching the app's selector.

## Keep from v1 (whatever the new design looks like)

- Real app screenshots, per-locale, seeded with realistic data (`www/src/assets/app/`, capture flow in `www/README.md`)
- Conversion spine: email field in first viewport, one CTA per fold, repeat CTA near the end, honest microcopy, full form states
- Trilingual parity — layouts survive PL/UA/EN string lengths, full Cyrillic type support
- Legal pages fed from `legal/*.md`
- Rose `#E11D48` + stone neutrals as brand anchor

## Variant.com prompt

Paste as-is:

---

Goal: Design a landing page for **Cera** (cera.love) that makes a visitor feel "this app will take care of my skincare ritual for me" and join the email waitlist.

Success means:

- The hero communicates the product's job in one glance: Cera remembers your morning and evening skincare routine, so you don't have to.
- An email waitlist form sits in the first viewport with a single primary CTA; a second CTA closes the page.
- The design feels calm, caring, ritual — a quiet moment of self-care, like a warm bathroom at 10pm — and reads as crafted, editorial-quality work.
- Type and layout hold up in Polish, Ukrainian, and English (full Cyrillic support; strings run ~20% longer than English).
- The language switcher is three flag buttons: 🇵🇱 🇺🇦 🇬🇧.

About the product: Cera is a mobile skincare-routine calendar. You add your products (serums, creams, acids), plan each one's rhythm — daily, every N days, or specific weekdays — and check them off morning and evening. It also tracks each product's expiry (PAO) so nothing goes off on your shelf. Made by one person for people who care for their skin daily; voice of a knowledgeable friend, never a dermatologist, never an influencer.

Brand identity: rose accent #E11D48 on warm stone neutrals; rounded, tactile, unhurried. Serif display + humanist sans body (must include Cyrillic). Wordmark: lowercase "cera." with a rose period.

Content to design around (Polish copy, translate the vibe not the words):

- H1: "Twoja cera ma swój rytm." (Your skin has its own rhythm.)
- Sub: "Cera pamięta, co i kiedy nałożyć — rano i wieczorem. Ty po prostu dbasz o siebie."
- Sections: how it works (3 real steps: add products → plan the rhythm → check off AM/PM), expiry-watching shelf, scheduling flexibility ("Kwas co trzy dni? Zaplanowane."), a vertical-video strip (9:16 TikTok-style clips — design the slot with tasteful placeholders, content comes later), final waitlist CTA.
- Real iPhone screenshots of the app exist in light and dark themes and all three languages — use phone mockups with real UI, and treat the screenshot as product proof.

On morning/evening: it's the product's heartbeat, so let time-of-day drive the _narrative_ — sunrise-to-night storytelling down the page, sun and moon as ritual markers, copy that anchors to "rano i wieczorem". Show the app UI in whichever theme fits each scene. Keep the story about the user's ritual; the app following the time of day should feel like care, the way a bedside lamp dims in the evening — a companion, not a settings toggle.

Aesthetic guardrails: commit to the rose palette as voice (a drenched rose or plum moment is welcome); warm neutrals stay tinted toward rose. Choose a distinctive aesthetic lane and commit — the reference bar is Awwwards SOTD, not a SaaS template. Body text ≥16px at 4.5:1 contrast.

Stop when: one polished desktop + mobile concept of the full page (hero through footer) is ready.

---

## 2026 trends worth considering (filtered for Cera)

- **Kinetic typography as the hero.** Type is the hero image in 2026; oversized expressive headlines with purposeful motion. For Cera: the H1's key word cycles „rano" ⇄ „wieczorem", or letters settle in like a routine being checked off. Cheap, on-brand, replaces the diptych gimmick.
- **Scroll-driven storytelling.** Motion directs attention down a narrative. We already have the sunrise→night arc; deepen it with CSS scroll-driven animations instead of section-stepped themes.
- **Time-of-day personalization (our twist).** Landing greets you in _your_ moment: morning visitors get the sunrise scene, evening visitors the night ritual. Personalization trend, but tied to product truth — the app also lives by AM/PM. Feels like care, not a feature toggle.
- **Textured warmth.** Grain, soft light gradients, tactile shadows — the "quiet luxury" editorial feel. Fits calm/caring better than flat minimalism.
- **Hand-drawn accents.** Doodle trend fits the "knowledgeable friend" voice, but only with genuinely good illustration — amateur sketchy SVG reads worse than nothing. Needs an illustrator or a very good asset pack.
- **Skip:** 3D/WebGL product scenes (heavy, wrong energy for calm), AI-personalized content blocks (nothing to personalize pre-launch), bento grids (already reading as 2024).

## Vertical video (later)

TikTok-style 9:16 clips on the landing — possibly AI UGC (avatar "get ready with me" routines, product-shelf tours). Decisions parked:

- Slot ships first: design reserves a swipeable vertical-video rail (poster frames until real clips exist; `<video>` muted/loop/poster, lazy).
- AI UGC risk: uncanny beauty content can burn trust with this audience — test against real footage (Rosia filming a real evening routine beats a synthetic avatar).
- Format doubles as ad creative for TikTok/Reels when marketing starts.

## v2 implemented (2026-07-04)

Direction chosen: **scroll-driven storytelling + textured warmth** (instead of the Variant route, which stays available above).

- Hero = morning scene: leaf-shadow video over warm rose light (mix-blend multiply, warmed with sepia filter, masked fade), light-theme phone only. Diptych removed.
- Scroll arc: day → sunset gradient band → dusk (lamp glow) → night gradient → night CTA (moon glow). Gentle `animation-timeline: view()` reveals on screenshots/viz, visible-by-default states.
- Texture: tiled noise `grain.png` fixed overlay (multiply, 6%), layered tactile shadows on form bar + screenshots.
- Flags in language switcher (header + footer), sr-only names for a11y. Caveat: Windows renders flag emoji as letter pairs ("PL") — swap to inline SVG flags if that matters.

## v3 implemented (2026-07-04)

- **Tailwind 4 everywhere** (`@tailwindcss/vite`, CSS-first `@theme` tokens in `global.css`); all scoped `<style>` blocks converted to utilities.
- **Inter Variable** everywhere — the app's actual font (Tamagui v3 default), full Cyrillic. Piazzolla/Golos removed.
- Hero: copy left, phone right (stacked + centered on mobile).
- `PhoneFrame.astro`: device bezel (gradient ring, side buttons, screen inset) wrapping all app screenshots.
- Night scene now symmetric with morning: „Wieczorem" marker over the final CTA.
- FAQ block (Tailark-inspired, native `<details>`, 5 Q&As ×3 locales) before the final CTA. Tailark itself is paid/shadcn — pattern inspiration only, no code copied.
- Language switcher: single flag-only `<select>` (native, `aria-label`ed) in header + footer.
- Copy: „Ogarnięte." → „Zaplanowane." (too slangy for the calm/caring voice — watch for this register in future copy).

## Overdrive (2026-07-04)

Direction picked: scroll-day choreography + playable ritual widget (no WebGL shader — parked).

- Leaf shadows drift up + dim as the hero scrolls away (scroll-driven, `@supports` guarded).
- Lamp glow in the dusk section drifts with scroll.
- ~~Night CTA sleeping phone~~ — cut same day: third device frame on one page was redundant. The moon glow + copy carry the night scene.
- Rhythm viz is now `RhythmPlayground.tsx`: pointer trail blooms dots with staggered glow, tapping a day opens a routine-preview card (`startViewTransition` + `@starting-style`, Esc closes). SSR'd so dots render before JS.
- All effects transform/opacity/bg-color only, reduced-motion safe, static fallbacks.

### Leaf video licensing — IMPORTANT

`www/public/shadows-loop.mp4` is **Lefos's asset, local test only** — gitignored (repo is public), never deploy it. Source: `https://static.lefos.com/06d030a36ecf815aaa3878a97d9c82ec960be4b7/assets/shadows-loop-ohxjmG36.mp4` (h264, 1280×720, 7 s loop, 125 kB). Replace with our own before launch: Midjourney/video-gen prompt ≈ "soft blurred shadows of swaying leaves on a white plaster wall, gentle summer breeze, dappled sunlight, seamless loop, grayscale, minimal" — grade to match, keep under ~300 kB.

## After Variant

- Map the chosen concept back onto `www/` — sections, tokens, and i18n plumbing already exist; this is a reskin, not a rebuild.
- Flags in the switcher: update `Header.astro` + `Footer.astro` (`locales.map` renders text today).
- Screenshots regenerate per locale/theme via the capture flow in `www/README.md`.
