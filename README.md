# A.z · The Night Salon

Static luxury accessories catalogue for https://market-one-indol.vercel.app/. Serve the repository root over HTTP; no build step or package installation is required. The optional spatial entrance uses a locally pinned Three.js module, so it does not depend on a third-party runtime CDN.

## The spatial salon

Four chapters introduce Bags, Eyewear, Timepieces and Headwear. On supported browsers, WebGL2 adds an original architectural gallery with actual perspective geometry, photographic exhibits, neighbouring frames, a matte floor and controlled lighting. This is a three-dimensional gallery of decorative photographs, not a scan or a reconstructed three-dimensional model of the merchandise.

The HTML photographic entrance remains visible until the first successful WebGL render. It also supplies the usable fallback for unsupported WebGL2, module/texture/shader errors and context loss. Wide and separately composed portrait assets keep the fallback suitable for desktop and phone. Chapter controls, keyboard navigation and the real catalogue CTA remain semantic HTML.

Mouse movement changes the camera; dragging turns the gallery and a deliberate horizontal release selects the next or previous chapter. Clicking an active artwork opens its real collection, while clicking a neighbouring artwork selects that chapter. Touch swipes change chapters without replacing native vertical scrolling. Normal arrow keys choose chapters, Shift+arrows adjust the camera, Enter/Space open the focused gallery's current collection, and Escape or Reset view recentres the camera. Mouse view On/Off controls deliberate camera input independently from automatic playback.

Autoplay advances every 8.5 seconds with actual chapter progress. Manual chapter selection pauses the sequence; hovering holds its remaining time. The renderer retains its last static drawing buffer, redraws on reveal/focus/resize, caps device-pixel ratio, suspends when hidden/offscreen or covered by a native dialog, and stops scheduling frames once a paused scene has settled. Reduced motion starts static; explicit camera opt-in does not enable autoplay.

## Collections and personal guidance

Below the entrance, staggered desktop exhibits become a native horizontal snap rail on phones. Collection names and counts remain available in the rail navigation. Original material and salon artwork support a photographic editorial chapter, personal advisory, an enquiry letter, native FAQs and the signature footer. The phone Menu includes every main section and all four collection destinations.

The native collection browser preserves original merchandise photographs, colours, House/Colour refinements, multiword search and stable product/Back browsing. Detail photographs reserve their frame before decoding, preventing portrait images from expanding the grid or cropping the item. Photo counts, Previous/Next controls, keyboard navigation and intentional horizontal touch swipes follow the existing thumbnail selection. A native full-photograph dialog adds 2× zoom and panning with independent Close/focus restoration.

Enquiries remain editable email drafts. Choosing a piece prefills its model and colour; the enquiry form supports a user-triggered Copy enquiry action and a selectable-text fallback when clipboard access is unavailable. The site does not send a message automatically. Current price and availability are confirmed through an enquiry.

## Source and assets

- `bags.js` remains the canonical catalogue registry and admin publishing source; original goods photos remain in `images/`.
- `salon.js` owns chapter/playback/input state and the preserved enquiry/details APIs. `cinema.css` presents the semantic photographic entrance.
- `spatial-gallery.js` and `spatial-gallery.css` progressively enhance that same state with the WebGL2 gallery.
- `salon-sections.js` and `catalogue.css` handle collection browsing, variants, enquiries and the preserved legacy addresses. `catalogue-enhancements.js` adds photograph inspection.
- `salon-luxury.css` and `salon-luxury.js` provide the editorial sections, phone menu, collection rail and copy fallback.
- `assets/vendor/three-r180/` contains the pinned Three.js revision 180 modules and their [MIT license](assets/vendor/three-r180/LICENSE).

Old range/piece/eyewear/advisory bookmarks retain zero-based product indexes and exact colours. Birthday remains removed.

Generated artwork is original, unbranded decorative photography. It does not identify a specific catalogue model, official brand campaign, supplier or actual A.z premises. Original goods photographs and details remain unchanged. See [IMAGE_CREDITS.md](IMAGE_CREDITS.md) and [PROJECT_DESIGN.md](PROJECT_DESIGN.md). The owner's deliverable archive `outputs/luxury-upgrade-assets/` contains all four new PNG masters, full generation prompts, integrated WebP exports and a dimensions/byte-size manifest.

## Verification

Current automated coverage is 37 contracts: 23 hero state/input contracts, 5 catalogue photograph/viewer contracts and 9 actual-source spatial-engine contracts. The latter import the pinned Three.js scene implementation while controlling rendering and browser state through test doubles; rendered pixels are assessed separately in the browser.

Native browser checks cover mouse dragging and artwork selection, phone photograph inspection/zoom, complete phone Menu navigation, enquiry prefilling/copy, FAQ disclosure, original catalogue search/colours/Back and the phone collection rail. Responsive checks at 320×568, 360×640, 390×844, 430×932, 768×1024, 900×900, 1000×800, 1440×900 and 1920×1080 show no horizontal overflow, four fitting chapter labels and a hero CTA within the viewport. Product variants retain their reserved square frame. A separate no-WebGL-engine preview confirms the fourth Headwear fallback image and its catalogue CTA. Scripts parse and whitespace checks pass. Physical iOS/Android devices and OS-level reduced-motion settings were not exercised; reduced-motion and failure/cleanup behaviour are covered by the automated contracts. Release identifiers and live production proof are recorded in the owner's production release notes after publication.
