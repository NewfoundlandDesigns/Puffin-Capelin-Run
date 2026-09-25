/* DOM, state, game loop and input */
const $ = id => document.getElementById(id);
const stage = $('stage'), cvs = $('game');
let ctx = cvs.getContext('2d');   // swapped briefly to draw the level preview
const hud = $('hud'), hScore = $('hScore'), hBeak = $('hBeak');
const say = $('say');
const progFill = $('progFill'), progMark = $('progMark'), hunger = $('hunger'), hFill = $('hFill');
const startPanel = $('startPanel'), endPanel = $('endPanel');
const againBtn = $('againBtn'), nextBtn = $('nextBtn'), chooseBtn = $('chooseBtn'), muteBtn = $('muteBtn'), playBtn = $('playBtn');
const preview = $('preview'), pvCanvas = $('pvCanvas'), pvCtx = pvCanvas.getContext('2d');
const pvNum = $('pvNum'), pvName = $('pvName'), pvBest = $('pvBest'), pvBlurb = $('pvBlurb');
const howBtn = $('howBtn'), tut = $('tut'), tutCard = $('tutCard'), tutStep = $('tutStep'), tutTitle = $('tutTitle');
const tutText = $('tutText'), tutHint = $('tutHint'), tutTimer = $('tutTimer'), tutSkip = $('tutSkip');
const lvDots = $('lvDots'), prevLv = $('prevLv'), nextLv = $('nextLv'), pvLock = $('pvLock');
const endLevel = $('endLevel'), endTitle = $('endTitle'), endScore = $('endScore'), endStats = $('endStats'), endBest = $('endBest');

/* ================= STATE ================= */
let W = 0, H = 0, S = 1, VW = 800, dpr = 1;
let running = false, holding = false, last = 0;

function newState(idleU = 0, levelIdx = 0, levelOverride = null) {
  const level = levelOverride || LEVELS[levelIdx];
  return {
    levelIdx, level,
    t: 0, anim: 0, speed: 160, dist: 0, progress: 0, idleU,
    hunger: 0.7, lowBeep: 0, chat: { sayHide: 0, nextNag: 0.4, peckish: false, last: '', air: null, airT: 0, airLast: '', phew: 0 }, homeSpawned: false, finale: null, cam: null, bonus: 0,
    p: { x: 200, y: SEA - 6, vy: 0, flap: 0, inv: 0, breath: 1, gasp: false, wasUnder: false },
    beak: [], score: 0, deliveries: 0, biggest: 0, goldCaught: 0, bestDrop: 0, fullWarned: false,
    fish: [], gulls: [], seals: [], hunters: [], whales: [], jaegers: [], bergs: [], cliffs: [], parts: [], pops: [],
    tFish: 0.5, tGull: 3, tCliff: 5.5, tGold: rand(9, 14),
    tSeal: level.seals ? level.seals.first : Infinity, tHunt: level.hunters ? level.hunters.first : Infinity,
    tWhale: level.whales ? level.whales.first : Infinity, tJaeger: level.jaegers ? level.jaegers.first : Infinity,
    tBerg: level.bergs ? level.bergs.first : Infinity,
    landing: null, caught: null,
    phaseSunset: false, phaseNight: false
  };
}
let st = newState(0);
const stackN = () => st.beak.length;
const goldN = () => st.beak.filter(Boolean).length;

function resize() {
  const r = stage.getBoundingClientRect();
  W = r.width; H = r.height;
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  cvs.width = Math.round(W * dpr); cvs.height = Math.round(H * dpr);
  S = H / WORLD_H; VW = W / S;
}

/* ================= SPAWNING ================= */
function spawnSchool() {
  const y0 = rand(SEA + 50, 555), n = randInt(3, 6), vx = -(st.speed - 35);
  const goldIdx = Math.random() < 0.12 ? randInt(0, n - 1) : -1;
  for (let i = 0; i < n; i++) {
    st.fish.push({ x: VW + 30 + i * 22 + rand(-6, 6), y: y0 + rand(-20, 20), vx, ph: rand(0, 6.28), amp: 12, gold: i === goldIdx });
  }
}
function spawnGolden() {
  st.fish.push({ x: VW + 30, y: rand(SEA + 70, 540), vx: -(st.speed - 5), ph: rand(0, 6.28), amp: 70, gold: true });
}
function spawnGull() {
  st.gulls.push({ x: VW + 50, y: rand(45, SEA - 40), vx: -(st.speed + rand(80, 150)), ph: rand(0, 6.28) });
  if (Math.random() < 0.35) Snd.gullCry(0.035);
}
function spawnCliff() {
  if (st.bergs.some(b => b.x + b.w > VW - 220)) return false;   // keep sea stacks clear of icebergs
  st.cliffs.push({ x: VW + 60, w: 160, top: rand(100, 150), used: false });
  return true;
}
function spawnSeal() {
  st.seals.push({ x: VW + 70, y: rand(SEA + 70, 540), vy: 0, vx: -(st.speed + rand(45, 80)), ph: rand(0, 6.28), barked: false });
}

