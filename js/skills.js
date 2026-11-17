// Skill tree: four constellations drawn as SVG, plus the same data as plain lists
// (shown on small screens and read by screen readers).
import { skills } from "./content.js";
import { el, reduced } from "./dom.js";

const NS = "http://www.w3.org/2000/svg";
const svgEl = (tag, attrs = {}, text) => {
  const n = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  if (text) n.textContent = text;
  return n;
};
const joinNames = (a) => (a.length > 1 ? `${a.slice(0, -1).join(", ")} and ${a.at(-1)}` : a[0]);

// One hand-drawn shape per constellation, in the same order as `skills` in content.js.
// Each star is [x, y, label side] inside a 300 x 540 column ("r" = label to the right, "l" = to the left, "b" = below).
// `edges` joins stars by index. If a group's star count stops matching its shape
// (because you added or removed a skill), that group falls back to a simple zigzag.
const SHAPES = [
  { // The Kite: a diamond with a long tail
    stars: [[170, 30, "r"], [105, 120, "l"], [215, 120, "r"], [160, 215, "r"], [195, 285, "r"], [135, 345, "r"], [190, 405, "r"], [125, 465, "r"], [180, 525, "r"]],
    edges: [[0, 1], [0, 2], [1, 3], [2, 3], [1, 2], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8]],
  },
  { // The Ladle: a four-star bowl and a bent handle
    stars: [[75, 50, "r"], [205, 80, "r"], [190, 190, "r"], [85, 170, "l"], [215, 285, "r"], [150, 360, "r"], [165, 445, "r"], [80, 520, "r"]],
    edges: [[0, 1], [1, 2], [2, 3], [3, 0], [2, 4], [4, 5], [5, 6], [6, 7]],
  },
  { // The Stag: two antlers meeting at a hub, then legs
    stars: [[40, 35, "r"], [95, 120, "r"], [170, 50, "r"], [150, 210, "r"], [70, 300, "r"], [215, 305, "r"], [205, 410, "r"], [130, 470, "r"], [50, 525, "r"]],
    edges: [[0, 1], [1, 3], [2, 3], [3, 4], [3, 5], [5, 6], [5, 7], [7, 8], [4, 8]],
  },
  { // The Lantern: a ring of six hanging over a forked chain
    stars: [[150, 35, "r"], [230, 125, "l"], [195, 215, "r"], [110, 245, "l"], [30, 175, "r"], [60, 95, "r"], [150, 335, "r"], [85, 405, "r"], [190, 430, "r"], [60, 520, "r"]],
    edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0], [3, 6], [6, 7], [6, 8], [7, 9]],
  },
];
const TOP = 90; // space above the stars for the constellation's name

function zigzag(count) {
  const gap = 480 / Math.max(1, count - 1);
  return {
    stars: Array.from({ length: count }, (_, i) => [40 + (i % 2 ? 70 : 0), 30 + i * gap, "r"]),
    edges: Array.from({ length: count - 1 }, (_, i) => [i, i + 1]),
  };
}

export function initSkills() {
  const svg = document.getElementById("constellation-svg");
  const readout = document.getElementById("skill-readout");
  const lists = document.getElementById("skill-lists");
  const COL = 1200 / skills.length;
  const idle = readout.textContent;
  svg.setAttribute("viewBox", "0 0 1200 650");

  skills.forEach((group, g) => {
    const x0 = g * COL;
    const shape = SHAPES[g]?.stars.length === group.items.length ? SHAPES[g] : zigzag(group.items.length);
    const gEl = svgEl("g", { class: "const__group" });
    gEl.append(svgEl("text", { class: "const__title", x: x0 + 8, y: 34 }, group.name));

    const pts = shape.stars.map(([x, y, side], i) => ({ item: group.items[i], x: x0 + x, y: TOP + y, side }));
    for (const [a, b] of shape.edges) {
      gEl.append(svgEl("line", { class: "const__line", x1: pts[a].x, y1: pts[a].y, x2: pts[b].x, y2: pts[b].y }));
    }

    for (const p of pts) {
      const used = p.item.usedIn?.length;
      const below = p.side === "b", left = p.side === "l";
      const w = p.item.name.length * 9.5; // rough label width, for the hover target
      const star = svgEl("g", { class: `star${used ? " star--used" : ""}` });
      if (used) star.append(svgEl("circle", { class: "star__halo", cx: p.x, cy: p.y, r: 11 }));
      star.append(
        svgEl("circle", { class: "star__dot", cx: p.x, cy: p.y, r: used ? 4.4 : 2.8 }),
        svgEl("text", {
          class: "star__label",
          x: below ? p.x : left ? p.x - 15 : p.x + 15, y: below ? p.y + 27 : p.y + 6,
          "text-anchor": below ? "middle" : left ? "end" : "start",
        }, p.item.name),
        below
          ? svgEl("rect", { class: "star__hit", x: p.x - w / 2 - 6, y: p.y - 16, width: w + 12, height: 52 })
          : svgEl("rect", { class: "star__hit", x: left ? p.x - w - 20 : p.x - 16, y: p.y - 18, width: w + 36, height: 36 }),
      );
      const on = () => {
        star.classList.add("is-active");
        gEl.classList.add("is-lit");
        readout.textContent = used
          ? `${p.item.name}. Used in ${joinNames(p.item.usedIn)}.`
          : `${p.item.name}. Part of my ${group.name.toLowerCase()} kit.`;
      };
      const off = () => {
        star.classList.remove("is-active");
        gEl.classList.remove("is-lit");
        readout.textContent = idle;
      };
      star.addEventListener("pointerenter", on);
      star.addEventListener("pointerleave", off);
      star.addEventListener("click", on); // touch screens
      gEl.append(star);
    }
    svg.append(gEl);

    lists.append(el("div", {},
      el("h3", { text: group.name }),
      el("ul", { class: "tags" }, ...group.items.map((it) =>
        el("li", { "data-used": it.usedIn ? true : null, text: it.name },
          it.usedIn ? el("span", { class: "sr-only", text: `, used in ${joinNames(it.usedIn)}` }) : null)))));
  });

  // Draw the constellation lines once, the first time the section scrolls into view.
  if (reduced || !window.gsap || !window.ScrollTrigger) return;
  const lines = svg.querySelectorAll(".const__line");
  lines.forEach((l) => {
    const len = Math.hypot(l.x2.baseVal.value - l.x1.baseVal.value, l.y2.baseVal.value - l.y1.baseVal.value);
    l.style.strokeDasharray = len;
    l.style.strokeDashoffset = len;
  });
  gsap.set(svg.querySelectorAll(".star"), { opacity: 0 });
  ScrollTrigger.create({
    trigger: svg,
    start: "top 75%",
    once: true,
    onEnter() {
      gsap.to(lines, { strokeDashoffset: 0, duration: 0.7, ease: "power2.inOut", stagger: 0.035 });
      gsap.to(svg.querySelectorAll(".star"), { opacity: 1, duration: 0.5, stagger: 0.025, delay: 0.15 });
    },
  });
}
