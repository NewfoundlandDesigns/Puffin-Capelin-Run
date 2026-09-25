/* Outfits: looks only, earned by playing. There are five slots (hats, glasses, scarves &
   necklaces, boots, feathers) and the puffin can wear one of each. None changes how the puffin
   plays. Each item has an unlock test on lifetime stats. Head items draw in the head's own
   coordinates (head centre 14,-6, radius about 9, bill pointing right), so they follow the puffin
   through every pose: flying, swimming, crash-landing and standing. Add one by adding an entry. */

const TARTAN = { green: '#1f6b3a', gold: '#e3b23c', white: '#f3f3ee', brown: '#6b4a2b', red: '#b8282e' };

function drawSouwester() {                      // yellow oilskin rain hat, brim long at the back
  ctx.fillStyle = '#f2b134';
  ctx.beginPath(); ctx.moveTo(4, -11.5); ctx.quadraticCurveTo(5, -22.5, 14, -22.5); ctx.quadraticCurveTo(22.5, -22.5, 22.5, -12);
  ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(25.5, -12.2); ctx.quadraticCurveTo(14, -14.5, 3, -12.2);
  ctx.quadraticCurveTo(-3.5, -10, -6, -3.5); ctx.quadraticCurveTo(-1, -6.5, 3.5, -8.8);
  ctx.quadraticCurveTo(14, -10.4, 25.5, -10.2); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#c98a14'; ctx.lineWidth = 0.7;
  ctx.beginPath(); ctx.moveTo(6, -13.4); ctx.quadraticCurveTo(14, -15.6, 21.5, -13.2);
  ctx.moveTo(14, -22.3); ctx.lineTo(14, -14.6); ctx.stroke();
  ctx.strokeStyle = '#6b4a2b'; ctx.lineWidth = 0.6;               // chin strap
  ctx.beginPath(); ctx.moveTo(8, -10); ctx.quadraticCurveTo(9, -1, 14, 2.6); ctx.stroke();
}

function drawToque() {                          // knitted red toque with a white band and a pom-pom
  ctx.fillStyle = '#dc362c';
  ctx.beginPath(); ctx.moveTo(4.6, -10.5); ctx.quadraticCurveTo(5, -22, 14, -22); ctx.quadraticCurveTo(23, -22, 23, -10.5);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(120,20,15,0.45)'; ctx.lineWidth = 0.6;   // knit ribs
  ctx.beginPath();
  for (let i = 0; i < 5; i++) { const x = 7.5 + i * 3.3; ctx.moveTo(x, -13.5); ctx.quadraticCurveTo(x + 0.6, -18, 14 + (x - 14) * 0.3, -21.4); }
  ctx.stroke();
  ctx.fillStyle = '#f3f3ee';                                        // folded band
  ctx.beginPath(); ctx.moveTo(4, -13.8); ctx.quadraticCurveTo(14, -16.2, 24, -13.8); ctx.lineTo(24, -10); ctx.quadraticCurveTo(14, -12.2, 4, -10);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#dc362c'; for (let i = 0; i < 6; i++) ell(6.2 + i * 3.4, -12.3 + Math.abs(i - 2.5) * 0.25, 0.9, 0.9);
  ctx.fillStyle = '#f3f3ee'; ell(14, -23.6, 3.6, 3.4);             // pom-pom
  ctx.fillStyle = 'rgba(160,170,180,0.5)'; ell(15, -22.8, 1.2, 1);
}

