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
  querySelector: () => ({ classList: { toggle() {}, remove() {} } }),
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
(0, eval)(js + ';globalThis.__T = { get st() { return st; }, get running() { return running; }, start, spawnWhale, LEVELS };');
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
