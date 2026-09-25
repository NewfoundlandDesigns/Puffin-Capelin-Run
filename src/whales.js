/* Humpback whales (Trinity Bay, Iceberg Alley). A ring of bubbles rises and capelin gather
   inside it, with a shaded column showing the danger zone below. Then the whale lunges
   straight up with its jaws open and swallows everything inside. Getting caught ends the run:
   the puffin is pulled into the mouth, the jaws close over it, and the whale sinks away. */
const WHALE = { bubbles: 2.1, lunge: 0.45, hang: 0.55, fall: 0.7, W: 150, RISE: 108 };

const whaleTop = rise => lerp(SEA + 280, SEA - WHALE.RISE, rise);

function spawnWhale() {
  const x = VW + 140;
  st.whales.push({ x, state: 'bubbles', t: WHALE.bubbles, rise: 0, open: 0, topY: whaleTop(0), ph: rand(0, 6.28), ate: 0 });
  for (let i = 0; i < 7; i++) {                    // capelin herded into the bubble net
    st.fish.push({ x: x + rand(-50, 50), y: SEA + rand(30, 110), vx: -st.speed, ph: rand(0, 6.28), amp: 8, gold: false });
  }
  Snd.bubbles();
}

// Inside the open mouth. Only the head is dangerous: dive deep enough and you pass under it.
const WHALE_MOUTH = 175;
// It only bites once its head has broken the surface, so the danger never reaches deeper
// than SEA + 10 + WHALE_MOUTH. The shaded warning zone shows exactly that depth.
const WHALE_SAFE_DEPTH = SEA + 10 + WHALE_MOUTH;
function whaleZone(w, x, y) {
  return w.topY < SEA + 10 && w.open > 0.3 && Math.abs(x - w.x) < 52 && y > w.topY + 8 && y < w.topY + WHALE_MOUTH;
}

function updateWhales(wdt, scroll) {
  const s = st, p = s.p;
  for (const w of s.whales) {
    w.x -= scroll * wdt; w.t -= wdt;
    if (w.state === 'bubbles') {
      if (Math.random() < wdt * 34) {
        s.parts.push({ x: w.x + rand(-WHALE.W / 2, WHALE.W / 2), y: SEA + rand(40, 230), vx: -scroll, vy: -rand(70, 130), g: 0,
          r: rand(1.5, 3.5), life: 0.9, max: 0.9, color: 'rgba(225,238,248,0.8)', ring: true });
      }
      if (w.t <= 0) { w.state = 'lunge'; w.t = WHALE.lunge; Snd.whaleLunge(); }
    } else if (w.state === 'lunge') {
      const k = 1 - w.t / WHALE.lunge;
      w.rise = easeOut(k); w.open = smooth(0, 0.6, k);
      if (w.t <= 0) {
        w.state = 'hang'; w.t = WHALE.hang; w.rise = 1; w.open = 1;
        burst(w.x, SEA, 30, 'rgba(225,238,248,0.95)', 260, 520, 2, 4, 0.9);
        Snd.splash(1);
      }
    } else if (w.state === 'hang') {
      const k = 1 - w.t / WHALE.hang;
      w.open = 1 - smooth(0.45, 1, k);
      if (Math.random() < wdt * 12) {              // water pouring off the jaws
        s.parts.push({ x: w.x + rand(-60, 70), y: w.topY + rand(20, 90), vx: rand(-20, 20), vy: 30, g: 500,
          r: rand(1, 2), life: 0.6, max: 0.6, color: 'rgba(225,238,248,0.8)' });
      }
      if (w.t <= 0) { w.state = 'fall'; w.t = WHALE.fall; }
    } else if (w.state === 'fall') {
      const k = 1 - w.t / WHALE.fall;
      w.rise = 1 - k * k; w.open = 0;
      if (w.t <= 0) { w.state = 'gone'; burst(w.x, SEA, 22, 'rgba(225,238,248,0.9)', 200, 500, 2, 3.5, 0.8); Snd.splash(0.9); }
    }
    w.topY = whaleTop(w.rise);

    if (w.state === 'lunge' || w.state === 'hang') {
      for (let i = s.fish.length - 1; i >= 0; i--) {
        if (whaleZone(w, s.fish[i].x, s.fish[i].y)) { s.fish.splice(i, 1); w.ate++; }
      }
      if (p.inv <= 0 && !s.landing && !s.caught && whaleZone(w, p.x, p.y)) caught('whale', w);
    }
  }
  s.whales = s.whales.filter(w => w === (s.caught && s.caught.by) || (w.state !== 'gone' && w.x > -220));
}

