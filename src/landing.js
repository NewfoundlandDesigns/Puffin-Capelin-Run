/* Burrow landing: a short scripted sequence. The world keeps scrolling at full speed,
   so the puffin rides the sea stack as it passes, then flies back into position.
   approach -> crash (faceplant, dizzy) -> drop (fish into burrow) -> takeoff
   Every value blends into the next (angles, wings, legs) so nothing snaps. */
const LAND = { approach: 0.36, crash: 0.6, drop: 0.38, takeoff: 0.56 };
const LAND_NEXT = { approach: 'crash', crash: 'drop', drop: 'takeoff', takeoff: null };
const BURROW = 0.42;         // burrow position as a fraction of the sea stack's width
const STAND = 19;            // body centre height above the grass when standing upright
const UPRIGHT = -1.05;       // body angle when standing

const lerp = (a, b, k) => a + (b - a) * k;
const smooth = (a, b, x) => { const k = clamp((x - a) / (b - a), 0, 1); return k * k * (3 - 2 * k); };
const easeInOut = k => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);
const easeOut = k => 1 - Math.pow(1 - k, 3);
const easeSine = k => 0.5 - 0.5 * Math.cos(Math.PI * k);

// Top of the grass along a sea stack at world x
function groundY(c, x) {
  const pts = [[c.x + 14, c.top + 10], [c.x + c.w * 0.45, c.top + 2], [c.x + c.w - 14, c.top + 6]];
  if (x <= pts[0][0]) return pts[0][1] - 3;
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[i + 1];
    if (x <= x1) return y0 + (y1 - y0) * (x - x0) / (x1 - x0) - 3;
  }
  return pts[pts.length - 1][1] - 3;
}

// A point on the standing puffin (lean about its feet), in world space
function standPoint(lx, ly, lean) {
  const p = st.p, c = Math.cos(lean), s = Math.sin(lean), dy = ly - 18;
  return [p.x + lx * c - dy * s, p.y + 18 + lx * s + dy * c];
}

// A point in the puffin's body space, turned into world space
function puffinPoint(lx, ly, ang) {
  const p = st.p, c = Math.cos(ang), s = Math.sin(ang);
  return [p.x + lx * c - ly * s, p.y + lx * s + ly * c];
}

// Where the puffin touches down, just short of the burrow
function landingSpotX(c) { return c.x + c.w * BURROW - 40; }

// Screen x to touch down at, far enough right that the puffin is still in view
// when the scrolling stack has carried it left by takeoff time.
function touchdownX(homeX) {
  const ride = st.speed * (LAND.crash + LAND.drop + 0.1);
  return Math.min(VW * 0.8, Math.max(homeX, 40 + ride));
}

// Should reaching this stack start a landing? The stack needs to be arriving
// about when the approach glide would finish.
function landingReady(c, homeX) {
  const ahead = landingSpotX(c) - st.p.x;
  const ideal = (touchdownX(homeX) - homeX) + st.speed * LAND.approach;
  return ahead > -40 && ahead < ideal + 30;
}

function startLanding(c) {
  const p = st.p;
  st.landing = {
    c, phase: 'approach', t: 0,
    fromX: p.x, fromY: p.y, fromAng: clamp(p.vy / 620, -0.5, 0.55),
    nextFlutter: 0, done: {},
    pose: { ang: 0, sx: 1, sy: 1, feet: 0, lift: 0, fold: 0, dizzy: 0 }
  };
  p.inv = 99;
}

