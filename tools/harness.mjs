// Shared headless harness for the smoke test and the balance check: builds the game, runs the
// bundled script against a stubbed DOM and canvas, and exposes the game's state and controls.
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
execFileSync(process.execPath, [join(root, 'tools', 'build.mjs')], { stdio: 'ignore' });
const html = readFileSync(join(root, 'dist', 'beakful.html'), 'utf8');
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
  id, hidden: id === 'say' || id === 'wardPanel' || id === 'pausePanel', disabled: false, dataset: {}, style: {}, className: '', textContent: '',
  _html: '', get innerHTML() { return this._html; }, set innerHTML(v) { this._html = v; this.children = []; },   // like the DOM: replaces the children
  children: [], offsetWidth: 1, parentElement: {},
  classList: { toggle() {}, add() {}, remove() {} },
  querySelector: () => ({ style: {}, focus() {}, classList: { toggle() {}, remove() {} } }),
  addEventListener(e, f) { this['on' + e] = f; }, appendChild(c) { this.children.push(c); },
  setAttribute() {}, focus() {}, blur() {}, getContext: () => ctx,
  getBoundingClientRect: () => ({ width: id === 'pvCanvas' ? 400 : 1200, height: id === 'pvCanvas' ? 300 : 700 }),
  closest: () => null
});
const mem = {};
const winHandlers = {};
let raf = null;
Object.assign(globalThis, {
  document: { getElementById: id => els[id] || (els[id] = el(id)), createElement: () => el('b'), addEventListener() {}, activeElement: null,
    querySelectorAll: () => [], documentElement: {}, title: '' },
  HTMLButtonElement: function () {},
  localStorage: { getItem: k => (k in mem ? mem[k] : null), setItem: (k, v) => { mem[k] = String(v); } },
  requestAnimationFrame: cb => { raf = cb; },
  window: { addEventListener(e, f) { winHandlers[e] = f; }, devicePixelRatio: 1 },
  location: { search: '?dev' }                          // testing mode: every level and outfit open
});
(0, eval)(js + ';globalThis.__T = { get st() { return st; }, get running() { return running; }, get BURROW() { return BURROW; }, start, spawnWhale, spawnGannet, deliver, LEVELS, OUTFITS, SLOTS, loadStats, outfitEarned, recordRun, wearOutfit, takeOff, wornLook, wornIds, TEXT, DATA, TUT_STEPS, setLang, t, recordStars, starsFor, totalStars, maxStars, get LANG() { return LANG; } };');
const T = globalThis.__T;
const SEA = 270;

let clock = 1000;
const frame = () => { clock += 16.7; raf(clock); };
const key = (code, down = true) => (down ? winHandlers.keydown({ code, preventDefault() {} }) : winHandlers.keyup({ code }));
const ended = () => !els.endPanel.hidden;

const resetStore = () => { for (const k of Object.keys(mem)) delete mem[k]; };

export { T, els, frame, key, ended, SEA, winHandlers, resetStore };