// A scarf wrapped round the neck, one end streaming behind. pattern(x0, x1, y0, y1) paints the cloth.
function drawScarf(base, pattern) {
  const t = st.anim || 0, w1 = Math.sin(t * 9) * 1.6, w2 = Math.sin(t * 9 + 1.3) * 2;
  ctx.save();                                                        // the tail, fluttering back
  ctx.beginPath(); ctx.moveTo(7, 0.5); ctx.quadraticCurveTo(-1, 2 + w1, -9, 1.5 + w2); ctx.lineTo(-9.5, 5.5 + w2);
  ctx.quadraticCurveTo(-1, 6 + w1, 7, 5); ctx.closePath();
  ctx.fillStyle = base; ctx.fill(); ctx.clip(); pattern(-12, 8, -1, 8 + Math.abs(w2));
  ctx.restore();
  ctx.fillStyle = '#f3f3ee';                                         // fringe
  for (let i = 0; i < 3; i++) ctx.fillRect(-11.5, 2 + w2 + i * 1.3, 2.2, 0.5);
  ctx.save();                                                        // wrapped round the neck
  ctx.beginPath(); ctx.moveTo(5.5, -0.2); ctx.quadraticCurveTo(14, 2.2, 21.5, -0.8); ctx.lineTo(22, 3.6);
  ctx.quadraticCurveTo(14, 7, 5, 4.4); ctx.closePath();
  ctx.fillStyle = base; ctx.fill(); ctx.clip(); pattern(4, 23, -1, 7);
  ctx.restore();
}
const drawTartanScarf = () => drawScarf(TARTAN.green, (x0, x1, y0, y1) => {   // Newfoundland tartan
  ctx.fillStyle = TARTAN.gold; ctx.fillRect(x0, y0 + (y1 - y0) * 0.35, x1 - x0, (y1 - y0) * 0.14);
  ctx.fillStyle = TARTAN.red; ctx.fillRect(x0, y0 + (y1 - y0) * 0.62, x1 - x0, (y1 - y0) * 0.1);
  ctx.fillStyle = TARTAN.white; for (let x = x0 + 1.5; x < x1; x += 4.2) ctx.fillRect(x, y0, 0.8, y1 - y0);
  ctx.fillStyle = TARTAN.brown; for (let x = x0 + 3.4; x < x1; x += 4.2) ctx.fillRect(x, y0, 0.6, y1 - y0);
});
const drawTricolourScarf = () => drawScarf('#f3f3ee', (x0, x1, y0, y1) => {  // the old Newfoundland pink, white and green
  const h = (y1 - y0) / 3;
  ctx.fillStyle = '#f19cbb'; ctx.fillRect(x0, y0, x1 - x0, h);
  ctx.fillStyle = '#3f8f4f'; ctx.fillRect(x0, y0 + 2 * h, x1 - x0, h + 1);
});

function drawSunglasses() {
  ctx.strokeStyle = '#11151b'; ctx.lineWidth = 0.9; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(15.4, -7.4); ctx.lineTo(6.5, -8.2); ctx.moveTo(20.8, -7.2); ctx.lineTo(22.3, -7.6); ctx.stroke();
  ctx.fillStyle = '#11151b';
  ctx.beginPath(); ctx.moveTo(15, -8.6); ctx.lineTo(21.4, -8.6); ctx.quadraticCurveTo(21.6, -4.2, 18.2, -4.2); ctx.quadraticCurveTo(15, -4.4, 15, -8.6); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 0.6;
  ctx.beginPath(); ctx.moveTo(16.4, -7.6); ctx.lineTo(18.2, -5.4); ctx.stroke();
}

