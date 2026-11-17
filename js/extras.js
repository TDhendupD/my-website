// Achievements and the cheat code.
import { sky } from "./sky.js";
import { el, reduced } from "./dom.js";

const region = document.getElementById("toasts");

export function toast(title, body, ms = 7000) {
  const close = el("button", { class: "toast__close", type: "button", "aria-label": "Dismiss", text: "×" });
  const node = el("div", { class: "toast" },
    el("span", { class: "toast__gem", "aria-hidden": "true" }),
    el("div", {}, el("p", { class: "toast__title", text: title }), el("p", { class: "toast__body", text: body })),
    close);
  const remove = () => {
    if (!node.isConnected) return;
    if (reduced || !window.gsap) return node.remove();
    gsap.to(node, { opacity: 0, y: -10, duration: 0.25, onComplete: () => node.remove() });
  };
  close.addEventListener("click", remove);
  region.append(node);
  if (!reduced && window.gsap) gsap.from(node, { opacity: 0, y: -18, duration: 0.45, ease: "power3.out" });
  setTimeout(remove, ms);
}

export function initExtras() {
  // Achievement: reached the end of the page. It shows once each time the page is loaded.
  // It fires when the top of the contact section passes the middle of the screen, so it works at any window height.
  const contact = document.getElementById("contact");
  const io = new IntersectionObserver((entries) => {
    if (!entries[0].isIntersecting) return;
    io.disconnect();
    toast("Achievement unlocked", "Night flight: you read all the way to the end.");
  }, { rootMargin: "0px 0px -50% 0px" });
  io.observe(contact);

  // The raven flies in and lands the first time the contact section comes into view.
  const raven = document.getElementById("raven");
  const bird = document.getElementById("raven-bird");
  if (raven && bird && !reduced && window.gsap && window.ScrollTrigger) {
    const text = raven.querySelector(".raven__text");
    gsap.set(bird, { x: 300, y: -190, opacity: 0 });
    gsap.set(text, { opacity: 0, x: -12 });
    ScrollTrigger.create({
      trigger: raven,
      start: "top 85%",
      once: true,
      onEnter() {
        raven.classList.add("is-flying");
        gsap.timeline()
          .to(bird, { opacity: 1, duration: 0.3 })
          .to(bird, { x: 0, duration: 1.7, ease: "power2.out" }, 0)
          .to(bird, { y: 0, duration: 1.7, ease: "sine.inOut" }, 0) // a different ease on each axis makes the path curve
          .add(() => raven.classList.remove("is-flying"))
          .to(bird, { y: 3, duration: 0.12, yoyo: true, repeat: 1, ease: "power1.out" }) // settles on the branch
          .to(text, { opacity: 1, x: 0, duration: 0.45, ease: "power2.out", clearProps: "transform" }, "-=0.2");
      },
    });
  }

  // Cheat code: up up down down left right left right b a
  const code = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
  let at = 0;
  window.addEventListener("keydown", (e) => {
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    at = key === code[at] ? at + 1 : key === code[0] ? 1 : 0;
    if (at === code.length) {
      at = 0;
      sky.meteorShower();
      toast("Cheat enabled", reduced ? "Meteor shower (kept still, since you prefer reduced motion)." : "Meteor shower.");
    }
  });
}
