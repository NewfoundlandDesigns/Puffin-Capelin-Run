// Headless smoke test. Builds the game, runs the bundled script against stubbed DOM and
// canvas, and plays through key scenarios. Usage: node tools/smoke-test.mjs
// Exit code is non-zero if anything fails.
import { T, els, frame, key, ended, SEA, winHandlers } from './harness.mjs';

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

// 2b. Outfits: finishing every level is recorded, and earns the level outfits and the mummer
const noRun = { level: T.LEVELS[0], deliveries: 0, fishDelivered: 0, goldCaught: 0, saves: 0, bestDrop: 0, fedFish: 0 };
{
  const stats = T.loadStats(), earned = id => T.outfitEarned(T.OUTFITS.find(o => o.id === id), stats);
  check('finished levels are recorded', T.LEVELS.every(l => stats.done.includes(l.id)), stats.done.join(', '));
  check('level outfits unlock', ['tricolour', 'souwester', 'fisherman', 'toque', 'captain', 'mummer'].every(earned));
  check('stat outfits stay locked until earned', !earned('boots') && !earned('golden') && !earned('horseshoe') && !earned('reading'));
  check('an outfit is only announced once', T.recordRun(noRun, true).length === 0);
  const got = T.recordRun({ ...noRun, fishDelivered: 300, bestDrop: 12, deliveries: 100 }, false);
  check('lifetime totals unlock outfits', got.map(o => o.id).sort().join() === 'boots,goggles,tartan', got.map(o => o.id).join());
}
// 2c. One of each slot, and every item draws in flight, underwater, landing and standing
{
  let ok = true;
  for (const o of T.OUTFITS) {
    T.wearOutfit(o.id);
    try {
      T.start(0); quiet(T.st); T.st.p.inv = 99;
      for (let f = 0; f < 5; f++) frame();
      T.st.p.y = SEA + 80; frame();
      T.st.beak = [false, true]; T.deliver({ x: 400, w: 160, top: 130, used: false }); frame();
    } catch (e) { ok = false; console.log('  ', o.id, e.message); }
  }
  check('every outfit draws in every pose', ok);
  const look = T.wornLook();
  check('one of each slot is worn at once', look.length === T.SLOTS.length && T.SLOTS.every(sl => look.some(o => o.slot === sl.id)), look.map(o => o.id).join());
  T.wearOutfit('souwester');
  check('wearing a hat swaps the hat only', T.wornIds().hat === 'souwester' && T.wornLook().length === T.SLOTS.length);
  T.takeOff('hat');
  check('taking off a hat leaves the rest', !T.wornIds().hat && T.wornLook().length === T.SLOTS.length - 1);
  localStorage.setItem('capelin-run-outfit', 'captain');             // saved before slots existed
  check('an outfit saved before slots still works', T.wornIds().hat === 'captain');
  for (const sl of T.SLOTS) T.takeOff(sl.id);
}
// 2d. The wardrobe shows a row per slot with a "none" tile, and closes back to the level picker
els.wardBtn.onclick();
const rows = els.wardSlots.children;
check('wardrobe shows a row per slot', !els.wardPanel.hidden && rows.length === T.SLOTS.length);
check('each row has none plus its items', T.SLOTS.every((sl, i) => rows[i].children[1].children.length === 1 + T.OUTFITS.filter(o => o.slot === sl.id).length));
els.wardDone.onclick();
check('wardrobe closes to the level picker', els.wardPanel.hidden && !els.startPanel.hidden);

