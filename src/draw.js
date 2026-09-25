/* ================= DRAWING ================= */
function ell(x, y, rx, ry, rot) { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot || 0, 0, Math.PI * 2); ctx.fill(); }

/* ---------- the puffin ----------
   Two drawings: flying/swimming (horizontal) and standing (upright). Both share one head.
   Poses pass o.stand = 1 for the standing drawing; its lean comes from ang - UPRIGHT. */
const PUF = {
  back: '#10233d', far: '#0a1626', belly: '#edf1f6', face: '#e2e7ed',
  beak: '#f94a18', band: '#feb445', plate: '#6b7c90', foot: '#f94a18', ring: '#dc362c'
};

function puffinFoot(fx, fy, s) {                  // a webbed foot, toes pointing forward
  ctx.beginPath();
  ctx.moveTo(fx - 2 * s, fy);
  ctx.quadraticCurveTo(fx + 3 * s, fy - 2.2 * s, fx + 7 * s, fy + 0.2 * s);
  ctx.lineTo(fx + 5.8 * s, fy + 1.9 * s);
  ctx.lineTo(fx - 2.4 * s, fy + 1.7 * s);
  ctx.closePath(); ctx.fill();
}

function puffinWing(sx, sy, rot, col, len = 1) {  // tapered wing, pointing back from the shoulder
  ctx.save(); ctx.translate(sx, sy); ctx.rotate(rot); ctx.scale(len, 1);
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.moveTo(3, -2);
  ctx.quadraticCurveTo(-8, -6.5, -19, -4);
  ctx.quadraticCurveTo(-24.5, -2.4, -27, 0.6);
  ctx.quadraticCurveTo(-14, 4, 3, 3.2);
  ctx.closePath(); ctx.fill();
  ctx.restore();
}

// Capelin held crosswise in the bill, hanging down on this side
function puffinFish(beak) {
  for (let i = 0; i < beak.length; i++) {
    const row = Math.floor(i / 6);
    const fx = 23 + (i % 6) * 1.75 + row * 0.9;
    const rot = (i % 2 ? 0.28 : -0.2) + row * 0.12;
    ctx.save(); ctx.translate(fx, -4.5); ctx.rotate(rot);
    ctx.fillStyle = beak[i] ? '#feb445' : '#c9d6e3';
    ell(0, 6.2, 1.8, 6);
    ctx.beginPath(); ctx.moveTo(0, 11.5); ctx.lineTo(-2.3, 14.6); ctx.lineTo(2.3, 14.6); ctx.closePath(); ctx.fill();
    ctx.fillStyle = beak[i] ? '#d98a1a' : '#6f8aa8'; ell(-0.6, 5.8, 0.6, 5);
    ctx.restore();
  }
}

