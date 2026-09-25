/* ================= SCENES: each level's look, from morning to night ================= */
const hex = h => { const n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
const mix = (a, b, f) => [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
const css = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
const prepKeys = keys => keys.map(k => ({
  u: k.u, sky: k.sky.map(hex), sea: k.sea.map(hex), hills: k.hills.map(hex), cloud: hex(k.cloud || '#ffffff')
}));

const SCENES = {
  // Capelin Scull: clear skies, rolling coastal hills
  coast: {
    far: 'hills', clouds: false, fog: false, sunAlpha: 1, moonAlpha: 1, swell: 1,
    keys: prepKeys([
      { u: 0,    sky: ['#2f6fb0', '#6aa6d8', '#cfe6f2'], sea: ['#3b86b5', '#1d5a86', '#0a2743'], hills: ['#6f93a3', '#4a6f7f'] },
      { u: 0.4,  sky: ['#2d62a0', '#7aa6cf', '#f0dcae'], sea: ['#3a7aa6', '#1b4f78', '#0a223c'], hills: ['#667f95', '#43607a'] },
      { u: 0.6,  sky: ['#1b3560', '#7a4f6e', '#f5813e'], sea: ['#3a5378', '#16304f', '#061223'], hills: ['#3f3c5a', '#26304a'] },
      { u: 0.76, sky: ['#0a1626', '#23284a', '#5a3a52'], sea: ['#1f3350', '#0f2139', '#040b16'], hills: ['#1e2540', '#121b30'] },
      { u: 1,    sky: ['#040a14', '#0a1626', '#14213a'], sea: ['#12233a', '#081628', '#02070f'], hills: ['#0e1628', '#08101e'] }
    ])
  },
  // Gull Island: overcast and cooler, low cloud and sea fog, a steep island offshore
  island: {
    far: 'island', clouds: true, fog: true, sunAlpha: 0.55, moonAlpha: 0.85, swell: 1.2,
    keys: prepKeys([
      { u: 0,    sky: ['#5d7185', '#8fa3b5', '#c9d3da'], sea: ['#4d6e86', '#2a4a63', '#0c2033'], hills: ['#6b7d8a', '#4e5f6b'], cloud: '#e4e9ee' },
      { u: 0.4,  sky: ['#566a80', '#8e9db0', '#d7cfc4'], sea: ['#48677f', '#274560', '#0b1e31'], hills: ['#62707e', '#485864'], cloud: '#d9d9da' },
      { u: 0.6,  sky: ['#34405c', '#7b5a72', '#e08a6a'], sea: ['#3c4f6c', '#1b2e48', '#071322'], hills: ['#403f56', '#2c3447'], cloud: '#a58a96' },
      { u: 0.76, sky: ['#141b2e', '#2d2f47', '#4f3d52'], sea: ['#1f2d45', '#101e33', '#040b16'], hills: ['#1d2338', '#141b2c'], cloud: '#3d3d55' },
      { u: 1,    sky: ['#070b16', '#0f1628', '#1a2338'], sea: ['#131f33', '#0a1526', '#02070f'], hills: ['#101727', '#0a111e'], cloud: '#20283a' }
    ])
  },
  // Baccalieu Tickle: storm cloud, rain, heavy swell with whitecaps, a lighthouse on the headland
  storm: {
    far: 'headland', clouds: true, fog: false, rain: true, whitecaps: true, sunAlpha: 0.28, moonAlpha: 0.45, swell: 2,
    keys: prepKeys([
      { u: 0,    sky: ['#46525f', '#6b7784', '#9aa3a8'], sea: ['#3e5d66', '#23414c', '#0a1c26'], hills: ['#3b4650', '#2b353e'], cloud: '#5a6570' },
      { u: 0.4,  sky: ['#3e4957', '#65707e', '#a3a39c'], sea: ['#3a5761', '#203c47', '#091a24'], hills: ['#36414b', '#28313a'], cloud: '#545e69' },
      { u: 0.6,  sky: ['#262e40', '#4d4659', '#9a6a5e'], sea: ['#2f4552', '#172b38', '#061019'], hills: ['#262b38', '#1b212c'], cloud: '#40414f' },
      { u: 0.76, sky: ['#10141f', '#1f2230', '#3a3240'], sea: ['#1a2835', '#0d1822', '#03080e'], hills: ['#141a24', '#0e131b'], cloud: '#282c38' },
      { u: 1,    sky: ['#05080e', '#0b101a', '#151b26'], sea: ['#101a26', '#08111b', '#02050a'], hills: ['#0b0f17', '#070a10'], cloud: '#181d27' }
    ])
  }
};

const NIGHT_KEYS = [
  { u: 0.76, sky: ['#0a1626', '#23284a', '#5a3a52'], sea: ['#1f3350', '#0f2139', '#040b16'], hills: ['#1e2540', '#121b30'], cloud: '#3a3a52' },
  { u: 1,    sky: ['#040a14', '#0a1626', '#14213a'], sea: ['#12233a', '#081628', '#02070f'], hills: ['#0e1628', '#08101e'], cloud: '#1c2436' }
];
// Trinity Bay: bright summer, green hills with an outport of jellybean houses
SCENES.bay = {
  far: 'outport', clouds: true, fog: false, sunAlpha: 1, moonAlpha: 1, swell: 1,
  keys: prepKeys([
    { u: 0,   sky: ['#3a86c8', '#7cbbe6', '#d8eef8'], sea: ['#2f8fb8', '#1a5f8a', '#0a2a45'], hills: ['#6f9a72', '#4d7a58'], cloud: '#ffffff' },
    { u: 0.4, sky: ['#3378b9', '#86b6de', '#f3e3b8'], sea: ['#2e82ab', '#185479', '#09243d'], hills: ['#66906b', '#467152'], cloud: '#fdf6e8' },
    { u: 0.6, sky: ['#223e6e', '#8a5a78', '#f78a48'], sea: ['#35577e', '#16304f', '#061223'], hills: ['#40504c', '#2a3a38'], cloud: '#e0a58a' },
    ...NIGHT_KEYS
  ])
};
// Cape St. Mary's: towering cliffs and Bird Rock, white with gannets, in a soft sea mist
SCENES.cliffs = {
  far: 'birdrock', clouds: true, fog: true, sunAlpha: 0.75, moonAlpha: 0.9, swell: 1.2,
  keys: prepKeys([
    { u: 0,   sky: ['#6f8aa3', '#a3b8c9', '#dfe6ea'], sea: ['#3f7896', '#235171', '#0b2438'], hills: ['#5f6b5c', '#46524a'], cloud: '#eef2f5' },
    { u: 0.4, sky: ['#67819c', '#a2b3c4', '#eadbc4'], sea: ['#3b6f8c', '#214b6a', '#0a2034'], hills: ['#586451', '#414d44'], cloud: '#e6e2dc' },
    { u: 0.6, sky: ['#2e3d5e', '#7e5c74', '#ec8c62'], sea: ['#35506f', '#182e4a', '#061223'], hills: ['#383a48', '#262d3a'], cloud: '#b08b92' },
    ...NIGHT_KEYS
  ])
};
// Iceberg Alley: cold, pale and foggy, with bergs on the horizon and fog you fly into
SCENES.ice = {
  far: 'bergs', clouds: true, fog: true, frontFog: true, sunAlpha: 0.6, moonAlpha: 0.8, swell: 1,
  keys: prepKeys([
    { u: 0,    sky: ['#8fb0c8', '#bcd2e0', '#e8f0f4'], sea: ['#4f8ea6', '#2a5f7a', '#0c2a3d'], hills: ['#dce8ef', '#b9d0dd'], cloud: '#f2f6f9' },
    { u: 0.4,  sky: ['#86a6c0', '#b8cbda', '#f1e9dc'], sea: ['#4a86a0', '#285a75', '#0b2638'], hills: ['#d6e2ea', '#b3c9d6'], cloud: '#eef0f0' },
    { u: 0.6,  sky: ['#3c4f70', '#8a6f86', '#e89a7a'], sea: ['#35597a', '#1a3450', '#061223'], hills: ['#a8b2c6', '#8a95ad'], cloud: '#c4a3a8' },
    { u: 0.76, sky: ['#101a2e', '#26304a', '#4c4458'], sea: ['#1f3350', '#0f2139', '#040b16'], hills: ['#46526c', '#36415a'], cloud: '#343a52' },
    { u: 1,    sky: ['#050b16', '#0b1628', '#16233a'], sea: ['#12233a', '#081628', '#02070f'], hills: ['#2a384f', '#1f2b40'], cloud: '#1c2436' }
  ])
};

function palette(u, keys) {
  let i = 0; while (i < keys.length - 2 && u > keys[i + 1].u) i++;
  const a = keys[i], b = keys[i + 1], f = clamp((u - a.u) / (b.u - a.u), 0, 1);
  const m = key => a[key].map((c, j) => mix(c, b[key][j], f));
  return { sky: m('sky'), sea: m('sea'), hills: m('hills'), cloud: mix(a.cloud, b.cloud, f) };
}
const SUN_DAY = hex('#fff6dc'), SUN_GOLD = hex('#feb445'), SUN_SET = hex('#f9603a');
const stars = Array.from({ length: 90 }, () => ({ x: Math.random(), y: rand(8, SEA - 30), r: rand(0.5, 1.5), ph: rand(0, 6.28) }));
const rain = Array.from({ length: 110 }, () => ({ x: Math.random(), y: Math.random(), len: rand(10, 20), sp: rand(0.8, 1.2) }));
const clouds = Array.from({ length: 9 }, (_, i) => ({ x: i * 230 + rand(-40, 40), y: rand(26, 110), w: rand(120, 220), ph: rand(0, 6.28) }));
