/*
  Brand registry. The only place in code where brand names are written.
  Ids match the [data-brand] themes in brand/tokens.css and the landing ids in index.html.
  `menu` (optional) is how the name reads in the top menu.
*/
window.BRANDS = [
  { id: "vitreeone", name: "VITREEONE", menu: "Vitreeone", descriptor: "The group", loop: null, holding: true },
  { id: "veriterra", name: "Veriterra", descriptor: "Water-soluble fertilizers", loop: "Land" },
  { id: "verdo", name: "Verdo", descriptor: "Farm and food", loop: "Product" },
  { id: "vaya", name: "Vaya", descriptor: "Eco-glamping", loop: "Person" },
  { id: "vita", name: "Vita", descriptor: "Design and construction", loop: "Space" }
];
