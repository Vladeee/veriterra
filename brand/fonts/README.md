# Fonts

Trial typefaces for Veriterra, self-hosted so they work offline on the iPad and on GitHub Pages.
They are declared with `@font-face` at the top of `brand/tokens.css` and exposed as tokens
(`--font-asul`, `--font-old-standard`, …). On the Veriterra landing, the **Typeface** bar at the
bottom swaps `--font-display` between them. None is chosen yet.

| Folder | Typeface | Licence | Source |
|---|---|---|---|
| `asul/` | Asul, Mariela Monsalve | SIL OFL 1.1 | Google Fonts |
| `old-standard/` | Old Standard TT, Alexey Kryukov | SIL OFL 1.1 | Google Fonts |
| `young-serif/` | Young Serif, Bastien Sozeau / Noir Blanc Rouge | SIL OFL 1.1 | github.com/noirblancrouge/YoungSerif |
| `bona-nova/` | Bona Nova | SIL OFL 1.1 | github.com/kosmynkab/Bona-Nova |
| `mynerve/` | Mynerve, Carolina Short | SIL OFL 1.1 | github.com/carolinashort/MyNerve |
| `accidenz-commons/` | CC Accidenz Commons, Archetypo | CC BY-SA 4.0 | creativecommons.org |

Not included:
- **Oks** (Ilya Zherikov): free to use, but the licence forbids redistributing the font file, so it cannot live in a public repo.
- **Slinkee** (Kimchi Lee): OFL, but only downloadable through Gumroad. Add the file here if it is supplied.
- **Hellenica** (Backpacker): the public download on backpacker.gr is Ribbon only, with no licence text.
- **Memoir**: source not identified yet.

When adding a typeface: put `.woff2` files plus the licence in a folder here, add `@font-face` and a
`--font-<name>` token in `tokens.css`, run `python3 tools/tokens.py sync`, then add a `[data-font]`
rule in `presentation/landings/veriterra.css` and a button in the Typeface bar.
