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
    story: "Drawn from the equestrian tradition and softened for the city, the Sussy is Armani Exchange's most disciplined silhouette. The saddle curve sits close to the body, the flap falls with a quiet weight, and the whole line reads as intention rather than effort. It is the bag we recommend when someone asks where a considered wardrobe should begin.",
    details: {
      "Material": "Embossed eco-leather, tonal saddle flap",
      "Dimensions": "20 × 16 × 7 cm (W × H × D)",
      "Strap": "Adjustable crossbody strap, ~55 cm drop",
      "Closure": "Magnetic flap",
      "Hardware": "Light-gold AX buckle",
      "Interior": "Lined; one slip pocket",
      "Care": "Store in dust bag, away from rain and direct heat",
    },
    advisor: {
      note: "A saddle line this clean is rare at any level. It carries itself quietly — the kind of piece people notice without knowing why.",
      who: "For the woman whose elegance is a habit, not an occasion.",
      why: "It dresses down a suit and dresses up denim — one bag, an entire wardrobe answered.",
    },
    variants: [
      { color: "Sand", hex: "#c9b291", shots: ["images/sella-sand.webp", "images/sella-sand-2.webp"] },
      { color: "Nero", hex: "#1c1c1c", shots: ["images/sella-nero.webp"] },
  ]},
  { name: "Armani Exchange", note: "Logo Top-Handle", tag: "Icon",
    story: "A structured frame, a single handle, and a monogram pressed so deep it becomes architecture. This is the piece that taught a generation that a logo can whisper. Carried by the handle it is formal; worn on the strap it relaxes without ever slouching.",
    details: {
      "Material": "All-over embossed logo eco-leather",
      "Dimensions": "24 × 16 × 10 cm (W × H × D)",
      "Strap": "Top handle + detachable, adjustable shoulder strap",
      "Closure": "Magnetic flap",
      "Hardware": "Silver-tone AX charm plaque",
      "Interior": "Two compartments; centre divider, zip pocket",
      "Care": "Store in dust bag, away from rain and direct heat",
    },
    advisor: {
      note: "The embossed monogram reads as texture, not advertisement — confidence in a whisper. Our favourite first Armani piece.",
      who: "For the woman who is introduced once, and remembered.",
      why: "A structured top-handle is the single most versatile silhouette a collection can start with.",
    },
    /* Optional per-piece: a trusted retailer we recommend acquiring it from.
       Add { name, url } to any bag and the recommendation block appears on its page. */
    retailer: { name: "Zalando", url: "https://www.zalando.dk/armani-exchange-handtasker-black-arc51h0li-q11.html" },
    variants: [
      { color: "Nero", hex: "#1c1c1c", shots: ["images/monogramme-nero.webp", "images/monogramme-nero-2.webp", "images/monogramme-nero-3.webp", "images/monogramme-nero-4.webp"] },
  ]},
  { name: "Armani Exchange", note: "Mini Shopping Tote", tag: "Everyday",
    story: "The house shopper, scaled down to its essence. The pebbled grain hides the week's wear, the twin handles sit perfectly in the crook of the arm, and the proportions photograph beautifully. An everyday piece with none of the ordinariness.",
    details: {
      "Material": "Pebbled eco-leather, embossed lettering",
      "Dimensions": "22 × 18 × 10 cm (W × H × D)",
      "Strap": "Twin top handles + detachable logo shoulder strap",
      "Closure": "Zip top",
      "Hardware": "Gunmetal accents",
      "Interior": "Lined; slip and zip pockets",
      "Care": "Store in dust bag, away from rain and direct heat",
    },
    advisor: {
      note: "Small in the hand, serious in intent. The pebbled grain wears beautifully and forgives a busy life.",
      who: "For the woman whose days move fast and standards never do.",
      why: "It is the everyday piece you reach for without thinking — which is exactly the point.",
    },
    variants: [
      { color: "Nero", hex: "#1c1c1c", shots: ["images/tote-mini-nero.webp", "images/tote-mini-nero-2.webp", "images/tote-mini-nero-3.webp"] },
  ]},
  { name: "Coccinelle", note: "Jellyfish", tag: "New",
    story: "Coccinelle cuts the Jellyfish from true grained calf and lets the leather do the speaking — soft structure, rounded shoulders, hardware kept to a murmur. The rosa is playful in a way Italians do best; the nero is simply correct.",
    details: {
      "Material": "Grained calf leather",
      "Dimensions": "26 × 15 × 10 cm (W × H × D)",
      "Strap": "Double leather top handles, ~20 cm drop",
      "Closure": "Zip top",
      "Hardware": "Light-gold Coccinelle lettering",
      "Interior": "Suede-touch lining; zip pocket",
      "Care": "Leather: keep dry, condition gently, store in dust bag",
    },
    advisor: {
      note: "Real grained calf, softly structured — Coccinelle at its most charming. The rosa is a mood; the nero, a rule.",
      who: "For the woman who collects moments, not things.",
      why: "Italian leather at this finish level rarely stays available for long.",
    },
    variants: [
      { color: "Rosa", hex: "#c98bb0", shots: ["images/bauletto-rosa.webp", "images/bauletto-rosa-2.webp"] },
      { color: "Nero", hex: "#1c1c1c", shots: ["images/bauletto-nero.webp", "images/bauletto-nero-2.webp"] },
  ]},
  { name: "Coccinelle", note: "Me Lock", tag: "Icon",
    story: "The Me Lock is Coccinelle's thesis on permanence: smooth calf, a polished turn-lock, and a flap that closes with the sound of certainty. Pieces like this do not date, because they never belonged to a season in the first place.",
    details: {
      "Material": "Smooth calf leather",
      "Dimensions": "24 × 15 × 7 cm (W × H × D)",
      "Strap": "Adjustable shoulder strap, wearable crossbody",
      "Closure": "Signature turn-lock flap",
      "Hardware": "Polished light-gold lock",
      "Interior": "Lined; card slots and zip pocket",
      "Care": "Leather: keep dry, condition gently, store in dust bag",
    },
    advisor: {
      note: "The turn-lock is the whole story: precise, polished, permanent. This is the piece we would keep for a decade.",
      who: "For the woman who buys once, and buys correctly.",
      why: "A flap-and-lock in smooth calf is the closest thing fashion has to a safe investment.",
    },
    variants: [
      { color: "Noir", hex: "#1c1c1c", shots: ["images/lock-nero.webp", "images/lock-nero-2.webp"] },
  ]},
  { name: "U.S. Polo Assn.", note: "Monogram Satchel", tag: "Heritage",
    story: "A monogram woven, not printed — the difference is everything. The satchel stands on its own feet, holds its structure through years of use, and carries the unhurried air of luggage from another era.",
    details: {
      "Material": "Monogram jacquard with grained trim",
      "Dimensions": "27 × 20 × 12 cm (W × H × D)",
      "Strap": "Twin handles + detachable, adjustable shoulder strap",
      "Closure": "Zip top with turn-stud tabs",
      "Hardware": "Light-gold logo medallion",
      "Interior": "Lined; slip and zip pockets",
      "Care": "Wipe with a soft dry cloth; store in dust bag",
    },
    advisor: {
      note: "Heritage monogram with real structure — it holds its shape and its dignity. Quietly old-money.",
      who: "For the woman who prefers lineage over logos.",
      why: "A structured satchel anchors every daytime look — meetings, travel, lunch.",
    },
    variants: [
      { color: "Grigio", hex: "#6f6c66", shots: ["images/heritage-grigio.webp", "images/heritage-grigio-2.webp", "images/heritage-grigio-3.webp"] },
  ]},
  { name: "U.S. Polo Assn.", note: "Flap Crossbody", tag: "Classic",
    story: "The crossbody that behaves like a handbag: a clean flap, a considered scale, and a strap that sits exactly where it should. It is the piece our clients report reaching for most — the truest compliment a bag can earn.",
    details: {
      "Material": "Pebbled eco-leather",
      "Dimensions": "23 × 16 × 8 cm (W × H × D)",
      "Strap": "Adjustable crossbody strap",
      "Closure": "Magnetic flap",
      "Hardware": "Light-gold logo plaque",
      "Interior": "Lined; rear slip pocket",
      "Care": "Wipe with a soft dry cloth; store in dust bag",
    },
    advisor: {
      note: "Hands-free without a hint of casual. The proportions are exactly right — neither trend nor compromise.",
      who: "For the woman who is always slightly ahead of schedule.",
      why: "The one bag that moves from morning coffee to evening without being changed.",
    },
    variants: [
      { color: "Nero", hex: "#1c1c1c", shots: ["images/postino-nero.webp", "images/postino-nero-2.webp", "images/postino-nero-3.webp"] },
  ]},
  { name: "U.S. Polo Assn.", note: "Shoulder Baguette", tag: "Editorial",
    story: "The baguette is the most flattering line in the modern wardrobe, and this one earns its place with a belt detail that gives the softness a spine. Worn high on the shoulder, it finishes an outfit the way jewellery does.",
    details: {
      "Material": "Smooth eco-leather with belt detail",
      "Dimensions": "25 × 14 × 7 cm (W × H × D)",
      "Strap": "Shoulder strap, ~28 cm drop",
      "Closure": "Magnetic flap under belt",
      "Hardware": "Light-gold buckle",
      "Interior": "Lined; slip pocket",
      "Care": "Wipe with a soft dry cloth; store in dust bag",
    },
    advisor: {
      note: "The baguette is fashion's most flattering line, and this belt detail gives it spine. Avorio is the connoisseur's choice.",
      who: "For the woman who understands that restraint is the loudest statement.",
      why: "Shoulder silhouettes define this era — this one will outlast it.",
    },
    variants: [
      { color: "Avorio", hex: "#e8dcc7", shots: ["images/baguette-avorio.webp", "images/baguette-avorio-2.webp", "images/baguette-avorio-3.webp"] },
      { color: "Nero", hex: "#1c1c1c", shots: ["images/baguette-nero.webp", "images/baguette-nero-2.webp"] },
  ]},
  { name: "Calvin Klein", note: "Arc Hobo", tag: "Signature",
    story: "Calvin Klein at its most architectural: one uninterrupted arc, a matte surface, and a logo so small it must be found. The hobo drapes rather than hangs — the quiet luxury silhouette of this decade, executed with restraint.",
    details: {
      "Material": "Soft grained faux leather (recycled content)",
      "Dimensions": "33 × 24 × 10 cm (W × H × D)",
      "Strap": "Single shoulder strap, ~23 cm drop",
      "Closure": "Zip top",
      "Hardware": "Minimal silver-tone CK lettering",
      "Interior": "Lined; slip and zip pockets",
      "Care": "Wipe with a soft dry cloth; store in dust bag",
    },
    advisor: {
      note: "A perfect arc, no noise. Calvin Klein at its most architectural — the smeraldo is genuinely special.",
      who: "For the woman whose taste was formed in galleries, not feeds.",
      why: "Soft-structured hobos are the quiet luxury of this decade; the shape does the talking.",
    },
    variants: [
      { color: "Avorio", hex: "#e8dcc7", shots: ["images/arco-avorio.webp"] },
      { color: "Nero", hex: "#1c1c1c", shots: ["images/arco-nero.webp"] },
      { color: "Smeraldo", hex: "#1f5f52", shots: ["images/arco-smeraldo.webp"] },
  ]},
  { name: "Calvin Klein", note: "Croc Shoulder Bag", tag: "Limited",
    story: "Croc embossing, disciplined to within an inch of its life. Under evening light the relief catches and releases like water. One textured piece belongs in every serious collection; this is the measured way to own it.",
    details: {
      "Material": "Croc-embossed faux leather",
      "Dimensions": "25 × 13 × 8 cm (W × H × D)",
      "Strap": "Chain-and-leather shoulder strap",
      "Closure": "Magnetic flap",
      "Hardware": "Silver-tone CK monogram plaque",
      "Interior": "Lined; slip pocket",
      "Care": "Wipe with a soft dry cloth; store in dust bag",
    },
    advisor: {
      note: "Croc embossing this disciplined reads evening from across a room. The pistacchio is for the brave; the nero, forever.",
      who: "For the woman who arrives late and forgiven.",
      why: "One embossed piece belongs in every serious collection — this is the measured way in.",
    },
    variants: [
      { color: "Nero", hex: "#1c1c1c", shots: ["images/coccodrillo-nero.webp"] },
      { color: "Pistacchio", hex: "#bcc38a", shots: ["images/coccodrillo-pistacchio.webp"] },
  ]},
  { name: "Calvin Klein", note: "Shoulder Bag", tag: "New",
    story: "Matte black on black, soft enough to fold under an arm, finished with tonal lettering you feel before you see. It is the definition of a piece that disappears into a life — which is precisely what expensive things do.",
    details: {
      "Material": "Soft matte faux leather",
      "Dimensions": "28 × 16 × 9 cm (W × H × D)",
      "Strap": "Shoulder strap with charm detail",
      "Closure": "Zip top",
      "Hardware": "Tonal black CK lettering",
      "Interior": "Lined; slip pocket",
      "Care": "Wipe with a soft dry cloth; store in dust bag",
    },
    advisor: {
      note: "Matte, soft, entirely without effort. It disappears into an outfit the way expensive things do.",
      who: "For the woman who owns the room by lowering her voice.",
      why: "The tonal black-on-black finish is the definition of quiet luxury.",
    },
    variants: [
      { color: "Nero", hex: "#1c1c1c", shots: ["images/baule-nero.png", "images/baule-nero-2.png", "images/baule-nero-3.webp"] },
      { color: "Avorio", hex: "#e8dcc7", shots: ["images/baule-avorio.png", "images/baule-avorio-2.webp"] },
  ]},
  { name: "Tommy Hilfiger", note: "Chain Crossbody", tag: "Icon",
    story: "The chain is the jewellery, the flap is the armour. Tommy Hilfiger's most polished small piece in years — scaled for evenings, phone-and-card living, and photographs taken after dark.",
    details: {
      "Material": "Pebbled eco-leather",
      "Dimensions": "22 × 15 × 7 cm (W × H × D)",
      "Strap": "Chain-trimmed crossbody strap",
      "Closure": "Fold-over flap with clasp",
      "Hardware": "Light-gold TH monogram",
      "Interior": "Lined; slip pocket",
      "Care": "Wipe with a soft dry cloth; store in dust bag",
    },
    advisor: {
      note: "The chain is jewellery, the flap is armour. Tommy's most polished small piece in years.",
      who: "For the woman whose evenings begin after nine.",
      why: "A chain crossbody is the correct answer to every dress you own.",
    },
    variants: [
      { color: "Nero", hex: "#1c1c1c", shots: ["images/tommy-nero.webp", "images/tommy-nero-2.webp", "images/tommy-nero-3.webp"] },
  ]},
  { name: "Twinset", note: "Crescent Hobo", tag: "New",
    story: "Twinset cuts the crescent low and soft, so it moves with the body instead of against it. The Oval-T sits like a signet ring — present, never loud. A gentle silhouette having a very serious moment.",
    details: {
      "Material": "Pebbled eco-leather",
      "Dimensions": "32 × 22 × 11 cm (W × H × D)",
      "Strap": "Shoulder strap, ~24 cm drop",
      "Closure": "Magnetic flap + inner zip",
      "Hardware": "Oval-T logo, light-gold finish",
      "Interior": "Lined; slip and zip pockets",
      "Care": "Wipe with a soft dry cloth; store in dust bag",
    },
    advisor: {
      note: "The crescent line is soft, feminine, and disarmingly current. Twinset finished it with real discretion.",
      who: "For the woman in her soft-power era.",
      why: "It carries a full day and still looks like a considered choice — rare in this shape.",
    },
    variants: [
      { color: "Nero", hex: "#1c1c1c", shots: ["images/twinset-nero.webp", "images/twinset-nero-2.jpeg"] },
  ]},
];
