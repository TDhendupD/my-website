# Tenzing's portfolio

A personal site with a story-game menu feel, set above the clouds. The sky runs from dawn to night as you scroll.

Version 0.8. Static HTML, CSS and JavaScript. No build step.

## Run it

The JavaScript uses ES modules, so open it through a local server, not by double-clicking `index.html`.

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Put it on GitHub Pages

1. Create a repo and push this folder to `main`.
2. In the repo: Settings, Pages, Source "Deploy from a branch", branch `main`, folder `/ (root)`.
3. The site is live at `https://<username>.github.io/<repo>/` a minute later. All paths are relative, so it works from a subfolder.

## Where things live

```
index.html          page structure and the static copy (hero, bio, contact)
css/
  tokens.css        colours, fonts, type scale, spacing. Start here to restyle.
  base.css          reset, sky, parchment panels, placeholders, buttons
  hud.css           compass navigation, sundial clock, toasts
  sections.css      start screen and each section, plus responsive rules
js/
  content.js        experience, projects and skills. Edit this to change content.
  main.js           starts every module
  sky.js            canvas: clouds, birds, stars, meteors, and the dawn-to-night gradient
  hud.js            compass and clock that follow scroll, number-key shortcuts
  hero.js           name entrance, main menu, mountain ridge
  quests.js         quest log: the scroll, its Quests and Map views, the experience tabs
  map.js            world map with quest markers (Bhutan and North Carolina)
  mapdata.js        generated map shapes. Rebuild with tools/build-map.mjs.
  inventory.js      inventory: slot grid with Projects and Tools pouches, and the detail panel
  icons.js          line icons for inventory slots
  skills.js         constellation skill tree (the four shapes live in SHAPES) and its plain-list fallback
  extras.js         achievement toasts, the raven's flight, and the cheat code
  dom.js            small shared helpers
vendor/             GSAP 3 and ScrollTrigger (free, standard licence)
assets/fonts/       Marcellus, Albert Sans, Pirata One (SIL Open Font License)
assets/img/         your photos and screenshots go here
tools/build-map.mjs dev-only script that regenerates js/mapdata.js
tests/smoke.py      headless browser test
```

## Interactions

- Compass at the top slides as you scroll. Click a marker to jump.
- Sundial clock runs from 05:30 at the top of the page to 23:30 at the bottom.
- Main menu on the start screen: hover, or Tab in and use the arrow keys and Enter.
- Keys `1` to `5` jump to sections, `0` goes back to the start.
- Birds on the start screen follow the cursor.
- Prayer flags on the tallest peak open a speech bubble about Tenzing Norgay, right above the flags.
- Quest log is a scroll that unrolls once. Click a quest or use the arrow keys.
- The Map tab in the quest log is a world map you can drag and zoom (buttons, pinch, double click, or ctrl + scroll). Markers and the "Fly to" buttons fly to Bhutan and North Carolina. Quest names on the map jump back to that quest.
- Inventory: pick a slot to inspect a project or tool. Arrow keys move between slots.
- Skill tree: hover a star to see which project used it.
- In the contact section a raven flies in, lands on a branch in front of the moon and delivers the email button.
- An achievement toast appears when someone reaches the end (once per page load).
- Cheat code: up up down down left right left right B A.

The parchment is aged with paper grain, foxing stains and browned edges (`.parchment::after` in `css/base.css`), and the scroll has worn edges and oxidized roller caps (`.scroll__paper` and `.scroll__rod` in `css/sections.css`). Turn the wear down by lowering the `opacity` on `.parchment::after`.

Everything respects `prefers-reduced-motion`: the entrance, drifting clouds, birds and meteors are switched off.

## Test

```bash
pip install playwright && playwright install chromium
python tests/smoke.py
```

It checks rendering, navigation, keyboard controls and layout at five screen sizes plus reduced motion, and saves screenshots to `tests/shots/`.

Map data: Natural Earth (public domain) and US Census state outlines, via the `world-atlas` and `us-atlas` npm packages. Country borders appear when you zoom in and follow Natural Earth's de facto boundaries. To hide them, remove the `.is-zoomed .wm__borders` rule in `css/sections.css`.

See `TODO.md` for everything that still needs your content.
