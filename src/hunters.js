/* Great black-backed gulls (Gull Island). Each one circles overhead, calls a warning,
   then swoops at the puffin. They can't follow below the surface. A catch ends the run. */
function spawnHunter() {
  st.hunters.push({
    x: VW + 60, y: rand(38, 70), vx: 0, vy: 0, speed: 0,
    state: 'enter', t: 0, ph: rand(0, 6.28), hold: VW * rand(0.62, 0.8)
  });
  Snd.gullCry(0.07);
}

function updateHunters(wdt) {
  const s = st, p = s.p;
  for (const h of s.hunters) {
    h.t -= wdt;
    if (h.state === 'enter') {
      h.x -= (s.speed + 140) * wdt;
      h.y += Math.sin(s.anim * 2 + h.ph) * 12 * wdt;
      if (h.x <= h.hold) { h.state = 'circle'; h.t = rand(0.9, 1.6); }
    } else if (h.state === 'circle' || h.state === 'warn') {
      h.x = h.hold + Math.sin(s.anim * 1.6 + h.ph) * 18;   // hanging on the wind
      h.y = clamp(h.y + Math.cos(s.anim * 1.6 + h.ph) * 14 * wdt, 30, 90);
      if (h.state === 'circle' && h.t <= 0) { h.state = 'warn'; h.t = 0.75; Snd.hunterCry(); }
      else if (h.state === 'warn' && h.t <= 0) {
        h.state = 'dive'; h.t = 2.5; Snd.swoop();
        const ty = Math.min(p.y + p.vy * 0.2, SEA);
        const a = Math.atan2(ty - h.y, p.x - h.x);
        h.speed = 360; h.vx = Math.cos(a) * h.speed; h.vy = Math.sin(a) * h.speed;
      }
    } else if (h.state === 'dive') {
      h.speed = Math.min(560, h.speed + 260 * wdt);
      let cur = Math.atan2(h.vy, h.vx);
      if (h.x > p.x + 10) {                // steers toward the puffin, but can be out-turned
        const want = Math.atan2(Math.min(p.y, SEA) - h.y, p.x - h.x);
        let d = want - cur;
        while (d > Math.PI) d -= Math.PI * 2;
        while (d < -Math.PI) d += Math.PI * 2;
        cur += clamp(d, -1.6 * wdt, 1.6 * wdt);
      }
      h.vx = Math.cos(cur) * h.speed; h.vy = Math.sin(cur) * h.speed;
      h.x += h.vx * wdt; h.y += h.vy * wdt;
      if (h.y >= SEA - 6) {                // hits the water and has to pull up
        h.y = SEA - 6;
        burst(h.x, SEA, 12, 'rgba(220,235,250,0.9)', 140, 500, 1.5, 3, 0.6);
        Snd.splash(0.6);
        h.state = 'climb';
      } else if (h.x < p.x - 70 || h.t <= 0) h.state = 'climb';
    } else if (h.state === 'climb') {
      h.vx += (-(s.speed + 260) - h.vx) * Math.min(1, wdt * 3);
      h.vy += (-280 - h.vy) * Math.min(1, wdt * 3);
      h.x += h.vx * wdt; h.y += h.vy * wdt;
    }
    if (h.state === 'dive' && p.inv <= 0 && !s.landing && !s.caught && Math.hypot(h.x - p.x, h.y - p.y) < 24) {
      caught('gull', h);
    }
  }
  s.hunters = s.hunters.filter(h => h === (s.caught && s.caught.by) || (h.x > -90 && h.y > -90 && h.x < VW + 220));
}

function drawHunter(h, t) {
  const diving = h.state === 'dive', warn = h.state === 'warn';
  let ang = 0;
  if (diving || h.state === 'climb' || h.carrying) {
    ang = Math.atan2(h.vy, h.vx) - Math.PI;         // beak leads the way
    while (ang < -Math.PI) ang += Math.PI * 2;
    while (ang > Math.PI) ang -= Math.PI * 2;
  }
  ctx.save(); ctx.translate(h.x, h.y); ctx.rotate(ang); ctx.scale(1.5, 1.5);
  ctx.strokeStyle = '#1a2230'; ctx.lineWidth = 4.2; ctx.lineCap = 'round';
  if (diving) {                                     // wings swept back
    ctx.beginPath(); ctx.moveTo(0, -1); ctx.quadraticCurveTo(10, -8, 24, -6); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(2, 1); ctx.quadraticCurveTo(12, 6, 24, 5); ctx.stroke();
  } else {
    const f = Math.sin(t * (warn ? 12 : h.carrying ? 10 : 5) + h.ph), up = warn ? -6 : 0;
    ctx.beginPath(); ctx.moveTo(-2, 0); ctx.quadraticCurveTo(-9, -10 * f - 5 + up, -24, -16 * f - 2 + up); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(3, 0); ctx.quadraticCurveTo(11, -10 * f - 5 + up, 25, -16 * f - 2 + up); ctx.stroke();
  }
  ctx.fillStyle = '#f4f7fa'; ell(1, 2, 12, 5.5);
  ctx.fillStyle = '#1a2230';
  ctx.beginPath(); ctx.moveTo(11, 0); ctx.lineTo(19, -1); ctx.lineTo(18, 5); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#f4f7fa'; ell(-10, -1, 5.4, 5);
  ctx.fillStyle = '#feb445';
  ctx.beginPath(); ctx.moveTo(-14.5, -2.4); ctx.lineTo(-22, -0.8); ctx.lineTo(-14.5, 0.4); ctx.closePath(); ctx.fill();
  if (warn) { ctx.beginPath(); ctx.moveTo(-14.5, 0.6); ctx.lineTo(-20.5, 3.4); ctx.lineTo(-14.5, 2.2); ctx.closePath(); ctx.fill(); }
  ctx.fillStyle = '#dc362c'; ell(-19, 0, 0.9, 0.9);                   // red spot on the bill
  ctx.fillStyle = '#10233d'; ell(-11.5, -2.4, 1.1, 1.1);
  ctx.restore();

  if (warn) {                                       // fair warning: aim line and alert badge
    const a = 0.6 + 0.4 * Math.sin(t * 14);
    ctx.save();
    ctx.setLineDash([4, 6]);
    ctx.strokeStyle = `rgba(254,180,69,${0.5 * a})`; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(h.x, h.y); ctx.lineTo(st.p.x, Math.min(st.p.y, SEA)); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = `rgba(220,54,44,${a})`; ell(h.x, h.y - 34, 9, 9);
    ctx.fillStyle = '#ffffff'; ctx.font = `800 13px ${FONT}`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('!', h.x, h.y - 33);
    ctx.textBaseline = 'alphabetic';
    ctx.restore();
  }
}
