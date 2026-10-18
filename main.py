"""
Nathun Jewellers and Son – FastAPI backend
Run:  uvicorn main:app --reload
"""

from fastapi import FastAPI, Request, Query, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from typing import Optional, List

# ---------- load product data ----------
from data.products_data import CATEGORIES, PRODUCTS, SIZE_ORDER

app = FastAPI(
    title="Nathun Jewellers and Son",
    description="Gold & Silver Jewellery – Amar Chowk, Rajdhanwar, Jharkhand",
    version="1.0.0",
)

# ---------- static files & templates ----------
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

# ---------- build search index ----------
METALS = {
    "gold22": {"kind": "gold",   "purity": "g22"},
    "gold18": {"kind": "gold",   "purity": "g18"},
    "silver": {"kind": "silver", "purity": "s925"},
}
SYN = {"gold": " sona sona", "silver": " chandi chandi"}

cat_by_id  = {c["id"]: c for c in CATEGORIES}
type_by_id = {}
for c in CATEGORIES:
    for t in c["types"]:
        type_by_id[t["id"]] = t

for p in PRODUCTS:
    m = METALS[p["metal"]]
    p["_search"] = " ".join([
        p["en"], p["hi"],
        type_by_id[p["type"]]["en"], type_by_id[p["type"]]["hi"],
        cat_by_id[p["cat"]]["en"],  cat_by_id[p["cat"]]["hi"],
        p["id"], m["kind"], SYN[m["kind"]],
        "22k" if p["metal"] == "gold22" else ("18k" if p["metal"] == "gold18" else "925"),
    ]).lower()

# ---------- price buckets ----------
BUCKETS = [
    {"id": "b1", "min": 0,      "max": 5000},
    {"id": "b2", "min": 5000,   "max": 15000},
    {"id": "b3", "min": 15000,  "max": 50000},
    {"id": "b4", "min": 50000,  "max": 150000},
    {"id": "b5", "min": 150000, "max": float("inf")},
]


# ===================================================================
#  FRONTEND  – serve the SPA shell
# ===================================================================
@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse(request, "index.html")


# ===================================================================
#  API ROUTES
# ===================================================================

@app.get("/api/categories")
async def get_categories():
    """Return all jewellery categories with their types."""
    return {"categories": CATEGORIES, "size_order": SIZE_ORDER}


@app.get("/api/products")
async def get_products(
    cat:   Optional[str]       = Query(None, description="Filter by category id"),
    type_: Optional[str]       = Query(None, alias="type", description="Filter by product type id"),
    metal: Optional[List[str]] = Query(None, description="Filter by metal"),
    price: Optional[List[str]] = Query(None, description="Filter by price bucket id"),
    size:  Optional[List[str]] = Query(None, description="Filter by size"),
    q:     Optional[str]       = Query(None, description="Full-text search"),
    sort:  str                 = Query("pop", description="pop | pa | pd | wa | wd"),
    skip:  int                 = Query(0, ge=0),
    limit: int                 = Query(24, ge=1, le=200),
):
    """Filtered, sorted, paginated product listing."""
    results = list(PRODUCTS)

    if cat:
        results = [p for p in results if p["cat"] == cat]
    if type_:
        results = [p for p in results if p["type"] == type_]
    if metal:
        results = [p for p in results if p["metal"] in metal]
    if size:
        results = [p for p in results if any(s in size for s in p["sizes"])]
    if price:
        def in_bucket(p):
            return any(
                b["id"] in price and p["price"] >= b["min"] and p["price"] < b["max"]
                for b in BUCKETS
            )
        results = [p for p in results if in_bucket(p)]
    if q:
        toks = q.lower().split()
        results = [p for p in results if all(t in p["_search"] for t in toks)]

    if sort == "pa":
        results.sort(key=lambda p: p["price"])
    elif sort == "pd":
        results.sort(key=lambda p: p["price"], reverse=True)
    elif sort == "wa":
        results.sort(key=lambda p: p["weight"])
    elif sort == "wd":
        results.sort(key=lambda p: p["weight"], reverse=True)

    total = len(results)

    def clean(p):
        return {k: v for k, v in p.items() if not k.startswith("_")}

    return {
        "total":    total,
        "skip":     skip,
        "limit":    limit,
        "products": [clean(p) for p in results[skip: skip + limit]],
    }


@app.get("/api/products/{product_id}")
async def get_product(product_id: str):
    """Return a single product by code (e.g. NJ-HD-001)."""
    for p in PRODUCTS:
        if p["id"] == product_id:
            return {k: v for k, v in p.items() if not k.startswith("_")}
    raise HTTPException(status_code=404, detail=f"Product '{product_id}' not found")


@app.get("/api/buckets")
async def get_buckets():
    """Return price bucket definitions."""
    safe = []
    for b in BUCKETS:
        safe.append({"id": b["id"], "min": b["min"],
                     "max": None if b["max"] == float("inf") else b["max"]})
    return {"buckets": safe}


# ===================================================================
#  Catch-all – SPA client-side routing support
# ===================================================================
@app.get("/{full_path:path}", response_class=HTMLResponse, include_in_schema=False)
async def spa_fallback(request: Request, full_path: str):
    if "." in full_path.split("/")[-1]:
        raise HTTPException(status_code=404)
    return templates.TemplateResponse(request, "index.html")
