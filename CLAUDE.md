# Project rules

Brand system for the holding company VITREEONE and its four companies: Veriterra (fertilizers), Verdo (farm and food), Vaya (eco-glamping) and Vita (construction). Right now it is one presentation link with five landing pages. Real websites come later, in this same repo.

**Stage: working draft, skeleton.** The user wants it minimal and built step by step.
- **One link for everything: the root `index.html`.** It opens **straight on the presentation** (the intro screen with a Welcome button was removed at the user's request). Five landing pages: VITREEONE (the holding) plus Veriterra, Verdo, Vaya and Vita, then a last page, **All variants** (`#overview`, menu item "All"): every Figma variant as a tile in a grid, grouped by landing; a tile opens its landing in that variant. Its **Invert all** button inverts (or restores) every landing at once; tiles show each landing's invert state. **Arrows at the left and right edges** (`.page-arrows`) go to the previous / next page, wrapping around. A fixed, **centred** top menu of plain text links (a small dot under the current one) switches between them via the URL hash (`#verdo`; no hash or an unknown one opens the first landing, VITREEONE). The menu has no fill. Once the page scrolls, a **progressive blur** fades in under it (`.topnav__blur`: five stacked backdrop-filter layers with masks, after wondersauce.com), so there is no hard edge.
- **Every landing is one screen for now: the logo screen** (`.logo-hero`: wordmark + caption), VITREEONE included (its glyphs and button were removed at the user's request). All other slides and sections were removed at the user's request ("leave only the first slide everywhere"), together with the palette strip and the per-slide Background chips. Git history has them if needed.
- **Layout:** a full-width 12-column page grid (`.page-grid`, after paypath.ai) stays in `presentation.css` for sections to come: `--page-margin` on the sides, `--grid-gutter` between columns.
- **Logo animation:** the whole word rises with a blur and a bottom-up fade mask, then the caption fades in. It replays when the landing opens and when the variant changes.
- **Logo size:** every wordmark has the same letter height, whatever its font: `sizeInk()` measures how tall the letters stand above the baseline and scales the font size to `--logo-ink-height` (tokens). `fitWidth()` scales a long word down on narrow screens. `--fig-*-size` is only the starting size.
- **Logo centring:** the wordmark sits on the optical centre of the screen. Equal room above and below it; `centreInk()` in `presentation.js` measures the glyphs (canvas `measureText`) and sets `--ink-shift`, so the ink of the letters is centred, not the line box; then `--logo-optical-lift` raises it slightly. Do not use `text-box-trim` (Port Lligat's metrics break it).
- **Caption:** one short line of copy per landing in Inter Bold, sentence case, `--text-lg`, pinned to the bottom of the screen (on phones it sits above the switcher). Dark (a deep shade of the logo colour) on light variants, the logo colour on dark ones.
- **Logo tracking** is tuned per variant (`--fig-*-tracking`), not copied from Figma: lowercase and bold display faces slightly negative, caps positive, light-on-dark a touch looser. Trailing tracking is pulled back with a negative right margin so the word stays centred. Kosugi Maru has monospaced Latin, so its variants carry `kern: true`: `kernInk()` wraps each letter and gives every glyph the same side bearing measured from its ink.
- **Figma style variants.** Every frame in the Figma file (figma.com/design/kijHOH1H9UUlT26sK0ccT1) is a style variant of one landing: VITREEONE 2, Veriterra 8, Verdo 6, Vaya 5, Vita 4. Dropped at the user's request: Vita's repeated Momo frames, every variant with an Inter wordmark, and Vaya "Clouds" (noisy photo background). The user's favourites come first in each list: Veriterra "Moss · two-tone", Verdo "Cream · Hubballi", Vaya "Sky · Faculty Glyphic", Vita "Stone · Momo Trust". The saved variant number lives under `variant2-<id>` (the list was reordered). Values are tokens `--fig-<brand>-<n>-{bg,page,ink,ink2,accent,font,size,tracking,weight,case}` in `tokens.css`. `presentation/variants.js` lists them (name, Figma node, extras: `split`, `kern`, `accent`). All wordmark fonts are preloaded in `index.html` and loaded by `loadFonts()`, so switching never waits for a download. `presentation.js` copies the chosen variant onto the landing as `--v-*` plus `data-variant` and `data-v-tone`, and `presentation/variants.css` (loaded last) applies them to the logo screen.
- **Background gradients:** `data-gradient` on the landing picks **dawn** (default), **dusk**, **horizon**, **mist** (faint horizontal bands: one multi-stop `linear-gradient(in oklch to bottom, …)` of translucent white, ink and `--brand-streak` tints, 8–16%), **aurora**, **silk**, **tide**, **veil**, **prism** (complex light after paypath.ai on `.glow::before/::after`: curved ribbons from thin rings of huge ellipses, vertical curtains, rays from below; blurred, drifting slowly, stronger on dark pages) or **flat** (the Figma frame as is). Everything is translucent, so a Figma gradient background shows through. The drifting round blobs were rejected as ugly and too loud. The wordmark gets an equally faint vertical tint (`background-clip: text`), none on flat. No textures or noise ("looks dirty").
- **Switcher:** bottom left, three pills of real 44px buttons in the variant's own colours: ← 3 / 8 → for the variant, ← Dawn → for the gradient, and a colour pill: **invert** (swaps page and logo colours, `data-invert`), **Auto / Light / Dark** for the logo, and a **swatch** that opens the logo colour picker. The last choice shows briefly above. Keyboard: ←/→ variant, ↑/↓ gradient, Esc closes the picker. All choices are saved per landing on the device. Hidden on the All variants page.
- **Logo colours:** `applyColours()` in `presentation.js` builds `--v-bg/page/ink/ink2` from the variant, invert and `data-ink` (auto = the Figma colour, light, dark, pick-1…pick-5). The suggestions are recipes in `tokens.css` (`.landing[data-v-tone]` blocks, OKLCH relative colour syntax on `--v-page`): same hue, complement, two split complements and the brand tint; deep on light pages, pale on dark ones.
- **Menu** shows "Vitreeone" (not caps): `menu` field in `brands.js`.
- **Menu** turns light over dark logo screens (`body.nav-on-dark`, read from `data-tone` on the hero).
- **Fonts:** the wordmark font comes from the variant (Figma fonts in `brand/fonts/`). Caption and switcher use Inter Bold. Body text is system sans.
- Reduced motion stops the drift and shows everything at once.
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
| `brand/logo/`, `brand/fonts/`, `brand/icons/` | Assets: logos (not supplied yet), self-hosted fonts with licences, app icons |
| `index.html` | The one link: five landings + All variants |
| `presentation/variants.js`, `presentation/variants.css` | Figma style variants per landing and the switcher |
| `presentation/` | `presentation.css` = menu, arrows, logo screen, All variants page; `presentation.js` = routing, menu, variants, gradients, switcher; `landings/<id>.css` = per-landing style |
| `deck/index.html` | Redirect from the old presentation URL to the root (keeps the hash) |
| `site/` | Websites (later) |
| `tools/tokens.py` | Sync and lint for tokens (lints `brand/`, `presentation/`, `deck/`, `site/` and the root `index.html`) |

## Hard rules

1. **Tokens only.** No CSS outside `brand/tokens.css` may contain a hex or rgb/hsl colour, px/rem/em length, duration, cubic-bezier, raw font-family or raw box-shadow. Use `var(--token)`. If a value is missing, add a token (CSS and JSON) instead of hardcoding it.
   - Allowed exceptions: `@media` breakpoint values (sm 40rem, md 48rem, lg 64rem, xl 80rem), colours inside `*.webmanifest`, `<meta name="theme-color">`, SVG and PNG asset files.
   - Escape hatch: end a line with `/* lint-ok */`. Only for technical, non-visual values (for example the 1px of a visually-hidden helper), never to skip a design decision.
2. **Change tokens in one commit:** edit `tokens.css`, then run `python3 tools/tokens.py sync`, then run `python3 tools/tokens.py check`. `check` must pass before every commit.
3. **Theming goes through `data-brand`.** Ids: `vitreeone`, `veriterra`, `verdo`, `vaya`, `vita`. Components read only the `--brand-*` variables (`--brand-accent`, `--brand-accent-strong`, `--brand-accent-soft`, `--brand-on-accent`), never brand primitives like `--color-veriterra-600`. Each landing carries its own `data-brand`.
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
- Adding a block to the landings (only when the user asks): add it to all five in `index.html` with the same classes, place it on the page grid in `presentation/presentation.css`, and add only the components and tokens it needs.
