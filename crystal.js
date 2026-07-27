/* =============================================================================
   A.z — THE CRYSTAL
   The hero object is real glass, not a picture of glass: physical transmission,
   dispersion through the body, Fresnel read off a procedural studio
   environment, and a silhouette that is rebuilt every frame so the card can
   become a lens without a single vertex being stretched.

   Eight beats, all slow:
     01 the selfie inside a crystal card, breathing
     02 the card turns in true perspective — the thickness shows
     03 the crystal reacts: corners stretch, edges soften, the body clears
     04 the portrait rises out of the glass while the selfie sinks
     05 the crystal draws itself into the geometry of a lens
     06 the temple arrives from behind and locks into the rim
     07 the portrait takes the frame
     08 the finished lens floats, and answers the pointer

   The page never depends on this. Without WebGL, or with reduced motion asked
   for, nothing here runs and the CSS plate stays exactly as it was.
========================================================================== */
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

/* ---------------------------------------------------------------- silhouette */
/* One outline function serves every shape in the scene. Because the walk is by
   arc length with a fixed sample count, the card and the lens are the same mesh
   topology — the morph is a change of numbers, never a change of geometry. */
const RING = 176;

function outline(hw, hh, r, out) {
  r = Math.min(r, Math.min(hw, hh) * 0.999);
  const sx = 2 * (hw - r);          // top and bottom straights
  const sy = 2 * (hh - r);          // left straight, and the two right halves
  const arc = (Math.PI / 2) * r;
  const per = 2 * sx + 2 * sy + 4 * arc;
  const cx = hw - r, cy = hh - r;   // corner centres

  for (let i = 0; i < RING; i++) {
    let d = (i / RING) * per, x, y, a;
    if (d < sy / 2) { x = hw; y = d; }                                   // right, up
    else if ((d -= sy / 2) < arc) { a = (d / arc) * Math.PI / 2; x = cx + r * Math.cos(a); y = cy + r * Math.sin(a); }
    else if ((d -= arc) < sx) { x = cx - d; y = hh; }                    // top, left
    else if ((d -= sx) < arc) { a = (d / arc) * Math.PI / 2; x = -cx - r * Math.sin(a); y = cy + r * Math.cos(a); }
    else if ((d -= arc) < sy) { x = -hw; y = cy - d; }                   // left, down
    else if ((d -= sy) < arc) { a = (d / arc) * Math.PI / 2; x = -cx - r * Math.cos(a); y = -cy - r * Math.sin(a); }
    else if ((d -= arc) < sx) { x = -cx + d; y = -hh; }                  // bottom, right
    else if ((d -= sx) < arc) { a = (d / arc) * Math.PI / 2; x = cx + r * Math.sin(a); y = -cy - r * Math.cos(a); }
    else { x = hw; y = -cy + (d - arc); }                                // right, up to zero
    out[i * 2] = x; out[i * 2 + 1] = y;
  }
  return out;
}

/* The cross-section of the body: how far each ring is pulled in from the
   silhouette, and where it sits through the thickness. Two rounded bevels and
   a flat rim band between them — the profile of a polished crystal blank. */
const SHELL = [
  [1.00, 1.00], [0.52, 0.88], [0.00, 0.42],
  [0.00, -0.42], [0.52, -0.88], [1.00, -1.00],
];

/* A solid slab: two capped bevelled faces and a rim. Built once, rewritten in
   place on every frame of the morph. */
function makeSlab() {
  const rings = SHELL.length;
  const count = RING * rings + 2;
  const pos = new Float32Array(count * 3);
  const uv = new Float32Array(count * 2);
  const idx = [];
  const front = RING * rings, back = front + 1;

  for (let i = 0; i < RING; i++) {
    const j = (i + 1) % RING;
    idx.push(front, i, j);                                    // front cap fan
    for (let k = 0; k < rings - 1; k++) {                      // bevel + rim bands
      const a = k * RING + i, b = k * RING + j;
      const c = (k + 1) * RING + i, d = (k + 1) * RING + j;
      idx.push(a, c, b, b, c, d);
    }
    const t = (rings - 1) * RING;
    idx.push(back, t + j, t + i);                              // back cap fan
  }

  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  g.setIndex(idx);
  return g;
}

const _ring = new Float32Array(RING * 2);
const YAXIS = new THREE.Vector3(0, 1, 0);

