// The sky. One fixed canvas behind the page:
//   - the gradient moves from dawn to night as you scroll (CSS variables on <html>)
//   - clouds drift and parallax, tinted to match the time of day
//   - a small flock of birds follows the cursor while the start screen is visible
//   - stars come out near the bottom of the page
// Other modules read `sky.progress` (0 at the top of the page, 1 at the bottom).

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// [scroll position, four gradient stops top to bottom, cloud tint]
const KEYS = [
  { at: 0.0, stops: ["#182b52", "#4d6690", "#d89a78", "#f7d3a0"], cloud: [255, 226, 196] }, // dawn
  { at: 0.3, stops: ["#16407c", "#2f6fb4", "#6aa5d8", "#c4e0f2"], cloud: [255, 255, 255] }, // day
  { at: 0.6, stops: ["#13234a", "#3a547e", "#c06a3c", "#f0a258"], cloud: [255, 186, 140] }, // dusk
  { at: 0.84, stops: ["#050a16", "#0a1429", "#10203f", "#1a3157"], cloud: [84, 108, 150] }, // night
  { at: 1.0, stops: ["#050a16", "#0a1429", "#10203f", "#1a3157"], cloud: [84, 108, 150] },
];

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const lerp = (a, b, t) => a + (b - a) * t;
const mix = (a, b, t) => a.map((v, i) => Math.round(lerp(v, b[i], t)));
const mod = (n, m) => ((n % m) + m) % m;
const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

export const sky = { progress: 0, meteorShower };

const canvas = document.getElementById("sky-canvas");
const ctx = canvas.getContext("2d");
const root = document.documentElement;
let W = 0, H = 0, dpr = 1;

// ---------- cloud sprites ----------
// Each sprite is a handful of soft puffs with a flatter underside, drawn once per tint.
function makeSprite(seed, tint) {
  const c = document.createElement("canvas");
  c.width = 512; c.height = 256;
  const g = c.getContext("2d");
  let s = seed;
  const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const puff = (x, y, r, a) => {
    const grad = g.createRadialGradient(x, y - r * 0.15, 0, x, y, r);
    grad.addColorStop(0, `rgba(${tint}, ${a})`);
    grad.addColorStop(0.62, `rgba(${tint}, ${a * 0.7})`);
    grad.addColorStop(1, `rgba(${tint}, 0)`);
    g.fillStyle = grad;
    g.fillRect(x - r, y - r, r * 2, r * 2);
  };
  // a row of puffs along a flat base, then taller ones piled toward the middle
  for (let i = 0; i < 8; i++) puff(80 + i * 50 + rnd() * 20, 168 + rnd() * 8, 38 + rnd() * 16, 0.5);
  for (let i = 0; i < 6; i++) {
    const x = 140 + rnd() * 230;
    puff(x, 150 - rnd() * 62 * Math.sin(((x - 140) / 230) * Math.PI), 34 + rnd() * 26, 0.55);
  }
  // soften the underside so the cloud sits flat
  g.globalCompositeOperation = "destination-in";
  const fadeOut = g.createLinearGradient(0, 150, 0, 212);
  fadeOut.addColorStop(0, "rgba(0,0,0,1)");
  fadeOut.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = fadeOut;
  g.fillRect(0, 0, 512, 256);
  return c;
}
const SEEDS = [11, 97, 2024];
const sprites = KEYS.map((k) => SEEDS.map((seed) => makeSprite(seed, k.cloud.join(","))));

let clouds = [];
function seedClouds() {
  let s = 7;
  const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const count = W < 700 ? 7 : 12;
  clouds = Array.from({ length: count }, (_, i) => {
    const depth = 0.15 + rnd() * 0.5; // near clouds are bigger, faster, and slide more with scroll
    return {
      x: rnd(), y: rnd(), depth,
      scale: (0.6 + depth * 1.9) * (W < 700 ? 0.6 : 1),
      speed: 4 + depth * 22,
      shape: i % SEEDS.length,
      alpha: 0.5 + depth * 0.7,
    };
  }).sort((a, b) => a.depth - b.depth);
}

// ---------- stars ----------
let stars = [];
function seedStars() {
  let s = 31;
  const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  stars = Array.from({ length: W < 700 ? 70 : 150 }, () => ({ x: rnd(), y: rnd(), r: 0.4 + rnd() * 1.1, phase: rnd() * 6.28 }));
}

// ---------- birds ----------
const pointer = { x: 0, y: 0, active: false };
const birds = [0, 1, 2].map((i) => ({ x: 0, y: 0, vx: 0, vy: 0, lag: 0.035 - i * 0.008, ox: -i * 46, oy: (i % 2 ? 1 : -1) * i * 20, flap: i * 1.7, ready: false }));
window.addEventListener("pointermove", (e) => {
  if (e.pointerType === "touch") return;
  pointer.x = e.clientX; pointer.y = e.clientY; pointer.active = true;
}, { passive: true });
document.addEventListener("pointerleave", () => { pointer.active = false; });

