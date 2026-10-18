# Nathun Jewellers and Son – Website

## Run
1. Folder ko VS Code mein kholo (File > Open Folder).
2. `index.html` par right-click > **Open with Live Server** (ya sirf double-click karo, bina server ke bhi chalta hai).
   - Ya terminal: `python -m http.server 5500` -> http://localhost:5500

## Structure
nathun-jewellers/
├─ index.html                  page + header/footer
├─ css/style.css               orange light theme, mobile responsive
├─ js/
│  ├─ products.js              300 products (auto-generated)
│  ├─ i18n.js                  English + Hindi text
│  ├─ icons.js                 product drawings (SVG)
│  └─ app.js                   routing, filters, search, bag, language
├─ assets/
│  ├─ hero.mp4                 <- APNA VIDEO YAHAN RAKHO (girl with gold jewellery)
│  └─ products/                <- real photos: NJ-NK-001.jpg ...
└─ tools/generate_products.py  prices/products regenerate

## Hero video
`assets/hero.mp4` rakho (720p, muted, 5–10 sec loop, 5 MB se kam). Pexels/Pixabay se free video lo.
Video na ho to sunehri sparkle animation dikhta hai.

## Price / rate update
`tools/generate_products.py` ke top par RATE_PER_GRAM badlo, phir:  `python tools/generate_products.py`

## Real photos
Photo ka naam product code rakho (e.g. `NJ-NK-001.jpg`) -> `assets/products/` mein dalo -> script dobara chalao.
Product code popup mein dikhta hai.