/* ================= EFFECTS ================= */
function burst(x, y, n, color, spd, grav, rMin, rMax, life) {
  for (let i = 0; i < n; i++) {
    const a = rand(0, Math.PI * 2), v = rand(spd * 0.3, spd);
    st.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: grav, r: rand(rMin, rMax), life, max: life, color });
  }
}
function pop(text, x, y, color, size) {
  st.pops.push({ text, x, y, color: color || '#ffffff', size: size || 18, life: 1.5, max: 1.5 });
}
function loseStack(msg) {
  const p = st.p;
  for (const g of st.beak) {
    st.parts.push({ x: p.x + 26, y: p.y, vx: rand(-120, 60), vy: rand(-160, -40), g: 500, r: 3, life: 1, max: 1, color: g ? '#feb445' : '#c9d6e3', fish: true, rot: rand(0, 6) });
  }
  st.beak = [];
  pop(msg, p.x + 20, p.y - 40, '#ffffff', 17);
}
function deliver(c, quiet) {
  const n = stackN(), gold = goldN(), mult = 1 + gold;
  const base = 10 * n * (n + 1) / 2, pts = base * mult;
  const bestYet = st.deliveries > 0 && n > st.bestDrop;
  // Annotation shown above the burrow; it travels with the sea stack.
  c.note = { beak: st.beak.slice(), n, gold, mult, pts, bestYet, life: 2.6, max: 2.6 };
  st.bestDrop = Math.max(st.bestDrop, n);
  st.score += pts; st.deliveries++; st.beak = []; c.used = true;
  const hungerBefore = st.hunger;
  st.hunger = Math.min(1, st.hunger + (n + gold) * FEED_PER_FISH);
  chatterFed(hungerBefore);
  hunger.classList.remove('fed'); void hunger.offsetWidth; hunger.classList.add('fed');
  const bx = c.x + c.w * BURROW, by = c.top + 10;
  if (!quiet) burst(bx, by, 26 + gold * 10, '#feb445', 220, 260, 2, 4, 0.9);
  Snd.deliver(n, mult);
}

/* ================= CAUGHT ================= */
// Being caught ends the run: a short beat (sinking for a seal, carried off by a gull), then the end panel.
const CAUGHT_BY = { seal: 'Caught by a seal', gull: 'Caught by a gull', whale: 'Swallowed by a whale', hungry: 'Puffling too hungry' };
function caught(reason, by) {
  const p = st.p;
  st.caught = { reason, by: reason === 'gull' || reason === 'whale' ? by : null, t: reason === 'whale' ? 1.6 : 1.1, max: 1.1, fromX: p.x, fromY: p.y };
  if (reason === 'hungry') {
    Snd.hungry();
    pop('Your puffling is too hungry', p.x + 20, p.y - 40, '#ffffff', 17);
    return;
  }
  if (reason === 'whale') {             // no scattered fish: everything goes in the mouth
    st.beak = [];
    by.state = 'swallow';
    pop('Gulp!', by.x, by.topY - 16, '#ffffff', 24);
    return;
  }
  if (reason === 'gull') { Snd.gullHit(); by.carrying = true; by.state = 'carry'; }
  else Snd.sealHit();
  loseStack(CAUGHT_BY[reason]);
  burst(p.x, p.y, 16, 'rgba(220,235,250,0.85)', 140, 0, 1.5, 3, 0.7);
}