function updateLanding(dt, homeX) {
  const L = st.landing, p = st.p, c = L.c, pose = L.pose;
  L.t += dt;
  const k = clamp(L.t / LAND[L.phase], 0, 1);
  const landX = landingSpotX(c);
  const standX = landX + 8;
  const once = key => (L.done[key] ? false : (L.done[key] = true));
  pose.sx = 1; pose.sy = 1; pose.dizzy = 0; pose.stand = 0;

  if (L.phase === 'approach') {          // glide in, wings up to brake, legs down
    const e = easeInOut(k);
    p.x = lerp(L.fromX, landX, e);
    p.y = lerp(L.fromY, groundY(c, landX) - STAND, e) - 14 * Math.sin(Math.PI * k);
    pose.ang = lerp(L.fromAng, -0.45, e);
    pose.lift = smooth(0, 0.5, k);
    pose.feet = smooth(0.35, 0.85, k);
    pose.fold = 0;
    p.flap += dt * 20;
    L.nextFlutter -= dt;
    if (L.nextFlutter <= 0) { Snd.flutter(); L.nextFlutter = 0.11; }
  }

  else if (L.phase === 'crash') {
    p.x = lerp(landX, standX, easeInOut(Math.min(1, k / 0.4)));   // short skid
    const g = groundY(c, p.x) - STAND;
    pose.feet = 1;
    p.flap += dt * 10;
    if (once('thud')) {
      Snd.thud();
      burst(p.x + 6, g + STAND, 8, '#7fae63', 80, 380, 1.5, 2.8, 0.55);
    }
    if (k < 0.3) {                       // tip forward, beak into the grass
      const a = easeInOut(k / 0.3);
      pose.ang = lerp(-0.45, 0.55, a);
      p.y = g + 4 * a;
      pose.sx = 1 + 0.08 * a; pose.sy = 1 - 0.08 * a;
      pose.lift = 1 - a; pose.fold = a;
    } else if (k < 0.55) {               // a beat of embarrassment
      pose.ang = 0.55 + Math.sin((k - 0.3) * 22) * 0.05;
      p.y = g + 4;
      pose.sx = 1.08; pose.sy = 0.92;
      pose.lift = 0; pose.fold = 1;
      pose.dizzy = smooth(0.3, 0.4, k);
    } else {                             // shake it off and stand up
      const q = (k - 0.55) / 0.45;
      if (once('boing')) Snd.boing();
      pose.ang = lerp(0.55, UPRIGHT, easeSine(q)) - 0.08 * Math.sin(Math.PI * q) * q;
      pose.stand = q > 0.45 ? 1 : 0;       // swap to the standing drawing once it's mostly upright
      p.y = g + 4 * (1 - q) - 6 * Math.sin(Math.PI * q);
      const st2 = Math.sin(Math.PI * q) * 0.06;
      pose.sx = 1.08 - 0.08 * q - st2; pose.sy = 0.92 + 0.08 * q + st2;
      pose.lift = 0; pose.fold = 1;
      pose.dizzy = 1 - smooth(0.2, 1, q);
    }
  }

  else if (L.phase === 'drop') {         // bow to the burrow and let the fish go
    p.x = standX;
    p.y = groundY(c, p.x) - STAND;
    pose.ang = UPRIGHT + 0.6 * Math.sin(Math.PI * k);                // a bow to the burrow
    pose.feet = 1; pose.lift = 0; pose.fold = 1; pose.stand = 1;
    if (k > 0.45 && once('drop')) {
      const [bx, by] = standPoint(15, -15, pose.ang - UPRIGHT);
      const tx = c.x + c.w * BURROW, ty = c.top + 16, T = 0.3, G = 420;
      for (const gold of st.beak) {
        st.parts.push({ x: bx, y: by, vx: (tx - bx) / T + rand(-10, 10), vy: (ty - by) / T - 0.5 * G * T, g: G,
          r: 3, life: T, max: T * 1.3, color: gold ? '#feb445' : '#c9d6e3', fish: true, rot: rand(0, 6) });
      }
      deliver(c);
      c.cheer = 1.2; c.chick = 1.3;
      Snd.growl();
    }
  }

  else if (L.phase === 'takeoff') {
    const g = groundY(c, standX) - STAND;
    if (k < 0.2) {                       // small crouch
      const q = Math.sin(Math.PI * (k / 0.2));
      p.x = standX; p.y = g + 3 * q;
      pose.ang = UPRIGHT + 0.15 * q; pose.sx = 1 + 0.06 * q; pose.sy = 1 - 0.08 * q;
      pose.feet = 1; pose.lift = 0; pose.fold = 1 - q * 0.5; pose.stand = 1;
      L.fromTakeoffX = p.x; L.fromTakeoffY = p.y;
    } else {                             // lift off and glide back into the run
      const q = (k - 0.2) / 0.8;
      if (once('whoosh')) Snd.whoosh();
      p.x = lerp(L.fromTakeoffX, homeX, easeSine(q));
      p.y = lerp(L.fromTakeoffY, Math.max(40, c.top - 60), easeOut(q));
      pose.ang = lerp(UPRIGHT, -0.29, easeSine(q));
      pose.fold = 0;
      pose.lift = 1 - smooth(0.3, 1, q);         // spread wings settle into normal flight
      pose.stand = q < 0.12 ? 1 : 0;
      pose.feet = 1 - smooth(0.1, 0.6, q);
      p.flap += dt * lerp(20, 16, q);
      L.nextFlutter -= dt;
      if (L.nextFlutter <= 0) { Snd.flutter(); L.nextFlutter = 0.13; }
    }
  }

  if (L.t >= LAND[L.phase]) {
    L.phase = LAND_NEXT[L.phase]; L.t = 0;
    if (!L.phase) {                      // hand control back, matching the flight angle
      st.landing = null;
      p.x = homeX; p.vy = -180; p.ang = -0.29; p.inv = 0.6;
    }
  }
}
