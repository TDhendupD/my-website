// Small line icons for inventory slots, drawn on a 24 x 24 grid.
// These are generic pictograms, not product logos. Add your own by adding a name and its SVG shapes.
const ICONS = {
  spyglass: '<path d="M3 16.5l11.5-6.6 2 3.5L5 20z"/><path d="M14.5 9.9l4-2.3 2 3.5-4 2.3"/><path d="M9 18l-1.5 3.5M11.5 16.5l3 4.5"/>',
  quill: '<path d="M20 3c-7.5 1-12.5 6-13.5 14L5 21"/><path d="M7 16.5c4.5 0 8.5-2 10.5-6"/><path d="M11.5 9.500l3 3"/>',
  coins: '<ellipse cx="12" cy="7" rx="7" ry="3"/><path d="M5 7v5c0 1.7 3.1 3 7 3s7-1.3 7-3V7"/><path d="M5 12v5c0 1.7 3.1 3 7 3s7-1.3 7-3v-5"/>',
  branch: '<circle cx="7" cy="5" r="2"/><circle cx="7" cy="19" r="2"/><circle cx="17" cy="9" r="2"/><path d="M7 7v10M17 11c0 3-4 4-10 4"/>',
  play: '<circle cx="12" cy="12" r="9"/><path d="M10 8.500l5 3.5-5 3.500z"/>',
  layers: '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 12l9 5 9-5M3 16l9 5 9-5"/>',
  database: '<ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v12c0 1.7 3.1 3 7 3s7-1.3 7-3V6"/><path d="M13 10.500l-3 3.500h4l-3 3.5"/>',
  terminal: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 9l3 3-3 3M12 15h5"/>',
  notebook: '<rect x="6" y="3" width="13" height="18" rx="1.5"/><path d="M4 7h3M4 12h3M4 17h3M10.5 8h5M10.5 12h5"/>',
  brackets: '<path d="M8 6l-5 6 5 6M16 6l5 6-5 6M13.5 4l-3 16"/>',
  pointer: '<path d="M5 3l14 7-6 2-2 6z"/>',
  servers: '<rect x="3" y="4" width="18" height="5" rx="1"/><rect x="3" y="10" width="18" height="5" rx="1"/><rect x="3" y="16" width="18" height="5" rx="1"/><path d="M6.5 6.500h.01M6.5 12.500h.01M6.5 18.500h.01"/>',
  brush: '<path d="M4 20c0-3 1.5-4.5 3.5-4.500S11 16.5 11 18s-2 3-7 2z"/><path d="M10 15.500L20.5 4l-1-1L8 12.5"/>',
  box: '<path d="M4 8l8-4 8 4v8l-8 4-8-4z"/><path d="M4 8l8 4 8-4M12 12v8"/>',
};

export function icon(name, size = 28) {
  const wrap = document.createElement("span");
  wrap.className = "icon";
  wrap.innerHTML = `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ICONS.box}</svg>`;
  return wrap;
}
