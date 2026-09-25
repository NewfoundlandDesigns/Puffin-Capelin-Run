# Fun Puffin: notes for Claude

A one-button browser game: an Atlantic puffin feeds its puffling off the Newfoundland coast,
from morning to nightfall. Hold to dive, let go to rise. Built as a fun side project by
Mark (NewfoundlandDesigns), who shares the "Fun Puffin" name with his consulting brand.

Repo: https://github.com/NewfoundlandDesigns/Puffin-Capelin-Run (branch `main`).

## Run, build, test

- Play: open `index.html` directly in a browser. No server, no install, no build step.
- Single-file build: `node tools/build.mjs` writes `dist/fun-puffin.html` (CSS and JS inlined).
  `dist/` is gitignored.
- Smoke test: `node tools/smoke-test.mjs`. Builds, then plays through every level to the
  finale, hunger failure, whale catch/escape, and the tutorial, headlessly. Run it after
  every change; it must stay green.
- Visual checks: the smoke test stubs the canvas, so it can't catch drawing problems. To see
  frames, render with `@napi-rs/canvas` (`npm i @napi-rs/canvas` in a scratch folder): stub the
  DOM the same way as the smoke test, but return a real canvas context for `game`, then call
  `draw()` and save a PNG. This caught most of the visual bugs so far; worth doing for any
  animation or art change.

## Architecture

Plain classic scripts (not modules) sharing globals, loaded in this order by `index.html`:

```
util.js      constants (WORLD_H 600, SEA 270, LEVEL_DIST, MAX_STACK, AIR_SECONDS,
             FEED_PER_FISH, UNLOCK_ALL), rand/clamp, localStorage wrapper
levels.js    LEVELS: name, scene, hazard timings, threats (for the preview), hungerSeconds
audio.js     Snd: all sound synthesized with Web Audio (no audio files)
palette.js   SCENES: per-level day-to-night colour keyframes and scenery flags
draw.js      all drawing: puffin (flying + standing), foes, scenery, callouts, draw()
landing.js   burrow landing sequence (approach, crash, drop, takeoff), groundY, standPoint
hunters.js   great black-backed gulls that swoop (fatal)
whales.js    humpbacks: bubble-ring warning, lunge, swallow (fatal); drawn in two layers
jaegers.js   pirate seabirds that steal a carried stack
icebergs.js  drifting bergs, mostly underwater; bump knocks the stack loose
gannets.js   plunge-diving gannets: shadow warning, spear dive aimed at puffin or a school
finale.js    end-of-level zoom and crash landing at the home colony
tutorial.js  guided How to play run (TUT_STEPS)
chatter.js   puffling and puffin speech bubbles (edit the lines here)
game.js      DOM refs, state (newState), update loop, spawning, collisions, HUD,
             level picker with live preview, start/end flow, input, main loop
```

Order matters: later files use earlier globals at call time. Keep `index.html` runnable
from `file://` (no ES modules, no fetch of local files).

Key ideas:
- World space is 600 units tall; sea surface at `SEA` (270). Width `VW` depends on aspect.
  `S` scales world to screen. The finale camera zoom lives in `st.cam`.
- All game state is `st` (from `newState(idleU, levelIdx, levelOverride)`).
- Progress is distance (`st.dist / LEVEL_DIST`), not time; it also drives the sky from day
  to night and the speed ramp. A level takes about 2 minutes.
- Puffin drawing: `drawPuffin(x, y, scale, ang, opts)`. `opts.stand = 1` uses the upright
  standing drawing (lean = ang - UPRIGHT); otherwise the horizontal flying/swimming one.
  Landing and finale poses set `pose.stand` per phase. Wing: `lift` raises, `fold` tucks.
- Humpbacks: knobbly tubercles on the head outline, a pleated throat pouch that balloons
  (`whalePouch`), long white flippers held out at the waterline, barnacles, and a fluke-up
  as it dives away (`drawFluke`, harmless).
- Whales draw in two passes (`drawWhaleBack` before the puffin, `drawWhaleFront` after) so
  the jaws can close over a caught puffin.