function updateCaught(dt) {
  const s = st, p = s.p, c = s.caught;
  c.t -= dt;
  s.anim += dt;
  if (c.reason === 'whale') {
    updateSwallow(c, dt);
  } else if (c.by) {                     // the gull flies off with the puffin dangling
    const h = c.by;
    h.vx += (-220 - h.vx) * Math.min(1, dt * 3);
    h.vy += (-140 - h.vy) * Math.min(1, dt * 3);
    h.x += h.vx * dt; h.y += h.vy * dt;
    p.x = h.x + 4; p.y = h.y + 20;
    p.ang = 1.1 + Math.sin(s.anim * 9) * 0.25;
  } else if (c.reason === 'hungry') {  // just hangs its head
    p.ang = (p.ang || 0) + (0.5 - (p.ang || 0)) * Math.min(1, dt * 4);
    if (p.y < SEA - 6) p.y += 20 * dt;
  } else {
    p.ang = (p.ang || 0) + dt * 6;
    p.y += 30 * dt;
  }
  updateFx(dt);
  if (c.t <= 0) endGame(c.reason);
}

/* ================= UPDATE ================= */
function puffinPhysics(dt) {
  const s = st, p = s.p;
  const under = p.y > SEA + 6;
  let hold = holding;
  if (under && p.breath <= 0) hold = false;
  p.vy += (hold ? 1 : -1) * (under ? 1000 : 850) * dt;
  p.vy *= Math.pow(under ? 0.12 : 0.3, dt);
  p.vy = clamp(p.vy, -340, 340);
  p.y += p.vy * dt;
  if (p.y < 28) { p.y = 28; p.vy = Math.max(0, p.vy); }
  if (p.y > 578) { p.y = 578; p.vy = Math.min(0, p.vy); }

  const nowUnder = p.y > SEA + 6;
  if (nowUnder !== p.wasUnder) {
    burst(p.x + 8, SEA, 12, 'rgba(220,235,250,0.9)', 90 + Math.abs(p.vy) * 0.4, 500, 1.5, 3, 0.6);
    Snd.splash(0.4 + Math.min(1, Math.abs(p.vy) / 340) * 0.6);
    Snd.setUnder(nowUnder);
    p.wasUnder = nowUnder;
  }
  if (nowUnder) {
    p.breath = Math.max(0, p.breath - dt / AIR_SECONDS);
    if (p.breath === 0 && !p.gasp) {
      p.gasp = true; Snd.air();
      if (stackN() > 0) loseStack('Out of air. Catch dropped');
      else pop('Out of air', p.x + 20, p.y - 40);
    }
    if (Math.random() < dt * 4) s.parts.push({ x: p.x + 20, y: p.y - 6, vx: -s.speed * 0.3, vy: -40, g: -30, r: 1.8, life: 0.8, max: 0.8, color: 'rgba(220,235,250,0.6)', ring: true });
  } else {
    p.breath = Math.min(1, p.breath + dt / 1.2);
    if (p.breath > 0.3) p.gasp = false;
  }
  p.flap += dt * (nowUnder ? 5 : (hold ? 9 : 18));
  // body angle follows vertical speed, eased so it never snaps
  const target = clamp(p.vy / 620, -0.5, 0.55);
  p.ang = p.ang === undefined ? target : p.ang + (target - p.ang) * Math.min(1, dt * 12);
}