function shapeSlab(g, hw, hh, r, halfT, bevel) {
  const pos = g.attributes.position.array;
  const uv = g.attributes.uv.array;
  const rings = SHELL.length;

  for (let k = 0; k < rings; k++) {
    const [inset, zf] = SHELL[k];
    const b = inset * bevel;
    outline(Math.max(hw - b, 0.02), Math.max(hh - b, 0.02), Math.max(r - b * 0.7, 0.012), _ring);
    const z = zf * halfT;
    for (let i = 0; i < RING; i++) {
      const v = (k * RING + i) * 3;
      pos[v] = _ring[i * 2]; pos[v + 1] = _ring[i * 2 + 1]; pos[v + 2] = z;
      const u = (k * RING + i) * 2;
      uv[u] = (_ring[i * 2] + hw) / (2 * hw);
      uv[u + 1] = (_ring[i * 2 + 1] + hh) / (2 * hh);
    }
  }
  const f = RING * rings;
  pos[f * 3] = 0; pos[f * 3 + 1] = 0; pos[f * 3 + 2] = halfT;
  pos[(f + 1) * 3] = 0; pos[(f + 1) * 3 + 1] = 0; pos[(f + 1) * 3 + 2] = -halfT;
  uv[f * 2] = 0.5; uv[f * 2 + 1] = 0.5;
  uv[(f + 1) * 2] = 0.5; uv[(f + 1) * 2 + 1] = 0.5;

  g.attributes.position.needsUpdate = true;
  g.attributes.uv.needsUpdate = true;
  g.computeVertexNormals();
  g.computeBoundingSphere();
}

/* A flat disc on the same silhouette — what the photographs are printed on, so
   they are clipped by the exact shape of the crystal and re-crop as it moves. */
function makeDisc() {
  const count = RING + 1;
  const pos = new Float32Array(count * 3);
  const uv = new Float32Array(count * 2);
  const idx = [];
  for (let i = 0; i < RING; i++) idx.push(RING, i, (i + 1) % RING);
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  g.setIndex(idx);
  return g;
}

function shapeDisc(g, hw, hh, r) {
  const pos = g.attributes.position.array;
  const uv = g.attributes.uv.array;
  outline(hw, hh, r, _ring);
  for (let i = 0; i < RING; i++) {
    pos[i * 3] = _ring[i * 2]; pos[i * 3 + 1] = _ring[i * 2 + 1]; pos[i * 3 + 2] = 0;
    uv[i * 2] = (_ring[i * 2] + hw) / (2 * hw);
    uv[i * 2 + 1] = (_ring[i * 2 + 1] + hh) / (2 * hh);
  }
  pos[RING * 3] = 0; pos[RING * 3 + 1] = 0; pos[RING * 3 + 2] = 0;
  uv[RING * 2] = 0.5; uv[RING * 2 + 1] = 0.5;
  g.attributes.position.needsUpdate = true;
  g.attributes.uv.needsUpdate = true;
  g.computeVertexNormals();
  g.computeBoundingSphere();
}

/* Hold the photograph's own proportions no matter what the crystal does. The
   frame crops; the face is never scaled on one axis, never retouched, never
   moved off centre. */
function cover(tex, rep, off, hw, hh, focalY) {
  if (!tex.image) return false;
  const ta = tex.image.width / tex.image.height;
  const sa = hw / hh;
  if (sa > ta) {
    rep.set(1, ta / sa);
    off.set(0, (1 - ta / sa) * (1 - focalY));
  } else {
    rep.set(sa / ta, 1);
    off.set((1 - sa / ta) / 2, 0);
  }
  return true;
}

/* -------------------------------------------------------------- environment */
/* No HDR file to download: the studio is built out of emissive panels and
   pre-filtered, so reflections and Fresnel come from real radiance values. */
function studio(renderer) {
  const s = new THREE.Scene();
  const panel = (w, h, rgb, at, look) => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color().setRGB(rgb[0], rgb[1], rgb[2]),
        side: THREE.DoubleSide,
      })
    );
    m.position.set(at[0], at[1], at[2]);
    m.lookAt(look || new THREE.Vector3(0, 0, 0));
    s.add(m);
  };

  s.add(new THREE.Mesh(
    new THREE.SphereGeometry(46, 22, 14),
    new THREE.MeshBasicMaterial({
      color: new THREE.Color().setRGB(0.052, 0.034, 0.036),
      side: THREE.BackSide,
    })
  ));
  panel(28, 17, [2.5, 1.8, 1.1], [-14, 10, 10]);     // the warm key
  panel(2.2, 27, [9, 7.8, 5.6], [-6.5, 2, 14]);     // the hard streak the bevel is drawn by
  panel(1.3, 20, [6, 5.2, 3.7], [8.5, 1, 13]);      // a second, quieter edge
  panel(19, 13, [0.98, 0.68, 0.45], [15, -4, 9]);   // warm fill
  panel(34, 34, [0.4, 0.29, 0.23], [0, -15, 0], new THREE.Vector3(0, 10, 0)); // floor bounce
  panel(26, 11, [0.44, 0.4, 0.5], [0, 14, -11]);    // a cool sliver overhead, for separation

  const p = new THREE.PMREMGenerator(renderer);
  const tex = p.fromScene(s, 0.02).texture;
  p.dispose();
  s.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
  return tex;
}

