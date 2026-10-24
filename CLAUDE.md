# Project rules

Brand system for the holding company VITREEONE and its four companies: Veriterra (fertilizers), Verdo (farm and food), Vaya (eco-glamping) and Viva (construction). First we build a style guide and a brand deck. Then four websites (one per company) get built in this same repo, on top of them.

**Stage: working draft, skeleton.** The user wants it minimal and built step by step.
- **The presentation (`deck/`) is five short landing pages**, not a slide deck: VITREEONE (the holding) plus Veriterra, Verdo, Vaya and Viva. A fixed top menu switches between them (`deck/#verdo`). All five share **one identical, centred structure**, defined in `deck/deck.css`: hero (logo first → headline with one serif-italic `<em>` word → lead → sign-up pill → photo + spec card) → bento grid (facts + offer) → split (labelled details panel + tall photo) → loop strip → centred call to action → footer. Each landing paints its own soft gradient background from `--brand-bg` (tokens). Each landing gets its own look later in `deck/landings/<id>.css`, scoped to `.landing[data-brand="<id>"]`. Keep the structure identical across the five unless the user asks otherwise.
- **The style guide (`styleguide/`) holds typography only**, shown for Veriterra.
- New sections are added **one at a time, only when the user asks**. Don't bring back removed style-guide sections (essence, logo, colour, spacing, components, imagery, motion) unprompted; they are in git history.
- Colours, typefaces and copy are placeholders. Read `brand/BRIEF.md` before any brand decision.

## Where things live

| Path | What |
|---|---|
| `brand/tokens.css` | **Single source of truth** for every visual value (colour, type, spacing, radii, shadows, motion, layers) |
| `brand/tokens.json` | Mirror of tokens.css for tools and other platforms. Generated: `python3 tools/tokens.py sync` |
| `brand/components.css` | Shared reset, base typography and the few components in use. Grows with each new section |
| `brand/brands.js` | Brand registry (ids, names, descriptors). Menus, labels and generated blocks read names from here. Copy text may mention the companies |
| `brand/brand-ui.js` | Shared behaviour: inline icons, brand names |
| `brand/BRIEF.md` | Positioning, audience, tone; facts and open questions |
| `brand/logo/`, `brand/fonts/`, `brand/icons/` | Assets (logos and fonts not supplied yet) |
| `styleguide/` | One-page style guide |
| `deck/` | Presentation: five landings behind one fixed menu. `deck.css` = shared skeleton, `landings/<id>.css` = per-landing style |
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
- The style guide picks up token changes automatically (type sizes and font stacks are read live from the CSS). Don't duplicate token values in HTML.
- Adding a block to the landings: add it to all five in `deck/index.html` with the same classes, style it in `deck.css`, and add only the components and tokens it needs.
- Adding a style-guide section: add only that section and the components and tokens it needs.
