---
target: cera.love landing (www)
total_score: 33
p0_count: 0
p1_count: 2
timestamp: 2026-07-04T01-12-41Z
slug: www-src-pages-index-astro
---

# Critique: cera.love landing (www/src/pages/index.astro)

Method: dual-agent (A: design review · B: detector + browser evidence)

## Design Health Score

| #         | Heuristic                       | Score     | Key Issue                                                       |
| --------- | ------------------------------- | --------- | --------------------------------------------------------------- |
| 1         | Visibility of System Status     | 3         | Form states solid; nothing exceptional                          |
| 2         | Match System / Real World       | 4         | Rano/Wieczór, PAO, real product names — domain-perfect          |
| 3         | User Control and Freedom        | 3         | Hover-open/close card jumpy; no re-edit after successful submit |
| 4         | Consistency and Standards       | 4         | Ramps, pills, link-swipe all coherent                           |
| 5         | Error Prevention                | 3         | Empty and malformed email share one path                        |
| 6         | Recognition Rather Than Recall  | 3         | Placeholder-only email label                                    |
| 7         | Flexibility and Efficiency      | 3         | autocomplete, Enter, Esc, skip link                             |
| 8         | Aesthetic and Minimalist Design | 4         | Exceptional restraint; day-arc is real design                   |
| 9         | Error Recovery                  | 3         | Generic "Sprawdź adres e-mail" for both error kinds             |
| 10        | Help and Documentation          | 3         | FAQ covers real questions; no contact path                      |
| **Total** |                                 | **33/40** | **Good — solid foundation**                                     |

## Anti-Patterns Verdict

Not AI-slop (both assessments). No eyebrows, no card grids, no hero-metric, no gradient text, no ghost-cards. Deterministic scan: 3 static findings — 2 false positives (Inter-Fallback metric shim string-match; 2px focus-ring radius counted as component radius), 1 borderline. In-page detector: `single-font` (non-issue — one-family commitment is doctrine) and `nested-cards` (worth an eyeball, likely PhoneFrame-in-section heuristic). Zero console errors, zero horizontal overflow at 390/768/1440, fonts fully self-hosted.

## Priority Issues

1. **[P1] Day-preview card collides with the lead paragraph** (RhythmPlayground: `absolute -top-4 -translate-y-full`). The signature interaction reads broken at its peak moment, desktop and mobile. Fix: reserve a dedicated slot (push grid down or fixed card region under the heading). → $impeccable polish
2. **[P1] 28 rhythm dots are operable with no accessible name and all 42 are ~17px (≈31–37px hit area)**. Pointer-AT/voice-control users get anonymous buttons; thumbs mis-tap. Fix: aria-labels on all rows' dots (or make non-cream rows `aria-hidden` presentation + pointer-events-none), grow `::after` inset to ≥44px. → $impeccable harden
3. **[P2] Rhythm grid isn't discoverable and has no day axis**. Off-dots at `white/13` near-invisible; no 1–14 header; hint sits below the grid. Jordan can't decode it, Casey scrolls past. Fix: raise off-dot opacity, add day-number axis or current-day pulse, move hint above. → $impeccable clarify + polish
4. **[P2] Email field: placeholder-only label, one message for two errors**. Label vanishes on type; empty vs malformed both say "Sprawdź adres e-mail." Fix: persistent micro-label; branch copy ("Wpisz adres e-mail" for empty). → $impeccable clarify
5. **[P3] Email tray focus ring too faint** (1px ink at 30%, both assessments flagged). Fix: 2px or higher opacity while staying neutral. → $impeccable polish

## Persona Red Flags

- **Jordan:** rhythm grid has no day axis — dots are cryptic without hovering.
- **Riley:** empty vs " @ ." → identical error; rapid pointer flicks make the card flash; no re-edit after valid-but-wrong email.
- **Casey:** dots <44px; off-dots invisible on mauve; language switcher out of thumb arc; CTA itself is thumb-friendly (good).

## Minor Observations

- Rose step-numerals (5xl) bend the One Rose Rule (decoration).
- Flags-as-languages: 🇬🇧 for English under-serves the "PL/UA/EN equal" principle; consider two-letter codes.
- dusk-subtle ~5.3:1 is the page's lowest-contrast text — least headroom.
- Success state offers no "change email" path.
- No in-page anchors to FAQ (fine for single scroll, worth knowing).
- Two identical waitlist forms; the final one could vary its reassurance.

## Questions to Consider

1. Should the two-week schedule read at a glance (visible day numbers, obvious on-days), with interaction as bonus rather than prerequisite?
2. Do rose step-numerals dilute the CTA's monopoly on rose?
3. Is a flag-only switcher worth it when GB-flag-equals-English contradicts language equality?
