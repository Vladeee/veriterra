# Project rules

Brand system for the holding company VITREEONE and its four companies: Veriterra (fertilizers), Verdo (farm and food), Vaya (eco-glamping) and Viva (construction). Right now it is one presentation link with five landing pages. Real websites come later, in this same repo.

**Stage: working draft, skeleton.** The user wants it minimal and built step by step.
- **One link for everything: the root `index.html`.** It opens on an intro screen (logo, one paragraph, a **Welcome** button). Welcome leads to **five short landing pages**: VITREEONE (the holding) plus Veriterra, Verdo, Vaya and Viva. A fixed top menu of plain text links (a small dot under the current one) switches between them via the URL hash (`#verdo`, `#vaya-contact`; no hash or `#intro` = intro).
- **Layout: a full-width 12-column page grid**, after paypath.ai: edge to edge with `--page-margin` on the sides, `--grid-gutter` between columns, `--grid-gap-tight` between cards, and sections topped by a hairline with a dot label.
- **All five landings share one identical structure**, defined in `presentation/presentation.css`: hero (logo first → headline with one serif-italic `<em>` word → lead → button) → media (photo 7 cols + spec card 5 cols) → bento grid (facts + offer) → loop strip → centred call to action → footer. No e-mail fields and no details/photo split panels (removed at the user's request). Each landing paints its own soft gradient from `--brand-bg` (tokens). Each landing gets its own look later in `presentation/landings/<id>.css`, scoped to `.landing[data-brand="<id>"]`. Keep the structure identical across the five unless the user asks otherwise.
- **Current focus: Veriterra.** Its landing diverges from the shared skeleton on purpose, and it is a **presentation, not a website**. It has five full-screen slides (`.v-slide`, `min-height: 100dvh`) that snap on scroll (`data-slides` on the landing puts `html.has-slides` in place):
  1. **Logo**: only the wordmark (`--text-logo`, colour `--brand-logo` = #2E1919) and a caption. The whole word rises with a blur and a bottom-up fade mask, then the caption, the scroll cue and the **Logo typeface** bar fade in. It replays on open and on typeface change.
  2. **Statement + four figures** on a flat main-green slide with slowly drifting, blurred light streaks (after paypath.ai).
  3. **What we do**: a full-bleed photo next to a list over hairlines (after Farm Minerals).
  4. **Ornaments**: a beige panel of ornaments next to a main-green backdrop with a photo frame (after Dix Hectares).
  5. **Call to action**, with the loop and a legal line at the bottom.
  - **Textures** are self-made files in `brand/textures/` (`grain.png` over every slide, `paper-cream.jpg`). They can be swapped for photographed textures later.
  - **Menu**: no background, blur only once scrolled. It turns light over slides with `data-tone="dark"` (`body.nav-on-dark`).
  - **Fonts**: the trial fonts in `brand/fonts/` are for the logo only (`--font-logo`). Headings use **Hedvig Letters Serif** (`--font-hedvig`), a free stand-in for Season Mix, which is commercial. Body text is system sans.
  - **Motion**: `data-reveal` elements rise in on scroll (staggered by `--i`). Reduced motion disables the drift and shows everything at once.
  - **Palette (draft): the Farm Minerals colour library**, read from farmminerals.com and extended in OKLCH: `--color-fm-*` in tokens.css. The source colours are beige #F4EDE6 and greens #394420 / #404F1D / #4C5B20 / #596A33 / #636F3D / #7C914C. Everything else is derived on the same hues (olive ≈123, beige ≈68).
    - Slide 1 shows the library as small squares under the menu; tapping one shows its name, HEX, OKLCH and source.
    - Three variations (`data-palette` on the landing, rules in `veriterra.css`): **field** (Farm Minerals as is), **soil** (+ terracotta, hue 45) and **bloom** (+ lime glow, hue 122).
    - Brand tokens: `--brand-paper`, `--brand-ornament`, `--brand-deep`, `--brand-logo`, `--brand-glow-deep`, `--brand-on-deep-muted`. Ornaments come from `brand-ui.js` (`data-ornament`).
  - Leave the other four landings alone unless asked.
- There is **no style guide** for now (removed at the user's request). Sections are added **one at a time, only when the user asks**.
- Colours, typefaces and copy are placeholders. Read `brand/BRIEF.md` before any brand decision.

## Where things live

| Path | What |
|---|---|
| `brand/tokens.css` | **Single source of truth** for every visual value (colour, type, spacing, radii, shadows, motion, layers) |
| `brand/tokens.json` | Mirror of tokens.css for tools and other platforms. Generated: `python3 tools/tokens.py sync` |
| `brand/components.css` | Shared reset, base typography and the few components in use |
| `brand/brands.js` | Brand registry (ids, names, descriptors). Menus, labels and generated blocks read names from here. Copy text may mention the companies |
| `brand/brand-ui.js` | Shared behaviour: inline icons, brand names and descriptors |
| `brand/BRIEF.md` | Positioning, audience, tone; facts and open questions |
| `brand/logo/`, `brand/fonts/`, `brand/icons/`, `brand/textures/` | Assets: logos (not supplied yet), self-hosted fonts with licences, app icons, self-made textures |
| `index.html` | The one link: intro + five landings |
| `presentation/` | `presentation.css` = intro, menu and shared landing skeleton; `presentation.js` = routing, menu, loop; `landings/<id>.css` = per-landing style |
| `deck/index.html` | Redirect from the old presentation URL to the root (keeps the hash) |
| `site/` | Websites (later) |
| `tools/tokens.py` | Sync and lint for tokens |

## Hard rules

1. **Tokens only.** No CSS outside `brand/tokens.css` may contain a hex or rgb/hsl colour, px/rem/em length, duration, cubic-bezier, raw font-family or raw box-shadow. Use `var(--token)`. If a value is missing, add a token (CSS and JSON) instead of hardcoding it.
   - Allowed exceptions: `@media` breakpoint values (sm 40rem, md 48rem, lg 64rem, xl 80rem), colours inside `*.webmanifest`, `<meta name="theme-color">`, SVG and PNG asset files.
   - Escape hatch: end a line with `/* lint-ok */`. Only for technical, non-visual values (for example the 1px of a visually-hidden helper), never to skip a design decision.
2. **Change tokens in one commit:** edit `tokens.css`, then run `python3 tools/tokens.py sync`, then run `python3 tools/tokens.py check`. `check` must pass before every commit.
3. **Theming goes through `data-brand`.** Ids: `vitreeone`, `veriterra`, `verdo`, `vaya`, `viva`. Components read only the `--brand-*` variables (`--brand-accent`, `--brand-accent-strong`, `--brand-accent-soft`, `--brand-on-accent`), never brand primitives like `--color-veriterra-600`. Each landing carries its own `data-brand`.
4. **Static only:** HTML, CSS and vanilla JS. No npm, bundlers or frameworks. Everything must work on GitHub Pages and from a plain local server.
5. **Relative paths everywhere** (`../brand/tokens.css`, never `/brand/...`). The site is served from `vladeee.github.io/veriterra/`.
6. **iPad first:**
   - Every interactive element is at least `var(--tap-min)` (44px).
   - No hover-only interactions. Hover styles go inside `@media (hover: hover)` and must have a tap equivalent.
   - Test portrait and landscape.
   - Respect `env(safe-area-inset-*)`, use `dvh` for full-height layouts and `touch-action: manipulation` on controls.
7. **Accessibility:** text meets WCAG AA (4.5:1, or 3:1 for large text), `:focus-visible` is always visible, `prefers-reduced-motion` is honoured (tokens already collapse durations).
8. **Imagery:** never present an AI-generated image as real. Real photographs, clearly labelled visualisations, or neutral placeholders only.
9. **Public repo:** no financials, investment figures, land deals or legal or ownership structure in any file.
10. **Content language: English.** The user talks in Russian or English; answer in the language they use.

## Workflow

- Work in small logical steps. Run `python3 tools/tokens.py check`, commit with a clear message and push after each step.
- Preview locally with `python3 -m http.server 8000` from the repo root, then open `http://localhost:8000/`.
- Adding a block to the landings: add it to all five in `index.html` with the same classes, place it on the page grid in `presentation/presentation.css`, and add only the components and tokens it needs.
