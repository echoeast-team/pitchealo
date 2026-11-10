/*
 * Pitchealo hero
 * - floating newspaper articles with the Pitchealo character
 * - typed headline
 * - Publicadores / Fuentes hover: colour ripple from the button + wind that blows
 *   away every article except the ones whose character is writing (Publicadores)
 *   or signing (Fuentes)
 */
(function () {
  'use strict';

  var C = window.PitchealoCharacter;
  var hero = document.querySelector('.hero');
  if (!hero || !C) return;

  var stage = hero.querySelector('.stage');
  var fgLight = hero.querySelector('.fg--light');
  var fgDark = hero.querySelector('.fg--dark');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------ *
   * Content
   * ------------------------------------------------------------------ */
  // Placeholder mastheads and headlines (fictional outlets).
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
    j: { type: 'plain', ratio: 1.3, paper: 'Semanario Sur', kicker: 'Medios', head: 'Qué buscan los periodistas en una buena fuente', photo: 'city' },
    k: { type: 'peek-r', ratio: 1.3, paper: 'El Mirador Pampeano', kicker: 'Deportes', head: 'Nutricionistas desmienten cinco mitos del desayuno', photo: 'chart' },
    l: { type: 'peek-l', ratio: 1.3, paper: 'Diario Cordillera', kicker: 'Turismo', head: 'Los pueblos de montaña que conviene visitar en otoño', photo: 'hills' }
  };

  // Positions: x / y are the card centre as % of the hero; w is width at 1440px.
  var LAYOUT_DESKTOP = [
    { id: 'b', x: 25, y: 5, w: 185, r: 3, z: 0.9 },
    { id: 'a', x: 8, y: 33, w: 195, r: -5, z: 1.05 },
    { id: 'c', x: 7.5, y: 76, w: 210, r: 3, z: 1 },
    { id: 'd', x: 24, y: 99, w: 190, r: -4, z: 0.85 },
    { id: 'l', x: 50, y: 104, w: 230, r: 1, z: 0.8 },
    { id: 'k', x: 76, y: 98, w: 190, r: 4, z: 0.85 },
    { id: 'f', x: 60, y: 4, w: 180, r: -3, z: 0.9 },
    { id: 'g', x: 92, y: 32, w: 195, r: 5, z: 1.05 },
    { id: 'e', x: 92.5, y: 76, w: 210, r: -3, z: 1 }
  ];
  var LAYOUT_WIDE_EXTRA = [
    { id: 'i', x: 18.5, y: 55, w: 150, r: -4, z: 0.75 },
    { id: 'h', x: 81.5, y: 56, w: 150, r: 4, z: 0.75 }
  ];
  var LAYOUT_MOBILE = [
    { id: 'd', x: 13, y: 2, w: 120, r: -4, z: 0.95 },
    { id: 'b', x: 50, y: 1, w: 135, r: 2, z: 1 },
    { id: 'f', x: 87, y: 2.5, w: 130, r: 4, z: 0.95 },
    { id: 'a', x: 15, y: 95, w: 135, r: 4, z: 1 },
    { id: 'l', x: 50, y: 101, w: 140, r: -2, z: 0.9 },
    { id: 'g', x: 85, y: 94, w: 135, r: -4, z: 1 }
  ];

  /* ------------------------------------------------------------------ *
   * Helpers
   * ------------------------------------------------------------------ */
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function smooth(a, b, v) { var t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }
  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
  function easeInOutCubic(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function rng(seed) {
    var s = seed % 2147483647; if (s <= 0) s += 2147483646;
    return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
  }
  function seedOf(str) { var h = 7; for (var i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % 2147483647; return h; }

  // Handwriting: a chain of prolate-cycloid loops, split into "words" by pen lifts.
  function cursive(x0, x1, y, h, rand, opts) {
    opts = opts || {};
    var d = '';
    var x = x0;
    var words = 0;
    while (x < x1 - h * 1.2) {
      var letters = opts.oneWord ? 99 : 2 + Math.floor(rand() * 4);
      d += 'M' + x.toFixed(2) + ' ' + y.toFixed(2);
      for (var l = 0; l < letters && x < x1 - h * 0.6; l++) {
        var big = (opts.capital && words === 0 && l === 0);
        // letter shapes: arch (n, m, u), small loop (e), ascender (l, h), descender (g, y)
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
          var py = y + wob * Math.sin(t / 2) - rise;
          var px = x + wl * t / (Math.PI * 2) + k * Math.sin(t) * dir + rise * 0.28; // right slant
          d += 'L' + px.toFixed(2) + ' ' + py.toFixed(2);
        }
        x += wl;
      }
      words++;
      x += h * (0.8 + rand() * 0.4);
      if (opts.oneWord) break;
    }
    if (opts.flourish) {
      // swoosh back under the signature
      var sx = x - h * 0.8, sy = y;
      for (var j = 1; j <= 16; j++) {
        var u = j / 16;
        var fx = sx + (x0 - h - sx) * u + Math.sin(u * Math.PI) * h * 0.6;
        var fy = sy + h * 0.55 * Math.sin(u * Math.PI) + u * h * 0.2;
        d += 'L' + fx.toFixed(2) + ' ' + fy.toFixed(2);
      }
    }
    return d;
  }

  function photoSVG(kind) {
    var v = 'viewBox="0 0 100 56" preserveAspectRatio="xMidYMid slice"';
    switch (kind) {
      case 'city':
        return '<svg ' + v + '><rect width="100" height="56" fill="#cfd6d6"/><circle cx="78" cy="14" r="7" fill="#e9e3cf"/>' +
          '<path d="M0 56V30h8v-8h7v12h6V18h9v16h5V26h8v30zM48 56V22h10v-6h6v6h6v14h6V28h8v-6h9v8h7v26z" fill="#6f7d80"/>' +
          '<path d="M0 56V40h12v-6h10v8h14v-4h12v6h16v-8h10v10h12v-4h14v14z" fill="#4c5a5e"/></svg>';
      case 'portrait':
        return '<svg ' + v + '><rect width="100" height="56" fill="#d9d0bf"/>' +
          '<g transform="translate(34 6) scale(1.85)" fill="#6c6355"><path d="' + C.HEAD + '"/></g>' +
          '<rect x="0" y="50" width="100" height="6" fill="#bdb3a1"/></svg>';
      case 'chart':
        return '<svg ' + v + '><rect width="100" height="56" fill="#dfe2d4"/>' +
          '<g fill="#7d9a7b"><rect x="12" y="34" width="9" height="16"/><rect x="26" y="28" width="9" height="22"/><rect x="40" y="31" width="9" height="19"/><rect x="54" y="20" width="9" height="30"/><rect x="68" y="14" width="9" height="36"/></g>' +
          '<path d="M10 40L30 30L46 33L60 20L82 10" fill="none" stroke="#3f5f74" stroke-width="2.2" stroke-linecap="round"/>' +
          '<path d="M8 50H90" stroke="#5b6b5a" stroke-width="1"/></svg>';
      case 'sea':
        return '<svg ' + v + '><rect width="100" height="56" fill="#d4dee0"/><circle cx="26" cy="18" r="8" fill="#ece5cc"/>' +
          '<path d="M0 32q12-6 25 0t25 0 25 0 25 0V56H0z" fill="#7896a2"/><path d="M0 42q12-6 25 0t25 0 25 0 25 0V56H0z" fill="#4f7180"/></svg>';
      default:
        return '<svg ' + v + '><rect width="100" height="56" fill="#d8dccd"/><circle cx="72" cy="16" r="7" fill="#efe8cf"/>' +
          '<path d="M0 56L22 24L38 40L56 16L80 44L100 30V56z" fill="#8aa085"/><path d="M0 56L18 40L34 50L60 34L84 52L100 46V56z" fill="#5f7b5c"/></svg>';
    }
  }

  var DATE = 'Jueves 29 de octubre de 2026';

  /* ------------------------------------------------------------------ *
   * Build articles
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
    if (isPeek) {
      var dur = (6.5 + Math.random() * 3).toFixed(2);
      var delay = (-Math.random() * 8).toFixed(2);
      var style = ' style="--peek-dur:' + dur + 's;--peek-delay:' + delay + 's"';
      html += '<div class="peek peek--' + side + '"' + style + '>' + C.svg('peek') + '</div>';
    }

    var limit = isWrite ? ' paper-body--write' : isSign ? ' paper-body--sign' : '';
    html +=
      '<div class="paper">' +
      '<div class="paper-body' + limit + '">' +
      '<div class="mast">' + data.paper + '</div>' +
      '<div class="mast-meta"><span>' + DATE + '</span><span>Edición digital</span></div>' +
      '<div class="kicker">' + data.kicker + '</div>' +
      '<div class="headline">' + data.head + '</div>' +
      (data.photo ? '<div class="photo">' + photoSVG(data.photo) + '</div>' : '<div class="standfirst"></div>') +
      '<div class="cols"><i></i><i></i></div>' +
      '</div>' +
      '</div>';

    // Ink layer: handwriting + character live in one SVG in paper units (width 100).
    var H = 100 * data.ratio;
    var ink = null;
    if (isWrite || isSign) {
      var rand = rng(seedOf(slot.id + data.head));
      var d = '';
      var guides = '';
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
      var s = isWrite ? 0.86 : 0.8;
      html +=
        '<svg class="ink ink--' + data.type + '" viewBox="0 0 100 ' + H.toFixed(2) + '" aria-hidden="true">' +
        guides +
        '<path class="stroke stroke--' + data.type + '" d="' + d + '"/>' +
        '<g class="ink-char">' + C.group(isWrite ? 'write' : 'sign') + '</g>' +
        '</svg>';
      ink = { s: s };
    }

    if (isPeek) {
      html += '<div class="peek-hands peek-hands--' + side + '"></div>';
    }
    el.innerHTML = html;

    // sync hands to the head's timing
    if (isPeek) {
      var pk = el.querySelector('.peek');
      var hands = el.querySelector('.peek-hands');
      hands.setAttribute('style', pk.getAttribute('style'));
      hands.innerHTML = '<span></span><span></span>';
    }

    var a = {
      id: slot.id,
      el: el,
      type: data.type,
      slot: slot,
      w: w,
      h: hgt,
      hx: 0, hy: 0,
      depth: slot.z || 1,
      phase: Math.random() * Math.PI * 2,
      // wind state
      p: 0, target: 0, delay: 0, dir: { x: 1, y: 0 }, spin: 0, travel: 0,
      gustT: -1, gustAmp: 0,
      blown: false
    };

    if (ink) {
      var path = el.querySelector('.stroke');
      var L = path.getTotalLength();
      path.style.strokeDasharray = L + ' ' + (L + 10);
      path.style.strokeDashoffset = L;
      a.ink = {
        path: path,
        L: L,
        char: el.querySelector('.ink-char'),
        s: ink.s,
        speed: isWrite ? 46 : 34,
        t: Math.random() * 3,
        start: path.getPointAtLength(0),
        end: path.getPointAtLength(L)
      };
    }
    return a;
  }

  var scale = 1;
  var mode = '';

  function layout() {
    var W = hero.clientWidth;
    var H = hero.clientHeight;
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
        var data = ARTICLES[a.id];
        a.w = Math.round(a.slot.w * scale);
        a.h = Math.round(a.w * data.ratio);
        a.el.style.width = a.w + 'px';
        a.el.style.height = a.h + 'px';
        a.el.style.setProperty('--w', a.w + 'px');
      });
    }
    articles.forEach(function (a) {
      a.hx = (a.slot.x / 100) * W;
      a.hy = (a.slot.y / 100) * H;
    });
    heroW = W; heroH = H;
  }

  /* ------------------------------------------------------------------ *
   * Colour ripples
   * ------------------------------------------------------------------ */
  var heroW = 0, heroH = 0;
  var ripples = {
    pub: { el: hero.querySelector('.ripple--pub'), r: 0, x: 0, y: 0, tw: null, key: 'p' },
    fue: { el: hero.querySelector('.ripple--fue'), r: 0, x: 0, y: 0, tw: null, key: 'f' }
  };

  function tweenRipple(rp, to, dur, ease, now) {
    rp.tw = { from: rp.r, to: to, t0: now, dur: dur, ease: ease };
  }

  function applyRipples() {
    var anyOpen = false;
    ['pub', 'fue'].forEach(function (k) {
      var rp = ripples[k];
      var r = rp.r.toFixed(1) + 'px';
      var x = rp.x.toFixed(1) + 'px';
      var y = rp.y.toFixed(1) + 'px';
      rp.el.style.clipPath = 'circle(' + r + ' at ' + x + ' ' + y + ')';
      rp.el.style.webkitClipPath = rp.el.style.clipPath;
      [fgLight, fgDark].forEach(function (fg) {
        fg.style.setProperty('--' + rp.key + 'r', r);
        fg.style.setProperty('--' + rp.key + 'x', x);
        fg.style.setProperty('--' + rp.key + 'y', y);
      });
      if (rp.r > 0.5) anyOpen = true;
    });
    fgDark.classList.toggle('is-visible', anyOpen);
  }

  /* ------------------------------------------------------------------ *
   * Interaction
   * ------------------------------------------------------------------ */
  var active = null;
  var lightButtons = {
    pub: fgLight.querySelector('.cta--pub'),
    fue: fgLight.querySelector('.cta--fue')
  };

  function buttonCentre(kind) {
    var b = lightButtons[kind].getBoundingClientRect();
    var h = hero.getBoundingClientRect();
    return { x: b.left + b.width / 2 - h.left, y: b.top + b.height / 2 - h.top };
  }

  function activate(kind) {
    if (active === kind) return;
    var now = performance.now();
    if (active) closeRipple(active, now);
    active = kind;
    hero.setAttribute('data-active', kind);
    fgDark.setAttribute('data-tone', kind);

    var o = buttonCentre(kind);
    var rp = ripples[kind];
    rp.x = o.x; rp.y = o.y;
    var far = Math.max(
      Math.hypot(o.x, o.y), Math.hypot(heroW - o.x, o.y),
      Math.hypot(o.x, heroH - o.y), Math.hypot(heroW - o.x, heroH - o.y)
    ) + 8;
    ripples.pub.el.style.zIndex = kind === 'pub' ? 2 : 1;
    ripples.fue.el.style.zIndex = kind === 'fue' ? 2 : 1;
    tweenRipple(rp, far, reduceMotion ? 180 : 1050, easeOutCubic, now);

    // wind
    articles.forEach(function (a) {
      var keep = (kind === 'pub' && a.type === 'write') || (kind === 'fue' && a.type === 'sign');
      var dx = a.hx - o.x, dy = a.hy - o.y;
      var dist = Math.hypot(dx, dy) || 1;
      var arrival = dist / 1500;
      if (keep) {
        a.target = 0;
        a.delay = 0;
        a.gustT = arrival;
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

  function closeRipple(kind, now) {
    tweenRipple(ripples[kind], 0, reduceMotion ? 160 : 650, easeInOutCubic, now);
  }

  function deactivate() {
    if (!active) return;
    closeRipple(active, performance.now());
    active = null;
    hero.setAttribute('data-active', '');
    articles.forEach(function (a) {
      a.target = 0;
      a.delay = Math.random() * 0.18;
    });
  }

  function insideButton(kind, cx, cy) {
    var b = lightButtons[kind].getBoundingClientRect();
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
    else if (!lightButtons.pub.matches(':focus-visible') && !lightButtons.fue.matches(':focus-visible')) deactivate();
  });
  hero.addEventListener('pointerleave', function () { deactivate(); pointer.tx = pointer.ty = 0; });
  window.addEventListener('blur', deactivate);

  ['pub', 'fue'].forEach(function (kind) {
    var b = lightButtons[kind];
    b.addEventListener('focus', function () { if (b.matches(':focus-visible')) activate(kind); });
    b.addEventListener('blur', deactivate);
    // touch: play the effect on press
    b.addEventListener('pointerdown', function (e) { if (e.pointerType === 'touch') activate(kind); });
  });
  document.addEventListener('pointerdown', function (e) {
    if (e.pointerType === 'touch' && !e.target.closest('.cta')) deactivate();
  });

  /* ------------------------------------------------------------------ *
   * Headline typewriter
   * ------------------------------------------------------------------ */
  var PHRASES = ['creadores de contenido.', 'periodistas.'];
  var rotators = hero.querySelectorAll('.js-rot');
  var tw = { i: 0, chars: PHRASES[0].length, mode: 'hold', t: 0 };

  function setRot(text) {
    for (var i = 0; i < rotators.length; i++) rotators[i].textContent = text;
  }

  function stepTypewriter(dt) {
    var phrase = PHRASES[tw.i];
    tw.t += dt;
    if (reduceMotion) {
      if (tw.t > 3.2) { tw.t = 0; tw.i = (tw.i + 1) % PHRASES.length; setRot(PHRASES[tw.i]); }
      return;
    }
    if (tw.mode === 'hold' && tw.t > 2.6) { tw.mode = 'delete'; tw.t = 0; }
    else if (tw.mode === 'delete' && tw.t > 0.032) {
      tw.t = 0; tw.chars--;
      if (tw.chars <= 0) { tw.chars = 0; tw.mode = 'pause'; tw.i = (tw.i + 1) % PHRASES.length; }
      setRot(phrase.slice(0, tw.chars));
    } else if (tw.mode === 'pause' && tw.t > 0.35) { tw.mode = 'type'; tw.t = 0; }
    else if (tw.mode === 'type' && tw.t > 0.07) {
      tw.t = 0; tw.chars++;
      setRot(PHRASES[tw.i].slice(0, tw.chars));
      if (tw.chars >= PHRASES[tw.i].length) { tw.mode = 'hold'; }
    }
    hero.classList.toggle('is-typing', tw.mode === 'type' || tw.mode === 'delete');
  }

  /* ------------------------------------------------------------------ *
   * Frame loop
   * ------------------------------------------------------------------ */
  var last = performance.now();
  var clock = 0;
  var running = true;

  function stepInk(a, dt) {
    var k = a.ink;
    k.t += dt;
    var drawT = k.L / k.speed;
    var hold = 1.4, back = 0.75;
    var x, y, wig = 0, opacity = 1;
    if (k.t < drawT) {
      var pr = k.t / drawT;
      var pt = k.path.getPointAtLength(k.L * pr);
      x = pt.x; y = pt.y;
      k.path.style.strokeDashoffset = (k.L * (1 - pr)).toFixed(2);
      wig = Math.sin(k.t * 22) * 3;
    } else if (k.t < drawT + hold) {
      x = k.end.x; y = k.end.y;
      k.path.style.strokeDashoffset = 0;
    } else if (k.t < drawT + hold + back) {
      var u = easeInOutCubic((k.t - drawT - hold) / back);
      x = k.end.x + (k.start.x - k.end.x) * u;
      y = k.end.y + (k.start.y - k.end.y) * u - Math.sin(u * Math.PI) * 6;
      opacity = 1 - u;
    } else {
      k.t = 0;
      k.path.style.strokeDashoffset = k.L;
      x = k.start.x; y = k.start.y;
      opacity = 1;
    }
    k.path.style.opacity = opacity;
    k.char.setAttribute('transform',
      'translate(' + x.toFixed(2) + ' ' + y.toFixed(2) + ') rotate(' + wig.toFixed(2) + ') scale(' + k.s + ') translate(-31 -30)');
  }

  function frame(now) {
    var dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    clock += dt;

    // ripples
    ['pub', 'fue'].forEach(function (k) {
      var rp = ripples[k];
      if (rp.tw) {
        var t = clamp((now - rp.tw.t0) / rp.tw.dur, 0, 1);
        rp.r = rp.tw.from + (rp.tw.to - rp.tw.from) * rp.tw.ease(t);
        if (t >= 1) rp.tw = null;
      }
    });
    applyRipples();

    pointer.x += (pointer.tx - pointer.x) * Math.min(1, dt * 3);
    pointer.y += (pointer.ty - pointer.y) * Math.min(1, dt * 3);

    articles.forEach(function (a) {
      // wind progress
      if (a.delay > 0) a.delay -= dt;
      else if (a.target === 1) a.p = Math.min(1, a.p + dt / (reduceMotion ? 0.3 : 0.95));
      else a.p = Math.max(0, a.p - dt / (reduceMotion ? 0.3 : 1.15));

      var blown = a.p > 0.02;
      if (blown !== a.blown) { a.blown = blown; a.el.classList.toggle('is-blown', blown); }

      var e = Math.pow(a.p, 2.1);
      var bob = reduceMotion ? 0 : Math.sin(clock * 0.55 + a.phase) * 7 * a.depth;
      var sway = reduceMotion ? 0 : Math.sin(clock * 0.4 + a.phase * 1.3) * 0.9;
      var px = -pointer.x * 26 * a.depth;
      var py = -pointer.y * 18 * a.depth;

      var x = a.hx + px, y = a.hy + py + bob, rot = a.slot.r + sway, rx = 0, ry = 0, sc = 1, op = 1;

      if (a.p > 0 && !reduceMotion) {
        var perpX = -a.dir.y, perpY = a.dir.x;
        var flutter = Math.sin(a.p * Math.PI * 2.6 + a.phase) * 38 * a.p;
        x += a.dir.x * a.travel * e + perpX * flutter;
        y += a.dir.y * a.travel * e + perpY * flutter;
        rot += a.spin * e + Math.sin(a.p * 9 + a.phase) * 7 * a.p;
        rx = a.tilt * e;
        ry = a.dir.x * 45 * e;
        sc = 1 - 0.12 * e;
        op = 1 - smooth(0.6, 1, a.p);
      } else if (a.p > 0) {
        op = 1 - a.p;
      }

      // gust wobble for the articles that stay
      if (a.gustT > -1) {
        a.gustT -= dt;
        if (a.gustT < 0) {
          var g = -a.gustT;
          rot += a.gustAmp * Math.exp(-g * 2.6) * Math.sin(g * 11);
          x += a.gustAmp * 2.2 * Math.exp(-g * 2.6) * Math.sin(g * 9);
          if (g > 2.5) a.gustT = -1;
        }
      }

      a.el.style.transform =
        'translate3d(' + (x - a.w / 2).toFixed(1) + 'px,' + (y - a.h / 2).toFixed(1) + 'px,0) ' +
        'perspective(900px) rotateX(' + rx.toFixed(1) + 'deg) rotateY(' + ry.toFixed(1) + 'deg) rotate(' + rot.toFixed(2) + 'deg) scale(' + (sc * a.depth).toFixed(3) + ')';
      a.el.style.opacity = op.toFixed(3);
      a.el.style.visibility = op < 0.01 ? 'hidden' : 'visible';
      a.el.style.zIndex = Math.round(a.depth * 10);

      if (a.ink && !reduceMotion && op > 0.01) stepInk(a, dt);
    });

    stepTypewriter(dt);
    if (running) requestAnimationFrame(frame);
  }

  /* ------------------------------------------------------------------ *
   * Init
   * ------------------------------------------------------------------ */
  layout();
  if (reduceMotion) {
    articles.forEach(function (a) {
      if (a.ink) {
        a.ink.path.style.strokeDashoffset = 0;
        a.ink.char.setAttribute('transform',
          'translate(' + a.ink.end.x + ' ' + a.ink.end.y + ') scale(' + a.ink.s + ') translate(-31 -30)');
      }
    });
  }
  requestAnimationFrame(function (t) { last = t; frame(t); });

  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(layout, 120);
  });

  // Pause the loop when the hero is off screen or the tab is hidden.
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      var vis = entries[0].isIntersecting;
      if (vis && !running) { running = true; last = performance.now(); requestAnimationFrame(frame); }
      else if (!vis) running = false;
    }).observe(hero);
  }
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) running = false;
    else if (!running) { running = true; last = performance.now(); requestAnimationFrame(frame); }
  });

  // expose for debugging / screenshots
  window.__pitchealoHero = { activate: activate, deactivate: deactivate, articles: function () { return articles; } };
})();
