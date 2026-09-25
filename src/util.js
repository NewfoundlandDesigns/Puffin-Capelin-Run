/* Shared constants and helpers */
const WORLD_H = 600, SEA = 270, MAX_STACK = 12, LEVEL_DIST = 23700, AIR_SECONDS = 5;
const UNLOCK_ALL = true;        // TESTING: every level playable. Set to false before release.
const FEED_PER_FISH = 0.08;    // hunger refilled per fish delivered (golden capelin count twice)
const GULP_EVERY = 0.09;        // seconds between the puffling's gulps as a delivery goes down, one fish at a time
const FULL_PER_FISH = 1.2;     // fish that don't fit in a full puffling buy this many seconds of full belly (no hunger)
const FULL_MAX = 8;            // longest full belly, in seconds
const LAST_CHANCE = 6;         // seconds to reach a burrow once the puffling's meter runs out
const GROW_FISH = 60;          // fish fed (golden count twice) for the puffling to reach full size in a run
const FONT = '"DM Sans", system-ui, sans-serif';
const rand = (a, b) => a + Math.random() * (b - a);
const randInt = (a, b) => Math.floor(rand(a, b + 1));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const store = {
  get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
};