// 2e. Pause: P freezes the run, Space resumes, and Choose level quits to the picker
T.start(0); quiet(T.st); T.st.p.inv = 99;
for (let f = 0; f < 10; f++) frame();
key('KeyP'); key('KeyP', false);
const distAtPause = T.st.dist;
for (let f = 0; f < 60; f++) frame();
check('P pauses the run', !els.pausePanel.hidden && T.st.dist === distAtPause);
key('Space'); key('Space', false);
for (let f = 0; f < 10; f++) frame();
check('Space resumes it', els.pausePanel.hidden && T.st.dist > distAtPause);
winHandlers.blur();
check('losing focus pauses it', !els.pausePanel.hidden);
els.quitBtn.onclick();
check('quitting from pause goes to the level picker', !T.running && els.pausePanel.hidden && !els.startPanel.hidden);

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
function gannetTrial(y, yAfterLock = y) {
  T.start(gannetIdx); quiet(T.st); T.st.tGannet = 999; T.st.fish = []; T.st.tFish = 999;
  T.st.p.inv = 0; T.st.beak = [false, false, false];
  frame();                                              // puffin settles at its usual x
  T.spawnGannet();
  const g = T.st.gannets[0];
  for (let f = 0; f < 60 * 5 && T.st.gannets.length; f++) {
    const target = g.state === 'stalk' ? y : yAfterLock;
    const p = T.st.p;
    p.y += clamp(target - p.y, -5.5, 5.5); p.vy = 0; p.breath = 1;   // about the puffin's top speed
    if (T.st.beak.length < 3) return 'hit';
    frame();
  }
  return T.st.beak.length < 3 ? 'hit' : 'safe';
}
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const trials = n => Array.from({ length: n }, (_, i) => i);
check('gannet hits a puffin that stays at its depth (air)', trials(5).every(() => gannetTrial(SEA - 70) === 'hit'));
check('gannet hits a puffin that stays at its depth (underwater)', trials(5).every(() => gannetTrial(SEA + 60) === 'hit'));
check('gannet reaches a puffin flying high', trials(5).every(() => gannetTrial(60) === 'hit'));
check('changing depth after it locks on dodges it', trials(5).every(() => gannetTrial(SEA + 70, SEA - 70) === 'safe'));
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
check('tutorial completes', els.endTitle.textContent === 'You\u2019re ready', els.endTitle.textContent);
check('finishing the tutorial earns the reading glasses', els.unlockName.textContent.includes('reading glasses'), els.unlockName.textContent);

// 4b. Stars: finish, feed (never running out of food, all the way home), score; kept once earned
{
  const { resetStore } = await import('./harness.mjs');
  resetStore();
  const lv = T.LEVELS[0], run = extra => ({ level: lv, score: 0, minHunger: 0.5, ...extra });
  let r = T.recordStars(run({}), true);
  check('finishing well earns finish and feed', r.after === 3, `bits ${r.after}`);
  resetStore();
  r = T.recordStars(run({ minHunger: 0 }), true);
  check('running out of food loses the feed star', r.after === 1, `bits ${r.after}`);
  r = T.recordStars(run({ minHunger: 0, score: lv.starScore }), false);
  check('the score star counts on any run, and stars are kept', r.after === 5 && r.before === 1, `bits ${r.before} -> ${r.after}`);
  r = T.recordStars(run({ minHunger: 0 }), false);
  check('a worse run takes nothing away', r.after === 5);
  resetStore();
  localStorage.setItem('capelin-run-unlocked', '3');                 // finished levels 1-3 before stars existed
  localStorage.setItem('capelin-run-best-' + T.LEVELS[1].id, String(T.LEVELS[1].starScore));
  check('old progress counts: finished levels and best scores', T.totalStars() === 4 && T.starsFor(T.LEVELS[1]) === 5, `total ${T.totalStars()}`);
  // star outfits unlock at 5, 10, 15 and every star
  resetStore();
  const bits = {}; T.LEVELS.slice(0, 2).forEach(l => { bits[l.id] = 7; });
  localStorage.setItem('capelin-run-stars', JSON.stringify(bits));
  const earned = id => T.outfitEarned(T.OUTFITS.find(o => o.id === id));
  check('5 stars earns the star glasses, not the medal', earned('starglasses') && !earned('medal'));
  T.LEVELS.forEach(l => { bits[l.id] = 7; }); localStorage.setItem('capelin-run-stars', JSON.stringify(bits));
  check('every star earns the medal, aurora and golden crown', ['medal', 'aurora', 'goldcrown'].every(earned) && T.totalStars() === T.maxStars());
  resetStore();
}
// 4c. A real run records its stars and shows them on the end screen
T.start(0); quiet(T.st);
for (let f = 0; f < 60 * 200 && !ended(); f++) { T.st.p.inv = Math.max(T.st.p.inv, 2); T.st.hunger = 1; frame(); }
check('a level finished well shows two stars at the end', els.endStars.children.length === 3 && !els.endStars.hidden && T.starsFor(T.LEVELS[0]) & 3, `bits ${T.starsFor(T.LEVELS[0])}`);

