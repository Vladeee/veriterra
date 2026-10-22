# Brand system (working draft)

Brand system for a holding company and its four companies: **Veriterra**, **Verdo**, **Vaya** and **Viva**.
Static HTML, CSS and vanilla JS, with no build step. Runs on GitHub Pages and installs on an iPad home screen.

> Names, colours, typefaces and logos are **placeholders**. The structure, rules and tools are real.

## Open it

| | Link (once GitHub Pages is on) |
|---|---|
| Hub | https://vladeee.github.io/veriterra/ |
| Style guide | https://vladeee.github.io/veriterra/styleguide/ |
| Brand deck | https://vladeee.github.io/veriterra/deck/ (`#5` opens slide 5) |
| Brief | [`brand/BRIEF.md`](brand/BRIEF.md) |

### Turn on GitHub Pages (one time)

1. Open the repo on GitHub, then **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to *Deploy from a branch*.
3. Pick the branch with this work (`main` once merged), folder `/ (root)`, then **Save**.
4. After about a minute the site is live at the address above.

### Add to the iPad home screen

1. Open the style guide, the deck or the hub in **Safari**.
2. Tap **Share**, then **Add to Home Screen**.
3. Each one gets its own icon and opens full screen, like an app.

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
│   ├── components.css      shared base and UI components
│   ├── brands.js           brand registry (names live here)
│   ├── brand-ui.js         brand switcher, icons, copy-to-clipboard
│   ├── icons/              app icons
│   ├── logo/               (empty until logos are decided)
│   └── fonts/              (empty until fonts are decided)
├── styleguide/             one-page style guide
├── deck/                   interactive brand presentation
├── site/                   four websites, later
├── tools/tokens.py         token sync and "tokens only" lint
└── CLAUDE.md               rules for future sessions
```

## Changing tokens

```sh
# 1. edit brand/tokens.css
python3 tools/tokens.py sync    # 2. regenerate tokens.json
python3 tools/tokens.py check   # 3. verify sync + no hardcoded values anywhere
```
