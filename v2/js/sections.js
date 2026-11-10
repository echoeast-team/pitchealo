/*
 * Pitchealo V2: everything below the hero
 * - drops the sketch character into [data-pcs="pose side"] placeholders
 * - scroll reveals ([data-reveal], staggered by data-stagger groups)
 * - draws hand-drawn lines (.accent, .steps) when they scroll into view
 */
(function () {
  'use strict';
  var C = window.PitchealoSketch;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (C) {
    document.querySelectorAll('[data-pcs]').forEach(function (el) {
      var parts = el.getAttribute('data-pcs').split(' ');
      el.innerHTML = C.svg(parts[0], { side: parts[1] || 'ink' });
    });
  }

  // stagger index for groups
  document.querySelectorAll('[data-stagger]').forEach(function (group) {
    var items = group.querySelectorAll('[data-reveal]');
    items.forEach(function (it, i) { it.style.setProperty('--i', i % 12); });
  });

  var targets = document.querySelectorAll('[data-reveal], .accent, .steps');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    targets.forEach(function (t) { t.classList.add('is-in'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
  targets.forEach(function (t) { io.observe(t); });
})();
