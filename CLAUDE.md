# Project rules

Brand system for the holding company VITREEONE and its four companies: Veriterra (fertilizers), Verdo (farm and food), Vaya (eco-glamping) and Viva (construction). Right now it is one presentation link with five landing pages. Real websites come later, in this same repo.

**Stage: working draft, skeleton.** The user wants it minimal and built step by step.
- **One link for everything: the root `index.html`.** It opens on an intro screen (logo, one paragraph, a **Welcome** button). Welcome leads to **five short landing pages**: VITREEONE (the holding) plus Veriterra, Verdo, Vaya and Viva. A fixed top menu of plain text links (a small dot under the current one) switches between them via the URL hash (`#verdo`, `#vaya-contact`; no hash or `#intro` = intro).
- **Layout: a full-width 12-column page grid**, after paypath.ai: edge to edge with `--page-margin` on the sides, `--grid-gutter` between columns, `--grid-gap-tight` between cards, and sections topped by a hairline with a dot label.
- **All five landings share one identical structure**, defined in `presentation/presentation.css`: hero (logo first → headline with one serif-italic `<em>` word → lead → button) → media (photo 7 cols + spec card 5 cols) → bento grid (facts + offer) → loop strip → centred call to action → footer. No e-mail fields and no details/photo split panels (removed at the user's request). Each landing paints its own soft gradient from `--brand-bg` (tokens). Each landing gets its own look later in `presentation/landings/<id>.css`, scoped to `.landing[data-brand="<id>"]`. Keep the structure identical across the five unless the user asks otherwise.
- **Current focus: Veriterra.** Its landing diverges from the shared skeleton on purpose.
  - **The first screen is the logo only**: the wordmark (`--text-logo`, colour `--brand-logo` = #2E1919) with a small caption, centred on the lime gradient background (the same style as Verdo's). Entrance: the whole word rises from below with a blur and a bottom-up fade mask (no per-letter animation), then the caption, the scroll cue and the **Logo typeface** bar fade in. It replays when the landing opens or the typeface changes. No line under the logo.
  - **The trial fonts in `brand/fonts/` are for the logo only** (they swap `--font-logo`). Headings use **Hedvig Letters Serif** (`--font-hedvig`, OFL), a free stand-in for the user's choice Season Mix, which is commercial (Displaay). Body text is system sans. Site font pairs may still change.
  - **Layout must be tight and orderly**: everything after the logo sits on the 12-column page grid with one rhythm (sections `--space-8` apart, blocks `--space-5`). Photo 6 cols + text 6 cols; three offer columns of 4 cols; ornament panel 6 + photo 6; the CTA band sits inside the page margins.
  - **Menu has no background.** Once the page scrolls, it gets a blur only (`body.is-scrolled`).
  - **Elements with `data-reveal` rise in on scroll** (IntersectionObserver in `presentation.js`, staggered by `--i`). Reduced motion shows everything at once.
  - The rest follows the user's references, **Farm Minerals** and **Dix Hectares**: olive text, terracotta ornaments, deep forest green. Palette tokens: `--brand-paper`, `--brand-ornament`, `--brand-deep`, `--brand-logo`. Ornaments come from `brand-ui.js` (`data-ornament`).
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
| `brand/logo/`, `brand/fonts/`, `brand/icons/` | Assets (logos and fonts not supplied yet) |
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
