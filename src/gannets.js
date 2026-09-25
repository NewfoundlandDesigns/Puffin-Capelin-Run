/* Gannets (Funk Island). Big white plunge-divers. One flies in and stalks the puffin from just
   ahead and above, following its depth, with its shadow on the water. Then it locks on: a sharp
   cry, it tips nose-down, and the shadow turns red. Half a second later it folds its wings and
   drops like a spear, straight down and deep into the sea, at the depth you were at when it
   locked on. A hit knocks your catch loose and shoves you under, but it isn't fatal: change depth
   once it locks on, or dive below it. A plunge also eats or scatters any capelin in the way. */
const GANNET = { STALK: 1.3, LOCK: 0.5, TOP: 100, AIR: 0.38, SEA_T: 0.3, DEPTH: 150, RISE: 1.1 };

// Height of a diving gannet's bill, d seconds into a dive that started at height top:
// accelerating through the air, then slowing hard underwater until it stops GANNET.DEPTH down.
function gannetY(d, top = GANNET.TOP) {
  const G = GANNET;
  if (d <= G.AIR) return top + (SEA - top) * Math.pow(d / G.AIR, 2);
  const e = Math.min(1, (d - G.AIR) / G.SEA_T);
  return SEA + G.DEPTH * (1 - Math.pow(1 - e, 2));
}
// ...and the inverse: how long into the dive it reaches height y
function gannetTimeTo(y, top = GANNET.TOP) {
  const G = GANNET;
  if (y <= SEA) return G.AIR * Math.sqrt(Math.max(0, y - top) / (SEA - top));
  return G.AIR + G.SEA_T * (1 - Math.sqrt(Math.max(0, 1 - (y - SEA) / G.DEPTH)));
}
// It dives from above the puffin, so flying high doesn't keep you out of reach
const gannetTop = y => clamp(y - 110, 36, GANNET.TOP);
const gannetAimY = y => clamp(y, gannetTop(y) + 24, SEA + GANNET.DEPTH - 12);
// How far ahead of the puffin to be when locking on, so the dive meets it at depth y
const gannetLead = y => st.speed * (GANNET.LOCK + gannetTimeTo(gannetAimY(y), gannetTop(y)));

function spawnGannet() {
  const s = st;
  s.gannets.push({ x: VW + 60, y: GANNET.TOP - 30, top: GANNET.TOP, state: 'stalk', t: GANNET.STALK, d: 0,
    ph: rand(0, 6.28), splashed: false, ate: 0 });
  Snd.gannetCall();
}

function updateGannets(wdt, scroll) {
  const s = st, p = s.p, G = GANNET;
  for (const g of s.gannets) {
    if (g.state === 'stalk') {                         // shadows the puffin from just ahead, matching its depth
      g.t -= wdt;
      const tx = p.x + gannetLead(p.y), ty = gannetTop(p.y) + Math.sin(s.anim * 3 + g.ph) * 4;
      g.x += (tx - g.x) * Math.min(1, wdt * 3.2);
      g.y += (ty - g.y) * Math.min(1, wdt * 3);
      if (g.t <= 0 && !s.landing) {                    // lock on: commit to the puffin's depth now
        g.state = 'lock'; g.t = G.LOCK;
        g.aimY = gannetAimY(p.y + p.vy * 0.12);
        g.top = gannetTop(g.aimY);
        g.x = p.x + s.speed * (G.LOCK + gannetTimeTo(g.aimY, g.top));
        Snd.gannetLock();
      }
    } else if (g.state === 'lock') {                   // a beat to react: tips nose-down, shadow turns red
      g.x -= scroll * wdt; g.t -= wdt;
      g.y += (g.top - g.y) * Math.min(1, wdt * 10);
      if (g.t <= 0) { g.state = 'dive'; g.d = 0; Snd.gannetDive(); }
    } else if (g.state === 'dive') {
      g.x -= scroll * wdt;
      g.d += wdt;
      g.y = gannetY(g.d, g.top);
      if (!g.splashed && g.y >= SEA) gannetSplash(g);
      if (p.inv <= 0 && !s.landing && !s.caught && !s.finale &&
          Math.abs(p.x - g.x) < 18 && p.y > g.y - 30 && p.y < g.y + 12) gannetHit(g);   // the bill and head, not the tail
      if (g.d >= G.AIR + G.SEA_T) { g.state = 'rise'; g.t = G.RISE; }
      if (Math.random() < wdt * 30 && g.y > SEA + 8) {        // bubble trail
        s.parts.push({ x: g.x + rand(-4, 4), y: g.y - rand(10, 30), vx: -scroll * 0.3, vy: -rand(40, 80), g: -20,
          r: rand(1, 2.5), life: 0.8, max: 0.8, color: 'rgba(225,238,248,0.7)', ring: true });
      }
    } else if (g.state === 'rise') {                  // bobs back up and flies off, harmless
      g.x -= scroll * wdt; g.t -= wdt;
      const k = 1 - g.t / G.RISE;
      g.y = k < 0.55 ? lerp(SEA + G.DEPTH, SEA - 4, easeOut(k / 0.55)) : SEA - 4 - 260 * Math.pow((k - 0.55) / 0.45, 2);
      g.x += k > 0.55 ? 120 * wdt : 0;
      if (g.t <= 0) g.state = 'gone';
    }
  }
  s.gannets = s.gannets.filter(g => g.state !== 'gone' && g.x > -80);
}

