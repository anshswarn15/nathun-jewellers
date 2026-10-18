#!/usr/bin/env python3
"""
Generates js/products.js  (6 categories x 50 products = 300 products)
Only GOLD (22K / 18K) and SILVER (925) items. No diamonds / stones.

Run:  python tools/generate_products.py

Price = weight x today's rate x (1 + making charge).
-> Update the RATES below to today's rate and run the script again.
-> Real photos: put  assets/products/<PRODUCT-CODE>.jpg  (e.g. NJ-NK-001.jpg)
   and run the script again - the photo is picked up automatically.
"""
import json
import random
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "js" / "products.js"
PHOTO_DIR = ROOT / "assets" / "products"

# ---------------- EDIT THESE ----------------
RATE_PER_GRAM = {"gold22": 11500, "gold18": 9400, "silver": 140}  # Rs per gram (update!)
MAKING = {"gold22": 0.12, "gold18": 0.14, "silver": 0.22}         # making charge share
PER_CATEGORY = 50
GOLD_SHARE = 0.55          # ~55% gold, ~45% silver
# --------------------------------------------

random.seed(2026)

FREE = ["Free"]
RING = ["12", "14", "16", "18", "20"]
BANGLE = ["2.2", "2.4", "2.6", "2.8"]
def inch(*n): return [f'{x}"' for x in n]

