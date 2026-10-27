/*
  Brand registry. The only place in code where brand names are written.
  Ids match the [data-brand] themes in brand/tokens.css and the landing ids in index.html.
  `menu` (optional) is how the name reads in the top menu.
  Ids are the old working names (vitreeone = TerraGroup, veriterra = Vibija, vita = Vivo);
  they stay so tokens, links (#veriterra) and saved choices keep working.
*/
window.BRANDS = [
  { id: "vitreeone", name: "TerraGroup", descriptor: "The group", loop: null, holding: true },
  { id: "veriterra", name: "Vibija", descriptor: "Water-soluble fertilizers", loop: "Land" },
  { id: "verdo", name: "Verdo", descriptor: "Farm and food", loop: "Product" },
  { id: "vaya", name: "Vaya", descriptor: "Eco-glamping", loop: "Person" },
  { id: "vita", name: "Vivo", descriptor: "Design and construction", loop: "Space" }
];
