# VITREEONE brand system (working draft)

Brand system for **VITREEONE** and its four companies: Veriterra, Verdo, Vaya and Viva.
**Current scope:** a presentation of five short landing pages (one structure, styled one by one later) and a typography style guide. Static HTML, CSS and vanilla JS with no build step. Runs on GitHub Pages and installs on an iPad home screen.

> Copy, typefaces and colours are **placeholders**.

## Open it

| | Link |
|---|---|
| Hub | https://vladeee.github.io/veriterra/ |
| Style guide | https://vladeee.github.io/veriterra/styleguide/ |
| Presentation | https://vladeee.github.io/veriterra/deck/ (`#verdo` opens the Verdo landing) |
| Brief | [`brand/BRIEF.md`](brand/BRIEF.md) |

On iPad, open the page in Safari, tap **Share**, then **Add to Home Screen**. It opens full screen, like an app.

## Run locally

```sh
python3 -m http.server 8000
# open http://localhost:8000/
```

## Structure

```
/
├── index.html              hub
├── manifest.webmanifest    install manifest (hub)
├── brand/
│   ├── BRIEF.md            facts, hypotheses, open questions
│   ├── tokens.css          single source of truth for every visual value
│   ├── tokens.json         mirror of tokens.css (generated)
│   ├── components.css      shared base, typography, components in use
│   ├── brands.js           brand registry (names live here)
│   ├── brand-ui.js         icons, brand names
│   ├── icons/              app icons
│   ├── logo/               (empty for now)
│   └── fonts/              (empty until fonts are chosen)
├── styleguide/             style guide (typography)
├── deck/                   presentation: five landings, fixed menu
│   ├── deck.css            shared landing skeleton
│   └── landings/<id>.css   per-landing style (empty for now)
├── site/                   website, later
├── tools/tokens.py         token sync and "tokens only" lint
└── CLAUDE.md               rules for future sessions
```

## Changing tokens

```sh
# 1. edit brand/tokens.css
python3 tools/tokens.py sync    # 2. regenerate tokens.json
python3 tools/tokens.py check   # 3. verify sync + no hardcoded values anywhere
```
