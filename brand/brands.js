/*
  Brand registry. The only place in code where brand names are written.
  Ids match the [data-brand] themes in brand/tokens.css.
  Names marked `provisional` may change (see brand/BRIEF.md).
*/
window.BRANDS = [
  {
    id: "holding",
    name: "Holding",
    provisional: true,
    descriptor: "The group",
    note: "Name to be decided",
    loop: null
  },
  {
    id: "veriterra",
    name: "Veriterra",
    provisional: true,
    descriptor: "Water-soluble fertilizers",
    note: "Name may change",
    loop: "Land"
  },
  {
    id: "verdo",
    name: "Verdo",
    provisional: false,
    descriptor: "Farm and food",
    note: "",
    loop: "Product"
  },
  {
    id: "vaya",
    name: "Vaya",
    provisional: false,
    descriptor: "Eco-glamping",
    note: "",
    loop: "Person"
  },
  {
    id: "viva",
    name: "Viva",
    provisional: false,
    descriptor: "Design and construction",
    note: "",
    loop: "Space"
  }
];