// The swallow: pulled into the mouth, jaws close, the whale sinks. Called from updateCaught.
function updateSwallow(c, dt) {
  const p = st.p, w = c.by;
  c.e = (c.e || 0) + dt;
  const e = c.e;
  const mx = w.x + 4, my = w.topY + 72;
  if (e < 0.25) { const k = easeOut(e / 0.25); p.x = lerp(c.fromX, mx, k); p.y = lerp(c.fromY, my, k); }
  else { p.x = mx; p.y = my; }
  p.ang = (p.ang || 0) + dt * 5;
  w.open = e < 0.2 ? 1 : 1 - smooth(0.2, 0.5, e);
  if (e > 0.48 && !c.closed) { c.closed = true; Snd.gulp(); }
  if (e > 0.75) {
    if (!c.splashed) { c.splashed = true; burst(w.x, SEA, 30, 'rgba(225,238,248,0.95)', 240, 520, 2, 4, 0.9); Snd.splash(1); }
    w.rise = Math.max(0, 1 - Math.pow((e - 0.75) / 0.7, 2));
  }
  w.topY = whaleTop(w.rise);
}

/* ---------- drawing ---------- */
// Rotate a point about a hinge
function whaleRot(x, y, hx, hy, a) {
  const c = Math.cos(a), s = Math.sin(a);
  return [hx + (x - hx) * c - (y - hy) * s, hy + (x - hx) * s + (y - hy) * c];
}
const WH = { dark: '#2f4153', mid: '#3e5468', throat: '#b3c1cd', baleen: '#1d2229', fin: '#e3eaf0' };
const UP_HINGE = [-16, 176], LOW_HINGE = [16, 176];
const jawAngles = w => [-0.5 * w.open, 0.36 * w.open];
const WHALE_LEAN = -0.1;

// Draw part of the whale twice: solid above the waterline, faded below it, so it looks
// submerged without tinting a box of sea.
function whaleLayered(w, fn) {
  ctx.save(); ctx.beginPath(); ctx.rect(w.x - 260, -200, 520, SEA + 202); ctx.clip(); fn(); ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.rect(w.x - 260, SEA + 2, 520, WORLD_H); ctx.clip(); ctx.globalAlpha = 0.38; fn(); ctx.restore();
}
function whaleFrame(w) {                           // local space: snout tip at 0,0, leaning slightly
  ctx.translate(w.x, w.topY);
  ctx.translate(0, 176); ctx.rotate(WHALE_LEAN); ctx.translate(0, -176);
}

// Behind the puffin: the warning, the body, and the inside of the mouth
function drawWhaleBack(w, t) {
  if (w.state === 'bubbles') {
    const k = 1 - w.t / WHALE.bubbles, x0 = w.x - WHALE.W / 2;
    // soft-edged danger zone near the surface, fading out with depth (deep water is safe)
    const g = ctx.createLinearGradient(x0, 0, x0 + WHALE.W, 0);
    g.addColorStop(0, 'rgba(10,22,38,0)'); g.addColorStop(0.22, 'rgba(10,22,38,1)');
    g.addColorStop(0.78, 'rgba(10,22,38,1)'); g.addColorStop(1, 'rgba(10,22,38,0)');
    ctx.save(); ctx.fillStyle = g;
    const band = (WHALE_SAFE_DEPTH - SEA) / 8;
    for (let i = 0; i < 8; i++) {
      ctx.globalAlpha = (0.2 + 0.2 * k) * (1 - i / 9);
      ctx.fillRect(x0, SEA + 2 + i * band, WHALE.W, band);
    }
    ctx.restore();
    ctx.fillStyle = `rgba(10,22,38,${0.15 + 0.25 * k})`;           // dark shape rising
    ell(w.x, WORLD_H - 30 - 150 * k, 60 + 16 * k, 30 + 10 * k);
    ctx.strokeStyle = `rgba(235,244,250,${0.55 + 0.4 * k})`; ctx.lineWidth = 1.3;
    for (let i = 0; i < 20; i++) {                                  // bubble ring at the surface
      const bx = x0 + (i / 19) * WHALE.W + Math.sin(t * 5 + i) * 3;
      const r = 2 + (i * 7 % 3) + Math.sin(t * 9 + i * 2) * 0.8;
      ctx.beginPath(); ctx.arc(bx, SEA - 1 + Math.sin(t * 4 + i) * 1.5, Math.max(0.8, r), 0, Math.PI * 2); ctx.stroke();
    }
    return;
  }
  const bottom = WORLD_H + 80 - w.topY;
  whaleLayered(w, () => {
    ctx.save(); whaleFrame(w);
    ctx.fillStyle = WH.dark;                                        // body below the jaws
    ctx.beginPath(); ctx.moveTo(-70, 170); ctx.quadraticCurveTo(-80, 280, -74, bottom);
    ctx.lineTo(104, bottom); ctx.quadraticCurveTo(112, 280, 100, 170); ctx.closePath(); ctx.fill();
    const [a1, a2] = jawAngles(w);                                  // inside of the mouth
    const ut = whaleRot(-2, 0, ...UP_HINGE, a1), lt = whaleRot(2, 2, ...LOW_HINGE, a2);
    const mg = ctx.createLinearGradient(0, 0, 0, 180);
    mg.addColorStop(0, '#2a1d25'); mg.addColorStop(1, '#6b3d4a');
    ctx.fillStyle = mg;
    ctx.beginPath(); ctx.moveTo(ut[0], ut[1]); ctx.quadraticCurveTo(0, 30, lt[0], lt[1]);
    ctx.lineTo(18, 180); ctx.lineTo(-18, 180); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#c9d6e3';
    for (let i = 0; i < Math.min(7, w.ate); i++) ell(-10 + (i % 3) * 9, 80 + i * 12, 1.6, 4.5, 0.5);
    ctx.restore();
  });
}