// The head, in flying coordinates (head centre at 14,-6, bill pointing right)
function puffinHead(beak) {
  ctx.fillStyle = PUF.back; ell(14, -6, 9.4, 9.2);
  ctx.fillStyle = PUF.face; ell(16.6, -5.3, 6.1, 5.5);
  ctx.strokeStyle = '#9aa6b3'; ctx.lineWidth = 0.8; ctx.lineCap = 'round';        // eye streak
  ctx.beginPath(); ctx.moveTo(16.6, -5.6); ctx.quadraticCurveTo(15.2, -4.4, 13.4, -4.2); ctx.stroke();
  ctx.fillStyle = PUF.back; ell(18, -6.7, 1.6, 1.6);
  ctx.strokeStyle = PUF.ring; ctx.lineWidth = 0.6;
  ctx.beginPath(); ctx.arc(18, -6.7, 2.1, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = '#ffffff'; ell(18.5, -7.2, 0.5, 0.5);
  puffinFish(beak || []);
  ctx.fillStyle = PUF.beak;                                                       // bill
  ctx.beginPath(); ctx.moveTo(21, -12.2); ctx.quadraticCurveTo(29.5, -9.8, 34.5, -4.6);
  ctx.quadraticCurveTo(29.5, -0.4, 21, 0.8); ctx.closePath(); ctx.fill();
  ctx.fillStyle = PUF.plate;
  ctx.beginPath(); ctx.moveTo(20.6, -12.2); ctx.lineTo(23.6, -11.3); ctx.lineTo(23.6, 0.1); ctx.lineTo(20.6, 0.8); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = PUF.band; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(24.7, -10.9); ctx.lineTo(24.7, -0.2); ctx.stroke();
  ctx.strokeStyle = 'rgba(150,40,10,0.45)'; ctx.lineWidth = 0.7;                   // grooves
  ctx.beginPath(); ctx.moveTo(28.4, -9.3); ctx.quadraticCurveTo(29.4, -5, 28.4, -1.2);
  ctx.moveTo(31, -7.4); ctx.quadraticCurveTo(31.8, -4.8, 31, -2.2); ctx.stroke();
  ctx.strokeStyle = 'rgba(110,30,8,0.55)'; ctx.lineWidth = 0.6;                   // mouth line
  ctx.beginPath(); ctx.moveTo(21.5, -5.2); ctx.lineTo(33.6, -4.6); ctx.stroke();
  ctx.fillStyle = PUF.band; ell(21.4, -4.6, 1.3, 1.1);                             // rosette at the gape
}

function drawPuffin(x, y, sc, ang, o) {
  if (o.stand) { drawPuffinStanding(x, y, sc, ang - UPRIGHT, o); return; }
  ctx.save();
  ctx.translate(x, y);
  // legs are drawn level with the world, not the body
  ctx.strokeStyle = PUF.foot; ctx.fillStyle = PUF.foot; ctx.lineCap = 'round';
  if (o.feetUp > 0.02) {                 // flat on its back: legs in the air, waggling
    ctx.lineWidth = 2.4 * sc;
    for (const [dx, ph] of [[-5, 0], [4, 2]]) {
      const wag = Math.sin(st.anim * 22 + ph) * 3 * sc;
      const tip = -(8 + 9 * o.feetUp) * sc;
      ctx.beginPath(); ctx.moveTo(dx * sc, -8 * sc); ctx.lineTo(dx * sc + wag, tip); ctx.stroke();
      puffinFoot(dx * sc + wag - sc, tip - 1.5 * sc, sc);
    }
  }
  const feet = o.feet !== undefined ? o.feet : (o.feetDown ? 1 : 0);
  if (feet > 0.02) {                     // legs lower as the puffin comes in to land
    ctx.lineWidth = 2.4 * sc;
    const top = 9 * sc, fy = top + 8.5 * feet * sc;
    for (const dx of [-5, 4]) {
      ctx.beginPath(); ctx.moveTo(dx * sc, top); ctx.lineTo(dx * sc, fy); ctx.stroke();
      puffinFoot(dx * sc - sc, fy, sc);
    }
  }
  ctx.rotate(ang);
  ctx.scale((o.flip ? -sc : sc) * (o.sx || 1), sc * (o.sy || 1));

  // wing position: flapping in flight, raised to brake (lift), tucked in (fold)
  const lift = o.lift !== undefined ? o.lift : (o.wing === 'spread' ? 1 : 0);
  const fold = o.fold !== undefined ? o.fold : ((o.under || o.floating || o.wing === 'folded') ? 1 : 0);
  const flapRot = (-0.2 + 1.3 * lift) + Math.sin(o.flap) * (0.95 - 0.35 * lift);   // positive raises the wing
  const wingRot = flapRot + (0.18 - flapRot) * fold;

  if (fold < 0.9) puffinWing(-1, -8, wingRot - 0.3, PUF.far, 0.92);            // far wing
  if (!o.under && !o.floating && feet < 0.5) {                                    // feet trailing behind
    ctx.fillStyle = PUF.foot;
    ctx.beginPath(); ctx.moveTo(-16, 7); ctx.lineTo(-27, 9.8); ctx.lineTo(-25.4, 12.4); ctx.lineTo(-15.5, 10); ctx.closePath(); ctx.fill();
  }
  ctx.fillStyle = PUF.back;                                                       // tail
  ctx.beginPath(); ctx.moveTo(-19, -1.5); ctx.lineTo(-29.5, -2.2); ctx.lineTo(-27.5, 3.2); ctx.lineTo(-18.5, 4.5); ctx.closePath(); ctx.fill();
  ctx.beginPath();                                                                // body
  ctx.moveTo(-24, 1);
  ctx.quadraticCurveTo(-16, -10.5, 0, -11.2);
  ctx.quadraticCurveTo(12, -12, 17, -5);
  ctx.quadraticCurveTo(18, 5, 8, 10.2);
  ctx.quadraticCurveTo(-8, 13.8, -18, 6.2);
  ctx.quadraticCurveTo(-22, 4, -24, 1);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = PUF.belly;                                                      // white underside
  ctx.beginPath(); ctx.moveTo(-18.5, 5.4); ctx.quadraticCurveTo(-6, 13.4, 7.5, 10);
  ctx.quadraticCurveTo(13.5, 7, 14.2, 0.8); ctx.quadraticCurveTo(2, 5.6, -18.5, 5.4); ctx.closePath(); ctx.fill();
  puffinWing(-1, -5.5, wingRot, PUF.back);                                       // near wing
  puffinHead(o.beak);
  ctx.restore();
}

// Standing upright on its feet. lean: 0 is upright, positive tips forward (a bow).
function drawPuffinStanding(x, y, sc, lean, o) {
  lean = ((lean + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI;
  const spread = o.wing === 'spread' || (o.lift || 0) > 0.5;
  ctx.save(); ctx.translate(x, y); ctx.scale(o.flip ? -sc : sc, sc);
  // legs and feet stay planted on the ground
  ctx.strokeStyle = PUF.foot; ctx.fillStyle = PUF.foot; ctx.lineWidth = 2.6; ctx.lineCap = 'round';
  for (const [dx, ph] of [[-5, 0], [3.5, Math.PI]]) {
    const up = o.step ? Math.max(0, Math.sin(o.step + ph)) * 3 : 0;
    ctx.beginPath(); ctx.moveTo(dx, 11); ctx.lineTo(dx, 17 - up); ctx.stroke();
    puffinFoot(dx - 0.5, 18.2 - up, 1);
  }
  // the body pivots over its feet
  ctx.translate(0, 18); ctx.rotate(lean); ctx.scale(o.sx || 1, o.sy || 1); ctx.translate(0, -18);
  const flap = Math.sin(o.flap || 0);
  if (spread) puffinWing(-3, -5, 1.25 + flap * 0.55 + 0.25, PUF.far, 0.95);     // far wing raised
  ctx.fillStyle = PUF.back;
  ctx.beginPath(); ctx.moveTo(-9, 12); ctx.lineTo(-15, 19); ctx.lineTo(-8, 17.5); ctx.closePath(); ctx.fill();   // tail
  ell(-1, 2.5, 12.2, 15.8);                                                      // body
  ctx.fillStyle = PUF.belly;                                                     // white chest, turned toward us
  ctx.beginPath(); ctx.moveTo(2, -8.5); ctx.quadraticCurveTo(12.5, -3.5, 10.6, 8.4);
  ctx.quadraticCurveTo(8, 17.6, -0.5, 18); ctx.quadraticCurveTo(-4.4, 10, -2.2, -1.8);
  ctx.quadraticCurveTo(-1, -7, 2, -8.5); ctx.closePath(); ctx.fill();
  ctx.fillStyle = PUF.back; ell(3.2, -8.6, 6.2, 2.4);                           // dark collar
  if (spread) puffinWing(-2, -4, 1.25 + flap * 0.55, PUF.back);                 // near wing raised
  else {                                                                         // wing folded along the back
    ctx.fillStyle = PUF.far;
    ctx.beginPath(); ctx.moveTo(-5.5, -6); ctx.quadraticCurveTo(-13.4, 3, -9.6, 16.5);
    ctx.quadraticCurveTo(-4.2, 8.5, -2.8, -2); ctx.closePath(); ctx.fill();
  }
  ctx.save(); ctx.translate(-12, -10.5); puffinHead(o.beak); ctx.restore();    // head on top
  ctx.restore();
}

// Little stars circling the head after a faceplant
function drawDizzy(x, y, amount, t) {
  if (amount <= 0) return;
  ctx.save();
  ctx.globalAlpha = clamp(amount, 0, 1);
  ctx.fillStyle = '#feb445';
  for (let i = 0; i < 3; i++) {
    const a = t * 4 + i * 2.09;
    const sx = x + Math.cos(a) * 13, sy = y + Math.sin(a) * 4.5;
    ctx.beginPath();
    ctx.moveTo(sx, sy - 3.5); ctx.lineTo(sx + 1, sy - 1); ctx.lineTo(sx + 3.5, sy); ctx.lineTo(sx + 1, sy + 1);
    ctx.lineTo(sx, sy + 3.5); ctx.lineTo(sx - 1, sy + 1); ctx.lineTo(sx - 3.5, sy); ctx.lineTo(sx - 1, sy - 1);
    ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}

function drawGull(g, t) {
  const f = Math.sin(t * 9 + g.ph);
  ctx.save(); ctx.translate(g.x, g.y); ctx.scale(1.15, 1.15);
  ctx.strokeStyle = '#2e3b4e'; ctx.lineWidth = 4.5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-2, 0); ctx.quadraticCurveTo(-8, -9 * f - 5, -20, -15 * f - 2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(3, 0); ctx.quadraticCurveTo(10, -9 * f - 5, 22, -15 * f - 2); ctx.stroke();
  ctx.fillStyle = '#f4f7fa'; ell(1, 2, 12, 5.5);
  ctx.beginPath(); ctx.moveTo(11, 1); ctx.lineTo(19, -1); ctx.lineTo(18, 5); ctx.closePath(); ctx.fill();
  ell(-10, -1, 5.2, 4.8);
  ctx.fillStyle = '#feb445';
  ctx.beginPath(); ctx.moveTo(-14.5, -2); ctx.lineTo(-21, 0); ctx.lineTo(-14.5, 1.2); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#10233d'; ell(-11.5, -2.2, 1, 1);
  ctx.restore();
}

function drawCapelin(f, t) {
  ctx.save(); ctx.translate(f.x, f.y); ctx.rotate(Math.sin(t * 6 + f.ph) * 0.12);
  if (f.gold) {
    const gl = ctx.createRadialGradient(0, 0, 1, 0, 0, 18);
    gl.addColorStop(0, 'rgba(254,180,69,0.45)'); gl.addColorStop(1, 'rgba(254,180,69,0)');
    ctx.fillStyle = gl; ell(0, 0, 18, 18);
  }
  ctx.fillStyle = f.gold ? '#feb445' : '#c9d6e3';
  ctx.beginPath(); ctx.moveTo(-6, 0); ctx.lineTo(-11, -3.2); ctx.lineTo(-11, 3.2); ctx.closePath(); ctx.fill();
  ell(0, 0, 7.5, 2.5);
  ctx.fillStyle = f.gold ? '#d98a1a' : '#6f8aa8'; ell(0.5, -1, 6, 1.1);
  ctx.fillStyle = '#10233d'; ell(5, -0.3, 0.8, 0.8);
  if (f.gold && Math.sin(t * 7 + f.ph) > 0.6) {
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.moveTo(2, -6); ctx.lineTo(3, -3.5); ctx.lineTo(5.5, -2.5); ctx.lineTo(3, -1.5); ctx.lineTo(2, 1); ctx.lineTo(1, -1.5); ctx.lineTo(-1.5, -2.5); ctx.lineTo(1, -3.5); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}

function drawSeal(se, t) {
  ctx.save(); ctx.translate(se.x, se.y);
  ctx.rotate(clamp(se.vy / 450, -0.35, 0.35) + Math.sin(t * 3 + se.ph) * 0.05);
  const k = Math.sin(t * 7 + se.ph) * 4;
  ctx.fillStyle = '#5b6776';
  ctx.beginPath(); ctx.moveTo(24, 0); ctx.lineTo(40, -8 + k); ctx.lineTo(36, 0); ctx.lineTo(40, 8 + k); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#7d8a98'; ell(0, 0, 28, 11);
  ctx.fillStyle = '#a9b5c1'; ell(-3, 4.5, 21, 5.5);
  ctx.fillStyle = '#5b6776'; ell(6, -5, 2.2, 1.6); ell(13, -2, 1.8, 1.3); ell(-4, -6, 1.6, 1.2); ell(17, -6, 1.4, 1);
  ctx.fillStyle = '#7d8a98'; ell(-24, -3, 11, 9.5);
  ctx.fillStyle = '#a9b5c1'; ell(-33, -0.5, 5.5, 4.5);
  ctx.fillStyle = '#10233d'; ell(-37.5, -2, 1.8, 1.4); ell(-26, -6.5, 2.1, 2.3);
  ctx.fillStyle = '#ffffff'; ell(-26.6, -7.2, 0.6, 0.6);
  ctx.strokeStyle = 'rgba(230,236,242,0.7)'; ctx.lineWidth = 0.6;
  ctx.beginPath(); ctx.moveTo(-33, 0); ctx.lineTo(-42, -2); ctx.moveTo(-33, 1); ctx.lineTo(-42, 2); ctx.moveTo(-33, 2); ctx.lineTo(-41, 5); ctx.stroke();
  ctx.fillStyle = '#5b6776'; ell(-9, 9, 7, 2.8, 0.6 + Math.sin(t * 5 + se.ph) * 0.3);
  ctx.restore();
}

function drawCliff(c, t, night) {
  const x = c.x, w = c.w, top = c.top;
  ctx.fillStyle = css(mix(hex('#4a5d73'), hex('#1b2f4a'), clamp(night + 0.3, 0, 1)));
  ctx.beginPath();
  ctx.moveTo(x - 6, WORLD_H); ctx.lineTo(x + 4, top + 34); ctx.lineTo(x + 16, top + 8);
  ctx.lineTo(x + w * 0.45, top); ctx.lineTo(x + w - 14, top + 4); ctx.lineTo(x + w - 3, top + 30);
  ctx.lineTo(x + w + 8, WORLD_H); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(5,13,24,0.25)';
  ctx.beginPath(); ctx.moveTo(x + w * 0.6, top + 40); ctx.lineTo(x + w - 3, top + 30); ctx.lineTo(x + w + 8, WORLD_H); ctx.lineTo(x + w * 0.55, WORLD_H); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = css(mix(hex('#6f9a5a'), hex('#34502f'), night)); ctx.lineWidth = 7; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x + 14, top + 10); ctx.lineTo(x + w * 0.45, top + 2); ctx.lineTo(x + w - 14, top + 6); ctx.stroke();
  const bx = x + w * BURROW, by = top + 16;
  if (night > 0.2 && !c.used) {
    const gl = ctx.createRadialGradient(bx, by, 2, bx, by, 34);
    gl.addColorStop(0, `rgba(254,180,69,${0.35 * night})`); gl.addColorStop(1, 'rgba(254,180,69,0)');
    ctx.fillStyle = gl; ell(bx, by, 34, 34);
  }
  ctx.fillStyle = '#050d18'; ell(bx, by, 12, 8.5);
  if (c.chick > 0) {                    // the puffling pops out of the burrow for its fish
    const out = Math.min(1, c.chick / 0.3, (1.3 - Math.min(c.chick, 1.3)) / 0.2 + (c.chick > 1.3 ? 1 : 0));
    const bob = Math.abs(Math.sin(t * 9)) * 2;
    ctx.save();
    ctx.beginPath(); ctx.rect(bx - 24, by - 50, 48, 51); ctx.clip();
    drawChick(bx, by + 8 - 17 * out - bob * out, 1);
    ctx.restore();
  }
  if (c.home) {                          // a little pennant marks the home colony
    const fx = x + w * 0.9, fy = top + 4;
    ctx.strokeStyle = '#e9edf1'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(fx, fy); ctx.lineTo(fx, fy - 42); ctx.stroke();
    const wv = Math.sin(t * 6) * 3;
    ctx.fillStyle = '#f94a18';
    ctx.beginPath(); ctx.moveTo(fx, fy - 42); ctx.quadraticCurveTo(fx + 12, fy - 40 + wv, fx + 24, fy - 35 + wv); ctx.quadraticCurveTo(fx + 12, fy - 31 + wv, fx, fy - 28); ctx.closePath(); ctx.fill();
  }
  if (stackN() > 0 && !c.used && !c.home) {
    ctx.strokeStyle = `rgba(254,180,69,${0.55 + 0.35 * Math.sin(t * 6)})`; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.ellipse(bx, by, 17, 13, 0, 0, Math.PI * 2); ctx.stroke();
  }
  // the mate stands by the burrow, facing it, and cheers when fish arrive
  const cheer = c.cheer || 0;
  const hop = cheer > 0 ? Math.abs(Math.sin(cheer * 8)) * 5 * Math.min(1, cheer * 2) : 0;
  const mx = x + w * 0.74, ms = 0.72;
  const idle = Math.sin(t * 1.3 + x * 0.01) * 0.05;                      // a small idle sway
  drawPuffin(mx, groundY(c, mx) - 19 * ms - hop, ms, UPRIGHT + (cheer > 0 ? -0.08 : idle), {
    stand: 1, flip: true, wing: cheer > 0 ? 'spread' : undefined, flap: t * 20,
    beak: c.used ? [false, false, false] : []
  });
}

// A fluffy grey puffling with a small dark beak, looking up for food
function drawChick(x, y, sc) {
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
  ctx.fillStyle = '#6b7480';
  ell(0, 0, 10, 9.5); ell(-4, -8, 3, 3); ell(0, -9.5, 3, 3); ell(4, -8, 3, 3);
  ctx.fillStyle = '#dfe6ee'; ell(0, 4, 6, 5);
  ctx.fillStyle = '#10233d'; ell(-3.4, -2.4, 1.4, 1.5); ell(3.4, -2.4, 1.4, 1.5);
  ctx.fillStyle = '#ffffff'; ell(-3.8, -2.9, 0.45, 0.45); ell(3, -2.9, 0.45, 0.45);
  ctx.fillStyle = '#2a2f38';
  ctx.beginPath(); ctx.moveTo(-1.8, 0); ctx.lineTo(0, 2.6); ctx.lineTo(1.8, 0); ctx.closePath(); ctx.fill();
  ctx.restore();
}

function roundRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// Callout above the burrow after a delivery: points, the delivered stack, and what it was made of.
function drawDropNote(c) {
  const nt = c.note;
  if (!nt || nt.life <= 0) return;
  const age = nt.max - nt.life;
  const grow = 1 - Math.pow(1 - clamp(age / 0.22, 0, 1), 3);
  const alpha = clamp(nt.life / 0.45, 0, 1);
  const bx = c.x + c.w * BURROW, by = c.top + 16;

  const title = '+' + nt.pts;
  const caption = nt.gold ? `${nt.n} capelin, golden ×${nt.mult}` : `${nt.n} capelin`;
  ctx.font = `800 24px ${FONT}`; const w1 = ctx.measureText(title).width;
  ctx.font = `500 12px ${FONT}`; const w2 = ctx.measureText(caption).width;
  const cw = Math.max(w1, w2, nt.beak.length * 7, 96) + 24;
  const ch = nt.bestYet ? 82 : 66;
  // up and to the right of the burrow, clear of the puffin standing on its left
  const cx = clamp(bx + 26, 6, VW - cw - 6);
  const cy = Math.max(6, c.top - 52 - ch - age * 5);
  const lineX = clamp(bx, cx + 14, cx + cw - 14);

  ctx.save();
  ctx.globalAlpha = alpha;
  // leader line from the burrow up to the card
  ctx.strokeStyle = 'rgba(255,255,255,0.75)'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(bx, by - 10); ctx.lineTo(lineX, cy + ch); ctx.stroke();
  ctx.fillStyle = '#feb445'; ell(bx, by - 10, 3, 3);

  // card grows out from the end of the leader line
  ctx.translate(lineX, cy + ch);
  ctx.scale(0.85 + 0.15 * grow, 0.85 + 0.15 * grow);
  ctx.translate(-lineX, -(cy + ch));
  roundRect(cx, cy, cw, ch, 10);
  ctx.fillStyle = 'rgba(10,22,38,0.9)'; ctx.fill();
  ctx.strokeStyle = 'rgba(254,180,69,0.85)'; ctx.lineWidth = 1.5; ctx.stroke();

  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  ctx.font = `800 24px ${FONT}`; ctx.fillStyle = '#feb445';
  ctx.fillText(title, cx + 12, cy + 27);

  // the delivered stack, laid out fish by fish
  for (let i = 0; i < nt.beak.length; i++) {
    const fx = cx + 15 + i * 7, fy = cy + 41;
    ctx.fillStyle = nt.beak[i] ? '#feb445' : '#c9d6e3'; ell(fx, fy, 1.8, 5, 0.15);
    ctx.fillStyle = nt.beak[i] ? '#d98a1a' : '#6f8aa8'; ell(fx - 0.5, fy, 0.7, 4.3, 0.15);
  }

  ctx.font = `500 12px ${FONT}`; ctx.fillStyle = '#ffffff';
  ctx.fillText(caption, cx + 12, cy + 60);
  if (nt.bestYet) {
    ctx.font = `700 12px ${FONT}`; ctx.fillStyle = '#feb445';
    ctx.fillText('Biggest drop yet', cx + 12, cy + 75);
  }
  ctx.restore();
}

function hills(off, color, amp, freq, base) {
  ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(0, SEA + 2);
  for (let x = 0; x <= VW + 12; x += 12) {
    const q = x + off;
    ctx.lineTo(x, base - amp * (0.55 + 0.45 * Math.sin(q * freq)) * (0.6 + 0.4 * Math.sin(q * freq * 2.3 + 1.7)));
  }
  ctx.lineTo(VW + 12, SEA + 2); ctx.closePath(); ctx.fill();
}

// Low, soft overcast drifting slowly across the sky
function drawClouds(col, dist, night) {
  const span = VW + 500;
  for (const c of clouds) {
    const x = ((c.x - dist * 0.03) % span + span) % span - 250;
    ctx.fillStyle = css(col, 0.5 - night * 0.2);
    ell(x, c.y, c.w * 0.5, 16); ell(x - c.w * 0.25, c.y + 6, c.w * 0.3, 13); ell(x + c.w * 0.28, c.y + 5, c.w * 0.32, 12);
  }
}

// A steep, flat-topped seabird island offshore, with gulls wheeling over it
function drawGullIsland(off, cols, t, night) {
  const period = 1700, width = 620;
  const first = Math.floor((off - 200) / period);
  for (let n = first; n <= first + Math.ceil(VW / period) + 1; n++) {
    const x0 = n * period - off + 260;
    if (x0 > VW + 50 || x0 + width < -50) continue;
    const top = SEA - 118;
    ctx.fillStyle = css(cols[0]);
    ctx.beginPath();
    ctx.moveTo(x0, SEA + 2);
    ctx.lineTo(x0 + 26, top + 40); ctx.lineTo(x0 + 48, top + 14);
    ctx.quadraticCurveTo(x0 + width * 0.35, top - 12, x0 + width * 0.62, top + 2);
    ctx.quadraticCurveTo(x0 + width * 0.8, top + 6, x0 + width - 60, top + 22);
    ctx.lineTo(x0 + width - 30, top + 60); ctx.lineTo(x0 + width, SEA + 2);
    ctx.closePath(); ctx.fill();
    // a lighter grassy cap and a darker cliff face
    ctx.strokeStyle = css(mix(cols[0], hex('#8fa77a'), 0.35 * (1 - night)), 0.9); ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(x0 + 50, top + 13);
    ctx.quadraticCurveTo(x0 + width * 0.35, top - 11, x0 + width * 0.62, top + 3);
    ctx.quadraticCurveTo(x0 + width * 0.8, top + 7, x0 + width - 62, top + 22); ctx.stroke();
    ctx.fillStyle = css(mix(cols[0], hex('#0a1626'), 0.25));
    ctx.beginPath(); ctx.moveTo(x0 + width - 60, top + 22); ctx.lineTo(x0 + width - 30, top + 60); ctx.lineTo(x0 + width, SEA + 2); ctx.lineTo(x0 + width - 90, SEA + 2); ctx.closePath(); ctx.fill();
    // gulls wheeling above the colony
    if (night < 0.95) {
      ctx.strokeStyle = `rgba(245,248,252,${0.75 * (1 - night)})`; ctx.lineWidth = 1.3; ctx.lineCap = 'round';
      for (let i = 0; i < 14; i++) {
        const a = t * (0.35 + (i % 4) * 0.08) + i * 1.9;
        const gx = x0 + width * 0.45 + Math.cos(a) * (60 + (i * 23) % 150);
        const gy = top - 40 + Math.sin(a * 1.3 + i) * 22 - (i % 3) * 10;
        const f = Math.sin(t * 6 + i) * 1.5;
        ctx.beginPath(); ctx.moveTo(gx - 4, gy - f); ctx.lineTo(gx, gy + 1); ctx.lineTo(gx + 4, gy - f); ctx.stroke();
      }
    }
  }
}

// A dark headland with a lighthouse; its beam sweeps once the light fades
function drawHeadland(off, cols, t, dusk) {
  const period = 2100, width = 520;
  const first = Math.floor((off - 300) / period);
  for (let n = first; n <= first + Math.ceil(VW / period) + 1; n++) {
    const x0 = n * period - off + 180;
    if (x0 > VW + 80 || x0 + width < -80) continue;
    ctx.fillStyle = css(cols[0]);
    ctx.beginPath();
    ctx.moveTo(x0, SEA + 2);
    ctx.lineTo(x0 + 30, SEA - 120); ctx.lineTo(x0 + 70, SEA - 146);
    ctx.quadraticCurveTo(x0 + 190, SEA - 160, x0 + 300, SEA - 118);
    ctx.quadraticCurveTo(x0 + 420, SEA - 70, x0 + width, SEA + 2);
    ctx.closePath(); ctx.fill();
    // lighthouse on the high point
    const lx = x0 + 110, base = SEA - 152, h = 34;
    ctx.fillStyle = '#e9edf1';
    ctx.beginPath(); ctx.moveTo(lx - 6, base); ctx.lineTo(lx - 4, base - h); ctx.lineTo(lx + 4, base - h); ctx.lineTo(lx + 6, base); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#dc362c';
    ctx.fillRect(lx - 5.2, base - h * 0.62, 10.4, 7); ctx.fillRect(lx - 4.6, base - h + 2, 9.2, 5);
    ctx.fillStyle = '#1a2230'; ctx.fillRect(lx - 5, base - h - 7, 10, 7);
    ctx.beginPath(); ctx.moveTo(lx - 6, base - h - 7); ctx.lineTo(lx, base - h - 12); ctx.lineTo(lx + 6, base - h - 7); ctx.closePath(); ctx.fill();
    const ly = base - h - 3.5;
    const on = 0.35 + 0.65 * dusk;
    ctx.fillStyle = `rgba(254,220,140,${on})`; ctx.fillRect(lx - 3.5, ly - 2.5, 7, 5);
    if (dusk > 0.05) {
      // slow sweeping beam: long when pointing at us, short when pointing away
      const a = t * 0.9;
      const reach = 180 + 520 * Math.abs(Math.cos(a));
      const dir = Math.sin(a) >= 0 ? 1 : -1;
      const g = ctx.createLinearGradient(lx, ly, lx + dir * reach, ly);
      g.addColorStop(0, `rgba(254,226,160,${0.45 * dusk})`); g.addColorStop(1, 'rgba(254,226,160,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.moveTo(lx, ly - 1.5); ctx.lineTo(lx + dir * reach, ly - 26); ctx.lineTo(lx + dir * reach, ly + 22); ctx.lineTo(lx, ly + 1.5); ctx.closePath(); ctx.fill();
      const glow = ctx.createRadialGradient(lx, ly, 1, lx, ly, 26);
      glow.addColorStop(0, `rgba(254,226,160,${0.6 * dusk})`); glow.addColorStop(1, 'rgba(254,226,160,0)');
      ctx.fillStyle = glow; ell(lx, ly, 26, 26);
    }
  }
}

// Wind-driven rain over everything
function drawRain(t, night) {
  ctx.strokeStyle = `rgba(205,218,232,${0.28 - night * 0.1})`; ctx.lineWidth = 1.1; ctx.lineCap = 'round';
  ctx.beginPath();
  for (const r of rain) {
    const x = ((r.x * (VW + 120) - t * 140 * r.sp) % (VW + 120) + VW + 120) % (VW + 120) - 60;
    const y = ((r.y * WORLD_H + t * 620 * r.sp) % WORLD_H);
    ctx.moveTo(x, y); ctx.lineTo(x - r.len * 0.35, y + r.len);
  }
  ctx.stroke();
}

// Height of the rolling-hill silhouette at screen x (matches hills())
function hillY(x, off, amp, freq, base) {
  const q = x + off;
  return base - amp * (0.55 + 0.45 * Math.sin(q * freq)) * (0.6 + 0.4 * Math.sin(q * freq * 2.3 + 1.7));
}

// An outport: jellybean houses and a white church on the green hills, windows lit at night
function drawOutport(off, cols, t, night) {
  const HOUSE = ['#dc362c', '#feb445', '#3b7dd8', '#f4f7fa', '#2f9e6b', '#f94a18', '#7b4fa3'];
  const period = 1100;
  const first = Math.floor((off - 200) / period);
  for (let n = first; n <= first + Math.ceil(VW / period) + 1; n++) {
    const cx = n * period - off + 300;
    for (let i = 0; i < 9; i++) {
      const hx = cx + i * 17 + (i % 3) * 4;
      if (hx < -20 || hx > VW + 20) continue;
      const gy = hillY(hx, off, 34, 0.005, SEA - 4) + 3;
      const church = i === 4;
      const hw = church ? 11 : 9, hh = church ? 10 : 7;
      ctx.fillStyle = css(mix(hex(church ? '#f4f7fa' : HOUSE[(i + n * 3 + 70) % HOUSE.length]), cols[0], 0.25 + night * 0.6));
      ctx.fillRect(hx - hw / 2, gy - hh, hw, hh);
      ctx.fillStyle = css(mix(hex('#2a2f38'), cols[0], night * 0.5));
      ctx.beginPath(); ctx.moveTo(hx - hw / 2 - 1, gy - hh); ctx.lineTo(hx, gy - hh - 5); ctx.lineTo(hx + hw / 2 + 1, gy - hh); ctx.closePath(); ctx.fill();
      if (church) {
        ctx.fillStyle = css(mix(hex('#f4f7fa'), cols[0], 0.25 + night * 0.6)); ctx.fillRect(hx - 2, gy - hh - 13, 4, 9);
        ctx.fillStyle = css(mix(hex('#2a2f38'), cols[0], night * 0.5));
        ctx.beginPath(); ctx.moveTo(hx - 3, gy - hh - 13); ctx.lineTo(hx, gy - hh - 20); ctx.lineTo(hx + 3, gy - hh - 13); ctx.closePath(); ctx.fill();
      }
      if (night > 0.3 && (i * 5 + n) % 3 !== 0) { ctx.fillStyle = `rgba(254,210,120,${night})`; ctx.fillRect(hx - 1.5, gy - hh + 2, 3, 2.5); }
    }
  }
}

// Towering sea cliffs, with Bird Rock standing off them, white with nesting gannets
function drawBirdRock(off, cols, t, night) {
  const period = 1800;
  const first = Math.floor((off - 300) / period);
  for (let n = first; n <= first + Math.ceil(VW / period) + 1; n++) {
    const x0 = n * period - off + 120;
    if (x0 > VW + 60 || x0 + 700 < -60) continue;
    ctx.fillStyle = css(cols[0]);
    ctx.beginPath(); ctx.moveTo(x0, SEA + 2); ctx.lineTo(x0 + 10, SEA - 150); ctx.quadraticCurveTo(x0 + 160, SEA - 176, x0 + 330, SEA - 160);
    ctx.lineTo(x0 + 350, SEA - 30); ctx.lineTo(x0 + 380, SEA + 2); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = css(mix(cols[0], hex('#8fa77a'), 0.3 * (1 - night)), 0.9); ctx.lineWidth = 3.5;
    ctx.beginPath(); ctx.moveTo(x0 + 12, SEA - 150); ctx.quadraticCurveTo(x0 + 160, SEA - 175, x0 + 328, SEA - 160); ctx.stroke();
    const rx = x0 + 420;                                // Bird Rock
    ctx.fillStyle = css(mix(cols[0], hex('#0a1626'), 0.12));
    ctx.beginPath(); ctx.moveTo(rx, SEA + 2); ctx.lineTo(rx + 8, SEA - 110); ctx.quadraticCurveTo(rx + 45, SEA - 128, rx + 86, SEA - 108); ctx.lineTo(rx + 96, SEA + 2); ctx.closePath(); ctx.fill();
    ctx.fillStyle = `rgba(245,248,250,${0.85 - night * 0.6})`;
    for (let i = 0; i < 70; i++) {
      const gx = rx + 12 + ((i * 37) % 72), gy = SEA - 108 + ((i * 53) % 96) * (0.9 + 0.1 * Math.sin(i));
      ell(gx, gy, 1.3, 1);
    }
    if (night < 0.9) {                                   // gannets wheeling off the rock
      for (let i = 0; i < 10; i++) {
        const a = t * (0.4 + (i % 3) * 0.1) + i * 2.3;
        const gx = rx + 48 + Math.cos(a) * (50 + (i * 29) % 120), gy = SEA - 150 + Math.sin(a * 1.2 + i) * 26;
        const f = Math.sin(t * 5 + i) * 1.4;
        ctx.strokeStyle = `rgba(250,250,250,${0.9 * (1 - night)})`; ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.moveTo(gx - 6, gy - f); ctx.lineTo(gx, gy); ctx.lineTo(gx + 6, gy - f); ctx.stroke();
        ctx.fillStyle = `rgba(20,24,30,${0.9 * (1 - night)})`; ell(gx - 6, gy - f, 1, 1); ell(gx + 6, gy - f, 1, 1);
      }
    }
  }
}

// Icebergs far off on the horizon
function drawFarBergs(off, cols) {
  const period = 900;
  const first = Math.floor((off - 200) / period);
  for (let n = first; n <= first + Math.ceil(VW / period) + 1; n++) {
    const x0 = n * period - off + 140;
    for (const [dx, w, h] of [[0, 90, 34], [260, 60, 52], [470, 120, 26]]) {
      const x = x0 + dx;
      if (x > VW + 40 || x + w < -40) continue;
      ctx.fillStyle = css(cols[0]);
      ctx.beginPath(); ctx.moveTo(x, SEA + 1); ctx.lineTo(x + w * 0.15, SEA - h * 0.7); ctx.lineTo(x + w * 0.35, SEA - h);
      ctx.lineTo(x + w * 0.6, SEA - h * 0.85); ctx.lineTo(x + w * 0.8, SEA - h * 0.3); ctx.lineTo(x + w, SEA + 1); ctx.closePath(); ctx.fill();
      ctx.fillStyle = css(cols[1], 0.7);
      ctx.beginPath(); ctx.moveTo(x + w * 0.35, SEA - h); ctx.lineTo(x + w * 0.6, SEA - h * 0.85); ctx.lineTo(x + w * 0.8, SEA - h * 0.3); ctx.lineTo(x + w, SEA + 1); ctx.lineTo(x + w * 0.5, SEA + 1); ctx.closePath(); ctx.fill();
    }
  }
}

// Fog drifting in from ahead, so things emerge from it as they approach
function drawFrontFog(col, night) {
  const g = ctx.createLinearGradient(VW * 0.5, 0, VW, 0);
  g.addColorStop(0, css(col, 0)); g.addColorStop(1, css(col, 0.62 - night * 0.3));
  ctx.fillStyle = g; ctx.fillRect(VW * 0.5, 0, VW * 0.5 + 2, WORLD_H);
}

// Sea fog lying along the horizon
function drawFog(col, night) {
  const g = ctx.createLinearGradient(0, SEA - 70, 0, SEA + 30);
  g.addColorStop(0, css(col, 0)); g.addColorStop(0.7, css(col, 0.42 - night * 0.2)); g.addColorStop(1, css(col, 0.12));
  ctx.fillStyle = g; ctx.fillRect(0, SEA - 70, VW, 100);
}

function draw() {
  const s = st, t = s.anim, p = s.p;
  const cam = s.cam, z = cam ? cam.z : 1;
  // camera: scale by z around the focus point (the finale's zoom)
  ctx.setTransform(dpr * S * z, 0, 0, dpr * S * z, cam ? dpr * S * cam.fx * (1 - z) : 0, cam ? dpr * S * cam.fy * (1 - z) : 0);
  const u = s.fixedU !== undefined ? s.fixedU : (running ? s.progress : s.idleU);
  const scene = SCENES[s.level.scene];
  const pal = palette(u, scene.keys);
  const night = clamp((u - 0.62) / 0.22, 0, 1);

  // sky
  let g = ctx.createLinearGradient(0, 0, 0, SEA);
  g.addColorStop(0, css(pal.sky[0])); g.addColorStop(0.55, css(pal.sky[1])); g.addColorStop(1, css(pal.sky[2]));
  ctx.fillStyle = g; ctx.fillRect(0, 0, VW, SEA + 4);

  // stars
  if (night > 0) {
    for (const sr of stars) {
      ctx.fillStyle = `rgba(255,255,255,${night * (0.55 + 0.45 * Math.sin(t * 2 + sr.ph))})`;
      ell(sr.x * VW, sr.y, sr.r, sr.r);
    }
  }

  // sun arcs down and sets
  const k = clamp(u / 0.64, 0, 1);
  const sunX = VW * (0.3 + 0.45 * k), sunY = 60 + (SEA + 42 - 60) * Math.pow(k, 1.8);
  const sunC = k < 0.7 ? mix(SUN_DAY, SUN_GOLD, k / 0.7) : mix(SUN_GOLD, SUN_SET, (k - 0.7) / 0.3);
  if (sunY < SEA + 40) {
    const glow = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, 120 + 90 * k);
    glow.addColorStop(0, css(sunC, (0.25 + 0.3 * k) * scene.sunAlpha)); glow.addColorStop(1, css(sunC, 0));
    ctx.fillStyle = glow; ctx.fillRect(sunX - 220, sunY - 220, 440, 440);
    ctx.fillStyle = css(sunC, scene.sunAlpha); ell(sunX, sunY, 30 + 6 * k, 30 + 6 * k);
  }

  // moon rises
  const m = clamp((u - 0.68) / 0.32, 0, 1);
  const moonX = VW * 0.22, moonY = SEA + 30 - (SEA - 50) * (1 - Math.pow(1 - m, 2));
  if (u > 0.68) {
    const mg = ctx.createRadialGradient(moonX, moonY, 5, moonX, moonY, 70);
    mg.addColorStop(0, 'rgba(232,238,245,0.25)'); mg.addColorStop(1, 'rgba(232,238,245,0)');
    ctx.fillStyle = mg; ell(moonX, moonY, 70, 70);
    ctx.fillStyle = `rgba(232,238,245,${scene.moonAlpha})`; ell(moonX, moonY, 17, 17);
    ctx.fillStyle = 'rgba(160,175,195,0.45)'; ell(moonX - 5, moonY - 3, 4, 3.5); ell(moonX + 6, moonY + 5, 3, 2.5); ell(moonX + 3, moonY - 7, 2, 2);
  }

  if (scene.clouds) drawClouds(pal.cloud, s.dist, night);
  if (scene.far === 'outport') {
    hills(s.dist * 0.06, css(pal.hills[0]), 34, 0.005, SEA - 4);
    drawOutport(s.dist * 0.06, pal.hills, t, night);
    hills(s.dist * 0.15 + 400, css(pal.hills[1]), 16, 0.011, SEA);
  } else if (scene.far === 'birdrock') {
    drawBirdRock(s.dist * 0.05, pal.hills, t, night);
    if (scene.fog) drawFog(pal.cloud, night);
    hills(s.dist * 0.15 + 900, css(pal.hills[1]), 12, 0.02, SEA + 1);
  } else if (scene.far === 'bergs') {
    drawFarBergs(s.dist * 0.04, pal.hills);
    if (scene.fog) drawFog(pal.cloud, night);
  } else if (scene.far === 'headland') {
    drawHeadland(s.dist * 0.05, pal.hills, t, clamp((u - 0.45) / 0.25, 0, 1));
    hills(s.dist * 0.15 + 900, css(pal.hills[1]), 14, 0.018, SEA + 1);     // low rocks
  } else if (scene.far === 'island') {
    drawGullIsland(s.dist * 0.05, pal.hills, t, night);
    if (scene.fog) drawFog(pal.cloud, night);
    hills(s.dist * 0.15 + 900, css(pal.hills[1]), 12, 0.02, SEA + 1);     // low rocks
  } else {
    hills(s.dist * 0.06, css(pal.hills[0]), 34, 0.005, SEA - 4);
    hills(s.dist * 0.15 + 400, css(pal.hills[1]), 20, 0.011, SEA);
  }

  // sea
  g = ctx.createLinearGradient(0, SEA, 0, WORLD_H);
  g.addColorStop(0, css(pal.sea[0])); g.addColorStop(0.22, css(pal.sea[1])); g.addColorStop(1, css(pal.sea[2]));
  ctx.fillStyle = g;
  const sw = scene.swell;
  const wave = x => sw * (2.5 * Math.sin((x + s.dist) * 0.045 + t * 1.5 * sw) + 1.4 * Math.sin((x + s.dist) * 0.11 - t * 2.2));
  ctx.beginPath(); ctx.moveTo(0, WORLD_H);
  for (let x = 0; x <= VW + 8; x += 8) ctx.lineTo(x, SEA + wave(x));
  ctx.lineTo(VW + 8, WORLD_H); ctx.closePath(); ctx.fill();

  // reflections
  if (sunY < SEA + 40) {
    const ra = (0.15 + 0.35 * k) * scene.sunAlpha;
    for (let i = 0; i < 7; i++) {
      const w = (46 - i * 5.5) * (0.7 + 0.3 * Math.sin(t * 2.1 + i * 1.3));
      ctx.fillStyle = css(sunC, Math.max(0, ra - i * 0.05));
      ctx.fillRect(sunX - w / 2 + Math.sin(t + i) * 3, SEA + 7 + i * 8, w, 2);
    }
  }
  if (u > 0.72 && moonY < SEA) {
    for (let i = 0; i < 6; i++) {
      const w = (30 - i * 4) * (0.7 + 0.3 * Math.sin(t * 1.7 + i));
      ctx.fillStyle = `rgba(232,238,245,${Math.max(0, 0.3 - i * 0.05) * night})`;
      ctx.fillRect(moonX - w / 2 + Math.sin(t * 0.8 + i) * 3, SEA + 7 + i * 8, w, 1.5);
    }
  }
  ctx.strokeStyle = 'rgba(255,255,255,0.16)'; ctx.lineWidth = 1.5;
  ctx.beginPath(); for (let x = 0; x <= VW + 8; x += 8) ctx.lineTo(x, SEA + wave(x)); ctx.stroke();
  if (scene.whitecaps) {
    ctx.fillStyle = `rgba(235,242,248,${0.55 - night * 0.3})`;
    for (let x = -((s.dist * 1.0) % 47); x <= VW + 20; x += 47) {
      const crest = Math.sin((x + s.dist) * 0.045 + t * 1.5 * sw);
      if (crest > 0.55) ell(x, SEA + wave(x) - 1, 5 + crest * 5, 1.4);
    }
  }

  for (const c of s.cliffs) drawCliff(c, t, night);
  for (const b of s.bergs) drawBerg(b, night);
  for (const f of s.fish) drawCapelin(f, t);
  for (const w of s.whales) drawWhaleBack(w, t);
  for (const se of s.seals) drawSeal(se, t);
  for (const gl of s.gulls) drawGull(gl, t);
  for (const h of s.hunters) drawHunter(h, t);
  for (const j of s.jaegers) drawJaeger(j, t);

  // puffin, with a soft moonlit halo at night so it stays visible
  const under = p.y > SEA + 6;
  if (night > 0.1) {
    const hg = ctx.createRadialGradient(p.x + 8, p.y, 4, p.x + 8, p.y, 48);
    hg.addColorStop(0, `rgba(220,232,245,${0.16 * night})`); hg.addColorStop(1, 'rgba(220,232,245,0)');
    ctx.fillStyle = hg; ell(p.x + 8, p.y, 48, 48);
  }
  ctx.save();
  if (p.inv > 0 && p.inv < 5 && !s.landing && !s.finale && Math.floor(t * 12) % 2) ctx.globalAlpha = 0.45;   // blink after a hit
  const L = s.landing || s.finale;
  if (L) {
    drawPuffin(p.x, p.y, 1, L.pose.ang, { ...L.pose, beak: s.beak, flap: p.flap });
  } else {
    const ang = running ? (p.ang !== undefined ? p.ang : 0) : 0;
    drawPuffin(p.x, p.y, 1, ang, { under, floating: !running, beak: s.beak, flap: p.flap });
  }
  ctx.restore();
  if (L && L.pose.dizzy > 0) {
    const [hx, hy] = L.pose.stand ? standPoint(2, -16.5, L.pose.ang - UPRIGHT) : puffinPoint(14, -7, L.pose.ang);
    drawDizzy(hx, hy - 12, L.pose.dizzy, t);
  }

  for (const w of s.whales) drawWhaleFront(w, t);   // jaws close over a caught puffin

  if (running && under && !s.caught) {
    const bw = 38, bx = p.x - bw / 2 + 4, by = p.y - 30;
    ctx.fillStyle = 'rgba(255,255,255,0.22)'; ctx.fillRect(bx, by, bw, 4);
    ctx.fillStyle = p.breath > 0.3 ? '#ffffff' : '#dc362c'; ctx.fillRect(bx, by, bw * p.breath, 4);
  }

  for (const q of s.parts) {
    ctx.globalAlpha = clamp(q.life / q.max, 0, 1);
    ctx.fillStyle = q.color;
    if (q.fish) { ctx.save(); ctx.translate(q.x, q.y); ctx.rotate(q.rot); ell(0, 0, 6, 2); ctx.restore(); }
    else if (q.confetti) { ctx.save(); ctx.translate(q.x, q.y); ctx.rotate(q.rot); ctx.fillRect(-q.r, -q.r * 0.5, q.r * 2, q.r); ctx.restore(); }
    else if (q.ring) { ctx.strokeStyle = q.color; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(q.x, q.y, q.r, 0, Math.PI * 2); ctx.stroke(); }
    else ell(q.x, q.y, q.r, q.r);
  }
  ctx.globalAlpha = 1;

  if (scene.rain) drawRain(t, night);
  if (scene.frontFog) drawFrontFog(pal.cloud, night);
  for (const c of s.cliffs) drawDropNote(c);

  ctx.textAlign = 'center'; ctx.lineJoin = 'round';
  for (const q of s.pops) {
    ctx.globalAlpha = clamp(q.life / 0.5, 0, 1);
    ctx.font = `800 ${q.size}px ${FONT}`;
    ctx.strokeStyle = 'rgba(10,22,38,0.85)'; ctx.lineWidth = 4;
    ctx.strokeText(q.text, q.x, q.y); ctx.fillStyle = q.color; ctx.fillText(q.text, q.x, q.y);
  }
  ctx.globalAlpha = 1;
}
