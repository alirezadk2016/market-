# A.z — Private Luxury Advisory

A static, self-hosted-font luxury accessories catalogue with private enquiry links. No build step or package installation is required.

## Local preview

Serve this directory with a static web server and open index.html. For example: `python -m http.server 8766`.

## Structure

- `index.html`: editorial opening, collection discovery, services and enquiry.
- `range.html`: data-driven collection pages.
- `eyewear.html`: campaign and eyewear catalogue.
- `piece.html`: product details, variants, gallery and product-specific email enquiry.
- `advisory.html`: consultation approach.
- `admin.html`: catalogue/content workroom. Nothing publishes until its Publish action is used.
- `bags.js` and `content.js`: real catalogue and site copy.
- `fill.js`: shared chrome, mobile navigation and content binding.
- `script.js`: home catalogue, interactive scene and accessible quick view.
- `atelier.js`: search, house filters and the mobile-only action shelf.
- `styles.css` and `atelier.css`: base presentation and editorial design system.
- `admin.css` and `admin-atelier.css`: workroom styling.
- `PROJECT_DESIGN.md`: project-specific design decisions.

## Mobile and desktop

Desktop uses a wide editorial opening and split service layout. Phone screens use a compact opening, horizontal filters, a two-column product grid, contained product photography and a safe-area-aware bottom action shelf. Original campaign image proportions are preserved so interactive markers stay aligned.

## Imagery

Original product photographs stay in `images/`. `images/atelier-materials.webp` is an AI-generated editorial material study, not an actual workshop or a product listing photograph. It is used alongside service/advisory copy. See `IMAGE_CREDITS.md` for its prompt and provenance.

The birthday page and its exclusive media have been removed.

## Notes

Product impressions are stored locally on the current device; they are not sent to the house. Enquiry uses the configured address in `content.js`. Admin publishing settings and credentials must be configured separately; no credentials belong in source control.
