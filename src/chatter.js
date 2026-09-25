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
  if (s.hunger < 0.5 && !c.peckish && s.hunger >= 0.2) { c.peckish = true; sayPuffling(PECKISH_LINE, 2.2); }
  if (s.hunger > 0.6) c.peckish = false;
  if (s.hunger < 0.2) {
    c.nextNag -= dt;
    if (c.nextNag <= 0) { c.last = pickLine(HUNGRY_LINES, c.last); sayPuffling(c.last); c.nextNag = 3.4; }
  } else c.nextNag = 0.4;
  // puffin, underwater with little air left
  const under = p.y > SEA + 6;
  if (under && p.breath < 0.35 && p.breath > 0 && !c.air) { c.airLast = pickLine(AIR_LINES, c.airLast); c.air = c.airLast; c.airT = 0; }
  if (c.air) c.airT += dt;
  if ((!under || p.breath <= 0) && c.air) { c.air = null; if (!under) c.phew = 1.1; }
  if (c.phew > 0) c.phew -= dt;
}

// Called from deliver(): a thank-you if the puffling was getting hungry
function chatterFed(before) {
  if (before < 0.35) sayPuffling(pickLine(FED_LINES), 1.8);
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
  else if (c.phew > 0) speechBubble(p.x + 10, p.y - 34, 'Phew!', 1.1 - c.phew);
}
