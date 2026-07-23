# Three.js patterns

Deeper recipes for scenes that outgrow the baseline in SKILL.md. All assume the
same import-map setup (`three` + `three/addons/`).

## Table of contents
1. Raycasting / object picking
2. Particle systems (points)
3. Instancing many objects
4. Post-processing (bloom / glow)
5. Fresnel rim without writing GLSL
6. Full disposal helper
7. Loading textures correctly

---

## 1. Raycasting / object picking

Use one shared `Raycaster` and a reused `Vector2`; don't allocate per event.

```js
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const pickable = [meshA, meshB]; // or [scene] to test everything

function onClick(e) {
  const r = renderer.domElement.getBoundingClientRect();
  pointer.x = ((e.clientX - r.left) / r.width)  * 2 - 1;
  pointer.y = -((e.clientY - r.top) / r.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObjects(pickable, true)[0];
  if (hit) { /* hit.object, hit.point, hit.distance */ }
}
renderer.domElement.addEventListener('click', onClick);
```

For hover, do the same on `pointermove` and cache the last hovered object so you
only react on change (swap emissive color, scale up, set `cursor:pointer`).

---

## 2. Particle systems (points)

Cheap, GPU-friendly ambience (dust, stars, sparkle). Positions live in a typed
array; one draw call for the whole cloud.

```js
const COUNT = 1500;
const positions = new Float32Array(COUNT * 3);
for (let i = 0; i < COUNT * 3; i++) positions[i] = (Math.random() - 0.5) * 12;

const geo = new THREE.BufferGeometry();
geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

const mat = new THREE.PointsMaterial({
  size: 0.03,
  color: 0xd8c4a0,
  transparent: true,
  opacity: 0.8,
  depthWrite: false,            // stops particles from punching holes in each other
  blending: THREE.AdditiveBlending, // glowy; drop for solid dust
});
scene.add(new THREE.Points(geo, mat));
```

Animate by mutating the array and setting `geo.attributes.position.needsUpdate = true`,
or (cheaper) just slowly rotate the whole `Points` object.

---

## 3. Instancing many objects

For hundreds/thousands of identical meshes (tiles, petals, a field of shapes),
`InstancedMesh` is one draw call instead of N.

```js
const mesh = new THREE.InstancedMesh(geometry, material, N);
const m = new THREE.Matrix4();
for (let i = 0; i < N; i++) {
  m.compose(position_i, quaternion_i, scale_i);
  mesh.setMatrixAt(i, m);
}
mesh.instanceMatrix.needsUpdate = true;
scene.add(mesh);
// Per-instance color: mesh.setColorAt(i, new THREE.Color(...)).
```

---

## 4. Post-processing (bloom / glow)

Makes emissive materials and bright highlights bloom. Costs a few extra passes —
keep `strength` modest so it reads as light, not haze.

```js
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass }    from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(new UnrealBloomPass(
  new THREE.Vector2(innerWidth, innerHeight), 0.6, 0.4, 0.85 // strength, radius, threshold
));
// In the loop use composer.render() instead of renderer.render(),
// and call composer.setSize(w, h) in resize().
```

---

## 5. Fresnel rim without writing GLSL

A glowing edge/rim reads as premium and costs nothing to fake with a second,
back-side, additively-blended shell material — no custom shader needed.

```js
const rim = new THREE.Mesh(geometry.clone(), new THREE.MeshBasicMaterial({
  color: 0xd8c4a0, transparent: true, opacity: 0.35,
  side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false,
}));
rim.scale.multiplyScalar(1.06);   // slightly larger shell peeks out at the edges
mainMesh.add(rim);
```

For a true view-dependent fresnel, use the glsl-shaders skill.

---

## 6. Full disposal helper

Handles nested textures on materials, which the simple traverse in SKILL.md
misses. Call on unmount/route change.

```js
function disposeScene(scene, renderer) {
  scene.traverse(obj => {
    obj.geometry?.dispose();
    const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
    for (const mat of mats) {
      if (!mat) continue;
      for (const v of Object.values(mat)) v?.isTexture && v.dispose();
      mat.dispose();
    }
  });
  renderer.dispose();
  renderer.forceContextLoss?.();
}
```

---

## 7. Loading textures correctly

Color textures (albedo/diffuse) must be tagged SRGB or they render washed out;
data textures (normal, roughness, metalness, AO) must stay linear.

```js
const tex = new THREE.TextureLoader().load('/images/leather.jpg');
tex.colorSpace = THREE.SRGBColorSpace;   // ONLY for color maps
tex.anisotropy = renderer.capabilities.getMaxAnisotropy(); // crisp at grazing angles
// normalMap / roughnessMap / metalnessMap / aoMap: leave colorSpace default (linear).
```
