/*
 * Pitchealo character, V2 (sketch edition)
 * Same head profile as the Pitchealo logo, redrawn as ink line art: a double-pass
 * outline, cross-hatched shading in the side colour, and hand-drawn props
 * (quill for Publicadores, fountain pen for Fuentes).
 *
 *   PitchealoSketch.svg(pose, {side:'pub'|'fue'|'ink', className})  -> <svg> string
 *   PitchealoSketch.group(pose, {side})                               -> <g> string (inside another SVG)
 *
 * Poses: hello, peek, write, sign, wave, celebrate.
 * Colours: ink is #141414; the hatch colour comes from CSS --pc-side,
 * set by the .pcs--pub / .pcs--fue classes (see css/site.css).
 * Pen tip anchor for write / sign: (31, 30) in character units, as in V1.
 */
(function () {
  'use strict';

  var HEAD =
    'M4 29c-1.6-3.4-2.4-6.6-2.4-10.2C1.6 10.4 7 4 14 4c5.4 0 9 3.6 9.4 8.4l2.4 4.6c.3.6 0 1.1-.6 1.3' +
    'l-1.4.4.5 1.6-1.6.9.9 1.3c-.2 2.5-2 3.9-4.6 3.9h-2.4V29z';
  // a slightly wobbly second pass of the same outline, for the sketch look
  var HEAD_PASS =
    'M4.4 28.8c-1.5-3.5-2.3-6.4-2.2-10C2.3 10.9 7.4 4.5 14.2 4.4c5.1.1 8.6 3.5 9 8.2l2.3 4.4c.2.6-.1 1-.6 1.2' +
    'l-1.3.5.4 1.5-1.5.9.8 1.3c-.3 2.4-2.1 3.6-4.5 3.6h-2.3l-.1 2.9';
  var WAVES = 'M28 13.6l2.4-1.6M28.4 18h3M28 22.4l2.4 1.6';
  var TIP = { x: 31, y: 30 };

  var uid = 0;
  function nextId() { uid += 1; return 'pcs' + uid; }

  // diagonal hatching clipped to the head, fading out from the back of the skull
  // and neck towards the face (radial luminance masks), with a denser cross-hatch
  // close to the back edge
  var HATCH = '', CROSS = '';
  (function () {
    for (var i = -30; i < 34; i += 1.3) HATCH += 'M' + i.toFixed(2) + ' 34L' + (i + 30).toFixed(2) + ' 0';
    for (var j = -2; j < 40; j += 1.7) CROSS += 'M' + j.toFixed(2) + ' 34L' + (j - 22).toFixed(2) + ' 0';
  })();

  function hatch(id) {
    return (
      '<defs>' +
      '<clipPath id="' + id + '"><path d="' + HEAD + '"/></clipPath>' +
      '<radialGradient id="' + id + 'g" cx="0.04" cy="0.98" r="0.78">' +
      '<stop offset="0" stop-color="#fff"/><stop offset="0.5" stop-color="#fff" stop-opacity="0.85"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="' + id + 'h" cx="0" cy="1" r="0.5">' +
      '<stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>' +
      '<mask id="' + id + 'm"><rect x="0" y="2" width="28" height="30" fill="url(#' + id + 'g)"/></mask>' +
      '<mask id="' + id + 'n"><rect x="0" y="2" width="28" height="30" fill="url(#' + id + 'h)"/></mask>' +
      '</defs>' +
      '<g clip-path="url(#' + id + ')">' +
      '<path class="pcs-hatch" mask="url(#' + id + 'm)" d="' + HATCH + '"/>' +
      '<path class="pcs-hatch pcs-hatch--x" mask="url(#' + id + 'n)" d="' + CROSS + '"/>' +
      '</g>'
    );
  }

  function head(id) {
    return (
      '<path class="pcs-fill" d="' + HEAD + '"/>' +
      hatch(id) +
      '<path class="pcs-line" d="' + HEAD + '"/>' +
      '<path class="pcs-line pcs-line--pass" d="' + HEAD_PASS + '"/>' +
      // ear
      '<path class="pcs-line pcs-line--thin" d="M10.6 14.2c-1.6-.4-2.6.9-2.4 2.4.2 1.4 1.4 2.2 2.6 1.9"/>' +
      '<path class="pcs-line pcs-line--thin" d="M9.6 15.6c.6.3.8.8.7 1.3"/>'
    );
  }

  function face(o) {
    o = o || {};
    var lx = o.x || 0, ly = o.y || 0;
    var eye;
    if (o.happy) {
      eye = '<path class="pcs-line" d="M16 12.2q1.8-2.4 3.6 0"/>';
    } else {
      eye =
        '<g class="pcs-eye">' +
        '<circle class="pcs-fill" cx="17.8" cy="11.4" r="2.5"/>' +
        '<circle class="pcs-line pcs-line--thin" cx="17.8" cy="11.4" r="2.5"/>' +
        '<g class="pcs-pupil"><circle class="pcs-ink" cx="' + (18.5 + lx).toFixed(2) + '" cy="' + (11.6 + ly).toFixed(2) + '" r="1.15"/>' +
        '<circle class="pcs-fill" cx="' + (18.85 + lx).toFixed(2) + '" cy="' + (11.2 + ly).toFixed(2) + '" r=".35"/></g>' +
        '</g>';
    }
    var mouth = o.open
      ? '<path class="pcs-fill" d="M20.3 20.6q1.4 2.4 3 .2z"/><path class="pcs-line pcs-line--thin" d="M20.3 20.6q1.4 2.4 3 .2z"/>'
      : '<path class="pcs-line pcs-line--thin" d="M20.6 21.2q1.05.85 2.05.15"/>';
    return (
      '<path class="pcs-line pcs-line--thin" d="M15.5 8.1q2.3-1.3 4.6-.1"/>' +
      eye +
      // cheek: three short side-colour hatch strokes
      '<path class="pcs-cheek" d="M18 18.4l1.1-1.6M19.1 18.8l1.1-1.6M20.2 19.2l1.1-1.6"/>' +
      mouth
    );
  }

  function quill() {
    // along +x from the tip at the origin (V1 convention); rotated by the caller
    return (
      '<path class="pcs-fill" d="M4 0C7 -2.6 12 -3.6 18 -2.4C14 -0.6 9 0.9 4 0Z"/>' +
      '<path class="pcs-fill" d="M4 0C7 1.6 12 2.6 18 -2.4"/>' +
      '<path class="pcs-quill-hatch" d="M7 -.9l1.2-1.6M9 -1.1l1.3-1.7M11 -1.3l1.4-1.6M13 -1.5l1.3-1.3M15 -1.8l1.1-.9M8 .6l1.4-1.1M10.5 .7l1.6-1.4M13 .4l1.6-1.7"/>' +
      '<path class="pcs-line pcs-line--thin" d="M4 0C7 -2.6 12 -3.6 18 -2.4C14 -0.6 9 0.9 4 0Z"/>' +
      '<path class="pcs-line pcs-line--thin" d="M4 0C7 1.6 12 2.6 18 -2.4"/>' +
      '<path class="pcs-line" d="M0 0L18.5 -2.5"/>' +
      '<path class="pcs-line" d="M0 0L2.4 -.7L2.4 .5Z"/>'
    );
  }

  function fountainPen() {
    return (
      '<path class="pcs-fill" d="M0 0L3.3 -1.3V1.3Z"/>' +
      '<path class="pcs-line pcs-line--thin" d="M0 0L3.3 -1.3V1.3Z"/>' +
      '<path class="pcs-line pcs-line--thin" d="M.4 0H2.4"/>' +
      '<rect class="pcs-fill" x="3.3" y="-1.35" width="10" height="2.7" rx=".6"/>' +
      '<path class="pcs-pen-band" d="M5.2 -1.35v2.7M6 -1.35v2.7M10.6 -1.35v2.7M11.3 -1.35v2.7M12 -1.35v2.7"/>' +
      '<rect class="pcs-line pcs-line--thin" x="3.3" y="-1.35" width="10" height="2.7" rx=".6"/>' +
      '<path class="pcs-line pcs-line--thin" d="M6.8 1.35v1h4.4v-1"/>'
    );
  }

  function armTo(d) {
    // outlined arm: thick ink stroke with a thinner paper stroke on top
    return '<path class="pcs-arm-out" d="' + d + '"/><path class="pcs-arm-in" d="' + d + '"/>';
  }
  function hand(cx, cy, rx, ry) {
    return (
      '<ellipse class="pcs-fill" cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '"/>' +
      '<ellipse class="pcs-line pcs-line--thin" cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '"/>'
    );
  }

  var poses = {
    hello: function (id) {
      return head(id) + face({ x: 0.2 }) +
        '<path class="pcs-line pcs-waves" d="' + WAVES + '"/>';
    },
    peek: function (id) {
      return head(id) + face({ x: 0.6, y: 0.7 }) +
        '<path class="pcs-line pcs-waves pcs-waves--peek" d="' + WAVES + '"/>';
    },
    write: function (id) {
      return head(id) + face({ x: 0.7, y: 0.9 }) +
        '<g class="pcs-tool" transform="translate(31 30) rotate(-125)">' + quill() + '</g>' +
        armTo('M13.6 26.6C18.4 29.7 23.4 29.2 27.3 26.3') +
        hand(27.6, 26.6, 1.9, 1.6);
    },
    sign: function (id) {
      return head(id) + face({ x: 0.7, y: 0.9 }) +
        '<g class="pcs-tool" transform="translate(31 30) rotate(-135)">' + fountainPen() + '</g>' +
        armTo('M13.6 26.6C18.4 29.7 23.4 29.2 27.3 26.3') +
        hand(27.6, 26.6, 1.9, 1.6);
    },
    wave: function (id) {
      return head(id) + face({ x: 0.3, open: true }) +
        '<path class="pcs-line pcs-waves" d="M28.6 18.4h2.6M28.2 22.4l2.2 1.4"/>' +
        '<g class="pcs-wave-arm">' +
        armTo('M14 27.4C21 29.4 28.6 27.4 31.4 19.6') +
        '<g class="pcs-wave-hand">' + hand(31.8, 17.4, 2.1, 2.5) +
        '<path class="pcs-line pcs-line--thin" d="M30.6 15.2v-1.6M31.8 15v-1.9M33 15.2v-1.6"/>' +
        '<path class="pcs-motion" d="M35.4 14.2q1.4 1.6 0 3.4M36.8 13.2q2 2.6 0 5.4"/>' +
        '</g></g>';
    },
    celebrate: function (id) {
      return '<g class="pcs-back-arm">' + armTo('M6 27.6C2.6 24 1 19.2 .6 13.6') + hand(.5, 11.6, 2, 2.3) + '</g>' +
        head(id) + face({ happy: true, open: true }) +
        '<g class="pcs-front-arm">' + armTo('M14 27.4C22.6 28.8 29.8 25 31.8 13.6') + hand(32, 11.4, 2.1, 2.4) + '</g>' +
        '<path class="pcs-motion" d="M-3 8.4l-1.6-1.6M.6 6.4V4.2M34.6 7.6l1.4-1.6M31.4 6.4V4.2M37 11.2h2"/>';
    }
  };

  var VIEW = {
    hello: '0 2 33 29', peek: '0 2 33 29', write: '0 2 34 30', sign: '0 2 34 30',
    wave: '0 2 39 30', celebrate: '-6 2 46 30'
  };

  function sideClass(o) {
    var s = (o && o.side) || 'ink';
    return ' pcs--' + s;
  }

  function group(pose, opts) {
    var fn = poses[pose] || poses.hello;
    return '<g class="pcs pcs-pose--' + pose + sideClass(opts) + '">' + fn(nextId()) + '</g>';
  }

  function svg(pose, opts) {
    var cls = (opts && opts.className) || '';
    return (
      '<svg class="pcs-svg ' + cls + sideClass(opts) + '" viewBox="' + (VIEW[pose] || VIEW.hello) +
      '" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">' +
      group(pose, opts) + '</svg>'
    );
  }

  window.PitchealoSketch = { svg: svg, group: group, TIP: TIP, HEAD: HEAD, WAVES: WAVES, VIEW: VIEW };
})();
