# Fonts

Not chosen yet. Until then `--font-display`, `--font-body` and `--font-mono` in `brand/tokens.css` point to system faces (New York and SF on Apple devices).

When fonts are chosen, either:

- **Self-host:** put `.woff2` files here, declare them with `@font-face` at the top of `brand/tokens.css` (relative `url()` paths, `font-display: swap`) and update the three family tokens. Check the licence allows web embedding.
- **Google Fonts:** add the `<link>` to every page's `<head>` and update the family tokens.
