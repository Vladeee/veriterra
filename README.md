# VITREEONE brand system (working draft)

One link for **VITREEONE** and its four companies: Veriterra, Verdo, Vaya and Viva.
It opens on an intro with a **Welcome** button, then five short landing pages behind a fixed top menu. They share one structure on a full-width 12-column grid, and each will be styled separately.
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
│   ├── presentation.css        intro, menu, page grid, shared landing skeleton
│   ├── presentation.js         routing, menu, loop strip, placeholder forms
│   └── landings/<id>.css       per-landing style (empty for now)
├── brand/
│   ├── BRIEF.md                facts, hypotheses, open questions
│   ├── tokens.css              single source of truth for every visual value
│   ├── tokens.json             mirror of tokens.css (generated)
│   ├── components.css          shared base, typography, components in use
│   ├── brands.js               brand registry (names live here)
│   ├── brand-ui.js             icons, brand names
│   ├── icons/                  app icons
│   ├── logo/                   (empty for now)
│   └── fonts/                  self-hosted trial fonts + licences
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
