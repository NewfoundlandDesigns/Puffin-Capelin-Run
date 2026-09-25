/* Outfits: looks only, earned by playing, one worn at a time. None of them changes how the
   puffin plays. Each has an unlock test on lifetime stats, and draws in the head's own
   coordinates (head centre 14,-6, radius about 9, bill pointing right), so it follows the puffin
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

function drawTartanScarf() {                    // Newfoundland tartan, one end streaming behind
  const t = st.anim || 0, w1 = Math.sin(t * 9) * 1.6, w2 = Math.sin(t * 9 + 1.3) * 2;
  const stripes = (x0, x1, y0, y1) => {
    ctx.fillStyle = TARTAN.gold; ctx.fillRect(x0, y0 + (y1 - y0) * 0.35, x1 - x0, (y1 - y0) * 0.14);
    ctx.fillStyle = TARTAN.red; ctx.fillRect(x0, y0 + (y1 - y0) * 0.62, x1 - x0, (y1 - y0) * 0.1);
    ctx.fillStyle = TARTAN.white;
    for (let x = x0 + 1.5; x < x1; x += 4.2) ctx.fillRect(x, y0, 0.8, y1 - y0);
    ctx.fillStyle = TARTAN.brown;
    for (let x = x0 + 3.4; x < x1; x += 4.2) ctx.fillRect(x, y0, 0.6, y1 - y0);
  };
  ctx.save();                                                        // the tail, fluttering back
  ctx.beginPath(); ctx.moveTo(7, 0.5); ctx.quadraticCurveTo(-1, 2 + w1, -9, 1.5 + w2); ctx.lineTo(-9.5, 5.5 + w2);
  ctx.quadraticCurveTo(-1, 6 + w1, 7, 5); ctx.closePath();
  ctx.fillStyle = TARTAN.green; ctx.fill(); ctx.clip(); stripes(-12, 8, 0, 7 + Math.abs(w2));
  ctx.restore();
  ctx.fillStyle = TARTAN.white;                                      // fringe
  for (let i = 0; i < 3; i++) ctx.fillRect(-11.5, 2 + w2 + i * 1.3, 2.2, 0.5);
  ctx.save();                                                        // wrapped round the neck
  ctx.beginPath(); ctx.moveTo(5.5, -0.2); ctx.quadraticCurveTo(14, 2.2, 21.5, -0.8); ctx.lineTo(22, 3.6);
  ctx.quadraticCurveTo(14, 7, 5, 4.4); ctx.closePath();
  ctx.fillStyle = TARTAN.green; ctx.fill(); ctx.clip(); stripes(4, 23, -1, 7);
  ctx.restore();
}

function drawSunglasses() {
  ctx.strokeStyle = '#11151b'; ctx.lineWidth = 0.9; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(15.4, -7.4); ctx.lineTo(6.5, -8.2); ctx.moveTo(20.8, -7.2); ctx.lineTo(22.3, -7.6); ctx.stroke();
  ctx.fillStyle = '#11151b';
  ctx.beginPath(); ctx.moveTo(15, -8.6); ctx.lineTo(21.4, -8.6); ctx.quadraticCurveTo(21.6, -4.2, 18.2, -4.2); ctx.quadraticCurveTo(15, -4.4, 15, -8.6); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 0.6;
  ctx.beginPath(); ctx.moveTo(16.4, -7.6); ctx.lineTo(18.2, -5.4); ctx.stroke();
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

// Rubber boots replace the feet: drawn by puffinFoot while they're worn
function drawBoot(fx, fy, s) {
  ctx.fillStyle = '#1b1f26';
  ctx.beginPath(); ctx.moveTo(fx - 2.4 * s, fy + 1.9 * s); ctx.lineTo(fx - 2.2 * s, fy - 5 * s); ctx.lineTo(fx + 1.8 * s, fy - 5 * s);
  ctx.lineTo(fx + 2 * s, fy - 1.2 * s); ctx.quadraticCurveTo(fx + 6.8 * s, fy - 1, fx + 6.6 * s, fy + 1.9 * s); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#dc362c'; ctx.fillRect(fx - 2.7 * s, fy - 6.2 * s, 5 * s, 1.8 * s);
  ctx.fillStyle = '#5a616c'; ctx.fillRect(fx - 2.4 * s, fy + 1.4 * s, 9 * s, 0.6 * s);
}

const OUTFITS = [
  { id: 'none', name: 'Just a puffin', unlock: 'Always yours.', has: () => true },
  { id: 'souwester', name: 'Sou’wester', unlock: 'Finish Baccalieu Tickle.', has: s => s.done.includes('baccalieu-tickle'), head: drawSouwester },
  { id: 'toque', name: 'Knitted toque', unlock: 'Finish Iceberg Alley.', has: s => s.done.includes('iceberg-alley'), head: drawToque },
  { id: 'tartan', name: 'Newfoundland tartan scarf', unlock: 'Deliver a full 12-fish stack.', has: s => s.bigDrop >= MAX_STACK, head: drawTartanScarf },
  { id: 'boots', name: 'Rubber boots', unlock: 'Deliver 250 capelin in all.', has: s => s.fish >= 250, boots: true },
  { id: 'shades', name: 'Sunglasses', unlock: 'Score 5,000 on Trinity Bay.', has: () => bestFor(LEVELS.find(l => l.id === 'trinity-bay')) >= 5000, head: drawSunglasses },
  { id: 'crown', name: 'Pitcher plant crown', unlock: 'Grow your puffling to full size in one run.', has: s => s.fullGrown, head: drawPitcherCrown },
  { id: 'horseshoe', name: 'Lucky horseshoe', unlock: 'Save your puffling at the last second 5 times.', has: s => s.saves >= 5, head: drawHorseshoe },
  { id: 'captain', name: 'Captain’s cap', unlock: 'Finish Funk Island.', has: s => s.done.includes('funk-island'), head: drawCaptainsCap },
  { id: 'golden', name: 'Golden puffin', unlock: 'Catch 50 golden capelin in all.', has: s => s.gold >= 50,
    colors: { back: '#b8862b', far: '#8f6519', face: '#fbf1d4', belly: '#fff6df' } },
  { id: 'mummer', name: 'Mummer', unlock: 'Finish all seven levels.', has: s => LEVELS.every(l => s.done.includes(l.id)), head: drawMummer }
];

/* ---------- lifetime stats and what's unlocked (saved in the browser, like best scores) ---------- */
const STATS_KEY = 'capelin-run-stats', OUTFIT_KEY = 'capelin-run-outfit', SEEN_KEY = 'capelin-run-outfits-seen';

