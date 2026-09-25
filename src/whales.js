/* Humpback whales (Trinity Bay, Iceberg Alley). A ring of bubbles rises and capelin gather
   inside it, with a shaded column showing the danger zone below. Then the whale lunges
   straight up with its jaws open and swallows everything inside. Getting caught ends the run:
   the puffin is pulled into the mouth, the jaws close over it, and the whale sinks away. */
const WHALE = { bubbles: 2.1, lunge: 0.45, hang: 0.55, fall: 0.7, fluke: 1.7, W: 150, RISE: 108 };
const FLUKE_DX = 70;                             // the tail comes up a little behind where the head went down
const flukeHeight = k => Math.sin(Math.PI * clamp(k * 1.15, 0, 1));

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
      if (w.t <= 0) { w.state = 'fluke'; w.t = WHALE.fluke; burst(w.x, SEA, 22, 'rgba(225,238,248,0.9)', 200, 500, 2, 3.5, 0.8); Snd.splash(0.9); }
    } else if (w.state === 'fluke') {              // harmless: the tail comes up as it dives away
      const k = 1 - w.t / WHALE.fluke;
      w.rise = 0;
      if (k > 0.25 && k < 0.8 && Math.random() < wdt * 26) {        // water pouring off the flukes
        const h = flukeHeight(k);
        s.parts.push({ x: w.x + FLUKE_DX + rand(-58, 58), y: SEA - 60 * h, vx: rand(-15, 15), vy: 20, g: 500,
          r: rand(1, 2), life: 0.6, max: 0.6, color: 'rgba(225,238,248,0.85)' });
      }
      if (w.t <= 0) { w.state = 'gone'; burst(w.x + FLUKE_DX, SEA, 16, 'rgba(225,238,248,0.9)', 160, 500, 2, 3.5, 0.7); Snd.splash(0.6); }
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
const WH = { dark: '#26323f', mid: '#374656', throat: '#c9d3dc', pleat: 'rgba(38,50,63,0.55)', baleen: '#1d2229', fin: '#e6ecf1', finShade: '#c3cfda', barnacle: '#dfe4e8' };
// How full the throat pouch is: it balloons as the whale gulps, and stays full as it closes its mouth
const whalePouch = w => (w.state === 'lunge' ? 0.5 * w.open : 1);
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
  if (w.state === 'fluke') { drawFluke(w, t); return; }
  const bottom = WORLD_H + 80 - w.topY, b = whalePouch(w);
  whaleLayered(w, () => {
    ctx.save(); whaleFrame(w);
    // the far flipper, behind the body
    ctx.save(); ctx.translate(96, 104); ctx.rotate(-0.38 + Math.sin(t * 3 + w.ph + 1) * 0.08);
    ctx.fillStyle = WH.finShade; ell(44, 0, 50, 8);
    ctx.restore();
    // a stocky body tapering away below the head
    ctx.fillStyle = WH.dark;
    ctx.beginPath(); ctx.moveTo(-72, 170); ctx.bezierCurveTo(-98, 260, -72, 380, -40, bottom);
    ctx.lineTo(56, bottom); ctx.bezierCurveTo(112 + 26 * b, 380, 124 + 40 * b, 250, 104, 170); ctx.closePath(); ctx.fill();
    // the pleated belly, carrying on from the throat
    ctx.fillStyle = WH.throat;
    ctx.beginPath(); ctx.moveTo(20, 176); ctx.bezierCurveTo(24, 260, 30, 360, 32, bottom);
    ctx.lineTo(50, bottom); ctx.bezierCurveTo(100 + 24 * b, 370, 108 + 36 * b, 250, 94, 176); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = WH.pleat; ctx.lineWidth = 2;
    for (let i = 0; i < 8; i++) {
      ctx.beginPath(); ctx.moveTo(26 + i * 9, 178); ctx.quadraticCurveTo(34 + i * (8 + 3 * b), 290, 34 + i * 2.2, bottom); ctx.stroke();
    }
    ctx.fillStyle = 'rgba(223,228,232,0.55)';                       // pale mottling on the flank
    for (const [mx, my, r] of [[-40, 230, 9], [-52, 262, 6], [-30, 290, 7], [-58, 214, 4]]) ell(mx, my, r, r * 0.7);
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
  if (w.state === 'bubbles' || w.state === 'fluke') return;
  const [a1, a2] = jawAngles(w);
  whaleLayered(w, () => {
    ctx.save(); whaleFrame(w);
    // a very long white pectoral flipper, out to the side at the waterline, bumpy along its leading edge
    ctx.save(); ctx.translate(-60, 100); ctx.rotate(0.38 + Math.sin(t * 3 + w.ph) * 0.1);
    ctx.fillStyle = WH.fin; ell(-62, 0, 68, 10.5);
    for (let i = 0; i < 7; i++) ell(-16 - i * 16, -8.5, 4.2, 3.2);
    ctx.fillStyle = WH.finShade; ell(-62, 3.5, 60, 4.5);
    ctx.fillStyle = '#8f9aa5'; for (const [bx, by] of [[-112, 2], [-118, -2], [-106, 5], [-122, 3]]) ell(bx, by, 2, 1.6);
    ctx.restore();
    // upper jaw: a narrow dark rostrum, knobbly with tubercles, baleen along the inside
    ctx.save(); ctx.translate(...UP_HINGE); ctx.rotate(a1); ctx.translate(-UP_HINGE[0], -UP_HINGE[1]);
    ctx.fillStyle = WH.dark;
    ctx.beginPath(); ctx.moveTo(-2, 0); ctx.quadraticCurveTo(-5, 90, -10, 182); ctx.lineTo(-70, 182);
    ctx.quadraticCurveTo(-62, 86, -30, 24); ctx.quadraticCurveTo(-18, 2, -2, 0); ctx.closePath(); ctx.fill();
    // knobbly tubercles along the top of the head, the humpback's trademark
    for (let i = 1; i < 10; i++) {
      const q = i / 10, u1 = 1 - q;
      const kx = u1 * u1 * -70 + 2 * u1 * q * -62 + q * q * -30, ky = u1 * u1 * 182 + 2 * u1 * q * 86 + q * q * 24;
      ctx.fillStyle = WH.dark; ell(kx - 2, ky, 5, 5);
      ctx.fillStyle = WH.mid; ell(kx - 1, ky - 1, 2.2, 2.2);
    }
    for (let i = 0; i < 6; i++) ell(-18 - i * 6, 30 + i * 23, 3.2, 3.2);
    ctx.strokeStyle = WH.baleen; ctx.lineWidth = 1.4;
    for (let i = 0; i < 13; i++) { const y = 10 + i * 13; ctx.beginPath(); ctx.moveTo(-3, y); ctx.lineTo(5, y + 5); ctx.stroke(); }
    ctx.fillStyle = '#0d1219'; ell(-50, 160, 3.6, 3);
    ctx.fillStyle = '#ffffff'; ell(-51, 159, 1, 1);
    ctx.restore();
    // lower jaw: a huge pleated throat pouch, bulging with water
    ctx.save(); ctx.translate(...LOW_HINGE); ctx.rotate(a2); ctx.translate(-LOW_HINGE[0], -LOW_HINGE[1]);
    const b = whalePouch(w);
    ctx.fillStyle = WH.mid;
    ctx.beginPath(); ctx.moveTo(2, 2); ctx.quadraticCurveTo(6, 90, 10, 182); ctx.lineTo(104 + 26 * b, 182);
    ctx.quadraticCurveTo(122 + 56 * b, 74, 42, 26); ctx.quadraticCurveTo(22, 4, 2, 2); ctx.closePath(); ctx.fill();
    ctx.fillStyle = WH.throat;
    ctx.beginPath(); ctx.moveTo(16, 18); ctx.quadraticCurveTo(20, 100, 22, 182); ctx.lineTo(94 + 24 * b, 182);
    ctx.quadraticCurveTo(108 + 50 * b, 80, 40, 34); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = WH.pleat; ctx.lineWidth = 2;                  // deep grooves, fanning out as the pouch fills
    for (let i = 0; i < 9; i++) {
      ctx.beginPath(); ctx.moveTo(22 + i * 8, 28 + i * 5); ctx.quadraticCurveTo(32 + i * (9 + 5 * b), 110, 26 + i * (8 + 2.6 * b), 182); ctx.stroke();
    }
    ctx.fillStyle = WH.barnacle;                                    // barnacles on the chin
    for (const [bx, by, r] of [[10, 12, 2.6], [15, 16, 2], [8, 20, 1.8], [19, 11, 1.6], [13, 25, 1.5]]) ell(bx, by, r, r);
    ctx.fillStyle = '#9aa5b0'; ell(11, 13, 1, 1); ell(15, 17, 0.8, 0.8);
    ctx.restore();
    ctx.restore();
  });
}

// The tail flukes, rising as it dives away: broad and black, white-mottled underneath, a notch in
// the middle and a scalloped trailing edge
function drawFluke(w, t) {
  const k = 1 - w.t / WHALE.fluke, h = flukeHeight(k);
  const cx = w.x + FLUKE_DX, cy = SEA + 50 - 110 * h, tilt = 0.12 * Math.sin(k * 3);
  whaleLayered(w, () => {
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(tilt);
    ctx.fillStyle = WH.dark;                                        // tail stock
    ctx.beginPath(); ctx.moveTo(-18, 160); ctx.quadraticCurveTo(-12, 70, -9, 16); ctx.lineTo(9, 16); ctx.quadraticCurveTo(12, 70, 18, 160); ctx.closePath(); ctx.fill();
    for (const side of [-1, 1]) {
      ctx.fillStyle = WH.dark;
      ctx.beginPath(); ctx.moveTo(0, 24);
      ctx.bezierCurveTo(side * 38, 28, side * 76, 12, side * 94, -22);        // leading edge out to the tip
      ctx.bezierCurveTo(side * 74, -26, side * 42, -12, side * 5, -9);        // scalloped trailing edge back to the notch
      ctx.lineTo(0, -3); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(234,238,242,0.92)';                              // white underside, mottled
      ctx.beginPath(); ctx.moveTo(side * 10, 14); ctx.bezierCurveTo(side * 38, 17, side * 64, 6, side * 78, -14);
      ctx.bezierCurveTo(side * 60, -16, side * 36, -6, side * 10, -3); ctx.closePath(); ctx.fill();
      ctx.fillStyle = WH.dark;
      for (const [mx, my, r] of [[26, 6, 3.5], [44, 2, 2.6], [58, -4, 3], [34, -1, 1.8], [68, -9, 1.8]]) ell(side * mx, my, r, r * 0.8);
      for (let i = 1; i < 8; i++) {                                           // scallops along the trailing edge
        const q = i / 8, x = side * lerp(6, 90, q), y = lerp(-9, -24, q * q) - 1;
        ell(x, y, 3.4, 2.6);
      }
    }
    ctx.restore();
  });
}
