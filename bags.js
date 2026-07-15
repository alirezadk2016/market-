/* ------------------------------------------------------------------
   Handbag list — demo
   Drop the matching photo into  images/<file>  and it appears here.
   Everything is editable: change name / note freely.
   (No prices, no links — showcase only.)
------------------------------------------------------------------- */

const BAGS = [
  // ---- zalando.dk (brand identified from the link) ----
  { file: "images/liu-jo-black.jpg",             name: "Liu Jo",           note: "Nero · Structured handbag",        tag: "Signature" },
  { file: "images/liu-jo-cream.jpg",             name: "Liu Jo",           note: "Cream · Structured handbag",       tag: "New" },
  { file: "images/coccinelle-jellyfish.jpg",     name: "Coccinelle",       note: "Jellyfish · Handbag",              tag: "Editorial" },
  { file: "images/coccinelle-me-lock-black.jpg", name: "Coccinelle Me Lock", note: "Noir · Shoulder bag",            tag: "Icon" },
  { file: "images/ax-sussy-saddle-sand.jpg",     name: "Armani Exchange",  note: "Sussy Saddle · Sand",              tag: "Shoulder" },
  { file: "images/ax-black.jpg",                 name: "Armani Exchange",  note: "Black · Handbag",                  tag: "Classic" },
  { file: "images/ax-shopping-black.jpg",        name: "Armani Exchange",  note: "Shopping · Black tote",            tag: "Everyday" },

  // ---- zalando-lounge.dk (article codes — rename once photos are in) ----
  { file: "images/lounge-ZZO3U1B38.jpg", name: "Signature Handbag", note: "Ref. ZZO3U1B38", tag: "Limited" },
  { file: "images/lounge-6CA51H1G9.jpg", name: "Signature Handbag", note: "Ref. 6CA51H1G9", tag: "Limited" },
  { file: "images/lounge-ZZO3EWT75.jpg", name: "Signature Handbag", note: "Ref. ZZO3EWT75", tag: "Limited" },
  { file: "images/lounge-ZZO310C76.jpg", name: "Signature Handbag", note: "Ref. ZZO310C76", tag: "Limited" },
  { file: "images/lounge-ZZO3U1B44.jpg", name: "Signature Handbag", note: "Ref. ZZO3U1B44", tag: "Limited" },
  { file: "images/lounge-6CA51H1GC.jpg", name: "Signature Handbag", note: "Ref. 6CA51H1GC", tag: "Limited" },
  { file: "images/lounge-TO151H212.jpg", name: "Signature Handbag", note: "Ref. TO151H212", tag: "Limited" },
  { file: "images/lounge-6CA51H1JS.jpg", name: "Signature Handbag", note: "Ref. 6CA51H1JS", tag: "Limited" },
];