function loadStats() {
  let s = {};
  try { s = JSON.parse(store.get(STATS_KEY) || '{}') || {}; } catch (e) { s = {}; }
  const done = Array.isArray(s.done) ? s.done.slice() : [];
  // levels finished before outfits existed: every level below the unlocked one was finished
  for (const l of LEVELS.slice(0, unlockedUpTo())) if (!done.includes(l.id)) done.push(l.id);
  return { fish: s.fish || 0, gold: s.gold || 0, saves: s.saves || 0, bigDrop: s.bigDrop || 0, fullGrown: !!s.fullGrown, done };
}

const outfitEarned = (o, s = loadStats()) => !!o.has(s);
const outfitOpen = (o, s) => UNLOCK_ALL || store.get('capelin-run-outfits-all') === '1' || outfitEarned(o, s);

// Called at the end of every run. Returns outfits earned for the first time.
function recordRun(run, complete) {
  const s = loadStats();
  s.fish += run.fishDelivered; s.gold += run.goldCaught; s.saves += run.saves;
  s.bigDrop = Math.max(s.bigDrop, run.bestDrop);
  s.fullGrown = s.fullGrown || run.fedFish >= GROW_FISH;
  if (complete && !s.done.includes(run.level.id)) s.done.push(run.level.id);
  store.set(STATS_KEY, JSON.stringify(s));
  let seen = [];
  try { seen = JSON.parse(store.get(SEEN_KEY) || '[]') || []; } catch (e) { seen = []; }
  const fresh = OUTFITS.filter(o => o.id !== 'none' && !seen.includes(o.id) && outfitEarned(o, s));
  if (fresh.length) store.set(SEEN_KEY, JSON.stringify(seen.concat(fresh.map(o => o.id))));
  return fresh;
}

function wornOutfit() {
  const o = OUTFITS.find(x => x.id === store.get(OUTFIT_KEY));
  return o && o.id !== 'none' && outfitOpen(o) ? o : null;
}
function wearOutfit(id) { store.set(OUTFIT_KEY, id); }

/* ---------- drawing outfits on small canvases (wardrobe, unlock card) ---------- */
let outfitLayer = null;                              // the puffin is drawn here first, so a locked one can be a silhouette
// A standing puffin, wearing the outfit, optionally on a little rock by the sea.
function drawOutfitCard(cv, o, opts = {}) {
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
    const feetY = opts.scene ? h * 0.76 : h * 0.93, sc = opts.scale || (feetY - 4) / 60, bob = opts.t ? Math.sin(opts.t * 2.2) * 0.6 : 0;
    drawPuffin(w * 0.44, feetY - 18.2 * sc + bob, sc, UPRIGHT, { stand: 1, outfit: o.id === 'none' ? null : o, beak: [] });
    if (opts.locked) {
      ctx.globalCompositeOperation = 'source-atop';
      ctx.fillStyle = 'rgba(40,52,70,0.92)'; ctx.fillRect(0, 0, w, h);
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