function update(dt) {
  const s = st, p = s.p;
  if (s.caught) { updateCaught(dt); return; }
  if (s.finale) { updateFinale(dt); return; }
  const wdt = dt;
  const tutorial = s.tutorial;
  const arrived = !tutorial && s.dist >= LEVEL_DIST;   // scrolling stops at 100%
  const scroll = arrived ? 0 : s.speed;
  s.t += wdt; s.anim += dt;
  s.dist = tutorial ? s.dist + scroll * wdt : Math.min(LEVEL_DIST, s.dist + scroll * wdt);
  if (!tutorial) s.progress = s.dist / LEVEL_DIST;
  else if (!TUT_STEPS[tutorial.step].sky) s.progress = 0.12;
  const u = s.progress;
  s.speed = tutorial ? 160 : 160 + 80 * u;
  const homeX = Math.min(VW * 0.28, 240);

  // the puffling gets hungrier; deliveries refill it
  if (!tutorial || tutorial.hungerOn) s.hunger = Math.max(tutorial ? 0.3 : 0, s.hunger - wdt / s.level.hungerSeconds);
  if (s.hunger < 0.2) { s.lowBeep -= dt; if (s.lowBeep <= 0) { Snd.chirp(); s.lowBeep = 1.3; } }
  updateChatter(dt);
  if (s.hunger <= 0 && !s.landing) { hideSay(); caught('hungry'); return; }

  // the home colony arrives exactly at 100%
  const homeLead = 200 * BURROW - 40;
  if (!tutorial && !s.homeSpawned && LEVEL_DIST - s.dist <= VW + 80 + homeLead - homeX) {
    s.homeSpawned = true;
    s.cliffs.push({ x: homeX - homeLead + (LEVEL_DIST - s.dist), w: 200, top: 132, used: false, home: true });
  }
  if (arrived && !s.landing) { startFinale(); return; }

  if (s.landing) updateLanding(dt, homeX);
  else { p.x = homeX; puffinPhysics(dt); }
  p.inv -= dt;

  // spawns
  if (tutorial) { updateTutorial(dt); if (!running) return; }
  s.tFish -= wdt; if (s.tFish <= 0 && !tutorial) { spawnSchool(); s.tFish = rand(1.1, 1.9); }
  s.tGold -= wdt; if (s.tGold <= 0 && !tutorial) { spawnGolden(); s.tGold = rand(11, 17); }
  const late = u > 0.93;                         // clear the way for the finish
  s.tGull -= wdt; if (s.tGull <= 0 && !late && !tutorial) { spawnGull(); s.tGull = rand(...s.level.gullEvery) - Math.min(0.8, u * 1.2); }
  s.tCliff -= wdt; if (s.tCliff <= 0 && u < 0.88 && !tutorial) s.tCliff = spawnCliff() ? rand(7.5, 9.5) : 0.8;
  s.tSeal -= wdt; if (s.tSeal <= 0 && !late) { spawnSeal(); s.tSeal = rand(...s.level.seals.every) - u * 4; }
  s.tWhale -= wdt;
  if (s.tWhale <= 0 && !late) {
    if (s.whales.length) s.tWhale = 1.5; else { spawnWhale(); s.tWhale = rand(...s.level.whales.every); }
  }
  s.tJaeger -= wdt;
  if (s.tJaeger <= 0 && !late) {       // jaegers only bother a puffin that's carrying fish
    if (stackN() < 2 || s.jaegers.length || s.landing) s.tJaeger = 1.2; else { spawnJaeger(); s.tJaeger = rand(...s.level.jaegers.every); }
  }
  s.tBerg -= wdt;
  if (s.tBerg <= 0 && !late) {
    const nearStack = s.cliffs.some(c => c.x + c.w > VW - 200);
    if (nearStack) s.tBerg = 0.8; else { spawnBerg(); s.tBerg = rand(...s.level.bergs.every); }
  }
  if (s.level.hunters && !late) {
    s.tHunt -= wdt;
    if (s.tHunt <= 0) {
      const busy = s.hunters.some(h => h.state !== 'climb');
      if (busy) s.tHunt = 1;             // one hunter at a time
      else { spawnHunter(); s.tHunt = rand(...s.level.hunters.every) - u * s.level.hunters.nightFaster; }
    }
  }

  for (const f of s.fish) { f.x += f.vx * wdt; f.y += Math.cos(s.t * (f.amp > 20 ? 2 : 3) + f.ph) * f.amp * wdt; f.y = clamp(f.y, SEA + 20, 580); }
  for (const g of s.gulls) { g.x += g.vx * wdt; g.y += Math.sin(s.t * 2 + g.ph) * 20 * wdt; }
  for (const c of s.cliffs) {
    c.x -= scroll * wdt;
    if (c.note) c.note.life -= dt;
    if (c.cheer) c.cheer = Math.max(0, c.cheer - dt);
    if (c.chick) c.chick = Math.max(0, c.chick - dt);
  }

  // seals hunt capelin
  for (const se of s.seals) {
    se.x += se.vx * wdt;
    if (!se.barked && se.x < VW - 20) { se.barked = true; Snd.sealBark(0.1); }
    let target = null, best = 1e9;
    for (const f of s.fish) {
      const dx = se.x - 30 - f.x;
      if (dx > 0 && dx < 230) { const d = dx + Math.abs(f.y - se.y) * 1.5; if (d < best) { best = d; target = f; } }
    }
    const ty = target ? target.y : se.y + Math.sin(s.t * 1.5 + se.ph) * 40;
    se.vy += clamp((ty - se.y) * 6, -500, 500) * wdt;
    se.vy *= Math.pow(0.2, wdt);
    se.vy = clamp(se.vy, -160, 160);
    se.y = clamp(se.y + se.vy * wdt, SEA + 35, 570);
    for (let i = s.fish.length - 1; i >= 0; i--) {
      const f = s.fish[i];
      if (Math.hypot(f.x - (se.x - 32), f.y - se.y) < 16) {
        s.fish.splice(i, 1); Snd.chomp();
        burst(f.x, f.y, 4, 'rgba(220,235,250,0.7)', 50, 0, 1, 2, 0.35);
      }
    }
    if (p.inv <= 0 && !s.caught && !s.landing) {
      const dx = (p.x - se.x) / 38, dy = (p.y - se.y) / 20;
      if (dx * dx + dy * dy < 1) {
        caught('seal');
      }
    }
  }

  updateHunters(wdt);
  updateWhales(wdt, scroll);
  updateJaegers(wdt);
  updateBergs(wdt, scroll);
  if (s.caught) return;

  if (!s.landing && !s.caught) {
    // catch fish
    const bx = p.x + 22, by = p.y - 4;
    for (let i = s.fish.length - 1; i >= 0; i--) {
      const f = s.fish[i];
      if (Math.hypot(f.x - bx, f.y - by) < (f.gold ? 24 : 20)) {
        if (stackN() < MAX_STACK) {
          s.beak.push(f.gold); s.biggest = Math.max(s.biggest, stackN());
          if (f.gold) {
            s.goldCaught++; Snd.golden();
            burst(f.x, f.y, 14, '#feb445', 120, 0, 1.5, 3, 0.6);
            pop('Golden capelin', p.x + 20, p.y - 40, '#feb445', 17);
          } else {
            Snd.catchFish(stackN());
            burst(f.x, f.y, 5, 'rgba(220,235,250,0.8)', 60, 0, 1, 2, 0.4);
          }
          s.fish.splice(i, 1);
        } else if (!s.fullWarned) {
          s.fullWarned = true; Snd.full();
          pop('Beak full. Head for a burrow', p.x + 20, p.y - 40, '#feb445', 16);
        }
      }
    }
    if (stackN() < MAX_STACK) s.fullWarned = false;

    // gulls
    for (const g of s.gulls) {
      if (p.inv <= 0 && Math.hypot(g.x - p.x, g.y - p.y) < 26) {
        p.inv = 1.4; p.vy = Math.max(p.vy, 220); Snd.gullHit();
        if (stackN() > 0) loseStack('A gull took your catch');
        else pop('Bonk', p.x + 20, p.y - 40);
      }
    }

    // reaching a burrow with fish starts the landing
    for (const c of s.cliffs) {
      // trigger a little before the stack arrives, so the landing plays out as it scrolls past
      if (!c.used && !c.home && stackN() > 0 && landingReady(c, homeX) && p.y > c.top - 85 && p.y < c.top + 14) {
        startLanding(c); break;
      }
    }
  }

  s.fish = s.fish.filter(f => f.x > -40);
  s.gulls = s.gulls.filter(g => g.x > -60);
  s.seals = s.seals.filter(se => se.x > -80);
  s.cliffs = s.cliffs.filter(c => c.x + c.w > -40 || c === (s.landing && s.landing.c));

  // time of day moments
  if (!s.phaseSunset && u >= 0.56) { s.phaseSunset = true; pop('Sunset', VW / 2, 120, '#feb445', 26); Snd.phase(); }
  if (!s.phaseNight && u >= 0.78) { s.phaseNight = true; pop('Night is coming', VW / 2, 120, '#ffffff', 24); Snd.phase(); }

  updateFx(dt);
}

