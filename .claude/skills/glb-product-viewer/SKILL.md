---
name: glb-product-viewer
description: >-
  Build an interactive 3D product viewer for the web — load and display
  .glb/.gltf models with realistic studio lighting, let users orbit/spin/zoom,
  show hotspots, and switch materials/colors. Use this whenever the user wants
  to "show a product in 3D", a "360 / spin viewer", "load a 3D model", a
  "glb/gltf" on the page, "rotate the bag/shoe/product", an AR-style
  configurator, or a hero object the visitor can drag — even if they don't name
  the format. Ideal for e-commerce and showcase sites (bags, shoes, watches,
  furniture). Builds on the threejs-scene skill (renderer/scene/lighting) and
  can be driven by scroll via scroll-3d-motion. This skill covers loading,
  lighting a product to look real, controls, and performance.
---

# 3D product viewer

A product viewer has one job: make the object look real and let the visitor
inspect it. That means correct model loading, **studio lighting** (the single
biggest factor), smooth orbit controls, and keeping load time sane. For a
plug-and-play option, `<model-viewer>` is covered at the end — but the Three.js
path below gives full control over lighting and integration with the rest of a
custom scene.

## First choice: hand-built or `<model-viewer>`?

- **`<model-viewer>` web component** — drop-in `<model-viewer src="bag.glb">`.
  Great when you need orbit + AR fast and don't need custom scene integration.
  See the bottom of this file. Best for a quick, standalone product widget.
- **Three.js GLTFLoader** — use when the model shares a scene with other 3D,
  needs custom lighting/materials/shaders, scroll-driven camera, or bespoke UI.
  This is the main path below.

## Loading a model correctly

GLTF/GLB is the web-standard format ("the JPEG of 3D"). Load with `GLTFLoader`,
and set up `DRACOLoader`/`KTX2Loader` so compressed models (which most optimized
ones are) actually decode.

```js
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

const draco = new DRACOLoader();
draco.setDecoderPath('https://unpkg.com/three@0.160.0/examples/jsm/libs/draco/');
const loader = new GLTFLoader();
loader.setDRACOLoader(draco);   // no-op if the model isn't Draco-compressed, safe to keep

loader.load('/models/bag.glb',
  (gltf) => {
    const model = gltf.scene;
    frameModel(model, camera, controls);  // center + fit, see below
    scene.add(model);
    // gltf.animations -> play with THREE.AnimationMixer if the model is rigged
  },
  (evt) => { /* evt.loaded / evt.total -> progress bar */ },
  (err) => { console.error(err); /* show poster fallback */ }
);
```

**Always show a loading state.** Models are often 1–10 MB; a blank canvas reads
as broken. Use the progress callback for a bar or spinner, and keep the poster
image visible until `load` fires.

### Center and frame the model (don't hardcode camera distance)

Models come in wildly different scales and origins. Compute the bounding box and
fit the camera so any model lands framed:

```js
function frameModel(model, camera, controls) {
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  model.position.sub(center);                       // recenter to origin

  const maxDim = Math.max(size.x, size.y, size.z);
  const fitDist = maxDim / (2 * Math.tan((Math.PI * camera.fov) / 360));
  camera.position.set(0, size.y * 0.15, fitDist * 1.4); // 1.4 = a little breathing room
  camera.near = maxDim / 100; camera.far = maxDim * 100;
  camera.updateProjectionMatrix();
  controls?.target.set(0, 0, 0);
  controls?.update();
}
```

## Studio lighting — this is what sells it

A product lit by one lamp looks like a render test; lit like a photo studio it
looks purchasable. Two things do the heavy lifting:

1. **An environment map for reflections.** Every realistic material samples the
   environment. Generate a neutral studio env with zero asset download:
   ```js
   import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
   const pmrem = new THREE.PMREMGenerator(renderer);
   scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
   ```
   For a specific mood (warm boutique, cool tech), load an `.hdr` with
   `RGBELoader` instead — see `references/lighting-and-materials.md`.
2. **A soft key + rim.** Key light at ~35–45° for form, a dimmer rim/back light
   to separate the product from the background with a bright edge.

