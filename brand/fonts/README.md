# Fonts

Self-hosted typefaces, so they work offline on the iPad and on GitHub Pages. They are declared
with `@font-face` at the top of `brand/tokens.css` and exposed as tokens (`--font-asul`, …).

- **Figma variants (wordmarks):** Port Lligat Sans, Poppins, Kosugi Maru, Comfortaa, Hubballi, Varela Round,
  Madimi One, Braah One, Momo Trust Display, Inter, Faculty Glyphic. Each style variant (`--fig-*` tokens,
  `presentation/variants.js`) names one of them. Only the weights the frames use are included.
- **Earlier logo trials (not in use now):** Asul, Old Standard, Young Serif, Bona Nova, Mynerve, Accidenz Commons.
- **VITREEONE wordmark:** Faculty Glyphic (`--font-faculty`).
- **Headings:** Hedvig Letters Serif (`--font-hedvig`). It is a free stand-in for **Season Mix**
  (Displaay), which is commercial and would need a web licence.

| Folder | Typeface | Licence | Source |
|---|---|---|---|
| `asul/` | Asul, Mariela Monsalve | SIL OFL 1.1 | Google Fonts |
| `old-standard/` | Old Standard TT, Alexey Kryukov | SIL OFL 1.1 | Google Fonts |
| `young-serif/` | Young Serif, Bastien Sozeau / Noir Blanc Rouge | SIL OFL 1.1 | github.com/noirblancrouge/YoungSerif |
| `bona-nova/` | Bona Nova | SIL OFL 1.1 | github.com/kosmynkab/Bona-Nova |
| `mynerve/` | Mynerve, Carolina Short | SIL OFL 1.1 | github.com/carolinashort/MyNerve |
| `accidenz-commons/` | CC Accidenz Commons, Archetypo | CC BY-SA 4.0 | creativecommons.org |
| `faculty-glyphic/` | Faculty Glyphic, Dylan Young Koto | SIL OFL 1.1 | supplied by the user (github.com/DylanYoungKoto/FacultyGlyphic) |
| `hedvig-serif/` | Hedvig Letters Serif, Kanon Foundry | SIL OFL 1.1 | Google Fonts |
| `port-lligat-sans/` | Port Lligat Sans, Tipo | SIL OFL 1.1 | Google Fonts |
| `poppins/` | Poppins, The Poppins Project Authors | SIL OFL 1.1 | Google Fonts |
| `kosugi-maru/` | Kosugi Maru, The Kosugi Maru Project Authors | Apache 2.0 | Google Fonts |
| `comfortaa/` | Comfortaa, The Comfortaa Project Authors | SIL OFL 1.1 | Google Fonts |
| `hubballi/` | Hubballi, The Hubballi Project Authors | SIL OFL 1.1 | Google Fonts |
| `varela-round/` | Varela Round, The Varela Round Project Authors | SIL OFL 1.1 | Google Fonts |
| `madimi-one/` | Madimi One, The Madimi One Project Authors | SIL OFL 1.1 | Google Fonts |
| `braah-one/` | Braah One, The Braah Project Authors | SIL OFL 1.1 | Google Fonts |
| `momo-trust-display/` | Momo Trust Display, The Momo Trust Project Authors | SIL OFL 1.1 | Google Fonts |
| `inter/` | Inter, The Inter Project Authors | SIL OFL 1.1 | Google Fonts |

Not included:
- **Oks** (Ilya Zherikov): free to use, but the licence forbids redistributing the font file, so it cannot live in a public repo.
- **Slinkee** (Kimchi Lee): OFL, but only downloadable through Gumroad. Add the file here if it is supplied.
- **Hellenica** (Backpacker): the public download on backpacker.gr is Ribbon only, with no licence text.
- **Memoir**: source not identified yet.

When adding a typeface: put `.woff2` files plus the licence in a folder here, add `@font-face` and a
`--font-<name>` token in `tokens.css`, run `python3 tools/tokens.py sync`, then point a variant's
`--fig-<brand>-<n>-font` token at it.
