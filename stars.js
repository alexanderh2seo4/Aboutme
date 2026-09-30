/* Sternenhimmel im Hintergrund: funkelnde Sterne plus eine langsam drehende
   Spiralgalaxie hinter dem Kopf. Reines Canvas, keine Abhängigkeiten.
   Bei prefers-reduced-motion wird genau ein Standbild gezeichnet. */
(function () {
  var canvas = document.getElementById('sky');
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext('2d');
  var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var W = 0, H = 0, dpr = 1;
  var stars = [], galaxy = [];
  var mx = 0, my = 0, px = 0, py = 0;   // Maus-Parallaxe, geglättet
  var scroll = 0;
  var t0 = performance.now();
  var running = false;

  // Weicher Lichthof als vorgerendertes Sprite, damit pro Frame nur drawImage anfällt.
  var glow = document.createElement('canvas');
  glow.width = glow.height = 64;
  (function () {
    var g = glow.getContext('2d');
    var r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    r.addColorStop(0, 'rgba(255,255,255,1)');
    r.addColorStop(0.18, 'rgba(255,255,255,0.55)');
    r.addColorStop(0.45, 'rgba(200,220,255,0.12)');
    r.addColorStop(1, 'rgba(200,220,255,0)');
    g.fillStyle = r;
    g.fillRect(0, 0, 64, 64);
  })();

  // Fast alle Sterne weiß, ein paar kühl-blau, ein paar warm — wie auf Langzeitbelichtungen.
  function tint() {
    var k = Math.random();
    if (k < 0.12) return '255,214,190';
    if (k < 0.30) return '205,225,255';
    return '255,255,255';
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
        c: tint(),
        big: z > 0.93                              // wenige helle Sterne mit Lichthof
      });
    }

    // Zwei logarithmische Spiralarme plus diffuser Kern.
    var count = W < 640 ? 520 : 900;
    galaxy = [];
    for (var j = 0; j < count; j++) {
      var core = j < count * 0.18;
      var arm = j % 2;
      var d = core ? Math.pow(Math.random(), 1.8) * 0.22 : 0.12 + Math.pow(Math.random(), 0.85) * 0.88;
      var ang = core ? Math.random() * 6.283 : arm * Math.PI + Math.log(d * 9 + 1) * 2.35;
      var spread = core ? 0 : (0.05 + d * 0.16) * (Math.random() - 0.5) * 2;
      galaxy.push({
        d: d + spread * 0.35,
        ang: ang + spread,
        r: Math.random() < 0.07 ? rand(0.9, 1.6) : rand(0.3, 0.9),
        a: core ? rand(0.35, 0.9) : rand(0.25, 0.95),
        ph: Math.random() * 6.283,
        c: tint()
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
    var narrow = W < 760;
    var R = narrow ? Math.min(W * 0.62, 300) : Math.min(W * 0.26, 360);
    var cx = narrow ? W * 0.72 : W / 2 + 330 + R * 0.35;
    var cy = narrow ? 70 : 150;
    if (!narrow && cx - R * 0.6 > W) return;
    cy -= scroll * 0.35;
    if (cy + R < 0) return;
    var fade = Math.max(0, 1 - scroll / 520) * (narrow ? 0.4 : 0.75);
    if (fade <= 0) return;
    cx += px * 6;
    cy += py * 5;

    var tilt = 0.52, rot = -0.35;               // leicht geneigte Scheibe
    var cr = Math.cos(rot), sr = Math.sin(rot);

    ctx.globalCompositeOperation = 'lighter';
    var kern = R * 0.55;
    ctx.globalAlpha = 0.22 * fade;
    ctx.drawImage(glow, cx - kern, cy - kern * tilt * 1.4, kern * 2, kern * 2 * tilt * 1.4);

    for (var i = 0; i < galaxy.length; i++) {
      var p = galaxy[i];
      // Differentielle Rotation: innen schneller als außen.
      var a = p.ang + (still ? 0 : t * 0.018 / (0.35 + p.d));
      var lx = Math.cos(a) * p.d * R;
      var ly = Math.sin(a) * p.d * R * tilt;
      var x = cx + lx * cr - ly * sr;
      var y = cy + lx * sr + ly * cr;
      var tw = still ? 1 : 0.7 + 0.3 * Math.sin(t * 1.3 + p.ph);
      ctx.globalAlpha = p.a * tw * fade * (1 - p.d * 0.45);
      ctx.fillStyle = 'rgb(' + p.c + ')';
      if (p.r > 1.1) {
        var g = p.r * 7;
        ctx.drawImage(glow, x - g / 2, y - g / 2, g, g);
      } else {
        ctx.fillRect(x - p.r / 2, y - p.r / 2, p.r, p.r);
      }
    }
    ctx.globalCompositeOperation = 'source-over';
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