```js
scene.add(new THREE.AmbientLight(0xffffff, 0.4));
const key = new THREE.DirectionalLight(0xffffff, 2.5);
key.position.set(4, 6, 5); key.castShadow = true;
const rim = new THREE.DirectionalLight(0xffffff, 1.2);
rim.position.set(-5, 3, -4);
scene.add(key, rim);
```

Tone mapping matters too — keep `ACESFilmicToneMapping` and tune
`toneMappingExposure` (0.8–1.2) so highlights don't blow out. Full material
tuning (leather, metal hardware, glass, fabric) and contact shadows are in
`references/lighting-and-materials.md`.

## Orbit controls

Let visitors spin the product. Damping is what makes it feel expensive.

```js
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;          // inertia — essential for a premium feel
controls.dampingFactor = 0.08;
controls.enablePan = false;             // products: rotate + zoom only, no panning away
controls.minDistance = fitDist * 0.8;   // clamp zoom so users can't fly inside/away
controls.maxDistance = fitDist * 2.5;
controls.minPolarAngle = 0.2;           // stop them looking straight up/down under the base
controls.maxPolarAngle = Math.PI * 0.85;
controls.autoRotate = true;             // gentle idle spin; stop on interaction
controls.autoRotateSpeed = 0.8;
// controls.update() every frame (damping/autoRotate need it).
```

Stop `autoRotate` on first user interaction (`controls.addEventListener('start', ...)`)
so it doesn't fight them, and consider resuming after a few idle seconds.

## Material / color configurator

For "choose your color" viewers, find the mesh by name and swap material
properties — don't reload the model.

```js
model.traverse(o => { if (o.name === 'Body') o.userData.mat = o.material; });
function setColor(hex) {
  model.traverse(o => {
    if (o.userData.mat) o.material.color.set(hex);  // or swap whole materials
  });
}
```
Expose swatches in the DOM that call `setColor`. For material *types* (matte vs
patent leather) swap `roughness`/`clearcoat`, see the reference file.

## Performance — models are heavy

- **Optimize the asset before shipping.** Run `.glb` through
  [gltf-transform](https://gltf.report) or `gltfpack`: Draco/meshopt geometry
  compression + KTX2/Basis textures can cut 10 MB → ~1 MB. This matters more
  than any code change.
- **Right-size textures.** 4K textures on a thumbnail-sized viewer waste
  bandwidth and VRAM; 1–2K is plenty for most products.
- **Lazy-load.** Don't fetch the model until the viewer scrolls near the
  viewport (IntersectionObserver) — the hero image should paint first.
- **Cap pixel ratio at 2**, pause the render loop when the viewer is offscreen,
  and dispose the model/loader on teardown (see threejs-scene skill).
- **Shadows are expensive.** One shadow-casting light + a contact-shadow plane
  beats every light casting shadows.

## Quick option — `<model-viewer>`

When you just need a robust standalone viewer with AR:

```html
<script type="module"
  src="https://unpkg.com/@google/model-viewer@3.5.0/dist/model-viewer.min.js"></script>

<model-viewer
  src="/models/bag.glb"
  poster="/images/bag-poster.jpg"
  alt="A structured leather handbag"
  camera-controls auto-rotate
  shadow-intensity="1"
  environment-image="neutral"
  exposure="1.0"
  ar ar-modes="webxr scene-viewer quick-look"
  style="width:100%; height:70vh; background:#f5efe8;">
</model-viewer>
```

It handles loading UI, orbit, shadows, env lighting, and AR on iOS/Android out
of the box. Trade-off: less control and it doesn't compose with a custom
Three.js scene. Reach for it for a self-contained product widget; use the
GLTFLoader path when the model is part of a larger 3D experience.

## Deeper references

- `references/lighting-and-materials.md` — HDRI environments with `RGBELoader`,
  contact/ground shadows, and per-material tuning for leather, metal hardware,
  glass, fabric, and car-paint/clearcoat. Read it when the default RoomEnvironment
  look isn't convincing enough or the product needs specific materials.
