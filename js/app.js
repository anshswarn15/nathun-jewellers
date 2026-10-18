/* Nathun Jewellers and Son – main app (no framework, no build step) */
(function () {
  "use strict";

  var CATS = window.NJ_CATEGORIES, PRODUCTS = window.NJ_PRODUCTS, SIZE_ORDER = window.NJ_SIZE_ORDER, I18N = window.I18N;
  var PAGE = 24;
  var PHONES = [
    { key: "raj", label: "99555 57756", tel: "+919955557756" },
    { key: "ashok", label: "99395 81665", tel: "+919939581665" }
  ];
  var METALS = {
    gold22: { kind: "gold", purity: "g22" },
    gold18: { kind: "gold", purity: "g18" },
    silver: { kind: "silver", purity: "s925" }
  };
  var BUCKETS = [
    { id: "b1", min: 0, max: 5000 }, { id: "b2", min: 5000, max: 15000 }, { id: "b3", min: 15000, max: 50000 },
    { id: "b4", min: 50000, max: 150000 }, { id: "b5", min: 150000, max: Infinity }
  ];
  var SYN = { gold: " sona सोना", silver: " chandi चांदी" };

  /* ---------- helpers ---------- */
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) { /* ignore */ } }
  };
  var nf = new Intl.NumberFormat("en-IN");
  function inr(n) { return "₹" + nf.format(n); }

  var lang = store.get("nj_lang") === "hi" ? "hi" : "en";
  function tr(k) { return (I18N[lang] && I18N[lang][k]) || I18N.en[k] || k; }
  function pick(o) { return o[lang] || o.en; }
  function sizeLabel(s) { return I18N[lang]["sz_" + s] || s; }

  var byId = {}, catById = {}, typeById = {};
  CATS.forEach(function (c) { catById[c.id] = c; c.types.forEach(function (t) { typeById[t.id] = t; }); });
  PRODUCTS.forEach(function (p) {
    byId[p.id] = p;
    var m = METALS[p.metal];
    p._h = [p.en, p.hi, typeById[p.type].en, typeById[p.type].hi, catById[p.cat].en, catById[p.cat].hi, p.id, m.kind, SYN[m.kind],
      p.metal === "gold22" ? "22k" : p.metal === "gold18" ? "18k" : "925"].join(" ").toLowerCase();
  });

  var app = $("#app");
  var route = { name: "home" };
  var filters, sort, shown, base;
  var stopGlitter = null;
  var toastTimer;

  /* ---------- static text ---------- */
  function applyStatic() {
    document.documentElement.lang = lang;
    $$("[data-i18n]").forEach(function (el) { el.textContent = tr(el.getAttribute("data-i18n")); });
    $$("[data-i18n-ph]").forEach(function (el) { el.placeholder = tr(el.getAttribute("data-i18n-ph")); });
    $$("[data-i18n-aria]").forEach(function (el) { el.setAttribute("aria-label", tr(el.getAttribute("data-i18n-aria"))); });
    var lb = $("#langBtn"); lb.textContent = tr("langBtn"); lb.setAttribute("aria-label", tr("langAria"));
    $("#bagBtn").setAttribute("aria-label", tr("bag"));
    $("#yr").textContent = new Date().getFullYear();
  }

  /* ---------- locking / overlays ---------- */
  function syncLock() {
    var b = document.body;
    b.classList.toggle("lock", b.classList.contains("nav-open") || b.classList.contains("bag-open") || !$("#modal").hidden);
  }
  function closeNav() { document.body.classList.remove("nav-open"); $("#menuBtn").setAttribute("aria-expanded", "false"); syncLock(); }
  function toast(msg) {
    var t = $("#toast"); t.textContent = msg; t.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.classList.remove("show"); }, 1800);
  }

  /* ---------- nav ---------- */
  function renderNav() {
    var items = [{ href: "#/", label: tr("home"), on: route.name === "home" }]
      .concat(CATS.map(function (c) { return { href: "#/c/" + c.id, label: pick(c), on: route.name === "cat" && route.id === c.id }; }))
      .concat([{ href: "#/all", label: tr("all"), on: route.name === "all" }]);
    $("#nav").innerHTML = '<div class="nav-close"><span>' + esc(tr("logoMain")) + '</span><button class="icon-btn" id="navClose" aria-label="' + esc(tr("close")) + '"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>' +
      items.map(function (i) { return '<a href="' + i.href + '"' + (i.on ? ' class="on" aria-current="page"' : "") + ">" + esc(i.label) + "</a>"; }).join("");
  }

  /* ---------- routing ---------- */
  function parseHash() {
    var h = location.hash.replace(/^#\/?/, ""), parts = h.split("/"), a = parts.shift(), arg = parts.join("/");
    try { arg = decodeURIComponent(arg); } catch (e) { /* keep raw */ }
    if (a === "c" && catById[arg]) return { name: "cat", id: arg };
    if (a === "all") return { name: "all" };
    if (a === "s") return { name: "search", q: arg };
    return { name: "home" };
  }
  function go(keepScroll) {
    route = parseHash();
    if (stopGlitter) { stopGlitter(); stopGlitter = null; }
    closeNav(); closeDD();
    if (route.name !== "search") $("#q").value = ""; else if (!$("#q").value) $("#q").value = route.q;
    renderNav();
    if (route.name === "home") renderHome(); else renderList();
    if (!keepScroll) window.scrollTo(0, 0);
  }

  /* ---------- home ---------- */
  function renderHome() {
    document.title = tr("shopName");
    app.innerHTML =
      '<section class="hero">' +
        '<video class="hero-video" autoplay muted loop playsinline preload="auto" aria-hidden="true"><source src="assets/hero.mp4" type="video/mp4"></video>' +
        '<canvas class="hero-glitter" aria-hidden="true"></canvas><div class="hero-overlay"></div>' +
        '<div class="wrap hero-in"><p class="kicker">' + esc(tr("heroKicker")) + "</p><h1>" + esc(tr("heroTitle")) + '</h1><p class="sub">' + esc(tr("heroText")) + '</p>' +
        '<a class="btn" href="#/all">' + esc(tr("shopNow")) + "</a></div></section>" +
      '<section class="wrap sec"><h2 class="sec-title">' + esc(tr("shopByCat")) + '</h2><div class="cat-grid">' +
      CATS.map(function (c) {
        var list = PRODUCTS.filter(function (p) { return p.cat === c.id; });
        var rep = list.filter(function (p) { return p.metal === "gold22"; })[0] || list[0];
        return '<a class="cat-card" href="#/c/' + c.id + '"><div class="cat-art">' + productArt(rep, "") + "</div><h3>" + esc(pick(c)) + "</h3><p>" + list.length + " " + esc(tr("items")) + "</p></a>";
      }).join("") + "</div></section>";
    initHero();
  }

  function initHero() {
    var v = $(".hero-video");
    if (v) {
      v.muted = true; v.defaultMuted = true;
      var src = $("source", v);
      if (src) src.addEventListener("error", function () { v.remove(); });
      v.addEventListener("error", function () { v.remove(); });
      var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) v.pause(); else { var pr = v.play(); if (pr && pr.catch) pr.catch(function () { /* autoplay blocked */ }); }
    }
    var cv = $(".hero-glitter");
    if (cv && !(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches)) stopGlitter = glitter(cv);
  }

  /* soft gold sparkles over the hero (also the fallback if no video file is added) */
  function glitter(cv) {
    var ctx = cv.getContext("2d"), w = 0, h = 0, parts = [], raf = 0, visible = true, t0 = performance.now();
    function size() {
      var r = cv.getBoundingClientRect(), d = Math.min(window.devicePixelRatio || 1, 1.5);
      w = cv.width = Math.max(1, r.width * d); h = cv.height = Math.max(1, r.height * d);
      var n = w < 900 ? 26 : 48; parts = [];
      for (var i = 0; i < n; i++) parts.push({ x: Math.random() * w, y: Math.random() * h, r: (3 + Math.random() * 7) * d, ph: Math.random() * 6.28, sp: .6 + Math.random() * 1.4, vy: (.05 + Math.random() * .12) * d });
    }
    function star(x, y, r) {
      ctx.beginPath(); ctx.moveTo(x, y - r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.quadraticCurveTo(x, y, x, y + r);
      ctx.quadraticCurveTo(x, y, x - r, y); ctx.quadraticCurveTo(x, y, x, y - r); ctx.fill();
    }
    function frame(now) {
      raf = 0; if (!visible) return;
      var t = (now - t0) / 1000; ctx.clearRect(0, 0, w, h); ctx.fillStyle = "#E9A93A";
      parts.forEach(function (p) {
        p.y -= p.vy; if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
        ctx.globalAlpha = .15 + .75 * Math.abs(Math.sin(t * p.sp + p.ph)); star(p.x, p.y, p.r);
      });
      raf = requestAnimationFrame(frame);
    }
    function start() { if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame); }
    size();
    var io = "IntersectionObserver" in window ? new IntersectionObserver(function (e) { visible = e[0].isIntersecting; if (visible) start(); }) : null;
    if (io) io.observe(cv);
    var onVis = function () { start(); }, onRes = function () { size(); };
    document.addEventListener("visibilitychange", onVis); window.addEventListener("resize", onRes);
    start();
    return function () { visible = false; if (raf) cancelAnimationFrame(raf); if (io) io.disconnect(); document.removeEventListener("visibilitychange", onVis); window.removeEventListener("resize", onRes); };
  }

  /* ---------- listing ---------- */
  function baseSet() {
    if (route.name === "cat") return PRODUCTS.filter(function (p) { return p.cat === route.id; });
    if (route.name === "search") {
      var toks = route.q.toLowerCase().split(/\s+/).filter(Boolean);
      return PRODUCTS.filter(function (p) { return toks.every(function (t) { return p._h.indexOf(t) > -1; }); });
    }
    return PRODUCTS;
  }
  function bucketLabel(b) {
    if (b.min === 0) return tr("under").replace("{x}", inr(b.max));
    if (b.max === Infinity) return tr("above").replace("{x}", inr(b.min));
    return inr(b.min) + " – " + inr(b.max);
  }
  function groupOptions(g) {
    var out = [];
    if (g === "type") {
      var seen = {}; base.forEach(function (p) { seen[p.type] = 1; });
      CATS.forEach(function (c) { c.types.forEach(function (t) { if (seen[t.id]) out.push({ v: t.id, label: pick(t) }); }); });
    } else if (g === "size") {
      var ss = {}; base.forEach(function (p) { p.sizes.forEach(function (s) { ss[s] = 1; }); });
      out = Object.keys(ss).sort(function (a, b) { return SIZE_ORDER.indexOf(a) - SIZE_ORDER.indexOf(b); }).map(function (s) { return { v: s, label: sizeLabel(s) }; });
    } else if (g === "metal") {
      var ms = {}; base.forEach(function (p) { ms[p.metal] = 1; });
      ["gold22", "gold18", "silver"].forEach(function (m) { if (ms[m]) out.push({ v: m, label: (METALS[m].kind === "gold" ? tr("mGold") : tr("mSilver")) + " · " + tr(METALS[m].purity) }); });
    } else if (g === "price") {
      BUCKETS.forEach(function (b) { if (base.some(function (p) { return p.price >= b.min && p.price < b.max; })) out.push({ v: b.id, label: bucketLabel(b) }); });
    }
    return out;
  }
  var GROUPS = [["type", "fType"], ["size", "fSize"], ["metal", "fMetal"], ["price", "fPrice"]];
  var CHEV = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';

  function renderList() {
    filters = { type: [], size: [], metal: [], price: [] }; sort = "pop"; shown = PAGE; base = baseSet();
    var title = route.name === "cat" ? pick(catById[route.id]) : route.name === "all" ? tr("all") : tr("results") + " “" + route.q + "”";
    document.title = title + " – " + tr("shopName");
    app.innerHTML = '<section class="wrap list"><h1 class="page-title">' + esc(title) + '</h1><div class="filterbar" id="fb"></div><p class="count" id="cnt"></p><div class="grid" id="grid"></div><div class="more" id="moreWrap"></div></section><div class="dd-scrim" id="ddScrim"></div>';
    var chips = GROUPS.map(function (g) {
      var opts = groupOptions(g[0]); if (opts.length < 2) return "";
      return '<div class="dd" data-g="' + g[0] + '"><button type="button" class="chip" aria-haspopup="true" aria-expanded="false"><span>' + esc(tr(g[1])) + '</span><b class="cn"></b>' + CHEV + "</button>" +
        '<div class="dd-panel" hidden><div class="dd-head"><span>' + esc(tr(g[1])) + '</span><button type="button" class="btn dd-done">' + esc(tr("done")) + "</button></div>" +
        opts.map(function (o) { return '<label class="opt"><input type="checkbox" data-g="' + g[0] + '" value="' + esc(o.v) + '"><span>' + esc(o.label) + "</span></label>"; }).join("") + "</div></div>";
    }).join("");
    $("#fb").innerHTML = '<div class="chips">' + chips + '<button type="button" class="clear-btn" id="clr" hidden>' + esc(tr("clear")) + "</button></div>" +
      '<label class="sort"><select id="sortSel" aria-label="' + esc(tr("sortPop")) + '">' +
      [["pop", "sortPop"], ["pa", "sortPA"], ["pd", "sortPD"], ["wa", "sortWA"], ["wd", "sortWD"]].map(function (s) { return '<option value="' + s[0] + '">' + esc(tr(s[1])) + "</option>"; }).join("") +
      "</select>" + CHEV + "</label>";
    updateGrid();
  }

  function passes(p) {
    var f = filters;
    if (f.type.length && f.type.indexOf(p.type) < 0) return false;
    if (f.metal.length && f.metal.indexOf(p.metal) < 0) return false;
    if (f.size.length && !p.sizes.some(function (s) { return f.size.indexOf(s) > -1; })) return false;
    if (f.price.length && !BUCKETS.some(function (b) { return f.price.indexOf(b.id) > -1 && p.price >= b.min && p.price < b.max; })) return false;
    return true;
  }
  function card(p) {
    var name = esc(pick(p)), m = METALS[p.metal];
    return '<article class="card"><button class="card-open" data-open="' + p.id + '" aria-label="' + name + '">' +
      '<div class="art">' + productArt(p, name) + '<span class="tag ' + m.kind + '">' + esc(tr(m.purity).split(" ")[0]) + "</span></div>" +
      '<div class="card-b"><h3>' + name + '</h3><div class="price">' + inr(p.price) + '</div><div class="psub">' + p.weight + " g</div></div></button>" +
      '<button class="add" data-add="' + p.id + '" aria-label="' + esc(tr("addBag")) + '"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 8h14l-1 12H6L5 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2M12 11.5v5M9.5 14h5"/></svg></button></article>';
  }
  function updateGrid() {
    var list = base.filter(passes);
    if (sort === "pa") list.sort(function (a, b) { return a.price - b.price; });
    else if (sort === "pd") list.sort(function (a, b) { return b.price - a.price; });
    else if (sort === "wa") list.sort(function (a, b) { return a.weight - b.weight; });
    else if (sort === "wd") list.sort(function (a, b) { return b.weight - a.weight; });
    $("#cnt").textContent = list.length + " " + tr("items");
    $("#grid").innerHTML = list.length ? list.slice(0, shown).map(card).join("") :
      '<div class="empty"><h3>' + esc(tr("noRes")) + "</h3><p>" + esc(tr("noResSub")) + "</p></div>";
    $("#moreWrap").innerHTML = list.length > shown ? '<button class="btn btn-o" id="moreBtn">' + esc(tr("showMore")) + " (" + (list.length - shown) + ")</button>" : "";
    var any = false;
    $$(".dd").forEach(function (d) {
      var n = filters[d.getAttribute("data-g")].length; any = any || n > 0;
      $(".cn", d).textContent = n ? "(" + n + ")" : ""; $(".chip", d).classList.toggle("active", n > 0);
    });
    $("#clr").hidden = !any;
  }

  /* dropdowns */
  function closeDD() {
    $$(".dd-panel").forEach(function (p) { p.hidden = true; });
    $$(".dd .chip").forEach(function (c) { c.setAttribute("aria-expanded", "false"); });
    document.body.classList.remove("dd-open");
  }
  function toggleDD(dd) {
    var panel = $(".dd-panel", dd), open = panel.hidden;
    closeDD();
    if (open) { panel.hidden = false; $(".chip", dd).setAttribute("aria-expanded", "true"); document.body.classList.add("dd-open"); }
  }

  /* ---------- product popup ---------- */
  function openProduct(id) {
    var p = byId[id], m = METALS[p.metal], name = esc(pick(p)), size = p.sizes.length > 1 ? null : p.sizes[0];
    var sizeText = p.sizes.length === 1 ? sizeLabel(p.sizes[0]) : p.sizes.map(sizeLabel).join(", ");
    $("#modal").innerHTML = '<div class="sheet" role="dialog" aria-modal="true" aria-label="' + name + '">' +
      '<button class="x" data-close aria-label="' + esc(tr("close")) + '"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>' +
      '<div class="m-art">' + productArt(p, name) + "</div>" +
      '<div class="m-info"><p class="crumb">' + esc(pick(catById[p.cat])) + " › " + esc(pick(typeById[p.type])) + "</p><h2>" + name + '</h2><div class="m-price">' + inr(p.price) + "</div>" +
      '<dl class="specs">' +
        "<dt>" + esc(tr("sMetal")) + "</dt><dd>" + esc(m.kind === "gold" ? tr("mGold") : tr("mSilver")) + "</dd>" +
        "<dt>" + esc(tr("sPurity")) + "</dt><dd>" + esc(tr(m.purity)) + "</dd>" +
        "<dt>" + esc(tr("sWeight")) + "</dt><dd>" + p.weight + " g</dd>" +
        "<dt>" + esc(tr("sSize")) + "</dt><dd>" + esc(sizeText) + "</dd>" +
        "<dt>" + esc(tr("sCat")) + "</dt><dd>" + esc(pick(catById[p.cat])) + "</dd>" +
        "<dt>" + esc(tr("sType")) + "</dt><dd>" + esc(pick(typeById[p.type])) + "</dd>" +
        "<dt>" + esc(tr("sCode")) + "</dt><dd>" + esc(p.id) + "</dd></dl>" +
      (p.sizes.length > 1 ? '<div class="sizes"><p>' + esc(tr("selSize")) + '</p><div class="size-row">' +
        p.sizes.map(function (s) { return '<button type="button" class="size" data-size="' + esc(s) + '">' + esc(sizeLabel(s)) + "</button>"; }).join("") + '</div><p class="size-err" id="sizeErr" hidden>' + esc(tr("needSize")) + "</p></div>" : "") +
      '<p class="desc">' + esc(lang === "hi" ? p.descHi : p.descEn) + '</p><button class="btn btn-block" id="mAdd">' + esc(tr("addBag")) + "</button></div></div>";
    var modal = $("#modal"); modal.hidden = false; syncLock();
    modal.onclick = function (e) {
      var sz = e.target.closest(".size");
      if (sz) { size = sz.getAttribute("data-size"); $$(".size", modal).forEach(function (b) { b.classList.toggle("on", b === sz); }); var er = $("#sizeErr"); if (er) er.hidden = true; return; }
      if (e.target.closest("#mAdd")) {
        if (!size) { var er2 = $("#sizeErr"); if (er2) er2.hidden = false; return; }
        addToBag(p.id, size); closeModal(); return;
      }
      if (e.target === modal || e.target.closest("[data-close]")) closeModal();
    };
    var sheet = $(".sheet", modal); sheet.scrollTop = 0; $(".x", modal).focus({ preventScroll: true });
  }
  function closeModal() { var m = $("#modal"); m.hidden = true; m.innerHTML = ""; syncLock(); }

  /* ---------- bag ---------- */
  var cart = [];
  try { cart = JSON.parse(store.get("nj_cart") || "[]").filter(function (i) { return byId[i.id] && i.qty > 0; }); } catch (e) { cart = []; }
  function saveCart() { store.set("nj_cart", JSON.stringify(cart)); }
  function addToBag(id, size) {
    var hit = cart.filter(function (i) { return i.id === id && i.size === size; })[0];
    if (hit) hit.qty++; else cart.push({ id: id, size: size, qty: 1 });
    saveCart(); renderBag(); toast(tr("added") + " ✓");
  }
  function openBag() { document.body.classList.add("bag-open"); var d = $("#bag"); d.classList.add("open"); d.setAttribute("aria-hidden", "false"); syncLock(); $("#bagClose").focus({ preventScroll: true }); }
  function closeBag() { document.body.classList.remove("bag-open"); var d = $("#bag"); d.classList.remove("open"); d.setAttribute("aria-hidden", "true"); syncLock(); }
  var PHONE_SVG = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/></svg>';
  function renderBag() {
    var n = cart.reduce(function (a, i) { return a + i.qty; }, 0);
    $("#bagCount").textContent = n; var bd = $("#bagBadge"); bd.textContent = n; bd.hidden = false; bd.classList.toggle("has", n > 0);
    var body = $("#bagBody"), foot = $("#bagFoot");
    if (!cart.length) {
      body.innerHTML = '<div class="bag-empty"><p>' + esc(tr("bagEmpty")) + '</p><a class="btn" href="#/all" data-closebag>' + esc(tr("continueShop")) + "</a></div>"; foot.innerHTML = ""; foot.hidden = true; return;
    }
    foot.hidden = false;
    var total = 0;
    body.innerHTML = cart.map(function (i, idx) {
      var p = byId[i.id], line = p.price * i.qty, nm = esc(pick(p)); total += line;
      return '<div class="bi"><div class="bi-art">' + productArt(p, nm) + "</div><div><h4>" + nm + '</h4><p class="psub">' + (p.sizes.length > 1 ? esc(sizeLabel(i.size)) + " · " : "") + p.weight + " g · " + inr(p.price) + '</p>' +
        '<div class="bi-row"><div class="qty"><button data-q="-1" data-i="' + idx + '" aria-label="' + esc(tr("dec")) + '">−</button><span>' + i.qty + '</span><button data-q="1" data-i="' + idx + '" aria-label="' + esc(tr("inc")) + '">+</button></div><span class="bi-p">' + inr(line) + "</span></div></div>" +
        '<button class="bi-rm" data-rm="' + idx + '" aria-label="' + esc(tr("remove")) + '"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>';
    }).join("");
    foot.innerHTML = '<div class="total"><span>' + esc(tr("total")) + "</span><b>" + inr(total) + '</b></div><p class="call-h">' + esc(tr("callOrder")) + "</p>" +
      PHONES.map(function (p) { return '<a class="btn call-btn" href="tel:' + p.tel + '">' + PHONE_SVG + "<span>" + esc(tr(p.key)) + " · " + p.label + "</span></a>"; }).join("");
  }

  /* ---------- events ---------- */
  document.addEventListener("click", function (e) {
    var t = e.target;
    var open = t.closest("[data-open]"); if (open) { openProduct(open.getAttribute("data-open")); return; }
    var add = t.closest("[data-add]");
    if (add) { var p = byId[add.getAttribute("data-add")]; if (p.sizes.length > 1) openProduct(p.id); else addToBag(p.id, p.sizes[0]); return; }
    if (t.closest("#moreBtn")) { shown += PAGE; updateGrid(); return; }
    var chip = t.closest(".dd .chip"); if (chip) { toggleDD(chip.parentNode); return; }
    if (t.closest(".dd-done") || t.id === "ddScrim") { closeDD(); return; }
    if (t.closest("#clr")) { for (var k in filters) filters[k] = []; $$(".dd input").forEach(function (i) { i.checked = false; }); updateGrid(); return; }
    if (!t.closest(".dd")) closeDD();
    if (t.closest("#bagBtn")) { openBag(); return; }
    if (t.closest("#bagClose") || t.id === "scrim" && document.body.classList.contains("bag-open")) { closeBag(); return; }
    if (t.closest("[data-closebag]")) closeBag();
    var q = t.closest("[data-q]");
    if (q) { var it = cart[+q.getAttribute("data-i")]; it.qty += +q.getAttribute("data-q"); if (it.qty < 1) cart.splice(+q.getAttribute("data-i"), 1); saveCart(); renderBag(); return; }
    var rm = t.closest("[data-rm]"); if (rm) { cart.splice(+rm.getAttribute("data-rm"), 1); saveCart(); renderBag(); return; }
    if (t.closest("#menuBtn")) { document.body.classList.add("nav-open"); $("#menuBtn").setAttribute("aria-expanded", "true"); syncLock(); return; }
    if (t.closest("#navClose") || (t.id === "scrim" && document.body.classList.contains("nav-open"))) { closeNav(); return; }
    if (t.closest("#nav a")) closeNav();
  });
  document.addEventListener("change", function (e) {
    var t = e.target;
    if (t.matches(".dd input")) {
      var g = t.getAttribute("data-g"), arr = filters[g], i = arr.indexOf(t.value);
      if (t.checked && i < 0) arr.push(t.value); else if (!t.checked && i > -1) arr.splice(i, 1);
      shown = PAGE; updateGrid();
    } else if (t.id === "sortSel") { sort = t.value; shown = PAGE; updateGrid(); }
  });
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (!$("#modal").hidden) closeModal(); else if (document.body.classList.contains("bag-open")) closeBag(); else { closeNav(); closeDD(); }
  });

  $("#langBtn").addEventListener("click", function () {
    lang = lang === "en" ? "hi" : "en"; store.set("nj_lang", lang);
    applyStatic(); go(true); renderBag();
  });

  /* search: live while typing */
  var st;
  $("#searchForm").addEventListener("submit", function (e) { e.preventDefault(); doSearch(); $("#q").blur(); });
  $("#q").addEventListener("input", function () { clearTimeout(st); st = setTimeout(doSearch, 250); });
  function doSearch() {
    var v = $("#q").value.trim();
    if (!v) { if (route.name === "search") location.hash = "#/all"; return; }
    var h = "#/s/" + encodeURIComponent(v);
    if (route.name === "search") { history.replaceState(null, "", h); go(true); }
    else location.hash = h;
  }
  window.addEventListener("hashchange", function () { go(false); });

  /* ---------- start ---------- */
  applyStatic(); renderBag(); go(true);
})();