// Hitting the water: spray, and the capelin nearby either get eaten or scatter
function gannetSplash(g) {
  const s = st;
  g.splashed = true;
  burst(g.x, SEA, 20, 'rgba(225,238,248,0.95)', 200, 520, 1.5, 3.5, 0.7);
  Snd.splash(0.9);
  for (let i = s.fish.length - 1; i >= 0; i--) {
    const f = s.fish[i], dx = f.x - g.x;
    if (Math.abs(dx) > 90 || f.y > SEA + GANNET.DEPTH + 40) continue;
    if (Math.abs(dx) < 18 && g.ate < 2 && !f.gold) { s.fish.splice(i, 1); g.ate++; continue; }
    f.dy = (f.y > SEA + 80 ? 1 : -1) * rand(70, 130);     // dart away, then settle
    f.vx += rand(-40, 40);
  }
}

function gannetHit(g) {
  const p = st.p;
  p.inv = 1.2; p.vy = Math.max(p.vy, 320);
  burst(p.x, p.y, 12, 'rgba(250,250,250,0.9)', 150, 200, 1.5, 3, 0.6);
  Snd.gannetHit();
  if (stackN() > 0) loseStack(t('pop.gannet'));
  else pop(t('pop.whoa'), p.x + 20, p.y - 40);
}

// White body, black wingtips, a buff-yellow head and a long pale bill
function drawGannet(g, t) {
  const night = st.fixedU !== undefined ? 0 : clamp((st.progress - 0.62) / 0.22, 0, 1);
  const stalking = g.state === 'stalk', locked = g.state === 'lock';
  if (stalking || locked) {
    // its shadow on the water: amber while it stalks, red once it has locked on
    const k = locked ? 1 - g.t / GANNET.LOCK : 0;
    const col = locked ? '220,54,44' : '254,180,69';
    ctx.strokeStyle = `rgba(255,255,255,${locked ? 0.35 : 0.14})`; ctx.lineWidth = 1; ctx.setLineDash([3, 6]);
    ctx.beginPath(); ctx.moveTo(g.x, g.y + 16); ctx.lineTo(g.x, SEA - 2); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = `rgba(5,13,24,${locked ? 0.45 + 0.2 * k : 0.22})`; ell(g.x, SEA + 5, locked ? 16 + 6 * k : 12, locked ? 5 : 4);
    ctx.strokeStyle = `rgba(${col},${(locked ? 0.95 : 0.55) * (0.6 + 0.4 * Math.sin(t * (locked ? 22 : 8)))})`;
    ctx.lineWidth = locked ? 2.5 : 1.5;
    ctx.beginPath(); ctx.ellipse(g.x, SEA + 5, locked ? 24 - 6 * k : 18, locked ? 8 - 2 * k : 6, 0, 0, Math.PI * 2); ctx.stroke();
    if (g.x > VW - 10) {                               // warning at the right edge as it comes in
      const a = 0.6 + 0.4 * Math.sin(t * 14);
      ctx.fillStyle = `rgba(220,54,44,${a})`;
      ctx.beginPath(); ctx.moveTo(VW - 6, g.y + 20); ctx.lineTo(VW - 18, g.y + 11); ctx.lineTo(VW - 18, g.y + 29); ctx.closePath(); ctx.fill();
    }
  }
  const diving = g.state === 'dive';
  const flying = stalking || locked || (g.state === 'rise' && g.y < SEA - 20);
  // locked on, it tips nose-down ready to drop
  const ang = diving ? Math.PI / 2 : locked ? lerp(0.15, 1.1, easeInOut(1 - g.t / GANNET.LOCK))
    : flying ? (g.state === 'rise' ? -0.5 : Math.sin(t * 1.5 + g.ph) * 0.08) : 0;
  const f = Math.sin(t * (g.state === 'rise' ? 14 : 3) + g.ph);
  ctx.save(); ctx.translate(g.x, g.y); ctx.rotate(ang); ctx.scale(1.9, 1.9);
  if (diving) ctx.translate(-14, 0);                   // the bill leads the dive
  const white = css(mix(hex('#f7f8f6'), hex('#8a97a8'), night * 0.5));
  if (flying) {                                        // seen side-on: long narrow wings raised in a glide, black tips
    ctx.lineCap = 'round';
    for (const [dx, lift, alpha] of [[3, 0.75, 0.55], [0, 1, 1]]) {   // far wing, then near wing
      const ex = -10 + dx, ey = -(13 + 4 * f) * lift, tx = -17 + dx, ty = -(19 + 6 * f) * lift;
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = white; ctx.lineWidth = 3.2;
      ctx.beginPath(); ctx.moveTo(2 + dx, -1); ctx.quadraticCurveTo(-2 + dx, ey * 0.7, ex, ey); ctx.stroke();
      ctx.strokeStyle = '#1a1d22'; ctx.lineWidth = 2.8;
      ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(tx, ty); ctx.stroke();
    }
    ctx.globalAlpha = 1;
  } else {                                             // folded back into a spear
    ctx.fillStyle = '#1a1d22';
    ctx.beginPath(); ctx.moveTo(-4, -3); ctx.lineTo(-17, -1.5); ctx.lineTo(-4, 0); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-4, 3); ctx.lineTo(-17, 1.5); ctx.lineTo(-4, 0); ctx.closePath(); ctx.fill();
  }
  ctx.fillStyle = white; ell(0, 0, 11, 3.6);
  ctx.beginPath(); ctx.moveTo(-9, -2); ctx.lineTo(-15, 0); ctx.lineTo(-9, 2); ctx.closePath(); ctx.fill();   // pointed tail
  ctx.fillStyle = css(mix(hex('#f1d9a0'), hex('#8a97a8'), night * 0.5)); ell(9, 0, 4, 3.2);
  ctx.fillStyle = '#c9d3dc';
  ctx.beginPath(); ctx.moveTo(12, -1.2); ctx.lineTo(19, 0); ctx.lineTo(12, 1.2); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#10233d'; ell(10, -1.2, 0.7, 0.7);
  ctx.restore();
}
