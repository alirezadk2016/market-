/* ------------------------------------------------------------------
   The MAISON edit — demo
   One card per model (real brand + model names). Multi-colour models
   show swatches so the colour can be switched right on the card.
   name = brand · note = model · variants = colours you provided.
   No prices, no links. Extra shots stay in images/_unused/.
------------------------------------------------------------------- */

const BAGS = [
  { name: "Armani Exchange", note: "Sussy Saddle", tag: "Signature", variants: [
      { color: "Sand", hex: "#c9b291", file: "images/sella-sand.webp" },
      { color: "Nero", hex: "#1c1c1c", file: "images/sella-nero.webp" },
  ]},
  { name: "Armani Exchange", note: "Logo Top-Handle", tag: "Icon", variants: [
      { color: "Nero", hex: "#1c1c1c", file: "images/monogramme-nero.webp" },
  ]},
  { name: "Armani Exchange", note: "Mini Shopping Tote", tag: "Everyday", variants: [
      { color: "Nero", hex: "#1c1c1c", file: "images/tote-mini-nero.webp" },
  ]},
  { name: "Coccinelle", note: "Jellyfish", tag: "New", variants: [
      { color: "Rosa", hex: "#c98bb0", file: "images/bauletto-rosa.webp" },
      { color: "Nero", hex: "#1c1c1c", file: "images/bauletto-nero.webp" },
  ]},
  { name: "Coccinelle", note: "Me Lock", tag: "Icon", variants: [
      { color: "Noir", hex: "#1c1c1c", file: "images/lock-nero.webp" },
  ]},
  { name: "Liu Jo", note: "Saddle Bag", tag: "Classic", variants: [
      { color: "Nero", hex: "#1c1c1c", file: "images/luna-nero.webp" },
  ]},
  { name: "U.S. Polo Assn.", note: "Monogram Satchel", tag: "Heritage", variants: [
      { color: "Grigio", hex: "#6f6c66", file: "images/heritage-grigio.png" },
  ]},
  { name: "U.S. Polo Assn.", note: "Flap Crossbody", tag: "Classic", variants: [
      { color: "Nero", hex: "#1c1c1c", file: "images/postino-nero.png" },
  ]},
  { name: "U.S. Polo Assn.", note: "Shoulder Baguette", tag: "Editorial", variants: [
      { color: "Avorio", hex: "#e8dcc7", file: "images/baguette-avorio.png" },
      { color: "Nero", hex: "#1c1c1c", file: "images/baguette-nero.png" },
  ]},
  { name: "Calvin Klein", note: "Arc Hobo", tag: "Signature", variants: [
      { color: "Avorio", hex: "#e8dcc7", file: "images/arco-avorio.png" },
      { color: "Nero", hex: "#1c1c1c", file: "images/arco-nero.png" },
      { color: "Smeraldo", hex: "#1f5f52", file: "images/arco-smeraldo.png" },
  ]},
  { name: "Calvin Klein", note: "Croc Shoulder Bag", tag: "Limited", variants: [
      { color: "Nero", hex: "#1c1c1c", file: "images/coccodrillo-nero.png" },
      { color: "Pistacchio", hex: "#bcc38a", file: "images/coccodrillo-pistacchio.png" },
  ]},
  { name: "Calvin Klein", note: "Shoulder Bag", tag: "New", variants: [
      { color: "Nero", hex: "#1c1c1c", file: "images/baule-nero.png" },
      { color: "Avorio", hex: "#e8dcc7", file: "images/baule-avorio.png" },
  ]},
];
