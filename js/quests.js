// Quest log: a scroll with two views (Quests and Map). The Quests view is a list of roles
// on the left and the selected role on the right.
import { quests } from "./content.js";
import { el, shot, reduced } from "./dom.js";

let showQuest = () => {};
let showView = () => {};
const viewListeners = [];

// Used by the map: jump back to the Quests view with one quest open.
export function openQuest(id) {
  const i = quests.findIndex((q) => q.id === id);
  if (i < 0) return;
  showView("quests");
  showQuest(i, false);
  document.getElementById(`quest-tab-${id}`)?.focus();
}
export const onViewChange = (fn) => viewListeners.push(fn);

function initViews() {
  const tabs = [...document.querySelectorAll("#quest-scroll .scroll__tab")];
  const panels = tabs.map((t) => document.getElementById(t.getAttribute("aria-controls")));
  showView = (name) => {
    tabs.forEach((t, i) => {
      const on = t.id === `view-tab-${name}`;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      panels[i].hidden = !on;
      if (on && !reduced && window.gsap) gsap.fromTo(panels[i], { opacity: 0 }, { opacity: 1, duration: 0.3 });
    });
    viewListeners.forEach((fn) => fn(name));
  };
  tabs.forEach((t, i) => {
    t.addEventListener("click", () => showView(t.id.replace("view-tab-", "")));
    t.addEventListener("keydown", (e) => {
      const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
      if (!step) return;
      e.preventDefault();
      const next = tabs[(i + step + tabs.length) % tabs.length];
      next.click();
      next.focus();
    });
  });
}

// The scroll unrolls once, the first time it comes into view.
function initUnroll() {
  if (reduced || !window.gsap || !window.ScrollTrigger) return;
  const scroll = document.getElementById("quest-scroll");
  const paper = scroll.querySelector(".scroll__paper");
  const bottomRod = scroll.querySelectorAll(".scroll__rod")[1];
  gsap.set(paper, { clipPath: "inset(0 0 100% 0)" });
  gsap.set(bottomRod, { y: () => -paper.offsetHeight });
  ScrollTrigger.create({
    trigger: scroll,
    start: "top 70%",
    once: true,
    onEnter() {
      const tl = gsap.timeline({ defaults: { duration: 1.1, ease: "power3.inOut" } });
      tl.to(paper, { clipPath: "inset(0 0 0% 0)", clearProps: "clipPath" })
        .to(bottomRod, { y: 0, clearProps: "transform" }, 0);
    },
  });
}

export function initQuests() {
  const list = document.getElementById("quest-list");
  const detail = document.getElementById("quest-detail");
  const tabs = [];

  let group = null;
  quests.forEach((q, i) => {
    if (q.group !== group) {
      group = q.group;
      list.append(el("p", { class: "questlog__group", text: group, role: "presentation" }));
    }
    const tab = el("button", {
      class: "quest-tab", role: "tab", id: `quest-tab-${q.id}`, type: "button",
      "aria-controls": "quest-detail", "aria-selected": "false", tabindex: "-1", "data-status": q.status,
    }, el("strong", { text: q.title }), el("small", { text: q.dates }));
    tab.addEventListener("click", () => show(i, true));
    tab.addEventListener("keydown", (e) => {
      const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
      if (!step) return;
      e.preventDefault();
      const next = (i + step + quests.length) % quests.length;
      show(next, true);
      tabs[next].focus();
    });
    tabs.push(tab);
    list.append(tab);
  });

  function render(q) {
    detail.setAttribute("aria-labelledby", `quest-tab-${q.id}`);
    detail.replaceChildren(
      el("div", { class: "quest__top" },
        el("div", {},
          el("h3", { class: "quest__title", text: q.title }),
          el("p", { class: "quest__meta", text: `${q.org}. ${q.dates}.` }),
          el("span", { class: "quest__status", "data-status": q.status, text: q.status === "active" ? "In progress" : "Completed" })),
        shot(q.image, q.imageHint, `Photo from ${q.org}`, "Photo from this role")),
      el("ul", { class: "quest__objectives" }, ...q.objectives.map((o) => el("li", { text: o }))),
      el("div", { class: "quest__rewards" },
        el("span", { text: "Picked up" }),
        el("ul", { class: "tags" }, ...q.rewards.map((r) => el("li", { text: r })))),
    );
  }

  let active = -1;
  function show(i, animate) {
    if (i === active) return;
    active = i;
    tabs.forEach((t, n) => {
      t.setAttribute("aria-selected", String(n === i));
      t.tabIndex = n === i ? 0 : -1;
    });
    if (animate && !reduced && window.gsap) {
      gsap.killTweensOf(detail);
      gsap.to(detail, {
        opacity: 0, x: 8, duration: 0.12, ease: "power1.in",
        onComplete() {
          render(quests[i]);
          gsap.fromTo(detail, { opacity: 0, x: -10 }, { opacity: 1, x: 0, duration: 0.3, ease: "power2.out" });
        },
      });
    } else {
      if (window.gsap) { gsap.killTweensOf(detail); gsap.set(detail, { opacity: 1, x: 0 }); }
      render(quests[i]);
    }
  }
  showQuest = show;
  show(0, false);
  initViews();
  initUnroll();
}
