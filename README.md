# MAISON — The Handbag Edit (demo)

A single-page, English, quiet-luxury showcase for a handbag collection.
**No prices, no links — just the bags.** Warm nude / ivory palette.

## Run
Open `index.html` in a browser. No build, no dependencies.

## Add the photos
Put each product image in `images/` using the exact filenames listed in
[`images/README.md`](images/README.md). Each photo replaces its placeholder
automatically — no code changes needed.

## Files
| File | Purpose |
|------|---------|
| `index.html` | Page structure (hero, gallery, footer) |
| `styles.css` | Luxury nude palette + layout |
| `bags.js`    | The 15 bags: filename, name, note, tag (edit freely) |
| `script.js`  | Builds the grid, reveals on scroll, handles missing photos |
| `images/`    | Drop product photos here |

## Customize
- **Brand name/logo**: replace `MAISON` and the `M` mark in `index.html` / `styles.css`.
- **Bag labels**: edit the `BAGS` array in `bags.js`.