/* The backdrop is the hero's own background, reconstructed.

   The glass must refract something or it renders black, so there has to be a
   surface behind it — but any surface of its own invents a rectangle you can
   see the edge of. So this paints the exact gradient the section behind it is
   painted with, sampled over the canvas's own rectangle, and adds the warm
   pool the crystal is lit into. The canvas then has no edge at all.

   It is also the only other thing in frame, which is what a shallow depth of
   field looks like: soft, and nothing in it to hold focus. */
/* The hero paints three layers: a radial base, a warm spotlight pooled behind
   the piece, and a vignette. All three are reconstructed here, in order, over
   the canvas's own rectangle — so the canvas is painted with exactly what sits
   behind it and has no edge to see. */
const HERO_BASE = [
  [0.00, 0x3a, 0x23, 0x29],
  [0.45, 0x21, 0x14, 0x16],
  [0.76, 0x13, 0x0d, 0x0e],
  [1.00, 0x13, 0x0d, 0x0e],
];
/* premultiplied, because that is how CSS interpolates a gradient into transparent */
const HERO_GLOW = [
  [0.00, 216 * 0.26, 178 * 0.26, 126 * 0.26, 0.26],
  [0.32, 133 * 0.14, 52 * 0.14, 66 * 0.14, 0.14],
  [0.64, 0, 0, 0, 0],
];
const HERO_VIG = [
  [0.52, 0, 0, 0, 0],
  [1.00, 15 * 0.5, 11 * 0.5, 13 * 0.5, 0.5],
];

function sampleRGB(stops, t) {
  let k = 1;
  while (k < stops.length - 1 && t > stops[k][0]) k++;
  const a = stops[k - 1], b = stops[k];
  const f = b[0] === a[0] ? 0 : Math.max(0, Math.min(1, (t - a[0]) / (b[0] - a[0])));
  return [a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f, a[3] + (b[3] - a[3]) * f];
}

function samplePM(stops, t) {
  if (t >= stops[stops.length - 1][0]) {
    const l = stops[stops.length - 1];
    return [l[1], l[2], l[3], l[4]];
  }
  if (t <= stops[0][0]) return [stops[0][1], stops[0][2], stops[0][3], stops[0][4]];
  let k = 1;
  while (k < stops.length - 1 && t > stops[k][0]) k++;
  const a = stops[k - 1], b = stops[k];
  const f = (t - a[0]) / (b[0] - a[0]);
  return [
    a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f,
    a[3] + (b[3] - a[3]) * f, a[4] + (b[4] - a[4]) * f,
  ];
}

function backdropTexture(rect, hero, vmin) {
  const S = 224;
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const x = c.getContext("2d");
  const img = x.createImageData(S, S);
  const d = img.data;

  const bcx = hero.width * 0.5, bcy = hero.height * 0.41;
  const brx = hero.width * 1.16, bry = hero.height * 0.8;          // base: 116% 80% at 50% 41%
  const gcx = hero.width * 0.5, gcy = hero.height * 0.46;
  // glow: a 96vmin circle at 50% 46%. Its gradient has no explicit size, so the
  // 100% stop sits at the box's farthest corner — 0.48 * vmin * sqrt(2), not the
  // radius. Using the radius makes it both too weak and too small.
  const gr = vmin * 0.48 * Math.SQRT2;
  const vrx = hero.width * 1.2, vry = hero.height * 0.92;          // vignette: 120% 92% at 50% 46%

  for (let j = 0; j < S; j++) {
    for (let i = 0; i < S; i++) {
      const px = rect.x + ((i + 0.5) / S) * rect.width;
      const py = rect.y + ((j + 0.5) / S) * rect.height;

      let col = sampleRGB(HERO_BASE, Math.min(Math.hypot((px - bcx) / brx, (py - bcy) / bry), 1));
      for (const [stops, t] of [
        [HERO_GLOW, Math.hypot(px - gcx, py - gcy) / gr],
        [HERO_VIG, Math.hypot((px - gcx) / vrx, (py - gcy) / vry)],
      ]) {
        const [r, g, b, a] = samplePM(stops, t);
        col = [r + col[0] * (1 - a), g + col[1] * (1 - a), b + col[2] * (1 - a)];
      }

      // a bit of dither: these are very dark, very smooth gradients and eight
      // bits of them band into visible rings
      const n = (((i * 7 + j * 13) % 5) - 2) * 0.32;
      const o = (j * S + i) * 4;
      d[o] = col[0] + n; d[o + 1] = col[1] + n; d[o + 2] = col[2] + n; d[o + 3] = 255;
    }
  }
  x.putImageData(img, 0, 0);

  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/* Micro scratches and the faintest smudge — polished, not perfect. */
function scratchTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 1024;
  const x = c.getContext("2d");
  x.fillStyle = "#8080ff"; x.fillRect(0, 0, 1024, 1024);
  x.lineCap = "round";
  for (let i = 0; i < 220; i++) {
    const a = Math.random() * Math.PI, L = 20 + Math.random() * 190;
    const sx = Math.random() * 1024, sy = Math.random() * 1024;
    x.strokeStyle = `rgba(${128 + (Math.random() * 26 - 13) | 0},${128 + (Math.random() * 26 - 13) | 0},255,${0.05 + Math.random() * 0.1})`;
    x.lineWidth = 0.5 + Math.random() * 1.1;
    x.beginPath(); x.moveTo(sx, sy);
    x.quadraticCurveTo(sx + Math.cos(a) * L * 0.5 + 8, sy + Math.sin(a) * L * 0.5, sx + Math.cos(a) * L, sy + Math.sin(a) * L);
    x.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(2, 3);
  return t;
}

/* The pool the object sits in, and the light it throws through itself.
   A body with weight has both: something under it, and something beyond it. */
function poolTexture(inner, mid, outer) {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const x = c.getContext("2d");
  const g = x.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, inner); g.addColorStop(0.42, mid); g.addColorStop(1, outer);
  x.fillStyle = g; x.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
}

function dustTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const x = c.getContext("2d");
  const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, "rgba(255,238,208,1)");
  g.addColorStop(0.4, "rgba(255,232,196,.32)");
  g.addColorStop(1, "rgba(255,230,190,0)");
  x.fillStyle = g; x.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

/* ------------------------------------------------------------------ timing */
/* Every property is a track of keyframes sampled with smoothstep. Nothing
   starts or stops abruptly, and no single curve is stretched over the whole
   sequence — the mistake that makes a transform feel mechanical. */
function track(keys) {
  return (t) => {
    if (t <= keys[0][0]) return keys[0][1];
    const last = keys[keys.length - 1];
    if (t >= last[0]) return last[1];
    for (let i = 1; i < keys.length; i++) {
      if (t <= keys[i][0]) {
        const [t0, v0] = keys[i - 1], [t1, v1] = keys[i];
        const k = (t - t0) / (t1 - t0);
        return v0 + (v1 - v0) * (k * k * (3 - 2 * k));
      }
    }
    return last[1];
  };
}

const END = 9.9;
const T = {
  //             01 ─────── 02 ─────── 03 ─────── 04 ─────── 05 ─────── 06 ── 07
  rotY:   track([[0, 0], [2.2, -0.60], [3.6, -0.42], [5.6, -0.21], [7.4, -0.075], [END, 0]]),
  rotX:   track([[0, 0], [2.2, 0.052], [5.6, 0.026], [END, 0]]),
  // a Gucci rectangular lens, but only as wide as a face can be held in
  hw:     track([[5.6, 0.665], [7.4, 1.12]]),
  hh:     track([[5.6, 0.995], [7.4, 0.985]]),
  rad:    track([[2.2, 0.055], [3.6, 0.155], [5.6, 0.155], [7.4, 0.30]]),
  halfT:  track([[5.6, 0.075], [7.4, 0.061]]),
  bevel:  track([[2.2, 0.062], [3.6, 0.09], [7.4, 0.07]]),
  rough:  track([[2.2, 0.014], [3.6, 0.008], [7.4, 0.012]]),
  disp:   track([[2.2, 0.025], [3.6, 0.05], [7.4, 0.03]]),
  // 04 — the selfie sinks: it recedes, shrinks and loses light, the way a layer
  // set deeper into a block of glass does. The portrait rises the other way.
  zoomA:  track([[3.6, 1], [5.6, 0.915], [9.0, 0.88]]),
  dimA:   track([[3.6, 1], [5.6, 0.66], [9.0, 0.6]]),
  zoomB:  track([[3.6, 0.855], [5.6, 0.975], [7.4, 1]]),
  mix:    track([[3.6, 0], [5.6, 0.84], [END, 1]]),
  pZ:     track([[3.6, -0.088], [7.4, -0.07]]),
  rim:    track([[7.15, 0], [8.25, 1]]),
  arm:    track([[7.6, 0], [9.05, 1]]),
};

