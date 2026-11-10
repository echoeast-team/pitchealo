/*
 * Pitchealo V2 hero
 * - sketched newspaper clippings with the ink character (peek / write / sign)
 * - typed headline
 * - hover Publicadores / Fuentes: concentric ink lines ripple out from the
 *   button in that side's colour (background stays white), and a gust blows
 *   away every clipping except the ones being written (Publicadores) or
 *   signed (Fuentes)
 */
(function () {
  'use strict';

  var C = window.PitchealoSketch;
  var hero = document.querySelector('.hero');
  if (!hero || !C) return;

  var stage = hero.querySelector('.stage');
  var canvas = hero.querySelector('.hero-ripples');
  var ctx = canvas.getContext('2d');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var COLOURS = { pub: '#b9552b', fue: '#008c7d' };

  /* ------------------------------------------------------------------ *
   * Content (fictional outlets)
   * ------------------------------------------------------------------ */
  var ARTICLES = {
    a: { type: 'peek-l', ratio: 1.3, paper: 'La Gaceta Andina', kicker: 'Economía', head: 'Una economista explica por qué suben los alquileres', photo: 'city' },
    b: { type: 'write', ratio: 1.34, paper: 'El Observador Austral', kicker: 'Ciencia', head: 'Ingenieros rosarinos crean un sensor para el agro', photo: null },
    c: { type: 'write', ratio: 1.36, paper: 'Diario del Litoral Sur', kicker: 'Salud', head: 'Pediatras responden las dudas sobre el sueño infantil', photo: 'portrait' },
    d: { type: 'plain', ratio: 1.28, paper: 'La Tribuna Pampeana', kicker: 'Negocios', head: 'El boom de las pymes que exportan desde el interior', photo: 'chart' },
    e: { type: 'sign', ratio: 1.38, paper: 'Correo Austral', kicker: 'Medio ambiente', head: 'Cómo cuidar el agua en verano, según una hidróloga', photo: 'sea' },
    f: { type: 'sign', ratio: 1.34, paper: 'Crónica de Cuyo', kicker: 'Gastronomía', head: 'Un chef mendocino y el regreso de la cocina a fuego', photo: null },
    g: { type: 'peek-r', ratio: 1.3, paper: 'Noticias del Plata', kicker: 'Tecnología', head: 'La startup chilena que convierte residuos en energía', photo: 'hills' },
    h: { type: 'sign', ratio: 1.36, paper: 'El Heraldo Andino', kicker: 'Cultura', head: 'Historiadora revela el origen del mate cocido', photo: 'portrait' },
    i: { type: 'write', ratio: 1.34, paper: 'La Voz Costera', kicker: 'Ciencia', head: 'Astrónomos uruguayos detectan un cometa inesperado', photo: 'hills' },
    k: { type: 'peek-r', ratio: 1.3, paper: 'El Mirador Pampeano', kicker: 'Deportes', head: 'Nutricionistas desmienten cinco mitos del desayuno', photo: 'chart' },
    l: { type: 'peek-l', ratio: 1.3, paper: 'Diario Cordillera', kicker: 'Turismo', head: 'Los pueblos de montaña que conviene visitar en otoño', photo: 'hills' }
  };

  var LAYOUT_DESKTOP = [
    { id: 'b', x: 29, y: 5, w: 176, r: 3, z: 0.9 },
    { id: 'a', x: 8, y: 34, w: 192, r: -5, z: 1.05 },
    { id: 'c', x: 8, y: 77, w: 206, r: 3, z: 1 },
    { id: 'd', x: 24, y: 100, w: 188, r: -4, z: 0.85 },
    { id: 'l', x: 50, y: 105, w: 226, r: 1, z: 0.8 },
    { id: 'k', x: 76, y: 99, w: 188, r: 4, z: 0.85 },
    { id: 'f', x: 57, y: 4, w: 172, r: -3, z: 0.9 },
    { id: 'g', x: 92, y: 33, w: 192, r: 5, z: 1.05 },
    { id: 'e', x: 92, y: 77, w: 206, r: -3, z: 1 }
  ];
  var LAYOUT_WIDE_EXTRA = [
    { id: 'i', x: 17.5, y: 56, w: 148, r: -4, z: 0.75 },
    { id: 'h', x: 82.5, y: 57, w: 148, r: 4, z: 0.75 }
  ];
  var LAYOUT_MOBILE = [
    { id: 'd', x: 12, y: 8, w: 118, r: -4, z: 0.95 },
    { id: 'b', x: 50, y: 6, w: 132, r: 2, z: 1 },
    { id: 'f', x: 88, y: 8, w: 126, r: 4, z: 0.95 },
    { id: 'a', x: 15, y: 96, w: 132, r: 4, z: 1 },
    { id: 'l', x: 50, y: 102, w: 138, r: -2, z: 0.9 },
    { id: 'g', x: 85, y: 95, w: 132, r: -4, z: 1 }
  ];

  /* ------------------------------------------------------------------ *
   * Helpers
   * ------------------------------------------------------------------ */
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function smooth(a, b, v) { var t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }
  function easeInOutCubic(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function rng(seed) {
    var s = seed % 2147483647; if (s <= 0) s += 2147483646;
    return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
  }
  function seedOf(str) { var h = 7; for (var i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % 2147483647; return h; }

  // Handwriting: prolate-cycloid loops, split into words by pen lifts (from V1).
  function cursive(x0, x1, y, h, rand, opts) {
    opts = opts || {};
    var d = '', x = x0, words = 0;
    while (x < x1 - h * 1.2) {
      var letters = opts.oneWord ? 99 : 2 + Math.floor(rand() * 4);
      d += 'M' + x.toFixed(2) + ' ' + y.toFixed(2);
      for (var l = 0; l < letters && x < x1 - h * 0.6; l++) {
        var big = (opts.capital && words === 0 && l === 0);
        var roll = rand();
        var shape = big ? 'cap' : roll < 0.42 ? 'arch' : roll < 0.72 ? 'loop' : roll < 0.88 ? 'tall' : 'desc';
        var lh, wl, k, dir = 1;
        if (shape === 'cap') { lh = h * 2.7; wl = h * 1.4; k = wl * 0.36; }
        else if (shape === 'arch') { lh = h * (0.75 + rand() * 0.2); wl = h * (0.62 + rand() * 0.2); k = wl * 0.04; }
        else if (shape === 'loop') { lh = h * (0.6 + rand() * 0.2); wl = h * (0.5 + rand() * 0.15); k = wl * 0.24; }
        else if (shape === 'tall') { lh = h * (1.75 + rand() * 0.35); wl = h * (0.55 + rand() * 0.15); k = wl * 0.3; }
        else { lh = h * (1.3 + rand() * 0.3); wl = h * (0.6 + rand() * 0.15); k = wl * 0.3; dir = -1; }
        var wob = (rand() - 0.5) * h * 0.2;
        for (var i = 1; i <= 14; i++) {
          var t = (i / 14) * Math.PI * 2;
          var rise = lh * (1 - Math.cos(t)) / 2 * dir;
          d += 'L' + (x + wl * t / (Math.PI * 2) + k * Math.sin(t) * dir + rise * 0.28).toFixed(2) + ' ' + (y + wob * Math.sin(t / 2) - rise).toFixed(2);
        }
        x += wl;
      }
      words++;
      x += h * (0.8 + rand() * 0.4);
      if (opts.oneWord) break;
    }
    if (opts.flourish) {
      var sx = x - h * 0.8, sy = y;
      for (var j = 1; j <= 16; j++) {
        var u = j / 16;
        d += 'L' + (sx + (x0 - h - sx) * u + Math.sin(u * Math.PI) * h * 0.6).toFixed(2) + ' ' + (sy + h * 0.55 * Math.sin(u * Math.PI) + u * h * 0.2).toFixed(2);
      }
    }
    return d;
  }

  var photoId = 0;
  // Ink line-art "photos" with cross-hatching
  function photoSVG(kind) {
    photoId += 1;
    var id = 'ph' + photoId;
    var v = 'viewBox="0 0 100 56" preserveAspectRatio="xMidYMid slice"';
    var defs = '<defs><pattern id="' + id + '" width="3" height="3" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0V3" stroke="#141414" stroke-width=".7"/></pattern>' +
      '<pattern id="' + id + 'x" width="3" height="3" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)"><path d="M0 0V3" stroke="#141414" stroke-width=".5"/></pattern></defs>';
    var L = 'fill="none" stroke="#141414" stroke-width="1" stroke-linejoin="round" stroke-linecap="round"';
    switch (kind) {
      case 'city':
        return '<svg ' + v + '>' + defs +
          '<circle cx="78" cy="14" r="6" ' + L + '/>' +
          '<path d="M0 56V30h8v-8h7v12h6V18h9v16h5V26h8v30zM48 56V22h10v-6h6v6h6v14h6V28h8v-6h9v8h7v26z" fill="url(#' + id + ')" ' + L.replace('fill="none" ', '') + '/>' +
          '<path d="M0 56V42h14v-5h12v7h14v-3h12v5h16v-6h10v8h12v-3h10v11z" fill="#fff" ' + L.replace('fill="none" ', '') + '/>' +
          '<path d="M6 48h3M20 47h3M34 50h3M60 49h3M76 50h3M90 51h3" stroke="#141414" stroke-width="1.4"/></svg>';
      case 'portrait':
        return '<svg ' + v + '>' + defs +
          '<path d="M0 46H100" ' + L + '/><path d="M0 46h100v10H0z" fill="url(#' + id + 'x)"/>' +
          '<g transform="translate(36 6) scale(1.7)"><path d="' + C.HEAD + '" fill="url(#' + id + ')" stroke="#141414" stroke-width=".7"/></g></svg>';
      case 'chart':
        return '<svg ' + v + '>' + defs +
          '<g stroke="#141414" stroke-width="1"><rect x="12" y="34" width="9" height="16" fill="url(#' + id + ')"/><rect x="26" y="28" width="9" height="22" fill="#fff"/><rect x="40" y="31" width="9" height="19" fill="url(#' + id + ')"/><rect x="54" y="20" width="9" height="30" fill="#fff"/><rect x="68" y="14" width="9" height="36" fill="url(#' + id + ')"/></g>' +
          '<path d="M10 26L28 18L44 22L60 10L84 4" ' + L + ' stroke-dasharray="2.5 2"/><path d="M8 50H90" ' + L + '/></svg>';
      case 'sea':
        return '<svg ' + v + '>' + defs +
          '<circle cx="26" cy="18" r="8" fill="url(#' + id + 'x)" stroke="#141414" stroke-width="1"/>' +
          '<path d="M0 32q12-6 25 0t25 0 25 0 25 0" ' + L + '/><path d="M0 40q12-6 25 0t25 0 25 0 25 0V56H0z" fill="url(#' + id + ')" stroke="#141414" stroke-width="1"/></svg>';
      default:
        return '<svg ' + v + '>' + defs +
          '<circle cx="72" cy="15" r="6" ' + L + '/>' +
          '<path d="M0 56L22 24L38 40L56 14L80 44L100 30V56z" fill="#fff" ' + L.replace('fill="none" ', '') + '/>' +
          '<path d="M22 24L28 34L24 40M56 14L62 26L56 32" ' + L + '/>' +
          '<path d="M0 56L18 42L34 50L60 36L84 52L100 46V56z" fill="url(#' + id + ')" stroke="#141414" stroke-width="1"/></svg>';
    }
  }

  var DATE = 'Jueves 29 de octubre de 2026';

  /* ------------------------------------------------------------------ *
   * Build clippings
   * ------------------------------------------------------------------ */
  var articles = [];

  function buildArticle(slot, scale) {
    var data = ARTICLES[slot.id];
    var w = Math.round(slot.w * scale);
    var hgt = Math.round(w * data.ratio);
    var el = document.createElement('div');
    el.className = 'article article--' + data.type;
    el.style.setProperty('--w', w + 'px');
    el.style.width = w + 'px';
    el.style.height = hgt + 'px';

    var isWrite = data.type === 'write';
    var isSign = data.type === 'sign';
    var isPeek = data.type.indexOf('peek') === 0;
    var side = data.type === 'peek-r' ? 'r' : 'l';
    var html = '';
    var peekStyle = '';
    if (isPeek) {
      peekStyle = ' style="--peek-dur:' + (6.5 + Math.random() * 3).toFixed(2) + 's;--peek-delay:' + (-Math.random() * 8).toFixed(2) + 's"';
      html += '<div class="peek peek--' + side + '"' + peekStyle + '>' + C.svg('peek', { side: side === 'l' ? 'pub' : 'fue' }) + '</div>';
    }
    var limit = isWrite ? ' paper-body--write' : isSign ? ' paper-body--sign' : '';
    html +=
      '<div class="paper"><div class="paper-body' + limit + '">' +
      '<div class="mast">' + data.paper + '</div>' +
      '<div class="mast-meta"><span>' + DATE + '</span><span>Edición digital</span></div>' +
      '<div class="kicker">' + data.kicker + '</div>' +
      '<div class="headline">' + data.head + '</div>' +
      (data.photo ? '<div class="photo">' + photoSVG(data.photo) + '</div>' : '<div class="standfirst"></div>') +
      '<div class="cols"><i></i><i></i></div>' +
      '</div></div>';

    var H = 100 * data.ratio;
    var ink = null;
    if (isWrite || isSign) {
      var rand = rng(seedOf(slot.id + data.head));
      var d = '', guides = '';
      if (isWrite) {
        var top = H * 0.665;
        var gap = (H * 0.955 - top) / 3;
        for (var n = 0; n < 3; n++) {
          var y = top + gap * (n + 0.78);
          guides += '<path d="M8 ' + (y + 0.9).toFixed(2) + 'H93" class="rule"/>';
          d += cursive(n === 0 ? 30 : 12, n === 2 ? 70 : 90, y, 2.9, rand);
        }
        guides = '<text x="8" y="' + (top + 1.6).toFixed(2) + '" class="ink-label">BORRADOR</text>' + guides;
      } else {
        var base = H - 11;
        guides = '<path d="M40 ' + (base + 2.2).toFixed(2) + 'H93" class="rule rule--sign"/>' +
          '<text x="40" y="' + (base + 7.2).toFixed(2) + '" class="ink-label">FIRMA DE LA FUENTE</text>' +
          '<text x="8" y="' + (base - 18).toFixed(2) + '" class="ink-quote">«Los datos muestran un cambio</text>' +
          '<text x="8" y="' + (base - 13).toFixed(2) + '" class="ink-quote">que nadie esperaba este año.»</text>';
        d = cursive(48, 88, base, 3.4, rand, { oneWord: true, capital: true, flourish: true });
      }
      html +=
        '<svg class="ink ink--' + data.type + '" viewBox="0 0 100 ' + H.toFixed(2) + '" aria-hidden="true">' +
        guides +
        '<path class="stroke stroke--' + data.type + '" d="' + d + '"/>' +
        '<g class="ink-char">' + C.group(isWrite ? 'write' : 'sign', { side: isWrite ? 'pub' : 'fue' }) + '</g>' +
        '</svg>';
      ink = { s: isWrite ? 1.02 : 1 };
    }
    if (isPeek) html += '<div class="peek-hands peek-hands--' + side + '"' + peekStyle + '><span></span><span></span></div>';
    el.innerHTML = html;

    var a = {
      id: slot.id, el: el, type: data.type, slot: slot, w: w, h: hgt, hx: 0, hy: 0,
      depth: slot.z || 1, phase: Math.random() * Math.PI * 2,
      p: 0, target: 0, delay: 0, dir: { x: 1, y: 0 }, spin: 0, travel: 0, tilt: 0,
      gustT: -1, gustAmp: 0, blown: false
    };
    if (ink) {
      var path = el.querySelector('.stroke');
      var L = path.getTotalLength();
      path.style.strokeDasharray = L + ' ' + (L + 10);
      path.style.strokeDashoffset = L;
      a.ink = {
        path: path, L: L, char: el.querySelector('.ink-char'), s: ink.s,
        speed: isWrite ? 46 : 34, t: Math.random() * 3,
        start: path.getPointAtLength(0), end: path.getPointAtLength(L)
      };
    }
    return a;
  }

  var scale = 1, mode = '', heroW = 0, heroH = 0, dpr = 1;

  function layout() {
    var W = hero.clientWidth, H = hero.clientHeight;
    var newMode = W < 720 ? 'mobile' : W >= 1280 ? 'wide' : 'desktop';
    scale = newMode === 'mobile' ? clamp(W / 390, 0.82, 1.2) : clamp(W / 1440, 0.62, 1.12);
    if (newMode !== mode || !articles.length) {
      mode = newMode;
      stage.innerHTML = '';
      articles = [];
      var slots = mode === 'mobile' ? LAYOUT_MOBILE : LAYOUT_DESKTOP.concat(mode === 'wide' ? LAYOUT_WIDE_EXTRA : []);
      slots.forEach(function (slot) {
        var a = buildArticle(slot, scale);
        stage.appendChild(a.el);
        articles.push(a);
      });
    } else {
      articles.forEach(function (a) {
        a.w = Math.round(a.slot.w * scale);
        a.h = Math.round(a.w * ARTICLES[a.id].ratio);
        a.el.style.width = a.w + 'px';
        a.el.style.height = a.h + 'px';
        a.el.style.setProperty('--w', a.w + 'px');
      });
    }
    articles.forEach(function (a) { a.hx = (a.slot.x / 100) * W; a.hy = (a.slot.y / 100) * H; });
    heroW = W; heroH = H;
    dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
  }

  /* ------------------------------------------------------------------ *
   * Line ripples (canvas)
   * ------------------------------------------------------------------ */
  var rings = [];
  var emitter = null; // { kind, x, y, next }

  function spawnRing(kind, x, y, delay) {
    var r = rng(Math.floor(Math.random() * 1e6) + 1);
    var wob = [];
    for (var i = 0; i < 5; i++) wob.push({ a: (r() - 0.5) * 7, f: 2 + Math.floor(r() * 5), p: r() * 6.28 });
    rings.push({
      kind: kind, x: x, y: y, t: -(delay || 0), dur: reduceMotion ? 0.6 : 3.4,
      max: Math.hypot(Math.max(x, heroW - x), Math.max(y, heroH - y)) + 40,
      wob: wob, w: 1 + r() * 0.9, dash: r() < 0.25
    });
  }

  function drawRings(dt) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, heroW, heroH);
    for (var i = rings.length - 1; i >= 0; i--) {
      var g = rings[i];
      g.t += dt;
      if (g.t < 0) continue;
      var u = g.t / g.dur;
      if (u >= 1) { rings.splice(i, 1); continue; }
      var e = 1 - Math.pow(1 - u, 2.2);
      var R = 30 + e * g.max;
      var alpha = (1 - u) * (u < 0.06 ? u / 0.06 : 1) * 0.85;
      ctx.beginPath();
      var steps = 120;
      for (var s = 0; s <= steps; s++) {
        var th = (s / steps) * Math.PI * 2;
        var off = 0;
        for (var k = 0; k < g.wob.length; k++) off += Math.sin(th * g.wob[k].f + g.wob[k].p) * g.wob[k].a * 0.2;
        var rr = R + off * (0.4 + e);
        var px = g.x + Math.cos(th) * rr, py = g.y + Math.sin(th) * rr * 0.92;
        if (s === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.strokeStyle = COLOURS[g.kind];
      ctx.globalAlpha = alpha;
      ctx.lineWidth = g.w;
      ctx.setLineDash(g.dash ? [6, 6] : []);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.setLineDash([]);
  }

  /* ------------------------------------------------------------------ *
   * Interaction
   * ------------------------------------------------------------------ */
  var active = null;
  var buttons = { pub: hero.querySelector('.cta--pub'), fue: hero.querySelector('.cta--fue') };

  function buttonCentre(kind) {
    var b = buttons[kind].getBoundingClientRect();
    var h = hero.getBoundingClientRect();
    return { x: b.left + b.width / 2 - h.left, y: b.top + b.height / 2 - h.top };
  }

  function activate(kind) {
    if (active === kind) return;
    active = kind;
    hero.setAttribute('data-active', kind);
    var o = buttonCentre(kind);
    // a burst of rings, then a slower steady emission while hovered
    for (var i = 0; i < 4; i++) spawnRing(kind, o.x, o.y, i * 0.16);
    emitter = { kind: kind, x: o.x, y: o.y, next: 0.95 };

    articles.forEach(function (a) {
      var keep = (kind === 'pub' && a.type === 'write') || (kind === 'fue' && a.type === 'sign');
      var dx = a.hx - o.x, dy = a.hy - o.y;
      var dist = Math.hypot(dx, dy) || 1;
      var arrival = dist / 1300;
      if (keep) {
        a.target = 0; a.delay = 0; a.gustT = arrival;
        a.gustAmp = (dx >= 0 ? 1 : -1) * (3 + Math.random() * 2.5);
      } else {
        var ang = Math.atan2(dy, dx) + (Math.random() - 0.5) * 0.35;
        a.dir = { x: Math.cos(ang), y: Math.sin(ang) - 0.18 };
        a.spin = (dx >= 0 ? 1 : -1) * (35 + Math.random() * 55);
        a.tilt = (Math.random() - 0.5) * 70;
        a.travel = Math.max(heroW, heroH) * (1.05 + Math.random() * 0.3);
        a.target = 1;
        a.delay = a.p > 0.02 ? 0 : arrival;
      }
    });
  }

  function deactivate() {
    if (!active) return;
    active = null;
    emitter = null;
    hero.setAttribute('data-active', '');
    articles.forEach(function (a) { a.target = 0; a.delay = Math.random() * 0.18; });
  }

  function insideButton(kind, cx, cy) {
    var b = buttons[kind].getBoundingClientRect();
    return cx >= b.left && cx <= b.right && cy >= b.top && cy <= b.bottom;
  }

  var pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  hero.addEventListener('pointermove', function (e) {
    var hr = hero.getBoundingClientRect();
    pointer.tx = (e.clientX - hr.left) / hr.width - 0.5;
    pointer.ty = (e.clientY - hr.top) / hr.height - 0.5;
    if (e.pointerType === 'touch') return;
    if (insideButton('pub', e.clientX, e.clientY)) activate('pub');
    else if (insideButton('fue', e.clientX, e.clientY)) activate('fue');
    else if (!buttons.pub.matches(':focus-visible') && !buttons.fue.matches(':focus-visible')) deactivate();
  });
  hero.addEventListener('pointerleave', function () { deactivate(); pointer.tx = pointer.ty = 0; });
  window.addEventListener('blur', deactivate);
  ['pub', 'fue'].forEach(function (kind) {
    var b = buttons[kind];
    b.addEventListener('focus', function () { if (b.matches(':focus-visible')) activate(kind); });
    b.addEventListener('blur', deactivate);
    b.addEventListener('pointerdown', function (e) { if (e.pointerType === 'touch') activate(kind); });
  });
  document.addEventListener('pointerdown', function (e) {
    if (e.pointerType === 'touch' && !e.target.closest('.cta')) deactivate();
  });

  /* ------------------------------------------------------------------ *
   * Headline typewriter
   * ------------------------------------------------------------------ */
  var PHRASES = ['creadores de contenido.', 'periodistas.'];
  var rot = hero.querySelector('.js-rot');
  var tw = { i: 0, chars: PHRASES[0].length, mode: 'hold', t: 0 };
  function stepTypewriter(dt) {
    var phrase = PHRASES[tw.i];
    tw.t += dt;
    if (reduceMotion) {
      if (tw.t > 3.2) { tw.t = 0; tw.i = (tw.i + 1) % PHRASES.length; rot.textContent = PHRASES[tw.i]; }
      return;
    }
    if (tw.mode === 'hold' && tw.t > 2.6) { tw.mode = 'delete'; tw.t = 0; }
    else if (tw.mode === 'delete' && tw.t > 0.032) {
      tw.t = 0; tw.chars--;
      if (tw.chars <= 0) { tw.chars = 0; tw.mode = 'pause'; tw.i = (tw.i + 1) % PHRASES.length; }
      rot.textContent = phrase.slice(0, tw.chars);
    } else if (tw.mode === 'pause' && tw.t > 0.35) { tw.mode = 'type'; tw.t = 0; }
    else if (tw.mode === 'type' && tw.t > 0.07) {
      tw.t = 0; tw.chars++;
      rot.textContent = PHRASES[tw.i].slice(0, tw.chars);
      if (tw.chars >= PHRASES[tw.i].length) tw.mode = 'hold';
    }
    hero.classList.toggle('is-typing', tw.mode === 'type' || tw.mode === 'delete');
  }

  /* ------------------------------------------------------------------ *
   * Frame loop
   * ------------------------------------------------------------------ */
  var last = performance.now(), clock = 0, running = true;

  function stepInk(a, dt) {
    var k = a.ink;
    k.t += dt;
    var drawT = k.L / k.speed, hold = 1.4, back = 0.75;
    var x, y, wig = 0, opacity = 1;
    if (k.t < drawT) {
      var pr = k.t / drawT;
      var pt = k.path.getPointAtLength(k.L * pr);
      x = pt.x; y = pt.y;
      k.path.style.strokeDashoffset = (k.L * (1 - pr)).toFixed(2);
      wig = Math.sin(k.t * 22) * 3;
    } else if (k.t < drawT + hold) {
      x = k.end.x; y = k.end.y; k.path.style.strokeDashoffset = 0;
    } else if (k.t < drawT + hold + back) {
      var u = easeInOutCubic((k.t - drawT - hold) / back);
      x = k.end.x + (k.start.x - k.end.x) * u;
      y = k.end.y + (k.start.y - k.end.y) * u - Math.sin(u * Math.PI) * 6;
      opacity = 1 - u;
    } else {
      k.t = 0; k.path.style.strokeDashoffset = k.L; x = k.start.x; y = k.start.y;
    }
    k.path.style.opacity = opacity;
    k.char.setAttribute('transform', 'translate(' + x.toFixed(2) + ' ' + y.toFixed(2) + ') rotate(' + wig.toFixed(2) + ') scale(' + k.s + ') translate(-31 -30)');
  }

  function frame(now) {
    var dt = Math.min(0.05, (now - last) / 1000);
    last = now; clock += dt;

    if (emitter && !reduceMotion) {
      emitter.next -= dt;
      if (emitter.next <= 0) { spawnRing(emitter.kind, emitter.x, emitter.y, 0); emitter.next = 0.85; }
    }
    drawRings(dt);

    pointer.x += (pointer.tx - pointer.x) * Math.min(1, dt * 3);
    pointer.y += (pointer.ty - pointer.y) * Math.min(1, dt * 3);

    articles.forEach(function (a) {
      if (a.delay > 0) a.delay -= dt;
      else if (a.target === 1) a.p = Math.min(1, a.p + dt / (reduceMotion ? 0.3 : 0.95));
      else a.p = Math.max(0, a.p - dt / (reduceMotion ? 0.3 : 1.15));
      var blown = a.p > 0.02;
      if (blown !== a.blown) { a.blown = blown; a.el.classList.toggle('is-blown', blown); }

      var e = Math.pow(a.p, 2.1);
      var bob = reduceMotion ? 0 : Math.sin(clock * 0.55 + a.phase) * 7 * a.depth;
      var sway = reduceMotion ? 0 : Math.sin(clock * 0.4 + a.phase * 1.3) * 0.9;
      var x = a.hx - pointer.x * 26 * a.depth, y = a.hy - pointer.y * 18 * a.depth + bob;
      var rotz = a.slot.r + sway, rx = 0, ry = 0, sc = 1, op = 1;
      if (a.p > 0 && !reduceMotion) {
        var flutter = Math.sin(a.p * Math.PI * 2.6 + a.phase) * 38 * a.p;
        x += a.dir.x * a.travel * e - a.dir.y * flutter;
        y += a.dir.y * a.travel * e + a.dir.x * flutter;
        rotz += a.spin * e + Math.sin(a.p * 9 + a.phase) * 7 * a.p;
        rx = a.tilt * e; ry = a.dir.x * 45 * e; sc = 1 - 0.12 * e;
        op = 1 - smooth(0.6, 1, a.p);
      } else if (a.p > 0) { op = 1 - a.p; }
      if (a.gustT > -1) {
        a.gustT -= dt;
        if (a.gustT < 0) {
          var g = -a.gustT;
          rotz += a.gustAmp * Math.exp(-g * 2.6) * Math.sin(g * 11);
          x += a.gustAmp * 2.2 * Math.exp(-g * 2.6) * Math.sin(g * 9);
          if (g > 2.5) a.gustT = -1;
        }
      }
      a.el.style.transform =
        'translate3d(' + (x - a.w / 2).toFixed(1) + 'px,' + (y - a.h / 2).toFixed(1) + 'px,0) perspective(900px) rotateX(' + rx.toFixed(1) +
        'deg) rotateY(' + ry.toFixed(1) + 'deg) rotate(' + rotz.toFixed(2) + 'deg) scale(' + (sc * a.depth).toFixed(3) + ')';
      a.el.style.opacity = op.toFixed(3);
      a.el.style.visibility = op < 0.01 ? 'hidden' : 'visible';
      a.el.style.zIndex = Math.round(a.depth * 10);
      if (a.ink && !reduceMotion && op > 0.01) stepInk(a, dt);
    });

    stepTypewriter(dt);
    if (running) requestAnimationFrame(frame);
  }

  layout();
  if (reduceMotion) {
    articles.forEach(function (a) {
      if (a.ink) {
        a.ink.path.style.strokeDashoffset = 0;
        a.ink.char.setAttribute('transform', 'translate(' + a.ink.end.x + ' ' + a.ink.end.y + ') scale(' + a.ink.s + ') translate(-31 -30)');
      }
    });
  }
  requestAnimationFrame(function (t) { last = t; frame(t); });

  var resizeTimer;
  window.addEventListener('resize', function () { clearTimeout(resizeTimer); resizeTimer = setTimeout(layout, 120); });
  function resume() { if (!running) { running = true; last = performance.now(); requestAnimationFrame(frame); } }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) { if (entries[0].isIntersecting) resume(); else running = false; }).observe(hero);
  }
  document.addEventListener('visibilitychange', function () { if (document.hidden) running = false; else resume(); });

  window.__pitchealoHero = { activate: activate, deactivate: deactivate };
})();
