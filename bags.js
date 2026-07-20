/* ------------------------------------------------------------------
   The A.z edit — demo
   One card per model. Each colour is a "variant"; each variant can
   have several photos ("shots" — front, angle, interior, on-model).
   name = brand · note = model · no prices, no links.

   details = the product sheet shown in the viewer. Replace any value
   with the exact spec of the piece you actually stock — the labels
   render automatically, so add/remove rows freely.
------------------------------------------------------------------- */

const BAGS = [
  { name: "Armani Exchange", note: "Sussy Saddle", tag: "Signature",
    details: {
      "Material": "Embossed eco-leather, tonal saddle flap",
      "Dimensions": "20 × 16 × 7 cm (W × H × D)",
      "Strap": "Adjustable crossbody strap, ~55 cm drop",
      "Closure": "Magnetic flap",
      "Hardware": "Light-gold AX buckle",
      "Interior": "Lined; one slip pocket",
      "Care": "Store in dust bag, away from rain and direct heat",
    },
    variants: [
      { color: "Sand", hex: "#c9b291", shots: ["images/sella-sand.webp", "images/sella-sand-2.webp"] },
      { color: "Nero", hex: "#1c1c1c", shots: ["images/sella-nero.webp"] },
  ]},
  { name: "Armani Exchange", note: "Logo Top-Handle", tag: "Icon",
    details: {
      "Material": "All-over embossed logo eco-leather",
      "Dimensions": "24 × 16 × 10 cm (W × H × D)",
      "Strap": "Top handle + detachable, adjustable shoulder strap",
      "Closure": "Magnetic flap",
      "Hardware": "Silver-tone AX charm plaque",
      "Interior": "Two compartments; centre divider, zip pocket",
      "Care": "Store in dust bag, away from rain and direct heat",
    },
    variants: [
      { color: "Nero", hex: "#1c1c1c", shots: ["images/monogramme-nero.webp", "images/monogramme-nero-2.webp", "images/monogramme-nero-3.webp", "images/monogramme-nero-4.webp"] },
  ]},
  { name: "Armani Exchange", note: "Mini Shopping Tote", tag: "Everyday",
    details: {
      "Material": "Pebbled eco-leather, embossed lettering",
      "Dimensions": "22 × 18 × 10 cm (W × H × D)",
      "Strap": "Twin top handles + detachable logo shoulder strap",
      "Closure": "Zip top",
      "Hardware": "Gunmetal accents",
      "Interior": "Lined; slip and zip pockets",
      "Care": "Store in dust bag, away from rain and direct heat",
    },
    variants: [
      { color: "Nero", hex: "#1c1c1c", shots: ["images/tote-mini-nero.webp", "images/tote-mini-nero-2.webp", "images/tote-mini-nero-3.webp"] },
  ]},
  { name: "Coccinelle", note: "Jellyfish", tag: "New",
    details: {
      "Material": "Grained calf leather",
      "Dimensions": "26 × 15 × 10 cm (W × H × D)",
      "Strap": "Double leather top handles, ~20 cm drop",
      "Closure": "Zip top",
      "Hardware": "Light-gold Coccinelle lettering",
      "Interior": "Suede-touch lining; zip pocket",
      "Care": "Leather: keep dry, condition gently, store in dust bag",
    },
    variants: [
      { color: "Rosa", hex: "#c98bb0", shots: ["images/bauletto-rosa.webp", "images/bauletto-rosa-2.webp"] },
      { color: "Nero", hex: "#1c1c1c", shots: ["images/bauletto-nero.webp", "images/bauletto-nero-2.webp"] },
  ]},
  { name: "Coccinelle", note: "Me Lock", tag: "Icon",
    details: {
      "Material": "Smooth calf leather",
      "Dimensions": "24 × 15 × 7 cm (W × H × D)",
      "Strap": "Adjustable shoulder strap, wearable crossbody",
      "Closure": "Signature turn-lock flap",
      "Hardware": "Polished light-gold lock",
      "Interior": "Lined; card slots and zip pocket",
      "Care": "Leather: keep dry, condition gently, store in dust bag",
    },
    variants: [
      { color: "Noir", hex: "#1c1c1c", shots: ["images/lock-nero.webp", "images/lock-nero-2.webp"] },
  ]},
  { name: "U.S. Polo Assn.", note: "Monogram Satchel", tag: "Heritage",
    details: {
      "Material": "Monogram jacquard with grained trim",
      "Dimensions": "27 × 20 × 12 cm (W × H × D)",
      "Strap": "Twin handles + detachable, adjustable shoulder strap",
      "Closure": "Zip top with turn-stud tabs",
      "Hardware": "Light-gold logo medallion",
      "Interior": "Lined; slip and zip pockets",
      "Care": "Wipe with a soft dry cloth; store in dust bag",
    },
    variants: [
      { color: "Grigio", hex: "#6f6c66", shots: ["images/heritage-grigio.webp", "images/heritage-grigio-2.webp", "images/heritage-grigio-3.webp"] },
  ]},
  { name: "U.S. Polo Assn.", note: "Flap Crossbody", tag: "Classic",
    details: {
      "Material": "Pebbled eco-leather",
      "Dimensions": "23 × 16 × 8 cm (W × H × D)",
      "Strap": "Adjustable crossbody strap",
      "Closure": "Magnetic flap",
      "Hardware": "Light-gold logo plaque",
      "Interior": "Lined; rear slip pocket",
      "Care": "Wipe with a soft dry cloth; store in dust bag",
    },
    variants: [
      { color: "Nero", hex: "#1c1c1c", shots: ["images/postino-nero.webp", "images/postino-nero-2.webp", "images/postino-nero-3.webp"] },
  ]},
  { name: "U.S. Polo Assn.", note: "Shoulder Baguette", tag: "Editorial",
    details: {
      "Material": "Smooth eco-leather with belt detail",
      "Dimensions": "25 × 14 × 7 cm (W × H × D)",
      "Strap": "Shoulder strap, ~28 cm drop",
      "Closure": "Magnetic flap under belt",
      "Hardware": "Light-gold buckle",
      "Interior": "Lined; slip pocket",
      "Care": "Wipe with a soft dry cloth; store in dust bag",
    },
    variants: [
      { color: "Avorio", hex: "#e8dcc7", shots: ["images/baguette-avorio.webp", "images/baguette-avorio-2.webp", "images/baguette-avorio-3.webp"] },
      { color: "Nero", hex: "#1c1c1c", shots: ["images/baguette-nero.webp", "images/baguette-nero-2.webp"] },
  ]},
  { name: "Calvin Klein", note: "Arc Hobo", tag: "Signature",
    details: {
      "Material": "Soft grained faux leather (recycled content)",
      "Dimensions": "33 × 24 × 10 cm (W × H × D)",
      "Strap": "Single shoulder strap, ~23 cm drop",
      "Closure": "Zip top",
      "Hardware": "Minimal silver-tone CK lettering",
      "Interior": "Lined; slip and zip pockets",
      "Care": "Wipe with a soft dry cloth; store in dust bag",
    },
    variants: [
      { color: "Avorio", hex: "#e8dcc7", shots: ["images/arco-avorio.webp"] },
      { color: "Nero", hex: "#1c1c1c", shots: ["images/arco-nero.webp"] },
      { color: "Smeraldo", hex: "#1f5f52", shots: ["images/arco-smeraldo.webp"] },
  ]},
  { name: "Calvin Klein", note: "Croc Shoulder Bag", tag: "Limited",
    details: {
      "Material": "Croc-embossed faux leather",
      "Dimensions": "25 × 13 × 8 cm (W × H × D)",
      "Strap": "Chain-and-leather shoulder strap",
      "Closure": "Magnetic flap",
      "Hardware": "Silver-tone CK monogram plaque",
      "Interior": "Lined; slip pocket",
      "Care": "Wipe with a soft dry cloth; store in dust bag",
    },
    variants: [
      { color: "Nero", hex: "#1c1c1c", shots: ["images/coccodrillo-nero.webp"] },
      { color: "Pistacchio", hex: "#bcc38a", shots: ["images/coccodrillo-pistacchio.webp"] },
  ]},
  { name: "Calvin Klein", note: "Shoulder Bag", tag: "New",
    details: {
      "Material": "Soft matte faux leather",
      "Dimensions": "28 × 16 × 9 cm (W × H × D)",
      "Strap": "Shoulder strap with charm detail",
      "Closure": "Zip top",
      "Hardware": "Tonal black CK lettering",
      "Interior": "Lined; slip pocket",
      "Care": "Wipe with a soft dry cloth; store in dust bag",
    },
    variants: [
      { color: "Nero", hex: "#1c1c1c", shots: ["images/baule-nero.png", "images/baule-nero-2.png", "images/baule-nero-3.webp"] },
      { color: "Avorio", hex: "#e8dcc7", shots: ["images/baule-avorio.png", "images/baule-avorio-2.webp"] },
  ]},
  { name: "Tommy Hilfiger", note: "Chain Crossbody", tag: "Icon",
    details: {
      "Material": "Pebbled eco-leather",
      "Dimensions": "22 × 15 × 7 cm (W × H × D)",
      "Strap": "Chain-trimmed crossbody strap",
      "Closure": "Fold-over flap with clasp",
      "Hardware": "Light-gold TH monogram",
      "Interior": "Lined; slip pocket",
      "Care": "Wipe with a soft dry cloth; store in dust bag",
    },
    variants: [
      { color: "Nero", hex: "#1c1c1c", shots: ["images/tommy-nero.webp", "images/tommy-nero-2.webp", "images/tommy-nero-3.webp"] },
  ]},
  { name: "Twinset", note: "Crescent Hobo", tag: "New",
    details: {
      "Material": "Pebbled eco-leather",
      "Dimensions": "32 × 22 × 11 cm (W × H × D)",
      "Strap": "Shoulder strap, ~24 cm drop",
      "Closure": "Magnetic flap + inner zip",
      "Hardware": "Oval-T logo, light-gold finish",
      "Interior": "Lined; slip and zip pockets",
      "Care": "Wipe with a soft dry cloth; store in dust bag",
    },
    variants: [
      { color: "Nero", hex: "#1c1c1c", shots: ["images/twinset-nero.webp", "images/twinset-nero-2.jpeg"] },
  ]},
];
