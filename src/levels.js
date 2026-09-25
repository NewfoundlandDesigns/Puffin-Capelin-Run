/* Levels. Each has a name and its own mix of hazards. Times are seconds of game time;
   ranges are [min, max]. hungerSeconds is how long a full puffling lasts without food
   (raise it to make a level more generous). Add a level by adding an entry here. */
const LEVELS = [
  {
    id: 'capelin-scull',
    name: 'Capelin Scull',
    scene: 'coast',
    blurb: 'Seals below and thieving gulls above. A good place to start.',
    gullEvery: [1.8, 3.2],
    seals: { first: 28, every: [13, 19] },
    hunters: null,
    threats: ['seal', 'gull'],
    hungerSeconds: 25
  },
  {
    id: 'gull-island',
    name: 'Gull Island',
    scene: 'island',
    blurb: 'Seals below, and a few great black-backed gulls hunting from above. Dive to shake them.',
    gullEvery: [2.4, 4],
    seals: { first: 28, every: [14, 20] },
    hunters: { first: 22, every: [18, 26], nightFaster: 3 },
    threats: ['seal', 'hunter'],
    hungerSeconds: 25
  },
  {
    id: 'baccalieu-tickle',
    name: 'Baccalieu Tickle',
    scene: 'storm',
    blurb: 'Rough water, more seals and more hunting gulls, with nowhere safe for long.',
    gullEvery: [2.6, 4.2],
    seals: { first: 16, every: [9, 13] },
    hunters: { first: 10, every: [8, 12], nightFaster: 3 },
    threats: ['seal', 'hunter'],
    hungerSeconds: 25
  },
  {
    id: 'cape-st-marys',
    name: "Cape St. Mary's",
    scene: 'cliffs',
    blurb: 'Jaegers chase any puffin carrying fish. Dive to lose them. Watch for the odd hunting gull.',
    gullEvery: [3, 4.6],
    seals: null,
    hunters: { first: 35, every: [26, 34], nightFaster: 3 },
    jaegers: { first: 12, every: [10, 14] },
    threats: ['jaeger', 'hunter'],
    hungerSeconds: 27
  },
  {
    id: 'iceberg-alley',
    name: 'Iceberg Alley',
    scene: 'ice',
    blurb: 'Icebergs drifting out of the fog, most of each one hidden underwater. A few jaegers about.',
    gullEvery: [2.6, 4.2],
    seals: null,
    hunters: null,
    bergs: { first: 5, every: [6, 9] },
    jaegers: { first: 30, every: [22, 30] },
    threats: ['berg', 'jaeger'],
    hungerSeconds: 28
  },
  {
    id: 'trinity-bay',
    name: 'Trinity Bay',
    scene: 'bay',
    blurb: 'Humpbacks lunge up through the capelin. When the bubbles rise, get out of the ring or dive deep under it. A few seals too.',
    gullEvery: [2, 3.6],
    seals: { first: 40, every: [24, 32] },
    hunters: null,
    whales: { first: 10, every: [14, 19] },
    threats: ['whale', 'seal'],
    hungerSeconds: 30
  },
  {
    id: 'funk-island',
    name: 'Funk Island',
    scene: 'funk',
    blurb: 'Gannets drop like spears from high above. When a shadow slides toward you, change depth or dive below it. A few whales too.',
    gullEvery: [2.4, 4],
    seals: null,
    hunters: null,
    gannets: { first: 8, every: [4.5, 7] },
    whales: { first: 35, every: [24, 32] },
    threats: ['gannet', 'whale'],
    hungerSeconds: 30
  }
];
