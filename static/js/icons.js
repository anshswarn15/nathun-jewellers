/* Product illustrations (SVG). Used when a product has no real photo.
   To use real photos: save assets/products/<CODE>.jpg and re-run tools/generate_products.py */
(function () {
  var D = "rgba(90,50,0,.38)";
  function circ(x, y, r, m) { return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + m + '" stroke="' + D + '" stroke-width="1.2"/>'; }
  function ring(x, y, r, w, m, ex) { return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="none" stroke="' + m + '" stroke-width="' + w + '" ' + (ex || "") + '/>'; }
  function path(d, m, w, ex) { return '<path d="' + d + '" fill="none" stroke="' + m + '" stroke-width="' + w + '" stroke-linecap="round" ' + (ex || "") + '/>'; }
  function fillp(d, m) { return '<path d="' + d + '" fill="' + m + '" stroke="' + D + '" stroke-width="1.2" stroke-linejoin="round"/>'; }
  function drop(x, y, s, m) {
    return fillp("M" + x + " " + (y - s) + "C" + (x + s * .2) + " " + (y - s * .4) + " " + (x + s * .8) + " " + y + " " + (x + s * .8) + " " + (y + s * .45) +
      "A" + s * .8 + " " + s * .8 + " 0 1 1 " + (x - s * .8) + " " + (y + s * .45) + "C" + (x - s * .8) + " " + y + " " + (x - s * .2) + " " + (y - s * .4) + " " + x + " " + (y - s) + "Z", m);
  }
  function flower(x, y, n, pr, r, m) {
    var s = "";
    for (var i = 0; i < n; i++) { var a = i * 2 * Math.PI / n; s += circ((x + pr * Math.cos(a)).toFixed(1), (y + pr * Math.sin(a)).toFixed(1), r, m); }
    return s + circ(x, y, r * 1.05, m);
  }
  function Q(a, b, c, t) { return (1 - t) * (1 - t) * a + 2 * t * (1 - t) * b + t * t * c; }
  function openRing(x, y, r, w, m, gap, rot) {
    var C = 2 * Math.PI * r;
    return ring(x, y, r, w, m, 'stroke-linecap="round" stroke-dasharray="' + (C - gap).toFixed(1) + " " + gap + '" transform="rotate(' + rot + " " + x + " " + y + ')"');
  }
  function neck(depth, w, m, dash) { return path("M26 26Q100 " + (26 + depth * 2) + " 174 26", m, w, dash ? 'stroke-dasharray="' + dash + '"' : ""); }
  function pair(f) { return '<g transform="translate(-2,6) scale(.96)">' + f + '</g><g transform="translate(98,6) scale(.96)">' + f + "</g>"; }

  var ART = {
    /* HEAD */
    crown: function (m, v) {
      var dots = ""; for (var i = 0; i < 5; i++) dots += circ(58 + i * 21, 158, 3, D);
      return fillp("M38 150L32 78L66 108L100 56L134 108L168 78L162 150Z", m) +
        '<rect x="34" y="150" width="132" height="16" rx="6" fill="' + m + '" stroke="' + D + '"/>' + circ(32, 74, 7, m) + circ(100, 52, 8, m) + circ(168, 74, 7, m) + dots;
    },
    tiara: function (m) {
      var s = path("M30 140Q100 -10 170 140", m, 8);
      [.12, .3, .5, .7, .88].forEach(function (t, i) { s += circ(Q(30, 100, 170, t).toFixed(1), Q(140, -10, 140, t).toFixed(1) - 4, i === 2 ? 13 : 8, m); });
      return s;
    },
    tikka: function (m) {
      return path("M24 50Q100 90 176 50", m, 3) + path("M100 70V108", m, 3) + flower(100, 80, 8, 13, 6, m) + drop(100, 130, 22, m);
    },
    pasa: function (m) {
      return path("M24 40Q100 120 170 56", m, 4, 'stroke-dasharray="9 3"') + '<ellipse cx="158" cy="86" rx="20" ry="34" transform="rotate(-18 158 86)" fill="' + m + '" stroke="' + D + '" stroke-width="1.2"/>' + flower(158, 86, 6, 9, 5, m);
    },
    hairclip: function (m) {
      var t = ""; [56, 80, 104, 128].forEach(function (x) { t += '<rect x="' + x + '" y="108" width="9" height="40" rx="4" fill="' + m + '" stroke="' + D + '" stroke-width="1.2"/>'; });
      return t + '<rect x="36" y="74" width="128" height="38" rx="19" fill="' + m + '" stroke="' + D + '" stroke-width="1.2"/>' + flower(100, 93, 6, 10, 6, m);
    },
    /* NECK */
    choker: function (m) { return neck(34, 9, m) + path("M26 26Q100 94 174 26", D, 1.5, 'stroke-dasharray="1 7"') + drop(100, 72, 12, m); },
    collar: function (m) { return neck(26, 18, m) + path("M26 26Q100 78 174 26", D, 2, 'stroke-dasharray="1 8"'); },
    matinee: function (m) { return neck(80, 5, m) + drop(100, 120, 14, m); },
    opera: function (m) { return neck(125, 4, m) + drop(100, 165, 14, m); },
    rani: function (m) { return neck(45, 5, m, "7 3") + neck(80, 5, m, "7 3") + neck(115, 5, m, "7 3") + circ(100, 71, 6, m) + circ(100, 106, 7, m) + drop(100, 159, 18, m); },
    chain: function (m) { return neck(110, 6, m, "9 3") + circ(26, 26, 6, m) + circ(174, 26, 6, m); },
    pendant: function (m) { return '<g transform="translate(0,25)">' + path("M50 20Q100 100 150 20", m, 3) + drop(100, 82, 22, m) + "</g>"; },
    /* EARS */
    stud: function (m) { return pair(flower(50, 100, 6, 17, 11, m)); },
    hoop: function (m) { return pair(ring(50, 100, 34, 7, m) + circ(50, 66, 6, m)); },
    dangle: function (m) { return pair(circ(50, 48, 12, m) + path("M50 60V92", m, 3) + drop(50, 120, 26, m)); },
    chandelier: function (m) {
      return pair(circ(50, 40, 12, m) + fillp("M30 56H70L84 84H16Z", m) + drop(22, 100, 13, m) + drop(50, 104, 16, m) + drop(78, 100, 13, m));
    },
    jhumka: function (m) {
      var b = ""; [[20, 154], [35, 160], [50, 162], [65, 160], [80, 154]].forEach(function (p) { b += circ(p[0], p[1], 4, m); });
      return pair(circ(50, 40, 10, m) + fillp("M18 112A32 32 0 0 1 82 112Z", m) + fillp("M16 112H84L92 148Q50 164 8 148Z", m) + b);
    },
    earcuff: function (m) { return pair(path("M72 44C14 46 14 156 72 158", m, 9) + circ(72, 44, 7, m) + circ(72, 158, 7, m)); },
    /* HANDS */
    engagement: function (m) { return ring(100, 126, 44, 11, m) + flower(100, 76, 8, 13, 7, m); },
    wedding: function (m) { return ring(100, 112, 52, 14, m) + ring(100, 112, 52, 2, D, 'stroke-dasharray="2 6"'); },
    cocktail: function (m) { return ring(100, 134, 40, 10, m) + flower(100, 84, 10, 22, 10, m); },
    band: function (m) { return ring(100, 110, 50, 20, m) + ring(100, 110, 50, 1.5, D, 'stroke-dasharray="1 7"'); },
    bracelet: function (m) { return ring(100, 100, 56, 9, m, 'stroke-dasharray="14 5"') + circ(100, 44, 8, m); },
    bangle: function (m) {
      return ring(86, 100, 52, 10, m) + ring(114, 100, 52, 10, m) + ring(86, 100, 52, 1.5, D, 'stroke-dasharray="1 6"') + ring(114, 100, 52, 1.5, D, 'stroke-dasharray="1 6"');
    },
    kada: function (m) {
      return ring(100, 100, 56, 22, m, 'stroke-linecap="round" stroke-dasharray="320 40" transform="rotate(-70 100 100)"') + ring(100, 100, 56, 2, D, 'stroke-dasharray="1 7"');
    },
    hathphool: function (m) {
      var s = "";
      for (var i = 0; i < 5; i++) {
        var a = (-150 + i * 30) * Math.PI / 180, x = 100 + 72 * Math.cos(a), y = 96 + 72 * Math.sin(a);
        s += path("M100 96L" + x.toFixed(1) + " " + y.toFixed(1), m, 2) + ring(x.toFixed(1), y.toFixed(1), 8, 3.5, m);
      }
      return s + path("M100 96V146", m, 2) + path("M40 172Q100 136 160 172", m, 6, 'stroke-dasharray="10 3"') + flower(100, 96, 8, 14, 8, m);
    },
    /* FEET */
    anklet: function (m) {
      var s = path("M20 60Q100 140 180 60", m, 5, 'stroke-dasharray="8 3"');
      [.12, .3, .5, .7, .88].forEach(function (t) {
        var x = Q(20, 100, 180, t), y = Q(60, 140, 60, t);
        s += path("M" + x.toFixed(1) + " " + y.toFixed(1) + "v8", m, 2) + circ(x.toFixed(1), (y + 17).toFixed(1), 8, m) + circ(x.toFixed(1), (y + 20).toFixed(1), 1.6, D);
      });
      return s;
    },
    toering: function (m) { return openRing(68, 108, 30, 7, m, 22, -80) + circ(68, 78, 5, m) + openRing(134, 108, 30, 7, m, 22, -80) + circ(134, 78, 5, m); },
    /* BODY */
    nosepin: function (m) { return flower(100, 100, 8, 26, 13, m) + circ(100, 100, 15, m); },
    nosering: function (m) { return openRing(100, 106, 50, 6, m, 36, -75) + circ(100, 56, 9, m); },
    waist: function (m) {
      var s = path("M16 56Q100 112 184 56", m, 5, 'stroke-dasharray="6 3"') + path("M16 72Q100 128 184 72", m, 5, 'stroke-dasharray="6 3"');
      [.2, .8].forEach(function (t) { s += drop(Q(16, 100, 184, t).toFixed(1) * 1, Q(72, 128, 72, t) + 16, 9, m); });
      return s + circ(100, 100, 7, m) + drop(100, 124, 20, m);
    },
    armlet: function (m) { return ring(100, 118, 56, 14, m) + ring(100, 118, 56, 1.5, D, 'stroke-dasharray="1 7"') + fillp("M100 34L130 66L100 98L70 66Z", m) + circ(100, 66, 6, D); },
    brooch: function (m) { return ring(100, 100, 50, 8, m) + flower(100, 100, 8, 20, 11, m); }
  };

  function hash(s) { var h = 0; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; }

  window.productArt = function (p, alt) {
    if (p.img) return '<img src="' + p.img + '" alt="' + (alt || "") + '" loading="lazy" decoding="async">';
    var fn = ART[p.type] || ART.engagement;
    return '<svg viewBox="0 0 200 200" role="img" aria-label="' + (alt || "") + '" focusable="false">' + fn("url(#g-" + p.metal + ")", hash(p.id) % 4) + "</svg>";
  };
})();
