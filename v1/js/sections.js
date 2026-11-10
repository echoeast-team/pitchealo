// Sections below the hero: place the Pitchealo character and run the scroll reveals.
(function () {
  'use strict';
  var C = window.PitchealoCharacter;

  // Characters: peeking over journalist cards, and any [data-pc="pose"] slot
  if (C) {
    document.querySelectorAll('.jcard-cell--peek .peek').forEach(function (el) {
      el.innerHTML = C.svg('peek');
    });
    document.querySelectorAll('[data-pc]').forEach(function (el) {
      el.innerHTML = C.svg(el.getAttribute('data-pc'));
    });
  }

  // Stagger index for list items that don't set one
  document.querySelectorAll('[data-reveal-group]').forEach(function (group) {
    Array.prototype.forEach.call(group.children, function (li, i) {
      if (!li.style.getPropertyValue('--i')) li.style.setProperty('--i', i % 12);
    });
  });

  var targets = document.querySelectorAll('[data-reveal], [data-reveal-group]');
  if (!('IntersectionObserver' in window)) {
    targets.forEach(function (t) { t.classList.add('is-in'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      }
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
  targets.forEach(function (t) { io.observe(t); });
})();
