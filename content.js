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
    eyebrow: "A.z · The private edit",
    title: "Your next<br />signature.",
    sub: "A personal edit of bags, eyewear and everyday essentials. Selected with you in mind.",
    ctaOne: "Explore the edit",
    ctaTwo: "Our approach ↗",
    sign: "Curated personally — <em>A.z</em>",
    hint: "Touch a marker · turn the plate",
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

  /* The navigation, used by the top bar and the full-screen phone menu on
     every page. An href that starts with "#" points at a section of the home
     page: on any other page it is rewritten to index.html#… automatically. */
  nav: [
    { label: "Collection", href: "#collection" },
    { label: "The Eyewear", href: "eyewear.html" },
    { label: "The Advisory", href: "advisory.html" },
    { label: "Enquire", href: "#enquire" },
  ],

  vitrine: {
    kicker: "The Vitrine",
    title: "Find your everyday.",
    lead: "Select a collection",
  },

  collection: {
    index: "01",
    title: "The handbag edit",
    lead: "Explore the shapes, colours and houses in our current selection.",
  },

  service: {
    index: "02",
    title: "The Service",
    lead: "How A.z works.",
  },

  enquire: {
    index: "03",
    title: "Considering a piece?<br /><em>Let us advise you.</em>",
    sub: "Private consultations by appointment. Tell us what you are drawn to — we will guide you to the right piece and source it for you.",
    whatsapp: "",
    instagram: "",
    email: "alirezadk2020@gmail.com",
  },

  /* the three columns under "The Service" */
  pillars: [
    { num: "01", title: "Curated, Not Sold",
      text: "Explore a selection of pieces from established houses, chosen for their shape, material and everyday use." },
    { num: "02", title: "Personal Guidance",
      text: "Tell us about your wardrobe and what you need. We will help you compare the details." },
    { num: "03", title: "By Appointment",
      text: "Take time to find your piece. Speak with an advisor about availability, colour and the next steps." },
  ],
  houseCta: "How We Help — The Full Method",

  faq: [
    { question: "Can I purchase directly on this website?", answer: "This is a curated catalogue with personal advice, rather than an online checkout. Use the enquiry link on a piece to begin the conversation." },
    { question: "Can I ask about a particular colour?", answer: "Yes. Select a colour on the product page. Its enquiry link includes the piece and your selected colour in an editable email draft." },
    { question: "What should I include in my enquiry?", answer: "A piece you like, a preferred colour, an occasion or the kind of advice you need is a useful starting point. You can add as much or as little detail as you wish." },
    { question: "How is an email enquiry sent?", answer: "Email enquiry links open your email app. Review the draft and send it there. The website does not send a message automatically." },
  ],

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
      { num: "01", title: "The Conversation",
        text: "A private exchange, at your pace. We listen to how you live — your work, your evenings, the character you carry — until we understand what your wardrobe should be saying on your behalf." },
      { num: "02", title: "The Curation",
        text: "We walk the great houses for you and return with a shortlist measured against one thing only: your character. Never a trend, never a sales target — pieces that will still be right in ten years." },
      { num: "03", title: "The Companionship",
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
    ctaTwo: "Ask an advisor",

    /* the campaign plate that opens the room */
    campaign: "images/look-back.webp",
    campaignAlt: "The A.z campaign — Gucci rectangular sunglasses",
    campaignLabel: "The Campaign — A.z",
    campaignHouse: "Gucci",
    campaignPiece: "Rectangular Sunglasses",
    campaignCut: "images/gg-rect.webp",
    campaignCutKicker: "The piece itself",
    campaignCutLine: "See the pair",
    gridKicker: "The Vitrine",
    gridTitle: "Two shapes. <em>Discretion, and declaration.</em>",
    gridLead: "Select a piece",
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
