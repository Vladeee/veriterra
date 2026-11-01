/*
  Style variants per landing, one per frame in the Figma file
  (figma.com/design/kijHOH1H9UUlT26sK0ccT1). Values live in brand/tokens.css as
  --fig-<brand>-<n>-<prop>; this file only lists them. Generated from the Figma
  frames; edit the tokens to tweak a variant, add an entry here to add one.
  Only the variants the user picked are kept (git history has the rest). Every
  logo is set in the logo face (Andika for now); a variant keeps the colours of its frame.
  kern: true spaces the letters by their ink (for faces with monospaced Latin).
  mesh: true lets a layered background drift slowly.
  split: n draws the first n letters in ink and the rest in ink2.
  Keys are landing ids: vitreeone = GukoV Group, veriterra = Vibija, vita = Viva.
*/
window.VARIANTS = {
  "vitreeone": [
    {
      "name": "Water · Andika",
      "node": "(current)"
    }
  ],
  "veriterra": [
    {
      "name": "Aubergine · Andika",
      "node": "75:267"
    }
  ],
  "verdo": [
    {
      "name": "Lime · Andika",
      "node": "90:154"
    }
  ],
  "vaya": [
    {
      "name": "Sky · Andika",
      "node": "75:294"
    },
    {
      "name": "Sunrise · Andika",
      "node": "75:291"
    },
    {
      "name": "Lavender · Andika",
      "node": "75:300"
    }
  ],
  "vita": [
    {
      "name": "Stone · Andika",
      "node": "75:305"
    }
  ]
};
