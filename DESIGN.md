---
name: Cera
description: Skincare routine calendar — the app and cera.love share one visual day.
colors:
  rose-accent: "#E11D48"
  rose-soft: "#FB7185"
  stone-ink: "#292524"
  stone-subtle: "#78716C"
  stone-bg: "#FAFAF9"
  stone-card: "#FFFFFF"
  stone-border: "#E7E5E4"
  day-bg: "oklch(0.976 0.006 17)"
  day-ink: "oklch(0.28 0.022 20)"
  day-subtle: "oklch(0.47 0.03 20)"
  day-accent: "oklch(0.55 0.21 17)"
  dusk-rose: "#B4898B"
  dusk-violet: "oklch(0.26 0.055 330)"
  night-bg: "oklch(0.2 0.042 4)"
  night-ink: "oklch(0.945 0.014 10)"
  night-subtle: "oklch(0.76 0.05 10)"
  night-accent: "oklch(0.72 0.14 14)"
  link-day: "oklch(0.52 0.16 258)"
  link-night: "oklch(0.74 0.11 258)"
typography:
  display:
    fontFamily: "InterVariable, Inter, system-ui, sans-serif"
    fontSize: "clamp(2.625rem, 5vw + 1rem, 5rem)"
    fontWeight: 680
    lineHeight: 1.05
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "InterVariable, Inter, system-ui, sans-serif"
    fontSize: "clamp(1.875rem, 3vw + 0.75rem, 3.25rem)"
    fontWeight: 640
    lineHeight: 1.1
    letterSpacing: "-0.025em"
  title:
    fontFamily: "InterVariable, Inter, system-ui, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 600
    lineHeight: 1.25
  body:
    fontFamily: "InterVariable, Inter, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 420
    lineHeight: 1.65
  label:
    fontFamily: "InterVariable, Inter, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    letterSpacing: "0.05em"
rounded:
  chip: "12px"
  card: "16px"
  screen: "20px"
  pill: "999px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  section: "clamp(4.5rem, 10vw, 8.5rem)"
components:
  button-primary:
    backgroundColor: "{colors.rose-accent}"
    textColor: "{colors.stone-card}"
    rounded: "{rounded.pill}"
    padding: "12px 24px"
  card-app:
    backgroundColor: "{colors.stone-card}"
    textColor: "{colors.stone-ink}"
    rounded: "{rounded.card}"
    padding: "16px"
---

# Design System: Cera

## 1. Overview

**Creative North Star: "Twoja cera ma swój rytm" — The Day's Rhythm**

Every Cera surface knows what time it is. The app renders the same routine
twice a day under two lights — Stone-white mornings (☀ Rano) and Stone-900
evenings (☾ Wieczór), marked in-product with lucide Sun/Moon icons. The
landing page compresses that whole day into one scroll: leaf-shadowed morning
light, a mesh-gradient twilight, a plum night. Nothing is "dark mode as a
feature"; light is the narrative material.

The system explicitly rejects beauty-influencer gloss (sparkle, hype),
clinical/pharma coldness (sterile white, lab language), and generic SaaS
landing grammar. Calm is the default register; warmth comes from light,
texture (film grain, leaf shadows), and soft-tactile controls — never from
beige backgrounds or louder color.

**Key Characteristics:**

- One day, two themes: every color has a Rano and a Wieczór answer
- Rose is identity and action; it never decorates
- Soft-tactile controls — things you press, gently
- Real app screenshots as the only product imagery
- Trilingual (PL/UA/EN) by default; layouts survive all three

## 2. Colors

Rose-tinted stones walk from near-white morning to plum night; one rose voice
carries identity across both.

### Primary

