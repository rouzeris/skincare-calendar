# Design Review Report — cera.love landing

Date: 2026-07-04 · Target: `www/` (built site, PL/UA/EN)
Method: dual-agent (A: independent design review · B: deterministic detector + browser evidence, isolated until synthesis)
Snapshot: `.impeccable/critique/2026-07-04T01-12-41Z__www-src-pages-index-astro.md` (first run for this target — no trend yet)

## Design Health Score: 33/40 — Good

| #   | Heuristic                       | Score | Key issue                                                                          |
| --- | ------------------------------- | ----- | ---------------------------------------------------------------------------------- |
| 1   | Visibility of system status     | 3     | Form states (sending/success/error) solid; nothing missing, nothing exceptional    |
| 2   | Match system / real world       | 4     | Rano/Wieczór, PAO, real product names — domain-perfect                             |
| 3   | User control and freedom        | 3     | Hover-open/close of the day card feels jumpy; no re-edit after a successful submit |
| 4   | Consistency and standards       | 4     | Type ramp, per-section color ramps, pills, link-swipe all coherent                 |
| 5   | Error prevention                | 3     | Empty and malformed email share one validation path                                |
| 6   | Recognition over recall         | 3     | Email field is placeholder-only; label vanishes on type                            |
| 7   | Flexibility and efficiency      | 3     | autocomplete, Enter, Esc, skip link present                                        |
| 8   | Aesthetic and minimalist design | 4     | Exceptional restraint; the day-arc is real design, not decoration                  |
| 9   | Error recovery                  | 3     | „Sprawdź adres e-mail" covers two different mistakes                               |
| 10  | Help and documentation          | 3     | FAQ answers the real questions; no contact path (fine pre-launch)                  |

## Anti-patterns verdict

**Not AI-slop — deliberately so** (both assessments agree). No eyebrow kickers, no identical card grids, no hero-metric template, no gradient text, no ghost-cards; the one heavy shadow is the licensed signature (phone frame). The "one day, one scroll" concept with real per-locale screenshots reads as human work with a strong system.

Deterministic scan: 3 static findings, of which 2 are false positives (the `Inter-Fallback` metric shim string-matched as a font choice; the 2px focus-ring radius counted as a component radius) and 1 borderline (that same focus-ring radius vs. the rounded scale). In-page detector: `single-font` (a non-issue — the one-family commitment is doctrine) and `nested-cards` (likely the PhoneFrame-inside-section heuristic; eyeball if bored). Hard checks: **zero console errors, zero failed requests, zero horizontal overflow at 390/768/1440, fonts fully self-hosted, skip-link-to-email in 4 tab stops.**

## What's working

1. **Quietly excellent accessibility fundamentals** — measured body-text contrast clears AA everywhere (worst case dusk-subtle ~5.3:1), full reduced-motion handling down to the spring stiffness, skip link, Esc paths.
2. **The day-arc narrative** — each section owns a time-of-day ramp; oklch-interpolated twilight under film grain; compositions actively refuse SaaS grammar.
3. **On-voice Polish copy** — „Koniec z wąchaniem słoiczków" is a knowledgeable friend, not an influencer or a lab; survives all three locales.

## Priority issues

1. **[P1] The day-preview card collides with the lead paragraph.** Hover/tap at the page's signature moment renders the white card over „Retinol w poniedziałki…" — text through text, desktop and mobile. It makes the peak interaction look buggy. _Fix:_ reserve a dedicated card slot (push the grid down or pin a card region under the heading) in `RhythmPlayground.tsx` (`absolute -top-4 -translate-y-full`). → `$impeccable polish`
2. **[P1] 28 rhythm dots are click-operable with no accessible name; all 42 have ~31–37px hit areas.** Voice-control and pointer-AT users get anonymous buttons; thumbs mis-tap below the 44px minimum. _Fix:_ label every operable dot (or make the retinol/kwas rows presentational: `aria-hidden` + `pointer-events-none`) and grow the `::after` hitbox to ≥44px. → `$impeccable harden`
3. **[P2] The rhythm grid is barely discoverable and has no day axis.** Off-dots at `white/13` are near-invisible on the mauve; nothing says columns are days 1–14; the hint hides below the grid. Jordan can't decode it; Casey scrolls past the product's best proof. _Fix:_ raise off-dot opacity, add a 1–14 axis or current-day pulse, move the hint above the grid. → `$impeccable clarify`
4. **[P2] Email field: placeholder-only label and one error for two mistakes.** _Fix:_ persistent micro-label; branch copy — „Wpisz adres e-mail" (empty) vs „Sprawdź adres e-mail" (malformed). → `$impeccable clarify`
5. **[P3] Email tray focus ring too faint** (1px neutral ink at 30%; both assessments flagged independently). _Fix:_ 2px and/or higher opacity, still neutral. → `$impeccable polish`

## Persona red flags

- **Jordan (first-timer):** dot grid is cryptic without hovering — no axis, no legend.
- **Riley (stress tester):** empty vs `   @ .` → identical error; rapid pointer flicks flash the card; a valid-but-mistyped email can't be corrected after success.
- **Casey (mobile thumb):** dots under 44px; off-dots invisible; language switcher out of the thumb arc. The CTA itself is thumb-friendly (full width, tall) — good.

## Minor observations

- Rose 5xl step-numerals bend the One Rose Rule (rose as decoration).
- Flags-as-languages: 🇬🇧 = "English" under-serves "PL/UA/EN are equals"; two-letter codes would be truer (and fix Windows' missing flag emoji).
- `dusk-subtle` is the lowest-contrast text on the page — least headroom if the gradient shifts.
- Success state has no "change email" path.
- Two identical waitlist forms; the final one could vary its reassurance line.
- No in-page anchor to the FAQ (acceptable for a single scroll).

## Questions to consider

1. Should the two-week schedule read **at a glance** (visible day numbers, obvious on-days), with interaction as a bonus rather than a prerequisite?
2. Do the rose step-numerals dilute the CTA's monopoly on rose?
3. Is flag-only language switching worth it when the GB flag quietly contradicts language equality?

## Recommended next actions (default order)

1. `$impeccable polish` — the P1 popover slot + P3 focus ring (snapshot carries the details)
2. `$impeccable harden` — dot accessibility names + 44px hitboxes
3. `$impeccable clarify` — day axis/discoverability + email label & error copy
4. Re-run `$impeccable critique www` afterwards to watch the score move from 33/40.

## Run notes

Target slug `www-src-pages-index-astro`; no ignore list; assessments ran as two isolated background agents (design review / detector evidence) and were synthesized only after both returned; CLI detector ran clean (exit 2, findings triaged above); browser overlay injection succeeded headlessly (live-server started and stopped, port 8400, verified dead); preview server on :4977 started for the critique and stopped after; temp body file cleaned; snapshot written on first run (no trend yet).
