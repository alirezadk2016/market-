# A.z Spatial Salon

## Product and scope
Luxury accessories catalogue with personal guidance, real merchandise photos and editable email enquiries. Audience: design-conscious visitors browsing bags, eyewear, timepieces and headwear on desktop and phone. Existing static HTML/CSS/JS and canonical bags.js remain. Preserve URLs, anchors, A.z signature, four collections, catalogue filtering/variants, recently corrected product-photo containment and enquiry prefilling. Birthday remains removed.

## Existing read and confirmed direction
The owner explicitly selected dark cinematic spatial interaction and delegated design decisions and image creation. Production UI implementation mode; proceed autonomously within that confirmed direction. Existing source41f5248 has a strong integrated photographic entrance but only a flat camera transform. The bento collection grid and consecutive text/form splits flatten the rest of the experience. Phone navigation omits Advisory/Questions and the vertical collection stack is unnecessarily long.

Design read: an immersive private accessories gallery, with cinematic charcoal architecture, tactile photographic exhibits and fixed, legible editorial controls. DESIGN_VARIANCE8 / MOTION_INTENSITY8 in the entrance,4 elsewhere / VISUAL_DENSITY3. Native project styles remain; no framework migration or competing design system.

## References and originality
Spatial Sites supplies the requested interaction vocabulary: a navigable spatial product environment. Build original geometry and interaction rather than copying a paid template. The locally available Runway reference contributes disciplined media-first composition and unobtrusive chrome; retain A.z's identity, palette and current Archivo typography. No borrowed brand font/logo/copy.

## Visual roles
Gallery black#090c0e, charcoal#14191a, ivory#eeeae1, silver#b8bdb4, muted botanical-grey#a5af9e. Warm metal only as subtle environmental reflections/edges. The spatial entrance and quieter dark sections contrast with a warm ivory merchandise index and an emerald material vignette. Locally hosted Archivo variable, weights300–700, supplies display, body and utility text; the current upstream grotesque system supersedes the earlier Cormorant/Jost pairing. Use weight, scale and tracking for hierarchy; readable body14–16px, controls12px preferred. Thin structural rules, restrained1–2px corners, no decorative badges or fake social proof.

## Layout and scene
Real WebGL2 progressive enhancement: four photographic exhibits in an architectural gallery with actual perspective, neighbouring exhibits, matte floor and visible depth. Active exhibit sits right of fixed desktop copy; phone centres it below the title and above controls. Existing photographic entrance remains usable until first render and on WebGL/import/context failure. Local pinned Three.js with license. Cap device-pixel ratio and work only during visible motion/settling.

Below hero: a ruled ivory index of real merchandise, an emerald/silver material vignette, a compact horizontal advisory process that becomes a phone timeline, then the single enquiry form, compact FAQs and deliberate signature ending. Complete phone Menu with section and collection links. Keep browsing legible rather than rotating every form/card.

## Interaction contract
Keep one tested hero controller. Engine observes existing data-scene/data-playing/data-mouse-view plus pointer pose. Four chapter buttons and actual collection CTA; meaningful horizontal mouse drag changes exhibit on release, touch swipe changes chapter while vertical scrolling remains native. Mouse view On/Off, autoplay Pause/Play, keyboard selection and reset remain. Reduced motion starts static; explicit camera opt-in does not start autoplay. Hidden/offscreen/dialog states pause and release input. No scroll hijacking or cursor replacement.

Catalogue enhancements: true photo counts, Previous/Next, arrow keys and intentional horizontal swipe, plus a native full-photograph inspection dialog. Preserve original photos, colour selection, focus and Back position; reserve image frames before decoding. Do not invent rear product geometry or call this360merchandise scanning.

Enquiry: preserve field order/IDs and mail draft generation; add user-triggered Copy enquiry fallback. No message is sent automatically. Menu and photo viewer must trap focus through native dialogs, close on Escape and restore focus.

## New artwork
Earlier built-in imagegen originals cover a decorative advisory salon, material macro and wide/portrait headwear chapter. No brand names/logos, false location or product claims. Original masters/prompts are saved in outputs/luxury-upgrade-assets. The current architectural gallery reuses the eight existing wide/portrait hero photographs; the section-variety follow-up reuses five original merchandise photographs and images/studio-materials.webp. No new raster artwork is added. Actual catalogue photos stay in images/.