- The level picker preview draws the real scene by temporarily swapping `ctx`, `VW`, `S`,
  `dpr` and `st` (see `drawPreview`).
- Run-enders go through `caught(reason)`: seal, gull, whale, hungry. Finishing goes through
  the finale then `endGame('complete')`, which unlocks the next level.

## Style and constraints

- Brand palette: navy `#10233d`, beak orange `#f94a18` (navy text on it, not white),
  orange-strong `#d64015` for buttons with white text, amber `#feb445` for celebration,
  alert `#dc362c`, shell `#edf1f6` (the puffin's belly). Font: DM Sans.
- Everything is drawn in code. No image or audio files. No external requests except the
  Google Fonts stylesheet.
- Respect `prefers-reduced-motion` in CSS animations.
- Tone: warm and funny, a bit of Newfoundland flavour (see chatter lines, level names).
  Losing should feel gentle.

## Design decisions so far (and why)

- Seven levels, each adding one new foe plus a little of an earlier one, so early levels
  stay approachable. Order: Capelin Scull (seals, thieving gulls), Gull Island (seals + a
  few hunting gulls), Baccalieu Tickle (more of both, storm), Cape St. Mary's (jaegers +
  odd hunter), Iceberg Alley (bergs + a few jaegers), Trinity Bay (whales + a few seals),
  Funk Island (gannets + a few whales). Funk Island is last because gannets plus whales is
  the hardest mix.
- Gannets (Funk Island): stalk -> lock -> dive. It stalks from just ahead and above the puffin
  for `GANNET.STALK` s, following its depth; then locks on (cry, red shadow, nose-down) and
  commits to the puffin's depth at that moment; `GANNET.LOCK` s later it dives straight down to
  `GANNET.DEPTH` below the surface, timed to meet the puffin. The first version aimed at spawn
  and at schools far ahead, so it was never a real threat (Mark's feedback). It dives from
  above the puffin (`gannetTop`), so flying high isn't a hiding place. Only the bill and head
  hit, so pulling up or down after the lock dodges it; so does diving below it. A hit only
  costs the stack (like gulls/jaegers); a plunge eats up to 2 capelin and scatters the rest
  (`f.dy`).
- Whales are fatal, but only the head/mouth once it breaks the surface; diving below the
  shaded warning zone passes safely under. The warning zone matches the danger depth.
- Hunger replaced the timer: 25 s for a full meter on levels 1 to 3, then 27, 28, 30.
  Later levels are meant to be more generous.
- Landings: about 1.9 s, no slow motion (Mark disliked slowing the scroll), smooth eased
  poses. Invulnerable while landing. Callout sits up and right of the burrow so it doesn't
  cover the puffin.
- Feeding: a delivery scores at once, but the puffling gulps the fish one at a time
  (`st.feedQ`, every `GULP_EVERY` s). Food past 100% becomes full-belly time (`st.full`,
  no hunger drain), so big stacks never go to waste. The HUD meter previews the beak's food
  as a striped segment, amber when it would spill over. An empty meter starts a
  `LAST_CHANCE` countdown (`st.starving`, red bar under the meter) and hurries the next
  burrow in; delivering in time saves the run. The puffling grows with fish fed
  (`st.fedFish`, `pufflingSize()`), in the HUD and the burrow, and its weight is on the end
  screen. Growth is cosmetic on purpose: Mark didn't want it to make the puffling hungrier.
- Seal, hunting gull, and whale catches end the run; ordinary gulls, jaegers, gannets, icebergs and
  running out of air only cost the stack.

## Before release

- Set `UNLOCK_ALL = false` in `src/util.js` (currently true for testing). Shift+U on the
  level picker also unlocks everything for testing.
- localStorage keys still use the old `capelin-run-*` prefix on purpose, so existing best
  scores and unlocks survived the rename to Fun Puffin. Don't rename them without a migration.
- Commits so far use the author `NewfoundlandDesigns <NewfoundlandDesigns@users.noreply.github.com>`.
  If Mark wants his own name on them, amend before the first push.

## Ideas not built yet

- Weather events (fog banks, wind gusts), a whale in a later mixed level, varied crash
  landings, a season mode raising a puffling over several runs, a shared leaderboard.
