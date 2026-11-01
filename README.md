# GukoV Group brand system (working draft)

One link for **GukoV Group** and its four companies: Vibija, Verdo, Vaya and Viva.
(Internal ids keep the old working names: `vitreeone`, `veriterra`, `vita`.)
It opens straight on the presentation: five landings behind a fixed top menu, and a last page with every variant in one grid. The other landings are one logo screen each; **Vibija** is a click-through brand book of twelve slides on a 1920×1080 canvas that scales to the window (idea, who for, logo, logo on colour, primary and secondary typeface, pairing, hierarchy, primary and secondary palette, proportion, combinations): arrow keys, space or the arrows at the screen edges step through it.

Each landing has a fixed look: a style variant from the Figma file, a background gradient and a logo colour (set in `DEFAULTS`, `presentation/presentation.js`). The All variants page shows every variant; a tile opens its landing in that variant. Tap a logo to type your own text in it. Built for 1920×1080 for now, on a four-column grid: Andika for headings, Lexend Deca for text, Inter for the presentation's own captions.
Static HTML, CSS and vanilla JS with no build step. Runs on GitHub Pages and installs on an iPad home screen.

> Copy, typefaces, colours and logos are **placeholders**.

## Open it

https://vladeee.github.io/veriterra/ (`#verdo` opens the Verdo landing directly; Vibija is `#veriterra`, Viva is `#vita`)

On iPad, open it in Safari, tap **Share**, then **Add to Home Screen**. It opens full screen, like an app.

## Run locally

```sh
python3 -m http.server 8000
# open http://localhost:8000/
```

## Structure

```
/
├── index.html                  five landings + All variants (the one link)
├── manifest.webmanifest        install manifest
├── presentation/
│   ├── presentation.css        menu, arrows, page grid, logo screen, All page
│   ├── presentation.js         routing, menu, variants, colours, slides
│   ├── variants.js             list of Figma style variants per landing
│   ├── variants.css            variant styling, gradients
│   └── landings/<id>.css       per-landing style
├── brand/
│   ├── BRIEF.md                facts, hypotheses, open questions
│   ├── tokens.css              single source of truth for every visual value
│   ├── tokens.json             mirror of tokens.css (generated)
│   ├── components.css          shared base, typography, components in use
│   ├── brands.js               brand registry (names live here)
│   ├── brand-ui.js             icons, brand names
│   ├── icons/                  app icons
│   ├── logo/                   (empty for now)
│   └── fonts/                  self-hosted fonts + licences
├── deck/index.html             redirect from the old URL
├── site/                       websites, later
├── tools/tokens.py             token sync and "tokens only" lint
└── CLAUDE.md                   rules for future sessions
```

## Changing tokens

```sh
# 1. edit brand/tokens.css
python3 tools/tokens.py sync    # 2. regenerate tokens.json
python3 tools/tokens.py check   # 3. verify sync + no hardcoded values anywhere
```