function updateFx(dt) {
  for (const q of st.parts) { q.x += q.vx * dt; q.y += q.vy * dt; q.vy += q.g * dt; q.life -= dt; if (q.rot !== undefined) q.rot += dt * 8; }
  st.parts = st.parts.filter(q => q.life > 0);
  for (const q of st.pops) { q.y -= 28 * dt; q.life -= dt; }
  st.pops = st.pops.filter(q => q.life > 0);
}

function idle(dt) {
  const s = st, p = s.p;
  s.anim += dt; s.dist += 45 * dt;
  p.x = Math.min(VW * 0.28, 240);
  p.y = SEA - 5 + Math.sin(s.anim * 1.8) * 2.2;
  p.vy = 0; p.flap = 0;
  updateFx(dt);
}

/* ================= HUD ================= */
function updateHud() {
  hScore.textContent = st.score;
  const n = stackN(), gold = goldN();
  hBeak.innerHTML = (n === MAX_STACK ? 'Full' : n) + (gold ? `<span class="mult">×${1 + gold}</span>` : '');
  hBeak.classList.toggle('full', n === MAX_STACK);
  const pct = (st.progress * 100).toFixed(2) + '%';
  progFill.style.width = pct; progMark.style.left = pct;
  hFill.style.width = (st.hunger * 100).toFixed(1) + '%';
  hunger.classList.toggle('mid', st.hunger < 0.5 && st.hunger >= 0.2);
  hunger.classList.toggle('low', st.hunger < 0.2);
}

