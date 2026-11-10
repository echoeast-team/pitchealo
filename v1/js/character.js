/*
 * Pitchealo character ("Pitchi")
 * Built from the head silhouette in the Pitchealo logo, so the mascot and the
 * logo always share the same profile. Every pose is drawn in the logo's own
 * coordinate space (the head spans roughly x 1.6–26, y 4–29).
 *
 * Usage:
 *   PitchealoCharacter.svg('peek')                  -> standalone <svg> string
 *   PitchealoCharacter.group('write', {tool:'pencil'}) -> <g> string for use inside another SVG
 *
 * Colour comes from the CSS custom property --pc-colour (defaults to brand blue).
 * Pen tip anchor for writing poses: (31, 30) in character units.
 */
(function () {
  'use strict';

  var HEAD =
    'M4 29c-1.6-3.4-2.4-6.6-2.4-10.2C1.6 10.4 7 4 14 4c5.4 0 9 3.6 9.4 8.4l2.4 4.6c.3.6 0 1.1-.6 1.3' +
    'l-1.4.4.5 1.6-1.6.9.9 1.3c-.2 2.5-2 3.9-4.6 3.9h-2.4V29z';
  var WAVES = 'M28 13.6l2.4-1.6M28.4 18h3M28 22.4l2.4 1.6';
  var TIP = { x: 31, y: 30 };

  function r(n) {
    return (Math.random() * n).toFixed(2);
  }

  function face(look) {
    var px = 18.7 + (look ? look.x : 0);
    var py = 11.7 + (look ? look.y : 0);
    return (
      '<g class="pc-eye" style="animation-delay:-' + r(5) + 's">' +
      '<circle class="pc-eye-white" cx="17.8" cy="11.4" r="2.75" fill="#fff"/>' +
      '<g class="pc-pupil"><circle cx="' + px + '" cy="' + py + '" r="1.45" fill="#13212a"/>' +
      '<circle cx="' + (px + 0.45) + '" cy="' + (py - 0.5) + '" r=".45" fill="#fff"/></g>' +
      '</g>' +
      '<circle class="pc-cheek" cx="19.4" cy="17.4" r="1.75" fill="#F58C78" opacity=".72"/>' +
      '<path class="pc-mouth" d="M20.7 21.15q1.05.85 2.05.15" fill="none" stroke="#13212a" stroke-width=".6" stroke-linecap="round"/>'
    );
  }

  function pencil() {
    // drawn along +x with the tip at the origin
    return (
      '<path d="M0 0L2.9-1.2V1.2Z" fill="#EBCB9F"/>' +
      '<path d="M0 0L1.15-.48V.48Z" fill="#2a2a2a"/>' +
      '<rect x="2.9" y="-1.2" width="7.6" height="2.4" fill="#F2C14E"/>' +
      '<rect x="2.9" y="-.25" width="7.6" height=".5" fill="#E0A93A"/>' +
      '<rect x="10.5" y="-1.2" width="1.1" height="2.4" fill="#C3C8CE"/>' +
      '<rect x="11.5" y="-1.2" width="1.7" height="2.4" rx=".6" fill="#EE8F8F"/>'
    );
  }

  function pen() {
    return (
      '<path d="M0 0L3.1-1.05V1.05Z" fill="#D8B25A"/>' +
      '<path d="M.3 0H2.4" stroke="#8a6a24" stroke-width=".25"/>' +
      '<rect x="3.1" y="-1.2" width="9.6" height="2.4" rx=".7" fill="#1E2B3A"/>' +
      '<rect x="5.6" y="-1.2" width=".7" height="2.4" fill="#D8B25A"/>' +
      '<rect x="6.6" y="1.05" width="4.6" height=".55" rx=".25" fill="#D8B25A"/>'
    );
  }

  function body() {
    return '<path class="pc-body" d="' + HEAD + '"/>';
  }

  var poses = {
    // Head only, looking at the article. Used behind paper, peeking over an edge.
    peek: function () {
      return (
        body() +
        face({ x: 0.55, y: 0.6 }) +
        '<path class="pc-waves" d="' + WAVES + '" fill="none" stroke-width="1.6" stroke-linecap="round"/>'
      );
    },
    // Head with an arm holding a pencil (tip at 31,30).
    write: function (opts) {
      var tool = opts && opts.tool === 'pen' ? pen() : pencil();
      return (
        body() +
        face({ x: 0.7, y: 0.9 }) +
        '<g transform="translate(31 30) rotate(-135)">' + tool + '</g>' +
        '<path class="pc-arm" d="M13.6 26.6C18.4 29.7 23.4 29.2 27.3 26.3" fill="none" stroke-width="2.3" stroke-linecap="round"/>' +
        '<ellipse class="pc-body" cx="27.5" cy="26.4" rx="1.85" ry="1.6"/>'
      );
    },
    // Friendly front-facing default (logo pose with sound waves).
    hello: function () {
      return (
        body() +
        face({ x: 0.3, y: 0 }) +
        '<path class="pc-waves pc-waves--on" d="' + WAVES + '" fill="none" stroke-width="1.6" stroke-linecap="round"/>'
      );
    }
  };
  poses.sign = function () {
    return poses.write({ tool: 'pen' });
  };

  // ---- Added for onboarding (additive; existing poses above are unchanged) ----

  // A mitten hand drawn around (0,0); pc-hand class is animatable from CSS.
  function hand(cx, cy, rot, cls) {
    return (
      '<g class="pc-hand ' + (cls || '') + '" transform="translate(' + cx + ' ' + cy + ') rotate(' + rot + ')">' +
      '<g class="pc-hand-inner">' +
      '<ellipse class="pc-body" cx="0" cy="0" rx="2.15" ry="2.55"/>' +
      '<ellipse class="pc-body" cx="-1.95" cy=".55" rx=".9" ry="1.2" transform="rotate(-28 -1.95 .55)"/>' +
      '</g></g>'
    );
  }

  // Waving hello: the logo head with a raised hand beside the face.
  poses.wave = function () {
    return (
      body() +
      face({ x: 0.35, y: -0.15 }) +
      '<path class="pc-waves pc-waves--on" d="' + WAVES + '" fill="none" stroke-width="1.6" stroke-linecap="round"/>' +
      hand(30.6, 6.4, 18, 'pc-hand--wave')
    );
  };

  // Celebrating: happy closed eyes, open smile, both hands up.
  poses.celebrate = function () {
    return (
      body() +
      '<path class="pc-happy-eye" d="M15.6 12.2q2.2-2.6 4.4 0" fill="none" stroke="#13212a" stroke-width=".85" stroke-linecap="round"/>' +
      '<circle class="pc-cheek" cx="19.4" cy="16.6" r="1.75" fill="#F58C78" opacity=".8"/>' +
      '<path class="pc-mouth" d="M20.1 20.2q1.6 2.6 3.4.3z" fill="#13212a"/>' +
      '<path class="pc-waves pc-waves--on" d="' + WAVES + '" fill="none" stroke-width="1.6" stroke-linecap="round"/>' +
      hand(29.4, 3.6, 24, 'pc-hand--left') +
      hand(4.2, 3.4, -24, 'pc-hand--right')
    );
  };

  var VIEWBOX = { write: '0 2 34 30', sign: '0 2 34 30', wave: '0 1 35 29', celebrate: '-1 -1 35 31' };

  function group(pose, opts) {
    var fn = poses[pose] || poses.hello;
    return '<g class="pc pc--' + pose + '">' + fn(opts || {}) + '</g>';
  }

  function svg(pose, opts) {
    var vb = VIEWBOX[pose] || '0 2 33 28';
    var cls = (opts && opts.className) || '';
    return (
      '<svg class="pc-svg ' + cls + '" viewBox="' + vb + '" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">' +
      group(pose, opts) +
      '</svg>'
    );
  }

  window.PitchealoCharacter = { svg: svg, group: group, TIP: TIP, HEAD: HEAD, WAVES: WAVES };
})();
