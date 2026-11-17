import { initSky } from "./sky.js";
import { initHud } from "./hud.js";
import { initHero } from "./hero.js";
import { initQuests } from "./quests.js";
import { initMap } from "./map.js";
import { initInventory } from "./inventory.js";
import { initSkills } from "./skills.js";
import { initExtras } from "./extras.js";

if (window.gsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

// Each part starts on its own, so one failing module cannot blank the rest of the page.
for (const init of [initSky, initQuests, initMap, initInventory, initSkills, initHud, initHero, initExtras]) {
  try { init(); } catch (err) { console.error(`[site] ${init.name} failed`, err); }
}
