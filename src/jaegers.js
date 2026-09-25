/* Jaegers (Cape St. Mary's). Pirate seabirds that don't want the puffin, just its fish.
   One only comes when you're carrying a stack. It chases from behind, and if it catches
   you it knocks the catch loose and makes off with it. It won't follow you underwater:
   dive and it hangs about above the surface for a bit, then gives up. */
function spawnJaeger() {
  st.jaegers.push({ x: -60, y: rand(60, SEA - 60), vx: 60, vy: 0, state: 'chase', t: 7, waited: 0, ph: rand(0, 6.28) });
  Snd.jaegerCall();
}

function updateJaegers(wdt) {
  const s = st, p = s.p;
  for (const j of s.jaegers) {
    j.t -= wdt;
    if (j.state === 'chase') {
      const under = p.y > SEA + 10;
      const tx = p.x + 4, ty = under ? SEA - 44 : p.y;
      const dx = tx - j.x, dy = ty - j.y, d = Math.hypot(dx, dy) || 1;
      const spd = under ? 130 : 250;
      j.vx += (dx / d * spd - j.vx) * Math.min(1, wdt * 2.2);
      j.vy += (dy / d * spd - j.vy) * Math.min(1, wdt * 2.2);
      if (under) j.waited += wdt;
      if (j.t <= 0 || j.waited > 2.5 || stackN() === 0 || s.landing || s.finale) j.state = 'leave';
      else if (!under && !s.caught && p.inv <= 0 && Math.hypot(j.x - p.x, j.y - p.y) < 22) steal(j);
    } else {
      j.vx += ((-(s.speed + 160)) - j.vx) * Math.min(1, wdt * 2);
      j.vy += (-150 - j.vy) * Math.min(1, wdt * 2);
    }
    j.x += j.vx * wdt; j.y += j.vy * wdt;
  }
  s.jaegers = s.jaegers.filter(j => j.x > -140 && j.y > -120 && j.x < VW + 200);
}

function steal(j) {
  const p = st.p;
  p.inv = 1.0; p.vy = 140;
  for (const g of st.beak) {
    st.parts.push({ x: p.x + 26, y: p.y, vx: rand(-80, 60), vy: rand(-120, -20), g: 500, r: 3, life: 0.9, max: 0.9,
      color: g ? '#feb445' : '#c9d6e3', fish: true, rot: rand(0, 6) });
  }
  st.beak = [];
  j.state = 'leave'; j.carry = true;
  Snd.jaegerSteal();
  pop('A jaeger stole your catch', p.x + 20, p.y - 40, '#ffffff', 16);
}

function drawJaeger(j, t) {
  const ang = Math.atan2(j.vy, j.vx);
  const f = Math.sin(t * 16 + j.ph);
  ctx.save(); ctx.translate(j.x, j.y); ctx.rotate(ang); ctx.scale(1.35, 1.35);
  ctx.strokeStyle = '#2e2722'; ctx.lineWidth = 1.6; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-9, 0); ctx.lineTo(-25, -1.2); ctx.moveTo(-9, 0.5); ctx.lineTo(-25, 1.8); ctx.stroke();   // tail streamers
  ctx.strokeStyle = '#3a312b'; ctx.lineWidth = 3.6;
  ctx.beginPath(); ctx.moveTo(1, -1); ctx.lineTo(-6, -8 - 7 * f); ctx.lineTo(-16, -10 - 10 * f); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(1, 1); ctx.lineTo(-6, 8 + 7 * f); ctx.lineTo(-16, 10 + 10 * f); ctx.stroke();
  ctx.fillStyle = '#4b4038'; ell(0, 0, 11, 4.4);
  ctx.fillStyle = '#d8d0c0'; ell(2, 1.6, 7.5, 2.4);
  ctx.fillStyle = '#2e2722'; ell(9, -0.6, 4.6, 4);
  ctx.beginPath(); ctx.moveTo(12.5, -1.5); ctx.lineTo(17, -0.4); ctx.lineTo(12.5, 0.8); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#ffffff'; ell(10.4, -1.6, 0.6, 0.6);
  if (j.carry) { ctx.fillStyle = '#c9d6e3'; ell(16, 2.5, 1.5, 5, 0.3); }
  ctx.restore();
  if (j.state === 'chase' && j.x < 16) {              // warning at the left edge as it comes in
    const a = 0.6 + 0.4 * Math.sin(t * 14);
    ctx.fillStyle = `rgba(220,54,44,${a})`;
    ctx.beginPath(); ctx.moveTo(6, j.y); ctx.lineTo(18, j.y - 9); ctx.lineTo(18, j.y + 9); ctx.closePath(); ctx.fill();
  }
}
