/*
 * Pitchealo character, V2 (stick-figure sketch edition)
 * A stick figure whose head is the Pitchealo logo profile, drawn as ink line art:
 * every line has a second, slightly offset hand-drawn pass, the back of the head
 * is hatched in the side colour, and the props are a quill (Publicadores) and a
 * fountain pen (Fuentes).
 *
 *   PitchealoSketch.svg(pose, {side:'pub'|'fue'|'ink', className})  -> <svg> string
 *   PitchealoSketch.group(pose, {side})                               -> <g> string (inside another SVG)
 *
 * Poses: hello, peek, write, sign, wave, celebrate.
 * Ink is #141414; the hatch colour comes from CSS --pc-side (.pcs--pub / .pcs--fue).
 * Pen tip anchor for write / sign: (31, 30) in character units, as before.
 */
(function () {
  'use strict';

  // the logo head, in its own units (about 1.6–26 by 4–29); drawn scaled into the figure
  var HEAD =
    'M4 29c-1.6-3.4-2.4-6.6-2.4-10.2C1.6 10.4 7 4 14 4c5.4 0 9 3.6 9.4 8.4l2.4 4.6c.3.6 0 1.1-.6 1.3' +
    'l-1.4.4.5 1.6-1.6.9.9 1.3c-.2 2.5-2 3.9-4.6 3.9h-2.4V29z';
  var HEAD_PASS =
    'M4.5 28.6c-1.5-3.5-2.4-6.3-2.3-9.9C2.4 11 7.5 4.6 14.3 4.5c5 .1 8.5 3.4 8.9 8.1l2.3 4.4c.2.6-.1 1-.6 1.2' +
    'l-1.3.5.4 1.5-1.5.9.8 1.3';
  var WAVES = 'M28 13.6l2.4-1.6M28.4 18h3M28 22.4l2.4 1.6';
  var TIP = { x: 31, y: 30 };
  var S = 0.46; // head scale inside the figure

  var uid = 0;
  function nextId() { uid += 1; return 'pcs' + uid; }

  var HATCH = '';
  (function () {
    for (var i = -30; i < 34; i += 1.7) HATCH += 'M' + i.toFixed(2) + ' 34L' + (i + 30).toFixed(2) + ' 0';
  })();

  // ---------- head (drawn in logo units, then scaled) ----------
  function head(id, hx, hy, o) {
    o = o || {};
    var lx = o.x || 0, ly = o.y || 0;
    var eye = o.happy
      ? '<path class="pcs-line" d="M15.8 12.4q2-2.8 4 0"/>'
      : '<g class="pcs-eye">' +
        '<circle class="pcs-fill" cx="17.8" cy="11.4" r="2.7"/>' +
        '<circle class="pcs-line pcs-line--thin" cx="17.8" cy="11.4" r="2.7"/>' +
        '<g class="pcs-pupil"><circle class="pcs-ink" cx="' + (18.5 + lx).toFixed(2) + '" cy="' + (11.7 + ly).toFixed(2) + '" r="1.35"/></g>' +
        '</g>';
    var mouth = o.open
      ? '<path class="pcs-fill" d="M20.2 20.4q1.5 2.8 3.2.2z"/><path class="pcs-line pcs-line--thin" d="M20.2 20.4q1.5 2.8 3.2.2z"/>'
      : '<path class="pcs-line pcs-line--thin" d="M20.5 21.1q1.1.9 2.2.1"/>';
    var waves = o.waves ? '<path class="pcs-line pcs-waves' + (o.waves === 'peek' ? ' pcs-waves--peek' : '') + '" d="' + WAVES + '"/>' : '';
    return (
      '<g class="pcs-head" transform="translate(' + hx + ' ' + hy + ') scale(' + S + ')">' +
      '<defs><clipPath id="' + id + '"><path d="' + HEAD + '"/></clipPath>' +
      '<linearGradient id="' + id + 'g" x1="0" y1="0" x2="1" y2="0">' +
      '<stop offset="0" stop-color="#fff"/><stop offset="0.45" stop-color="#fff" stop-opacity=".9"/><stop offset="0.75" stop-color="#fff" stop-opacity="0"/></linearGradient>' +
      '<mask id="' + id + 'm"><rect x="0" y="0" width="28" height="32" fill="url(#' + id + 'g)"/></mask></defs>' +
      '<path class="pcs-fill" d="' + HEAD + '"/>' +
      '<g clip-path="url(#' + id + ')"><path class="pcs-hatch" mask="url(#' + id + 'm)" d="' + HATCH + '"/></g>' +
      '<path class="pcs-line" d="' + HEAD + '"/>' +
      '<path class="pcs-line pcs-line--pass" d="' + HEAD_PASS + '"/>' +
      '<path class="pcs-line pcs-line--thin" d="M10.6 14.2c-1.6-.4-2.6.9-2.4 2.4.2 1.4 1.4 2.2 2.6 1.9"/>' +
      '<path class="pcs-line pcs-line--thin" d="M15.4 7.9q2.4-1.4 4.8-.1"/>' +
      eye +
      '<path class="pcs-cheek" d="M17.8 18.6l1.2-1.8M19.1 19l1.2-1.8"/>' +
      mouth + waves +
      '</g>'
    );
  }

  // ---------- stick body ----------
  // every stroke gets a second, slightly offset sketch pass
  function line(d, extra) {
    return '<path class="pcs-limb' + (extra ? ' ' + extra : '') + '" d="' + d + '"/>' +
      '<path class="pcs-limb pcs-limb--pass" transform="translate(.28 -.22)" d="' + d + '"/>';
  }
  function hand(x, y, r) {
    r = r || 1.15;
    return '<circle class="pcs-fill" cx="' + x + '" cy="' + y + '" r="' + r + '"/>' +
      '<circle class="pcs-line pcs-line--hand" cx="' + x + '" cy="' + y + '" r="' + r + '"/>';
  }
  function legs(hip, l, r) {
    // hip [x,y]; l / r feet [x,y]; small ticks for feet
    return line('M' + hip[0] + ' ' + hip[1] + 'L' + l[0] + ' ' + l[1] + 'l-1.6 .2') +
      line('M' + hip[0] + ' ' + hip[1] + 'L' + r[0] + ' ' + r[1] + 'l1.7 .2');
  }

  function quill() {
    // along +x from the tip at the origin; caller rotates
    return (
      '<path class="pcs-fill" d="M4 0C7 -2.6 12 -3.6 18 -2.4C14 -0.6 9 0.9 4 0Z"/>' +
      '<path class="pcs-quill-hatch" d="M7 -.9l1.2-1.6M9 -1.1l1.3-1.7M11 -1.3l1.4-1.6M13 -1.5l1.3-1.3M15 -1.8l1.1-.9M8 .6l1.4-1.1M10.5 .7l1.6-1.4M13 .4l1.6-1.7"/>' +
      '<path class="pcs-line pcs-line--thin" d="M4 0C7 -2.6 12 -3.6 18 -2.4C14 -0.6 9 0.9 4 0Z"/>' +
      '<path class="pcs-line" d="M0 0L18.5 -2.5"/>'
    );
  }
  function fountainPen() {
    return (
      '<path class="pcs-fill" d="M0 0L3.3 -1.3V1.3Z"/>' +
      '<path class="pcs-line pcs-line--thin" d="M0 0L3.3 -1.3V1.3Z"/>' +
      '<rect class="pcs-fill" x="3.3" y="-1.35" width="10" height="2.7" rx=".6"/>' +
      '<path class="pcs-pen-band" d="M5.2 -1.35v2.7M6 -1.35v2.7M10.6 -1.35v2.7M11.3 -1.35v2.7M12 -1.35v2.7"/>' +
      '<rect class="pcs-line pcs-line--thin" x="3.3" y="-1.35" width="10" height="2.7" rx=".6"/>'
    );
  }
  function tool(kind, rot) {
    // the outer transform matches the CSS scribble animation; the scale lives inside
    return '<g class="pcs-tool" transform="translate(31 30) rotate(' + rot + ')"><g transform="scale(.7)">' +
      (kind === 'pen' ? fountainPen() : quill()) + '</g></g>';
  }

  var poses = {
    hello: function (id) {
      // standing, arms relaxed, talking
      return (
        line('M10.6 13.3L10.4 22.6') +
        legs([10.4, 22.6], [7.6, 30.6], [13.4, 30.6]) +
        line('M10.6 15.6L7.4 19.6L6.8 23.2') + hand(6.8, 23.6) +
        line('M10.6 15.6L14.2 19.2L16.4 22.6') + hand(16.6, 23) +
        head(id, 6, 0, { x: 0.2, waves: 'on' })
      );
    },
    peek: function (id) {
      // head and shoulders over an edge (y ≈ 18); hands are drawn by the page on the edge
      return (
        line('M12.6 14.3L12.6 30') +
        line('M12.6 16.8L9.6 17.4L7.8 18.2') +
        line('M12.6 16.8L15.6 17.4L17.4 18.2') +
        head(id, 8, 1, { x: 0.6, y: 0.8, waves: 'peek' })
      );
    },
    write: function (id) {
      // standing close to the page, writing at the pen tip (31, 30) with an upright quill
      return (
        line('M13.6 14.3L14.6 23') +
        legs([14.6, 23], [11.8, 31], [17.6, 31]) +
        line('M13.8 16.4L11 20L11.6 23.6') + hand(11.7, 24) +
        line('M13.8 16.4L22 22.4L29.8 26.8') +
        tool('quill', -100) + hand(30.5, 27.3, 1.25) +
        head(id, 9, 1, { x: 0.8, y: 1 })
      );
    },
    sign: function (id) {
      return (
        line('M13.6 14.3L14.6 23') +
        legs([14.6, 23], [11.8, 31], [17.6, 31]) +
        line('M13.8 16.4L11 20L11.6 23.6') + hand(11.7, 24) +
        line('M13.8 16.4L22 22.4L29.8 26.8') +
        tool('pen', -100) + hand(30.5, 27.3, 1.25) +
        head(id, 9, 1, { x: 0.8, y: 1 })
      );
    },
    wave: function (id) {
      return (
        line('M10.6 13.3L10.4 22.6') +
        legs([10.4, 22.6], [7.6, 30.6], [13.4, 30.6]) +
        line('M10.6 15.6L7.4 19.6L6.8 23.2') + hand(6.8, 23.6) +
        '<g class="pcs-wave-arm">' + line('M10.6 15.6L16.4 15.8') +
        '<g class="pcs-wave-hand">' + line('M16.4 15.8L20.4 9.8') + hand(20.8, 9.1, 1.3) +
        '<path class="pcs-motion" d="M23.4 7.6q1.2 1.5 0 3M24.8 6.6q1.8 2.5 0 5"/>' +
        '</g></g>' +
        head(id, 6, 0, { x: 0.3, open: true })
      );
    },
    celebrate: function (id) {
      return (
        line('M11.6 16.3L11.4 25.4') +
        legs([11.4, 25.4], [7.4, 32.4], [15.6, 32.4]) +
        '<g class="pcs-back-arm">' + line('M11.6 18.4L6.6 15.6L3.4 10.6') + hand(3.1, 10) + '</g>' +
        '<g class="pcs-front-arm">' + line('M11.6 18.4L19.6 16.4L23.6 11') + hand(24, 10.4) + '</g>' +
        head(id, 7, 3, { happy: true, open: true }) +
        '<path class="pcs-motion" d="M1 7l-1.4-1.6M3.6 5.4V3.4M26 7.6l1.4-1.6M23.6 6.2V4.2M27.4 11.2h2"/>'
      );
    }
  };

  var VIEW = {
    hello: '2 0 26 33', peek: '0 0 30 30', write: '6 0 30 33', sign: '6 0 30 33',
    wave: '2 0 28 33', celebrate: '-2 1 33 34'
  };

  function sideClass(o) { return ' pcs--' + ((o && o.side) || 'ink'); }

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
