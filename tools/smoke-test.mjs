// Headless smoke test. Builds the game, runs the bundled script against stubbed DOM and
// canvas, and plays through key scenarios. Usage: node tools/smoke-test.mjs
// Exit code is non-zero if anything fails.
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
execFileSync(process.execPath, [join(root, 'tools', 'build.mjs')], { stdio: 'ignore' });
const html = readFileSync(join(root, 'dist', 'fun-puffin.html'), 'utf8');
const js = html.match(/<script>\n\(\(\) => \{\n([\s\S]*)\}\)\(\);\n<\/script>/)[1];

// ---- stubs: a canvas context that accepts anything, and minimal DOM elements ----
const ctx = new Proxy({}, {
  get: (t, k) => (k in t) ? t[k]
    : (k === 'createLinearGradient' || k === 'createRadialGradient') ? () => ({ addColorStop() {} })
    : k === 'measureText' ? s => ({ width: String(s).length * 9 })
    : () => {},
  set: (t, k, v) => { t[k] = v; return true; }
});
const els = {};
const el = id => ({
  id, hidden: id === 'say', disabled: false, dataset: {}, style: {}, className: '', textContent: '', innerHTML: '',
  children: [], offsetWidth: 1, parentElement: {},
  classList: { toggle() {}, add() {}, remove() {} },
  querySelector: () => ({ style: {}, classList: { toggle() {}, remove() {} } }),
  addEventListener(e, f) { this['on' + e] = f; }, appendChild(c) { this.children.push(c); },
  setAttribute() {}, focus() {}, blur() {}, getContext: () => ctx,
  getBoundingClientRect: () => ({ width: id === 'pvCanvas' ? 400 : 1200, height: id === 'pvCanvas' ? 300 : 700 }),
  closest: () => null
});
const mem = {};
const winHandlers = {};
let raf = null;
Object.assign(globalThis, {
  document: { getElementById: id => els[id] || (els[id] = el(id)), createElement: () => el('b'), addEventListener() {}, activeElement: null },
  HTMLButtonElement: function () {},
  localStorage: { getItem: k => (k in mem ? mem[k] : null), setItem: (k, v) => { mem[k] = String(v); } },
  requestAnimationFrame: cb => { raf = cb; },
  window: { addEventListener(e, f) { winHandlers[e] = f; }, devicePixelRatio: 1 }
});
(0, eval)(js + ';globalThis.__T = { get st() { return st; }, get running() { return running; }, start, spawnWhale, spawnGannet, deliver, LEVELS };');
const T = globalThis.__T;
const SEA = 270;

