# Veriterra brand system (working draft)

Brand system for **Veriterra** (water-soluble fertilizers), built one section at a time.
**Current scope: typography only.** Static HTML, CSS and vanilla JS with no build step. Runs on GitHub Pages and installs on an iPad home screen.

> Typefaces and colours are **placeholders** until they are chosen.

## Open it

| | Link |
|---|---|
| Hub | https://vladeee.github.io/veriterra/ |
| Style guide | https://vladeee.github.io/veriterra/styleguide/ |
| Brand deck | https://vladeee.github.io/veriterra/deck/ (`#3` opens slide 3) |
| Brief | [`brand/BRIEF.md`](brand/BRIEF.md) |

On iPad, open the page in Safari, tap **Share**, then **Add to Home Screen**. It opens full screen, like an app.

### Deck controls

| iPad | Keyboard |
|---|---|
| Swipe left or right | ← → or Space / Shift+Space |
| Tap the right or left edge of the screen | Page Up / Page Down, Home / End |
| ⤢ button for full screen | F |

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
├── deck/                   brand presentation (typography)
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