/* ================= FLOW ================= */
const bestKey = lv => 'capelin-run-best-' + lv.id;
function bestFor(lv) {
  let v = store.get(bestKey(lv));
  if (v === null && lv === LEVELS[0]) v = store.get('capelin-run-best');   // scores from before levels existed
  return Number(v) || 0;
}
const unlockedUpTo = () => clamp(Number(store.get('capelin-run-unlocked')) || 0, 0, LEVELS.length - 1);
const isLocked = i => !UNLOCK_ALL && i > unlockedUpTo();
let currentLevel = clamp(Number(store.get('capelin-run-level')) || 0, 0, UNLOCK_ALL ? LEVELS.length - 1 : unlockedUpTo());

/* ---------- level picker: live preview with slider navigation ---------- */
let selected = currentLevel, pv = null, pvSize = { w: 0, h: 0, dpr: 1 };

// A small staged scene for the preview: puffin, a sea stack, capelin, and the level's hazard.
function buildPreview(i) {
  const s = newState(0.2, i);
  s.pvClock = 0; s.dist = 4800;          // frames the far scenery nicely
  const vw = pvSize.w && pvSize.h ? pvSize.w / (pvSize.h / 430) : 560;
  s.p.x = vw * 0.22;
  s.cliffs.push({ x: vw * 0.5, w: 160, top: 140, used: false });
  for (let k = 0; k < 5; k++) s.fish.push({ x: vw * 0.2 + k * 26, y: SEA + 70 + (k % 2) * 14, vx: 0, ph: k, amp: 0, gold: k === 3 });
  const threats = LEVELS[i].threats || [];
  if (threats.includes('hunter')) s.hunters.push({ x: vw * 0.78, y: 70, vx: 0, vy: 0, state: 'circle', t: 99, ph: 0, hold: vw * 0.78 });
  if (threats.includes('gull')) s.gulls.push({ x: vw * 0.8, y: 95, vx: 0, ph: 1 });
  if (threats.includes('seal')) s.seals.push({ x: vw * 0.82, y: SEA + 100, vx: 0, vy: 0, ph: 0, barked: true });
  if (threats.includes('whale')) s.whales.push({ x: vw * (threats[0] === 'whale' ? 0.8 : 0.9), state: 'hang', t: 99, rise: threats[0] === 'whale' ? 1 : 0.75, open: 1, topY: 0, ph: 0, ate: 3 });
  if (threats.includes('jaeger')) s.jaegers.push({ x: vw * 0.12, y: 110, vx: 200, vy: 20, state: 'chase', t: 99, waited: 0, ph: 0 });
  if (threats.includes('berg')) { const sv = st; st = s; spawnBerg(); st = sv; const b = s.bergs[0]; b.x = vw * 0.66; }
  for (const w of s.whales) w.topY = whaleTop(w.rise);
  return s;
}

function sizePreview() {
  const r = pvCanvas.getBoundingClientRect();
  if (!r.width) return;
  pvSize = { w: r.width, h: r.height, dpr: Math.min(window.devicePixelRatio || 1, 2) };
  pvCanvas.width = Math.round(r.width * pvSize.dpr); pvCanvas.height = Math.round(r.height * pvSize.dpr);
  pv = buildPreview(selected);
}

