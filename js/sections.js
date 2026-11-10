// Sections below the hero: drop the Pitchealo character into its peeking spots.
(function () {
  'use strict';
  var C = window.PitchealoCharacter;
  if (!C) return;
  document.querySelectorAll('.jcard-cell--peek .peek').forEach(function (el) {
    el.innerHTML = C.svg('peek');
  });
})();
