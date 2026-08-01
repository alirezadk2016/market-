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

  footer: {
    note: "Private luxury advisory — curated pieces, personal guidance, discreet service. By appointment.",
    copy: "© A.z — By Appointment · Curated personally, piece by piece",
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
