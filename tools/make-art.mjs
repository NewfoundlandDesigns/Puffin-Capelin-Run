// Renders the phone icons (from assets/icon.svg) and the 1200x630 share image (a real game scene
// with the title over it) into assets/. Needs Playwright's Chromium. Usage: node tools/make-art.mjs
// Run it again after changing the icon, the title, or how the puffin or scene are drawn.
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const R = join(dirname(fileURLToPath(import.meta.url)), '..');
const exe = process.env.CHROMIUM_PATH;                 // optional: a specific Chromium to use
const b = await chromium.launch(exe ? { executablePath: exe } : {});
const p = await b.newPage();

// icons: square corners, since phones round them themselves
const svg = readFileSync(join(R, 'assets/icon.svg'), 'utf8').replace('rx="14"', 'rx="0"');
for (const size of [180, 192, 512]) {
  await p.setViewportSize({ width: size, height: size });
  await p.setContent(`<html><body style="margin:0">${svg.replace('<svg ', `<svg width="${size}" height="${size}" `)}</body></html>`);
  await p.screenshot({ path: join(R, `assets/icon-${size}.png`) });
}

// share image: golden hour, the puffin flying in with a beakful, a sea stack, the title on the left
await p.setViewportSize({ width: 1200, height: 630 });
await p.goto('file://' + join(R, 'index.html')); await p.waitForTimeout(500);
await p.evaluate(async () => {
  await document.fonts.load('800 150px "DM Sans"'); await document.fonts.ready;
  startPanel.hidden = true;
  for (const el of document.querySelectorAll('.mute, .pausebtn')) el.style.display = 'none';
  st = newState(0, 0); st.progress = 0.47;
  st.dist = 5200; st.anim = 1.3;
  st.p.x = 790; st.p.y = SEA - 95; st.p.vy = -90; st.p.ang = -0.18; st.p.flap = 2.2;
  st.beak = [false, false, true, false, false, false, true];
  st.cliffs.push({ x: 940, w: 170, top: 128, used: false });
  for (let k = 0; k < 9; k++) st.fish.push({ x: 600 + k * 26, y: SEA + 95 + (k % 3) * 14, vx: 0, ph: k, amp: 0, gold: k === 4 });
  running = true; paused = true;                       // draw the scene as set, without the game moving it
  const d = document.createElement('div');
  d.style.cssText = 'position:absolute;left:70px;top:130px;color:#fff;text-shadow:0 3px 18px rgba(5,13,24,0.55);font-family:"DM Sans",sans-serif';
  d.innerHTML = '<div style="font-size:150px;font-weight:800;letter-spacing:-0.05em;line-height:0.9">Beakful</div>' +
    '<div style="font-size:34px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:#feb445;margin-top:16px">A Puffin Game</div>' +
    '<div style="font-size:24px;font-weight:500;margin-top:16px;opacity:0.9">Made in Newfoundland</div>';
  document.getElementById('stage').appendChild(d);
  pausePanel.hidden = true; hud.hidden = true;
});
await p.waitForTimeout(400);
await p.screenshot({ path: join(R, 'assets/share.png') });
await b.close();
console.log('Wrote assets/icon-180.png, icon-192.png, icon-512.png and share.png');
