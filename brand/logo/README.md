# Logos

Almost empty on purpose. `veriterra/mark.svg` (Vibija) is a placeholder: a solid circle that holds the place of the sign until it is drawn. The deck uses it as a CSS mask, so a new single-colour `mark.svg` replaces it everywhere. The existing logos from the presentations are not being carried over, and the names (GukoV Group, Vibija, Viva) are new working names.

When logos arrive, add one folder per brand with SVG masters:

```
logo/<brand>/mark.svg
logo/<brand>/wordmark.svg
logo/<brand>/lockup-horizontal.svg
logo/<brand>/lockup-endorsed.svg   (brand + "part of <holding>")
```

Use `fill="currentColor"` where the logo is single-colour, so it inherits brand tokens.
