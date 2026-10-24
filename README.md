# A.z · The Night Salon

Static luxury catalogue for https://market-one-indol.vercel.app/. No build step or package installation is required. Serve the repository root.

The entrance is an animated photographic sequence for Bags, Eyewear and Timepieces. Separate wide and portrait editorial images have integrated physical lighting/contact; category CTAs open the real collection. Slow camera movement, decoded crossfades, actual chapter progress, manual selection and visible Pause/Play work without a video or WebGL dependency. Manual interaction pauses the sequence. Motion suspends when offscreen, hidden or covered by a native dialog, and follows reduced-motion preferences.

The gallery continues through four collections, original product photography, variants, House/Colour refinements, multiword search, personal advisory, editable email enquiry and FAQs. Phone uses a distinct composition and full-screen catalogue. Prices and availability require an enquiry; the site does not send a message.

`bags.js` remains the canonical catalogue registry and admin publishing source. Product photographs remain in `images/`; editorial graphics/fonts are in `assets/`. `salon.js` handles the cinematic entrance plus preserved enquiry/details APIs; `cinema.css` owns its presentation; `salon-sections.js` and `catalogue.css` handle catalogue browsing and old bookmarks. Old range/piece/eyewear/advisory addresses open the appropriate new view, retaining zero-based indexes and colour.

Generated hero and collection artwork is original unbranded decorative photography, not a specific catalogue model, official brand campaign or actual premises. Original goods photos and details remain unchanged. Full image provenance is in IMAGE_CREDITS.md. This is animated photographic art direction, not full 3D merchandise scanning.

Validation: all active files resolve, scripts parse and diff whitespace checks pass. Three scenes checked at 360/390/768/900/1000/1440/1920 widths without horizontal overflow, with controls within the hero and correct portrait/wide sources. Autoplay, Pause/Play, exact frozen photo/progress on pause, rapid/manual selection, native collection opening, modal/offscreen suspension and keyboard navigation checked in browser. Six additional VM contracts cover reduced-motion state, stale decode, remaining-time transient holds, pointer-focus Pause race, keyboard resume and failed-image preservation. Physical iOS/Android and browser/OS reduced-motion emulation were not exercised.
