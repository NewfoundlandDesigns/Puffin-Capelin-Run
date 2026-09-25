/* Icebergs (Iceberg Alley). Most of each berg is hidden below the waterline, just like the
   real thing. Bumping one knocks your catch loose and bounces you off: fly over the tip or
   dive under the keel. Shapes are polygons with y measured from sea level. */
function spawnBerg() {
  const w = rand(150, 240), top = rand(35, 110), depth = rand(110, 250);
  const tipL = w * rand(0.18, 0.32), tipW = w * rand(0.4, 0.52);
  const poly = [
    [tipL, 0], [tipL + tipW * 0.18, -top * 0.72], [tipL + tipW * 0.4, -top], [tipL + tipW * 0.62, -top * 0.84],
    [tipL + tipW * 0.82, -top * 0.46], [tipL + tipW, 0],
    [w * 0.95, depth * 0.22], [w, depth * 0.55], [w * 0.8, depth * 0.9], [w * 0.5, depth],
    [w * 0.2, depth * 0.86], [0, depth * 0.5], [w * 0.05, depth * 0.14]
  ];
  st.bergs.push({ x: VW + 40, w, top, depth, poly, tipL, tipW });
}

function inPoly(poly, x, y) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

function updateBergs(wdt, scroll) {
  const s = st, p = s.p;
  for (const b of s.bergs) {
    b.x -= scroll * wdt;
    if (p.inv > 0 || s.landing || s.caught || s.finale) continue;
    const pts = [[0, 0], [12, 0], [-12, 0], [0, 9], [0, -9], [26, -5]];
    if (pts.some(([dx, dy]) => inPoly(b.poly, p.x + dx - b.x, p.y + dy - SEA))) {
      p.inv = 1.2;
      p.vy = p.y < SEA ? -260 : 220;
      Snd.bergBump();
      burst(p.x + 10, p.y, 10, 'rgba(235,245,252,0.9)', 120, 200, 1.2, 2.5, 0.5);
      if (stackN() > 0) loseStack('Bumped an iceberg');
      else pop('Bonk', p.x + 20, p.y - 40);
    }
  }
  s.bergs = s.bergs.filter(b => b.x + b.w > -40);
}

function drawBerg(b, night) {
  ctx.save(); ctx.translate(b.x, SEA);
  const path = () => { ctx.beginPath(); b.poly.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); };
  // the hidden mass: pale turquoise seen through the water
  ctx.save(); ctx.beginPath(); ctx.rect(-10, 1, b.w + 20, b.depth + 10); ctx.clip();
  path(); ctx.fillStyle = `rgba(150,210,228,${0.34 - night * 0.14})`; ctx.fill();
  ctx.strokeStyle = `rgba(210,238,248,${0.4 - night * 0.2})`; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.restore();
  // the tip: bright ice with a shaded face
  ctx.save(); ctx.beginPath(); ctx.rect(-10, -b.top - 10, b.w + 20, b.top + 11); ctx.clip();
  path(); ctx.fillStyle = css(mix(hex('#f4f9fc'), hex('#7d93ab'), night * 0.7)); ctx.fill();
  ctx.fillStyle = css(mix(hex('#a9cde0'), hex('#4a5f78'), night * 0.7), 0.8);
  const L = b.tipL, W = b.tipW;
  ctx.beginPath(); ctx.moveTo(L + W * 0.4, -b.top); ctx.lineTo(L + W * 0.62, -b.top * 0.84); ctx.lineTo(L + W * 0.82, -b.top * 0.46);
  ctx.lineTo(L + W, 0); ctx.lineTo(L + W * 0.5, 0); ctx.closePath(); ctx.fill();
  ctx.restore();
  ctx.restore();
}
