/*
  Style variants per landing, one per frame in the Figma file
  (figma.com/design/kijHOH1H9UUlT26sK0ccT1). Values live in brand/tokens.css as
  --fig-<brand>-<n>-<prop>; this file only lists them. Generated from the Figma
  frames; edit the tokens to tweak a variant, add an entry here to add one.
  Only the variants the user picked are kept (git history has the rest).
  accent: true draws the accent square (Vibija "Earth").
  kern: true spaces the letters by their ink (for faces with monospaced Latin).
  mesh: true lets a layered background drift slowly.
  split: n draws the first n letters in ink and the rest in ink2.
  Keys are landing ids: vitreeone = TerraGroup, veriterra = Vibija, vita = Vivo.
*/
window.VARIANTS = {
  "vitreeone": [
    {
      "name": "Water · Faculty Glyphic",
      "node": "(current)"
    }
  ],
  "veriterra": [
    {
      "name": "Earth · Comfortaa",
      "node": "75:267",
      "accent": true
    }
  ],
  "verdo": [
    {
      "name": "Lime · Varela Round",
      "node": "90:154"
    }
  ],
  "vaya": [
    {
      "name": "Sky · Faculty Glyphic",
      "node": "75:294"
    },
    {
      "name": "Sunrise · Faculty Glyphic",
      "node": "75:291"
    },
    {
      "name": "Lavender · Faculty Glyphic",
      "node": "75:300"
    }
  ],
  "vita": [
    {
      "name": "Stone · Momo Trust",
      "node": "75:305"
    }
  ]
};
