✨ Nathun Jewellers & Sons

Timeless Elegance. Trusted Craftsmanship. A Legacy of Gold.

A modern, responsive jewellery website designed for Nathun Jewellers & Sons, a jewellery store located in Rajdhanwar, Jharkhand, India. The website combines a premium shopping experience with an elegant gold-inspired design, multilingual support, and a dynamic jewellery catalogue.

⸻

🌟 Features

* Elegant Design — A premium, gold-inspired interface with a warm, sophisticated colour palette.
* Responsive Layout — Optimised for desktop, tablet, and mobile devices.
* Dynamic Product Catalogue — 300 automatically generated jewellery products.
* Search & Filters — Easily discover jewellery using product search and filtering options.
* Bilingual Experience — Switch between English and Hindi.
* Interactive Shopping Bag — Add products to your bag and explore your selections.
* Animated Hero Section — Supports a background video with a golden sparkle animation fallback.
* Product Identification — Each product has a unique code for easy identification.
* Automated Product Generation — Regenerate product listings and prices using a Python script.

⸻

🛠️ Tech Stack

Technology	Purpose
HTML5	Website structure
CSS3	Styling, animations, and responsive design
JavaScript	Product catalogue, search, filters, and interactions
Python	Product and price generation
SVG	Custom jewellery illustrations

⸻

🚀 Getting Started

Prerequisites

Make sure you have the following installed:

* Visual Studio Code
* Live Server Extension (optional)
* Python 3 (required only for the product-generation script or Python HTTP server)

Installation

1. Clone the repository

git clone https://github.com/anshswarn15/nathun-jewellers.git

2. Navigate to the project directory

cd nathun-jewellers

3. Open the project in VS Code

code .

4. Launch the website

Choose either option:

Option A — Live Server

Open index.html, right-click, and select Open with Live Server.

Option B — Python HTTP Server

Run the following command from the project root:

python3 -m http.server 5500

Open your browser and visit:

http://localhost:5500

Note: The website can also be opened directly by double-clicking index.html. However, using a local server is recommended for a more reliable development experience.

⸻

📁 Project Structure

nathun-jewellers/
│
├── index.html                  # Main website page
├── css/
│   └── style.css               # Styling, theme, and responsive layout
│
├── js/
│   ├── products.js             # Generated jewellery catalogue
│   ├── i18n.js                 # English and Hindi translations
│   ├── icons.js                # Custom SVG illustrations
│   └── app.js                  # Application logic and interactions
│
├── assets/
│   ├── hero.mp4                # Optional hero background video
│   └── products/               # Jewellery product photographs
│
├── tools/
│   └── generate_products.py    # Product and price generation script
│
└── README.md                   # Project documentation

⸻

🎬 Customising the Hero Section

Give the homepage a premium look with a short jewellery-themed background video.

Video requirements:

* Location: assets/hero.mp4
* Resolution: 720p recommended
* Duration: 5–10 seconds
* Format: MP4
* Playback: Muted, looping video
* File size: Under 5 MB recommended

Choose a high-quality video featuring gold jewellery, elegant models, or jewellery craftsmanship.

Free stock footage is available from:

* Pexels
* Pixabay

If the video is unavailable, the website can display its golden sparkle animation instead.

⸻

💰 Updating Gold Prices

Product prices can be regenerated using the Python script.

Step 1: Open:

tools/generate_products.py

Step 2: Update the RATE_PER_GRAM variable near the top of the script.

Step 3: Run:

python3 tools/generate_products.py

The script regenerates the product catalogue using the updated configuration.

Important: Verify the pricing formula and any making charges, taxes, or other applicable costs in the script before publishing updated prices.

⸻

📸 Adding Real Jewellery Photographs

Replace placeholder illustrations with actual jewellery photographs to create a more realistic shopping experience.

Step 1: Place your product image inside:

assets/products/

Step 2: Name the image using the corresponding product code.

Example:

assets/products/NJ-NK-001.jpg

Step 3: Run the product-generation script again if required by the current implementation.

Step 4: Refresh the website and verify that the photograph appears correctly.

Image Guidelines

* Use clear, high-resolution product photographs.
* Keep image dimensions and aspect ratios consistent.
* Use the correct product code to associate each photograph with its product.
* Optimise image sizes for faster page loading.
* Use JPG, PNG, or WebP according to the application’s image-loading logic.

Tip: Product codes are displayed in the product popup, making it easier to identify the correct image for each item.

⸻

🌐 Language Support

The website supports two languages:

* 🇬🇧 English
* 🇮🇳 Hindi

Translation strings are maintained in:

js/i18n.js

Update this file when adding or modifying translated interface text.

⸻

📱 Responsive Experience

The website is designed to provide a consistent experience across different screen sizes, including:

* Desktop computers
* Laptops
* Tablets
* Mobile phones

For the best results, test the layout on multiple screen sizes before deployment.

⸻

🔮 Future Improvements

Potential enhancements include:

* Integration with a backend and database.
* Customer accounts and order management.
* Product inventory management.
* Real-time gold-rate integration.
* WhatsApp enquiry and ordering support.
* Secure payment gateway integration.
* Product administration dashboard.
* SEO optimisation and performance improvements.

⸻

📍 About Nathun Jewellers & Sons

Nathun Jewellers & Sons is a jewellery business based in Rajdhanwar, Jharkhand, India.

This website aims to establish a strong digital presence for the brand through elegant presentation, accessible product discovery, and a seamless browsing experience.

⸻

👨‍💻 Developer

Developed with ❤️ to bring traditional jewellery craftsmanship into the digital world.

Repository: anshswarn15/nathun-jewellers

⸻

<p align="center">
  <strong>Nathun Jewellers & Sons</strong><br>
  <em>Tradition in Every Detail. Elegance in Every Design.</em>
</p>