## Verification and acceptance
Compare before/after screenshots at1440desktop and390phone, plus320/360/768/900/1000responsive checks. Verify actual WebGL canvas/exhibit changes, drag/swipe/keyboard/chapter CTA, static/failure fallback, no idle render loop when paused, hidden/modal suspension, complete phone menu, snap collections, photo inspector navigation/close, colour/search/Back, email-prefill and Copy enquiry. Inspect assets/imports, parse all scripts, diff whitespace; meaningful motion/controller contracts. No horizontal overflow, missing completed images, clipped headings or hidden controls. Static content must remain visible if enhancement fails. Capture live production proof only after local visual QA and publication.

## Follow-up: five observed weaknesses to fix

Confirmed implementation direction,25October2026: the owner explicitly requested correction of the current visual and enquiry weaknesses. Current baseline is df5e58c. Keep the cinematic direction and improve its substance rather than adding effects.

- Replace freestanding picture frames and feet with a continuous architectural salon: photographic bays belong to real floor/wall depth, restrained warm light and quiet stone. Preserve the actual camera and gesture controls; do not invent scans of merchandise.
- Keep original stock photographs and colours intact. Unify their photographic chambers, subject scale, typography and surrounding palette so the catalogue belongs to the same brand as the entrance. A lighter inspection surface should be a deliberate material transition, not an arbitrary set of white rectangles.
- Utility text should normally be12px or larger and body text14–16px. Phone chapter controls use the full width; minimum touch targets remain44px. Readability and complete product photographs take precedence over decoration.
- Name A.z in the entrance and communicate what is selected. Use concrete collection and service language, the existing signature, charcoal/ivory tones and disciplined Archivo typography. No invented heritage, exclusive access, authenticity guarantees or premises.
- Let visitors review, copy and save a structured enquiry inside the site, with a web-email alternative to an installed mail app. Show exactly which details need individual confirmation. Do not label a local draft as submitted, invent fulfilment policies or send messages automatically.

Acceptance adds real variant-to-enquiry preservation, review/copy/download/web-compose paths and graceful fallback when clipboard or download support is unavailable. Inspect before/after photographs and architecture at phone and desktop sizes before publication.

## Section variety correction

Baseline9a01704 repeated the same category subjects between the spatial entrance and campaign covers, doubled a black-leather detail study, and repeated the advisory/enquiry slogan and oversized heading/photo composition. The owner requested a review of this lack of variety. Preserve the approved cinematic entrance while giving each subsequent section a different purpose and visual rhythm.

Sequence: dark spatial entrance → warm ivory, ruled index of real merchandise → one emerald/silver editorial material vignette → compact horizontal service process (phone timeline) → the single enquiry form. The index uses five original registry photographs and four real collection counts, with complete subjects and a simpler phone composition. The material study is decorative, not a product-material claim. Advisory carries no duplicate salon photo or enquiry headline. Native #house is an alias for the historical service section at #advisory; respect the existing document scroll padding without doubling it.

Use the existing native CSS and current Archivo system, distinct scoped section classes and no new application state. Check for collisions with legacy selectors: the new index base is az-collection-index, since collection-index is already an absolutely positioned legacy label. Preserve every catalogue, zoom, variant and enquiry path; validate all four index destinations and both new breakpoint layouts in the browser.

## Merged upstream preservation and current acceptance

Merge `3952080` preserves upstream canonical/favicon metadata, local Archivo typography, first-load scheduling and registry retailer links from `bc54737`. Inactive hero photographs hydrate only when selected, with the next scene warmed at idle. WebGL waits for page load and idle; Save-Data, 2g/slow-2g and reported memory/concurrency below four retain the complete photographic fallback. Retain keyboard activation before the enhancement starts, retained static drawing buffers and zero paused RAF after settling. Registry-provided usable HTTPS retailer links remain available in product details.

Current source suite: 49 passing contracts (24 hero, 7 catalogue, 12 spatial, 6 enquiry), including all previous 46 plus deferred hydration, deferred initialization/timer fallback and device/network gates. Static validation includes data-src/data-srcset dependencies. Root's current native browser matrix covers widths 320, 360, 390, 430, 768, 900, 1000, 1440 and 1920 with no horizontal or heading overflow. Final native QA and publication remain separate; see outputs/section-variety-review.md for the evidence and release boundary.
