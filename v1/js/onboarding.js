/*
 * Pitchealo V1 · sign-up + onboarding (prototype)
 * Nothing leaves the page: no network calls, no storage. State lives in memory only.
 */
(function () {
  'use strict';

  var C = window.PitchealoCharacter;
  var doc = document;
  var body = doc.body;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function $(sel, root) { return (root || doc).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || doc).querySelectorAll(sel)); }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ------------------------------------------------------------------ *
   * Content
   * ------------------------------------------------------------------ */
  var ESPECIALIDADES = [
    'Economía y finanzas', 'Tecnología e IA', 'Salud y bienestar', 'Emprendedores y pymes',
    'Agro y alimentos', 'Ambiente y clima', 'Educación', 'Derecho y políticas públicas',
    'Ciencia e investigación', 'Cultura y entretenimiento', 'Turismo y gastronomía', 'Deportes'
  ];
  var FORMATOS = [
    'Diarios digitales', 'Newsletters', 'Podcasts', 'Radio', 'Televisión', 'Revistas',
    'Agencias de noticias', 'Medios regionales', 'Blogs especializados', 'Creadores en redes',
    'Streaming', 'Suplementos y especiales'
  ];
  var REPRESENTA = [
    { v: 'yo', label: 'Solo a mí', desc: 'Respondo con mi propia experiencia.' },
    { v: 'org', label: 'A mi organización', desc: 'Hablo en nombre de mi empresa o institución.' },
    { v: 'clientes', label: 'A clientes o voceros', desc: 'Soy profesional de PR y presento a otras personas.' }
  ];
  var ALERTAS = [
    { v: 'ya', label: 'Apenas se publican', desc: 'Te avisamos en el momento.', icon: 'bolt' },
    { v: 'diario', label: 'Resumen diario', desc: 'Un correo por la mañana.', icon: 'sun' },
    { v: 'semanal', label: 'Resumen semanal', desc: 'Todos los lunes.', icon: 'cal' }
  ];

  var state = {
    types: { pub: false, fue: false },
    name: '',
    email: '',
    pub: { formatos: [], medio: '', temas: [], link: '', titulo: '', desc: '' },
    fue: { temas: [], cargo: '', org: '', representa: '', alertas: 'diario', soloTemas: true }
  };

  function firstName() {
    var n = (state.name || '').trim().split(/\s+/)[0] || '';
    return n.charAt(0).toUpperCase() + n.slice(1);
  }
  function sideOfTypes() {
    if (state.types.pub && state.types.fue) return 'both';
    if (state.types.pub) return 'pub';
    if (state.types.fue) return 'fue';
    return 'none';
  }
  function setSide(side) { body.setAttribute('data-side', side); }

  /* ------------------------------------------------------------------ *
   * Small SVG helpers
   * ------------------------------------------------------------------ */
  var ICON = {
    check: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.4l2.9 2.8 6.1-6.4"/></svg>',
    bolt: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13 2.5L4.5 13.5H11L10 21.5 19.5 10H13z"/></svg>',
    sun: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6"/></svg>',
    cal: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 9.5h17M8 3v4M16 3v4"/><path d="M7.5 13.5h3M7.5 16.8h6"/></svg>',
    bell: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.6 2H4.4z"/><path d="M10 20.5a2.2 2.2 0 0 0 4 0"/></svg>',
    link: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1.2 1.2"/><path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1.2-1.2"/></svg>',
    lens: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l5.5 5.5"/></svg>'
  };

  function charSvg(pose, colour, cls) {
    var s = C.svg(pose, { className: cls || '' });
    if (colour) s = s.replace('<svg ', '<svg style="--pc-colour:' + colour + '" ');
    return s;
  }

  function miniPaper(i) {
    return '<span class="ob-mini-paper" style="--i:' + i + '"><i></i><i></i><i></i></span>';
  }

  // Handwriting path generator (prolate-cycloid loops), same idea as the hero.
  function rng(seed) {
    var s = seed % 2147483647; if (s <= 0) s += 2147483646;
    return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
  }
  function cursive(x0, x1, y, h, seed, opts) {
    opts = opts || {};
    var rand = rng(seed);
    var d = 'M' + x0.toFixed(2) + ' ' + y.toFixed(2);
    var x = x0;
    var first = true;
    while (x < x1 - h * 0.8) {
      var cap = opts.capital && first;
      var roll = rand();
      var lh = h * (cap ? 2.6 : roll < 0.25 ? 1.8 : 0.7 + rand() * 0.25);
      var wl = h * (cap ? 1.3 : 0.55 + rand() * 0.2);
      var k = wl * (roll < 0.25 || cap ? 0.32 : 0.12 + rand() * 0.1);
      for (var i = 1; i <= 12; i++) {
        var t = (i / 12) * Math.PI * 2;
        var rise = lh * (1 - Math.cos(t)) / 2;
        d += 'L' + (x + wl * t / (Math.PI * 2) + k * Math.sin(t) + rise * 0.28).toFixed(2) + ' ' + (y - rise).toFixed(2);
      }
      x += wl;
      first = false;
    }
    if (opts.flourish) {
      var sx = x;
      for (var j = 1; j <= 14; j++) {
        var u = j / 14;
        d += 'L' + (sx + (x0 - h - sx) * u).toFixed(2) + ' ' + (y + h * 0.5 * Math.sin(u * Math.PI) + u * h * 0.15).toFixed(2);
      }
    }
    return d;
  }

  // Animates a character along an ink path (used for signing). Returns a stop() function.
  function inkWriter(svg, opts) {
    var path = $('.ob-ink-stroke', svg);
    var ch = $('.ob-ink-char', svg);
    if (!path || !ch) return function () {};
    var L = path.getTotalLength();
    var start = path.getPointAtLength(0);
    var end = path.getPointAtLength(L);
    var s = opts.scale || 1;
    var speed = opts.speed || 40;
    path.style.strokeDasharray = L + ' ' + (L + 10);
    function place(x, y, rot) {
      ch.setAttribute('transform', 'translate(' + x.toFixed(2) + ' ' + y.toFixed(2) + ') rotate(' + (rot || 0).toFixed(2) + ') scale(' + s + ') translate(-31 -30)');
    }
    if (reduceMotion) {
      path.style.strokeDashoffset = 0;
      place(end.x, end.y, 0);
      return function () {};
    }
    var t = 0, last = performance.now(), raf = 0, alive = true;
    var drawT = L / speed, hold = 1.6, back = 0.7;
    function frame(now) {
      if (!alive) return;
      var dt = Math.min(0.05, (now - last) / 1000); last = now; t += dt;
      var x, y, wig = 0, op = 1;
      if (t < drawT) {
        var p = path.getPointAtLength(L * (t / drawT));
        x = p.x; y = p.y; wig = Math.sin(t * 22) * 3;
        path.style.strokeDashoffset = (L * (1 - t / drawT)).toFixed(2);
      } else if (t < drawT + hold) {
        x = end.x; y = end.y; path.style.strokeDashoffset = 0;
      } else if (t < drawT + hold + back) {
        var u = (t - drawT - hold) / back; u = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
        x = end.x + (start.x - end.x) * u; y = end.y + (start.y - end.y) * u - Math.sin(u * Math.PI) * 6;
        op = 1 - u;
      } else {
        t = 0; x = start.x; y = start.y; path.style.strokeDashoffset = L;
      }
      path.style.opacity = op;
      place(x, y, wig);
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    return function () { alive = false; cancelAnimationFrame(raf); };
  }

  /* ------------------------------------------------------------------ *
   * Form controls used by the steps
   * ------------------------------------------------------------------ */
  function chipsHtml(name, items, selected) {
    return '<div class="ob-chips" role="group" aria-label="' + esc(name) + '">' + items.map(function (it, i) {
      var on = selected.indexOf(it) > -1;
      return '<button type="button" class="ob-chip' + (on ? ' is-on' : '') + '" aria-pressed="' + on + '" data-chip="' + esc(it) + '" style="--i:' + i + '">' +
        '<span class="ob-chip-check" aria-hidden="true">' + ICON.check + '</span><span>' + esc(it) + '</span></button>';
    }).join('') + '</div>';
  }
  function bindChips(root, arr, onChange) {
    $$('.ob-chip', root).forEach(function (b) {
      b.addEventListener('click', function () {
        var v = b.getAttribute('data-chip');
        var i = arr.indexOf(v);
        if (i > -1) arr.splice(i, 1); else arr.push(v);
        var on = i === -1;
        b.classList.toggle('is-on', on);
        b.setAttribute('aria-pressed', on);
        b.classList.remove('is-pop'); void b.offsetWidth; b.classList.add('is-pop');
        if (onChange) onChange();
      });
    });
  }
  function radioCards(name, items, value, iconFn) {
    return '<div class="ob-radios" role="radiogroup" aria-label="' + esc(name) + '">' + items.map(function (it, i) {
      var id = 'r-' + name.replace(/\W+/g, '') + '-' + it.v;
      return '<label class="ob-radio" for="' + id + '" style="--i:' + i + '">' +
        '<input type="radio" id="' + id + '" name="' + esc(name) + '" value="' + it.v + '"' + (value === it.v ? ' checked' : '') + '>' +
        (iconFn ? '<span class="ob-radio-icon" aria-hidden="true">' + iconFn(it) + '</span>' : '<span class="ob-radio-dot" aria-hidden="true"></span>') +
        '<span class="ob-radio-text"><span class="ob-radio-label">' + esc(it.label) + '</span><span class="ob-radio-desc">' + esc(it.desc) + '</span></span>' +
        '</label>';
    }).join('') + '</div>';
  }
  function field(id, label, value, opts) {
    opts = opts || {};
    var tag = opts.textarea
      ? '<textarea id="' + id + '" rows="' + (opts.rows || 4) + '"' + (opts.max ? ' maxlength="' + opts.max + '"' : '') + ' placeholder="' + esc(opts.ph || '') + '">' + esc(value) + '</textarea>'
      : '<input id="' + id + '" type="' + (opts.type || 'text') + '" value="' + esc(value) + '"' + (opts.max ? ' maxlength="' + opts.max + '"' : '') + ' placeholder="' + esc(opts.ph || '') + '"' + (opts.auto ? ' autocomplete="' + opts.auto + '"' : '') + '>';
    return '<div class="ob-field">' +
      '<label for="' + id + '">' + esc(label) + (opts.optional ? ' <span class="ob-optional">(opcional)</span>' : '') + '</label>' +
      tag +
      (opts.hint ? '<p class="ob-field-hint">' + esc(opts.hint) + '</p>' : '') +
      '</div>';
  }
  function eyebrow(side) {
    if (side === 'pub') return '<p class="ob-eyebrow">Publicador</p>';
    if (side === 'fue') return '<p class="ob-eyebrow">Fuente</p>';
    return '<p class="ob-eyebrow">Fuente y publicador</p>';
  }
  function peekHtml() {
    return '<div class="ob-peek" aria-hidden="true">' + C.svg('peek') + '<span class="ob-peek-hand"></span><span class="ob-peek-hand"></span></div>';
  }

  /* ------------------------------------------------------------------ *
   * Steps
   * ------------------------------------------------------------------ */
  var S = {};

  S.welcome = {
    label: 'Bienvenida',
    render: function (side) {
      var both = side === 'both';
      var lead = side === 'pub'
        ? 'Te damos la bienvenida a Pitchealo. Contanos sobre tu trabajo para encontrar las fuentes indicadas.'
        : side === 'fue'
          ? 'Te damos la bienvenida a Pitchealo. En unos pasos vas a estar listo para responder solicitudes de periodistas y creadores.'
          : 'Te damos la bienvenida a Pitchealo. En unos pasos vas a estar listo para buscar fuentes y responder solicitudes.';
      var chars = both
        ? '<div class="ob-welcome-chars is-both">' + charSvg('wave', 'var(--green)') + charSvg('wave', 'var(--blue)', 'ob-flip') + '</div>'
        : '<div class="ob-welcome-chars">' + charSvg('wave') + '</div>';
      var plan = this.plan || [];
      return '<div class="ob-scr ob-scr--split">' +
        '<div class="ob-visual ob-visual--welcome" aria-hidden="true">' +
          '<span class="ob-ring"></span><span class="ob-ring"></span><span class="ob-ring"></span>' +
          [0, 1, 2, 3].map(miniPaper).join('') + chars +
        '</div>' +
        '<div class="ob-body">' + eyebrow(side) +
          '<h2 class="ob-title" tabindex="-1">¡Hola, ' + esc(firstName()) + '!</h2>' +
          '<p class="ob-lead">' + lead + '</p>' +
          '<ol class="ob-plan">' + plan.map(function (p, i) {
            return '<li style="--i:' + i + '" class="ob-plan-item ob-plan-item--' + p.side + '"><span class="ob-plan-num">' + (i + 1) + '</span>' + esc(p.label) + '</li>';
          }).join('') + '</ol>' +
        '</div></div>';
    },
    nextLabel: 'Empezar'
  };

  // ---- Fuente ----
  S.fueTemas = {
    label: 'Tu especialidad', side: 'fue',
    render: function () {
      return '<div class="ob-scr ob-scr--wide">' +
        '<div class="ob-body">' + eyebrow('fue') +
          '<h2 class="ob-title" tabindex="-1">¿Sobre qué temas podés aportar?</h2>' +
          '<p class="ob-lead">Elegí al menos uno. Vamos a mostrarte solicitudes relacionadas con tu experiencia.</p>' +
          '<div class="ob-chips-wrap">' + peekHtml() + chipsHtml('Temas', ESPECIALIDADES, state.fue.temas) + '</div>' +
          '<p class="ob-count" data-count></p>' +
        '</div></div>';
    },
    mount: function (el) { var upd = function () { countLabel(el, state.fue.temas.length); }; bindChips(el, state.fue.temas, upd); upd(); },
    validate: function () { return state.fue.temas.length ? '' : 'Elegí al menos un tema para que podamos mostrarte solicitudes que te interesen.'; }
  };

  S.fuePerfil = {
    label: 'Tu perfil', side: 'fue',
    render: function () {
      return '<div class="ob-scr ob-scr--split">' +
        '<div class="ob-visual ob-visual--badge" aria-hidden="true">' +
          '<div class="ob-badge">' +
            '<div class="ob-badge-top"><span>Pitchealo</span><span>Fuente</span></div>' +
            '<div class="ob-badge-char">' + charSvg('hello') + '</div>' +
            '<p class="ob-badge-name" data-b-name>' + esc(state.name || 'Tu nombre') + '</p>' +
            '<p class="ob-badge-role" data-b-role>' + esc(state.fue.cargo || 'Tu cargo o rol') + '</p>' +
            '<p class="ob-badge-org" data-b-org>' + esc(state.fue.org || '') + '</p>' +
            '<div class="ob-badge-tags">' + state.fue.temas.slice(0, 3).map(function (t) { return '<span>' + esc(t) + '</span>'; }).join('') + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="ob-body">' + eyebrow('fue') +
          '<h2 class="ob-title" tabindex="-1">Contanos quién sos</h2>' +
          '<p class="ob-lead">Los publicadores ven estos datos cuando reciben tu respuesta.</p>' +
          field('f-cargo', 'Cargo o rol', state.fue.cargo, { ph: 'Ej.: Economista, fundadora, médico pediatra', auto: 'organization-title' }) +
          field('f-org', 'Organización', state.fue.org, { optional: true, ph: 'Ej.: Universidad de Buenos Aires', auto: 'organization' }) +
          '<p class="ob-label" id="rep-label">¿A quién representás?</p>' +
          radioCards('A quién representás', REPRESENTA, state.fue.representa) +
        '</div></div>';
    },
    mount: function (el) {
      var cargo = $('#f-cargo', el), org = $('#f-org', el);
      cargo.addEventListener('input', function () { state.fue.cargo = cargo.value; $('[data-b-role]', el).textContent = cargo.value || 'Tu cargo o rol'; pulse($('.ob-badge', el)); });
      org.addEventListener('input', function () { state.fue.org = org.value; $('[data-b-org]', el).textContent = org.value; pulse($('.ob-badge', el)); });
      $$('input[type=radio]', el).forEach(function (r) { r.addEventListener('change', function () { state.fue.representa = r.value; }); });
    },
    validate: function (el) {
      if (!state.fue.cargo.trim()) { return { msg: 'Contanos tu cargo o rol: ayuda a los publicadores a saber por qué sos la persona indicada.', focus: '#f-cargo' }; }
      if (!state.fue.representa) { return { msg: 'Elegí a quién representás. Podés cambiarlo más adelante.', focus: 'input[type=radio]' }; }
      return '';
    }
  };

  S.fueResponder = {
    label: 'Cómo responder', side: 'fue',
    render: function () {
      var H = 38, base = 27;
      var sig = cursive(50, 88, base, 3.4, 7, { capital: true, flourish: true });
      return '<div class="ob-scr ob-scr--split ob-scr--card">' +
        '<div class="ob-visual ob-visual--card">' +
          '<article class="ob-req" aria-label="Solicitud de ejemplo">' +
            '<header class="ob-req-head"><span class="ob-req-avatar" aria-hidden="true">CD</span>' +
              '<span><span class="ob-req-name">Camila Duarte</span><span class="ob-req-role">Productora de un podcast de negocios</span></span></header>' +
            '<p class="ob-req-title">Estafas por WhatsApp: cómo proteger una pyme</p>' +
            '<p class="ob-req-desc">Busco una fuente con experiencia en ciberseguridad que pueda explicar los riesgos más frecuentes y compartir recomendaciones prácticas para una entrevista.</p>' +
            '<svg class="ob-ink" viewBox="0 0 100 ' + H + '" aria-hidden="true">' +
              '<path d="M40 ' + (base + 2.4) + 'H94" class="ob-ink-rule"/>' +
              '<text x="40" y="' + (base + 8) + '" class="ob-ink-label">TU RESPUESTA</text>' +
              '<path class="ob-ink-stroke" d="' + sig + '"/>' +
              '<g class="ob-ink-char">' + C.group('sign') + '</g>' +
            '</svg>' +
          '</article>' +
        '</div>' +
        '<div class="ob-body">' + eyebrow('fue') +
          '<h2 class="ob-title" tabindex="-1">Responder solicitudes</h2>' +
          '<p class="ob-lead">Encontrá pedidos de periodistas y respondé aquellos en los que vos o la fuente que representás puedan aportar.</p>' +
          '<ul class="ob-tips">' +
            '<li style="--i:0"><span class="ob-tip-num">1</span><span><strong>Respondé solo si podés aportar.</strong> Los publicadores valoran las respuestas que encajan con su pedido.</span></li>' +
            '<li style="--i:1"><span class="ob-tip-num">2</span><span><strong>Sé concreto:</strong> datos, ejemplos y experiencia propia.</span></li>' +
            '<li style="--i:2"><span class="ob-tip-num">3</span><span><strong>Evitá lo promocional.</strong> Contá lo que sabés, no lo que vendés.</span></li>' +
          '</ul>' +
        '</div></div>';
    },
    mount: function (el) {
      var stop = inkWriter($('.ob-ink', el), { scale: 0.62, speed: 30 });
      return stop;
    }
  };

  S.fueAlertas = {
    label: 'Alertas', side: 'fue',
    render: function () {
      return '<div class="ob-scr ob-scr--split">' +
        '<div class="ob-visual ob-visual--alerts" aria-hidden="true">' +
          '<div class="ob-alerts-head"><span class="ob-bell">' + ICON.bell + '</span>' + charSvg('hello') + '</div>' +
          '<div class="ob-notes" data-notes></div>' +
        '</div>' +
        '<div class="ob-body">' + eyebrow('fue') +
          '<h2 class="ob-title" tabindex="-1">¿Cuándo querés enterarte de nuevas solicitudes?</h2>' +
          '<p class="ob-lead">Te avisamos por correo a <strong>' + esc(state.email || 'tu correo') + '</strong>.</p>' +
          radioCards('Frecuencia de alertas', ALERTAS, state.fue.alertas, function (it) { return ICON[it.icon]; }) +
          '<label class="ob-switch"><input type="checkbox" role="switch" data-solo' + (state.fue.soloTemas ? ' checked' : '') + '>' +
            '<span class="ob-switch-track" aria-hidden="true"><span></span></span>' +
            '<span>Solo solicitudes de mis temas</span></label>' +
        '</div></div>';
    },
    mount: function (el) {
      var notesEl = $('[data-notes]', el);
      var timer = 0, n = 0;
      var temas = state.fue.temas.length ? state.fue.temas : ESPECIALIDADES;
      function note(text, sub, digest) {
        var d = doc.createElement('div');
        d.className = 'ob-note' + (digest ? ' ob-note--digest' : '');
        d.innerHTML = '<span class="ob-note-dot"></span><span><strong>' + esc(text) + '</strong><span>' + esc(sub) + '</span></span>';
        notesEl.prepend(d);
        $$('.ob-note', notesEl).slice(3).forEach(function (x) { x.remove(); });
        var bell = $('.ob-bell', el); bell.classList.remove('is-ring'); void bell.offsetWidth; bell.classList.add('is-ring');
      }
      function run() {
        clearInterval(timer);
        notesEl.innerHTML = '';
        var mode = state.fue.alertas;
        var only = state.fue.soloTemas;
        var pool = only ? temas : ESPECIALIDADES;
        if (mode === 'ya') {
          var tick = function () { n++; note('Nueva solicitud', pool[n % pool.length] + ' · hace ' + (n % 3 + 1) + ' min'); };
          tick(); timer = setInterval(tick, reduceMotion ? 4000 : 1700);
        } else if (mode === 'diario') {
          note('Tu resumen de hoy', Math.min(9, pool.length + 3) + ' solicitudes nuevas · 8:00', true);
        } else {
          note('Tu resumen semanal', (pool.length * 4 + 6) + ' solicitudes · lunes 9:00', true);
        }
      }
      $$('input[type=radio]', el).forEach(function (r) { r.addEventListener('change', function () { state.fue.alertas = r.value; run(); }); });
      $('[data-solo]', el).addEventListener('change', function (e) { state.fue.soloTemas = e.target.checked; run(); });
      run();
      return function () { clearInterval(timer); };
    }
  };

  // ---- Publicador ----
  S.pubMedio = {
    label: 'Tu medio', side: 'pub',
    render: function () {
      return '<div class="ob-scr ob-scr--split">' +
        '<div class="ob-visual ob-visual--paper" aria-hidden="true">' +
          '<div class="ob-pwrap"><div class="ob-paper-peek">' + C.svg('peek') + '</div>' +
          '<div class="ob-paper">' +
            '<p class="ob-paper-mast" data-mast>' + esc(state.pub.medio || 'Tu medio') + '</p>' +
            '<p class="ob-paper-meta"><span>Edición digital</span><span data-fmt>' + esc(fmtLine()) + '</span></p>' +
            '<div class="ob-paper-head"></div><div class="ob-paper-head ob-paper-head--short"></div>' +
            '<div class="ob-paper-cols"><i></i><i></i></div>' +
          '</div></div>' +
        '</div>' +
        '<div class="ob-body">' + eyebrow('pub') +
          '<h2 class="ob-title" tabindex="-1">¿Qué tipo de contenido producís?</h2>' +
          '<p class="ob-lead">Elegí todos los que correspondan.</p>' +
          chipsHtml('Tipos de contenido', FORMATOS, state.pub.formatos) +
          field('p-medio', 'Nombre del medio o proyecto', state.pub.medio, { ph: 'Ej.: La Voz Costera, Café con Datos' }) +
        '</div></div>';
    },
    mount: function (el) {
      var mast = $('[data-mast]', el), fmt = $('[data-fmt]', el), paper = $('.ob-paper', el);
      bindChips(el, state.pub.formatos, function () { fmt.textContent = fmtLine(); pulse(paper); });
      $('#p-medio', el).addEventListener('input', function (e) { state.pub.medio = e.target.value; mast.textContent = e.target.value || 'Tu medio'; });
    },
    validate: function () {
      if (!state.pub.formatos.length) return 'Elegí al menos un tipo de contenido.';
      if (!state.pub.medio.trim()) return { msg: 'Contanos el nombre de tu medio o proyecto. Si es personal, podés poner tu nombre.', focus: '#p-medio' };
      return '';
    }
  };
  function fmtLine() {
    var f = state.pub.formatos;
    if (!f.length) return 'Formato';
    return f.length > 2 ? f[0] + ' y ' + (f.length - 1) + ' más' : f.join(' · ');
  }

  S.pubTemas = {
    label: 'Tus temas', side: 'pub',
    render: function () {
      return '<div class="ob-scr ob-scr--wide">' +
        '<div class="ob-body">' + eyebrow('pub') +
          '<h2 class="ob-title" tabindex="-1">¿Qué temas cubrís?</h2>' +
          '<p class="ob-lead">Te vamos a sugerir fuentes especializadas en estos temas.</p>' +
          '<div class="ob-chips-wrap">' + peekHtml() + chipsHtml('Temas', ESPECIALIDADES, state.pub.temas) + '</div>' +
          '<p class="ob-count" data-count></p>' +
        '</div></div>';
    },
    mount: function (el) { var upd = function () { countLabel(el, state.pub.temas.length); }; bindChips(el, state.pub.temas, upd); upd(); },
    validate: function () { return state.pub.temas.length ? '' : 'Elegí al menos un tema que cubras.'; }
  };

  S.pubVerif = {
    label: 'Verificación', side: 'pub',
    render: function () {
      return '<div class="ob-scr ob-scr--split">' +
        '<div class="ob-visual ob-visual--verify" aria-hidden="true">' +
          '<div class="ob-pwrap"><div class="ob-doc-peek">' + C.svg('peek') + '</div>' +
          '<div class="ob-doc">' +
            '<p class="ob-doc-title">Pedido de alta</p>' +
            ['Identidad', 'Medio o proyecto', 'Trabajo publicado'].map(function (t, i) {
              return '<div class="ob-doc-row" style="--i:' + i + '"><span class="ob-doc-tick">' + ICON.check + '</span><span>' + t + '</span></div>';
            }).join('') +
            '<span class="ob-lens">' + ICON.lens + '</span>' +
          '</div></div>' +
        '</div>' +
        '<div class="ob-body">' + eyebrow('pub') +
          '<h2 class="ob-title" tabindex="-1">Revisamos cada pedido a mano</h2>' +
          '<p class="ob-lead">Así las fuentes saben que del otro lado hay un medio real. Compartinos un link a algo que hayas publicado para agilizar la revisión.</p>' +
          field('p-link', 'Link a una nota, perfil o portfolio', state.pub.link, { type: 'url', optional: true, ph: 'https://', auto: 'url' }) +
          '<p class="ob-callout"><span class="ob-callout-icon" aria-hidden="true">' + ICON.check + '</span>Te avisamos por correo cuando tu cuenta esté habilitada, en general en menos de 24 horas.</p>' +
        '</div></div>';
    },
    mount: function (el) { $('#p-link', el).addEventListener('input', function (e) { state.pub.link = e.target.value; }); },
    validate: function () {
      var v = state.pub.link.trim();
      if (v && !/^(https?:\/\/)?[^\s.]+\.[^\s]{2,}/i.test(v)) return { msg: 'Ese link no parece completo. Revisalo o dejalo vacío por ahora.', focus: '#p-link' };
      return '';
    }
  };

  S.pubSolicitud = {
    label: 'Tu primera solicitud', side: 'pub',
    render: function () {
      return '<div class="ob-scr ob-scr--wide ob-scr--compose">' +
        '<div class="ob-body">' + eyebrow('pub') +
          '<h2 class="ob-title" tabindex="-1">Tu primera solicitud</h2>' +
          '<p class="ob-lead">Contanos qué estás buscando. Podés guardarla como borrador y publicarla cuando quieras.</p>' +
          '<div class="ob-compose">' +
            '<div class="ob-compose-form">' +
              field('p-titulo', 'Título', state.pub.titulo, { max: 90, ph: 'Ej.: ¿Cómo se adapta el campo a la sequía?' }) +
              field('p-desc', 'Descripción', state.pub.desc, { textarea: true, rows: 5, max: 400, ph: 'Qué tipo de fuente buscás, para qué contenido y para cuándo.' }) +
              '<p class="ob-field-hint" data-chars></p>' +
            '</div>' +
            '<div class="ob-compose-preview">' +
              '<p class="ob-preview-label" aria-hidden="true">Vista previa</p>' +
              '<article class="ob-req ob-req--preview" aria-live="polite" aria-label="Vista previa de tu solicitud">' +
                '<header class="ob-req-head"><span class="ob-req-avatar" aria-hidden="true">' + esc(initials()) + '</span>' +
                  '<span><span class="ob-req-name">' + esc(state.name) + '</span><span class="ob-req-role">' + esc(state.pub.medio || 'Publicador') + '</span></span></header>' +
                '<span class="ob-req-label">Borrador</span>' +
                '<p class="ob-req-title" data-pv-title></p>' +
                '<p class="ob-req-desc" data-pv-desc></p>' +
                '<ul class="ob-req-tags">' + state.pub.temas.slice(0, 2).map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>' +
                '<div class="ob-writer" aria-hidden="true">' + C.svg('write') + '</div>' +
              '</article>' +
            '</div>' +
          '</div>' +
        '</div></div>';
    },
    mount: function (el) {
      var t = $('#p-titulo', el), d = $('#p-desc', el), card = $('.ob-req--preview', el), chars = $('[data-chars]', el);
      var typingTimer = 0;
      function upd() {
        state.pub.titulo = t.value; state.pub.desc = d.value;
        $('[data-pv-title]', el).textContent = t.value || 'Tu título aparece acá';
        $('[data-pv-desc]', el).textContent = d.value || 'Describí qué tipo de fuente buscás y para qué contenido.';
        $('[data-pv-title]', el).classList.toggle('is-empty', !t.value);
        $('[data-pv-desc]', el).classList.toggle('is-empty', !d.value);
        chars.textContent = d.value.length + ' / 400';
      }
      function typing() { card.classList.add('is-typing'); clearTimeout(typingTimer); typingTimer = setTimeout(function () { card.classList.remove('is-typing'); }, 700); upd(); }
      t.addEventListener('input', typing); d.addEventListener('input', typing);
      upd();
      return function () { clearTimeout(typingTimer); };
    }
  };
  function initials() {
    return (state.name || '').trim().split(/\s+/).slice(0, 2).map(function (w) { return w.charAt(0).toUpperCase(); }).join('') || 'P';
  }

  S.done = {
    label: 'Listo',
    render: function (side) {
      var hasPub = state.types.pub, hasFue = state.types.fue;
      var title = hasPub && !hasFue ? '¡Gracias, ' + esc(firstName()) + '!' : '¡Todo listo, ' + esc(firstName()) + '!';
      var lead = hasPub && !hasFue ? 'Tu cuenta está en revisión.'
        : hasPub ? 'Ya podés responder solicitudes. Tu cuenta de publicador está en revisión.'
        : 'Ya podés empezar a responder solicitudes de periodistas y creadores.';
      var items = [];
      if (hasPub) {
        items.push(['Tu medio', (state.pub.medio || '') + (state.pub.formatos.length ? ' · ' + state.pub.formatos.join(', ') : '')]);
        items.push(['Temas que cubrís', state.pub.temas.join(', ')]);
        items.push(['Solicitud', state.pub.titulo ? '«' + state.pub.titulo + '» guardada como borrador' : 'Sin solicitud todavía']);
      }
      if (hasFue) {
        items.push(['Tu especialidad', state.fue.temas.join(', ')]);
        items.push(['Tu perfil', [state.fue.cargo, state.fue.org].filter(Boolean).join(' · ') + ' · ' + (REPRESENTA.filter(function (r) { return r.v === state.fue.representa; })[0] || {}).label]);
        items.push(['Alertas', (ALERTAS.filter(function (a) { return a.v === state.fue.alertas; })[0] || {}).label + (state.fue.soloTemas ? ', solo de tus temas' : '')]);
      }
      var chars = side === 'both'
        ? '<div class="ob-done-chars is-both">' + charSvg('celebrate', 'var(--green)') + charSvg('celebrate', 'var(--blue)', 'ob-flip') + '</div>'
        : '<div class="ob-done-chars">' + charSvg('celebrate') + '</div>';
      return '<div class="ob-scr ob-scr--split ob-scr--done">' +
        '<div class="ob-visual ob-visual--done" aria-hidden="true">' + chars + '</div>' +
        '<div class="ob-body">' + eyebrow(side) +
          '<h2 class="ob-title" tabindex="-1">' + title + '</h2>' +
          '<p class="ob-lead">' + lead + '</p>' +
          (hasFue ? '<p class="ob-quota"><strong>Te quedan 10 respuestas</strong> este mes</p>' : '') +
          '<dl class="ob-summary">' + items.map(function (it, i) {
            return '<div style="--i:' + i + '"><dt>' + esc(it[0]) + '</dt><dd>' + esc(it[1]) + '</dd></div>';
          }).join('') + '</dl>' +
        '</div></div>';
    },
    mount: function () { confetti(); },
    nextLabel: function () { return state.types.pub && !state.types.fue ? 'Ir a mi panel' : 'Ver solicitudes'; },
    final: true
  };

  function countLabel(el, n) {
    var c = $('[data-count]', el);
    if (!c) return;
    c.textContent = n === 0 ? 'Ningún tema seleccionado' : n === 1 ? '1 tema seleccionado' : n + ' temas seleccionados';
    c.classList.toggle('is-on', n > 0);
  }
  function pulse(node) {
    if (!node || reduceMotion) return;
    node.classList.remove('is-pulse'); void node.offsetWidth; node.classList.add('is-pulse');
  }

  /* ------------------------------------------------------------------ *
   * Flow engine
   * ------------------------------------------------------------------ */
  var stage = $('[data-stage]');
  var flowEl = $('#flow');
  var steps = [];
  var idx = 0;
  var cleanup = null;
  var busy = false;

  function buildSteps() {
    var side = sideOfTypes();
    var list = [{ key: 'welcome', side: side === 'none' ? 'fue' : side }];
    if (state.types.pub) ['pubMedio', 'pubTemas', 'pubVerif', 'pubSolicitud'].forEach(function (k) { list.push({ key: k, side: 'pub' }); });
    if (state.types.fue) ['fueTemas', 'fuePerfil', 'fueResponder', 'fueAlertas'].forEach(function (k) { list.push({ key: k, side: 'fue' }); });
    list.push({ key: 'done', side: side });
    S.welcome.plan = list.slice(1, -1).map(function (s) { return { label: S[s.key].label, side: s.side }; });
    return list;
  }

  function renderProgress() {
    var n = steps.length, cur = steps[idx];
    $('[data-progress-count]').textContent = 'Paso ' + (idx + 1) + ' de ' + n;
    $('[data-progress-label]').textContent = S[cur.key].label;
    var nxt = steps[idx + 1];
    $('[data-progress-next]').textContent = nxt ? 'Siguiente: ' + S[nxt.key].label : '';
    var bar = $('[data-progress-bar]');
    bar.setAttribute('aria-valuemax', n);
    bar.setAttribute('aria-valuenow', idx + 1);
    bar.setAttribute('aria-valuetext', 'Paso ' + (idx + 1) + ' de ' + n + ': ' + S[cur.key].label);
    if (bar.children.length !== n) {
      bar.innerHTML = steps.map(function (s) { return '<span class="ob-seg ob-seg--' + s.side + '"><i></i></span>'; }).join('');
    }
    $$('.ob-seg', bar).forEach(function (seg, i) {
      seg.classList.toggle('is-done', i < idx);
      seg.classList.toggle('is-current', i === idx);
    });
  }

  function renderStep(dir) {
    var cur = steps[idx];
    var def = S[cur.key];
    setSide(cur.side);
    var wrap = doc.createElement('div');
    wrap.className = 'ob-screen';
    wrap.innerHTML = def.render.call(def, cur.side) + '<p class="ob-error" role="alert" data-error></p>';
    swap(wrap, dir);
    if (cleanup) { cleanup(); cleanup = null; }
    var c = def.mount ? def.mount(wrap) : null;
    if (typeof c === 'function') cleanup = c;
    // a kind error disappears as soon as the person acts on it
    var clearStepError = function () {
      var e = $('[data-error]', wrap);
      if (e && e.textContent && !(def.validate && def.validate(wrap))) { e.textContent = ''; e.classList.remove('is-shown'); }
    };
    wrap.addEventListener('input', clearStepError);
    wrap.addEventListener('change', clearStepError);
    wrap.addEventListener('click', function (ev) { if (ev.target.closest('.ob-chip')) setTimeout(clearStepError, 0); });

    var prev = $('[data-prev]'), next = $('[data-next]');
    prev.hidden = idx === 0;
    var nl = def.nextLabel;
    $('[data-next-label]').textContent = typeof nl === 'function' ? nl() : (nl || (idx === steps.length - 2 ? 'Finalizar' : 'Siguiente'));
    next.classList.toggle('is-final', !!def.final);
    renderProgress();
    $('[data-live]').textContent = 'Paso ' + (idx + 1) + ' de ' + steps.length + ': ' + def.label;
    var title = $('.ob-title', wrap);
    if (title) setTimeout(function () { title.focus({ preventScroll: true }); }, reduceMotion ? 0 : 120);
    if (flowEl.getBoundingClientRect().top < 0) flowEl.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  }

  var SPRING = 'cubic-bezier(.2, 1.15, .3, 1)';
  function swap(next, dir) {
    var old = stage.firstElementChild;
    if (!old || reduceMotion || !next.animate) {
      if (old) old.remove();
      stage.appendChild(next);
      if (old && next.animate) next.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 160 });
      return;
    }
    var h0 = stage.offsetHeight;
    old.style.position = 'absolute'; old.style.inset = '0 0 auto 0';
    old.setAttribute('aria-hidden', 'true');
    $$('input,button,textarea,a', old).forEach(function (n) { n.tabIndex = -1; });
    stage.appendChild(next);
    var h1 = next.offsetHeight;
    var d = dir < 0 ? -1 : 1;
    stage.animate([{ height: h0 + 'px' }, { height: h1 + 'px' }], { duration: 520, easing: 'cubic-bezier(.3,.8,.3,1)' });
    old.animate([{ opacity: 1, transform: 'translateX(0)' }, { opacity: 0, transform: 'translateX(' + (-48 * d) + 'px)' }], { duration: 260, easing: 'cubic-bezier(.4,0,1,1)', fill: 'forwards' })
      .onfinish = function () { old.remove(); };
    next.animate([{ opacity: 0, transform: 'translateX(' + (56 * d) + 'px)' }, { opacity: 1, transform: 'translateX(0)' }], { duration: 620, delay: 90, easing: SPRING, fill: 'backwards' });
    busy = true; setTimeout(function () { busy = false; }, 300);
  }

  function showError(msg, focusSel) {
    var screen = stage.lastElementChild;
    var e = $('[data-error]', screen);
    e.textContent = msg;
    e.classList.remove('is-shown'); void e.offsetWidth; e.classList.add('is-shown');
    var card = $('.ob-flow-card');
    if (!reduceMotion && card.animate) card.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(5px)' }, { transform: 'translateX(-3px)' }, { transform: 'translateX(0)' }], { duration: 360 });
    if (focusSel) { var f = $(focusSel, screen); if (f) f.focus(); }
  }

  function goNext() {
    if (busy) return;
    var def = S[steps[idx].key];
    var res = def.validate ? def.validate(stage.lastElementChild) : '';
    if (res) { if (typeof res === 'string') showError(res); else showError(res.msg, res.focus); return; }
    if (def.final) { finish(); return; }
    idx++;
    renderStep(1);
  }
  function goPrev() {
    if (busy || idx === 0) return;
    idx--;
    renderStep(-1);
  }
  function finish() {
    var next = $('[data-next]');
    next.disabled = true;
    $('[data-next-label]').textContent = 'Abriendo…';
    confetti();
    setTimeout(function () { window.location.href = 'index.html'; }, reduceMotion ? 400 : 1300);
  }

  $('[data-next]').addEventListener('click', goNext);
  $('[data-prev]').addEventListener('click', goPrev);
  flowEl.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' || e.isComposing) return;
    var t = e.target;
    if (t.tagName === 'TEXTAREA' || (t.tagName === 'BUTTON' && !t.hasAttribute('data-next')) || t.tagName === 'A' || t.getAttribute('role') === 'switch') return;
    if (t.hasAttribute('data-next')) return; // the button's own click handles it
    e.preventDefault();
    goNext();
  });

  /* ------------------------------------------------------------------ *
   * Confetti of tiny newspapers
   * ------------------------------------------------------------------ */
  function confetti() {
    if (reduceMotion) return;
    var host = $('[data-confetti]');
    var cols = state.types.pub && state.types.fue ? ['var(--green)', 'var(--blue)'] : state.types.pub ? ['var(--green)'] : ['var(--blue)'];
    var W = window.innerWidth;
    for (var i = 0; i < 36; i++) {
      var p = doc.createElement('span');
      p.className = 'ob-conf';
      p.style.setProperty('--c', cols[i % cols.length]);
      p.innerHTML = '<i></i><i></i><i></i>';
      host.appendChild(p);
      var x0 = W * (0.15 + Math.random() * 0.7);
      var dx = (Math.random() - 0.5) * 520;
      var rot = (Math.random() - 0.5) * 900;
      var fall = window.innerHeight * (0.7 + Math.random() * 0.5);
      var dur = 1600 + Math.random() * 1400;
      p.style.left = x0 + 'px';
      var a = p.animate([
        { transform: 'translate(0,-40px) rotate(0deg) scale(.6)', opacity: 0 },
        { transform: 'translate(' + dx * 0.35 + 'px,' + (-140 - Math.random() * 160) + 'px) rotate(' + rot * 0.3 + 'deg) scale(1)', opacity: 1, offset: 0.25 },
        { transform: 'translate(' + dx + 'px,' + fall + 'px) rotate(' + rot + 'deg) scale(.9)', opacity: 0 }
      ], { duration: dur, delay: Math.random() * 300, easing: 'cubic-bezier(.2,.6,.4,1)', fill: 'both' });
      a.onfinish = (function (node) { return function () { node.remove(); }; })(p);
    }
  }

  /* ------------------------------------------------------------------ *
   * Sign-up
   * ------------------------------------------------------------------ */
  var form = $('#signup-form');
  var cbFue = $('input[name=as_expert]', form);
  var cbPub = $('input[name=as_journalist]', form);

  // icons + art
  $('[data-icon=sign]').innerHTML = charSvg('sign');
  $('[data-icon=write]').innerHTML = charSvg('write');
  $('[data-art=none]').innerHTML = charSvg('wave', 'var(--ink)');
  $('[data-art=pub]').innerHTML = charSvg('write');
  $('[data-art=fue]').innerHTML = charSvg('sign');

  function syncTypes() {
    state.types.fue = cbFue.checked;
    state.types.pub = cbPub.checked;
    var side = sideOfTypes();
    setSide(side);
    body.setAttribute('data-sel', side);
    if (side !== 'none') clearErr('type-error');
  }
  [cbFue, cbPub].forEach(function (cb) {
    cb.addEventListener('change', function () {
      syncTypes();
      var opt = cb.closest('.ob-type-option');
      opt.classList.remove('is-pop'); void opt.offsetWidth; opt.classList.add('is-pop');
    });
  });

  var params = new URLSearchParams(window.location.search);
  var tipo = (params.get('tipo') || '').toLowerCase();
  if (tipo === 'publicador' || tipo === 'periodista') cbPub.checked = true;
  if (tipo === 'fuente' || tipo === 'experto') cbFue.checked = true;
  syncTypes();

  // password
  var pw = $('#password');
  var toggle = $('.ob-password-toggle');
  toggle.addEventListener('click', function () {
    var show = pw.type === 'password';
    pw.type = show ? 'text' : 'password';
    toggle.textContent = show ? 'Ocultar' : 'Mostrar';
    toggle.setAttribute('aria-pressed', show);
    pw.focus();
  });
  pw.addEventListener('input', function () {
    var v = pw.value, s = 0;
    if (v.length >= 8) s++;
    if (v.length >= 12 || (/\d/.test(v) && /[a-zA-Z]/.test(v))) s++;
    if (/[^a-zA-Z0-9]/.test(v) && v.length >= 10) s++;
    $('.ob-password-meter').setAttribute('data-strength', v ? s : '');
    if (v.length >= 8) clearErr('password-error');
  });
  $('#full_name').addEventListener('input', function (e) { if (e.target.value.trim().length > 1) clearErr('full_name-error'); });
  $('#email').addEventListener('input', function (e) { if (validEmail(e.target.value)) clearErr('email-error'); });

  function validEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()); }
  function setErr(id, msg) {
    var e = $('#' + id);
    e.textContent = msg;
    var f = e.closest('.ob-field, .ob-type-picker');
    if (f) f.classList.add('has-error');
    var input = f && $('input:not([type=checkbox])', f);
    if (input) input.setAttribute('aria-invalid', 'true');
  }
  function clearErr(id) {
    var e = $('#' + id);
    if (!e || !e.textContent) return;
    e.textContent = '';
    var f = e.closest('.ob-field, .ob-type-picker');
    if (f) f.classList.remove('has-error');
    var input = f && $('input:not([type=checkbox])', f);
    if (input) input.removeAttribute('aria-invalid');
  }

  $$('[data-login]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      var n = $('#login-note');
      n.textContent = 'En este prototipo el recorrido empieza al crear una cuenta. Completá el formulario para verlo.';
      n.classList.remove('is-shown'); void n.offsetWidth; n.classList.add('is-shown');
    });
  });
  if (params.get('modo') === 'ingresar') {
    $('#login-note').textContent = 'En este prototipo el recorrido empieza al crear una cuenta. Completá el formulario para verlo.';
    $('#login-note').classList.add('is-shown');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = $('#full_name').value.trim();
    var email = $('#email').value.trim();
    var bad = [];
    if (!state.types.fue && !state.types.pub) { setErr('type-error', 'Elegí si vas a usar Pitchealo como fuente, como publicador o las dos.'); bad.push(cbFue); }
    if (name.length < 2) { setErr('full_name-error', 'Escribí tu nombre y apellido.'); bad.push($('#full_name')); }
    if (!validEmail(email)) { setErr('email-error', email ? 'Revisá el correo: parece que le falta algo.' : 'Necesitamos tu correo para avisarte de nuevas oportunidades.'); bad.push($('#email')); }
    if (pw.value.length < 8) { setErr('password-error', 'Usá al menos 8 caracteres.'); bad.push(pw); }
    if (bad.length) {
      bad[0].focus();
      if (!reduceMotion && form.animate) form.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(5px)' }, { transform: 'translateX(-3px)' }, { transform: 'translateX(0)' }], { duration: 360 });
      return;
    }
    state.name = name;
    state.email = email;
    pw.value = ''; // never keep the password around
    if (state.types.pub && state.types.fue && !state.fue.temas.length) state.fue.temas = [];
    startFlow();
  });

  function startFlow() {
    steps = buildSteps();
    idx = 0;
    var signup = $('#signup');
    var go = function () {
      signup.hidden = true;
      flowEl.hidden = false;
      body.setAttribute('data-view', 'flow');
      renderStep(1);
      if (!reduceMotion && flowEl.animate) {
        flowEl.animate([{ opacity: 0, transform: 'translateY(24px) scale(.98)' }, { opacity: 1, transform: 'none' }], { duration: 600, easing: SPRING });
      }
      window.scrollTo({ top: 0, behavior: 'auto' });
    };
    if (reduceMotion || !signup.animate) { go(); return; }
    signup.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(-16px) scale(.98)' }], { duration: 280, easing: 'cubic-bezier(.4,0,1,1)', fill: 'forwards' })
      .onfinish = go;
  }

  // Prefill fuente topics from publicador topics when doing both, on entering that step
  var origFueRender = S.fueTemas.render;
  S.fueTemas.render = function () {
    if (state.types.pub && !state.fue.temas.length && state.pub.temas.length) {
      Array.prototype.push.apply(state.fue.temas, state.pub.temas);
    }
    return origFueRender.apply(this, arguments);
  };

  // debug hook for testing
  window.__obState = state;
})();
