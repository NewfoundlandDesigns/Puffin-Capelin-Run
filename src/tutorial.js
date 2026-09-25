/* How to play: a safe, guided practice run. No dangers and no finish line. A card at the
   top teaches one thing at a time and moves on when you've done it (or after a few
   seconds for the ones you just need to read). */
const TUTORIAL_LEVEL = {
  id: 'tutorial', name: 'How to play', scene: 'coast',
  gullEvery: [9999, 9999], seals: null, hunters: null, hungerSeconds: 45
};
const TUT_KEY = 'fun-puffin-tutorial-done';

const TUT_STEPS = [
  { title: 'Hold to dive',
    text: 'Press and hold anywhere on the screen, or the space bar. Your puffin dives into the sea.',
    done: s => s.p.y > SEA + 60 },
  { title: 'Let go to rise',
    text: 'Let go and your puffin swims back up and flies. Hold and let go to steer up and down.',
    done: s => s.p.y < SEA - 40 },
  { title: 'Catch capelin',
    text: 'Swim into a school of capelin. Every fish you catch stacks up in your beak. Catch three.',
    hint: 'The bar over your head is your air. Come up before it runs out.',
    fish: 2.2,
    done: s => stackN() >= 3 },
  { title: 'Deliver to a burrow',
    text: 'Fly up level with the burrow on the sea stack. Your puffin lands and drops the fish in.',
    stacks: true, fish: 3.5,
    done: s => s.deliveries >= 1 && !s.landing },
  { title: 'Keep your puffling fed',
    text: 'Every delivery fills the puffling meter at the top right. If it runs out, the run is over, so keep delivering.',
    glow: 'hunger', read: 6, hungerOn: true },
  { title: 'Bigger stacks score more',
    text: 'Each extra fish in a stack is worth more than the last. Golden capelin multiply a delivery. Catch the golden one.',
    fish: 3, golden: 4, stacks: true,
    done: (s, T) => s.goldCaught > 0 || T.t > 16 },
  { title: 'Watch out',
    text: 'Seals end the run and gulls knock your stack loose. Every level adds one new danger, and its preview shows you what to expect.',
    read: 7 },
  { title: 'Make it home by nightfall',
    text: 'The bar at the top shows how far you have to go as day turns to night. Reach the end and land at the home colony.',
    glow: 'progress', read: 6, sky: true }
];

function tutorialDone() { return store.get(TUT_KEY) === '1'; }

function startTutorial() {
  Snd.init(); Snd.start(); Snd.setUnder(false);
  st = newState(0, -1, TUTORIAL_LEVEL);
  st.tutorial = { step: 0, t: 0, fishT: 0, goldT: 1, stackT: 0, cleared: 0 };
  running = true; holding = false;
  startPanel.hidden = true; endPanel.hidden = true; hud.hidden = false;
  if (document.activeElement && document.activeElement !== muteBtn) document.activeElement.blur();
  showTutStep();
  updateHud();
}

function showTutStep() {
  const T = st.tutorial, step = TUT_STEPS[T.step];
  tut.hidden = false;
  tutStep.textContent = `Step ${T.step + 1} of ${TUT_STEPS.length}`;
  tutTitle.textContent = step.title;
  tutText.textContent = step.text;
  tutHint.hidden = true;
  tutTimer.parentElement.hidden = !step.read;
  tutTimer.style.width = '0%';
  tutCard.classList.remove('enter'); void tutCard.offsetWidth; tutCard.classList.add('enter');
  hunger.classList.toggle('glow', step.glow === 'hunger');
  hud.querySelector('.progress').classList.toggle('glow', step.glow === 'progress');
  hud.classList.toggle('no-progress', !step.sky);
}

// Called every frame from update() during the tutorial
function updateTutorial(dt) {
  const s = st, T = s.tutorial, step = TUT_STEPS[T.step], p = s.p;
  T.t += dt;
  if (step.hungerOn) T.hungerOn = true;

  // spawn what this step needs
  if (step.fish) {
    T.fishT -= dt;
    if (T.fishT <= 0 && s.fish.filter(f => f.x > p.x).length < 4) {
      const y0 = step.stacks ? rand(SEA + 50, SEA + 110) : rand(SEA + 60, SEA + 130), vx = -(s.speed - 35);
      for (let k = 0; k < 5; k++) s.fish.push({ x: VW + 30 + k * 22, y: y0 + rand(-14, 14), vx, ph: rand(0, 6.28), amp: 10, gold: false });
      T.fishT = step.fish;
    }
  }
  if (step.golden) {
    T.goldT -= dt;
    if (T.goldT <= 0 && !s.fish.some(f => f.gold)) { spawnGolden(); T.goldT = step.golden; }
  }
  if (step.stacks) {
    T.stackT -= dt;
    const waiting = s.cliffs.some(c => !c.used && c.x + c.w > p.x);
    if (T.stackT <= 0 && !waiting && stackN() > 0) {
      s.cliffs.push({ x: VW + 60, w: 160, top: 150, used: false });
      T.stackT = 3;
    }
  }
  tutHint.hidden = !(step.hint && p.y > SEA + 6);
  if (step.sky) s.progress = lerp(0.12, 1, easeInOut(clamp(T.t / step.read, 0, 1)));   // day to night, quickly
  if (step.read) tutTimer.style.width = Math.min(100, (T.t / step.read) * 100) + '%';

  // move on when it's done (a short pause first, so the success registers)
  const finished = step.read ? T.t >= step.read : step.done(s, T);
  if (finished) {
    T.cleared += dt;
    if (T.cleared === dt && !step.read) { pop('Nice!', p.x + 20, p.y - 40, '#feb445', 20); Snd.chirp(); }
    if (T.cleared >= (step.read ? 0 : 0.7)) {
      T.step++; T.t = 0; T.cleared = 0;
      if (T.step >= TUT_STEPS.length) { endTutorial(); return; }
      showTutStep();
    }
  }
}

function hideTutorial() {
  tut.hidden = true;
  hunger.classList.remove('glow');
  hud.querySelector('.progress').classList.remove('glow');
  hud.classList.remove('no-progress');
}

function endTutorial() {
  running = false; holding = false;
  store.set(TUT_KEY, '1');
  hideTutorial();
  Snd.fanfare(); Snd.setUnder(false);
  endLevel.textContent = 'How to play';
  endTitle.textContent = "You're ready";
  endScore.hidden = true;
  endStats.textContent = `Start with ${LEVELS[0].name}. Each level adds one new danger, and its preview in the level picker shows you what to expect.`;
  endBest.textContent = '';
  nextBtn.hidden = false; nextBtn.dataset.level = 0; nextBtn.textContent = `Play ${LEVELS[0].name}`;
  againBtn.className = 'secondary'; againBtn.textContent = 'Replay tutorial'; againBtn.dataset.tutorial = '1';
  hud.hidden = true; endPanel.hidden = false;
  st = newState(0.2, 0);
  nextBtn.focus({ preventScroll: true });
}

function skipTutorial() {
  running = false; holding = false;
  store.set(TUT_KEY, '1');
  hideTutorial();
  Snd.setUnder(false);
  showLevels();
}
