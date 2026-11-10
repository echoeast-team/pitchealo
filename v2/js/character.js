/*
 * Pitchealo character, V2
 * A tall, slim figure drawn as a rough black-and-white sketch: every outline has a
 * second offset pass, shading is loose ink hatching, and the only colour is the
 * jacket (the side colour: Publicadores #b9552b, Fuentes #008c7d). The colour
 * fill is printed slightly off-register from the ink, like a screen print.
 *
 *   PitchealoSketch.svg(pose, {side:'pub'|'fue'|'ink', className})  -> <svg> string
 *   PitchealoSketch.group(pose, {side})                               -> <g> string (inside another SVG)
 *
 * Poses: hello, peek, bust, write, sign, wave, celebrate.
 * write / sign hold an oversized quill / fountain pen whose tip is at (31, 30),
 * the same anchor the hero uses to walk the figure along the handwriting.
 * The figure stands on y = 31; the head reaches up to about y = -12.
 */
(function () {
  'use strict';

  // The logo head; still exported because the hero draws it in a clipping's photo.
  var HEAD =
    'M4 29c-1.6-3.4-2.4-6.6-2.4-10.2C1.6 10.4 7 4 14 4c5.4 0 9 3.6 9.4 8.4l2.4 4.6c.3.6 0 1.1-.6 1.3' +
    'l-1.4.4.5 1.6-1.6.9.9 1.3c-.2 2.5-2 3.9-4.6 3.9h-2.4V29z';
  var TIP = { x: 31, y: 30 };
  var PEN_ANGLE = -95; // the big pen stands almost upright beside the figure
  var WAVES = 'M18.6 -6.1l1.1-.7M18.9 -4.9h1.4M18.6 -3.7l1.1.7';

  // ---------- drawing helpers ----------
  function ink(d, extra) {
    // ink outline plus a lighter, slightly offset second pass for the rough-sketch look
    return '<path class="pcs-line' + (extra ? ' ' + extra : '') + '" d="' + d + '"/>' +
      '<path class="pcs-line pcs-line--pass" transform="translate(.24 -.2)" d="' + d + '"/>';
  }
  function shape(d, fill, offset) {
    var t = offset ? ' transform="translate(-.32 .26)"' : '';
    return '<path class="' + fill + '"' + t + ' d="' + d + '"/>' + ink(d);
  }
  function shade(d) { return '<path class="pcs-shade" d="' + d + '"/>'; }
  function pts(p) {
    return 'M' + p.map(function (q) { return q[0] + ' ' + q[1]; }).join('L');
  }
  function sleeve(p) {
    // jacket sleeve: ink stroke with a narrower, off-register colour stroke inside
    var d = pts(p);
    return '<path class="pcs-sleeve-out" d="' + d + '"/>' +
      '<path class="pcs-sleeve" transform="translate(-.18 .16)" d="' + d + '"/>';
  }
  function hand(x, y, rot) {
    var r = rot || 0;
    return '<g transform="rotate(' + r + ' ' + x + ' ' + y + ')">' +
      '<ellipse class="pcs-fill" cx="' + x + '" cy="' + y + '" rx=".85" ry="1.1"/>' +
      '<ellipse class="pcs-line pcs-line--thin" cx="' + x + '" cy="' + y + '" rx=".85" ry="1.1"/>' +
      '<path class="pcs-line pcs-line--thin" d="M' + (x + 0.55) + ' ' + (y - 0.5) + 'l.55-.35"/></g>';
  }

  // ---------- body parts (figure centred on x = 14, standing on y = 31) ----------
  function boots() {
    return shape('M11 28.1L10.8 30.3Q10.8 31 11.5 31L14.2 31Q14.8 31 14.4 30.3L13.6 29.4L13.6 28.1Z', 'pcs-ink') +
      shape('M14.9 28.1L14.8 30.4Q14.8 31 15.4 31L18.5 31Q19.2 31 18.7 30.3L17.4 29.3L17.4 28.1Z', 'pcs-ink') +
      '<path class="pcs-glint" d="M15.5 29.6h1.3M11.5 29.5h1.1"/>';
  }
  function socks() {
    return shape('M11.05 26.9h2.55v1.3h-2.55z', 'pcs-fill') + shape('M14.95 26.9h2.45v1.3h-2.45z', 'pcs-fill');
  }
  function trousers() {
    return shape('M10.3 13.2L17.7 13.2L19.5 27.2L8.5 27.2Z', 'pcs-fill') +
      ink('M14.05 17.4L14.1 27.2', 'pcs-line--thin') +
      ink('M10.3 14.2L17.7 14.2', 'pcs-line--thin') +
      ink('M11 14.4Q12.1 16 10.9 17.8', 'pcs-line--thin') +
      ink('M17.1 14.4Q16.1 15.9 17.2 17.4', 'pcs-line--thin') +
      shade('M9.1 26.4l1.7-1.7M9.3 24.6l1.6-1.6M9.5 22.8l1.5-1.5M9.75 21l1.3-1.3M10 19.2l1-1M14.6 26.6l1.2-1.2M14.6 24.6l.9-.9');
  }
  function jacket() {
    return shape('M12.2 .1Q9.6 .3 9.3 2.8L9.7 14.4Q14 15.3 18.3 14.4L18.7 2.8Q18.4 .3 15.8 .1Z', 'pcs-jacket', true) +
      shade('M9.9 4.2l1.3-1.3M9.95 6.2l1.6-1.6M10 8.2l1.6-1.6M10.1 10.2l1.6-1.6M10.2 12.2l1.5-1.5') +
      ink('M14 2.6L14 14.9', 'pcs-line--thin') +
      '<circle class="pcs-ink" cx="14.55" cy="5.2" r=".24"/><circle class="pcs-ink" cx="14.55" cy="8.2" r=".24"/><circle class="pcs-ink" cx="14.55" cy="11.2" r=".24"/>' +
      ink('M15.7 11h2.2', 'pcs-line--thin') +
      shape('M12.3 .1L13.95 2.6L12.5 2.75Z', 'pcs-fill') +
      shape('M15.7 .1L14.05 2.6L15.5 2.75Z', 'pcs-fill');
  }
  function neck() {
    return shape('M13.15 -3.4L13.1 .5L14.9 .5L14.85 -3Z', 'pcs-fill') + shade('M13.35 -2l1.3-.7M13.35 -1l1.3-.7');
  }
  function head(o) {
    o = o || {};
    var lx = o.x || 0, ly = o.y || 0;
    var eye = o.happy
      ? ink('M15.35 -6.5q.55-.65 1.1 0', 'pcs-line--thin')
      : '<g class="pcs-eye"><g class="pcs-pupil"><ellipse class="pcs-ink" cx="' + (15.95 + lx).toFixed(2) + '" cy="' + (-6.6 + ly).toFixed(2) + '" rx=".3" ry=".38"/></g></g>';
    var mouth = o.open
      ? '<path class="pcs-ink" d="M16.05 -4.15q.55 1 1.1 0z"/>'
      : ink('M16.15 -3.95q.5 .28 .85 0', 'pcs-line--thin');
    var waves = o.waves ? '<path class="pcs-line pcs-waves' + (o.waves === 'peek' ? ' pcs-waves--peek' : '') + '" d="' + WAVES + '"/>' : '';
    var curls = [[11.4, -8.4, .7], [12, -9.9, .75], [13.3, -10.9, .8], [14.9, -11.1, .8], [16.3, -10.5, .7], [17, -9.3, .55], [11.3, -6.9, .55]]
      .map(function (c) { return '<circle class="pcs-ink" cx="' + c[0] + '" cy="' + c[1] + '" r="' + c[2] + '"/>'; }).join('');
    return '<g class="pcs-head"' + (o.tilt ? ' transform="rotate(' + o.tilt + ' 14 -2.8)"' : '') + '>' +
      shape('M13.3 -2.6C11.6 -3.2 11.1 -5.6 11.7 -7.4C12.4 -9.4 15.2 -10 16.4 -8.4C16.9 -7.7 16.9 -7 17.1 -6.4L17.8 -5.2C17.9 -5 17.7 -4.8 17.4 -4.8L17.1 -4.8C17.2 -4.2 17.1 -3.6 16.7 -3.2C16.1 -2.6 14.6 -2.3 13.3 -2.6Z', 'pcs-fill') +
      '<path class="pcs-ink" d="M11.5 -6.2C10.6 -7.6 11 -9.8 12.8 -10.5C13.4 -11.4 15.2 -11.6 16 -10.8C17 -10.6 17.6 -9.6 17.1 -8.6C16.4 -8.9 15.8 -8.5 15.4 -8.1C14.8 -8.6 14 -8.2 13.6 -7.6C13 -7.6 12.8 -6.8 12.6 -6.2C12.2 -5.8 11.8 -5.8 11.5 -6.2Z"/>' +
      curls +
      ink('M13.35 -5.8c-.7-.2-1 .5-.9 1 .1.5.5.8 1 .7', 'pcs-line--thin') +
      ink('M15.3 -7.55q.65-.42 1.35-.1', 'pcs-line--thin') +
      eye + mouth + waves + '</g>';
  }
  function body(o) {
    // everything except the arms; arms differ per pose
    return boots() + socks() + trousers() + jacket() + neck() + head(o);
  }

  // ---------- the big pens ----------
  function quill() {
    // along +x from the tip at the origin
    var barbs = '';
    for (var d = 15.2; d < 33.5; d += 1.25) {
      var t = (d - 14) / 20;
      var up = 3.1 * Math.sin(Math.PI * Math.min(1, t * 1.15)) + 0.4;
      var dn = 1.6 * Math.sin(Math.PI * Math.min(1, t * 1.1)) + 0.2;
      barbs += 'M' + d.toFixed(2) + ' 0l1.3 -' + up.toFixed(2) + 'M' + d.toFixed(2) + ' 0l1 ' + dn.toFixed(2);
    }
    return shape('M14 0C20 -3.8 28 -4.4 34.6 -1.3C28 1.9 20 2 14 0Z', 'pcs-fill') +
      '<path class="pcs-shade pcs-shade--barb" d="' + barbs + '"/>' +
      ink('M2.2 0L34.2 -.4') +
      shape('M0 0L2.8 -.6L2.8 .6Z', 'pcs-ink');
  }
  function fountainPen() {
    return shape('M0 0L4.2 -1.45L4.2 1.45Z', 'pcs-fill') +
      ink('M.7 0H3.2', 'pcs-line--thin') + '<circle class="pcs-ink" cx="3.3" cy="0" r=".28"/>' +
      shape('M4.2 -1.35L7.2 -1.7L7.2 1.7L4.2 1.35Z', 'pcs-ink') +
      shape('M7.2 -1.75H29.8Q32.6 -1.75 32.6 0Q32.6 1.75 29.8 1.75H7.2Z', 'pcs-fill') +
      ink('M9.2 -1.75v3.5M9.9 -1.75v3.5M26.6 -1.75v3.5M27.3 -1.75v3.5', 'pcs-line--thin') +
      ink('M15 -1.75L15.4 -2.6L27.4 -2.6L27.4 -1.75', 'pcs-line--thin') +
      shade('M10.6 1.05H26M11 .45H25');
  }
  function bigPen(kind) {
    // outer transform matches the CSS scribble animation on the home page cards
    return '<g class="pcs-tool" transform="translate(31 30) rotate(' + PEN_ANGLE + ')">' +
      (kind === 'pen' ? fountainPen() : '<g transform="scale(1 -1)">' + quill() + '</g>') + '</g>';
  }
  // a point d units up the pen from its tip
  function onPen(d) {
    var a = PEN_ANGLE * Math.PI / 180;
    return [+(31 + Math.cos(a) * d).toFixed(2), +(30 + Math.sin(a) * d).toFixed(2)];
  }

  // ---------- poses ----------
  var B = [10.3, 1.3], F = [17.7, 1.3]; // shoulders

  function writing(kind) {
    // the figure stands 7 units right of centre, holding the big pen upright like a staff
    var h = onPen(20);
    return '<g transform="translate(7 0)">' + body({ x: 0.35, y: 0.35, tilt: 6 }) +
      sleeve([B, [9.6, 7.2], [9.9, 12.3]]) + hand(10, 13.4) + '</g>' +
      bigPen(kind) +
      sleeve([[F[0] + 7, F[1]], [26.3, 7.5], [h[0] - 0.7, h[1] + 0.2]]) +
      hand(h[0], h[1], -12);
  }

  var poses = {
    hello: function () {
      // standing, one hand in a pocket, talking
      return body({ x: 0.1, waves: 'on' }) +
        sleeve([B, [9.6, 7.2], [9.9, 12.3]]) + hand(10, 13.4) +
        sleeve([F, [19.1, 7.4], [17.6, 13.1]]);
    },
    peek: function () {
      // head and shoulders over an edge at y ≈ 18 (the page draws the hands on the edge);
      // the hair rises above the box, which is fine: the box is what slides up and down
      return '<g transform="translate(-10.9 14.28) scale(1.8)">' +
        jacket() + neck() + head({ x: 0.3, y: 0.3, waves: 'peek' }) + '</g>';
    },
    bust: function () {
      // head and shoulders, for small spots such as the sign-up options
      return '<g transform="translate(-10.9 14.28) scale(1.8)">' +
        jacket() + neck() + head({ x: 0.2 }) + '</g>';
    },
    write: function () { return writing('quill'); },
    sign: function () { return writing('pen'); },
    wave: function () {
      return body({ x: 0.1, open: true }) +
        sleeve([B, [9.6, 7.2], [9.9, 12.3]]) + hand(10, 13.4) +
        '<g class="pcs-wave-arm">' + sleeve([F, [20.4, -1.4]]) +
        '<g class="pcs-wave-hand">' + sleeve([[20.4, -1.4], [21.2, -5.5]]) + hand(21.3, -6.7, 8) +
        '<path class="pcs-motion" d="M23 -8.4q1 1.3 0 2.6M24.2 -9.2q1.6 2.1 0 4.2"/>' +
        '</g></g>';
    },
    celebrate: function () {
      return body({ happy: true, open: true }) +
        '<g class="pcs-back-arm">' + sleeve([B, [7.9, -2.4], [7.4, -6.5]]) + hand(7.3, -7.6, -8) + '</g>' +
        '<g class="pcs-front-arm">' + sleeve([F, [20.1, -2.4], [20.7, -6.5]]) + hand(20.8, -7.6, 8) + '</g>' +
        '<path class="pcs-motion" d="M5.6 -9.6l-1-1.2M7.3 -10.6v-1.4M22.6 -9.6l1-1.2M20.9 -10.6v-1.4M23.4 -7.4h1.4"/>';
    }
  };

  var VIEW = {
    hello: '6.5 -12.5 15.5 44.5', peek: '0 0 30 30', bust: '1 -7.5 28 36',
    write: '15 -12.5 19.5 44.5', sign: '15 -12.5 19.5 44.5',
    wave: '6.5 -12.5 19 44.5', celebrate: '3.5 -12.5 21.5 44.5'
  };

  function sideClass(o) { return ' pcs--' + ((o && o.side) || 'ink'); }

  function group(pose, opts) {
    var fn = poses[pose] || poses.hello;
    return '<g class="pcs pcs-pose--' + pose + sideClass(opts) + '">' + fn() + '</g>';
  }

  function svg(pose, opts) {
    var cls = (opts && opts.className) || '';
    return (
      '<svg class="pcs-svg pcs-svg--' + pose + ' ' + cls + sideClass(opts) + '" viewBox="' + (VIEW[pose] || VIEW.hello) +
      '" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">' +
      group(pose, opts) + '</svg>'
    );
  }

  window.PitchealoSketch = { svg: svg, group: group, TIP: TIP, HEAD: HEAD, WAVES: WAVES, VIEW: VIEW };
})();