// In front of the puffin: flipper and jaws (so they close over a caught puffin)
function drawWhaleFront(w, t) {
  if (w.state === 'bubbles') return;
  const [a1, a2] = jawAngles(w);
  whaleLayered(w, () => {
    ctx.save(); whaleFrame(w);
    // long white pectoral flipper sticking out to the side
    ctx.save(); ctx.translate(-66, 196); ctx.rotate(-2.75 + Math.sin(t * 3 + w.ph) * 0.1);
    ctx.fillStyle = WH.fin; ell(-46, 0, 52, 9);
    ctx.fillStyle = '#c3cfda'; for (let i = 0; i < 5; i++) ell(-14 - i * 16, -7.5, 3.2, 2);
    ctx.restore();
    // upper jaw: a narrow dark rostrum, knobbly with tubercles, baleen along the inside
    ctx.save(); ctx.translate(...UP_HINGE); ctx.rotate(a1); ctx.translate(-UP_HINGE[0], -UP_HINGE[1]);
    ctx.fillStyle = WH.dark;
    ctx.beginPath(); ctx.moveTo(-2, 0); ctx.quadraticCurveTo(-5, 90, -10, 182); ctx.lineTo(-70, 182);
    ctx.quadraticCurveTo(-62, 86, -30, 24); ctx.quadraticCurveTo(-18, 2, -2, 0); ctx.closePath(); ctx.fill();
    ctx.fillStyle = WH.mid;
    for (let i = 0; i < 6; i++) ell(-18 - i * 6, 30 + i * 23, 3.2, 3.2);
    ctx.strokeStyle = WH.baleen; ctx.lineWidth = 1.4;
    for (let i = 0; i < 13; i++) { const y = 10 + i * 13; ctx.beginPath(); ctx.moveTo(-3, y); ctx.lineTo(5, y + 5); ctx.stroke(); }
    ctx.fillStyle = '#0d1219'; ell(-50, 160, 3.6, 3);
    ctx.fillStyle = '#ffffff'; ell(-51, 159, 1, 1);
    ctx.restore();
    // lower jaw: a huge pleated throat pouch, bulging with water
    ctx.save(); ctx.translate(...LOW_HINGE); ctx.rotate(a2); ctx.translate(-LOW_HINGE[0], -LOW_HINGE[1]);
    ctx.fillStyle = WH.mid;
    ctx.beginPath(); ctx.moveTo(2, 2); ctx.quadraticCurveTo(6, 90, 10, 182); ctx.lineTo(104, 182);
    ctx.quadraticCurveTo(118, 70, 42, 26); ctx.quadraticCurveTo(22, 4, 2, 2); ctx.closePath(); ctx.fill();
    ctx.fillStyle = WH.throat;
    ctx.beginPath(); ctx.moveTo(16, 18); ctx.quadraticCurveTo(20, 100, 22, 182); ctx.lineTo(94, 182);
    ctx.quadraticCurveTo(104, 78, 40, 34); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(47,65,83,0.45)'; ctx.lineWidth = 1.5;
    for (let i = 0; i < 7; i++) {
      ctx.beginPath(); ctx.moveTo(24 + i * 9, 30 + i * 6); ctx.quadraticCurveTo(34 + i * 10, 110, 30 + i * 10, 182); ctx.stroke();
    }
    ctx.restore();
    ctx.restore();
  });
}
