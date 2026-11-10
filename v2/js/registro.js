/*
 * Pitchealo V2: sign-up + onboarding (prototype; nothing leaves the page)
 * - live recolour while choosing Fuente / Publicador / both
 * - validation with inline errors
 * - one screen at a time with a numbered stepper, animated transitions and
 *   the sketch character on every screen; flow and colour follow the user type
 *   (both = Publicador steps, then Fuente steps)
 */
(function () {
  'use strict';

  var C = window.PitchealoSketch;
  var body = document.body;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var FORMATS = ['Diarios digitales', 'Newsletters', 'Podcasts', 'Radio', 'Televisión', 'Revistas', 'Agencias de noticias',
    'Medios regionales', 'Blogs especializados', 'Creadores en redes', 'Streaming', 'Suplementos y especiales'];
  var TOPICS = ['Economía y finanzas', 'Tecnología e IA', 'Salud y bienestar', 'Emprendedores y pymes', 'Agro y alimentos',
    'Ambiente y clima', 'Educación', 'Derecho y políticas públicas', 'Ciencia e investigación', 'Cultura y entretenimiento',
    'Turismo y gastronomía', 'Deportes'];
  var REPRESENTA = [
    { v: 'yo', t: 'Solo a mí', d: 'Respondo con mi propia experiencia.' },
    { v: 'org', t: 'A mi organización', d: 'Hablo en nombre de una empresa, ONG o institución.' },
    { v: 'pr', t: 'A clientes o voceros', d: 'Soy profesional de PR y presento a otras personas.' }
  ];
  var ALERTAS = [
    { v: 'ya', t: 'Apenas se publican', d: 'Ideal si querés responder primero.' },
    { v: 'diario', t: 'Resumen diario', d: 'Un correo por la mañana con lo nuevo.' },
    { v: 'semanal', t: 'Resumen semanal', d: 'Los lunes, todo lo de la semana.' }
  ];

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  }

  /* ------------------------------------------------------------------ *
   * Sign-up
   * ------------------------------------------------------------------ */
  var signup = document.getElementById('signup');
  var form = document.getElementById('signup-form');
  var optFue = form.querySelector('input[name="as_expert"]');
  var optPub = form.querySelector('input[name="as_journalist"]');
  var nameIn = form.querySelector('#full_name');
  var emailIn = form.querySelector('#email');
  var pwIn = form.querySelector('#password');

  function setErr(input, errId, on) {
    var e = document.getElementById(errId);
    e.classList.toggle('is-on', !!on);
    if (input) input.setAttribute('aria-invalid', on ? 'true' : 'false');
  }

  function syncSide() {
    var p = optPub.checked, f = optFue.checked;
    body.dataset.side = p && f ? 'both' : p ? 'pub' : f ? 'fue' : '';
    optPub.closest('.opt').classList.toggle('is-on', p);
    optFue.closest('.opt').classList.toggle('is-on', f);
    if (p || f) setErr(null, 'err-type', false);
  }
  [optPub, optFue].forEach(function (o) { o.addEventListener('change', syncSide); });

  var params = new URLSearchParams(window.location.search);
  var tipo = params.get('tipo');
  if (tipo === 'publicador') optPub.checked = true;
  if (tipo === 'fuente') optFue.checked = true;
  syncSide();

  var pwToggle = form.querySelector('.pw-toggle');
  pwToggle.addEventListener('click', function () {
    var show = pwIn.type === 'password';
    pwIn.type = show ? 'text' : 'password';
    pwToggle.textContent = show ? 'Ocultar' : 'Mostrar';
    pwToggle.setAttribute('aria-pressed', show ? 'true' : 'false');
  });

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  function checks() {
    return [
      { ok: optPub.checked || optFue.checked, input: null, err: 'err-type', focus: optFue },
      { ok: nameIn.value.trim().length > 1, input: nameIn, err: 'err-name', focus: nameIn },
      { ok: EMAIL_RE.test(emailIn.value.trim()), input: emailIn, err: 'err-email', focus: emailIn },
      { ok: pwIn.value.length >= 8, input: pwIn, err: 'err-pw', focus: pwIn }
    ];
  }
  [nameIn, emailIn, pwIn].forEach(function (inp) {
    inp.addEventListener('input', function () {
      checks().forEach(function (c) { if (c.input === inp && c.ok) setErr(inp, c.err, false); });
    });
  });

  var state = null;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var first = null;
    checks().forEach(function (c) {
      setErr(c.input, c.err, !c.ok);
      if (!c.ok && !first) first = c.focus;
    });
    if (first) { first.focus(); return; }
    var full = nameIn.value.trim();
    state = {
      name: full, first: full.split(/\s+/)[0],
      types: (optPub.checked ? ['pub'] : []).concat(optFue.checked ? ['fue'] : []),
      formats: [], medio: '', temasPub: [], link: '', reqTitle: '', reqDesc: '',
      espec: [], cargo: '', org: '', representa: 'yo', alertas: 'diario', soloTemas: true
    };
    // the password is never stored or sent anywhere
    pwIn.value = '';
    startOnboarding();
  });

  /* ------------------------------------------------------------------ *
   * Onboarding steps
   * ------------------------------------------------------------------ */
  var ob = document.getElementById('onboarding');
  var obForm = ob.querySelector('.ob-form');
  var pane = ob.querySelector('.ob-pane');
  var stepper = ob.querySelector('.stepper');
  var art = ob.querySelector('.ob-art');
  var artChar = ob.querySelector('.ob-art-char');
  var artPaper = ob.querySelector('.ob-art-paper');
  var bar = ob.querySelector('.ob-bar');
  var who = ob.querySelector('.ob-who');
  var count = ob.querySelector('.ob-count');
  var prevBtn = ob.querySelector('.ob-prev');
  var nextBtn = ob.querySelector('.ob-next');
  var skipBtn = ob.querySelector('.ob-skip');

  function chips(name, list, selected, legend) {
    return '<fieldset class="chips" aria-describedby="err-step"><legend class="sr-only">' + esc(legend) + '</legend>' +
      list.map(function (t) {
        return '<label class="chip"><input type="checkbox" name="' + name + '" value="' + esc(t) + '"' + (selected.indexOf(t) > -1 ? ' checked' : '') + '><span>' + esc(t) + '</span></label>';
      }).join('') + '</fieldset>';
  }
  function radios(name, list, value, legend) {
    return '<fieldset class="radios"><legend class="field-legend label" style="font:500 14px/20px var(--font-ui);margin-bottom:4px">' + esc(legend) + '</legend>' +
      list.map(function (o) {
        return '<label class="radio"><input type="radio" name="' + name + '" value="' + o.v + '"' + (o.v === value ? ' checked' : '') + '>' +
          '<span class="radio-dot"></span><span class="radio-text"><strong>' + esc(o.t) + '</strong><small>' + esc(o.d) + '</small></span></label>';
      }).join('') + '</fieldset>';
  }
  function err() { return '<p class="err" id="err-step" role="alert"></p>'; }
  function checked(name) { return [].map.call(pane.querySelectorAll('input[name="' + name + '"]:checked'), function (i) { return i.value; }); }
  function val(name) { var el = pane.querySelector('[name="' + name + '"]'); return el ? el.value.trim() : ''; }
  function list(a) { return a.length ? a.map(esc).join(', ') : '<span style="color:var(--muted)">Sin completar</span>'; }

  var STEPS = {
    welcome: {
      label: 'Bienvenida', pose: 'wave', caption: 'Te damos la bienvenida',
      render: function () {
        var t = state.types.length === 2
          ? 'Te damos la bienvenida a Pitchealo. Vamos a preparar tu cuenta como publicador y como fuente: primero contanos sobre tu trabajo y después sobre lo que sabés.'
          : state.types[0] === 'pub'
            ? 'Te damos la bienvenida a Pitchealo. Contanos sobre tu trabajo para encontrar las fuentes indicadas.'
            : 'Te damos la bienvenida a Pitchealo. En unos pasos vas a estar listo para responder solicitudes de periodistas y creadores.';
        return '<p class="ob-kicker">Bienvenida</p>' +
          '<h2 class="ob-title" id="ob-title" tabindex="-1">¡Hola, <em>' + esc(state.first) + '</em>!</h2>' +
          '<p class="ob-text">' + t + '</p>' +
          '<p class="callout">Son unos pocos pasos y podés volver atrás cuando quieras.</p>';
      }
    },
    medio: {
      label: 'Tu medio', pose: 'hello', caption: 'Tu medio',
      render: function () {
        return '<p class="ob-kicker">Tu medio</p><h2 class="ob-title" id="ob-title" tabindex="-1">¿Qué tipo de contenido producís?</h2>' +
          '<p class="ob-text">Elegí todos los formatos que correspondan.</p>' +
          chips('formats', FORMATS, state.formats, 'Formatos') + err() +
          '<div class="field"><label for="f-medio">Nombre del medio o proyecto <span class="opt-hint">(opcional)</span></label>' +
          '<input class="input" id="f-medio" name="medio" type="text" value="' + esc(state.medio) + '" placeholder="Ej.: La Gaceta Andina, Mi newsletter de ciencia"></div>';
      },
      validate: function () { return checked('formats').length ? null : 'Elegí al menos un formato.'; },
      collect: function () { state.formats = checked('formats'); state.medio = val('medio'); }
    },
    temasPub: {
      label: 'Tus temas', pose: 'peek', caption: 'Tus temas',
      render: function () {
        return '<p class="ob-kicker">Tus temas</p><h2 class="ob-title" id="ob-title" tabindex="-1">¿Qué temas cubrís?</h2>' +
          '<p class="ob-text">Así te sugerimos fuentes especializadas para cada historia.</p>' +
          chips('temasPub', TOPICS, state.temasPub, 'Temas') + err();
      },
      validate: function () { return checked('temasPub').length ? null : 'Elegí al menos un tema.'; },
      collect: function () { state.temasPub = checked('temasPub'); }
    },
    verif: {
      label: 'Verificación', pose: 'hello', caption: 'Revisión manual',
      render: function () {
        return '<p class="ob-kicker">Verificación</p><h2 class="ob-title" id="ob-title" tabindex="-1">Revisamos cada pedido a mano</h2>' +
          '<p class="ob-text">Para cuidar a las fuentes, habilitamos a cada publicador después de revisar su trabajo. Compartinos algo que hayas publicado.</p>' +
          '<div class="field"><label for="f-link">Link a una nota, perfil o portfolio</label>' +
          '<input class="input" id="f-link" name="link" type="url" inputmode="url" value="' + esc(state.link) + '" placeholder="https://" aria-describedby="err-step"></div>' + err() +
          '<p class="callout">Te avisamos por correo cuando tu cuenta esté habilitada, en general en menos de 24 horas.</p>';
      },
      validate: function () {
        var v = val('link');
        if (!v) return 'Compartí un link para que podamos revisar tu trabajo.';
        return /^(https?:\/\/)?[^\s.]+\.[^\s]{2,}/i.test(v) ? null : 'Ese link no parece válido. Probá con la dirección completa.';
      },
      collect: function () { state.link = val('link'); }
    },
    solicitud: {
      label: 'Primera solicitud', pose: 'write', caption: 'Borrador', skippable: true,
      render: function () {
        var initials = state.name.split(/\s+/).map(function (w) { return w.charAt(0); }).slice(0, 2).join('').toUpperCase();
        var tags = state.temasPub.slice(0, 2).map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('');
        return '<p class="ob-kicker">Tu primera solicitud</p><h2 class="ob-title" id="ob-title" tabindex="-1">¿Qué estás buscando hoy?</h2>' +
          '<p class="ob-text">Escribila como la verían las fuentes. Podés guardarla como borrador.</p>' +
          '<div class="split">' +
          '<div><div class="field"><label for="f-rt">Título</label><input class="input" id="f-rt" name="reqTitle" maxlength="90" value="' + esc(state.reqTitle) + '" placeholder="Ej.: ¿Cómo cambió el alquiler en tu ciudad?"></div>' +
          '<div class="field"><label for="f-rd">Descripción</label><textarea class="textarea" id="f-rd" name="reqDesc" maxlength="320" placeholder="Qué perfil buscás, para qué contenido y para cuándo.">' + esc(state.reqDesc) + '</textarea></div></div>' +
          '<div class="sample sample--live" aria-live="polite" aria-label="Vista previa">' +
          '<span class="sample-stamp">Borrador</span>' +
          '<div class="sample-who"><div class="sample-av" style="display:grid;place-items:center;background:var(--tint);font:700 14px/1 var(--font-ui);color:var(--side)">' + esc(initials) + '</div>' +
          '<div><div class="sample-name">' + esc(state.name) + '</div><div class="sample-role">' + esc(state.medio ? 'Publicador en ' + state.medio : 'Publicador') + '</div></div></div>' +
          '<p class="sample-title" data-placeholder="El título de tu solicitud"></p>' +
          '<p class="sample-desc" data-placeholder="Acá va a aparecer la descripción mientras escribís."></p>' +
          (tags ? '<ul class="sample-tags">' + tags + '</ul>' : '') +
          '</div></div>';
      },
      mount: function () {
        var t = pane.querySelector('#f-rt'), d = pane.querySelector('#f-rd');
        var card = pane.querySelector('.sample'), pt = card.querySelector('.sample-title'), pd = card.querySelector('.sample-desc');
        var timer;
        function upd() {
          pt.textContent = t.value; pd.textContent = d.value;
          card.classList.add('is-typing'); clearTimeout(timer);
          timer = setTimeout(function () { card.classList.remove('is-typing'); }, 500);
        }
        t.addEventListener('input', upd); d.addEventListener('input', upd);
        pt.textContent = t.value; pd.textContent = d.value;
      },
      collect: function () { state.reqTitle = val('reqTitle'); state.reqDesc = val('reqDesc'); }
    },
    espec: {
      label: 'Especialidad', pose: 'peek', caption: 'Tu especialidad',
      render: function () {
        return '<p class="ob-kicker">Tu especialidad</p><h2 class="ob-title" id="ob-title" tabindex="-1">¿Sobre qué temas podés aportar?</h2>' +
          '<p class="ob-text">Te mostramos primero las solicitudes de estos temas.</p>' +
          chips('espec', TOPICS, state.espec, 'Especialidades') + err();
      },
      validate: function () { return checked('espec').length ? null : 'Elegí al menos un tema.'; },
      collect: function () { state.espec = checked('espec'); }
    },
    perfil: {
      label: 'Tu perfil', pose: 'hello', caption: 'Tu perfil',
      render: function () {
        return '<p class="ob-kicker">Tu perfil</p><h2 class="ob-title" id="ob-title" tabindex="-1">Contanos quién sos</h2>' +
          '<div class="split"><div class="field"><label for="f-cargo">Cargo o rol</label><input class="input" id="f-cargo" name="cargo" value="' + esc(state.cargo) + '" placeholder="Ej.: Economista, fundadora" aria-describedby="err-step"></div>' +
          '<div class="field"><label for="f-org">Organización <span class="opt-hint">(opcional)</span></label><input class="input" id="f-org" name="org" value="' + esc(state.org) + '" placeholder="Ej.: Universidad del Sur"></div></div>' + err() +
          '<div class="field">' + radios('representa', REPRESENTA, state.representa, '¿A quién representás?') + '</div>';
      },
      validate: function () { return val('cargo') ? null : 'Contanos tu cargo o rol.'; },
      collect: function () {
        state.cargo = val('cargo'); state.org = val('org');
        state.representa = (pane.querySelector('input[name="representa"]:checked') || {}).value || 'yo';
      }
    },
    responder: {
      label: 'Cómo responder', pose: 'sign', caption: 'Responder solicitudes',
      render: function () {
        var av = document.getElementById('tpl-camila').innerHTML;
        return '<p class="ob-kicker">Responder solicitudes</p><h2 class="ob-title" id="ob-title" tabindex="-1">Así se ve una solicitud</h2>' +
          '<p class="ob-text">Encontrá pedidos de periodistas y respondé aquellos en los que vos o la fuente que representás puedan aportar.</p>' +
          '<div class="sample"><div class="sample-who"><div class="sample-av">' + av + '</div><div><div class="sample-name">Camila Duarte</div><div class="sample-role">Productora de un podcast de negocios</div></div></div>' +
          '<p class="sample-title">Estafas por WhatsApp: cómo proteger una pyme</p>' +
          '<p class="sample-desc">Busco una fuente con experiencia en ciberseguridad que pueda explicar los riesgos más frecuentes y compartir recomendaciones prácticas para una entrevista.</p>' +
          '<ul class="sample-tags"><li>Ciberseguridad</li><li>Pymes</li></ul></div>' +
          '<ul class="tips"><li><strong>Respondé solo si podés aportar.</strong> Las mejores respuestas son pocas y precisas.</li>' +
          '<li><strong>Sé concreto:</strong> datos, ejemplos, experiencia.</li>' +
          '<li><strong>Evitá lo promocional.</strong> El publicador busca información, no publicidad.</li></ul>';
      }
    },
    alertas: {
      label: 'Alertas', pose: 'hello', caption: 'Tus alertas',
      render: function () {
        return '<p class="ob-kicker">Alertas</p><h2 class="ob-title" id="ob-title" tabindex="-1">¿Cuándo querés enterarte de nuevas solicitudes?</h2>' +
          '<div class="field">' + radios('alertas', ALERTAS, state.alertas, 'Frecuencia de los avisos') + '</div>' +
          '<label class="toggle"><input type="checkbox" name="soloTemas"' + (state.soloTemas ? ' checked' : '') + '><span class="toggle-track"></span>Solo solicitudes de mis temas</label>';
      },
      collect: function () {
        state.alertas = (pane.querySelector('input[name="alertas"]:checked') || {}).value || 'diario';
        state.soloTemas = !!(pane.querySelector('input[name="soloTemas"]') || {}).checked;
      }
    },
    listo: {
      label: 'Listo', pose: 'celebrate', caption: '¡Listo!',
      render: function () {
        var isPub = state.types.indexOf('pub') > -1, isFue = state.types.indexOf('fue') > -1;
        var title = isPub && !isFue ? '¡Gracias, <em>' + esc(state.first) + '</em>!' : '¡Todo listo, <em>' + esc(state.first) + '</em>!';
        var text = isPub && !isFue ? 'Tu cuenta está en revisión. Mientras tanto, podés terminar tu primera solicitud.'
          : isPub ? 'Tu perfil de fuente ya está activo. Tu cuenta de publicador está en revisión y te avisamos por correo.'
          : 'Tu perfil está listo. Ya podés empezar a responder solicitudes de tus temas.';
        var dl = '';
        if (isPub) {
          dl += '<dt>Formatos</dt><dd>' + list(state.formats) + '</dd>';
          if (state.medio) dl += '<dt>Medio</dt><dd>' + esc(state.medio) + '</dd>';
          dl += '<dt>Temas</dt><dd>' + list(state.temasPub) + '</dd>';
          dl += '<dt>Solicitud</dt><dd>' + (state.reqTitle ? esc(state.reqTitle) + ' <span style="color:var(--muted)">(borrador)</span>' : '<span style="color:var(--muted)">Sin borrador todavía</span>') + '</dd>';
        }
        if (isFue) {
          dl += '<dt>Especialidad</dt><dd>' + list(state.espec) + '</dd>';
          dl += '<dt>Perfil</dt><dd>' + esc(state.cargo) + (state.org ? ', ' + esc(state.org) : '') + '</dd>';
          dl += '<dt>Alertas</dt><dd>' + esc(ALERTAS.filter(function (a) { return a.v === state.alertas; })[0].t) + (state.soloTemas ? ', solo mis temas' : '') + '</dd>';
        }
        var actions = '';
        if (isFue) actions += '<a class="btn btn--fue" href="index.html#solicitudes">Ver solicitudes <span class="arr" aria-hidden="true">→</span></a>';
        if (isPub) actions += '<a class="btn btn--pub" href="index.html">Ir a mi panel <span class="arr" aria-hidden="true">→</span></a>';
        return '<p class="ob-kicker">Listo</p><h2 class="ob-title" id="ob-title" tabindex="-1">' + title + '</h2>' +
          '<p class="ob-text">' + text + '</p>' +
          (isFue ? '<p class="quota">Te quedan 10 respuestas <span>este mes</span></p>' : '') +
          '<dl class="summary">' + dl + '</dl>' +
          '<div class="ob-final-actions">' + actions + '</div>';
      },
      mount: function () { confetti(); }
    }
  };

  var flow = [], idx = 0, busy = false;

  function buildFlow() {
    var f = [];
    var first = state.types[0], last = state.types[state.types.length - 1];
    f.push({ key: 'welcome', side: first });
    if (state.types.indexOf('pub') > -1) ['medio', 'temasPub', 'verif', 'solicitud'].forEach(function (k) { f.push({ key: k, side: 'pub' }); });
    if (state.types.indexOf('fue') > -1) ['espec', 'perfil', 'responder', 'alertas'].forEach(function (k) { f.push({ key: k, side: 'fue' }); });
    f.push({ key: 'listo', side: last });
    return f;
  }

  var CHECK = '<svg viewBox="0 0 14 14" aria-hidden="true"><path d="M2.5 7.5l3 3 6-7"/></svg>';
  function renderStepper() {
    stepper.innerHTML = flow.map(function (s, i) {
      var st = i < idx ? 'is-done' : i === idx ? 'is-current' : '';
      return '<li class="st ' + st + '" data-side="' + s.side + '"' + (i === idx ? ' aria-current="step"' : '') + '>' +
        '<span class="st-dot">' + (i < idx ? CHECK + '<span class="sr-only">Completado: </span>' : (i + 1)) + '</span>' +
        '<span class="sr-only">' + STEPS[s.key].label + '</span></li>';
    }).join('');
    stepper.classList.toggle('is-compact', flow.length > 6 || window.innerWidth < 900);
  }

  function renderArt(step, s) {
    art.setAttribute('data-pose', step.pose);
    art.setAttribute('data-caption', step.caption);
    artPaper.style.display = step.pose === 'write' || step.pose === 'sign' || step.pose === 'peek' ? '' : 'none';
    artChar.innerHTML = C.svg(step.pose, { side: s.side });
    artChar.classList.remove('is-pop');
    void artChar.offsetWidth;
    artChar.classList.add('is-pop');
  }

  function paint(dirIn) {
    var s = flow[idx], step = STEPS[s.key];
    body.dataset.side = s.side;
    who.textContent = s.key === 'welcome' && state.types.length === 2 ? 'Publicador y fuente' : s.side === 'pub' ? 'Soy publicador' : 'Soy fuente';
    count.textContent = 'Paso ' + (idx + 1) + ' de ' + flow.length + ': ' + step.label;
    bar.style.width = ((idx + 1) / flow.length * 100) + '%';
    pane.innerHTML = step.render();
    renderStepper();
    renderArt(step, s);
    prevBtn.hidden = false;
    prevBtn.innerHTML = idx === 0 ? '← Volver' : '← Anterior';
    var last = idx === flow.length - 1;
    nextBtn.hidden = last;
    nextBtn.innerHTML = idx === flow.length - 2 ? 'Terminar <span class="arr" aria-hidden="true">→</span>' : 'Siguiente <span class="arr" aria-hidden="true">→</span>';
    skipBtn.hidden = !step.skippable;
    if (step.mount) step.mount();
    pane.classList.remove('is-out-left', 'is-out-right', 'is-in-left', 'is-in-right');
    if (!reduce && dirIn) { void pane.offsetWidth; pane.classList.add(dirIn > 0 ? 'is-in-right' : 'is-in-left'); }
    var h = pane.querySelector('.ob-title');
    if (h) h.focus({ preventScroll: true });
    var top = ob.getBoundingClientRect().top;
    if (top < 0) window.scrollTo({ top: window.scrollY + top - 16, behavior: reduce ? 'auto' : 'smooth' });
  }

  function go(to, dir) {
    if (busy || to < 0 || to >= flow.length) return;
    busy = true;
    if (reduce) { idx = to; paint(0); busy = false; return; }
    pane.classList.add(dir > 0 ? 'is-out-left' : 'is-out-right');
    setTimeout(function () { idx = to; paint(dir); busy = false; }, 240);
  }

  function showStepError(msg) {
    var e = pane.querySelector('#err-step');
    if (!e) return;
    e.textContent = msg || '';
    e.classList.toggle('is-on', !!msg);
  }

  obForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var step = STEPS[flow[idx].key];
    if (step.validate) {
      var msg = step.validate();
      if (msg) {
        showStepError(msg);
        var bad = pane.querySelector('input:not([type=checkbox]):not([type=radio])') || pane.querySelector('input');
        if (bad && step.key !== 'x') bad.focus();
        return;
      }
    }
    if (step.collect) step.collect();
    go(idx + 1, 1);
  });
  pane.addEventListener('change', function () { showStepError(''); });
  skipBtn.addEventListener('click', function () { go(idx + 1, 1); });
  prevBtn.addEventListener('click', function () {
    var step = STEPS[flow[idx].key];
    if (step.collect) step.collect();
    if (idx === 0) { backToSignup(); return; }
    go(idx - 1, -1);
  });
  window.addEventListener('resize', function () { if (!ob.hidden) stepper.classList.toggle('is-compact', flow.length > 6 || window.innerWidth < 900); });

  function startOnboarding() {
    flow = buildFlow();
    idx = 0;
    var done = function () {
      signup.hidden = true;
      signup.classList.remove('is-leaving');
      ob.hidden = false;
      paint(0);
    };
    if (reduce) done();
    else { signup.classList.add('is-leaving'); setTimeout(done, 420); }
  }

  function backToSignup() {
    ob.hidden = true;
    signup.hidden = false;
    syncSide();
    nameIn.focus();
  }

  function confetti() {
    if (reduce) return;
    var box = document.createElement('div');
    box.className = 'confetti';
    var H = ob.offsetHeight;
    for (var i = 0; i < 46; i++) {
      var p = document.createElement('i');
      var r = Math.random();
      if (r < 0.28) p.className = 'c-pub'; else if (r < 0.56) p.className = 'c-fue';
      p.style.setProperty('--x', (Math.random() * 100) + '%');
      p.style.setProperty('--w', (8 + Math.random() * 10).toFixed(1) + 'px');
      p.style.setProperty('--d', (1.8 + Math.random() * 1.6).toFixed(2) + 's');
      p.style.setProperty('--delay', (Math.random() * 0.5).toFixed(2) + 's');
      p.style.setProperty('--r', ((Math.random() - 0.5) * 900).toFixed(0) + 'deg');
      p.style.setProperty('--drift', ((Math.random() - 0.5) * 140).toFixed(0) + 'px');
      p.style.setProperty('--fall', (H * (0.7 + Math.random() * 0.4)).toFixed(0) + 'px');
      box.appendChild(p);
    }
    ob.appendChild(box);
    setTimeout(function () { box.remove(); }, 4200);
  }

  // debugging / screenshots
  window.__pitchealoReg = { state: function () { return state; }, go: function (i) { idx = i; paint(0); } };
})();
