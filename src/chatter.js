/* Chatter: the puffling complains from its meter when it's hungry, and the puffin mutters
   when its air runs low. Edit the lines freely. */
const PECKISH_LINE = 'Getting a bit peckish...';
const HUNGRY_LINES = [
  'FEEEED MEEEE!',
  'Hurry up, b\u2019y!',
  'My tummy\u2019s louder than the sea!',
  'Is it capelin o\u2019clock yet?',
  'I could eat a whole sculpin.',
  'Mom? Dad? Anybody?',
  'I\u2019d even eat a jellyfish.',
  'Wasting away down here!',
  'Tell the gulls I loved them.'
];
const FED_LINES = ['Mmm, capelin!', 'Yesss! Thanks!', 'Best parent ever.', 'Nom nom nom.'];
const FULL_LINES = ['So... full...', '*burp*', 'Couldn\u2019t eat another bite.', 'I\u2019m stuffed, b\u2019y!'];
const LAST_CHANCE_LINES = ['WAAAAAH!', 'I\u2019m fading away!', 'Last call for capelin!', 'Any fish! Any fish at all!'];
const SAVED_LINES = ['You came back!', 'Just in time!', 'I knew you\u2019d make it.'];
const AIR_LINES = [
  'Mmmph!',
  'Glub glub!',
  'Air... need air!',
  'Up, up, up!',
  'Should\u2019ve taken a bigger breath.',
  'Not a fish. Not a fish.'
];

const pickLine = (lines, last) => {
  let l; do { l = lines[Math.floor(Math.random() * lines.length)]; } while (lines.length > 1 && l === last);
  return l;
};

/* ---------- the puffling, speaking from the HUD ---------- */
function sayPuffling(text, secs = 2.6) {
  say.textContent = text;
  say.hidden = false;
  say.classList.remove('pop'); void say.offsetWidth; say.classList.add('pop');
  st.chat.sayHide = secs;
}
function hideSay() { say.hidden = true; }

function updateChatter(dt) {
  const s = st, c = s.chat, p = s.p;
  // puffling
  if (c.sayHide > 0) { c.sayHide -= dt; if (c.sayHide <= 0) hideSay(); }
  if (s.hunger < 0.5 && !c.peckish && s.hunger >= 0.2) { c.peckish = true; sayPuffling(t('say.peckish'), 2.2); }
  if (s.hunger > 0.6) c.peckish = false;
  if (s.hunger < 0.2) {
    c.nextNag -= dt;
    if (c.nextNag <= 0) {
      const wail = s.starving > 0;
      c.last = pickLine(wail ? lines('lastChance', LAST_CHANCE_LINES) : lines('hungry', HUNGRY_LINES), c.last); sayPuffling(c.last, wail ? 1.6 : 2.6);
      c.nextNag = wail ? 1.8 : 3.4;
    }
  } else c.nextNag = 0.4;
  // puffin, underwater with little air left
  const under = p.y > SEA + 6;
  if (under && p.breath < 0.35 && p.breath > 0 && !c.air) { c.airLast = pickLine(lines('air', AIR_LINES), c.airLast); c.air = c.airLast; c.airT = 0; }
  if (c.air) c.airT += dt;
  if ((!under || p.breath <= 0) && c.air) { c.air = null; if (!under) c.phew = 1.1; }
  if (c.phew > 0) c.phew -= dt;
}

// Called from deliver(): a thank-you if the puffling was getting hungry, or relief if it was a last-second save
function chatterFed(before, saved) {
  if (saved) sayPuffling(pickLine(lines('saved', SAVED_LINES)), 2);
  else if (before < 0.35) sayPuffling(pickLine(lines('fed', FED_LINES)), 1.8);
}
// Called when a delivery overflows into a full belly
function chatterFull() { sayPuffling(pickLine(lines('full', FULL_LINES)), 1.8); }
// Called when the meter runs out and the last chance starts
function chatterLastChance() {
  const c = st.chat;
  c.last = pickLine(lines('lastChance', LAST_CHANCE_LINES), c.last); sayPuffling(c.last, 1.6); c.nextNag = 1.8;
}

/* ---------- the puffin's speech bubble, drawn on the canvas ---------- */
function speechBubble(x, y, text, age) {
  const grow = Math.min(1, age / 0.15);
  ctx.save();
  ctx.font = `800 12px ${FONT}`;
  const w = ctx.measureText(text).width + 16, h = 22;
  const bx = clamp(x - w * 0.3, 4, VW - w - 4), by = Math.max(4, y - h);
  ctx.translate(x, y + 6); ctx.scale(0.7 + 0.3 * grow, 0.7 + 0.3 * grow); ctx.translate(-x, -(y + 6));
  ctx.globalAlpha = grow;
  ctx.fillStyle = '#ffffff';
  roundRect(bx, by, w, h, 11); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x - 4, by + h - 1); ctx.lineTo(x + 2, by + h + 7); ctx.lineTo(x + 6, by + h - 1); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#10233d'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText(text, bx + 8, by + h / 2 + 0.5);
  ctx.restore();
}

function drawChatter() {
  const s = st, c = s.chat, p = s.p;
  if (!running || !c || s.caught || s.finale || s.landing) return;
  if (c.air) speechBubble(p.x + 10, p.y - 40, c.air, c.airT);
  else if (c.phew > 0) speechBubble(p.x + 10, p.y - 34, t('say.phew'), 1.1 - c.phew);
}