let clock = 1000;
const frame = () => { clock += 16.7; raf(clock); };
const key = (code, down = true) => (down ? winHandlers.keydown({ code, preventDefault() {} }) : winHandlers.keyup({ code }));
const ended = () => !els.endPanel.hidden;
const results = [];
const check = (name, ok, detail = '') => { results.push(ok); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  (' + detail + ')' : ''}`); };
const quiet = s => { s.tSeal = s.tHunt = s.tWhale = s.tJaeger = s.tBerg = s.tGull = s.tCliff = 999; };

// 1. An unfed puffling ends the run
T.start(0);
for (let f = 0; f < 60 * 40 && !ended(); f++) { T.st.p.inv = 99; frame(); }
check('unfed puffling ends the run', els.endTitle.textContent === 'Puffling too hungry', els.endTitle.textContent);

// 1b. The meter running out starts a last chance, not an instant loss
T.start(0); quiet(T.st);
T.st.hunger = 0.001;
for (let f = 0; f < 10; f++) { T.st.p.inv = 99; frame(); }
check('empty meter starts a last chance', !ended() && T.st.starving > 0, `starving ${T.st.starving.toFixed(2)}`);
let lastF = 10;
while (!T.st.caught && lastF < 60 * 20) { T.st.p.inv = 99; frame(); lastF++; }
check('last chance runs out after about 6 seconds', T.st.caught?.reason === 'hungry' && Math.abs(lastF / 60 - 6) < 0.3, `${(lastF / 60).toFixed(1)}s`);
while (!ended()) frame();

// 1c. A delivery during the last chance saves the run; fish are gulped one at a time
const burrow = () => ({ x: 400, w: 160, top: 130, used: false });
T.start(0); quiet(T.st);
T.st.hunger = 0.001;
for (let f = 0; f < 10; f++) { T.st.p.inv = 99; frame(); }
T.st.beak = [false, false, false, true];               // 3 capelin + 1 golden = 5 fish of food
T.deliver(burrow());
check('delivery during the last chance saves the run', T.st.starving === 0 && !ended());
frame();
check('fish are not all swallowed at once', T.st.hunger < 0.05 && T.st.feedQ.length === 4, `hunger ${T.st.hunger.toFixed(3)}`);
for (let f = 0; f < 60; f++) frame();
check('all fish gulped within a second', T.st.feedQ.length === 0 && Math.abs(T.st.hunger - 0.4) < 0.05, `hunger ${T.st.hunger.toFixed(3)}`);
check('puffling grows as it is fed', T.st.fedFish === 5);

// 1d. Fish that don't fit give a full belly, which holds off hunger
T.start(0); quiet(T.st);
T.st.hunger = 0.9; T.st.beak = Array(6).fill(false);   // 0.48 of food into 0.1 of room
T.deliver(burrow());
for (let f = 0; f < 60; f++) { T.st.p.inv = 99; frame(); }
const fullAfter = T.st.full;
check('overflow becomes full-belly time', T.st.hunger === 1 && fullAfter > 3, `full ${fullAfter.toFixed(2)}s`);
for (let f = 0; f < 60; f++) { T.st.p.inv = 99; frame(); }
check('no hunger while the belly is full', T.st.hunger === 1 && T.st.full < fullAfter);

// 2. Every level reaches the finale when safe and fed
for (let i = 0; i < T.LEVELS.length; i++) {
  T.start(i);
  let f = 0;
  while (!ended() && f < 60 * 200) { T.st.p.inv = Math.max(T.st.p.inv, 2); T.st.hunger = 1; frame(); f++; }
  check(`level ${i + 1} (${T.LEVELS[i].name}) reaches home`, els.endTitle.textContent === 'Home by nightfall', `${Math.round(f / 60)}s`);
}

// 3. Whale: swallowed in the ring near the surface, safe deep beneath it
const whaleIdx = T.LEVELS.findIndex(l => l.whales);
function whaleTrial(y) {
  T.start(whaleIdx); quiet(T.st); T.st.p.inv = 0; T.spawnWhale();
  const w = T.st.whales[0];
  for (let f = 0; f < 300 && !ended(); f++) { if (!T.st.caught) { w.x = T.st.p.x; T.st.p.y = y; T.st.p.vy = 0; } frame(); }
  return ended() ? els.endTitle.textContent : 'survived';
}
check('whale swallows a puffin in the ring', whaleTrial(SEA + 30) === 'Swallowed by a whale');
check('diving deep passes under the whale', whaleTrial(SEA + 220) === 'survived');

// 3b. Gannets: aimed at the puffin, a hit knocks the catch loose; far enough below, it can't reach
const gannetIdx = T.LEVELS.findIndex(l => l.gannets);
function gannetTrial(y) {
  T.start(gannetIdx); quiet(T.st); T.st.tGannet = 999; T.st.fish = []; T.st.tFish = 999;
  T.st.p.inv = 0; T.st.p.y = y; T.st.beak = [false, false, false];
  frame();                                              // puffin settles at its usual x
  T.st.p.y = y; T.spawnGannet();
  for (let f = 0; f < 60 * 4 && T.st.gannets.length; f++) {
    T.st.p.y = y; T.st.p.vy = 0; T.st.p.breath = 1;
    if (T.st.beak.length < 3) return 'hit';
    frame();
  }
  return T.st.beak.length < 3 ? 'hit' : 'safe';
}
const trials = n => Array.from({ length: n }, (_, i) => i);
check('gannet hits a puffin in the air', trials(5).every(() => gannetTrial(SEA - 70) === 'hit'));
check('gannet hits a puffin underwater', trials(5).every(() => gannetTrial(SEA + 60) === 'hit'));
check('diving below the gannet is safe', trials(5).every(() => gannetTrial(SEA + 230) === 'safe'));
{
  T.start(gannetIdx); quiet(T.st); T.st.tGannet = 999; T.st.tFish = 999; T.st.p.inv = 99;
  T.st.fish = [];
  for (let k = 0; k < 6; k++) T.st.fish.push({ x: 700 + k * 12, y: SEA + 60, vx: -T.st.speed, ph: 0, amp: 0, gold: false });
  T.st.gannets.push({ x: 700, y: 36, state: 'dive', t: 0, d: 0, ph: 0, splashed: false, ate: 0 });
  for (let f = 0; f < 60; f++) frame();
  check('a gannet plunge eats or scatters the school', T.st.fish.length < 6 && T.st.fish.some(x => Math.abs(x.y - (SEA + 60)) > 15));
}

// 4. The tutorial can be completed by following the cards
els.howBtn.onclick();
let holding = false;
const hold = h => { if (h !== holding) { holding = h; key('Space', h); } };
for (let f = 0; f < 60 * 200 && T.running; f++) {
  const s = T.st, p = s.p, step = els.tutTitle.textContent;
  let ty = SEA - 60;
  const burrow = s.cliffs.find(c => !c.used && c.x + c.w > p.x - 20);
  const fish = s.fish.find(x => x.gold && x.x > p.x) || s.fish.find(x => x.x > p.x);
  if (step === 'Hold to dive') ty = SEA + 120;
  else if (step === 'Catch capelin' || step === 'Deliver to a burrow' || step === 'Bigger stacks score more') {
    if (s.beak.length && burrow && step !== 'Catch capelin') ty = burrow.top - 30;
    else if (fish) ty = fish.y;
    if (p.breath < 0.35) ty = SEA - 40;
  }
  hold(p.y < ty);
  frame();
}
hold(false);
check('tutorial completes', els.endTitle.textContent === "You're ready", els.endTitle.textContent);

const failed = results.filter(r => !r).length;
console.log(failed ? `\n${failed} failed` : `\nAll ${results.length} passed`);
process.exit(failed ? 1 : 0);
