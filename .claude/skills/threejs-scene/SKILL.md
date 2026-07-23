---
name: threejs-scene
description: >-
  Build professional, production-ready 3D scenes for websites with Three.js.
  Use this whenever the user wants 3D on a web page — a rotating hero object, a
  floating product, an interactive background, a WebGL canvas, particles, or any
  "make it 3D" / "add depth" / "three.js" / "webgl" request — even if they don't
  name Three.js explicitly. Covers the correct renderer/camera/light setup,
  color management, responsive resizing, the render loop, pointer interaction,
  and clean teardown. For scenes driven by page scroll, ALSO use the
  scroll-3d-motion skill; for custom shader materials, ALSO use glsl-shaders;
  for loading .glb/.gltf models, ALSO use glb-product-viewer.
---

# Three.js scene

Set up 3D scenes that look intentional and run smoothly, without the common
beginner mistakes (washed-out colors, blurry canvas on retina, memory leaks,
janky resize). The guidance below defaults to a **no-build, CDN + import map**
setup because that matches most static sites; a build-tool variant is noted
where it differs.

## Decide the setup first

- **Static site / no bundler** (plain `index.html`, like most showcase sites):
  use an ES-module **import map** pointing at a pinned CDN version. This is the
  default below.
- **Has a bundler** (Vite/Webpack/Next): `npm i three`, import from `'three'`,
  and import addons from `'three/addons/...'`. Everything else is identical.

Always **pin a version** (e.g. `three@0.160.0`) — unpinned CDN URLs break scenes
overnight when a new release lands.

## The baseline scene

This is the skeleton to adapt — it is correct on the details that matter
(color space, pixel ratio, resize, disposal). Read the *why* comments; they are
the parts people get wrong.

```html
<canvas id="scene"></canvas>
<style>
  #scene { display:block; width:100%; height:100vh; }
  /* A canvas is an inline element by default -> phantom gap below it.
     display:block removes it. Size the canvas with CSS, not width/height attrs. */
</style>

<script type="importmap">
{ "imports": {
    "three": "https://unpkg.com/three@0.160.0/build/three.module.js",
    "three/addons/": "https://unpkg.com/three@0.160.0/examples/jsm/"
} }
</script>

<script type="module">
import * as THREE from 'three';

const canvas = document.querySelector('#scene');

// Renderer -----------------------------------------------------------------
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
// Cap pixelRatio at 2: past 2 you pay 3-4x the fragments for no visible gain,
// and mobiles report 3+ which tanks the framerate.
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
// Modern Three defaults to SRGB output + ACES-ish tone mapping already, but be
// explicit so colors match your CSS/design instead of looking dull/grey.
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;

// Scene + camera -----------------------------------------------------------
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100); // aspect set in resize()
camera.position.set(0, 0, 6);

// Content ------------------------------------------------------------------
const mesh = new THREE.Mesh(
  new THREE.IcosahedronGeometry(1.4, 0),
  new THREE.MeshStandardMaterial({ color: 0x7a2c3d, roughness: 0.35, metalness: 0.1 })
);
scene.add(mesh);

// Lights: never light a MeshStandardMaterial with only ambient — it looks flat.
// Ambient sets the floor, one key directional gives form and a highlight.
scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const key = new THREE.DirectionalLight(0xffffff, 2.2);
key.position.set(3, 5, 4);
scene.add(key);

// Resize -------------------------------------------------------------------
// Drive size from the canvas's own client box, not window.innerWidth — that
// keeps it correct when the canvas is a section, sidebar, or card, not full-page.
function resize() {
  const { clientWidth: w, clientHeight: h } = canvas;
  renderer.setSize(w, h, false);          // false = don't overwrite CSS size
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
resize();
new ResizeObserver(resize).observe(canvas);

// Render loop --------------------------------------------------------------
const clock = new THREE.Clock();
let raf;
function tick() {
  const dt = clock.getDelta();            // seconds since last frame
  mesh.rotation.y += dt * 0.4;            // frame-rate independent (not += 0.01)
  renderer.render(scene, camera);
  raf = requestAnimationFrame(tick);
}
tick();

// Teardown (SPA route change / component unmount) --------------------------
// Geometries, materials and textures live on the GPU and are NOT garbage
// collected. Leaking them across route changes is the #1 Three.js memory bug.
function dispose() {
  cancelAnimationFrame(raf);
  scene.traverse(o => {
    o.geometry?.dispose();
    const m = o.material;
    if (Array.isArray(m)) m.forEach(x => x.dispose()); else m?.dispose();
  });
  renderer.dispose();
}
window.addEventListener('beforeunload', dispose);
</script>
```

## Getting it to look good, not just render

Rendering a grey blob is easy; the difference between amateur and professional
3D on the web is almost entirely lighting, material, and framing.

- **Light for form.** A three-point-ish rig reads as designed: a bright key at
  ~45°, a softer fill from the opposite side, ambient/environment for the floor.
  A single light from straight-on flattens everything.
- **Use an environment map for reflections.** `MeshStandardMaterial` /
  `MeshPhysicalMaterial` only look "material" when they have something to
  reflect. Generate one cheaply without an HDR file:
  ```js
  import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  ```
- **Match materials to the design's tactility.** Matte product → high
  `roughness`, low `metalness`. Glossy/lacquered → low roughness. For glass or
  clearcoat leather use `MeshPhysicalMaterial` (`transmission`, `clearcoat`).
- **Frame with a longer lens.** A 35–50° FOV gives an elegant, low-distortion
  look; wide FOVs (75+) exaggerate perspective and feel like a game.
- **Respect the palette.** Pull mesh/light/background colors from the site's
  existing CSS variables so the 3D feels part of the page, not bolted on.

## Interaction

- **Pointer parallax** (subtle, tasteful): map normalized pointer to a small
  camera or object offset and **lerp** toward it so motion eases instead of
  snapping.
  ```js
  const target = { x: 0, y: 0 };
  addEventListener('pointermove', e => {
    target.x = (e.clientX / innerWidth  - 0.5) * 0.6;
    target.y = (e.clientY / innerHeight - 0.5) * 0.6;
  });
  // in tick(): camera.position.x += (target.x - camera.position.x) * 0.05;
  ```
- **Clicking objects**: use a `Raycaster` from the pointer through the camera;
  see `references/patterns.md`.
- **OrbitControls** for user-spun models: import from
  `three/addons/controls/OrbitControls.js`, set `enableDamping = true`, and call
  `controls.update()` in the loop.

## Performance and correctness checklist

Before calling a scene done, verify:

- `pixelRatio` capped at 2; canvas is crisp on retina, not blurry or melting.
- Resize works — drag the window, rotate a phone: no stretching, no clipping.
- Animation uses **delta time**, so it runs the same on 60Hz and 120Hz displays.
- One `requestAnimationFrame` loop, cancelled on teardown; geometries/materials
  disposed. No growing memory across navigations.
- Pause the loop when offscreen for background canvases (IntersectionObserver) —
  don't burn battery rendering what nobody sees.
- **Reduced motion**: if `matchMedia('(prefers-reduced-motion: reduce)')`
  matches, render a static frame (or drastically slow it) instead of constant
  spinning — some users get motion sickness.
- Provide a fallback: if WebGL is unavailable, show the poster image / gradient
  the canvas was enhancing, so the page never looks broken.

## Deeper references

- `references/patterns.md` — raycasting/picking, particle systems, post-
  processing (bloom), instancing for many objects, GLSL-free fresnel tricks,
  and the full disposal helper for complex scenes. Read it when a scene needs
  more than the baseline above.
