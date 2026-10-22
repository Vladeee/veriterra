# Project rules

Brand system for a holding company and its four companies: Veriterra (fertilizers), Verdo (farm and food), Vaya (eco-glamping) and Viva (construction). First we build a style guide and a brand deck. Then four websites (one per company) get built in this same repo, on top of them.

**Stage: working draft.** Names, colours, typefaces and logos are placeholders. Read `brand/BRIEF.md` before any brand decision. The holding's name is undecided and Veriterra may be renamed.

## Where things live

| Path | What |
|---|---|
| `brand/tokens.css` | **Single source of truth** for every visual value (colour, type, spacing, radii, shadows, motion, layers) |
| `brand/tokens.json` | Mirror of tokens.css for tools and other platforms. Generated: `python3 tools/tokens.py sync` |
| `brand/components.css` | Shared reset, base typography and UI components. Used by the style guide, the deck and the sites |
| `brand/brands.js` | Brand registry (ids, names, descriptors). Brand names are written here, nowhere else in code |
| `brand/brand-ui.js` | Shared behaviour: brand switcher, inline icons, copy-to-clipboard |
| `brand/BRIEF.md` | Positioning, audience, tone; facts and open questions |
| `brand/logo/`, `brand/fonts/`, `brand/icons/` | Assets (logos and fonts not supplied yet) |
| `styleguide/` | One-page style guide |
| `deck/` | Interactive brand presentation |
| `site/<brand>/` | The four websites (later) |
| `tools/tokens.py` | Sync and lint for tokens |

## Hard rules

1. **Tokens only.** No CSS outside `brand/tokens.css` may contain a hex or rgb/hsl colour, px/rem/em length, duration, cubic-bezier, raw font-family or raw box-shadow. Use `var(--token)`. If a value is missing, add a token (CSS and JSON) instead of hardcoding it.
   - Allowed exceptions: `@media` breakpoint values (sm 40rem, md 48rem, lg 64rem, xl 80rem), colours inside `*.webmanifest`, `<meta name="theme-color">`, SVG and PNG asset files.
   - Escape hatch: end a line with `/* lint-ok */`. Only for technical, non-visual values (for example the 1px of a visually-hidden helper), never to skip a design decision.
2. **Change tokens in one commit:** edit `tokens.css`, then run `python3 tools/tokens.py sync`, then run `python3 tools/tokens.py check`. `check` must pass before every commit.
3. **Theming goes through `data-brand`.** Components read only the `--brand-*` variables (`--brand-accent`, `--brand-accent-strong`, `--brand-accent-soft`, `--brand-on-accent`). Never reference `--color-verdo-600` and similar from a component. Put `data-brand="verdo"` on `<html>` for a whole site, or on an element for a scoped preview.
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
- The style guide and deck pick up token changes automatically: colour values, contrast ratios and type sizes are read live from the CSS. Don't duplicate token values in HTML.
- Adding a brand: add primitives and a `[data-brand]` block to tokens.css, an entry in `brand/brands.js`, then sync.
