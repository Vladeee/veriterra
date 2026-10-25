# VITREEONE brand system (working draft)

One link for **VITREEONE** and its four companies: Veriterra, Verdo, Vaya and Vita.
It opens on an intro with a **Welcome** button, then five landings behind a fixed top menu. For now each landing is one screen: the logo.

Each landing has **style variants**, one per frame in the Figma file, and four **background gradients** (Streaks, Halo, Horizon, Flat). Switch them in the faint corner control at the bottom left (gradients on top, variant dots below). The choice is remembered on the device.
Static HTML, CSS and vanilla JS with no build step. Runs on GitHub Pages and installs on an iPad home screen.

> Copy, typefaces, colours and logos are **placeholders**.

## Open it

https://vladeee.github.io/veriterra/ (`#verdo` opens the Verdo landing directly)

On iPad, open it in Safari, tap **Share**, then **Add to Home Screen**. It opens full screen, like an app.

## Run locally

```sh
python3 -m http.server 8000
# open http://localhost:8000/
```

## Structure

```
/
├── index.html                  intro + five landings (the one link)
├── manifest.webmanifest        install manifest
├── presentation/
│   ├── presentation.css        intro, menu, page grid, logo screen
│   ├── presentation.js         routing, menu, variants, gradients, switcher
│   ├── variants.js             list of Figma style variants per landing
│   ├── variants.css            variant styling, gradients, the switcher
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
│   ├── figma/                  images used by Figma variants
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