function drawPreview(dt) {
  if (startPanel.hidden || !pv || !pvSize.w) return;
  pv.pvClock += dt; pv.anim += dt; pv.dist += 40 * dt;
  pv.fixedU = 0.45 - 0.45 * Math.cos(pv.pvClock * 0.45);        // drifts from morning to night and back
  for (const h of pv.hunters) h.y = 70 + Math.sin(pv.anim * 1.4) * 6;
  pv.p.y = SEA - 5 + Math.sin(pv.anim * 1.8) * 2.2;
  const saved = { ctx, VW, S, dpr, st };
  ctx = pvCtx; S = pvSize.h / 430; VW = pvSize.w / S; dpr = pvSize.dpr; st = pv;
  draw();
  ({ ctx, VW, S, dpr, st } = saved);
}

function renderPicker(dir) {
  const lv = LEVELS[selected], best = bestFor(lv);
  pvNum.textContent = `Level ${selected + 1} of ${LEVELS.length}`;
  pvName.textContent = lv.name;
  pvBlurb.textContent = lv.blurb;
  pvBest.hidden = !best; pvBest.textContent = best ? `Best ${best.toLocaleString()}` : '';
  const locked = isLocked(selected);
  preview.classList.toggle('locked', locked);
  pvLock.hidden = !locked;
  pvLock.textContent = locked ? `Finish ${LEVELS[selected - 1].name} to unlock` : '';
  playBtn.disabled = locked;
  playBtn.textContent = locked ? 'Locked' : `Play ${lv.name}`;
  lvDots.innerHTML = '';
  LEVELS.forEach((l, i) => {
    const d = document.createElement('button');
    d.type = 'button'; d.className = 'dot';
    d.setAttribute('aria-label', `Level ${i + 1}: ${l.name}`);
    if (i === selected) d.setAttribute('aria-current', 'true');
    d.addEventListener('click', () => selectLevel(i));
    lvDots.appendChild(d);
  });
  if (dir) {
    preview.classList.remove('swap-next', 'swap-prev');
    void preview.offsetWidth;
    preview.classList.add(dir > 0 ? 'swap-next' : 'swap-prev');
  }
}

function selectLevel(i) {
  const n = LEVELS.length, next = ((i % n) + n) % n;
  if (next === selected) return;
  const dir = (i > selected) ? 1 : -1;
  selected = next;
  pv = buildPreview(selected);
  if (!running) st = newState(0.2, selected);          // background shows the chosen level too
  renderPicker(dir);
}

function showLevels() {
  selected = currentLevel;
  endPanel.hidden = true; hud.hidden = true; startPanel.hidden = false;
  st = newState(0.2, selected);
  renderPicker();
  sizePreview();
  howBtn.textContent = tutorialDone() ? 'How to play' : 'New here? How to play';
  playBtn.focus({ preventScroll: true });
}

function start(i = currentLevel) {
  if (isLocked(i)) return;
  hideSay();
  currentLevel = i; store.set('capelin-run-level', String(i));
  Snd.init(); Snd.start(); Snd.setUnder(false);
  st = newState(0, i);
  running = true; holding = false;
  startPanel.hidden = true; endPanel.hidden = true; hud.hidden = false;
  if (document.activeElement && document.activeElement !== muteBtn) document.activeElement.blur();
  pop(st.level.name, VW / 2, 170, '#ffffff', 30);
  pop('Level ' + (i + 1), VW / 2, 136, '#feb445', 15);
  updateHud();
}
function endGame(reason) {
  running = false; holding = false; hideSay();
  Snd.end(); Snd.setUnder(false);
  const lv = st.level, score = st.score, best = bestFor(lv), isBest = score > best;
  if (isBest) store.set(bestKey(lv), String(score));
  endLevel.textContent = `Level ${st.levelIdx + 1}: ${lv.name}`;
  const complete = reason === 'complete';
  if (complete && st.levelIdx + 1 < LEVELS.length && isLocked(st.levelIdx + 1)) store.set('capelin-run-unlocked', String(st.levelIdx + 1));
  endTitle.textContent = complete ? 'Home by nightfall' : CAUGHT_BY[reason];
  endScore.hidden = false;
  endScore.textContent = score;
  againBtn.textContent = 'Play again'; delete againBtn.dataset.tutorial;
  const d = st.deliveries;
  endStats.textContent = (complete ? `Home bonus ${st.bonus}. ` : `Made it ${Math.floor(st.progress * 100)}% of the way. `) +
    `${d} ${d === 1 ? 'delivery' : 'deliveries'}, biggest stack ${st.biggest}` +
    (st.goldCaught ? `, ${st.goldCaught} golden capelin.` : '.');
  const next = complete && st.levelIdx + 1 < LEVELS.length ? st.levelIdx + 1 : -1;
  nextBtn.hidden = next < 0;
  nextBtn.dataset.level = next;
  if (next >= 0) nextBtn.textContent = `Next: ${LEVELS[next].name}`;
  againBtn.className = next >= 0 ? 'secondary' : 'primary';
  endBest.innerHTML = isBest && score > 0 ? '<span class="newbest">New best score.</span>' : `Your best: ${Math.max(best, score)}`;
  hud.hidden = true; endPanel.hidden = false;
  const keepParts = st.parts, keepPops = st.pops;
  st = newState(1, currentLevel); st.parts = keepParts; st.pops = keepPops;
  (next >= 0 ? nextBtn : againBtn).focus({ preventScroll: true });
}

