/*
  Style variants per landing, one per frame in the Figma file
  (figma.com/design/kijHOH1H9UUlT26sK0ccT1). Values live in brand/tokens.css as
  --fig-<brand>-<n>-<prop>; this file only lists them. Generated from the Figma
  frames; edit the tokens to tweak a variant, add an entry here to add one.
  kern: true spaces the letters by their ink (for faces with monospaced Latin).
  split: n draws the first n letters in ink and the rest in ink2 (Vi|bija).
  Keys are landing ids: vitreeone = TerraGroup, veriterra = Vibija, vita = Vivo.
*/
window.VARIANTS = {
  "vitreeone": [
    {
      "name": "Water · Faculty Glyphic",
      "node": "(current)"
    },
    {
      "name": "Moss · Poppins",
      "node": "85:78"
    }
  ],
  "veriterra": [
    {
      "name": "Moss · two-tone",
      "node": "75:265",
      "split": 2,
      "ink2": true
    },
    {
      "name": "Lime · Port Lligat",
      "node": "85:53"
    },
    {
      "name": "Beige · Port Lligat",
      "node": "85:60"
    },
    {
      "name": "Beige · Poppins",
      "node": "85:71"
    },
    {
      "name": "Night · Port Lligat",
      "node": "75:270"
    },
    {
      "name": "Olive · Kosugi Maru",
      "node": "75:254",
      "kern": true
    },
    {
      "name": "Black · gold caps",
      "node": "75:261",
      "kern": true
    },
    {
      "name": "Earth · Comfortaa",
      "node": "75:267",
      "accent": true
    }
  ],
  "verdo": [
    {
      "name": "Cream · Hubballi",
      "node": "85:34"
    },
    {
      "name": "Sand · Hubballi",
      "node": "85:33"
    },
    {
      "name": "Sage · Hubballi",
      "node": "75:298"
    },
    {
      "name": "Mist · Hubballi",
      "node": "90:106"
    },
    {
      "name": "Peach · Madimi One",
      "node": "75:326"
    },
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
    },
    {
      "name": "Mist · Madimi One",
      "node": "75:336"
    },
    {
      "name": "Mist · Hubballi",
      "node": "75:336"
    }
  ],
  "vita": [
    {
      "name": "Stone · Momo Trust",
      "node": "75:305"
    }
  ]
};
