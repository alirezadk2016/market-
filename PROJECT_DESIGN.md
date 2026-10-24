# A.z Atelier

Mode: taste_first_redesign. Design decisions delegated by the owner.

A private luxury advisory with four existing collections, editorial imagery, product detail pages and appointment enquiries. Preserve the real product registry, contact data, local fonts and admin editing workflow.

Direction: warm editorial boutique. Ivory paper, oxblood accents, clear sans-serif metadata and expressive Cormorant titles. The photographs and products carry the atmosphere. Avoid particle decoration, gatekeeping intro animations and unreadable microtype.

Reference principles: Apple for product-first restraint; Spatial Sites for spatial product exploration and purposeful motion. Original implementation only; no commercial kit source or media imported.

Home: editorial split opening with larger interactive photograph; quiet house strip; staggered collection gallery; two-column mobile product discovery; contrasting curator quotation and a clear enquiry close. Extend shared typography, navigation, surfaces and accessibility across collection, eyewear, advisory and detail pages. Admin remains the existing operational tool.

Motion: restrained image transitions; preserve explicit hotspot and photograph flip interactions. Normal wheel scrolling must remain available. Reduced motion removes transitions. All products remain discoverable without hover.

Verification: compare desktop/mobile screenshots, verify collection routes, product variants, mobile navigation, keyboard focus, missing assets and JavaScript errors. Do not claim the live deployment changed until GitHub publication and deployment are verified.

## Collection workroom

Admin intent: the curator finds, edits and prepares real pieces. Product editing leads; collection metadata sits in a native disclosure. Domain: vitrine, provenance, house, colour, catalogue, appointment. Materials: ivory paper, warm stone, oxblood leather, faded rose, ink. Signature: the house's product photographs become the working catalogue. Avoid a generic metrics dashboard, dark terminal chrome and marketing-scale titles on form fields.

Admin hierarchy: 46px Cormorant collection title, 30px section titles, 14px Jost body, 10–12px metadata. A 238px sidebar supports a flexible product workspace. Three product columns on desktop, two on smaller desktop and one on phone. Controls are at least 40px high (44px fields), inset paper inputs, thin warm borders, one oxblood primary action. The edit sheet has keyboard focus containment, background inertness and focus restoration; labels are available to assistive technology. No publishing credentials, collection contents or repository settings are changed by the design.


## Final scope and phone-specific design

The birthday experience and its exclusive media were removed at the owner's request. Public commerce/advisory surfaces are the scope.

Phone: a safe-area-aware bottom action shelf, compact two-line opening, portrait imagery, horizontally scrollable house filters, a two-column product edit, square contained product images and direct product-specific enquiry links. Desktop keeps the wide editorial composition, staggered collection gallery and split photograph/method section.

New image: images/atelier-materials.webp is an AI-generated editorial material study, used as atmosphere alongside service and advisory copy. It is not a product photograph, an actual studio photograph or evidence of craftsmanship. Original product and campaign images remain. Generated with the built-in imagegen tool; compressed to WebP for delivery.

## Product browsing continuity

Catalogue filters live in the URL as house and q parameters, preserving the collection parameter and anchor. Returning from a product restores the previous edit instead of clearing the visitor's selection. Product photography has labelled 44px previous/next controls, a tabular photo counter, thumbnail selection and arrow-key navigation within the gallery. Single-photo variants hide redundant controls. Changing colour resets the photograph index.

Brand information is opened by a native button with an expanded state. Details/dimensions and provenance/service use native disclosures: initially closed on phones and open on desktop, with user choices preserved until navigation/reload. This keeps the phone page concise without removing product information.

## Enquiry and trust

A two-column desktop enquiry becomes a single-column phone brief. Collection and optional preferences generate an editable mailto draft; no form submission or automatic message is implied. Native FAQ disclosures are driven by SITE.faq and editable in the existing admin content editor. Footer utility links aid return navigation. The branded 404 document uses root-relative links for nested missing addresses.

Product colour is preserved in the URL and in dynamic share links. Local impressions are now explicitly private notes, collapsed by default, with optional ratings (never invented five-star scores), bounded compressed attachments, removable notes and truthful storage-failure feedback. Existing local notes retain compatible storage keys.
