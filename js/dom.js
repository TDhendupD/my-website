// Tiny helpers shared by the section modules.
export const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === "class") node.className = v;
    else if (k === "text") node.textContent = v;
    else node.setAttribute(k, v === true ? "" : v);
  }
  node.append(...children.filter((c) => c != null));
  return node;
}

// Marcellus draws the digit 1 like a capital I, so digits in display headings use the body face.
export function display(tag, cls, text) {
  const node = el(tag, { class: cls });
  for (const part of text.split(/(\d+)/)) {
    if (!part) continue;
    node.append(/\d/.test(part) ? el("span", { class: "num", text: part }) : part);
  }
  return node;
}

// A photo if `image` is set, otherwise a dashed placeholder that says which file to add.
export function shot(image, hint, alt, label) {
  if (image) return el("img", { src: image, alt, loading: "lazy", class: "shot" });
  return el("div", { class: "placeholder placeholder--shot", role: "img", "aria-label": `${label} placeholder` },
    el("span", { text: label }),
    el("code", { text: hint }));
}