function drawReadingGlasses() {                 // Nan's: round gold wire rims, and a chain so they're never lost
  ctx.strokeStyle = '#b88a2e'; ctx.lineWidth = 0.7; ctx.lineCap = 'round';
  ctx.fillStyle = 'rgba(220,235,245,0.35)';
  ctx.beginPath(); ctx.arc(18.4, -6.2, 2.9, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(15.5, -6.8); ctx.lineTo(7, -7.6); ctx.moveTo(21.3, -6.6); ctx.lineTo(22.4, -7.2); ctx.stroke();
  ctx.strokeStyle = 'rgba(184,138,46,0.8)'; ctx.lineWidth = 0.45; ctx.setLineDash([0.6, 0.7]);
  ctx.beginPath(); ctx.moveTo(7, -7.4); ctx.quadraticCurveTo(7, 2, 13, 2.2); ctx.stroke(); ctx.setLineDash([]);
  ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 0.5;
  ctx.beginPath(); ctx.arc(18.4, -6.2, 1.8, -2.4, -1.5); ctx.stroke();
}

function drawGoggles() {                        // ski goggles: a strap round the head and one big mirrored lens
  ctx.fillStyle = '#10233d';
  ctx.beginPath(); ctx.moveTo(4.8, -9.4); ctx.quadraticCurveTo(12, -10.8, 16, -9.6); ctx.lineTo(16, -6.4); ctx.quadraticCurveTo(12, -7.4, 5, -6.2); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#f94a18'; ctx.fillRect(5.5, -8.4, 10, 0.9);
  ctx.fillStyle = '#f7f8f6'; ell(18.8, -7.2, 4.4, 3.6);
  const g = ctx.createLinearGradient(15, -10, 22, -4);
  g.addColorStop(0, '#feb445'); g.addColorStop(0.5, '#f94a18'); g.addColorStop(1, '#7b4fa3');
  ctx.fillStyle = g; ell(18.9, -7.2, 3.5, 2.7);
  ctx.fillStyle = 'rgba(255,255,255,0.65)'; ell(17.6, -8.3, 1.2, 0.6, -0.4);
}

function drawPitcherCrown() {                   // a ring of pitcher plants, the provincial flower
  ctx.strokeStyle = '#4f7a3a'; ctx.lineWidth = 1.6; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(5, -12); ctx.quadraticCurveTo(14, -18.5, 23, -12); ctx.stroke();
  ctx.fillStyle = '#6f9a4a';
  for (const [x, y, r] of [[7, -14, -0.9], [11, -16.4, -0.4], [17, -16.4, 0.4], [21, -14, 0.9]]) ell(x, y, 1.1, 2.6, r);
  for (const [x, y] of [[8.5, -17], [14, -19.5], [19.5, -17]]) {
    ctx.strokeStyle = '#4f7a3a'; ctx.lineWidth = 0.7;
    ctx.beginPath(); ctx.moveTo(x, y + 2.5); ctx.lineTo(x, y); ctx.stroke();
    ctx.fillStyle = '#8e1b3a';                                       // nodding maroon flower
    ctx.beginPath(); ctx.moveTo(x - 3, y + 0.5); ctx.quadraticCurveTo(x, y - 3.6, x + 3, y + 0.5); ctx.quadraticCurveTo(x, y + 2, x - 3, y + 0.5); ctx.fill();
    ctx.fillStyle = '#c94a6a'; ell(x, y - 0.4, 1.3, 1);
    ctx.fillStyle = '#e3b23c'; ell(x, y + 1.1, 0.7, 0.5);
  }
}

function drawHorseshoe() {                      // a lucky horseshoe on a cord round the neck
  ctx.strokeStyle = '#6b4a2b'; ctx.lineWidth = 0.6;
  ctx.beginPath(); ctx.moveTo(8, 1.5); ctx.quadraticCurveTo(12.5, 7, 15, 6.2); ctx.quadraticCurveTo(18, 5.4, 20, 1.2); ctx.stroke();
  ctx.save(); ctx.translate(15, 8.2); ctx.rotate(Math.sin((st.anim || 0) * 5) * 0.15);
  ctx.strokeStyle = '#c9ced6'; ctx.lineWidth = 2; ctx.lineCap = 'butt';
  ctx.beginPath(); ctx.arc(0, 0, 3, Math.PI * 0.05, Math.PI * 0.95); ctx.stroke();       // open end up, to hold the luck in
  ctx.fillStyle = '#6e7885'; for (const a of [0.2, 0.38, 0.62, 0.8]) ell(Math.cos(Math.PI * a) * 3, Math.sin(Math.PI * a) * 3, 0.4, 0.4);
  ctx.restore();
}

function drawCaptainsCap() {                    // white top, navy band, black peak, gold anchor
  ctx.fillStyle = '#10233d';
  ctx.beginPath(); ctx.moveTo(5.5, -11.4); ctx.lineTo(6, -16); ctx.lineTo(22, -16); ctx.lineTo(22.5, -11.4); ctx.quadraticCurveTo(14, -13, 5.5, -11.4); ctx.fill();
  ctx.fillStyle = '#f7f8f6';
  ctx.beginPath(); ctx.moveTo(4, -15.5); ctx.quadraticCurveTo(13, -22.5, 25.5, -17.8); ctx.quadraticCurveTo(25, -15.4, 21.8, -15.2); ctx.lineTo(6, -15); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#c9d3dc'; ctx.lineWidth = 0.5;
  ctx.beginPath(); ctx.moveTo(6, -15.6); ctx.lineTo(22, -15.8); ctx.stroke();
  ctx.fillStyle = '#11151b';                                        // peak
  ctx.beginPath(); ctx.moveTo(19, -12); ctx.quadraticCurveTo(24, -12.6, 27.5, -10.6); ctx.quadraticCurveTo(23.5, -10.4, 19, -10.8); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#e3b23c'; ctx.lineWidth = 0.6;                 // anchor badge and cord
  ctx.beginPath(); ctx.moveTo(18.6, -15.2); ctx.lineTo(18.6, -12.3); ctx.moveTo(17.4, -14.6); ctx.lineTo(19.8, -14.6);
  ctx.moveTo(17.2, -13.2); ctx.quadraticCurveTo(18.6, -11.8, 20, -13.2); ctx.moveTo(7, -12.6); ctx.lineTo(19, -12.4); ctx.stroke();
}

function drawMummer() {                         // lace veil over the face and a patchwork hat: "Any mummers 'lowed in?"
  ctx.save();
  ctx.beginPath(); ctx.moveTo(3.5, -12); ctx.quadraticCurveTo(14, -18, 22.5, -12); ctx.lineTo(23.5, 1.5);
  ctx.quadraticCurveTo(18, 4.5, 14, 3.8); ctx.quadraticCurveTo(6, 5.2, 3.2, 2); ctx.closePath();
  ctx.fillStyle = 'rgba(246,242,232,0.93)'; ctx.fill(); ctx.clip();
  ctx.fillStyle = 'rgba(160,150,135,0.55)';                         // lace holes
  for (let y = -13; y < 4; y += 2.6) for (let x = 3 + ((y + 13) / 2.6 % 2) * 1.3; x < 24; x += 2.6) ell(x, y, 0.55, 0.55);
  ctx.fillStyle = '#10233d'; ell(18, -6.7, 1.6, 1.6);               // peeking eye
  ctx.restore();
  ctx.strokeStyle = 'rgba(160,150,135,0.8)'; ctx.lineWidth = 0.5;   // scalloped hem
  ctx.beginPath(); for (let x = 3.5; x < 23.5; x += 2.5) ctx.arc(x + 1.25, 2.4 + Math.sin(x) * 0.8, 1.25, Math.PI, 0, true); ctx.stroke();
  const patches = ['#dc362c', '#3b7dd8', '#feb445', '#2f9e6b', '#7b4fa3', '#f94a18'];   // patchwork hat
  ctx.save();
  ctx.beginPath(); ctx.moveTo(3, -11.5); ctx.quadraticCurveTo(5, -24, 14.5, -24); ctx.quadraticCurveTo(24, -24, 24.5, -11.5); ctx.closePath(); ctx.clip();
  for (let i = 0; i < 12; i++) { ctx.fillStyle = patches[i % patches.length]; ctx.fillRect(3 + (i % 4) * 5.5, -24 + Math.floor(i / 4) * 4.5, 5.5, 4.5); }
  ctx.restore();
  ctx.strokeStyle = 'rgba(16,35,61,0.35)'; ctx.lineWidth = 0.5;
  ctx.beginPath(); ctx.moveTo(3, -11.5); ctx.quadraticCurveTo(5, -24, 14.5, -24); ctx.quadraticCurveTo(24, -24, 24.5, -11.5); ctx.stroke();
  ctx.fillStyle = '#feb445'; ell(14.5, -25, 1.6, 1.6);
}

// Boots replace the feet: drawn by puffinFoot while they're worn (o.boot is the style)
function drawBoot(fx, fy, s, style) {
  const B = BOOTS[style] || BOOTS.rubber;
  ctx.fillStyle = B.body;
  ctx.beginPath(); ctx.moveTo(fx - 2.4 * s, fy + 1.9 * s); ctx.lineTo(fx - 2.2 * s, fy - B.tall * s); ctx.lineTo(fx + 1.8 * s, fy - B.tall * s);
  ctx.lineTo(fx + 2 * s, fy - 1.2 * s); ctx.quadraticCurveTo(fx + 6.8 * s, fy - 1, fx + 6.6 * s, fy + 1.9 * s); ctx.closePath(); ctx.fill();
  if (B.knit) {                                                       // ribbing, and a coloured toe
    ctx.strokeStyle = B.knit; ctx.lineWidth = 0.35 * s;
    ctx.beginPath(); for (let i = 0; i < 4; i++) { const x = fx - 1.6 * s + i * 0.95 * s; ctx.moveTo(x, fy - (B.tall - 0.4) * s); ctx.lineTo(x, fy - 0.5 * s); } ctx.stroke();
    ctx.fillStyle = B.toe; ctx.beginPath(); ctx.moveTo(fx + 3.6 * s, fy - 0.9 * s); ctx.quadraticCurveTo(fx + 6.8 * s, fy - 0.8, fx + 6.6 * s, fy + 1.9 * s); ctx.lineTo(fx + 3.4 * s, fy + 1.9 * s); ctx.closePath(); ctx.fill();
  }
  ctx.fillStyle = B.rim; ctx.fillRect(fx - 2.7 * s, fy - (B.tall + 1.2) * s, 5 * s, 1.8 * s);
  if (B.sole) { ctx.fillStyle = B.sole; ctx.fillRect(fx - 2.4 * s, fy + 1.3 * s, 9 * s, 0.7 * s); }
}
const BOOTS = {
  rubber: { body: '#1b1f26', rim: '#dc362c', sole: '#5a616c', tall: 5 },
  vamps: { body: '#e9e2d0', rim: '#b8282e', toe: '#b8282e', knit: 'rgba(120,105,80,0.45)', tall: 4 },
  yellow: { body: '#f2b134', rim: '#c98a14', sole: '#6b4a2b', tall: 6.5 }
};

const SLOTS = [
  { id: 'hat', name: 'Hats', label: 'New hat' },
  { id: 'glasses', name: 'Glasses', label: 'New glasses' },
  { id: 'neck', name: 'Scarves & necklaces', label: 'New for your neck' },
  { id: 'boots', name: 'Boots', label: 'New boots' },
  { id: 'feathers', name: 'Feathers', label: 'New feathers' }
];

const OUTFITS = [
  // hats
  { id: 'souwester', slot: 'hat', name: 'Sou\u2019wester', unlock: 'Finish Baccalieu Tickle.', has: s => s.done.includes('baccalieu-tickle'), draw: drawSouwester },
  { id: 'toque', slot: 'hat', name: 'Knitted toque', unlock: 'Finish Iceberg Alley.', has: s => s.done.includes('iceberg-alley'), draw: drawToque },
  { id: 'crown', slot: 'hat', name: 'Pitcher plant crown', unlock: 'Grow your puffling to full size in one run.', has: s => s.fullGrown, draw: drawPitcherCrown },
  { id: 'captain', slot: 'hat', name: 'Captain\u2019s cap', unlock: 'Finish Funk Island.', has: s => s.done.includes('funk-island'), draw: drawCaptainsCap },
  { id: 'mummer', slot: 'hat', name: 'Mummer', unlock: 'Finish all seven levels.', has: s => LEVELS.every(l => s.done.includes(l.id)), draw: drawMummer },
  // glasses
  { id: 'reading', slot: 'glasses', name: 'Nan\u2019s reading glasses', unlock: 'Finish How to play.', has: s => s.tutorial, draw: drawReadingGlasses },
  { id: 'shades', slot: 'glasses', name: 'Sunglasses', unlock: 'Score 5,000 on Trinity Bay.', has: () => bestFor(LEVELS.find(l => l.id === 'trinity-bay')) >= 5000, draw: drawSunglasses },
  { id: 'goggles', slot: 'glasses', name: 'Ski goggles', unlock: 'Make 100 deliveries in all.', has: s => s.deliveries >= 100, draw: drawGoggles },
  // scarves & necklaces
  { id: 'tricolour', slot: 'neck', name: 'Pink, white and green scarf', unlock: 'Finish Capelin Scull.', has: s => s.done.includes('capelin-scull'), draw: drawTricolourScarf },
  { id: 'tartan', slot: 'neck', name: 'Newfoundland tartan scarf', unlock: 'Deliver a full 12-fish stack.', has: s => s.bigDrop >= MAX_STACK, draw: drawTartanScarf },
  { id: 'horseshoe', slot: 'neck', name: 'Lucky horseshoe', unlock: 'Save your puffling at the last second 5 times.', has: s => s.saves >= 5, draw: drawHorseshoe },
  // boots
  { id: 'boots', slot: 'boots', name: 'Rubber boots', unlock: 'Deliver 250 capelin in all.', has: s => s.fish >= 250, boot: 'rubber' },
  { id: 'vamps', slot: 'boots', name: 'Knitted vamps', unlock: 'Play 20 runs.', has: s => s.runs >= 20, boot: 'vamps' },
  { id: 'fisherman', slot: 'boots', name: 'Fisherman\u2019s boots', unlock: 'Finish Cape St. Mary\u2019s.', has: s => s.done.includes('cape-st-marys'), boot: 'yellow' },
  // feathers
  { id: 'golden', slot: 'feathers', name: 'Golden puffin', unlock: 'Catch 50 golden capelin in all.', has: s => s.gold >= 50,
    colors: { back: '#b8862b', far: '#8f6519', face: '#fbf1d4', belly: '#fff6df' } }
];
const HEAD_ORDER = ['neck', 'glasses', 'hat'];     // drawn in this order, so a hat sits over glasses' arms

/* ---------- lifetime stats and what's unlocked (saved in the browser, like best scores) ---------- */
const STATS_KEY = 'capelin-run-stats', OUTFIT_KEY = 'capelin-run-outfit', SEEN_KEY = 'capelin-run-outfits-seen';

function loadStats() {
  let s = {};
  try { s = JSON.parse(store.get(STATS_KEY) || '{}') || {}; } catch (e) { s = {}; }
  const done = Array.isArray(s.done) ? s.done.slice() : [];
  // levels finished before outfits existed: every level below the unlocked one was finished
  for (const l of LEVELS.slice(0, unlockedUpTo())) if (!done.includes(l.id)) done.push(l.id);
  return { fish: s.fish || 0, gold: s.gold || 0, saves: s.saves || 0, bigDrop: s.bigDrop || 0, fullGrown: !!s.fullGrown,
    runs: s.runs || 0, deliveries: s.deliveries || 0, tutorial: tutorialDone(), done };
}

const outfitEarned = (o, s = loadStats()) => !!o.has(s);
const outfitOpen = (o, s) => UNLOCK_ALL || outfitEarned(o, s);

// Called at the end of every run (run is null after the tutorial). Returns items earned for the first time.
function recordRun(run, complete) {
  const s = loadStats();
  if (run) {
    s.runs++; s.deliveries += run.deliveries;
    s.fish += run.fishDelivered; s.gold += run.goldCaught; s.saves += run.saves;
    s.bigDrop = Math.max(s.bigDrop, run.bestDrop);
    s.fullGrown = s.fullGrown || run.fedFish >= GROW_FISH;
    if (complete && !s.done.includes(run.level.id)) s.done.push(run.level.id);
  }
  const { tutorial, ...keep } = s;
  store.set(STATS_KEY, JSON.stringify(keep));
  let seen = [];
  try { seen = JSON.parse(store.get(SEEN_KEY) || '[]') || []; } catch (e) { seen = []; }
  const fresh = OUTFITS.filter(o => !seen.includes(o.id) && outfitEarned(o, s));
  if (fresh.length) store.set(SEEN_KEY, JSON.stringify(seen.concat(fresh.map(o => o.id))));
  return fresh;
}

// What's worn: one item id per slot. (Before slots, a single outfit id was stored; it moves to its slot.)
function wornIds() {
  const raw = store.get(OUTFIT_KEY);
  let ids = {};
  try { ids = JSON.parse(raw || '{}') || {}; } catch (e) { const o = OUTFITS.find(x => x.id === raw); if (o) ids = { [o.slot]: o.id }; }
  return typeof ids === 'object' ? ids : {};
}
// The items worn right now, skipping any that aren't unlocked
function wornLook() {
  const ids = wornIds(), stats = loadStats();
  return SLOTS.map(sl => OUTFITS.find(o => o.id === ids[sl.id] && o.slot === sl.id)).filter(o => o && outfitOpen(o, stats));
}
const isWorn = o => wornIds()[o.slot] === o.id;
function wearOutfit(id) {
  const o = OUTFITS.find(x => x.id === id); if (!o) return;
  store.set(OUTFIT_KEY, JSON.stringify({ ...wornIds(), [o.slot]: o.id }));
}
function takeOff(slot) {
  const ids = wornIds(); delete ids[slot];
  store.set(OUTFIT_KEY, JSON.stringify(ids));
}

/* ---------- drawing outfits on small canvases (wardrobe, unlock card) ---------- */
let outfitLayer = null;                              // the puffin is drawn here first, so a locked one can be a silhouette
// A standing puffin, wearing the outfit, optionally on a little rock by the sea.
// look: the items to wear. opts.focus zooms in on the 'head' or 'feet' for small tiles.
function drawOutfitCard(cv, look, opts = {}) {
  const r = cv.getBoundingClientRect();
  const w = r.width || 60, h = r.height || 60, d = Math.min(window.devicePixelRatio || 1, 2);
  const W2 = Math.round(w * d), H2 = Math.round(h * d);
  if (cv.width !== W2 || cv.height !== H2) { cv.width = W2; cv.height = H2; }
  if (!outfitLayer) outfitLayer = document.createElement('canvas');
  if (outfitLayer.width !== W2 || outfitLayer.height !== H2) { outfitLayer.width = W2; outfitLayer.height = H2; }
  const keep = ctx;
  try {
    ctx = outfitLayer.getContext('2d');
    ctx.setTransform(d, 0, 0, d, 0, 0); ctx.clearRect(0, 0, w, h);
    // a standing puffin in a tall hat is about 58 units from pom-pom to toes
    const bob = opts.t ? Math.sin(opts.t * 2.2) * 0.6 : 0;
    let x, y, sc;
    // head and hat span about x -8..23, y -35..-5 around the standing puffin's origin; boots about y 10..20
    if (opts.focus === 'head') { sc = h / 44; x = w / 2 - 6 * sc; y = h / 2 + 17 * sc; }
    else if (opts.focus === 'feet') { sc = h / 26; x = w / 2 + 1 * sc; y = h / 2 - 14 * sc; }
    else { const feetY = opts.scene ? h * 0.76 : h * 0.93; sc = opts.scale || (feetY - 4) / 60; x = w * 0.44; y = feetY - 18.2 * sc; }
    drawPuffin(x, y + bob, sc, UPRIGHT, { stand: 1, look, beak: [] });
    if (opts.locked) {
      ctx.globalCompositeOperation = 'source-atop';
      ctx.fillStyle = 'rgba(138,147,159,0.95)'; ctx.fillRect(0, 0, w, h);   // greyed out
      ctx.globalCompositeOperation = 'source-over';
    }
    ctx = cv.getContext('2d');
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, W2, H2);
    if (opts.scene) {                                   // sky, sea and a rock to stand on
      ctx.setTransform(d, 0, 0, d, 0, 0);
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, '#6aa6d8'); g.addColorStop(0.62, '#cfe6f2'); g.addColorStop(0.62, '#3b86b5'); g.addColorStop(1, '#10385a');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#4a5866';
      ctx.beginPath(); ctx.moveTo(w * 0.22, h); ctx.lineTo(w * 0.3, h * 0.78); ctx.quadraticCurveTo(w * 0.5, h * 0.72, w * 0.72, h * 0.79); ctx.lineTo(w * 0.8, h); ctx.fill();
      ctx.fillStyle = '#7fae63'; ctx.fillRect(w * 0.29, h * 0.75, w * 0.44, 3);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
    ctx.drawImage(outfitLayer, 0, 0);
  } finally { ctx = keep; }
}