function drawBird(b, t, alpha) {
  const span = 15;
  const flap = Math.sin(t * 5 + b.flap) * 0.55; // wing tips rise and fall
  const bank = Math.max(-0.5, Math.min(0.5, b.vx * 0.05));
  ctx.save();
  ctx.translate(b.x, b.y);
  ctx.rotate(bank);
  ctx.strokeStyle = `rgba(16, 22, 40, ${alpha})`;
  ctx.lineWidth = 2.2;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-span, -span * flap);
  ctx.quadraticCurveTo(-span * 0.45, -span * 0.5 - span * flap * 0.3, 0, 0);
  ctx.quadraticCurveTo(span * 0.45, -span * 0.5 - span * flap * 0.3, span, -span * flap);
  ctx.stroke();
  ctx.restore();
}

// ---------- meteors (cheat code) ----------
let meteors = [];
function meteorShower() {
  if (reduced) return;
  for (let i = 0; i < 14; i++) {
    meteors.push({ x: Math.random() * W * 1.2, y: -40 - Math.random() * H * 0.4, v: 520 + Math.random() * 380, life: 0, delay: i * 0.13 });
  }
}

// ---------- frame ----------
function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  W = window.innerWidth; H = window.innerHeight;
  canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  seedClouds(); seedStars();
}

function segment(p) {
  let i = 0;
  while (i < KEYS.length - 2 && p > KEYS[i + 1].at) i++;
  const a = KEYS[i], b = KEYS[i + 1];
  return { i, t: Math.min(1, Math.max(0, (p - a.at) / (b.at - a.at))) };
}

let lastStops = "";
function paintGradient(p) {
  const { i, t } = segment(p);
  const stops = KEYS[i].stops.map((s, n) => `rgb(${mix(hex(s), hex(KEYS[i + 1].stops[n]), t).join(",")})`);
  const key = stops.join();
  if (key === lastStops) return;
  lastStops = key;
  stops.forEach((s, n) => root.style.setProperty(`--sky-${n}`, s));
}

let time = 0, last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (!reduced) time += dt;

  const scrollY = window.scrollY;
  const max = Math.max(1, document.documentElement.scrollHeight - H);
  const p = Math.min(1, Math.max(0, scrollY / max));
  sky.progress = p;
  paintGradient(p);

  ctx.clearRect(0, 0, W, H);

  // stars
  const night = smooth(0.62, 0.86, p);
  if (night > 0.01) {
    for (const s of stars) {
      const tw = 0.6 + 0.4 * Math.sin(time * 1.4 + s.phase);
      ctx.fillStyle = `rgba(251, 246, 236, ${night * tw})`;
      ctx.beginPath();
      ctx.arc(s.x * W, s.y * H, s.r, 0, 6.283);
      ctx.fill();
    }
  }

  // clouds: draw the two neighbouring tints cross-faded
  const { i, t } = segment(p);
  const fade = 1 - night * 0.72;
  for (const c of clouds) {
    const w = 512 * c.scale, h = 256 * c.scale;
    const x = mod(c.x * (W + w) + time * c.speed, W + w) - w;
    const y = mod(c.y * (H + h) - scrollY * c.depth * 0.6, H + h) - h;
    ctx.globalAlpha = c.alpha * fade * (1 - t);
    ctx.drawImage(sprites[i][c.shape], x, y, w, h);
    ctx.globalAlpha = c.alpha * fade * t;
    ctx.drawImage(sprites[i + 1][c.shape], x, y, w, h);
  }
  ctx.globalAlpha = 1;

  // birds, only while the start screen is on screen
  const heroVis = 1 - Math.min(1, scrollY / (H * 0.7));
  if (heroVis > 0.02 && !reduced) {
    // with no cursor (or on touch) the lead bird flies a slow figure of eight on the right
    const narrow = W < 700; // on phones the flock stays low, clear of the text
    const tx = pointer.active ? pointer.x : W * 0.72 + Math.cos(time * 0.35) * W * 0.16;
    const ty = pointer.active ? pointer.y - 30 : H * (narrow ? 0.66 : 0.36) + Math.sin(time * 0.7) * H * (narrow ? 0.04 : 0.1);
    for (const b of birds) {
      if (!b.ready) { b.x = tx + b.ox; b.y = ty + b.oy; b.ready = true; }
      const nx = lerp(b.x, tx + b.ox, b.lag * 60 * dt), ny = lerp(b.y, ty + b.oy, b.lag * 60 * dt);
      b.vx = lerp(b.vx, (nx - b.x) / Math.max(dt, 0.001) / 60, 0.2);
      b.x = nx; b.y = ny;
      drawBird(b, time, 0.85 * heroVis);
    }
  }

  // meteors
  if (meteors.length) {
    meteors = meteors.filter((m) => m.y < H + 80);
    for (const m of meteors) {
      if (m.delay > 0) { m.delay -= dt; continue; }
      m.x -= m.v * dt * 0.55; m.y += m.v * dt;
      const grad = ctx.createLinearGradient(m.x, m.y, m.x + 60, m.y - 110);
      grad.addColorStop(0, "rgba(255, 244, 214, 0.95)");
      grad.addColorStop(1, "rgba(255, 244, 214, 0)");
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(m.x + 60, m.y - 110); ctx.stroke();
    }
  }

  if (!document.hidden) requestAnimationFrame(frame);
}

export function initSky() {
  resize();
  window.addEventListener("resize", resize);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) { last = performance.now(); requestAnimationFrame(frame); }
  });
  requestAnimationFrame(frame);
}
