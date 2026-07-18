/* ------------------------------------------------------------------
   The MAISON edit — demo
   One card per model. Each colour is a "variant"; each variant can
   have several photos ("shots" — front, angle, interior, on-model).
   Every uploaded photo is placed here, grouped under its own bag.
   name = brand · note = model · no prices, no links.
------------------------------------------------------------------- */

const BAGS = [
  { name: "Armani Exchange", note: "Sussy Saddle", tag: "Signature", variants: [
      { color: "Sand", hex: "#c9b291", shots: ["images/sella-sand.webp", "images/sella-sand-2.webp"] },
      { color: "Nero", hex: "#1c1c1c", shots: ["images/sella-nero.webp"] },
  ]},
  { name: "Armani Exchange", note: "Logo Top-Handle", tag: "Icon", variants: [
      { color: "Nero", hex: "#1c1c1c", shots: ["images/monogramme-nero.webp", "images/monogramme-nero-2.webp", "images/monogramme-nero-3.webp", "images/monogramme-nero-4.webp"] },
  ]},
  { name: "Armani Exchange", note: "Mini Shopping Tote", tag: "Everyday", variants: [
      { color: "Nero", hex: "#1c1c1c", shots: ["images/tote-mini-nero.webp", "images/tote-mini-nero-2.webp", "images/tote-mini-nero-3.webp"] },
  ]},
  { name: "Coccinelle", note: "Jellyfish", tag: "New", variants: [
      { color: "Rosa", hex: "#c98bb0", shots: ["images/bauletto-rosa.webp", "images/bauletto-rosa-2.webp"] },
      { color: "Nero", hex: "#1c1c1c", shots: ["images/bauletto-nero.webp", "images/bauletto-nero-2.webp"] },
  ]},
  { name: "Coccinelle", note: "Me Lock", tag: "Icon", variants: [
      { color: "Noir", hex: "#1c1c1c", shots: ["images/lock-nero.webp", "images/lock-nero-2.webp"] },
  ]},
  { name: "U.S. Polo Assn.", note: "Monogram Satchel", tag: "Heritage", variants: [
      { color: "Grigio", hex: "#6f6c66", shots: ["images/heritage-grigio.webp", "images/heritage-grigio-2.webp", "images/heritage-grigio-3.webp"] },
  ]},
  { name: "U.S. Polo Assn.", note: "Flap Crossbody", tag: "Classic", variants: [
      { color: "Nero", hex: "#1c1c1c", shots: ["images/postino-nero.webp", "images/postino-nero-2.webp", "images/postino-nero-3.webp"] },
  ]},
  { name: "U.S. Polo Assn.", note: "Shoulder Baguette", tag: "Editorial", variants: [
      { color: "Avorio", hex: "#e8dcc7", shots: ["images/baguette-avorio.webp", "images/baguette-avorio-2.webp", "images/baguette-avorio-3.webp"] },
      { color: "Nero", hex: "#1c1c1c", shots: ["images/baguette-nero.webp", "images/baguette-nero-2.webp"] },
  ]},
  { name: "Calvin Klein", note: "Arc Hobo", tag: "Signature", variants: [
      { color: "Avorio", hex: "#e8dcc7", shots: ["images/arco-avorio.webp"] },
      { color: "Nero", hex: "#1c1c1c", shots: ["images/arco-nero.webp"] },
      { color: "Smeraldo", hex: "#1f5f52", shots: ["images/arco-smeraldo.webp"] },
  ]},
  { name: "Calvin Klein", note: "Croc Shoulder Bag", tag: "Limited", variants: [
      { color: "Nero", hex: "#1c1c1c", shots: ["images/coccodrillo-nero.webp"] },
      { color: "Pistacchio", hex: "#bcc38a", shots: ["images/coccodrillo-pistacchio.webp"] },
  ]},
  { name: "Calvin Klein", note: "Shoulder Bag", tag: "New", variants: [
      { color: "Nero", hex: "#1c1c1c", shots: ["images/baule-nero.png", "images/baule-nero-2.png", "images/baule-nero-3.webp"] },
      { color: "Avorio", hex: "#e8dcc7", shots: ["images/baule-avorio.png", "images/baule-avorio-2.webp"] },
  ]},
  { name: "Tommy Hilfiger", note: "Chain Crossbody", tag: "Icon", variants: [
      { color: "Nero", hex: "#1c1c1c", shots: ["images/tommy-nero.webp", "images/tommy-nero-2.webp", "images/tommy-nero-3.webp"] },
  ]},
  { name: "Twinset", note: "Crescent Hobo", tag: "New", variants: [
      { color: "Nero", hex: "#1c1c1c", shots: ["images/twinset-nero.webp", "images/twinset-nero-2.jpeg"] },
  ]},
];
