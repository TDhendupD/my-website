// Inventory: a grid of slots in two pouches (Projects and Tools). Picking a slot shows the item beside the grid.
import { projects, tools } from "./content.js";
import { el, shot, display, reduced } from "./dom.js";
import { icon } from "./icons.js";

const POUCHES = {
  projects: { items: projects, slots: 8 },
  tools: { items: tools, slots: 12 },
};

function projectDetail(p) {
  return [
    shot(p.image, p.imageHint, `Screenshot of ${p.name}`, `Screenshot of ${p.name}`),
    el("div", { class: "item__body" },
      el("p", { class: "item__kind", text: p.kind }),
      display("h3", "item__name", p.name),
      el("p", { class: "item__desc", text: p.desc }),
      el("p", { class: "item__fact", text: p.fact }),
      el("ul", { class: "tags" }, ...p.stack.map((s) => el("li", { text: s }))),
      el("a", { class: "item__link", href: p.link, rel: "noopener", text: `View ${p.name} on GitHub` })),
  ];
}

function toolDetail(t) {
  return [
    el("div", { class: "item__body" },
      el("div", { class: "item__badge" }, icon(t.icon, 44)),
      el("p", { class: "item__kind", text: t.kind }),
      display("h3", "item__name", t.name),
      el("p", { class: "item__desc", text: t.desc }),
      t.usedIn?.length
        ? el("div", { class: "item__used" }, el("span", { text: "Used in" }), el("ul", { class: "tags" }, ...t.usedIn.map((u) => el("li", {}, display("span", "", u)))))
        : null,
      t.note
        ? el("p", { class: "item__fact", text: t.note })
        : el("p", { class: "draft-note" }, el("strong", { text: "Your note. " }), "Add one line on how you use this: set ", el("code", { text: "note" }), " in js/content.js.")),
  ];
}

export function initInventory() {
  const grid = document.getElementById("bag-grid");
  const detail = document.getElementById("bag-detail");
  const count = document.getElementById("bag-count");
  const body = document.getElementById("bag-body");
  const tabs = [...document.querySelectorAll("#bag .scroll__tab")];
  let slots = [];

  function inspect(pouch, i, animate) {
    const item = POUCHES[pouch].items[i];
    slots.forEach((s, n) => s.setAttribute("aria-pressed", String(n === i)));
    const fill = () => {
      detail.className = `bag__detail bag__detail--${pouch}`;
      detail.replaceChildren(...(pouch === "projects" ? projectDetail(item) : toolDetail(item)));
    };
    if (animate && !reduced && window.gsap) {
      gsap.killTweensOf(detail);
      gsap.to(detail, { opacity: 0, duration: 0.1, onComplete() { fill(); gsap.fromTo(detail, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.28, ease: "power2.out" }); } });
    } else {
      if (window.gsap) { gsap.killTweensOf(detail); gsap.set(detail, { opacity: 1, y: 0 }); }
      fill();
    }
  }

  function open(pouch) {
    const { items, slots: capacity } = POUCHES[pouch];
    tabs.forEach((t) => {
      const on = t.id === `bag-tab-${pouch}`;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      if (on) body.setAttribute("aria-labelledby", t.id);
    });
    const COLS = getComputedStyle(grid).gridTemplateColumns.split(" ").length || 4; // 4 across, 3 on phones
    slots = items.map((item, i) => {
      const slot = el("button", { class: "slot", type: "button", "aria-pressed": "false", title: item.name, style: `--i:${i}` },
        icon(item.icon), display("span", "slot__name", item.name));
      slot.addEventListener("click", () => inspect(pouch, i, true));
      slot.addEventListener("keydown", (e) => {
        const step = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: COLS, ArrowUp: -COLS }[e.key];
        if (!step) return;
        const next = i + step;
        if (next < 0 || next >= items.length) return;
        e.preventDefault();
        slots[next].focus();
        inspect(pouch, next, true);
      });
      return slot;
    });
    // empty slots pad the grid out, the way a game bag shows free space
    const total = Math.ceil(Math.max(capacity, items.length) / COLS) * COLS;
    const empties = Array.from({ length: total - items.length }, () => el("div", { class: "slot slot--empty", "aria-hidden": "true" }));
    grid.replaceChildren(...slots, ...empties);
    count.textContent = `${items.length} of ${total} slots filled`;
    inspect(pouch, 0, false);
  }

  tabs.forEach((t, i) => {
    t.addEventListener("click", () => open(t.id.replace("bag-tab-", "")));
    t.addEventListener("keydown", (e) => {
      const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
      if (!step) return;
      e.preventDefault();
      const next = tabs[(i + step + tabs.length) % tabs.length];
      next.click();
      next.focus();
    });
  });
  open("projects");
}