// 4d. Instant retry: a plain loss gets the compact card; tap anywhere (after a moment) or Space goes again
{
  const { resetStore } = await import('./harness.mjs');
  resetStore();
  const tap = () => els.stage.onpointerdown({ target: { closest: () => null }, preventDefault() {} });
  const loseAt = progress => {
    T.start(0); quiet(T.st); T.st.p.inv = 99;
    for (let f = 0; f < 5; f++) frame();
    T.st.dist = progress * 23700; T.st.progress = progress; T.st.hunger = 0.0001; T.st.starving = 0.01;
    for (let f = 0; f < 60 * 4 && !ended(); f++) frame();
  };
  loseAt(0.3);
  check('a plain loss shows the compact try-again card', ended() && els.endPanel.classList.contains('quick') && !els.retryHint.hidden);
  check('it counts attempts', /Attempt 1$/.test(els.endLevel.textContent), els.endLevel.textContent);
  tap();
  check('a tap the moment the card appears is ignored', ended() && !T.running);
  for (let f = 0; f < 40; f++) frame();
  tap();
  check('a tap after that goes straight back in', T.running && els.endPanel.hidden);
  loseAt(0.5);
  check('best distance is saved', /farthest yet/.test(els.farText.textContent), els.farText.textContent);
  for (let f = 0; f < 40; f++) frame();
  key('Space'); key('Space', false);
  check('Space also goes straight back in', T.running && /Attempt 3$/.test(els.endLevel.textContent));
  loseAt(0.2);
  check('a worse run shows your best to beat', els.farText.textContent.includes('best 50%'), els.farText.textContent);
  // a loss that earns something new still shows the full results
  T.start(0); quiet(T.st); T.st.p.inv = 99; for (let f = 0; f < 5; f++) frame();
  T.st.score = T.LEVELS[0].starScore; T.st.hunger = 0.0001; T.st.starving = 0.01;
  for (let f = 0; f < 60 * 4 && !ended(); f++) frame();
  check('a loss that earns a star shows the full results', ended() && !els.endPanel.classList.contains('quick') && els.retryHint.hidden);
  resetStore();
}

// 5. French: every English text has a French version, all game data is translated, and a run
//    played in French shows French
{
  const keys = l => Object.keys(T.TEXT[l]).sort().join();
  check('French has every English text, and no extras', keys('en') === keys('fr'));
  const holes = v => (typeof v === 'string' ? (v.match(/\{\w+\}/g) || []).sort().join() : 'fn');
  const bad = Object.keys(T.TEXT.en).filter(k => holes(T.TEXT.en[k]) !== holes(T.TEXT.fr[k]) && typeof T.TEXT.en[k] === typeof T.TEXT.fr[k]);
  check('French fills in the same names and numbers', bad.length === 0, bad.join(', '));
  const fr = T.DATA.fr;
  check('every level is translated', T.LEVELS.every(l => fr.level[l.id] && fr.level[l.id].name && fr.level[l.id].blurb));
  check('every tutorial card is translated', T.TUT_STEPS.every((st, i) => fr.tutorial[i] && fr.tutorial[i].title && fr.tutorial[i].text && (!st.hint || fr.tutorial[i].hint)));
  check('every outfit and slot is translated', T.OUTFITS.every(o => fr.outfit[o.id] && fr.outfit[o.id].name && fr.outfit[o.id].unlock) && T.SLOTS.every(sl => fr.slot[sl.id]));
  T.setLang('fr');
  T.start(0); T.st.p.inv = 0; quiet(T.st); T.st.tSeal = 0.1;
  for (let f = 0; f < 60 * 30 && !ended(); f++) { T.st.p.y = SEA + 100; T.st.p.vy = 0; T.st.p.breath = 1; frame(); }
  const frEnds = ['end.seal', 'end.hungry', 'end.gull', 'end.whale', 'end.home'].map(k => T.TEXT.fr[k]);
  check('a run in French ends in French', frEnds.includes(els.endTitle.textContent) && els.endLevel.textContent.startsWith('Niveau 1'), els.endTitle.textContent + ' / ' + els.endLevel.textContent);
  const shown = ['endTitle', 'endLevel', 'endStats', 'endBest', 'pvNum', 'pvName', 'pvBlurb', 'playBtn'].map(id => els[id].textContent);
  check('no untranslated keys show', shown.every(x => !/^[a-z]+\.[a-zA-Z]+$/.test(x)), shown.join(' | '));
  check('French numbers use a space for thousands', T.t('picker.best', { score: (12345).toLocaleString('fr-CA') }).includes('12\u00a0345') || T.t('picker.best', { score: (12345).toLocaleString('fr-CA') }).includes('12\u202f345'));
  T.setLang('en');
  check('switching back to English', T.t('end.home') === 'Home by nightfall');
}

const failed = results.filter(r => !r).length;
console.log(failed ? `\n${failed} failed` : `\nAll ${results.length} passed`);
process.exit(failed ? 1 : 0);
