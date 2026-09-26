// Balance check: automated players run every level many times and report how it goes, so tuning
// (and targets like star thresholds) come from data, not guesses.
// Usage: node tools/balance.mjs [runs per level, default 12]
// Two players: "good" fishes until a burrow is close and dodges what the game teaches you to dodge;
// "casual" reacts late, rises for burrows early, wobbles, and sometimes misses a threat.
import { T, els, frame, key, ended, SEA, resetStore } from './harness.mjs';

const RUNS = Number(process.argv[2]) || 12;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// Count what cost the puffin its catch, by wrapping the game's own function
const losses = {};
const realLose = globalThis.loseStack;
globalThis.loseStack = msg => { losses[msg] = (losses[msg] || 0) + 1; realLose(msg); };

function decide(s, skill, mem) {
  const p = s.p, BUR = T.BURROW;
  const under = p.y > SEA + 6;
  // what the puffin wants to do
  let ty = SEA + 70;
  const stack = s.beak.length;
  const burrow = s.cliffs.find(c => !c.used && !c.home && c.x + c.w * BUR > p.x + 20 && c.x < p.x + 900);
  // keep fishing until the burrow is close enough to reach, then go up and deliver whatever's in the beak
  const close = burrow && burrow.x + burrow.w * BUR - p.x < s.speed * skill.lead;
  const wantDeliver = stack >= skill.stack || (stack > 0 && (s.hunger < skill.hungry || s.starving > 0)) || stack >= 12;
  if (close && wantDeliver) ty = burrow.top - 30;
  else {
    const fish = s.fish.filter(f => f.x > p.x - 5 && f.x < p.x + 380);
    const pick = fish.find(f => f.gold) || fish.sort((a, b) => a.x - b.x)[0];
    if (pick && stack < 12) ty = pick.y;
  }
  if (under && p.breath < skill.air) ty = SEA - 40;
  // dodges, which a casual player sometimes misses (decided once per threat)
  const sees = obj => { if (!mem.has(obj)) mem.set(obj, Math.random() < skill.notice); return mem.get(obj); };
  for (const g of s.gannets) {
    if ((g.state === 'lock' || g.state === 'dive') && g.x > p.x - 25 && g.x < p.x + 260 && sees(g)) {
      ty = g.aimY > SEA + 40 ? SEA - 90 : SEA + 230;       // change depth, well away from where it's aimed
    }
  }
  for (const w of s.whales) {
    if ((w.state === 'bubbles' || w.state === 'lunge' || w.state === 'hang') && Math.abs(w.x - p.x) < 170 && sees(w)) ty = SEA + 235;
  }
  for (const se of s.seals) {
    const dx = se.x - p.x;
    if (dx > -40 && dx < 240 && Math.abs(se.y - p.y) < 90 && sees(se)) ty = se.y > SEA + 150 ? SEA - 60 : SEA + 250;
  }
  for (const h of s.hunters) if ((h.state === 'warn' || h.state === 'dive') && sees(h)) ty = Math.max(ty, SEA + 110);
  for (const j of s.jaegers) if (j.state === 'chase' && stack > 0 && sees(j)) ty = Math.max(ty, SEA + 120);
  for (const b of s.bergs) {
    if (b.x + b.w > p.x - 30 && b.x < p.x + 220 && sees(b)) ty = SEA - b.top - 40;
  }
  return clamp(ty, 40, 570);
}

function play(levelIdx, skill) {
  resetStore();
  for (const k in losses) delete losses[k];
  T.start(levelIdx);
  const mem = new Map();
  let held = false, ty = SEA, f = 0, nextThink = 0;
  while (!ended() && f < 60 * 240) {
    const s = T.st;
    if (f >= nextThink) { ty = decide(s, skill, mem) + (Math.random() - 0.5) * skill.wobble; nextThink = f + skill.react; }
    const h = s.p.y < ty;
    if (h !== held) { held = h; key('Space', h); }
    frame(); f++;
  }
  if (held) key('Space', false);
  const s = T.st;   // endGame replaced st; read the end screen instead
  return {
    title: els.endTitle.textContent, score: Number(els.endScore.textContent) || 0,
    complete: els.endTitle.textContent === T.t('end.home'),
    stats: els.endStats.textContent, losses: { ...losses }
  };
}

const SKILLS = {
  good: { stack: 2, hungry: 0.5, lead: 2.4, air: 0.3, notice: 0.95, react: 6, wobble: 10 },
  casual: { stack: 1, hungry: 0.4, lead: 2.8, air: 0.22, notice: 0.7, react: 14, wobble: 40 }
};

const pct = (arr, q) => { const a = arr.slice().sort((x, y) => x - y); return a.length ? a[Math.min(a.length - 1, Math.floor(q * a.length))] : 0; };
for (const [name, skill] of Object.entries(SKILLS)) {
  console.log(`\n== ${name} player, ${RUNS} runs per level ==`);
  console.log('level'.padEnd(20) + 'home'.padStart(6) + 'median'.padStart(8) + 'p75'.padStart(7) + 'p90'.padStart(7) + 'best'.padStart(7) + '   how runs ended / catches lost');
  for (let i = 0; i < T.LEVELS.length; i++) {
    const rs = []; for (let r = 0; r < RUNS; r++) rs.push(play(i, skill));
    const scores = rs.map(r => r.score), ends = {}, lost = {};
    for (const r of rs) { ends[r.title] = (ends[r.title] || 0) + 1; for (const [k, v] of Object.entries(r.losses)) lost[k] = (lost[k] || 0) + v; }
    const home = rs.filter(r => r.complete).length;
    const endStr = Object.entries(ends).map(([k, v]) => `${k} ${v}`).join(', ');
    const lostStr = Object.entries(lost).map(([k, v]) => `${k} ${(v / RUNS).toFixed(1)}/run`).join(', ');
    console.log(T.LEVELS[i].name.padEnd(20) + `${home}/${RUNS}`.padStart(6) + String(pct(scores, 0.5)).padStart(8) + String(pct(scores, 0.75)).padStart(7) +
      String(pct(scores, 0.9)).padStart(7) + String(Math.max(...scores)).padStart(7) + `   ${endStr} | ${lostStr || 'none'}`);
  }
}