# id, label_en, label_hi, short_en, short_hi, gold_g(min,max), silver_g(min,max), sizes
CATS = [
 ("head", "HD", "Head & Hair", "सिर और बाल", [
  ("crown", "Crown", "मुकुट", "Crown", "मुकुट", (45, 110), (90, 220), FREE),
  ("tiara", "Tiara", "तिआरा", "Tiara", "तिआरा", (25, 60), (50, 130), FREE),
  ("tikka", "Maang Tikka", "मांग टीका", "Maang Tikka", "मांग टीका", (4, 14), (8, 25), FREE),
  ("pasa", "Pasa", "पासा", "Pasa", "पासा", (6, 18), (12, 35), FREE),
  ("hairclip", "Hair Clip", "हेयर क्लिप", "Hair Clip", "हेयर क्लिप", (3, 9), (6, 18), FREE),
 ]),
 ("neck", "NK", "Neck", "गला", [
  ("choker", "Choker", "चोकर", "Choker", "चोकर", (20, 45), (35, 90), inch(14, 16)),
  ("collar", "Collar Necklace", "कॉलर नेकलेस", "Collar Necklace", "कॉलर नेकलेस", (25, 55), (40, 100), inch(15, 16, 17)),
  ("matinee", "Matinee Necklace", "मैटिनी नेकलेस", "Matinee Necklace", "मैटिनी नेकलेस", (18, 40), (30, 70), inch(20, 22, 24)),
  ("opera", "Opera Necklace", "ओपेरा नेकलेस", "Opera Necklace", "ओपेरा नेकलेस", (25, 60), (40, 110), inch(28, 32, 36)),
  ("rani", "Rani Haar", "रानी हार", "Rani Haar", "रानी हार", (60, 150), (100, 260), FREE),
  ("chain", "Chain", "चेन", "Chain", "चेन", (5, 30), (10, 50), inch(18, 20, 22, 24)),
  ("pendant", "Pendant", "पेंडेंट", "Pendant", "पेंडेंट", (2, 10), (3, 15), FREE),
 ]),
 ("ears", "ER", "Ears", "कान", [
  ("stud", "Studs", "स्टड्स", "Studs", "स्टड्स", (1, 4), (1.5, 5), FREE),
  ("hoop", "Hoops", "हूप्स", "Hoops", "हूप्स", (2, 8), (3, 12), ["Small", "Medium", "Large"]),
  ("dangle", "Dangles", "डैंगल्स", "Dangles", "डैंगल्स", (3, 9), (4, 14), FREE),
  ("chandelier", "Chandeliers", "चांदेलियर", "Chandelier Earrings", "चांदेलियर", (6, 16), (10, 28), FREE),
  ("jhumka", "Jhumkas", "झुमके", "Jhumka", "झुमका", (6, 20), (10, 32), ["Small", "Medium", "Large"]),
  ("earcuff", "Ear Cuffs", "ईयर कफ", "Ear Cuff", "ईयर कफ", (2, 7), (3, 10), FREE),
 ]),
 ("hands", "HW", "Hands & Wrists", "हाथ और कलाई", [
  ("engagement", "Engagement Rings", "सगाई की अंगूठी", "Engagement Ring", "सगाई की अंगूठी", (2.5, 7), (3, 9), RING),
  ("wedding", "Wedding Rings", "शादी की अंगूठी", "Wedding Ring", "शादी की अंगूठी", (3, 8), (4, 10), RING),
  ("cocktail", "Cocktail Rings", "कॉकटेल रिंग", "Cocktail Ring", "कॉकटेल रिंग", (4, 10), (5, 14), RING),
  ("band", "Band Rings", "बैंड रिंग", "Band Ring", "बैंड रिंग", (2, 6), (3, 8), RING),
  ("bracelet", "Bracelets", "ब्रेसलेट", "Bracelet", "ब्रेसलेट", (8, 30), (15, 50), ["16 cm", "18 cm", "20 cm"]),
  ("bangle", "Bangles (Pair)", "चूड़ियाँ (जोड़ी)", "Bangles", "चूड़ियाँ", (20, 60), (40, 110), BANGLE),
  ("kada", "Kadas", "कड़े", "Kada", "कड़ा", (20, 60), (40, 120), BANGLE),
  ("hathphool", "Hathphool", "हाथफूल", "Hathphool", "हाथफूल", (25, 60), (40, 110), FREE),
 ]),
 ("feet", "FT", "Feet & Ankles", "पैर और टखने", [
  ("anklet", "Anklets (Payal)", "पायल", "Payal Anklet", "पायल", (10, 35), (25, 80), inch(9, 10, 11)),
  ("toering", "Toe Rings (Bichhiya)", "बिछिया", "Toe Ring", "बिछिया", (1, 4), (2, 6), FREE),
 ]),
 ("body", "BF", "Body & Face", "शरीर और चेहरा", [
  ("nosepin", "Nose Pins", "नोज़ पिन (लौंग)", "Nose Pin", "नोज़ पिन", (0.3, 1.2), (0.5, 2), FREE),
  ("nosering", "Nose Rings (Nath)", "नथ", "Nose Ring", "नथ", (1, 5), (2, 8), FREE),
  ("waist", "Waist Chains (Tagdi)", "कमरबंद (तागड़ी)", "Waist Chain", "कमरबंद", (40, 110), (80, 200), inch(28, 32, 36, 40)),
  ("armlet", "Armlets (Bajuband)", "बाजूबंद", "Armlet", "बाजूबंद", (15, 45), (30, 90), FREE),
  ("brooch", "Brooches", "ब्रोच", "Brooch", "ब्रोच", (4, 14), (8, 25), FREE),
 ]),
]

STYLES = [
 ("Rajwadi", "राजवाड़ी"), ("Lakshmi", "लक्ष्मी"), ("Mayur", "मयूर"), ("Kamal", "कमल"),
 ("Pushpa", "पुष्पा"), ("Tara", "तारा"), ("Surya", "सूर्य"), ("Chandni", "चाँदनी"),
 ("Nakshi", "नक्शी"), ("Banarasi", "बनारसी"), ("Mughal", "मुग़ल"), ("Temple", "टेम्पल"),
 ("Bridal", "ब्राइडल"), ("Royal", "रॉयल"), ("Meera", "मीरा"), ("Shringar", "श्रृंगार"),
 ("Ganga", "गंगा"), ("Kalash", "कलश"), ("Keri", "केरी"), ("Phool", "फूल"),
 ("Mor", "मोर"), ("Hansa", "हंस"), ("Gulab", "गुलाब"), ("Chameli", "चमेली"),
 ("Sitara", "सितारा"), ("Rani", "रानी"), ("Maharani", "महारानी"), ("Devi", "देवी"),
 ("Kesari", "केसरी"), ("Sundari", "सुंदरी"), ("Noor", "नूर"), ("Aarohi", "आरोही"),
 ("Ishani", "ईशानी"), ("Kavya", "काव्या"), ("Anaya", "अनाया"), ("Riya", "रिया"),
 ("Tulsi", "तुलसी"), ("Ambar", "अंबर"), ("Madhuri", "माधुरी"), ("Heer", "हीर"),
]

