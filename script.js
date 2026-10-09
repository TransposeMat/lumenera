/* Lumenera — Print Preview interactions
   1. WhatsApp deep links with pre-filled messages
   2. Slicer viewport demo (the Lumenera L, printed layer by layer)
   3. Scroll layer rail
   4. G-code line arrivals (section reveals)
   5. Gallery plate filters
   6. Order builder -> WhatsApp message composer
*/

(function () {
  'use strict';

  var WA_NUMBER = '923487259122';
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. WhatsApp deep links ---------- */
  function waHref(text) {
    return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(text);
  }
  var TEMPLATES = {
    generic: function () {
      return "Hi Lumenera! I want to get something 3D printed. Here's the model link (or I'll send the file): ";
    },
    own: function () {
      return "Hi Lumenera! I have my own model to print. I'll send the link/file here: ";
    },
    guide: function () {
      return 'Hi Lumenera! I followed your guide and found a model I like. Here is the link: ';
    },
    card: function (d) {
      return 'Hi Lumenera! Please print this model for me:\n' + (d.model || '') + '\n' + (d.link || '') +
        '\nColour I want: \nMy city: ';
    }
  };
  Array.prototype.forEach.call(document.querySelectorAll('a[data-wa]'), function (a) {
    var kind = a.getAttribute('data-wa');
    if (kind === 'builder') return; // handled below
    var tpl = TEMPLATES[kind];
    if (tpl) a.href = waHref(tpl(a.dataset));
  });

  /* ---------- 2. Slicer viewport demo ---------- */
  var canvas = document.getElementById('slicerCanvas');
  if (canvas && canvas.getContext) {
    var ctx = canvas.getContext('2d');
    var slider = document.getElementById('layerSlider');
    var readout = document.getElementById('readout');
    var TOTAL = 240;
    var FULL_GRAMS = 42;
    var COS30 = Math.sqrt(3) / 2;

    // the L, in plan units (1 x 1 model footprint, arm thickness T).
    // Left column full height + foot along the front edge = reads as "L"
    // in the straight-down projection.
    var T = 0.34;
    var PLAN = [
      [0, 0], [T, 0], [T, 1 - T], [1, 1 - T], [1, 1], [0, 1]
    ];
    var PLATE = { min: -0.08, max: 1.08 };
    // cumulative perimeter for nozzle position
    var perim = [];
    (function () {
      var total = 0;
      for (var i = 0; i < PLAN.length; i++) {
        var a = PLAN[i], b = PLAN[(i + 1) % PLAN.length];
        var len = Math.hypot(b[0] - a[0], b[1] - a[1]);
        perim.push({ a: a, b: b, from: total, len: len });
        total += len;
      }
      perim.total = total;
      perim.pointAt = function (f) {
        var d = ((f % 1) + 1) % 1 * this.total;
        for (var i = 0; i < this.length; i++) {
          var e = this[i];
          if (d <= e.from + e.len) {
            var t = (d - e.from) / e.len;
            return [e.a[0] + (e.b[0] - e.a[0]) * t, e.a[1] + (e.b[1] - e.a[1]) * t];
          }
        }
        return this[this.length - 1].b;
      };
    })();

    // Projection: the top face reads as a true "L" (like the logo), while the
    // layer stack below gives it printed depth. sx straight right, sy straight down.
    var UX = 1.2247; // projected plate width per unit
    var UY = 0.7071; // projected plate depth per unit
    var view = { cx: 0, cy: 0, s: 200, zPix: 0.6 };
    var cur = prefersReduced ? TOTAL : 0;
    var playing = !prefersReduced;
    var pausedUntil = 0;
    var lastT = 0;

    function fit() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var w = canvas.clientWidth || 640;
      var h = canvas.clientHeight || Math.round(w * 520 / 640);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      view.s = Math.min((w * 0.56) / UX, (h * 0.58) / UY);
      view.zPix = (h * 0.24) / TOTAL;
      var stackH = TOTAL * view.zPix;
      var mid = (PLATE.min + PLATE.max) / 2;
      view.cx = w / 2 - mid * UX * view.s;
      view.cy = h / 2 - mid * UY * view.s + stackH / 2;
    }

    function iso(x, y, z) {
      return [
        view.cx + x * UX * view.s,
        view.cy + y * UY * view.s - z * view.zPix
      ];
    }

    function poly(pts, z, fill, stroke, lw) {
      ctx.beginPath();
      for (var i = 0; i < pts.length; i++) {
        var p = iso(pts[i][0], pts[i][1], z);
        if (i === 0) ctx.moveTo(p[0], p[1]); else ctx.lineTo(p[0], p[1]);
      }
      ctx.closePath();
      if (fill) { ctx.fillStyle = fill; ctx.fill(); }
      if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 1; ctx.stroke(); }
    }

    function pathUpTo(curLayers) {
      // partial outline of the current layer drawn so far (fraction f of perimeter)
      return Math.max(0, Math.min(1, (curLayers - Math.floor(curLayers))));
    }

    function draw() {
      var w = canvas.clientWidth || 640;
      var h = canvas.clientHeight || 520;
      ctx.clearRect(0, 0, w, h);

      var done = Math.min(TOTAL, Math.floor(cur));
      var frac = cur - done;

      // build plate
      poly(
        [[PLATE.min, PLATE.min], [PLATE.max, PLATE.min], [PLATE.max, PLATE.max], [PLATE.min, PLATE.max]],
        0, '#f5f8fc', '#c3cfdd', 1.2
      );
      // plate corner ticks + faint divisions
      ctx.save();
      ctx.strokeStyle = '#aebacb';
      ctx.lineWidth = 1;
      [[PLATE.min, PLATE.min], [PLATE.max, PLATE.min], [PLATE.max, PLATE.max], [PLATE.min, PLATE.max]]
        .forEach(function (c) {
          var p = iso(c[0], c[1], 0);
          ctx.beginPath();
          ctx.arc(p[0], p[1], 3, 0, Math.PI * 2);
          ctx.stroke();
        });
      ctx.strokeStyle = 'rgba(174, 186, 203, 0.5)';
      var q = 0.25;
      for (var g = 1; g < 4; g++) {
        var xg = g * q;
        var a = iso(xg, PLATE.min, 0);
        var b = iso(xg, PLATE.max, 0);
        ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
        var c2 = iso(PLATE.min, xg, 0);
        var d2 = iso(PLATE.max, xg, 0);
        ctx.beginPath(); ctx.moveTo(c2[0], c2[1]); ctx.lineTo(d2[0], d2[1]); ctx.stroke();
      }
      ctx.restore();

      if (done === 0) {
        // pristine plate + faint nozzle parked at start
        drawNozzle(iso(PLAN[0][0], PLAN[0][1], 2));
        updateHud(0);
        return;
      }

      // printed stack — the depth band below shows the layer striations
      for (var i = 1; i <= done; i++) {
        var fill = (i % 2 === 0) ? '#f2a41c' : '#ffb632';
        var isTop = i === done;
        poly(PLAN, i, isTop ? '#ffd75e' : fill, null, 0);
        if (i % 6 === 0) poly(PLAN, i, null, 'rgba(163, 98, 4, 0.28)', 0.7);
      }

      // top surface (previous layer) + the red path being laid on it
      var topZ = done;
      if (frac > 0) {
        var p = perim.pointAt(frac);
        ctx.save();
        ctx.beginPath();
        var started = false;
        var edgeList = perim;
        for (var e = 0; e < edgeList.length; e++) {
          var edge = edgeList[e];
          var fStart = edge.from / edgeList.total;
          var fEnd = (edge.from + edge.len) / edgeList.total;
          if (frac <= fStart) break;
          var a = iso(edge.a[0], edge.a[1], topZ + 0.4);
          if (!started) { ctx.moveTo(a[0], a[1]); started = true; } else { ctx.lineTo(a[0], a[1]); }
          if (frac < fEnd) {
            var pt = iso(p[0], p[1], topZ + 0.4);
            ctx.lineTo(pt[0], pt[1]);
            break;
          }
        }
        ctx.strokeStyle = '#ff5a3c';
        ctx.lineWidth = 2.6;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.shadowColor = 'rgba(255, 90, 60, 0.55)';
        ctx.shadowBlur = 7;
        ctx.stroke();
        ctx.restore();
        drawNozzle(iso(p[0], p[1], topZ + 2.2));
      } else {
        drawNozzle(iso(PLAN[0][0], PLAN[0][1], topZ + 2.2));
      }

      updateHud(cur);
    }

    function drawNozzle(p) {
      ctx.save();
      // heater block
      ctx.fillStyle = '#2a3648';
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(p[0] - 7, p[1] - 17, 14, 10, 2.5);
      } else {
        ctx.rect(p[0] - 7, p[1] - 17, 14, 10);
      }
      ctx.fill();
      // tip
      ctx.beginPath();
      ctx.moveTo(p[0] - 4, p[1] - 7);
      ctx.lineTo(p[0] + 4, p[1] - 7);
      ctx.lineTo(p[0], p[1] - 1);
      ctx.closePath();
      ctx.fillStyle = '#4d5a6b';
      ctx.fill();
      // contact glint
      ctx.beginPath();
      ctx.arc(p[0], p[1], 2.2, 0, Math.PI * 2);
      ctx.fillStyle = '#ff5a3c';
      ctx.fill();
      ctx.restore();
    }

    function updateHud(v) {
      if (readout) {
        var layers = Math.max(1, Math.round(v));
        var grams = Math.round((v / TOTAL) * FULL_GRAMS * 10) / 10;
        var rs = Math.round(grams * 15);
        readout.textContent = 'LAYER ' + layers + '/' + TOTAL + ' · ' + grams + ' G · RS ' + rs.toLocaleString('en-PK');
      }
      if (slider && document.activeElement !== slider) {
        slider.value = Math.round((v / TOTAL) * 1000);
      }
    }

    function tick(t) {
      var dt = Math.min(0.05, (t - lastT) / 1000 || 0.016);
      lastT = t;
      if (playing && t > pausedUntil) {
        cur += dt * 3;
        if (cur >= TOTAL) {
          cur = TOTAL;
          playing = false;
          pausedUntil = t + 3400;
          setTimeout(function () { cur = 0; playing = true; }, 3600);
        }
      }
      draw();
      requestAnimationFrame(tick);
    }

    if (slider) {
      slider.addEventListener('input', function () {
        cur = (slider.value / 1000) * TOTAL;
        playing = false;
        pausedUntil = performance.now() + 6000;
        if (prefersReduced) draw();
      });
      slider.addEventListener('change', function () {
        pausedUntil = performance.now() + 6000;
        if (!prefersReduced && cur < TOTAL) playing = true;
      });
    }

    window.addEventListener('resize', function () { fit(); draw(); });
    fit();
    if (prefersReduced) {
      draw();
    } else {
      requestAnimationFrame(function (t) { lastT = t; tick(t); });
    }
  }

  /* ---------- 3. Scroll layer rail ---------- */
  var railFill = document.getElementById('railFill');
  var railDot = document.getElementById('railDot');
  function rail() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
    if (railFill) railFill.style.width = (p * 100) + '%';
    if (railDot) railDot.style.left = (p * 100) + '%';
  }
  window.addEventListener('scroll', rail, { passive: true });
  rail();

  /* ---------- 4. Arrivals (with a fail-safe: content never stays hidden) ---------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));
  function forceReveal(el) { el.classList.add('is-in'); }
  if (revealEls.length && !prefersReduced) {
    if ('IntersectionObserver' in window) {
      var VARIANTS = ['v-rise', 'v-head', 'v-fade'];
      var vSeen = new Map();
      var seen = new Map();
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            var sec = en.target.closest('section') || document.body;
            var n = seen.get(sec) || 0;
            seen.set(sec, n + 1);
            en.target.style.transitionDelay = Math.min(n * 70, 350) + 'ms';
            forceReveal(en.target);
            io.unobserve(en.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
      revealEls.forEach(function (el) {
        var sec = el.closest('section') || document.body;
        var n = vSeen.get(sec) || 0;
        vSeen.set(sec, n + 1);
        el.classList.add(VARIANTS[n % VARIANTS.length]);
        io.observe(el);
      });
      // Fail-safes: any element the visitor has already reached gets revealed
      // even if the observer missed it; and after settling, nothing stays hidden.
      var fbQueued = false;
      function fallbackScan() {
        fbQueued = false;
        var limit = window.innerHeight - 40;
        revealEls.forEach(function (el) {
          if (!el.classList.contains('is-in') && el.getBoundingClientRect().top < limit) {
            forceReveal(el);
          }
        });
      }
      function queueFallback() {
        if (!fbQueued) { fbQueued = true; requestAnimationFrame(fallbackScan); }
      }
      window.addEventListener('scroll', queueFallback, { passive: true });
      window.addEventListener('load', function () { setTimeout(queueFallback, 300); });
      setTimeout(queueFallback, 700); // after the observer's first pass, rescue anything missed
    } else {
      revealEls.forEach(forceReveal);
    }
  } else {
    revealEls.forEach(forceReveal);
  }

  /* ---------- 5. Gallery filters ---------- */
  var chips = Array.prototype.slice.call(document.querySelectorAll('.chip[data-filter]'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('#cardGrid .card'));
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      var f = chip.getAttribute('data-filter');
      chips.forEach(function (c) {
        var on = c === chip;
        c.classList.toggle('is-on', on);
        c.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      cards.forEach(function (card) {
        var keep = card.classList.contains('card-own') || f === 'all' || card.getAttribute('data-cat') === f;
        card.classList.toggle('is-hidden', !keep);
      });
    });
  });

  /* ---------- 6. Order builder ---------- */
  var form = document.getElementById('builderForm');
  var preview = document.getElementById('msgPreview');
  var outLink = document.getElementById('builderLink');
  if (form && preview && outLink) {
    var fLink = document.getElementById('bLink');
    var fDesc = document.getElementById('bDesc');
    var fColour = document.getElementById('bColour');
    var fQty = document.getElementById('bQty');
    var fCity = document.getElementById('bCity');

    function compose() {
      var link = (fLink.value || '').trim();
      var desc = (fDesc.value || '').trim();
      var colour = (fColour.value || '').trim();
      var qty = (fQty.value || '1').trim();
      var city = (fCity.value || '').trim();

      var what = link || desc || 'I will send the link/file';
      var lines = [
        "Hi Lumenera! I'd like a 3D print.",
        'Model: ' + what,
        'Colour: ' + (colour || 'you pick / show me options'),
        'Quantity: ' + (qty || '1'),
        'City: ' + (city || '—'),
        '',
        "I'll attach the file here if needed."
      ];
      return lines.join('\n');
    }

    function sync() {
      var msg = compose();
      preview.textContent = msg;
      outLink.href = waHref(msg);
    }

    [fLink, fDesc, fColour, fQty, fCity].forEach(function (el) {
      if (el) el.addEventListener('input', sync);
    });
    sync();
  }
})();
