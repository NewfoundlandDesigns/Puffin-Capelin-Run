# Fun Puffin

A small one-button game about an Atlantic puffin feeding its puffling off the Newfoundland coast, from morning until nightfall.

Hold to dive, let go to rise. Catch capelin, stack them in your beak, and deliver them to burrows along the way to keep your puffling fed. If its hunger meter empties, the run is over. Every extra fish in a stack scores more than the last, and golden capelin multiply the delivery and count double for hunger. Reach 100% to make it home to the colony, which unlocks the next level. Watch your air underwater and keep clear of gulls; if a seal catches you, the run is over.

## Levels

Each level brings in one new foe, plus a little of something from earlier, so the difficulty climbs gently. Finishing a level unlocks the next.

1. **Capelin Scull.** Seals below, thieving gulls above. "Capelin scull" is the Newfoundland name for the capelin run.
2. **Gull Island.** Seals, plus a few great black-backed gulls that circle, call a warning, then swoop. A catch ends the run, so dive to shake them. Named for the puffin colony in the Witless Bay Ecological Reserve.
3. **Baccalieu Tickle.** More seals and more hunting gulls, in a storm. A "tickle" is a narrow strait; the one by Baccalieu Island is known for rough water.
4. **Cape St. Mary's.** Jaegers, pirate seabirds that chase any puffin carrying fish and steal the stack. Dive to lose them. The odd hunting gull.
5. **Iceberg Alley.** Icebergs drifting out of the fog, most of each one hidden underwater. Bumping one knocks your catch loose. A few jaegers.
6. **Trinity Bay.** The hardest level: humpback whales feeding on capelin. A bubble ring and a shaded zone warn where one will lunge. Get caught in its mouth and it swallows you, which ends the run; get clear of the ring or dive deep and pass under it. A few seals too.

Later levels give the puffling a little more patience (`hungerSeconds` 27, 28 and 30 for Levels 4 to 6, instead of 25).

Each level has its own scenery: clear skies and rolling hills (Capelin Scull), overcast with a seabird island (Gull Island), a storm with a lighthouse (Baccalieu Tickle), towering cliffs and Bird Rock white with gannets (Cape St. Mary's), pale fog with bergs on the horizon (Iceberg Alley), and summer hills with an outport of jellybean houses (Trinity Bay).

Levels are defined in `src/levels.js` (name, scene, hazards) and scenes in `src/palette.js`; adding a level is a new entry in each.

## How to play

The level picker has a **How to play** button that starts a guided practice run: no dangers, one skill at a time (dive, rise, catch, deliver, feeding the puffling, stacking and golden capelin, dangers, getting home). It lives in `src/tutorial.js`; each step is one entry in `TUT_STEPS`.

## Playing it

Open `index.html` in a browser. No install, no build step, no server needed.

Controls: hold the mouse button, a finger, or the space bar to dive. `M` toggles sound.

## Project layout

```
index.html        page markup; loads the files below in order
src/style.css     layout, HUD and panels
src/util.js       shared constants (run length, sea level, stack size) and helpers
src/levels.js     level names and hazard settings
src/audio.js      all sound, synthesized with the Web Audio API (no audio files)
src/palette.js    each level's scene: day-to-night colour keyframes, clouds, stars
src/draw.js       drawing: puffin, capelin, gulls, seals, sea stacks, scenery
src/landing.js    the burrow landing sequence (faceplant, drop, takeoff)
src/hunters.js    great black-backed gulls that hunt the puffin (Gull Island)
src/whales.js     humpback whales that lunge up through a bubble ring (Trinity Bay)
src/jaegers.js    jaegers that chase a puffin carrying fish and steal it (Cape St. Mary's, Iceberg Alley)
src/icebergs.js   icebergs, mostly underwater, that knock your catch loose (Iceberg Alley)
src/finale.js     end-of-level zoom and crash landing at the home colony
src/tutorial.js   the guided How to play run
src/chatter.js    what the hungry puffling and the out-of-breath puffin say (edit the lines here)
src/game.js       game state, spawning, collisions, scoring, input and the main loop
tools/build.mjs   bundles everything into one self-contained HTML file
```

The scripts are plain classic scripts that share globals, loaded in order, so the game runs straight from the file system.

Testing: `UNLOCK_ALL` in `src/util.js` makes every level playable (currently on; set it to `false` before release). Shift+U on the level picker also unlocks everything.

## Single-file build

```
node tools/build.mjs
```

Writes `dist/fun-puffin.html`, with all CSS and JS inlined. Handy for sharing or hosting as one file.

## Tuning

Most of the feel lives in a few places:

- `src/util.js`: `LEVEL_DIST` (level length), `FEED_PER_FISH`, `AIR_SECONDS`, `MAX_STACK`
- `src/levels.js`: per-level `hungerSeconds` (how long a full puffling lasts) and hazard timings
- `src/game.js`, `update()`: spawn timers for fish, golden capelin, gulls, seals and sea stacks, plus scroll speed
- `src/game.js`, `deliver()`: scoring (triangular stack score × golden multiplier)

## Ideas for later

- Weather: fog, wind gusts, storm swell
- Crash landings and a happier mate reaction on big deliveries
- A whale that surfaces and scatters a school
- A season mode: raise a puffling over several runs until it fledges

---

Made in Newfoundland.