function frame(now) {
  const dt = last ? clamp((now - last) / 1000, 0, 0.05) : 0;
  last = now;
  if (running) { update(dt); if (running) updateHud(); } else idle(dt);
  draw();
  drawPreview(dt);
  requestAnimationFrame(frame);
}

/* ================= INPUT ================= */
function syncMute() {
  muteBtn.setAttribute('aria-pressed', Snd.muted ? 'true' : 'false');
  muteBtn.setAttribute('aria-label', Snd.muted ? 'Turn sound on' : 'Mute sound');
}
muteBtn.addEventListener('click', () => { Snd.init(); Snd.toggle(); syncMute(); });
syncMute();

stage.addEventListener('pointerdown', e => {
  if (e.target.closest('.panel, .mute')) return;
  if (running) { holding = true; e.preventDefault(); }
});
['pointerup', 'pointercancel'].forEach(ev => window.addEventListener(ev, () => { holding = false; }));
stage.addEventListener('contextmenu', e => e.preventDefault());
window.addEventListener('keydown', e => {
  if (!running && !startPanel.hidden && (e.code === 'ArrowLeft' || e.code === 'ArrowRight')) {
    e.preventDefault(); selectLevel(selected + (e.code === 'ArrowRight' ? 1 : -1)); return;
  }
  if (e.code === 'KeyU' && e.shiftKey && !running) {   // testing: unlock every level
    store.set('capelin-run-unlocked', String(LEVELS.length - 1)); renderPicker(); return;
  }
  if (e.code === 'KeyM' && !e.repeat) { Snd.init(); Snd.toggle(); syncMute(); return; }
  if (e.code !== 'Space' && e.code !== 'ArrowDown') return;
  if (running) { e.preventDefault(); holding = true; }
  else if (e.code === 'Space' && !(document.activeElement instanceof HTMLButtonElement)) { e.preventDefault(); start(startPanel.hidden ? currentLevel : selected); }
});
window.addEventListener('keyup', e => { if (e.code === 'Space' || e.code === 'ArrowDown') holding = false; });
window.addEventListener('blur', () => { holding = false; });
document.addEventListener('visibilitychange', () => { holding = false; last = 0; });
againBtn.addEventListener('click', () => (againBtn.dataset.tutorial ? startTutorial() : start(currentLevel)));
howBtn.addEventListener('click', startTutorial);
tutSkip.addEventListener('click', skipTutorial);
chooseBtn.addEventListener('click', showLevels);
nextBtn.addEventListener('click', () => start(Number(nextBtn.dataset.level)));
playBtn.addEventListener('click', () => start(selected));
prevLv.addEventListener('click', () => selectLevel(selected - 1));
nextLv.addEventListener('click', () => selectLevel(selected + 1));
// swipe the preview to change level
let swipeX = null;
preview.addEventListener('pointerdown', e => { swipeX = e.clientX; });
preview.addEventListener('pointerup', e => {
  if (swipeX === null) return;
  const dx = e.clientX - swipeX; swipeX = null;
  if (Math.abs(dx) > 40) selectLevel(selected + (dx < 0 ? 1 : -1));
});
preview.addEventListener('pointercancel', () => { swipeX = null; });
window.addEventListener('resize', () => { resize(); sizePreview(); });

resize();
st = newState(0.2, selected);
renderPicker();
howBtn.textContent = tutorialDone() ? 'How to play' : 'New here? How to play';
sizePreview();
requestAnimationFrame(frame);
