# Fun Puffin

A small one-button game about an Atlantic puffin feeding its puffling off the Newfoundland coast, from morning until nightfall.

Hold to dive, let go to rise. Catch capelin, stack them in your beak, and deliver them to burrows along the way to keep your puffling fed. It gulps each delivery down one fish at a time and grows as it eats. The striped part of its meter shows what your beak will add; fish that don't fit give it a full belly, a few seconds without getting hungry. If the meter empties, you get a few seconds' last chance to reach a burrow before the run is over. Every extra fish in a stack scores more than the last, and golden capelin multiply the delivery and count double for hunger. Reach 100% to make it home to the colony, which unlocks the next level. Watch your air underwater and keep clear of gulls; if a seal catches you, the run is over.

## Levels

Each level brings in one new foe, plus a little of something from earlier, so the difficulty climbs gently. Finishing a level unlocks the next.

1. **Capelin Scull.** Seals below, thieving gulls above. "Capelin scull" is the Newfoundland name for the capelin run.
2. **Gull Island.** Seals, plus a few great black-backed gulls that circle, call a warning, then swoop. A catch ends the run, so dive to shake them. Named for the puffin colony in the Witless Bay Ecological Reserve.
3. **Baccalieu Tickle.** More seals and more hunting gulls, in a storm. A "tickle" is a narrow strait; the one by Baccalieu Island is known for rough water.
4. **Cape St. Mary's.** Jaegers, pirate seabirds that chase any puffin carrying fish and steal the stack. Dive to lose them. The odd hunting gull.
5. **Iceberg Alley.** Icebergs drifting out of the fog, most of each one hidden underwater. Bumping one knocks your catch loose. A few jaegers.
6. **Trinity Bay.** Humpback whales feeding on capelin. A bubble ring and a shaded zone warn where one will lunge. Get caught in its mouth and it swallows you, which ends the run; get clear of the ring or dive deep and pass under it. A few seals too.
7. **Funk Island.** The hardest level: northern gannets, which plunge-dive like spears from high above. One flies in and stalks you from just ahead, its shadow following you on the water. When it locks on (a sharp cry, the shadow turns red) it tips nose-down, then drops straight down and deep into the sea at the depth you were at. A hit knocks your catch loose; change depth once it locks on, or dive below it. A few whales too. Funk Island, far off the northeast coast, is home to a big gannet colony.

Later levels give the puffling a little more patience (`hungerSeconds` 27, 28, 30 and 30 for Levels 4 to 7, instead of 25).

Each level has its own scenery: clear skies and rolling hills (Capelin Scull), overcast with a seabird island (Gull Island), a storm with a lighthouse (Baccalieu Tickle), towering cliffs and Bird Rock white with gannets (Cape St. Mary's), pale fog with bergs on the horizon (Iceberg Alley), summer hills with an outport of jellybean houses (Trinity Bay), and open ocean with a low granite island white with seabirds (Funk Island).

Levels are defined in `src/levels.js` (name, scene, hazards) and scenes in `src/palette.js`; adding a level is a new entry in each.

## Outfits

The level picker has a **Wardrobe**: outfits for your puffin, earned by playing. There are five slots and your puffin can wear one of each: a hat, glasses, a scarf or necklace, boots, and feathers. They only change the look, never how the puffin plays. Items you haven't earned are greyed out with a padlock; hover over one (or tap it) to see how to earn it. The end screen announces anything new with a **Wear it** button.

| Slot | Item | Earned by |
|---|---|---|
| Hats | Sou'wester | Finishing Baccalieu Tickle |
| | Knitted toque | Finishing Iceberg Alley |
| | Pitcher plant crown | Growing your puffling to full size in one run |
| | Captain's cap | Finishing Funk Island |
| | Mummer | Finishing all seven levels |
| Glasses | Nan's reading glasses | Finishing How to play |
| | Sunglasses | Scoring 5,000 on Trinity Bay |
| | Ski goggles | Making 100 deliveries in all |
| Scarves & necklaces | Pink, white and green scarf | Finishing Capelin Scull |
| | Newfoundland tartan scarf | Delivering a full 12-fish stack |
| | Lucky horseshoe | Saving your puffling at the last second 5 times |
| Boots | Rubber boots | Delivering 250 capelin in all |
| | Knitted vamps | Playing 20 runs |
| | Fisherman's boots | Finishing Cape St. Mary's |
| Feathers | Golden puffin | Catching 50 golden capelin in all |

Outfits live in `src/outfits.js`: each is one entry in `OUTFITS` with its slot, unlock test and look. Lifetime stats are saved in the browser (`capelin-run-stats`); levels finished before outfits existed count too.

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
src/gannets.js    gannets that plunge-dive from above and knock your catch loose (Funk Island)
src/finale.js     end-of-level zoom and crash landing at the home colony
src/tutorial.js   the guided How to play run
src/outfits.js    outfits: unlock tests, lifetime stats, and how each one is drawn
src/chatter.js    what the hungry puffling and the out-of-breath puffin say (edit the lines here)
src/game.js       game state, spawning, collisions, scoring, input and the main loop
tools/build.mjs   bundles everything into one self-contained HTML file
tools/smoke-test.mjs  plays through every level, the tutorial and key failure cases headlessly
```

The scripts are plain classic scripts that share globals, loaded in order, so the game runs straight from the file system.

Testing: `UNLOCK_ALL` in `src/util.js` makes every level and outfit available (currently on; set it to `false` before release). Shift+U on the level picker also unlocks everything.

## Single-file build

```
node tools/build.mjs
```

Writes `dist/fun-puffin.html`, with all CSS and JS inlined. Handy for sharing or hosting as one file.

## Testing

```
node tools/smoke-test.mjs
```

Builds the game and plays through every level to the finale, hunger running out, a whale catch and escape, and the tutorial, without a browser.

## Tuning

Most of the feel lives in a few places:

- `src/util.js`: `LEVEL_DIST` (level length), `FEED_PER_FISH`, `AIR_SECONDS`, `MAX_STACK`, and feeding: `GULP_EVERY`, `FULL_PER_FISH`, `FULL_MAX`, `LAST_CHANCE`, `GROW_FISH`
- `src/levels.js`: per-level `hungerSeconds` (how long a full puffling lasts) and hazard timings
- `src/game.js`, `update()`: spawn timers for fish, golden capelin, gulls, seals and sea stacks, plus scroll speed
- `src/game.js`, `deliver()`: scoring (triangular stack score × golden multiplier); `feed()`, `updateFeeding()`, `startLastChance()`: the puffling's meter

## Ideas for later

- Weather: fog, wind gusts, storm swell
- Crash landings and a happier mate reaction on big deliveries
- A whale that surfaces and scatters a school
- A season mode: raise a puffling over several runs until it fledges

---

Made in Newfoundland.
