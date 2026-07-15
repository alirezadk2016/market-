/* ------------------------------------------------------------------
   The MAISON edit — demo
   One card per model. If a model has several colours, they are listed
   as "variants" — the user can switch colour right on the card.
   Only the photos/colours you provided are used. No prices, no links.
   Extra angle/interior/model shots stay in  images/_unused/ .
------------------------------------------------------------------- */

const BAGS = [
  { name: "Sella", note: "Saddle", tag: "Signature", variants: [
      { color: "Sand", hex: "#c9b291", file: "images/sella-sand.webp" },
      { color: "Nero", hex: "#1c1c1c", file: "images/sella-nero.webp" },
  ]},
  { name: "Monogramme", note: "Top-handle", tag: "Signature", variants: [
      { color: "Nero", hex: "#1c1c1c", file: "images/monogramme-nero.webp" },
  ]},
  { name: "Tote Mini", note: "Shopper", tag: "Everyday", variants: [
      { color: "Nero", hex: "#1c1c1c", file: "images/tote-mini-nero.webp" },
  ]},
  { name: "Bauletto", note: "Shoulder", tag: "New", variants: [
      { color: "Rosa", hex: "#c98bb0", file: "images/bauletto-rosa.webp" },
      { color: "Nero", hex: "#1c1c1c", file: "images/bauletto-nero.webp" },
  ]},
  { name: "Lock", note: "Flap", tag: "Icon", variants: [
      { color: "Nero", hex: "#1c1c1c", file: "images/lock-nero.webp" },
  ]},
  { name: "Luna", note: "Crossbody", tag: "Classic", variants: [
      { color: "Nero", hex: "#1c1c1c", file: "images/luna-nero.webp" },
  ]},
  { name: "Heritage", note: "Satchel", tag: "Heritage", variants: [
      { color: "Grigio", hex: "#6f6c66", file: "images/heritage-grigio.png" },
  ]},
  { name: "Postino", note: "Crossbody", tag: "Classic", variants: [
      { color: "Nero", hex: "#1c1c1c", file: "images/postino-nero.png" },
  ]},
  { name: "Baguette", note: "Shoulder", tag: "Editorial", variants: [
      { color: "Avorio", hex: "#e8dcc7", file: "images/baguette-avorio.png" },
      { color: "Nero", hex: "#1c1c1c", file: "images/baguette-nero.png" },
  ]},
  { name: "Arco", note: "Hobo", tag: "Signature", variants: [
      { color: "Avorio", hex: "#e8dcc7", file: "images/arco-avorio.png" },
      { color: "Nero", hex: "#1c1c1c", file: "images/arco-nero.png" },
      { color: "Smeraldo", hex: "#1f5f52", file: "images/arco-smeraldo.png" },
  ]},
  { name: "Coccodrillo", note: "Croc flap", tag: "Limited", variants: [
      { color: "Nero", hex: "#1c1c1c", file: "images/coccodrillo-nero.png" },
      { color: "Pistacchio", hex: "#bcc38a", file: "images/coccodrillo-pistacchio.png" },
  ]},
  { name: "Baule", note: "Shoulder", tag: "New", variants: [
      { color: "Nero", hex: "#1c1c1c", file: "images/baule-nero.png" },
      { color: "Avorio", hex: "#e8dcc7", file: "images/baule-avorio.png" },
  ]},
];