METAL = {
 "gold22": dict(en="Gold", hi="गोल्ड", d_en="22K gold", d_hi="22 कैरेट सोने"),
 "gold18": dict(en="Gold", hi="गोल्ड", d_en="18K gold", d_hi="18 कैरेट सोने"),
 "silver": dict(en="Silver", hi="सिल्वर", d_en="925 sterling silver", d_hi="925 स्टर्लिंग चाँदी"),
}

def split_counts(n, k):
    base, rem = divmod(n, k)
    return [base + (1 if i < rem else 0) for i in range(k)]

def pick_metal():
    if random.random() < GOLD_SHARE:
        return "gold22" if random.random() < 0.7 else "gold18"
    return "silver"

def rnd_weight(lo, hi):
    w = random.uniform(lo, hi)
    return round(w, 2) if w < 3 else round(w, 1)

def photo_for(sku):
    for ext in ("jpg", "jpeg", "webp", "png"):
        if (PHOTO_DIR / f"{sku}.{ext}").exists():
            return f"assets/products/{sku}.{ext}"
    return None

categories, products = [], []
size_order = []

for cid, code, cen, chi, types in CATS:
    categories.append({
        "id": cid, "en": cen, "hi": chi,
        "types": [{"id": t[0], "en": t[1], "hi": t[2]} for t in types],
    })
    batch = []
    for t, cnt in zip(types, split_counts(PER_CATEGORY, len(types))):
        tid, _, _, sen, shi, grange, srange, sizes = t
        for s in sizes:
            if s not in size_order:
                size_order.append(s)
        for sty_en, sty_hi in random.sample(STYLES, cnt):
            m = pick_metal()
            lo, hi = grange if m.startswith("gold") else srange
            w = rnd_weight(lo, hi)
            price = int(round(w * RATE_PER_GRAM[m] * (1 + MAKING[m]) / 10.0) * 10)
            mm = METAL[m]
            batch.append({
                "cat": cid, "type": tid, "metal": m,
                "en": f"{sty_en} {mm['en']} {sen}",
                "hi": f"{sty_hi} {mm['hi']} {shi}",
                "weight": w, "price": price, "sizes": sizes,
                "descEn": f"A graceful {sen.lower()} crafted in {mm['d_en']} with a traditional {sty_en} design.",
                "descHi": f"{mm['d_hi']} से बना {sty_hi} डिज़ाइन का सुंदर {shi}।",
            })
    random.shuffle(batch)  # mix types -> natural "popularity" order
    for i, p in enumerate(batch, 1):
        p["id"] = f"NJ-{code}-{i:03d}"
        img = photo_for(p["id"])
        if img:
            p["img"] = img
        products.append(p)

# stable key order
keys = ["id", "cat", "type", "metal", "en", "hi", "weight", "price", "sizes", "descEn", "descHi", "img"]
lines = []
for p in products:
    lines.append("  " + json.dumps({k: p[k] for k in keys if k in p}, ensure_ascii=False, separators=(",", ":")))

js = (
    "/* AUTO-GENERATED by tools/generate_products.py - edit the script, not this file */\n"
    f"window.NJ_CATEGORIES = {json.dumps(categories, ensure_ascii=False, indent=1)};\n"
    f"window.NJ_SIZE_ORDER = {json.dumps(size_order, ensure_ascii=False)};\n"
    "window.NJ_PRODUCTS = [\n" + ",\n".join(lines) + "\n];\n"
)
OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(js, encoding="utf-8")

from collections import Counter
print(f"OK: {len(products)} products -> {OUT}")
print(Counter(p["cat"] for p in products))
print(Counter(p["metal"] for p in products))
assert len({p["id"] for p in products}) == len(products)
assert len({p["en"] for p in products}) == len(products), "duplicate names"