- **Cera Rose** (#E11D48): the brand's single voice — primary buttons, active
  tab, brand-name labels, the wordmark's period. In the app's dark theme it
  softens to **Rose Soft** (#FB7185).
- **Night Rose** (oklch(0.72 0.14 14)): the landing's night-section accent —
  rhythm dots, FAQ toggle, moon glyph.

### Secondary

- **Periwinkle Link** (oklch(0.52 0.16 258) day / oklch(0.74 0.11 258) night):
  text links only, always with the marker-swipe hover. The cool counterpoint
  that keeps rose scarce.

### Neutral

- **Stone ramp** (app): #FAFAF9 background, #FFFFFF cards, #E7E5E4 borders,
  #78716C secondary text, #292524 ink. Dark theme mirrors on Stone 900.
- **Day ramp** (landing): rose-tinted stones — oklch(0.976 0.006 17)
  background, oklch(0.28 0.022 20) ink, oklch(0.47 0.03 20) subtle.
- **Dusk & Night** (landing): dusty rose #B4898B opens the twilight; mesh
  patches fall through mauve/violet to oklch(0.2 0.042 4) night, with
  oklch(0.945 0.014 10) ink at weight 380.

### Named Rules

**The One Rose Rule.** Rose marks identity and primary action — never
decoration, never large surfaces. If rose covers more than a button, it's
wrong.
**The Gradient Space Rule.** Multi-stop background blends interpolate
`in oklch`; sRGB's gray midpoints are prohibited.

## 3. Typography

**Display & Body Font:** InterVariable (self-hosted from rsms.me, full
Cyrillic; fallback metric-matched Arial). One family, committed weight
contrast.

**Character:** the app's own voice (Tamagui/Inter) carried to the web —
quiet, modern, trusted with skin. Features `cv01 cv02 cv10 ss02 ss03 cv11`.

### Hierarchy

- **Display** (680, clamp(2.625–5rem), 1.05, -0.03em): hero H1 only.
- **Headline** (640, clamp(1.875–3.25rem), 1.1): section titles; weight 500
  on dark sections.
- **Title** (600, 1.375rem): step and card headings; app 18px/600.
- **Body** (420, 1.0625rem, 1.65): light sections; **380 + 0.01em tracking on
  dusk/night** to compensate for light-on-dark bloom. Max 60–65ch.
- **Label** (600, 12px, +0.05em, uppercase): app brand labels in rose, tab
  labels, form hints at 0.875rem sentence case.

### Named Rules

**The Two-Weights-Apart Rule.** Adjacent hierarchy levels differ by ≥140
weight units or a full size step — no muddy 500-vs-560 neighbors.

## 4. Elevation

Light over shadow. Depth comes from light behaving physically: inset
highlights on pressed surfaces, glows around night accents, tonal layering
between sections, and film grain (multiply, 6%) unifying every surface. Drop
shadows are reserved for the two "physical objects": the phone frame
(`drop-shadow` 24–40px) and app cards (black at 5%, y2 blur8). The primary
button carries a 1px hard "lip" below its face — a key, not a floating chip.

### Shadow Vocabulary

- **Card rest** (`0 2px 8px rgb(0 0 0 / 0.05)`): app routine/product cards.
- **Key lip** (`inset 0 1px 0 white/25, inset 0 -1px 0 rose-deep/50, 0 1px 0 rose-deep/90, 0 3px 7px -3px rose-deep/30`): primary button at rest; lip collapses on hover (sink 1px) and press (sink 2px + inset).
- **Tray inset** (`inset 1px 1px 4px stone/30, inset -1px -1px 4px white/60, 0 0 0 1px ink/10`): debossed input containers.
- **Night glow** (`0 0 10px night-accent/50`): active rhythm dots, moon accents.

### Named Rules

**The One Object Rule.** Only the phone frame earns a large drop shadow; it
is the single physically "lifted" thing on any screen.

## 5. Components

### Buttons

- **Shape:** full pill (999px)
- **Primary:** Cera Rose with a top scrim gradient (white 14% → 0), white
  text 600; neumorphic key shadows per Elevation
- **Hover:** sinks 1px, lip collapses (150ms ease-out-quint); **Press:** sinks
  2px into an inset shadow
- **App primary:** rose with rose-glow shadow (E11D48 30%, y4 blur8), r16

### Text Links

- **Marker swipe:** rotated (-1deg) periwinkle band at 15% behind the text;
  hover sweeps it to full (`scaleY(2)`, +0.35deg) and flips ink —
  `250ms 33ms cubic-bezier(0.19, 1, 0.22, 1)`. No underlines elsewhere.

### Cards / Containers

- **App cards:** white on stone, r16, 16px padding, card-rest shadow; brand
  label (rose, 12px caps) above product name
- **Landing popover:** dusk-surface, r12, 16px padding, deep soft shadow;
  glides between positions on a motion.dev spring (420/34)

### Inputs / Fields

- **Tray:** day-surface pill, debossed (tray inset), 8px padding gap 8px;
  input transparent within
- **Focus:** neutral ink ring at 30%, 1px, offset 2 — quiet, never rose

### Navigation

- **App:** bottom tabs, lucide icons 20px, rose active / stone-500 idle,
  12px/500 labels (lineHeight 16 + minHeight to protect descenders)
- **Landing:** wordmark "cera." + flag-only native `<select>` language
  switcher (borderless, hover wash)

### Phone Frame (signature)

Gradient metal bezel (r48) with side buttons, true-scale Dynamic Island
(125:37 at 32% width) over a #FAFAF9 status bar, 1px black/40 screen ring.
Only ever filled with real, per-locale app screenshots.

### Rhythm Playground (signature)

14-day dot grid: night-accent on-days, white/13 off-days; pointer trail
blooms dots (scale 1.45 + glow, 28ms/dot stagger); hover opens, click pins,
Esc closes a spring-gliding day-preview card.

## 6. Do's and Don'ts

### Do:

- **Do** give every new surface a time of day; pick tokens from that ramp
  (day/dusk/night), never mix ramps in one component.
- **Do** interpolate multi-color gradients `in oklch` and hide banding under
  the 6% grain.
- **Do** use real app screenshots (per-locale, seeded data) for any product
  imagery; regenerate via `www/README.md` capture flow.
- **Do** keep body text ≥16px, ≥4.5:1; drop dark-section body weight to 380.
- **Do** respect `prefers-reduced-motion` with visible-by-default states on
  every reveal.

### Don't:

- **Don't** use beauty-influencer aesthetics: glossy gradients, sparkle,
  "glow up" hype (PRODUCT.md anti-reference, verbatim).
- **Don't** slip into clinical/pharma coldness — sterile white, blue crosses,
  lab language.
- **Don't** reach for SaaS landing grammar: hero-metric blocks, identical
  card grids, eyebrow kickers above sections.
- **Don't** make medical claims anywhere in UI copy; serious problems route
  to a doctor.
- **Don't** put rose on large surfaces or use it as a text-link color.
- **Don't** use slang in copy („Ogarnięte" register); the voice is a
  knowledgeable friend, unhurried.
