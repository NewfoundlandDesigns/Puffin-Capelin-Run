/* Level finale. Reaching 100% brings the home colony into view. The scrolling stops,
   the camera zooms in fast, and the puffin comes in nose-first with its feet up:
   a cartwheel, a sprawl on its back, then it pops up to confetti. About two seconds. */
const FIN = { approach: 0.4, tumble: 0.6, sprawl: 0.42, pop: 0.35, hold: 0.32 };
const FIN_NEXT = { approach: 'tumble', tumble: 'sprawl', sprawl: 'pop', pop: 'hold', hold: null };
const FIN_ZOOM = 2.3;

function homeBonus() { return 500 + Math.round(st.hunger * 50) * 10; }

function startFinale() {
  const s = st, p = s.p, c = s.cliffs.find(q => q.home);
  s.finale = {
    c, phase: 'approach', t: 0, done: {}, nextFlutter: 0,
    fromX: p.x, fromY: p.y, fromAng: p.ang || 0, fromZ: 1,
    pose: { ang: 0, sx: 1, sy: 1, feet: 0, feetUp: 0, lift: 0, fold: 0, dizzy: 0 }
  };
  s.landing = null;
  p.inv = 99;
  for (const h of s.hunters) if (h.state !== 'climb') h.state = 'climb';
  for (const j of s.jaegers) j.state = 'leave';
  Snd.setUnder(false);
}

function updateFinale(dt) {
  const s = st, F = s.finale, p = s.p, c = F.c, pose = F.pose;
  s.anim += dt; F.t += dt;
  const k = clamp(F.t / FIN[F.phase], 0, 1);
  const landX = landingSpotX(c) - 6, restX = landX + 30;
  const once = key => (F.done[key] ? false : (F.done[key] = true));
  pose.sx = 1; pose.sy = 1; pose.dizzy = 0; pose.feet = 0; pose.feetUp = 0; pose.stand = 0;

  // everything else drifts off while the world stands still
  for (const f of s.fish) f.x += f.vx * dt;
  for (const g of s.gulls) g.x += g.vx * dt;
  for (const se of s.seals) se.x += se.vx * dt;
  updateHunters(dt);
  updateWhales(dt, 0);
  updateJaegers(dt);

  // camera: quick zoom toward the burrow
  const focusX = restX + 10, focusY = groundY(c, restX) - 26;
  const zk = F.phase === 'approach' ? easeOut(k) : 1;
  s.cam = { z: lerp(1, FIN_ZOOM, zk), fx: lerp(p.x, focusX, zk), fy: lerp(SEA - 60, focusY, zk) };

  if (F.phase === 'approach') {          // coming in too fast, nose down, feet still tucked
    const e = easeInOut(k);
    const prevY = p.y;
    p.x = lerp(F.fromX, landX, e);
    p.y = lerp(F.fromY, groundY(c, landX) - 12, e) - 30 * Math.sin(Math.PI * k);
    if ((prevY > SEA) !== (p.y > SEA)) { burst(p.x, SEA, 12, 'rgba(220,235,250,0.9)', 120, 500, 1.5, 3, 0.6); Snd.splash(0.8); }
    pose.ang = lerp(F.fromAng, 0.35, e);
    pose.lift = 0.3; pose.fold = 0;
    p.flap += dt * 26;
    F.nextFlutter -= dt;
    if (F.nextFlutter <= 0) { Snd.flutter(); F.nextFlutter = 0.08; }
  }

  else if (F.phase === 'tumble') {       // cartwheel along the grass, ending belly-up
    if (once('hit')) {
      Snd.thud();
      burst(p.x + 8, groundY(c, p.x), 16, '#7fae63', 150, 420, 1.5, 3, 0.6);
      burst(p.x, p.y, 6, '#10233d', 90, 120, 1.5, 2.5, 0.9);
    }
    if (k > 0.5 && once('bounce')) Snd.thud();
    const e = easeOut(k);
    p.x = lerp(landX, restX, e);
    const hop = Math.abs(Math.sin(k * Math.PI * 2)) * (1 - k) * 24;
    p.y = groundY(c, p.x) - 12 - hop;
    pose.ang = lerp(0.35, Math.PI * 3, e);
    pose.lift = 0.3 * (1 - k); pose.fold = k;
    pose.sx = 1 + 0.06 * Math.sin(k * Math.PI * 4); pose.sy = 2 - pose.sx;
    p.flap += dt * 10;
  }

  else if (F.phase === 'sprawl') {       // on its back, feet waggling, seeing stars
    p.x = restX; p.y = groundY(c, p.x) - 11;
    pose.ang = Math.PI * 3 + Math.sin(s.anim * 16) * 0.05;
    pose.fold = 1; pose.feetUp = 1; pose.dizzy = smooth(0, 0.3, k);
    if (once('spill')) {
      if (stackN() > 0) {
        const tx = c.x + c.w * BURROW, ty = c.top + 16;
        for (const gold of s.beak) {
          s.parts.push({ x: p.x + 20, y: p.y, vx: (tx - p.x - 20) / 0.3 + rand(-20, 20), vy: (ty - p.y) / 0.3 - 63, g: 420,
            r: 3, life: 0.3, max: 0.4, color: gold ? '#feb445' : '#c9d6e3', fish: true, rot: rand(0, 6) });
        }
        deliver(c, true);
        c.note = null;                   // no callout: it would cover the zoomed-in puffin
      }
      c.chick = 2.4; c.cheer = 2;
      Snd.chirp();
    }
  }

  else if (F.phase === 'pop') {          // flips back onto its feet
    const e = easeInOut(k);
    p.x = restX;
    p.y = lerp(groundY(c, restX) - 11, groundY(c, restX) - STAND, e) - 16 * Math.sin(Math.PI * k);
    pose.ang = lerp(Math.PI * 3, Math.PI * 2 + UPRIGHT, e);
    pose.fold = 1 - k; pose.lift = k; pose.feet = smooth(0.4, 1, k); pose.feetUp = 1 - smooth(0, 0.4, k);
    pose.dizzy = 1 - k;
    pose.stand = k > 0.55 ? 1 : 0;
    p.flap += dt * 20;
    if (once('cheer')) {
      const bonus = homeBonus();
      s.score += bonus; s.bonus = bonus;
      Snd.fanfare();
      const colors = ['#f94a18', '#feb445', '#ffffff', '#10233d', '#dc362c'];
      for (let i = 0; i < 46; i++) {
        const a = rand(-Math.PI * 0.95, -Math.PI * 0.05), v = rand(120, 330);
        s.parts.push({ x: p.x, y: p.y - 10, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: 380, r: rand(1.4, 2.6),
          life: rand(0.9, 1.4), max: 1.4, color: colors[i % colors.length], confetti: true, rot: rand(0, 6) });
      }
      // text is drawn inside the zoom, so it's sized for 2.3x
      pop('Home!', p.x + 6, p.y - 44, '#ffffff', 13);
      pop('+' + bonus + ' home bonus', p.x + 6, p.y - 31, '#feb445', 8);
    }
  }

  else if (F.phase === 'hold') {         // a proud little wing flap
    p.x = restX; p.y = groundY(c, restX) - STAND;
    pose.ang = Math.PI * 2 + UPRIGHT; pose.lift = 1; pose.feet = 1; pose.stand = 1;
    p.flap += dt * 16;
  }

  updateFx(dt);
  if (F.t >= FIN[F.phase]) {
    F.phase = FIN_NEXT[F.phase]; F.t = 0;
    if (!F.phase) endGame('complete');
  }
}
