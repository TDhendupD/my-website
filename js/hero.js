// Start screen: the name entrance, the main menu cursor, and the mountain ridge.
import { toast } from "./extras.js";

// Summit of the tallest far peak, in the ridge SVG's 1600 x 420 coordinates.
// If you move it, update --summit-x and --summit-y on .hero in css/sections.css to match.
const SUMMIT = [1344, 58];

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function splitLetters(el) {
  const text = el.textContent;
  el.textContent = "";
  el.setAttribute("aria-hidden", "true"); // the h1 carries the full name as its aria-label
  for (const word of text.split(" ")) {
    const w = document.createElement("span");
    w.style.display = "inline-block";
    w.style.whiteSpace = "nowrap";
    for (const ch of word) {
      const s = document.createElement("span");
      s.className = "ch";
      s.textContent = ch;
      w.append(s);
    }
    el.append(w, " ");
  }
}

// Jagged ridgelines from a seeded random walk, so the mountains are the same on every load.
function drawRidge() {
  const svg = document.getElementById("ridge-svg");
  // far to near: each layer is darker at the peaks and dissolves into the cloud sea at its foot
  const layers = [
    { seed: 5, base: 215, rough: 120, fill: "#97a2b8" },
    { seed: 23, base: 285, rough: 105, fill: "#4c5f88" },
    { seed: 71, base: 350, rough: 80, fill: "#243356" },
  ];
  svg.innerHTML = layers.map(({ seed, base, rough, fill }, n) => {
    let s = seed;
    const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
    let y = base;
    let pts = [[0, base]];
    for (let x = 30 + rnd() * 40; x < 1600; x += 34 + rnd() * 64) {
      // mostly small steps, with the odd big jump for a proper peak
      const jump = rnd() < 0.3 ? 1.5 : 0.55;
      y = Math.max(base - rough, Math.min(base + rough * 0.35, y + (rnd() - 0.5) * rough * jump));
      pts.push([x, y]);
    }
    if (n === 0) {
      // The far ridge gets one deliberate summit, taller than everything else: the Tenzing Norgay peak.
      const [sx, sy] = SUMMIT;
      pts = pts.filter(([x]) => x < sx - 150 || x > sx + 150);
      pts.push([sx - 150, 205], [sx - 95, 150], [sx - 62, 138], [sx - 30, 92], [sx, sy], [sx + 22, 96], [sx + 58, 128], [sx + 100, 142], [sx + 150, 200]);
      pts.sort((a, b) => a[0] - b[0]);
    }
    const d = "M0 420 " + pts.map(([x, py]) => `L${x.toFixed(0)} ${py.toFixed(0)}`).join(" ");
    const snow = n === 0
      ? `<path d="M${SUMMIT[0]} ${SUMMIT[1]} l-19 27 9 -5 4 11 8 -13 7 9 5 -7z" fill="#fbf3e4" opacity="0.85"/>`
      : "";
    return `<defs><linearGradient id="ridge-${n}" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
        <stop offset="0" stop-color="${fill}"/><stop offset="0.55" stop-color="${fill}" stop-opacity="0.75"/><stop offset="1" stop-color="#f3d6b2" stop-opacity="0.2"/>
      </linearGradient></defs><path d="${d} L1600 ${y.toFixed(0)} L1600 420 Z" fill="url(#ridge-${n})"/>${snow}`;
  }).join("");
}

function initSummit() {
  const btn = document.getElementById("summit");
  const note = document.getElementById("summit-note");
  let found = false;
  // aim the bubble's tail at the flagpole (the pole stands 20px into the button)
  const aim = () => {
    if (note.hidden) return;
    const pole = btn.getBoundingClientRect().left + 20;
    const tail = Math.min(note.offsetWidth - 28, Math.max(28, note.getBoundingClientRect().right - pole));
    note.style.setProperty("--tail", `${tail}px`);
  };
  window.addEventListener("resize", aim);
  const set = (open) => {
    btn.setAttribute("aria-expanded", String(open));
    note.hidden = !open;
    aim();
    // on shorter screens the bubble can open partly off screen, so bring it into view
    // (measured before the pop animation, which briefly shrinks it)
    if (open) note.scrollIntoView({ block: "nearest", behavior: reduced ? "auto" : "smooth" });
    if (open && !reduced && window.gsap) gsap.fromTo(note, { opacity: 0, scale: 0.85, y: 8 }, { opacity: 1, scale: 1, y: 0, duration: 0.35, ease: "back.out(1.6)" }); // pops out of the flag
    if (open && !found) {
      found = true;
      toast("Achievement unlocked", "First ascent: you found the summit.");
    }
  };
  btn.addEventListener("click", (e) => { e.stopPropagation(); set(note.hidden); });
  document.getElementById("summit-close").addEventListener("click", (e) => { e.stopPropagation(); set(false); btn.focus(); });
  document.addEventListener("click", (e) => { if (!note.hidden && !note.contains(e.target)) set(false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !note.hidden) { set(false); btn.focus(); } });
}

export function initHero() {
  drawRidge();
  initSummit();
  const lines = [...document.querySelectorAll("[data-split]")];
  lines.forEach(splitLetters);

  // Menu: one item is always "selected", like a game's main menu. Hover and focus move the cursor,
  // and the arrow keys work once focus is inside the menu.
  const links = [...document.querySelectorAll("#menu a")];
  const select = (i) => links.forEach((a, n) => a.classList.toggle("is-selected", n === i));
  select(0);
  links.forEach((a, i) => {
    a.addEventListener("pointerenter", () => select(i));
    a.addEventListener("focus", () => select(i));
    a.addEventListener("keydown", (e) => {
      const step = e.key === "ArrowDown" ? 1 : e.key === "ArrowUp" ? -1 : 0;
      if (!step) return;
      e.preventDefault();
      links[(i + step + links.length) % links.length].focus();
    });
  });

  if (reduced || !window.gsap) return;
  // The one staged entrance on the page.
  // Lines clip their letters only while they rise, so the text shadow is not cut off afterwards.
  lines.forEach((l) => l.classList.add("is-entering"));
  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
  tl.from(".hero__line .ch", { yPercent: 110, duration: 0.9, stagger: 0.028 })
    .add(() => lines.forEach((l) => l.classList.remove("is-entering")))
    .from(".hero__rule", { scaleX: 0, duration: 0.7 }, "-=0.5")
    .from(".hero__sub", { opacity: 0, y: 12, duration: 0.6 }, "-=0.45")
    .from("#menu li", { opacity: 0, x: -14, duration: 0.45, stagger: 0.06 }, "-=0.3")
    .from(".keys", { opacity: 0, duration: 0.5 }, "-=0.1")
    .from("#summit", { opacity: 0, y: 8, duration: 0.6 }, "-=0.4");
}
