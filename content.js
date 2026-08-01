/* ------------------------------------------------------------------
   The A.z site copy.

   Everything written on the home page lives here — the headlines, the
   section text, the contact chips, the two photographs on the hero
   plate, and the markers placed on the salon photograph.

   Edited by the control panel at /admin, under "The Site". It is
   ordinary data and can be edited by hand too; anything left empty
   simply keeps whatever the page already says.

   A few values carry markup on purpose (<em>, <br>) — that is how the
   italic second line of a headline is set. {n} in the vitrine title is
   replaced with the number of collections, in words.
------------------------------------------------------------------- */
const SITE = {
  meta: {
    title: "A.z — Private Luxury Advisory",
    description: "A.z — a private advisory for luxury and old-money essentials. Curated pieces and personal purchase guidance, by appointment.",
  },

  hero: {
    eyebrow: "A.z — Private Luxury Advisory",
    title: "The art of <em>choosing well.</em>",
    sub: "A private advisory for luxury &amp; old-money essentials — we curate the finest, then guide you to the piece that truly suits you.",
    ctaOne: "View the Collection",
    ctaTwo: "Speak to an Advisor",
    sign: "Curated personally — <em>A.z</em>",
    hint: "Scroll into the scene · touch a marker · turn the plate",
    photo: "images/look.webp",
    photoAlt: "Styled in the salon — every piece in the scene can be explored",
    back: {
      photo: "images/look-back.webp",
      alt: "A.z campaign — the Gucci rectangular sunglasses",
      edge: "The Campaign",
      house: "Gucci",
      piece: "Rectangular Sunglasses",
      go: "Enter the Eyewear",
      link: "eyewear.html",
    },
  },

  vitrine: {
    kicker: "The Vitrine",
    title: "{n} collections. <em>One standard.</em>",
    lead: "Select a collection to explore",
  },

  collection: {
    index: "I",
    title: "The Collection",
    lead: "A sample of what we source — ask, and we advise.",
  },

  service: {
    index: "II",
    title: "The Service",
    lead: "How A.z works.",
  },

  enquire: {
    index: "III",
    title: "Considering a piece?<br /><em>Let us advise you.</em>",
    sub: "Private consultations by appointment. Tell us what you are drawn to — we will guide you to the right piece and source it for you.",
    whatsapp: "",
    instagram: "",
    email: "alirezadk2020@gmail.com",
  },

  /* the three columns under "The Service" */
  pillars: [
    { num: "i", title: "Curated, Not Sold",
      text: "We select the finest across the great houses — you receive taste and honesty, never a sales pitch." },
    { num: "ii", title: "Personal Guidance",
      text: "Speak with an advisor who learns your life and wardrobe, and points you to what genuinely suits you." },
    { num: "iii", title: "By Appointment",
      text: "A discreet, old-money sensibility and time taken for you. Bags today; footwear and fragrance to follow." },
  ],
  houseCta: "How We Help — The Full Method",

  word: {
    kicker: "A Word from the Curator",
    text: "\u201c I open every box myself. If a piece does not make me pause, it never reaches you. That is the whole method — <em>taste, patience, and refusal.</em> \u201d",
    role: "Founder &amp; Curator",
  },

  footer: {
    note: "Private luxury advisory — curated pieces, personal guidance, discreet service. By appointment.",
    copy: "© A.z — By Appointment · Curated personally, piece by piece",
  },

  /* --------------------------------------------------------- the advisory */
  advisory: {
    metaTitle: "A.z — The Advisory · How We Help",
    kicker: "The Advisory",
    title: "Style is not what you wear.<br /><em>It is who you are.</em>",
    lead: "How we help — quietly, personally, piece by piece",
    manifesto: [
      "A person's style is their <em>character</em> — worn where the world can see it. Before you say a word, it has already spoken for you.",
      "Most wardrobes are full, and still say nothing. That was never a shopping problem — it is a <em>choosing</em> problem.",
      "So we do not begin with product. We begin with <em>you</em> — your days, the rooms you walk into, and what should be understood about you before you speak.",
    ],
    methodKicker: "The Method",
    methodTitle: "Three quiet steps. <em>No noise.</em>",
    steps: [
      { num: "i.", title: "The Conversation",
        text: "A private exchange, at your pace. We listen to how you live — your work, your evenings, the character you carry — until we understand what your wardrobe should be saying on your behalf." },
      { num: "ii.", title: "The Curation",
        text: "We walk the great houses for you and return with a shortlist measured against one thing only: your character. Never a trend, never a sales target — pieces that will still be right in ten years." },
      { num: "iii.", title: "The Companionship",
        text: "We stay beside you through the purchase and after it — trusted retailers, honest pricing counsel, care of the piece, and the next piece only when it truly belongs. You are advised for life, not for a sale." },
    ],
    quote: "\u201c You will not leave with more things.<br /><em>You will leave with the right ones.</em> \u201d",
    role: "Founder &amp; Curator",
    cta: "Begin the Conversation",
  },

  /* ------------------------------------------------------ the eyewear room */
  eyewear: {
    metaTitle: "A.z — The Eyewear",
    kicker: "The Eyewear",
    title: "Seen through,<br /><em>never seen trying.</em>",
    sub: "Two shapes, one house. Black acetate cut in Italy and Japan, a whisper of gold at the temple, and lenses dark enough to keep your own counsel.",
    meta: [
      { label: "House", value: "Gucci" },
      { label: "Lenses", value: "Category 3 — full UV protection" },
      { label: "Frames", value: "Polished acetate, interlocking G" },
    ],
    ctaOne: "View the Pieces",
    ctaTwo: "Speak to an Advisor",
    dragHint: "Drag to rotate",
    gridKicker: "The Vitrine",
    gridTitle: "Two shapes. <em>Discretion, and declaration.</em>",
    gridLead: "Select a piece to open its sheet",
    photo: "images/look.webp",
  },

  /* The markers on the salon photograph.
     x / y are percentages across the photograph. `small` draws the finer
     point used for the objets rather than the worn pieces.
     zoom is how far the camera pushes in when the marker is touched. */
  markers: [
    { key: "cap", label: "The Cap", x: 47.5, y: 21, zoom: 2.5,
      kicker: "Headwear", name: "Polo Ralph Lauren — Chino Sport Cap",
      note: "Washed navy chino, the pony picked out in yellow — the quiet sport of old money. Worn low, it closes the look without asking for attention.",
      img: "images/cap-navy.webp", link: "piece.html?id=0&c=headwear", cut: "images/holo-hat.webp" },

    { key: "watch", label: "The Timepiece", x: 53.5, y: 43.5, zoom: 3.2,
      kicker: "The Timepiece", name: "Swarovski — Era Journey Chrono",
      note: "Rose-gold case set with crystals around a black chronograph dial, on midnight leather. Swiss made — quiet sparkle, kept close.",
      img: "images/watch-era.webp", link: "piece.html?id=0&c=watches", cut: "images/holo-watch.webp" },

    { key: "bracelets", label: "The Wrist", x: 30, y: 57.5, zoom: 3.1,
      kicker: "The Wrist", name: "Pearls & Fine Gold",
      note: "A string of pearls beside a whisper of gold — nothing loud, everything considered. The kind of detail noticed only by those who know." },

    { key: "bag", label: "The Bag", x: 40, y: 73, zoom: 2.2,
      kicker: "The Crown Piece", name: "Armani Exchange — Logo Top-Handle",
      note: "Embossed logotype over pebbled black leather, carried by the top handle. The piece this whole look is built around.",
      link: "piece.html?id=1", cut: "images/holo-bag.webp" },

    { key: "parfum", label: "The Parfum", x: 83, y: 15, zoom: 3, small: true, edge: "r",
      kicker: "The Salon", name: "The Parfum Shelf",
      note: "A lacquered coffret beside a reed diffuser — the salon is scented before it is seen. Objets of the house, setting the air." },

    { key: "shelf", label: "The Display", x: 85, y: 42, zoom: 2.7, small: true, edge: "r",
      kicker: "The Salon", name: "The Display Shelf",
      note: "A quilted chain bag resting on collectors' volumes. Styling objets of our salon — pieces like these can be sourced on request." },

    { key: "eyewear", label: "The Eyewear", x: 80, y: 64.6, zoom: 2.9, vitrine: true, edge: "r",
      kicker: "The Eyewear", name: "Gucci — Rectangular Sunglasses",
      note: "The lit niche of the salon, kept for one piece at a time. Step through the glass.",
      link: "eyewear.html", glass: "images/look-back.webp" },

    { key: "vase", label: "The Blossom", x: 10, y: 56, zoom: 2.8, small: true, edge: "l",
      kicker: "The Salon", name: "Wild Blossom & Stone",
      note: "Spring branches in glazed stoneware — the quiet company the pieces keep. Nothing in the room raises its voice." },
  ],
};
