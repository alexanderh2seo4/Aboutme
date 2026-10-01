/* Sternenhimmel im Hintergrund: funkelnde Sterne plus eine langsam drehende
   Spiralgalaxie hinter dem Kopf. Reines Canvas, keine Abhängigkeiten.
   Bei prefers-reduced-motion wird genau ein Standbild gezeichnet. */
(function () {
  var canvas = document.getElementById('sky');
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext('2d');
  var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var W = 0, H = 0, dpr = 1;
  var stars = [];
  var mx = 0, my = 0, px = 0, py = 0;   // Maus-Parallaxe, geglättet
  var scroll = 0;
  var t0 = performance.now();
  var running = false;

  // Weiche Lichthöfe als vorgerenderte Sprites, je Farbe eins, damit pro Frame nur drawImage anfällt.
  var WHITE = '255,255,255', BLUE = '175,205,255', WARM = '255,186,130';
  function makeGlow(c) {
    var el = document.createElement('canvas');
    el.width = el.height = 64;
    var g = el.getContext('2d');
    var r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    r.addColorStop(0, 'rgba(255,255,255,1)');
    r.addColorStop(0.12, 'rgba(' + c + ',0.75)');
    r.addColorStop(0.4, 'rgba(' + c + ',0.14)');
    r.addColorStop(1, 'rgba(' + c + ',0)');
    g.fillStyle = r;
    g.fillRect(0, 0, 64, 64);
    return el;
  }
  var glows = {};
  glows[WHITE] = makeGlow(WHITE);
  glows[BLUE] = makeGlow(BLUE);
  glows[WARM] = makeGlow(WARM);
  var glow = glows[WHITE];

  // Fast alle Sterne weiß, ein Teil kühl-blau, ein paar warm — wie auf Langzeitbelichtungen.
  function tint(blue, warm) {
    var k = Math.random();
    if (k < warm) return WARM;
    if (k < warm + blue) return BLUE;
    return WHITE;
  }

  function gauss() {
    return Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(6.283 * Math.random());
  }

  function rand(a, b) { return a + Math.random() * (b - a); }

  function build() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    var n = Math.min(420, Math.round(W * H / 3800));
    stars = [];
    for (var i = 0; i < n; i++) {
      var z = Math.random();                       // 0 = fern, 1 = nah
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        z: z,
        r: 0.25 + z * z * 1.1,
        a: 0.25 + z * 0.6,
        tw: rand(0.4, 1.6),                        // Funkelgeschwindigkeit
        ph: Math.random() * 6.283,
        c: tint(0.18, 0.1),
        big: z > 0.93                              // wenige helle Sterne mit Lichthof
      });
    }

    buildGalaxy();
  }

  // Lage und Größe der Galaxie: rechts neben der Textspalte, auf schmalen Bildschirmen hinter dem Kopf.
  function geom() {
    if (W < 760) {
      var r = Math.min(W * 0.75, 330);
      return { R: r, x: W * 0.8, y: 80, fade: 0.5, narrow: true };
    }
    var R = Math.max(260, Math.min(W * 0.27, 430));
    return { R: R, x: W / 2 + 330 + R * 0.5, y: 30 + R * 0.55, fade: 1, narrow: false };
  }

  // Zwei logarithmische Spiralarme, etwas mehr als eine Windung.
  function armPoint(arm, d, w) {
    var a = arm * Math.PI + Math.log(d / 0.08) * 3.0;
    return { x: Math.cos(a) * d + gauss() * w, y: Math.sin(a) * d + gauss() * w };
  }
  function armWidth(d) { return 0.022 + d * 0.055; }
  function armRadius() { return 0.09 + Math.pow(Math.random(), 0.9) * 0.91; }

  var disc = null, discSize = 0, bright = [];

  // Der dichte Teil der Galaxie (Dunst, Tausende schwache Sterne, Sternhaufen, Kern) wird einmal
  // vorgerendert und pro Frame nur als Ganzes gedreht. Die hellen Sterne obendrauf funkeln einzeln.
  function buildGalaxy() {
    var G = geom(), R = G.R;
    discSize = Math.ceil(R * 2.4);
    disc = document.createElement('canvas');
    disc.width = disc.height = Math.ceil(discSize * dpr);
    var g = disc.getContext('2d');
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.globalCompositeOperation = 'lighter';
    var C = discSize / 2;
    var small = W < 640;

    function sprite(c, x, y, size, alpha) {
      g.globalAlpha = alpha;
      g.drawImage(glows[c], C + x * R - size / 2, C + y * R - size / 2, size, size);
    }
    function dot(c, x, y, size, alpha) {
      g.globalAlpha = alpha;
      g.fillStyle = 'rgb(' + c + ')';
      g.fillRect(C + x * R - size / 2, C + y * R - size / 2, size, size);
    }

    // Blauer Schleier um die ganze Scheibe und warmer Kern.
    sprite(BLUE, 0, 0, R * 2.3, 0.10);
    sprite(WARM, 0, 0, R * 0.95, 0.35);
    sprite(WHITE, 0, 0, R * 0.42, 0.75);
    sprite(WHITE, 0, 0, R * 0.14, 1);

    var i, p, d;
    // Leuchtender Dunst entlang der Arme.
    for (i = 0; i < 900; i++) {
      d = armRadius();
      p = armPoint(i % 2, d, armWidth(d) * 1.3);
      sprite(Math.random() < 0.8 ? BLUE : WHITE, p.x, p.y, R * (0.05 + Math.random() * 0.1), 0.035);
    }
    // Schwache Sterne: überwiegend in den Armen, der Rest in der Scheibe um den Kern.
    var n = small ? 2600 : 5200;
    for (i = 0; i < n; i++) {
      if (Math.random() < 0.75) {
        d = armRadius();
        p = armPoint(i % 2, d, armWidth(d));
      } else {
        d = -Math.log(1 - Math.random()) * 0.14;
        var a = Math.random() * 6.283;
        p = { x: Math.cos(a) * d, y: Math.sin(a) * d };
      }
      dot(tint(0.3, 0.12), p.x, p.y, 0.5 + Math.random() * 0.8, 0.15 + Math.random() * 0.55 * (1 - d * 0.4));
    }
    // Sternhaufen: die hellen Knoten, die die Arme körnig machen.
    var clusters = [];
    for (i = 0; i < 70; i++) {
      d = 0.14 + Math.random() * 0.82;
      p = armPoint(i % 2, d, armWidth(d) * 0.6);
      clusters.push(p);
      sprite(Math.random() < 0.7 ? BLUE : WHITE, p.x, p.y, R * 0.05, 0.22);
      var m = 12 + Math.floor(Math.random() * 18);
      for (var k = 0; k < m; k++) {
        dot(tint(0.35, 0.15), p.x + gauss() * 0.012, p.y + gauss() * 0.012, 0.6 + Math.random() * 0.9, 0.35 + Math.random() * 0.6);
      }
    }
    g.globalAlpha = 1;

    // Helle Einzelsterne, zum Teil in den Haufen, zum Teil frei in den Armen.
    var count = small ? 90 : 170;
    bright = [];
    for (i = 0; i < count; i++) {
      if (Math.random() < 0.55) {
        var c0 = clusters[Math.floor(Math.random() * clusters.length)];
        p = { x: c0.x + gauss() * 0.02, y: c0.y + gauss() * 0.02 };
      } else {
        d = armRadius();
        p = armPoint(i % 2, d, armWidth(d) * 0.9);
      }
      bright.push({
        d: Math.sqrt(p.x * p.x + p.y * p.y),
        ang: Math.atan2(p.y, p.x),
        s: Math.random() < 0.12 ? rand(10, 16) : rand(4, 9),
        a: rand(0.5, 1),
        tw: rand(0.6, 2),
        ph: Math.random() * 6.283,
        c: tint(0.3, 0.16)
      });
    }
  }

  function drawStars(t) {
    var ox = px * 14, oy = py * 10;
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      // Langsame Drift nach oben, nahe Sterne schneller; Scroll verschiebt nach Tiefe.
      var y = (s.y - t * (1.2 + s.z * 3.5) - scroll * (0.04 + s.z * 0.12)) % H;
      if (y < 0) y += H;
      var x = s.x + ox * s.z;
      y += oy * s.z;
      var tw = still ? 1 : 0.55 + 0.45 * Math.sin(t * s.tw + s.ph);
      var a = s.a * tw;
      if (s.big) {
        var g = 10 + s.r * 6;
        ctx.globalAlpha = a * 0.7;
        ctx.drawImage(glow, x - g / 2, y - g / 2, g, g);
      }
      ctx.globalAlpha = a;
      ctx.fillStyle = 'rgb(' + s.c + ')';
      ctx.beginPath();
      ctx.arc(x, y, s.r, 0, 6.283);
      ctx.fill();
    }
  }

  function drawGalaxy(t) {
    if (!disc) return;
    var G = geom(), R = G.R;
    var cx = G.x + px * 6, cy = G.y - scroll * 0.35 + py * 5;
    if (cx - R * 1.2 > W || cy + R * 1.2 < 0) return;
    var fade = Math.max(0, 1 - scroll / 600) * G.fade;
    if (fade <= 0) return;

    var tilt = 0.78, rot = -0.5;                 // leicht geneigte Scheibe
    var theta = still ? 0 : t * 0.015;           // eine Umdrehung in rund sieben Minuten
    var cr = Math.cos(rot), sr = Math.sin(rot);

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.translate(cx, cy);
    ctx.rotate(rot);
    ctx.scale(1, tilt);
    ctx.rotate(theta);
    ctx.globalAlpha = fade;
    ctx.drawImage(disc, -discSize / 2, -discSize / 2, discSize, discSize);
    ctx.restore();

    ctx.globalCompositeOperation = 'lighter';
    for (var i = 0; i < bright.length; i++) {
      var b = bright[i];
      var a = b.ang + theta;
      var lx = Math.cos(a) * b.d * R;
      var ly = Math.sin(a) * b.d * R * tilt;
      var x = cx + lx * cr - ly * sr;
      var y = cy + lx * sr + ly * cr;
      var tw = still ? 1 : 0.6 + 0.4 * Math.sin(t * b.tw + b.ph);
      ctx.globalAlpha = b.a * tw * fade;
      ctx.drawImage(glows[b.c], x - b.s / 2, y - b.s / 2, b.s, b.s);
    }
    ctx.globalCompositeOperation = 'source-over';

    // Hinter der Textspalte die Galaxie abdunkeln, damit der Text lesbar bleibt.
    if (!G.narrow) {
      var left = W / 2 - 330, right = W / 2 + 330;
      var grad = ctx.createLinearGradient(right - 40, 0, right + 90, 0);
      grad.addColorStop(0, 'rgba(0,0,0,0.6)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.globalCompositeOperation = 'destination-out';
      ctx.globalAlpha = 1;
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(left - 40, 0, right - 40 - (left - 40), H);
      ctx.fillStyle = grad;
      ctx.fillRect(right - 40, 0, 130, H);
      ctx.globalCompositeOperation = 'source-over';
    }
  }

  function frame(now) {
    var t = (now - t0) / 1000;
    px += (mx - px) * 0.04;
    py += (my - py) * 0.04;
    ctx.globalAlpha = 1;
    ctx.clearRect(0, 0, W, H);
    drawGalaxy(t);
    drawStars(t);
    if (running) requestAnimationFrame(frame);
  }

  function start() {
    if (still) { frame(t0); return; }
    if (running) return;
    running = true;
    requestAnimationFrame(frame);
  }

  function stop() { running = false; }

  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () { build(); if (still) frame(t0); }, 120);
  });
  window.addEventListener('scroll', function () {
    scroll = window.scrollY || 0;
    if (still) frame(t0);
  }, { passive: true });
  window.addEventListener('pointermove', function (e) {
    mx = e.clientX / W - 0.5;
    my = e.clientY / H - 0.5;
  }, { passive: true });
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stop(); else start();
  });

  build();
  scroll = window.scrollY || 0;
  start();
})();
