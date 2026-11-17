// Compass navigation and the sundial clock. Both follow scroll position.
import { sky } from "./sky.js";

const SPACING = 118; // px between compass markers

export function initHud() {
  const track = document.getElementById("compass-track");
  const sections = [...document.querySelectorAll("main > section[data-nav]")];

  const markers = sections.map((section, i) => {
    const a = document.createElement("a");
    a.className = "compass__marker";
    a.href = `#${section.id}`;
    a.textContent = section.dataset.nav;
    a.style.left = `${i * SPACING}px`;
    track.append(a);
    return a;
  });

  const dial = document.querySelector(".sundial");
  const body = document.getElementById("sundial-body");
  const clock = document.getElementById("sundial-time");
  let current = -1, lastMinute = -1;

  function update() {
    // Which section is under a line 40% down the viewport, and how far through it are we?
    const line = window.scrollY + window.innerHeight * 0.4;
    const tops = sections.map((s) => s.offsetTop);
    let i = 0;
    while (i < tops.length - 1 && line >= tops[i + 1]) i++;
    const end = i < tops.length - 1 ? tops[i + 1] : document.documentElement.scrollHeight;
    const frac = Math.min(1, Math.max(0, (line - tops[i]) / (end - tops[i])));
    const float = i === tops.length - 1 ? i : i + frac;
    track.style.transform = `translateX(${-float * SPACING}px)`;

    if (i !== current) {
      current = i;
      markers.forEach((m, n) => (n === i ? m.setAttribute("aria-current", "true") : m.removeAttribute("aria-current")));
    }

    // The clock runs from 05:30 at the top of the page to 23:30 at the bottom.
    const minute = Math.round(330 + sky.progress * 1080);
    if (minute !== lastMinute) {
      lastMinute = minute;
      clock.textContent = `${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`;
      const isNight = minute >= 1170; // 19:30
      dial.classList.toggle("is-night", isNight);
      const arc = isNight ? (minute - 1170) / 240 : (minute - 330) / 840; // sun, then moon, each cross the arc once
      const angle = Math.PI * (1 - Math.min(1, arc));
      body.setAttribute("cx", (20 + 16 * Math.cos(angle)).toFixed(2));
      body.setAttribute("cy", (20 - 16 * Math.sin(angle)).toFixed(2));
    }
    requestAnimationFrame(update);
  }
  requestAnimationFrame(update);

  // Number keys 1 to 5 jump to sections (0 or Home goes back to the start).
  window.addEventListener("keydown", (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.target.closest("input, textarea, [contenteditable]")) return;
    const n = Number(e.key);
    if (e.key.length === 1 && Number.isInteger(n) && n >= 0 && n < sections.length) {
      sections[n].scrollIntoView();
    }
  });
}
