/* Stars: three per level, each for a different skill, the same three on every level.
     1  Finish: make it home by nightfall.
     2  Feed: make it home without your puffling's meter ever running out (no last chance needed).
        Measured with tools/balance.mjs: staying out of the red was nearly impossible, this is a
        fair stretch.
     3  Score: reach the level's starScore on any run.
   Each star is kept once earned. Progress from before stars existed counts: a finished level
   has star 1, and a best score at or above the target has star 3. Stars also unlock outfits. */
const STARS_KEY = 'capelin-run-stars';
const STAR_BITS = [1, 2, 4];

function loadStarBits() {
  try { return JSON.parse(store.get(STARS_KEY) || '{}') || {}; } catch (e) { return {}; }
}
// The stars earned on a level, as a bit mask (1 finish, 2 feed, 4 score)
function starsFor(lv, stats = loadStats(), saved = loadStarBits()) {
  let b = saved[lv.id] || 0;
  if (stats.done.includes(lv.id)) b |= 1;
  if (lv.starScore && bestFor(lv) >= lv.starScore) b |= 4;
  return b;
}
const starCount = b => STAR_BITS.filter(x => b & x).length;
const totalStars = (stats = loadStats()) => { const saved = loadStarBits(); return LEVELS.reduce((n, lv) => n + starCount(starsFor(lv, stats, saved)), 0); };
const maxStars = () => LEVELS.length * 3;

// Called at the end of a run, before outfits are checked, so stars can unlock them.
// Returns what this level had before and has now.
function recordStars(run, complete) {
  const lv = run.level, before = starsFor(lv);
  let got = 0;
  if (complete) got |= 1;
  if (complete && run.minHunger > 0) got |= 2;
  if (lv.starScore && run.score >= lv.starScore) got |= 4;
  const saved = loadStarBits();
  saved[lv.id] = (saved[lv.id] || 0) | before | got;
  store.set(STARS_KEY, JSON.stringify(saved));
  return { before, after: saved[lv.id] };
}

// Three stars as inline SVG, lit (amber) or empty (outline)
const STAR_PATH = 'M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3 6.1 20.6l1.3-6.6-4.9-4.6 6.6-.8z';
const starSvg = lit => `<svg class="star${lit ? ' lit' : ''}" viewBox="0 0 24 24" aria-hidden="true"><path d="${STAR_PATH}"/></svg>`;