/* --------------------------------------------------------------------- boot */
export function boot(host, opts) {
  if (!host) return null;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) return null;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    if (!renderer.getContext()) return null;
  } catch (e) { return null; }

  const small = matchMedia("(max-width: 820px)").matches;
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, small ? 1.75 : 2));
  renderer.setClearColor(0x130d0e, 0);
  /* No tone mapping, deliberately. Two reasons, both hard requirements here:
     the canvas is painted with the hero's own background and a filmic curve
     would shift it away from the section it sits in, and the photographs must
     survive untouched — with a straight pipeline an sRGB texture round-trips
     exactly, so no skin, no shadow and no colour on the face is altered. The
     studio's radiance is set low enough that highlights roll off into bloom
     instead of clipping flat. */
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  /* Full resolution. The refraction buffer was running at 0.65 and everything
     seen through the glass was being upsampled from it — that alone was most of
     the softness. The cost comes back out of the geometry rebuild instead. */
  renderer.transmissionResolutionScale = small ? 0.85 : 1;
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.environment = studio(renderer);

  const FOV = 24;                                     // an 85 mm on full frame
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 120);
  camera.position.set(0, 0, 5.5);

  /* the room behind the glass — rebuilt on resize, since it is keyed to where
     the canvas sits inside the hero */
  const heroEl = host.closest(".hero") || document.body;
  const back = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial());
  back.position.z = -8;
  scene.add(back);
  function repaintBackdrop() {
    const a = host.getBoundingClientRect(), b = heroEl.getBoundingClientRect();
    if (!a.width || !b.width) return;
    if (back.material.map) back.material.map.dispose();
    // The canvas is sized in whole pixels, so the rectangle sampled has to be
    // the same whole pixels. Sampling the fractional rect instead leaves a
    // sub-pixel scale error that is zero at the top-left and shows as a seam
    // down the right edge and along the bottom.
    back.material.map = backdropTexture(
      {
        x: Math.round(a.left - b.left), y: Math.round(a.top - b.top),
        width: host.clientWidth, height: host.clientHeight,
      },
      { width: heroEl.clientWidth, height: heroEl.clientHeight },
      Math.min(innerWidth, innerHeight)
    );
    back.material.needsUpdate = true;
  }

  /* What gives a body weight: something beneath it, and something beyond it.
     The shadow sits between the backdrop and the object; the caustic is the
     warm light the crystal gathers and throws past itself, offset away from
     the key the way a real one is. */
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({
    map: poolTexture("rgba(9,5,6,.62)", "rgba(9,5,6,.2)", "rgba(9,5,6,0)"),
    transparent: true, depthWrite: false,
  }));
  shadow.position.set(0.06, -0.06, -1.5);
  scene.add(shadow);

  const caustic = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({
    map: poolTexture("rgba(255,214,150,.5)", "rgba(214,150,88,.16)", "rgba(180,120,70,0)"),
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  }));
  caustic.position.set(0.5, -0.34, -1.1);
  scene.add(caustic);

  /* atmosphere */
  const N = small ? 46 : 96;
  const dp = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    dp[i * 3] = (Math.random() - 0.5) * 6.4;
    dp[i * 3 + 1] = (Math.random() - 0.5) * 4.6;
    dp[i * 3 + 2] = -1 - Math.random() * 5;
  }
  const dg = new THREE.BufferGeometry();
  dg.setAttribute("position", new THREE.BufferAttribute(dp, 3));
  const dust = new THREE.Points(dg, new THREE.PointsMaterial({
    map: dustTexture(), size: 0.055, transparent: true, depthWrite: false,
    blending: THREE.AdditiveBlending, opacity: 0.5, sizeAttenuation: true,
  }));
  scene.add(dust);

  /* the photographs, untouched — only the frame around them ever changes */
  const load = new THREE.TextureLoader();
  // the crop can only be worked out once the file's real proportions are known
  const recrop = () => { lastSig = -1; };
  const texA = load.load(opts.selfie, recrop);
  const texB = load.load(opts.portrait, recrop);
  for (const t of [texA, texB]) {
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
    t.anisotropy = renderer.capabilities.getMaxAnisotropy();
  }

  /* One opaque surface holds both layers. It has to be opaque: three renders
     only opaque objects into the pass the glass refracts, so anything marked
     transparent would simply not exist inside the crystal. The two
     photographs are therefore mixed in the shader, each with its own crop and
     its own apparent depth. */
  const U = {
    uMapB: { value: texB },
    uMix: { value: 0 },
    uRepA: { value: new THREE.Vector2(1, 1) }, uOffA: { value: new THREE.Vector2(0, 0) },
    uRepB: { value: new THREE.Vector2(1, 1) }, uOffB: { value: new THREE.Vector2(0, 0) },
    uZoomA: { value: 1 }, uZoomB: { value: 1 }, uDimA: { value: 1 },
  };
  const photoMat = new THREE.MeshBasicMaterial({ map: texA });
  photoMat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, U);
    sh.fragmentShader = sh.fragmentShader
      .replace("#include <common>", `#include <common>
        uniform sampler2D uMapB;
        uniform float uMix, uZoomA, uZoomB, uDimA;
        uniform vec2 uRepA, uOffA, uRepB, uOffB;`)
      .replace("#include <map_fragment>", `
        vec2 pA = clamp((vMapUv - 0.5) / uZoomA + 0.5, 0.0, 1.0) * uRepA + uOffA;
        vec2 pB = clamp((vMapUv - 0.5) / uZoomB + 0.5, 0.0, 1.0) * uRepB + uOffB;
        vec4 layerA = texture2D(map, pA) * vec4(vec3(uDimA), 1.0);
        vec4 layerB = texture2D(uMapB, pB);
        diffuseColor *= mix(layerA, layerB, uMix);`);
  };
  photoMat.customProgramCacheKey = () => "az-crystal-layers";

  const disc = makeDisc();
  const photo = new THREE.Mesh(disc, photoMat);
  scene.add(photo);

  /* the gold the lens is set into */
  const rimGeo = makeSlab();
  const rim = new THREE.Mesh(rimGeo, new THREE.MeshPhysicalMaterial({
    color: 0xd8ab60, metalness: 1, roughness: 0.13,
    clearcoat: 1, clearcoatRoughness: 0.08, envMapIntensity: 2.3,
    transparent: true, opacity: 0,
  }));
  rim.visible = false;
  scene.add(rim);

  /* the temple */
  const armGeo = makeSlab();
  shapeSlab(armGeo, 0.84, 0.062, 0.055, 0.03, 0.022);
  const arm = new THREE.Mesh(armGeo, new THREE.MeshPhysicalMaterial({
    color: 0xdcb066, metalness: 1, roughness: 0.16,
    clearcoat: 1, clearcoatRoughness: 0.1, envMapIntensity: 2.1,
    transparent: true, opacity: 0,
  }));
  arm.visible = false;
  scene.add(arm);

  /* The nose bridge. One lens with a temple reads as a loupe; the same lens
     with a bridge leaving the other side reads, unmistakably, as one half of a
     pair of glasses. It is the cheapest honest thing in the scene. */
  const bridgeGeo = makeSlab();
  shapeSlab(bridgeGeo, 0.135, 0.042, 0.04, 0.026, 0.018);
  const bridge = new THREE.Mesh(bridgeGeo, new THREE.MeshPhysicalMaterial({
    color: 0xdcb066, metalness: 1, roughness: 0.15,
    clearcoat: 1, clearcoatRoughness: 0.09, envMapIntensity: 2.1,
    transparent: true, opacity: 0,
  }));
  bridge.visible = false;
  scene.add(bridge);

  /* the crystal */
  const glassGeo = makeSlab();
  /* Optical glass, not frosted glass. Roughness on a transmissive material
     picks a blurrier mip of the refraction buffer, thickness hazes and tints
     what passes through it, dispersion smears it chromatically, and a normal
     map perturbs the refraction across the entire face — every one of those was
     set high enough to soften the photograph. They are all now at the level
     where they shape the bevel and leave the middle of the pane clear. */
  const glass = new THREE.Mesh(glassGeo, new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0, roughness: 0.012,
    transmission: 1, thickness: 0.35, ior: 1.5, dispersion: 0.025,
    attenuationColor: new THREE.Color(0xf8efe2), attenuationDistance: 9,
    clearcoat: 1, clearcoatRoughness: 0.02,
    specularIntensity: 1, envMapIntensity: 1.7,
    normalMap: scratchTexture(), normalScale: new THREE.Vector2(0.008, 0.008),
  }));
  glass.renderOrder = 3;
  scene.add(glass);

  /* bloom only — the highlights on a polished bevel bloom, nothing else should */
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), small ? 0.26 : 0.34, 0.8, 0.9);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  /* ------------------------------------------------------------------ state */
  let t = 0;                 // sequence time; 0 = stage 01, END = stage 08
  let playing = false, startedAt = 0;
  /* Health, measured rather than guessed: the first second at rest is the
     cheapest the scene ever gets, so if it cannot hold a frame rate there it
     never will, and the plate is a better hero than a slideshow. */
  let probeFrames = 0, probeSum = 0, healthy = false, seenFor = 0;
  const SPEED = 1.16;        // the beats keep their relative timing; the whole is tighter
  let clock = new THREE.Clock();
  let px = 0, py = 0, tpx = 0, tpy = 0;
  let live = true, visible = true;
  let camZ = 5.5, lastSig = -1, coverTries = 0;

  function resize() {
    const w = host.clientWidth, h = host.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    composer.setSize(w, h);
    // composer.setSize resizes every pass to the full frame; bloom does not need
    // it, and at 2x device pixels five mip levels of it is the most expensive
    // thing on screen
    bloom.setSize(Math.min(w, 400), Math.min(h, 400));
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    repaintBackdrop();
    fitBackdrop();
  }

  /* The backdrop's gradient has to keep landing where the hero's does, so it
     tracks the frame as the camera moves — not only on resize. */
  function fitBackdrop() {
    const d = back.position.z * -1 + camera.position.z;
    const hh = Math.tan((FOV * Math.PI) / 360) * d;
    // exactly the frame, not a hair over: the texture is painted for the
    // canvas's rectangle, so any margin here scales the gradient off register
    back.scale.set(hh * camera.aspect * 2, hh * 2, 1);
  }

  /* Pull back only as far as the current silhouette needs — the camera move is
     a consequence of the object growing, never a separate effect. */
  function fit(hw, hh, armK) {
    /* The margins are what the mask needs, not what the object needs: the canvas
       edges dissolve into the hero rather than matching it, so the object is
       held inside the solid part of that fade. */
    const reach = hw + (armK || 0) * (small ? 0.18 : 0.3);   // the temple is part of it
    const need = Math.max(hh * 1.4, (reach * (small ? 1.06 : 1.2)) / camera.aspect);
    return need / Math.tan((FOV * Math.PI) / 360);
  }

  function frame() {
    if (!live) return;
    requestAnimationFrame(frame);
    const raw = clock.getDelta();
    const dt = Math.min(raw, 0.05);
    if (!visible) return;

    /* Decide on elapsed time, never on a frame count. A machine drawing two
       frames a second is the one this exists to catch, and counting to sixty
       frames would take it half a minute to reach the verdict. */
    if (opts.probe === false) healthy = true;
    if (!healthy && !playing && t === 0) {
      probeSum += raw;
      if (probeSum > 0.55) probeFrames++;         // the first half second compiles shaders
      if (probeSum > 1.75) {
        if (probeFrames / (probeSum - 0.55) < 24) {
          live = false;
          if (opts.onSlow) opts.onSlow();
          return;
        }
        healthy = true;
      }
    }

    /* It plays itself. A ten-second reveal nobody knows to tap for is a
       ten-second reveal nobody sees — and only once it is on screen, in a
       foreground tab, and actually drawing. */
    if (healthy && !playing && t === 0 && opts.autoplay !== false) {
      seenFor += raw;   // real seconds on screen, not frames drawn
      if (seenFor > (opts.autoplayAfter || 6.6)) {
        startedAt = performance.now();
        playing = true;
        if (opts.onPlay) opts.onPlay();
      }
    }

    if (playing) {
      // wall clock, so the reveal takes the same time on a slow machine as on a
      // fast one — it just draws fewer of them
      t = Math.min(((performance.now() - startedAt) / 1000) * SPEED, END);
      if (t >= END) { playing = false; if (opts.onFinish) opts.onFinish(); }
    }
    const now = performance.now() / 1000;
    const settled = t >= END;

    /* silhouette — rebuilt only while it is actually changing */
    const hw = T.hw(t), hh = T.hh(t), rad = T.rad(t), halfT = T.halfT(t), bevel = T.bevel(t);
    const sig = hw + hh * 3 + rad * 7 + halfT * 11 + bevel * 13;
    if (Math.abs(sig - lastSig) > 1e-6) {
      lastSig = sig;
      shapeSlab(glassGeo, hw, hh, rad, halfT, bevel);
      const iw = hw - bevel * 0.9, ih = hh - bevel * 0.9;
      shapeDisc(disc, iw, ih, Math.max(rad - bevel * 0.6, 0.014));
      const okA = cover(texA, U.uRepA.value, U.uOffA.value, iw, ih, 0.33);
      const okB = cover(texB, U.uRepB.value, U.uOffB.value, iw, ih, 0.34);
      // retry while the files are still decoding, but never forever: a 404 would
      // otherwise rebuild the geometry on every frame for the life of the page
      if ((!okA || !okB) && coverTries++ < 240) lastSig = -1;
    }

    /* the body */
    glass.material.roughness = T.rough(t);
    glass.material.dispersion = T.disp(t);
    glass.material.clearcoatRoughness = 0.014 + T.rough(t) * 0.3;

    /* the two layers inside it */
    photo.position.z = T.pZ(t);
    U.uZoomA.value = T.zoomA(t);
    U.uZoomB.value = T.zoomB(t);
    U.uDimA.value = T.dimA(t);
    U.uMix.value = T.mix(t);

    /* the gold */
    const rimK = T.rim(t);
    rim.visible = rimK > 0.002;
    if (rim.visible) {
      const grow = 0.052 * rimK;
      shapeSlab(rimGeo, hw + grow, hh + grow, rad + grow * 0.8, halfT * 0.94, bevel * 0.5);
      rim.material.opacity = rimK;
      rim.position.z = -0.004;
    }

    /* the bridge, leaving toward the lens that is out of frame */
    const bridgeK = T.rim(t);
    bridge.visible = bridgeK > 0.002;
    if (bridge.visible) {
      bridge.material.opacity = bridgeK;
      bridge.position.set(-(hw + 0.075 * bridgeK), hh * 0.1, 0.01);
      bridge.rotation.set(0, 0.3, 0.24);              // rising toward the lens out of frame
      bridge.scale.setScalar(0.55 + bridgeK * 0.45);
    }

    /* the temple, arriving from behind and locking in */
    const armK = T.arm(t);
    arm.visible = armK > 0.002;
    if (arm.visible) {
      const lock = armK < 1 ? armK : 1;
      const over = Math.sin(Math.min(armK, 1) * Math.PI) * 0.035;   // the settle
      arm.material.opacity = Math.min(armK * 1.6, 1);
      arm.position.set(
        hw - 0.14 + (1 - lock) * 0.85 + over,
        hh * 0.26,
        -0.86 + lock * 0.9
      );
      arm.rotation.set(0, -0.74 - (1 - lock) * 0.5, -0.12);
    }

    /* camera, breath and pointer */
    camZ += (fit(hw, hh, T.arm(t)) - camZ) * Math.min(dt * 3.4, 1);
    camera.position.z = camZ;
    fitBackdrop();

    const breath = Math.sin(now * 0.44) * 0.016 + Math.sin(now * 0.71 + 1.3) * 0.008;
    const drift = Math.sin(now * 0.33) * 0.012;

    if (settled) { tpx += (px - tpx) * Math.min(dt * 3, 1); tpy += (py - tpy) * Math.min(dt * 3, 1); }
    else { tpx = 0; tpy = 0; }
    const ry = T.rotY(t) + tpx * 0.17 + drift;
    const rx = T.rotX(t) + tpy * 0.12 + Math.sin(now * 0.51 + 0.7) * 0.006;
    for (const o of [glass, photo, rim]) {
      o.rotation.y = ry; o.rotation.x = rx; o.position.y = breath;
    }
    for (const o of [arm, bridge]) {
      if (!o.visible) continue;
      o.rotation.y += ry;
      o.rotation.x += rx * 0.6;
      o.position.y += breath;
      o.position.applyAxisAngle(YAXIS, ry);     // fixed to the rim, so it travels with it
    }

    /* The shadow and the caustic follow the body they belong to, and stay tight
       to it. A broad soft field would read as atmosphere, but it would also
       darken the whole canvas — and the canvas is painted to match the hero
       exactly, so anything that covers all of it puts the rectangle back. */
    shadow.scale.set(hw * 2.7, hh * 2.5, 1);
    shadow.position.set(hw * 0.12 + ry * 0.4, breath * 0.5 - hh * 0.1, -1.5);
    caustic.scale.set(hw * 2.1, hh * 1.9, 1);
    caustic.position.set(hw * 0.62 + ry * 1.2, breath * 0.6 - hh * 0.34, -1.1);
    caustic.material.opacity = 0.62 + Math.sin(now * 0.37) * 0.1;

    dust.rotation.y = now * 0.014;
    dust.position.y = Math.sin(now * 0.2) * 0.09;

    composer.render();
  }

  /* pointer, stage 08 only */
  function onMove(e) {
    const r = host.getBoundingClientRect();
    px = ((e.clientX - r.left) / r.width - 0.5) * 2;
    py = ((e.clientY - r.top) / r.height - 0.5) * 2;
  }
  const pointerZone = opts.pointerZone || host;
  pointerZone.addEventListener("pointermove", onMove);
  pointerZone.addEventListener("pointerleave", () => { px = 0; py = 0; });

  /* A lost context — a backgrounded tab on a phone, memory pressure, a driver
     reset — would otherwise leave a blank rectangle where the hero was, because
     the plate underneath has already been hidden. Stop, and hand the hero back. */
  renderer.domElement.addEventListener("webglcontextlost", (e) => {
    e.preventDefault();
    live = false;
    if (opts.onLost) opts.onLost();
  }, false);

  /* Resize is a storm on mobile — the address bar alone fires it continuously,
     and each repaint allocates a texture. Coalesce to one per frame budget. */
  let resizeTimer = 0;
  const queueResize = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 140);
  };
  addEventListener("resize", queueResize);
  // layout can change with no window resize at all: fonts landing, the reveal
  // running, the hero growing. Watch the boxes themselves.
  if ("ResizeObserver" in window) {
    const ro = new ResizeObserver(queueResize);
    ro.observe(host);
    ro.observe(heroEl);
  }
  document.addEventListener("visibilitychange", () => { visible = !document.hidden; clock.getDelta(); });
  if ("IntersectionObserver" in window) {
    new IntersectionObserver((es) => {
      visible = es[0].isIntersecting && !document.hidden;
      clock.getDelta();
    }, { threshold: 0.02 }).observe(host);
  }

  resize();
  // seat the first frame before anything is shown
  shapeSlab(glassGeo, T.hw(0), T.hh(0), T.rad(0), T.halfT(0), T.bevel(0));
  camZ = fit(T.hw(0), T.hh(0), 0);
  camera.position.z = camZ;
  resize();
  requestAnimationFrame(frame);

  return {
    play() {
      if (t !== 0 || playing) return false;
      startedAt = performance.now(); playing = true;
      if (opts.onPlay) opts.onPlay();
      return true;
    },
    seek(v) { t = Math.max(0, Math.min(v, END)); playing = false; startedAt = performance.now() - t * 1000; },
    skip() { if (playing || t < END) { t = END; playing = false; if (opts.onFinish) opts.onFinish(); } },
    get done() { return t >= END; },
    get running() { return playing; },
    dispose() { live = false; renderer.dispose(); },
  };
}
